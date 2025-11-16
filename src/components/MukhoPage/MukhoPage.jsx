import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Home, Wifi, Car, Coffee, Users, Bed, Bath, UtensilsCrossed, Dog, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CommonFooter from '../CommonFooter/CommonFooter';
import '../../styles/CommonPage.css';

// Import mukho images
import mukho1 from '../../assets/mukho/1.jpg';
import mukho2 from '../../assets/mukho/2.jpg';
import mukho3 from '../../assets/mukho/3.jpg';
import mukho4 from '../../assets/mukho/4.jpg';
import mukho5 from '../../assets/mukho/5.jpg';
import mukho6 from '../../assets/mukho/6.jpg';
import mukho7 from '../../assets/mukho/7.jpg';
import mukho8 from '../../assets/mukho/8.jpg';
import mukho9 from '../../assets/mukho/9.jpg';
import mukho10 from '../../assets/mukho/10.jpg';
import mukho11 from '../../assets/mukho/11.jpg';
import mukho12 from '../../assets/mukho/12.jpg';
import mukho13 from '../../assets/mukho/13.jpg';
import mukho14 from '../../assets/mukho/14.jpg';
import mukho15 from '../../assets/mukho/15.jpg';
import mukho16 from '../../assets/mukho/16.jpg';
import mukho17 from '../../assets/mukho/17.jpg';
import mukho18 from '../../assets/mukho/18.jpg';

const MukhoPage = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImageArray, setCurrentImageArray] = useState(null);
  const [showAllImages, setShowAllImages] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const images = [
    mukho1,
    mukho2,
    mukho3,
    mukho4,
    mukho5,
    mukho6,
    mukho7,
    mukho8,
    mukho9,
    mukho10,
    mukho11,
    mukho12,
    mukho13,
    mukho14,
    mukho15,
    mukho16,
    mukho17,
    mukho18
  ];

  // 브라우저 테마 색상 설정
  useEffect(() => {
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.content = '#2B5DA4'; // Mukho 테마 색상

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
    if (isMobile) {
      return showAllImages ? images : images.slice(0, 6);
    }
    return showAllImages ? images : images.slice(0, 6); // PC에서도 처음에는 6개만
  };

  const shouldShowMoreButton = () => {
    return images.length > 6;
  };

  const features = [
    { icon: <Home size={24} />, title: "단독주택 중 2층" },
    { icon: <Bed size={24} />, title: "방 2개" },
    { icon: <Bath size={24} />, title: "화장실 2개" },
    { icon: <UtensilsCrossed size={24} />, title: "주방 1개" },
    { icon: <Car size={24} />, title: "무료주차 2대" },
    { icon: <Dog size={24} />, title: "반려동물 가능" }
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
    <div className="forest-page mukho-page">
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
          <div style={{ fontSize: '0.9rem', color: '#666', padding: '0.5rem 1rem' }}>
            가오픈 준비중
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="forest-hero" style={{ background: 'linear-gradient(135deg, #2B5DA4 0%, #1a4a7a 100%)' }}>
        <div
          className="forest-hero-background"
          style={{ backgroundImage: `url(${mukho1})` }}
        ></div>
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="forest-title"
          >
            묵호쉴래
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="forest-subtitle"
          >
            모던하고 깔끔한 인테리어로 준비되는<br />
            묵호의 새로운 공간
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="forest-location"
          >
            <MapPin size={20} />
            <span>강원특별자치도 동해시 발한동 354-76 명영한어린이집 2층</span>
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
            {getDisplayImages().map((image, index) => {
              const originalIndex = images.indexOf(image);
              return (
                <motion.div
                  key={originalIndex}
                  className="gallery-item"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  onClick={() => openModal(image, originalIndex, images)}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={image} alt={`묵호쉴래 ${originalIndex + 1}`} />
                  <div className="gallery-overlay">
                    <span>클릭하여 확대보기</span>
                  </div>
                </motion.div>
              );
            })}
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
                {showAllImages ? '접기' : '더 보기'}
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
            공간 기본 정보
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
            옵션 정보
          </motion.h2>

          <div className="space-amenities-grid">
            <motion.div
              className="space-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3>기본 옵션</h3>
              <div className="amenity-list">
                <span className="amenity-item">냉장고</span>
                <span className="amenity-item">세탁기</span>
                <span className="amenity-item">에어컨</span>
                <span className="amenity-item">싱크대</span>
                <span className="amenity-item">침대</span>
                <span className="amenity-item">TV</span>
                <span className="amenity-item">와이파이</span>
              </div>
            </motion.div>

            <motion.div
              className="space-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3>그 밖의 옵션</h3>
              <div className="amenity-list">
                <span className="amenity-item">냉난방기</span>
                <span className="amenity-item">인덕션</span>
                <span className="amenity-item">전자레인지</span>
                <span className="amenity-item">전기포트</span>
                <span className="amenity-item">도어락</span>
                <span className="amenity-item">식탁</span>
                <span className="amenity-item">식기 (그릇, 수저)</span>
                <span className="amenity-item">조리도구 (팬, 냄비)</span>
                <span className="amenity-item">옷장</span>
                <span className="amenity-item">커튼</span>
                <span className="amenity-item">드라이어</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="features-section">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="section-title"
          >
            교통 & 위치
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
              maxWidth: '800px',
              margin: '0 auto',
              textAlign: 'center'
            }}
          >
            <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: '1rem', fontWeight: '600' }}>
              강원특별자치도 동해시 발한동 354-76 명영한어린이집 2층
            </p>
            <p style={{ fontSize: '1rem', color: '#666', lineHeight: '1.8', marginBottom: '1rem' }}>
              묵호역(KTX)에서 도보 20분, 택시(자차) 3분거리에 위치하고 있는 단독주택입니다.
            </p>
            <p style={{ fontSize: '1rem', color: '#666', lineHeight: '1.8' }}>
              근처 마트와 음식점등이 있어 편리하며 관광지로 이동하기 좋습니다(논골담길, 도째비골)
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="space-amenities-section">
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
                  <td>200,000원 / 1주</td>
                </tr>
                <tr>
                  <td>관리비</td>
                  <td>70,000원 / 1주</td>
                </tr>
                <tr>
                  <td>청소비</td>
                  <td>70,000원</td>
                </tr>
                <tr>
                  <td>보증금</td>
                  <td>330,000원</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Guide Section */}
      <section className="features-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center' }}
          >
            <h2 className="section-title">이용 안내</h2>
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.8',
              color: '#666',
              textAlign: 'left'
            }}>
              <p style={{ marginBottom: '1rem' }}>
                - 체크인 / 체크아웃: 유동적으로 가능합니다.(비대면)
              </p>
              <p style={{ marginBottom: '1rem' }}>
                - 모든 집기 및 물품은 파손시 배상금이 청구됩니다.
              </p>
              <p>
                - 필요한 물품이 있으실 경우 메세지 남겨주세요
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="space-amenities-section">
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
                alt={`묵호쉴래 ${currentImageIndex + 1}`}
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

export default MukhoPage;

