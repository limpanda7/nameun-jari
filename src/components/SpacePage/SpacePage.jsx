import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Star, Calendar, Users, Wifi, Car, Coffee, Home, TreePine, Mountain, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CommonFooter from '../CommonFooter/CommonFooter';
import '../../styles/CommonPage.css';

// Import space images
import space1 from '../../assets/space/1.jpg';
import space2 from '../../assets/space/2.jpg';
import space3 from '../../assets/space/3.jpg';
import space4 from '../../assets/space/4.jpg';
import space5 from '../../assets/space/5.jpg';
import space6 from '../../assets/space/6.jpg';
import space7 from '../../assets/space/7.jpg';
import space8 from '../../assets/space/8.jpg';
import space9 from '../../assets/space/9.jpeg';
import space10 from '../../assets/space/10.jpg';
import space11 from '../../assets/space/11.jpg';

const SpacePage = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImageArray, setCurrentImageArray] = useState(null);
  const [showAllImages, setShowAllImages] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const images = [
    space1,
    space2,
    space3,
    space4,
    space5,
    space6,
    space7,
    space8,
    space9,
    space10,
    space11
  ];

  // OG 이미지 설정
  useEffect(() => {
    // Vite에서 import한 이미지는 빌드 시 절대 경로로 변환되므로, 이미 절대 경로인지 확인
    const ogImageUrl = space1.startsWith('http') ? space1 : new URL(space1, window.location.origin).href;
    
    // OG 이미지 메타 태그 업데이트
    let ogImageMeta = document.querySelector('meta[property="og:image"]');
    if (!ogImageMeta) {
      ogImageMeta = document.createElement('meta');
      ogImageMeta.setAttribute('property', 'og:image');
      document.head.appendChild(ogImageMeta);
    }
    ogImageMeta.setAttribute('content', ogImageUrl);

    // Twitter 이미지 메타 태그 업데이트
    let twitterImageMeta = document.querySelector('meta[property="twitter:image"]');
    if (!twitterImageMeta) {
      twitterImageMeta = document.createElement('meta');
      twitterImageMeta.setAttribute('property', 'twitter:image');
      document.head.appendChild(twitterImageMeta);
    }
    twitterImageMeta.setAttribute('content', ogImageUrl);

    return () => {
      // 컴포넌트 언마운트 시 기본 OG 이미지로 복구
      const defaultOgImage = `${window.location.origin}/og-image.png`;
      if (ogImageMeta) {
        ogImageMeta.setAttribute('content', defaultOgImage);
      }
      if (twitterImageMeta) {
        twitterImageMeta.setAttribute('content', defaultOgImage);
      }
    };
  }, []);

  // 브라우저 테마 색상 설정
  useEffect(() => {
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.content = '#d4a574'; // Space hero 색상 (Forest와 동일)

    return () => {
      // 컴포넌트 언마운트 시 기본 색상으로 복구
      if (themeColorMeta) {
        themeColorMeta.content = '#ffffff';
      }
    };
  }, []);

  // 모바일 감지
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // 화면 크기에 따라 표시할 이미지 수 결정
  const getDisplayImages = () => {
    return images; // 모든 이미지 표시
  };

  const shouldShowMoreButton = () => {
    return false; // 더보기 버튼 숨김
  };

  const features = [
    { icon: <Home size={24} />, title: "다목적 공간", description: "업무, 클래스, 소모임 등 다양한 용도로 활용 가능" },
    { icon: <Users size={24} />, title: "소규모 모임", description: "비즈니스 회의, 공모전 준비, 학습공간에 적합" },
    { icon: <Coffee size={24} />, title: "편의시설", description: "빔프로젝터, 대형테이블, 커피포트 등 완비" },
    { icon: <TreePine size={24} />, title: "운동시설", description: "트레드밀과 필라테스 리포머로 건강 관리" },
    { icon: <Wifi size={24} />, title: "충전시설", description: "8핀, C타입 충전기와 HDMI 연결 가능" },
    { icon: <Car size={24} />, title: "접근성", description: "서울 성북구 정릉로에 위치한 편리한 접근성" }
  ];

  const openModal = (image, index, imageArray) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
    setCurrentImageArray(imageArray);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setCurrentImageArray(null);
  };

  const goToPrevious = () => {
    const currentArray = currentImageArray || images;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? currentArray.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    const currentArray = currentImageArray || images;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === currentArray.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === 'ArrowLeft') {
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  };

  return (
    <div className="forest-page space-page">
      {/* Header */}
      <motion.header
        className="forest-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <button
            className="back-button"
            onClick={() => navigate('/#spaces')}
          >
            <ArrowLeft size={20} />
            돌아가기
          </button>
          <a
            href="https://forest100.herokuapp.com/space?page=calendar"
            target="_blank"
            rel="noopener noreferrer"
            className="header-booking-button"
          >
            📅 예약하기
          </a>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="forest-hero space-hero">
        <div 
          className="space-hero-background"
          style={{ backgroundImage: `url(${space1})` }}
        ></div>
        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="forest-title">온오프 스페이스</h1>
            <p className="forest-subtitle">
              일상을 여행처럼, 여행을 일상처럼 사는 호스트의 공간입니다.<br />
              좋은 공간에서 좋은 생각으로 하고 싶은 것을 해보세요!
            </p>
            <div className="forest-location">
              <MapPin size={20} />
              <span>서울 성북구 정릉로40길 11 1층</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="image-gallery">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="section-title"
          >
            공간 둘러보기
          </motion.h2>
          <div className="gallery-grid">
            {getDisplayImages().map((image, index) => (
              <motion.div
                key={index}
                className="gallery-item"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => openModal(image, index, images)}
                style={{ cursor: 'pointer' }}
              >
                <img src={image} alt={`온오프 스페이스 ${index + 1}`} />
                <div className="gallery-overlay">
                  <span>클릭하여 확대보기</span>
                </div>
              </motion.div>
            ))}
          </div>

          {shouldShowMoreButton() && (
            <motion.div
              className="show-more-container"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <button
                className="show-more-button"
                onClick={() => setShowAllImages(!showAllImages)}
              >
                {showAllImages ? '접기' : `더 보기`}
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="section-title"
          >
            이런 분들께 추천해요
          </motion.h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Space & Amenities Section */}
      <section className="space-amenities-section">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="section-title"
          >
            시설안내
          </motion.h2>
          <div className="space-amenities-grid">
            <motion.div
              className="space-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3>📺 프레젠테이션</h3>
              <ul className="amenity-list">
                <li className="amenity-item">빔프로젝터 & 스크린</li>
                <li className="amenity-item">팀플/프레젠테이션에 OK</li>
                <li className="amenity-item">대형테이블</li>
                <li className="amenity-item">함께 앉아 일 모드 스위치 ON</li>
              </ul>
            </motion.div>

            <motion.div
              className="space-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3>☕ 편의시설</h3>
              <ul className="amenity-list">
                <li className="amenity-item">커피포트</li>
                <li className="amenity-item">준비된 티와 커피를 즐기세요</li>
                <li className="amenity-item">옷걸이 / 신발 선반</li>
                <li className="amenity-item">정돈된 상태로 이용 가능</li>
              </ul>
            </motion.div>

            <motion.div
              className="space-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3>🍽️ 식기류</h3>
              <ul className="amenity-list">
                <li className="amenity-item">접시, 유리잔, 수저, 포크</li>
                <li className="amenity-item">가위, 도마</li>
              </ul>
            </motion.div>

            <motion.div
              className="space-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3>🔌 충전 & 연결</h3>
              <ul className="amenity-list">
                <li className="amenity-item">충전기 (8핀 2개, C타입 2개)</li>
                <li className="amenity-item">HDMI</li>
              </ul>
            </motion.div>

            <motion.div
              className="space-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h3>🚿 기본시설</h3>
              <ul className="amenity-list">
                <li className="amenity-item">화장실/미니싱크대</li>
              </ul>
            </motion.div>

            <motion.div
              className="space-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <h3>🏃‍♀️ 운동시설</h3>
              <ul className="amenity-list">
                <li className="amenity-item">트레드밀(런닝머신)</li>
                <li className="amenity-item">리포머(필라테스 기구)</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Notice Section */}
      <section className="notice-section">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="section-title"
          >
            유의사항
          </motion.h2>
          <div className="notice-content">
            <div className="notice-grid">
              <div className="notice-item">
                <span className="notice-icon">🚫</span>
                <span className="notice-text">파티룸 사용불가 / 적발 시 즉각 퇴실조치</span>
              </div>
              <div className="notice-item">
                <span className="notice-icon">🚗</span>
                <span className="notice-text">주차불가합니다.</span>
              </div>
              <div className="notice-item">
                <span className="notice-icon">🚭</span>
                <span className="notice-text">금연공간입니다.</span>
              </div>
              <div className="notice-item">
                <span className="notice-icon">🚪</span>
                <span className="notice-text">화장실은 외부 통로에 있습니다.</span>
              </div>
              <div className="notice-item">
                <span className="notice-icon">🔧</span>
                <span className="notice-text">사용하신 모든 집기 및 소품은 제자리에 놓아주세요.</span>
              </div>
              <div className="notice-item">
                <span className="notice-icon">💰</span>
                <span className="notice-text">비치된 물품 파손및 분실 시 배상금이 청구될 수 있습니다.</span>
              </div>
              <div className="notice-item">
                <span className="notice-icon">⏰</span>
                <span className="notice-text">퇴실이 늦어질 경우 추가요금이 발생합니다. (5분초과 시 부가)</span>
              </div>
              <div className="notice-item">
                <span className="notice-icon">🌡️</span>
                <span className="notice-text">퇴실 시 냉난방기 및 출입문을 확인해주세요.</span>
              </div>
              <div className="notice-item">
                <span className="notice-icon">📹</span>
                <span className="notice-text">보안 및 안전을 위한 실내 cctv 작동중입니다.</span>
              </div>
              <div className="notice-item">
                <span className="notice-icon">👟</span>
                <span className="notice-text">실내화를 신어주세요.</span>
              </div>
              <div className="notice-item">
                <span className="notice-icon">🔇</span>
                <span className="notice-text">19시 이후 소음에 주의해주세요.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="section-title"
          >
            요금 정보
          </motion.h2>
          <div className="pricing-content">
            <div className="pricing-table-container">
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>구분</th>
                    <th>금액</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>월~목</td>
                    <td>4,000원/시간</td>
                  </tr>
                  <tr>
                    <td>금~일 및 공휴일</td>
                    <td>6,000원/시간</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Additional Charges */}
            <div className="additional-charges">
              <h3>추가 요금</h3>
              <div className="charges-grid">
                <div className="charge-item">
                  <span className="charge-label">2인 초과 시 1인당</span>
                  <span className="charge-price">3,000원/시간</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="booking-section">
        <div className="container">
          <motion.div
            className="booking-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">예약하기</h2>
            <div className="booking-actions">
              <a
                href="https://forest100.herokuapp.com/space?page=calendar"
                target="_blank"
                rel="noopener noreferrer"
                className="booking-button"
              >
                📅 예약하기
              </a>
            </div>
            <div className="booking-note">
              <p>실시간 예약 가능 일정을 확인하고 바로 예약하세요.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="contact-content"
          >
            <h2 className="section-title">문의</h2>
            <div className="contact-note">
              <p>이용 안내 및 문의사항은 언제든 연락주시면 친절히 도와드리겠습니다.</p>
            </div>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-label">카카오톡 ID</span>
                <span className="contact-value">eunbibi1001</span>
              </div>
              <div className="contact-item">
                <span className="contact-label">인스타그램</span>
                <a
                  href="https://www.instagram.com/onoff_space_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  @onoff_space_
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="image-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={closeModal}>
                <X size={32} />
              </button>

              <button className="modal-nav modal-nav-left" onClick={goToPrevious}>
                <ChevronLeft size={32} />
              </button>

              <button className="modal-nav modal-nav-right" onClick={goToNext}>
                <ChevronRight size={32} />
              </button>

              <img
                src={(currentImageArray || images)[currentImageIndex]}
                alt={`온오프 스페이스 ${currentImageIndex + 1}`}
                className="modal-image"
              />

              <div className="modal-info">
                <span className="image-counter">
                  {currentImageIndex + 1} / {(currentImageArray || images).length}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Common Footer */}
      <CommonFooter />
    </div>
  );
};

export default SpacePage;
