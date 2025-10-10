import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Star, Calendar, Users, Wifi, Car, Coffee, Home, TreePine, Mountain, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CommonFooter from '../CommonFooter/CommonFooter';
import '../ForestPage/ForestPage.css';

// Import blon images
import blon1 from '../../assets/blon/1.jpg';
import blon2 from '../../assets/blon/2.jpg';
import blon3 from '../../assets/blon/3.jpg';
import blon4 from '../../assets/blon/4.jpg';
import blon5 from '../../assets/blon/5.jpg';
import blon6 from '../../assets/blon/6.jpg';
import blon7 from '../../assets/blon/7.jpg';
import blon8 from '../../assets/blon/8.jpg';
import blon9 from '../../assets/blon/9.jpg';
import blon10 from '../../assets/blon/10.jpg';
import blon11 from '../../assets/blon/11.jpg';
import blon12 from '../../assets/blon/12.jpg';
import blon13 from '../../assets/blon/13.jpg';
import blon15 from '../../assets/blon/15.jpg';

const BlonPage = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImageArray, setCurrentImageArray] = useState(null);
  const [showAllImages, setShowAllImages] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPeakSeason, setIsPeakSeason] = useState(false);

  const images = [
    blon1,
    blon2,
    blon3,
    blon4,
    blon5,
    blon6,
    blon7,
    blon8,
    blon9,
    blon10,
    blon11,
    blon12,
    blon13,
    blon15
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

  // 성수기 감지 (7월 20일 - 8월 20일)
  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentDay = currentDate.getDate();

    // 7월 20일 - 8월 20일이 성수기
    const isPeak = (currentMonth === 7 && currentDay >= 20) ||
                   (currentMonth === 8 && currentDay <= 20);
    setIsPeakSeason(isPeak);
  }, []);

  // 화면 크기에 따라 표시할 이미지 수 결정
  const getDisplayImages = () => {
    return showAllImages ? images : images.slice(0, 9);
  };

  const shouldShowMoreButton = () => {
    return images.length > 9;
  };

  const features = [
    { icon: <Home size={24} />, title: "독립적인 숙소", description: "완전히 독립된 공간으로 프라이버시 보장" },
    { icon: <TreePine size={24} />, title: "자연 속 휴식", description: "산정호수 근처 자연 속에서의 특별한 경험" },
    { icon: <Mountain size={24} />, title: "넓은 마당", description: "바베큐와 야외 활동이 가능한 넓은 마당" },
    { icon: <Car size={24} />, title: "주차 가능", description: "편리한 주차 시설 제공" },
    { icon: <Coffee size={24} />, title: "바베큐 시설", description: "야외 바베큐 시설 (화로, 토치, 집게, 숯 제공)" },
    { icon: <Users size={24} />, title: "반려견 동반", description: "반려견과 함께하는 여행 (최대 2마리)" }
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
    <div className="forest-page blon-page">
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
            href="https://forest100.herokuapp.com/boulogne?page=calendar"
            target="_blank"
            rel="noopener noreferrer"
            className="header-booking-button"
          >
            📅 예약하기
          </a>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="forest-hero blon-hero">
        <div className="blon-hero-background"></div>
        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="forest-title">블로뉴숲</h1>
            <p className="forest-subtitle">
              산정호수 근처 자연 속에서의 특별한 휴식
            </p>
            <div className="forest-location">
              <MapPin size={20} />
              <span>경기 포천시 영북면 산정호수로322번길 38</span>
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
                <img src={image} alt={`블로뉴숲 ${index + 1}`} />
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
            특별한 경험
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
              <h3>침실 1</h3>
              <ul className="amenity-list">
                <li className="amenity-item">퀸사이즈 침대/침구/에어컨</li>
                <li className="amenity-item">원목화장대</li>
                <li className="amenity-item">리클라이너쇼파</li>
                <li className="amenity-item">행거</li>
              </ul>
            </motion.div>

            <motion.div
              className="space-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3>침실 2</h3>
              <ul className="amenity-list">
                <li className="amenity-item">퀸사이즈 침대/침구</li>
                <li className="amenity-item">거울/드라이기</li>
                <li className="amenity-item">행거</li>
              </ul>
            </motion.div>

            <motion.div
              className="space-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3>주방</h3>
              <ul className="amenity-list">
                <li className="amenity-item">냉장고/가스레인지 3구/전자레인지</li>
                <li className="amenity-item">식기/컵/냄비/프라이팬/수저/가위/칼/집게</li>
                <li className="amenity-item">6인용 아일랜드원목식탁 및 의자</li>
                <li className="amenity-item">에어프라이기/토스트기</li>
              </ul>
            </motion.div>

            <motion.div
              className="space-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3>화장실</h3>
              <ul className="amenity-list">
                <li className="amenity-item">샴푸/린스/바디워시/바디타올/치약/핸드워시</li>
                <li className="amenity-item">수건</li>
              </ul>
            </motion.div>

            <motion.div
              className="space-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h3>거실 & 북스테이</h3>
              <ul className="amenity-list">
                <li className="amenity-item">4인 책상/의자 2</li>
                <li className="amenity-item">400여권의 서적</li>
                <li className="amenity-item">블루투스 오디오/감성라디오</li>
                <li className="amenity-item">통기타</li>
                <li className="amenity-item">루미큐브/스케치북/색연필</li>
                <li className="amenity-item">필사도구</li>
                <li className="amenity-item">WI-FI/4way냉난방기</li>
                <li className="amenity-item">시네마빔/노트북<br/>(*별도의 TV는 비치되어 있지 않습니다.)</li>
              </ul>
            </motion.div>

            <motion.div
              className="space-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <h3>마당 & 테라스</h3>
              <ul className="amenity-list">
                <li className="amenity-item">6인 테이블 및 의자 / 야외조명</li>
                <li className="amenity-item">바베큐존 (바베큐신청시 화로,토치,집게,숯 제공)</li>
                <li className="amenity-item">이용요금 20,000원</li>
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
                    <th>일~목</th>
                    <th>금</th>
                    <th>토</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={isPeakSeason ? "current-season" : ""}>
                    <td>
                      성수기<br/>(7/20-8/20)
                      {isPeakSeason && <span className="current-season-badge">현재 시즌</span>}
                    </td>
                    <td>250,000원</td>
                    <td>300,000원</td>
                    <td>300,000원</td>
                  </tr>
                  <tr className={!isPeakSeason ? "current-season" : ""}>
                    <td>
                      비성수기
                      {!isPeakSeason && <span className="current-season-badge">현재 시즌</span>}
                    </td>
                    <td>160,000원</td>
                    <td>200,000원</td>
                    <td>250,000원</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Additional Charges */}
            <div className="additional-charges">
              <h3>추가 요금</h3>
              <div className="charges-grid">
                <div className="charge-item">
                  <span className="charge-label">4인 초과 시 1인당</span>
                  <span className="charge-price">1박 15,000원</span>
                </div>
                <div className="charge-item">
                  <span className="charge-label">반려견 1마리당</span>
                  <span className="charge-price">1박 30,000원</span>
                </div>
                <div className="charge-item">
                  <span className="charge-label">바베큐 이용요금</span>
                  <span className="charge-price">20,000원</span>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="pricing-info">
              <div className="info-item">
                <span className="info-label">기준인원</span>
                <span className="info-value">4인 (최대 6인 + 반려견 2마리)</span>
              </div>
              <div className="info-item">
                <span className="info-label">체크인/아웃</span>
                <span className="info-value">16:00 / 12:00</span>
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
                href="https://forest100.herokuapp.com/boulogne?page=calendar"
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
                <span className="contact-label">인스타그램</span>
                <a
                  href="https://www.instagram.com/boulogne_forest/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  @boulogne_forest
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
                alt={`블로뉴숲 ${currentImageIndex + 1}`}
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

export default BlonPage;
