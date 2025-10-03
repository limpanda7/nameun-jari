import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Star, Calendar, Users, Wifi, Car, Coffee, Home, TreePine, Mountain, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CommonFooter from '../CommonFooter/CommonFooter';
import './ForestPage.css';

// Import forest images
import forest1 from '../../assets/forest/1.webp';
import forest2 from '../../assets/forest/2.jpg';
import forest3 from '../../assets/forest/3.jpg';
import forest4 from '../../assets/forest/4.jpg';
import forest5 from '../../assets/forest/5.jpg';
import forest6 from '../../assets/forest/6.jpg';
import forest7 from '../../assets/forest/7.jpg';
import forest11 from '../../assets/forest/11.jpg';
import forest12 from '../../assets/forest/12.webp';

// Import 소녀시대 방문 사진들
import ss2 from '../../assets/forest/ss2.png';
import ss3 from '../../assets/forest/ss3.png';
import ss6 from '../../assets/forest/ss6.png';
import ss7 from '../../assets/forest/ss7.png';
import ss8 from '../../assets/forest/ss8.png';
import ss10 from '../../assets/forest/ss10.png';

const ForestPage = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImageArray, setCurrentImageArray] = useState(null);
  const [showAllGirlsGeneration, setShowAllGirlsGeneration] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPeakSeason, setIsPeakSeason] = useState(false);

  const images = [
    forest1,
    forest2,
    forest3,
    forest4,
    forest5,
    forest6,
    forest7,
    forest11,
    forest12
  ];

  const girlsGenerationImages = [
    ss2,
    ss3,
    ss6,
    ss7,
    ss10,
    ss8
  ];

  // 모바일 감지
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // 성수기 감지 (7-8월)
  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    setIsPeakSeason(currentMonth === 7 || currentMonth === 8);
  }, []);

  // 화면 크기에 따라 표시할 이미지 수 결정
  const getDisplayImages = () => {
    if (isMobile) {
      return showAllGirlsGeneration ? girlsGenerationImages : girlsGenerationImages.slice(0, 3);
    }
    return girlsGenerationImages; // PC에서는 모든 이미지 표시
  };

  const shouldShowMoreButton = () => {
    if (isMobile) {
      return girlsGenerationImages.length > 3;
    }
    return false; // PC에서는 더보기 버튼 숨김
  };

  const features = [
    { icon: <Home size={24} />, title: "100년 한옥", description: "100년 된 전통 한옥의 별채에서 특별한 경험" },
    { icon: <TreePine size={24} />, title: "피톤치드 산책로", description: "주변에 피톤치드 가득한 산책로와 다양한 꽃과 나무" },
    { icon: <Mountain size={24} />, title: "텃밭 체험", description: "텃밭에서 나는 채소들을 직접 재배하여 요리 가능" },
    { icon: <Car size={24} />, title: "넓은 마당", description: "차량 3대 이상 주차 가능한 넓은 마당" },
    { icon: <Coffee size={24} />, title: "바베큐 시설", description: "야외 바베큐 시설 (화로, 토치, 숯, 집게 제공)" },
    { icon: <Users size={24} />, title: "반려견 동반", description: "털날림이 적은 견종만 가능 (최대 2마리)" }
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
    <div className="forest-page">
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
            href="https://forest100.herokuapp.com/forest?page=calendar"
            target="_blank"
            rel="noopener noreferrer"
            className="header-booking-button"
          >
            📅 예약하기
          </a>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="forest-hero">
        <div className="forest-hero-background"></div>
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="forest-title"
          >
            백년한옥별채
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="forest-subtitle"
          >
            100년 된 한옥의 별채에서<br />
            피톤치드 가득한 자연 속 휴식을 경험해보세요
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="forest-location"
          >
            <MapPin size={20} />
            <span>강원도 동해시 구미실길 96-1</span>
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
            {images.map((image, index) => (
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
                <img src={image} alt={`백년한옥별채 ${index + 1}`} />
                <div className="gallery-overlay">
                  <span>클릭하여 확대보기</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 소녀시대 방문 사진 섹션 */}
      <section className="girls-generation-section">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="section-title"
          >
            소녀시대 방문 사진
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="section-subtitle"
          >
            '소시탐탐' 촬영을 위해 소녀시대가 백년한옥별채를 방문했습니다
          </motion.p>
          <div className="gallery-grid">
            {getDisplayImages().map((image, index) => (
              <motion.div
                key={index}
                className="gallery-item"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => openModal(image, index, girlsGenerationImages)}
                style={{ cursor: 'pointer' }}
              >
                <img src={image} alt={`소녀시대 방문 사진 ${index + 1}`} />
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
                onClick={() => setShowAllGirlsGeneration(!showAllGirlsGeneration)}
              >
                {showAllGirlsGeneration ? '접기' : `더 보기`}
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
            특별한 경험
          </motion.h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
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
            공간 & 어메니티
          </motion.h2>

          <div className="space-amenities-grid">
            <motion.div
              className="space-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3>🍳 Kitchen & Living Room</h3>
              <div className="amenity-list">
                <span className="amenity-item">냉장고/인덕션/전자레인지</span>
                <span className="amenity-item">에어프라이기/토스트기/에어컨</span>
                <span className="amenity-item">4인테이블/식기/컵/냄비/프라이팬</span>
                <span className="amenity-item">수저/가위/칼/집게/와인잔/와인오프너</span>
                <span className="amenity-item">전기포트/드립백</span>
              </div>
            </motion.div>

            <motion.div
              className="space-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3>🛏️ Bedroom 1</h3>
              <div className="amenity-list">
                <span className="amenity-item">퀸사이즈 침대/침구</span>
                <span className="amenity-item">테이블/의자</span>
                <span className="amenity-item">TV/에어컨</span>
              </div>
            </motion.div>

            <motion.div
              className="space-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h3>🛏️ Bedroom 2</h3>
              <div className="amenity-list">
                <span className="amenity-item">더블사이즈 침대/침구</span>
                <span className="amenity-item">화장대/의자</span>
                <span className="amenity-item">미니책장/서적</span>
                <span className="amenity-item">헤어드라이기/빗/고데기</span>
              </div>
            </motion.div>

            <motion.div
              className="space-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3>🏠 Bathroom</h3>
              <div className="amenity-list">
                <span className="amenity-item">샴푸/컨디셔너/바디워시</span>
                <span className="amenity-item">칫솔/치약/핸드워시</span>
                <span className="amenity-item">종량제봉투/수건/비데</span>
              </div>
            </motion.div>

            <motion.div
              className="space-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <h3>🌿 Veranda</h3>
              <div className="amenity-list">
                <span className="amenity-item">4인 의자</span>
                <span className="amenity-item">전신거울 2개</span>
                <span className="amenity-item">식물/포토존</span>
              </div>
            </motion.div>

            <motion.div
              className="space-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <h3>🔥 Terrace</h3>
              <div className="amenity-list">
                <span className="amenity-item">6인 테이블/방석</span>
                <span className="amenity-item">야외조명</span>
                <span className="amenity-item">바베큐 (신청 시 화로,토치,숯,집게 제공)</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="pricing-content"
          >
            <h2 className="section-title">요금 정보</h2>

            {/* Main Pricing Table */}
            <div className="pricing-table-container">
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>구분</th>
                    <th>평일</th>
                    <th>주말, 공휴일</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={isPeakSeason ? "current-season" : ""}>
                    <td>
                      성수기(7-8월)
                      {isPeakSeason && <span className="current-season-badge">현재 시즌</span>}
                    </td>
                    <td>300,000원</td>
                    <td>300,000원</td>
                  </tr>
                  <tr className={!isPeakSeason ? "current-season" : ""}>
                    <td>
                      비성수기
                      {!isPeakSeason && <span className="current-season-badge">현재 시즌</span>}
                    </td>
                    <td>200,000원</td>
                    <td>300,000원</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Additional Charges */}
            <div className="additional-charges">
              <h3>추가 요금</h3>
              <div className="charges-grid four-items">
                <div className="charge-item">
                  <span className="charge-label">2인 초과 시</span>
                  <span className="charge-price">1인당 20,000원/박</span>
                  <span className="charge-note">(추가침구 제공)</span>
                </div>
                <div className="charge-item">
                  <span className="charge-label">반려견</span>
                  <span className="charge-price">1마리당 30,000원/박</span>
                  <span className="charge-note">(털날림이 적은 견종만)</span>
                </div>
                <div className="charge-item">
                  <span className="charge-label">바베큐 이용</span>
                  <span className="charge-price">30,000원</span>
                  <span className="charge-note">(화로, 토치, 숯, 집게 제공)</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Basic Info */}
          <div className="pricing-info">
            <div className="info-item">
              <span className="info-label">기준인원</span>
              <span className="info-value">2인 (최대 6인 + 반려견 2마리)</span>
            </div>
            <div className="info-item">
              <span className="info-label">체크인/아웃</span>
              <span className="info-value">15:00 / 11:00</span>
            </div>
            <div className="info-item">
              <span className="info-label">주차</span>
              <span className="info-value">무료 (차량 3대 이상 가능)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="booking-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="booking-content"
          >
            <h2 className="section-title">예약하기</h2>
            <div className="booking-actions">
              <a
                href="https://forest100.herokuapp.com/forest?page=calendar"
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
            <h2 className="section-title">연락처</h2>
            <div className="contact-note">
              <p>이용 안내 및 문의사항은 언제든 연락주시면 친절히 도와드리겠습니다.</p>
            </div>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-label">카카오톡</span>
                <span className="contact-value">eunbibi1001</span>
              </div>
              <div className="contact-item">
                <span className="contact-label">인스타그램</span>
                <a
                  href="https://www.instagram.com/hanok.100/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  @hanok.100
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
                alt={`백년한옥별채 ${currentImageIndex + 1}`}
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

export default ForestPage;
