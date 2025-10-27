import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import './NPSSurvey.css';

const NPSSurvey = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [surveyData, setSurveyData] = useState({
    recommendation: null,
    reason: '',
    personalGrowth: null,
    goodPoints: [],
    improvementPoints: [],
    discoveryPath: '',
    otherDiscoveryPath: '',
    eventParticipation: false,
    name: '',
    phone: ''
  });

  const totalSteps = 6;
  const displaySteps = 4; // 프로그레스 바에 표시할 스텝 수 (이벤트 참여, 감사 페이지 제외)

  // 테마 컬러 변경 (만족도 조사 페이지에서만 보라색으로)
  useEffect(() => {
    // 기존 테마 컬러 저장
    const originalThemeColor = document.querySelector('meta[name="theme-color"]');
    const originalColor = originalThemeColor ? originalThemeColor.getAttribute('content') : '#8B4513';

    // 테마 컬러를 보라색으로 변경
    if (originalThemeColor) {
      originalThemeColor.setAttribute('content', '#667eea');
    } else {
      // 테마 컬러 메타 태그가 없으면 새로 생성
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = '#667eea';
      document.head.appendChild(meta);
    }

    // 컴포넌트 언마운트 시 원래 테마 컬러로 복원
    return () => {
      const currentThemeColor = document.querySelector('meta[name="theme-color"]');
      if (currentThemeColor) {
        currentThemeColor.setAttribute('content', originalColor);
      }
    };
  }, []);

  const handleRecommendationChange = (value) => {
    setSurveyData(prev => ({ ...prev, recommendation: value }));
  };

  const handleReasonChange = (e) => {
    setSurveyData(prev => ({ ...prev, reason: e.target.value }));
  };

  const handlePersonalGrowthChange = (value) => {
    setSurveyData(prev => ({ ...prev, personalGrowth: value }));
  };

  const handleGoodPointToggle = (point) => {
    setSurveyData(prev => ({
      ...prev,
      goodPoints: prev.goodPoints.includes(point)
        ? prev.goodPoints.filter(p => p !== point)
        : prev.goodPoints.length < 3
          ? [...prev.goodPoints, point]
          : prev.goodPoints
    }));
  };

  const handleImprovementPointToggle = (point) => {
    setSurveyData(prev => ({
      ...prev,
      improvementPoints: prev.improvementPoints.includes(point)
        ? prev.improvementPoints.filter(p => p !== point)
        : prev.improvementPoints.length < 3
          ? [...prev.improvementPoints, point]
          : prev.improvementPoints
    }));
  };

  const handleDiscoveryPathChange = (path) => {
    setSurveyData(prev => ({ ...prev, discoveryPath: path }));
  };

  const handleOtherDiscoveryPathChange = (e) => {
    setSurveyData(prev => ({ ...prev, otherDiscoveryPath: e.target.value }));
  };

  const handleEventParticipationChange = (participate) => {
    setSurveyData(prev => ({ ...prev, eventParticipation: participate }));
  };

  const handleNameChange = (e) => {
    setSurveyData(prev => ({ ...prev, name: e.target.value }));
  };

  const handlePhoneChange = (e) => {
    setSurveyData(prev => ({ ...prev, phone: e.target.value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      // 모바일에서 다음 단계로 이동할 때 최상단으로 스크롤
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // 이전 단계로 이동할 때도 최상단으로 스크롤
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return surveyData.recommendation !== null && surveyData.personalGrowth !== null;
      case 2:
        return true; // 선택사항
      case 3:
        return true; // 선택사항
      case 4:
        return surveyData.discoveryPath !== '';
      case 5:
        return true; // 이벤트 참여 페이지 - 선택사항
      case 6:
        return true; // 감사 페이지
      default:
        return false;
    }
  };

  const submitSurvey = async () => {
    setIsSubmitting(true);
    try {
      // Firestore에 설문 데이터 저장
      const surveySubmissionData = {
        // 설문 응답
        recommendation: surveyData.recommendation,
        personalGrowth: surveyData.personalGrowth,
        reason: surveyData.reason,
        goodPoints: surveyData.goodPoints,
        improvementPoints: surveyData.improvementPoints,
        discoveryPath: surveyData.discoveryPath,
        otherDiscoveryPath: surveyData.otherDiscoveryPath,

        // 이벤트 참여 정보
        eventParticipation: surveyData.eventParticipation,
        participantName: surveyData.eventParticipation ? surveyData.name : '',
        participantPhone: surveyData.eventParticipation ? surveyData.phone : '',

        // 메타데이터
        submittedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      // 텔레그램용 설문 데이터 (Firestore 타임스탬프 제외)
      const telegramSurveyData = {
        ...surveySubmissionData,
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'space-surveys'), surveySubmissionData);
      console.log('설문이 성공적으로 저장되었습니다. 문서 ID:', docRef.id);

      // 텔레그램 알림 발송
      try {
        const response = await fetch('/api/telegram-webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ surveyData: telegramSurveyData })
        });

        const result = await response.json();

        if (result.success) {
          console.log('텔레그램 알림 발송 성공:', result.message);
        } else {
          console.error('텔레그램 알림 발송 실패:', result.error);
        }
      } catch (error) {
        console.error('텔레그램 알림 발송 중 오류:', error);
      }

      // 다음 단계(감사 페이지)로 이동
      setCurrentStep(6);
      // 감사 페이지로 이동할 때도 최상단으로 스크롤
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch (error) {
      console.error('설문 저장 중 오류 발생:', error);
      alert('설문 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="survey-step">
      <h2>온오프 스페이스를 지인이나 동료에게 추천할 의향은 어느 정도인가요? (필수)</h2>
      <p className="scale-description">(1 전혀 추천하지 않음 ~ 7 매우 추천함)</p>

      <div className="rating-scale">
        {[1, 2, 3, 4, 5, 6, 7].map(num => (
          <button
            key={num}
            className={`rating-button ${surveyData.recommendation === num ? 'selected' : ''}`}
            onClick={() => handleRecommendationChange(num)}
          >
            {num}
          </button>
        ))}
      </div>

      {surveyData.recommendation !== null && (
        <div className="rating-description">
          {surveyData.recommendation <= 2 && <p>전혀 추천하지 않음</p>}
          {surveyData.recommendation >= 3 && surveyData.recommendation <= 4 && <p>보통</p>}
          {surveyData.recommendation >= 5 && surveyData.recommendation <= 6 && <p>추천함</p>}
          {surveyData.recommendation >= 7 && <p>매우 추천함</p>}
        </div>
      )}

      {/* 2번 질문: 성장 기여도 */}
      <div className="question-section">
        <h2>온오프 스페이스 이용이 고객님의 개인적 성장이나 목표 달성에 얼마나 도움이 되었다고 생각하시나요? (필수)</h2>
        <p className="scale-description">(1 전혀 도움 안됨 ~ 7 매우 도움됨)</p>

        <div className="rating-scale">
          {[1, 2, 3, 4, 5, 6, 7].map(num => (
            <button
              key={num}
              className={`rating-button ${surveyData.personalGrowth === num ? 'selected' : ''}`}
              onClick={() => handlePersonalGrowthChange(num)}
            >
              {num}
            </button>
          ))}
        </div>

        {surveyData.personalGrowth !== null && (
          <div className="rating-description">
            {surveyData.personalGrowth <= 2 && <p>전혀 도움 안됨</p>}
            {surveyData.personalGrowth >= 3 && surveyData.personalGrowth <= 4 && <p>보통</p>}
            {surveyData.personalGrowth >= 5 && surveyData.personalGrowth <= 6 && <p>도움됨</p>}
            {surveyData.personalGrowth >= 7 && <p>매우 도움됨</p>}
          </div>
        )}
      </div>

      {/* 3번 질문: 느낀 점 또는 추천 이유 (통합) */}
      <div className="question-section">
        <h2>이번 이용을 통해 느끼신 점이나 기억에 남는 부분, 또는 추천하시는 이유를 자유롭게 적어주세요. (선택)</h2>

        <textarea
          className="reason-textarea"
          value={surveyData.reason}
          onChange={handleReasonChange}
          rows={4}
        />
      </div>
    </div>
  );


  const renderStep3 = () => {
    const options = [
      '예약 과정', '가격 / 가성비', '위치 / 접근성', '공간 청결',
      '방음 / 소음', '조명 / 분위기', '좌석 / 편안함', '설비 (프로젝터, Wi-Fi 등)',
      '응대 / 친절도', '사진과 실제 일치도', '이용 규정 명확성'
    ];

    return (
      <div className="survey-step">
        <h2>이번 이용에서 특히 만족스러웠던 부분을 골라주세요. (최대 3개)</h2>

        <div className="checkbox-grid">
          {options.map(option => (
            <label key={option} className="checkbox-item">
              <input
                type="checkbox"
                checked={surveyData.goodPoints.includes(option)}
                onChange={() => handleGoodPointToggle(option)}
                disabled={!surveyData.goodPoints.includes(option) && surveyData.goodPoints.length >= 3}
              />
              <span className="checkbox-label">{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderStep4 = () => {
    const options = [
      '예약 과정', '가격 / 가성비', '위치 / 접근성', '공간 청결',
      '방음 / 소음', '조명 / 분위기', '좌석 / 편안함', '설비 (프로젝터, Wi-Fi 등)',
      '응대 / 친절도', '사진과 실제 일치도', '이용 규정 명확성'
    ];

    return (
      <div className="survey-step">
        <h2>다음 중 더 나아졌으면 하는 부분을 골라주세요. (최대 3개)</h2>

        <div className="checkbox-grid">
          {options.map(option => (
            <label key={option} className="checkbox-item">
              <input
                type="checkbox"
                checked={surveyData.improvementPoints.includes(option)}
                onChange={() => handleImprovementPointToggle(option)}
                disabled={!surveyData.improvementPoints.includes(option) && surveyData.improvementPoints.length >= 3}
              />
              <span className="checkbox-label">{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderStep5 = () => {
    const discoveryOptions = [
      '포털 검색 (네이버, 구글 등)',
      '지도 검색 (네이버지도 / 카카오맵 등)',
      '인스타그램',
      '블로그 후기',
      '지인 추천',
      '재방문',
      '기타'
    ];

    return (
      <div className="survey-step">
        <h2>이번 예약은 어디서 보고 하셨나요?</h2>

        <div className="radio-group">
          {discoveryOptions.map(option => (
            <label key={option} className="radio-item">
              <input
                type="radio"
                name="discoveryPath"
                value={option}
                checked={surveyData.discoveryPath === option}
                onChange={(e) => handleDiscoveryPathChange(e.target.value)}
              />
              <span className="radio-label">{option}</span>
            </label>
          ))}
        </div>

        {surveyData.discoveryPath === '기타' && (
          <div className="other-input">
            <input
              type="text"
              placeholder="직접 입력해주세요"
              value={surveyData.otherDiscoveryPath}
              onChange={handleOtherDiscoveryPathChange}
            />
          </div>
        )}
      </div>
    );
  };

  const renderStep6 = () => (
    <div className="survey-step">
      <div className="event-section">
        <h3>🎁 이벤트에 참여하시겠습니까?</h3>
        <p>추첨을 통해 스페이스 이용쿠폰 또는 나믄자리 숙소 1박을 드립니다!</p>

        <div className="participation-buttons">
          <button
            className={`participation-btn ${surveyData.eventParticipation === true ? 'selected' : ''}`}
            onClick={() => handleEventParticipationChange(true)}
          >
            참여합니다
          </button>
          <button
            className={`participation-btn ${surveyData.eventParticipation === false ? 'selected' : ''}`}
            onClick={() => handleEventParticipationChange(false)}
          >
            참여하지 않습니다
          </button>
        </div>

        {surveyData.eventParticipation === true && (
          <div className="contact-form">
            <h4>연락처 정보</h4>
            <div className="form-group">
              <label>이름</label>
              <input
                type="text"
                value={surveyData.name}
                onChange={handleNameChange}
                placeholder="이름을 입력해주세요"
              />
            </div>
            <div className="form-group">
              <label>전화번호</label>
              <input
                type="tel"
                value={surveyData.phone}
                onChange={handlePhoneChange}
                placeholder="전화번호를 입력해주세요"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep7 = () => (
    <div className="survey-step thank-you-page">
      <h1>참여해주셔서 감사합니다 😊</h1>

      <div className="thank-you-content">
        <p className="thank-you-message">
          여러분의 소중한 의견을 통해<br/>
          더 나은 서비스를 제공하겠습니다.
        </p>

        <button
          className="namun-jari-btn"
          onClick={() => window.location.href = '/'}
        >
          나믄자리 홈페이지로 이동
        </button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep3(); // 좋았던 점
      case 3:
        return renderStep4(); // 개선점
      case 4:
        return renderStep5(); // 알게 된 경로
      case 5:
        return renderStep6(); // 이벤트 참여
      case 6:
        return renderStep7(); // 감사 페이지
      default:
        return null;
    }
  };

  return (
    <div className="nps-survey">
      <div className="survey-container">
        <div className="survey-header">
          <h1>온오프 스페이스 만족도 조사</h1>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${currentStep <= displaySteps ? (currentStep / displaySteps) * 100 : 100}%` }}
              />
            </div>
            <p className="progress-text">
              {currentStep <= displaySteps ? `${currentStep} / ${displaySteps}` : ''}
            </p>
        </div>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="survey-content"
        >
          {renderCurrentStep()}
        </motion.div>

        <div className={`survey-navigation ${currentStep === 1 ? 'first-page' : ''} ${currentStep === 5 ? 'submit-page' : ''} ${currentStep === 6 ? 'last-page' : ''}`}>
          {currentStep > 1 && currentStep < 6 && (
            <button className="nav-btn prev-btn" onClick={prevStep}>
              이전
            </button>
          )}

          {currentStep < 5 && (
            <button
              className="nav-btn next-btn"
              onClick={nextStep}
              disabled={!canProceed()}
            >
              다음
            </button>
          )}

          {currentStep === 5 && (
            <button
              className='nav-btn next-btn'
              onClick={submitSurvey}
              disabled={isSubmitting || (surveyData.eventParticipation === true && (!surveyData.name || !surveyData.phone))}
            >
              설문 완료
            </button>
          )}
        </div>
      </div>

      {/* 로딩 오버레이 */}
      {isSubmitting && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <div className="loading-text">설문을 제출하고 있습니다</div>
            <div className="loading-subtext">
              잠시만 기다려주세요...<br/>
              설문 데이터를 저장하고 있습니다.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NPSSurvey;
