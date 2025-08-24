import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, MapPin, Truck, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import appleBackgroundImg from '../../assets/apple/background.jpg';
import appleLogo from '../../assets/apple/logo-white.png';
import './AppleOrderPage.css';

function AppleOrderPage() {
  const [formData, setFormData] = useState({
    // 받는 사람 정보
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    // 입금하는 사람 정보
    payerName: '',
    payerPhone: '',
    // 주문 정보
    variety: '',
    quantity: '1',
    message: '',
    // 받는 사람과 동일 여부
    sameAsRecipient: false
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSameAsRecipient = (e) => {
    const { checked } = e.target;
    setFormData(prev => ({
      ...prev,
      sameAsRecipient: checked,
      payerName: checked ? prev.recipientName : '',
      payerPhone: checked ? prev.recipientPhone : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Firestore에 주문 정보 저장
      const orderData = {
        // 받는 사람 정보
        recipientName: formData.recipientName,
        recipientPhone: formData.recipientPhone,
        recipientAddress: formData.recipientAddress,

        // 입금하는 사람 정보
        payerName: formData.sameAsRecipient ? formData.recipientName : formData.payerName,
        payerPhone: formData.sameAsRecipient ? formData.recipientPhone : formData.payerPhone,

        // 주문 정보
        variety: formData.variety,
        quantity: parseInt(formData.quantity),
        message: formData.message,

        // 메타데이터
        sameAsRecipient: formData.sameAsRecipient,
        orderDate: serverTimestamp(),
        status: 'pending', // pending, confirmed, shipped, delivered
        totalPrice: parseInt(formData.quantity) * 100000, // 1박스당 10만원
        createdAt: serverTimestamp()
      };

      // 텔레그램용 주문 데이터 (Firestore 타임스탬프 제외)
      const telegramOrderData = {
        ...orderData,
        orderDate: new Date().toISOString(), // 현재 시간을 ISO 문자열로
        createdAt: new Date().toISOString()
      };
      };

      const docRef = await addDoc(collection(db, 'apple-orders'), orderData);
      console.log('주문이 성공적으로 저장되었습니다. 문서 ID:', docRef.id);

      // 텔레그램 알림 발송 (환경에 따라 다른 API URL 사용)
      try {
        // 환경에 따라 API URL 결정
        const isVercel = window.location.hostname.includes('vercel.app');
        const apiUrl = isVercel
          ? '/api/telegram-webhook'
          : 'https://nameun-jari.vercel.app/api/telegram-webhook';

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderData: telegramOrderData })
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

      setIsSubmitted(true);
    } catch (error) {
      console.error('주문 저장 중 오류 발생:', error);
      setSubmitError('주문 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    navigate('/');
  };

  if (isSubmitted) {
    return (
      <div className="apple-order-page">
        <div className="success-message">
          <CheckCircle size={80} color="#4CAF50" />
          <h2>주문이 완료되었습니다!</h2>
          <p>확인 후 연락 드리겠습니다.</p>
          <button onClick={goBack} className="back-btn">
            <ArrowLeft size={20} /> 메인으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="apple-order-page">
      {/* Background Image */}
      <div className="order-background-image" style={{ backgroundImage: `url(${appleBackgroundImg})` }}></div>

      {/* Header Section */}
      <header className="order-header">
        <div className="order-header-content">
          <button onClick={goBack} className="order-header-back-btn">
            <ArrowLeft size={20} /> 메인으로
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="order-hero">
        <img
          src={appleLogo}
          alt="백년한옥사과 로고"
          className="hero-logo-full"
        />
      </section>

      <div className="order-container">
        {/* Apple Introduction Section */}
        <section className="apple-intro">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="intro-content"
          >
            <div className="limited-sale-info">
              <div className="price-info">
                <span className="discount-badge">특가 할인</span>
                <span className="original-price">정상가: 120,000원</span>
                <span className="special-price">8월 특가: 100,000원</span>
              </div>
              <p className="limited-notice">⚠️ 한정판매 - 수량이 제한되어 있습니다</p>
            </div>

            <h2>껍질째 먹는 프리미엄 사과</h2>
            <p className="intro-description">
              백년한옥별채에 방문하신 게스트분들께만 제공할 수 있었던 사과를 더 많은 분들께 제공하고자 합니다.
              동해의 맑은 바람과 깨끗한 자연 속에서 자란 백년한옥사과는
              아삭한 식감, 깊은 단맛, 건강한 재배 방식으로 특별함을 더합니다.
            </p>

            <div className="apple-varieties">
              <div className="variety-item current">
                <h3>🍎 홍로</h3>
                <div className="season-info">
                  <span className="season-badge">9월 상순~하순</span>
                  <span className="status-badge available">현재 주문 가능</span>
                </div>
                <p className="variety-description">
                  홍로는 가을에만 잠깐 맛볼 수 있는 계절 한정의 매력이 있습니다.
                  추석 즈음에 맞춰 나와 '추석사과'라는 별명으로도 불리며, 선명한 붉은색과 달콤한 맛이 특징입니다.
                  껍질이 얇고 식감이 부드러워 바로 먹기에도 부담이 없습니다.
                </p>
              </div>

              <div className="variety-item">
                <h3>🍎 부사</h3>
                <div className="season-info">
                  <span className="season-badge">10월 하순~11월 중순</span>
                  <span className="status-badge coming-soon">출하 예정</span>
                </div>
                <p className="variety-description">
                  부사는 한국에서 가장 널리 알려진 대표 품종입니다.
                  저장성이 뛰어나 겨울철 내내 즐길 수 있으며, 당도가 높으면서도 은은한 산미가 어우러져
                  달콤하면서도 새콤한 균형 잡힌 맛을 자랑합니다. 과즙이 풍부하고 식감이 아삭아삭해
                  많은 사람들이 즐겨 찾는 사과입니다.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Order Form Section */}
        <section className="order-form-section">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-form-container"
          >
            <h2>주문 양식</h2>
            <p className="form-description">
              아래 양식을 작성해 주시면 빠른 시일 내에 연락드리겠습니다.
            </p>

            <form onSubmit={handleSubmit} className="order-form">
              {/* 입금 계좌 정보 */}
              <div className="account-info">
                <h3>💳 입금 계좌 정보</h3>
                <div className="account-details">
                  <p><strong>카카오뱅크</strong> 79420205681</p>
                  <p><strong>예금주:</strong> 남은비</p>
                </div>
              </div>

              {/* 받는 사람 정보 */}
              <div className="recipient-section">
                <h3>📦 받는 사람 정보</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="recipientName">받는 사람 이름 *</label>
                    <input
                      type="text"
                      id="recipientName"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleInputChange}
                      required
                      placeholder="받는 사람 이름을 입력해주세요"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="recipientPhone">받는 사람 연락처 *</label>
                    <input
                      type="tel"
                      id="recipientPhone"
                      name="recipientPhone"
                      value={formData.recipientPhone}
                      onChange={handleInputChange}
                      required
                      placeholder="010-0000-0000"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="recipientAddress">배송 주소 *</label>
                  <textarea
                    id="recipientAddress"
                    name="recipientAddress"
                    value={formData.recipientAddress}
                    onChange={handleInputChange}
                    required
                    placeholder="상세한 배송 주소를 입력해주세요"
                    rows="3"
                  />
                </div>
              </div>

              {/* 입금하는 사람 정보 */}
              <div className="payer-section">
                <h3>💰 입금하는 사람 정보</h3>

                <div className="same-as-recipient">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="sameAsRecipient"
                      checked={formData.sameAsRecipient}
                      onChange={handleSameAsRecipient}
                    />
                    <span className="checkmark"></span>
                    받는 사람과 동일
                  </label>
                </div>

                <div className={`payer-fields ${formData.sameAsRecipient ? 'disabled' : ''}`}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="payerName">입금자 이름 *</label>
                      <input
                        type="text"
                        id="payerName"
                        name="payerName"
                        value={formData.payerName}
                        onChange={handleInputChange}
                        required={!formData.sameAsRecipient}
                        disabled={formData.sameAsRecipient}
                        placeholder="입금자 이름을 입력해주세요"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="payerPhone">입금자 연락처 *</label>
                      <input
                        type="tel"
                        id="payerPhone"
                        name="payerPhone"
                        value={formData.payerPhone}
                        onChange={handleInputChange}
                        required={!formData.sameAsRecipient}
                        disabled={formData.sameAsRecipient}
                        placeholder="010-0000-0000"
                      />
                    </div>
                  </div>


                </div>
              </div>

              {/* 주문 정보 */}
              <div className="order-details-section">
                <h3>🍎 주문 정보</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="variety">사과 품종 *</label>
                    <select
                      id="variety"
                      name="variety"
                      value={formData.variety}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">품종을 선택해주세요</option>
                      <option value="홍로">🍎 홍로 (현재 주문 가능)</option>
                      <option value="부사">🍎 부사 (출하 예정)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="quantity">수량</label>
                    <select
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                    >
                      <option value="1">1박스</option>
                      <option value="2">2박스</option>
                      <option value="3">3박스</option>
                      <option value="4">4박스</option>
                      <option value="5">5박스</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">요청사항</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="특별한 요청사항이 있으시면 입력해주세요"
                    rows="3"
                  />
                </div>
              </div>

              {submitError && (
                <div className="error-message">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? '주문 처리 중...' : '주문 완료하기'}
              </button>
            </form>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

export default AppleOrderPage;
