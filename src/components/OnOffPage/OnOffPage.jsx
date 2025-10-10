import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Star, Calendar, Users, Wifi, Car, Coffee, Home, TreePine, Mountain, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CommonFooter from '../CommonFooter/CommonFooter';
import '../ForestPage/ForestPage.css';

// Import on-off images
import onoff1 from '../../assets/on-off/1.jpg';
import onoff2 from '../../assets/on-off/2.jpg';
import onoff3 from '../../assets/on-off/3.jpg';
import onoff4 from '../../assets/on-off/4.jpg';
import onoff5 from '../../assets/on-off/5.jpg';
import onoff6 from '../../assets/on-off/6.jpg';
import onoff7 from '../../assets/on-off/7.jpg';
import onoff8 from '../../assets/on-off/8.jpg';
import onoff9 from '../../assets/on-off/9.jpg';
import onoff10 from '../../assets/on-off/10.jpg';
import onoff11 from '../../assets/on-off/11.jpg';
import onoff12 from '../../assets/on-off/12.jpg';
import onoff13 from '../../assets/on-off/13.jpg';
import onoff14 from '../../assets/on-off/14.jpg';
import onoff15 from '../../assets/on-off/15.jpg';
import onoff16 from '../../assets/on-off/16.jpg';
import onoff17 from '../../assets/on-off/17.jpg';
import reviewImg from '../../assets/on-off/review.jpg';

const OnOffPage = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImageArray, setCurrentImageArray] = useState(null);
  const [showAllImages, setShowAllImages] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const images = [
    onoff1,
    onoff2,
    onoff3,
    onoff4,
    onoff5,
    onoff6,
    onoff7,
    onoff8,
    onoff9,
    onoff10,
    onoff11,
    onoff12,
    onoff13,
    onoff14,
    onoff15,
    onoff16,
    onoff17
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

  // 화면 크기에 따라 표시할 이미지 수 결정
  const getDisplayImages = () => {
    return showAllImages ? images : images.slice(0, 9);
  };

  const shouldShowMoreButton = () => {
    return images.length > 9;
  };


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
    <div className="forest-page onoff-page">
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
            href="https://forest100.herokuapp.com/on-off?page=calendar"
            target="_blank"
            rel="noopener noreferrer"
            className="header-booking-button"
          >
            📅 예약하기
          </a>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="forest-hero onoff-hero">
        <div className="onoff-hero-background"></div>
        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="forest-title">온오프스테이</h1>
            <p className="forest-subtitle">
              동해의 아름다운 풍경과 함께하는 단기 임대
            </p>
            <div className="forest-location">
              <MapPin size={20} />
              <span>강원도 동해시 무릉1길 9-2</span>
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
                <img src={image} alt={`온오프스테이 ${index + 1}`} />
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

      {/* Review Section */}
      <section className="review-section">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="section-title"
          >
            이용후기
          </motion.h2>
          <motion.div
            className="review-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            onClick={() => openModal(reviewImg, 0, [reviewImg])}
            style={{ cursor: 'pointer' }}
          >
            <img src={reviewImg} alt="온오프스테이 이용후기" />
            <div className="gallery-overlay">
              <span>클릭하여 확대보기</span>
            </div>
          </motion.div>
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
            공간 구성 & 어메니티
          </motion.h2>
          <div className="space-amenities-grid">
            <motion.div
              className="space-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3>🏠 Rooms</h3>
              <ul className="amenity-list">
                <li className="amenity-item">4개의 방</li>
                <li className="amenity-item">2개의 주방</li>
                <li className="amenity-item">거실</li>
                <li className="amenity-item">내부화장실 및 외부화장실</li>
                <li className="amenity-item">마당</li>
                <li className="amenity-item">매트리스(퀸) 2개 비치</li>
              </ul>
            </motion.div>

            <motion.div
              className="space-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3>🍳 Kitchen</h3>
              <ul className="amenity-list">
                <li className="amenity-item">냉장고/인덕션 2구/전자레인지</li>
                <li className="amenity-item">식기/컵/냄비/프라이팬/수저/가위/칼/집게</li>
                <li className="amenity-item">전기포트</li>
              </ul>
            </motion.div>

            <motion.div
              className="space-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3>🛋️ Living Room</h3>
              <ul className="amenity-list">
                <li className="amenity-item">통유리창문</li>
                <li className="amenity-item">WI-FI/에어컨/4인식탁/2인 바테이블</li>
                <li className="amenity-item">브리츠 스피커/시네마빔<br/>(*별도의 TV는 비치되어 있지 않습니다.)</li>
              </ul>
            </motion.div>

            <motion.div
              className="space-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3>🌿 Garden & Rooftop</h3>
              <ul className="amenity-list">
                <li className="amenity-item">4인 테이블 및 의자 / 야외조명</li>
                <li className="amenity-item">외부 화장실(온수X)</li>
              </ul>
            </motion.div>
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
                  <td>임대료</td>
                  <td>350,000원 / 1주</td>
                </tr>
                <tr>
                  <td>관리비</td>
                  <td>50,000원 / 1주</td>
                </tr>
                <tr>
                  <td>청소비</td>
                  <td>60,000원</td>
                </tr>
                <tr>
                  <td>보증금</td>
                  <td>330,000원</td>
                </tr>
                </tbody>
              </table>
            </div>

            {/* Additional Info */}
            <div className="additional-info">
              <div className="info-header">
                <h3>이용 안내</h3>
              </div>
              <div className="info-cards">
                <div className="info-card">
                  <div className="info-card-icon">⏰</div>
                  <div className="info-card-content">
                    <p>최소 1주 이상부터 계약 가능</p>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-card-icon">🏠</div>
                  <div className="info-card-content">
                    <p>숙소 비품은 제공되지 않습니다<br/>(침구, 수건, 화장지, 바베큐 용품 등)</p>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-card-icon">🐕</div>
                  <div className="info-card-content">
                    <p>반려동물 가능하며, 모든 시설 원상복구 조건입니다</p>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-card-icon">⚡</div>
                  <div className="info-card-content">
                    <p>기름보일러를 과도하게 사용하는 경우,<br/>추가 관리비를 청구할 수 있습니다</p>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-card-icon">🚗</div>
                  <div className="info-card-content">
                    <p>무릉복지회관 측면 공용주차장 이용 가능</p>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-card-icon">🔌</div>
                  <div className="info-card-content">
                    <p>숙소 앞에 DC콤보 전기차 충전소 위치</p>
                  </div>
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
                href="https://forest100.herokuapp.com/on-off?page=calendar"
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
                <span className="contact-value">skfk1600</span>
              </div>
              <div className="contact-item">
                <span className="contact-label">인스타그램</span>
                <a
                  href="https://www.instagram.com/on.offstay/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  @on.offstay
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
                alt={`온오프스테이 ${currentImageIndex + 1}`}
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

export default OnOffPage;
