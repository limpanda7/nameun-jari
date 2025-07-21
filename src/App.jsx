import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, MapPin, Star, Calendar, Users, ArrowRight } from 'lucide-react';
import hostImage from './assets/host.jpeg';
import { analytics } from './firebase';
import './App.css';
import logoImg from './assets/logo.png';
import forestImg from './assets/forest.webp';
import blonImg from './assets/blon.png';
import onoffImg from './assets/onoff.png';
import spaceImg from './assets/space.png';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.9]);
  const headerBackground = useTransform(scrollY, [0, 100], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.95)']);

  const spaces = [
    {
      id: 1,
      name: "백년한옥별채",
      location: "동해",
      type: "숙소",
      image: forestImg,
      description: "백년의 역사를 품은 전통 한옥에서의 특별한 시간",
      url: "https://forest100.herokuapp.com/forest",
      priceRange: "200,000원 ~ 300,000원"
    },
    {
      id: 2,
      name: "블로뉴숲",
      location: "포천",
      type: "숙소",
      image: blonImg,
      description: "깊은 숲속에서 누리는 평화로운 휴식",
      url: "https://forest100.herokuapp.com/boulogne",
      priceRange: "160,000원 ~ 300,000원"
    },
    {
      id: 3,
      name: "온오프스테이",
      location: "동해",
      type: "단기임대",
      image: onoffImg,
      description: "동해의 아름다운 풍경과 함께하는 단기 체류",
      url: "https://forest100.herokuapp.com/on-off",
      priceRange: "350,000원/1주 (임대료)"
    },
    {
      id: 4,
      name: "온오프스페이스",
      location: "서울",
      type: "공간대여",
      image: spaceImg,
      description: "서울 중심에서 누리는 편리한 공간 대여",
      url: "https://forest100.herokuapp.com/on-off-space",
      priceRange: "4,000원 ~ 6,000원/시간"
    },
    {
      id: 5,
      name: "묵호쉴래",
      location: "동해",
      type: "숙소",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      description: "동해 묵호의 아름다움을 담은 새로운 공간",
      url: null,
      priceRange: "오픈예정"
    }
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="app">
      {/* Header */}
      <motion.header
        className="header"
        style={{ opacity: headerOpacity, backgroundColor: headerBackground }}
      >
        <div className="header-content">
          <motion.div
            className="logo"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            나믄자리
          </motion.div>

          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <button onClick={() => scrollToSection('about')}>소개</button>
            <button onClick={() => scrollToSection('spaces')}>공간</button>
            <button onClick={() => scrollToSection('host-message')}>호스트</button>
          </nav>

          <button
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <motion.img
            src={logoImg}
            alt="나믄자리 로고"
            className="hero-logo"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
          />
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="hero-subtitle"
          >
            <span className="hero-subtitle-mobile">
              남아있는 것에서<br className="mobile-br" />
              가치있는 것으로 바뀌는 순간
            </span>
            <span className="hero-subtitle-pc">
              남아있는 것에서 가치있는 것으로 바뀌는 순간
            </span>
          </motion.p>
        </div>
        <div
          className="scroll-indicator"
          style={{ left: '50%', transform: 'translateX(-50%)', position: 'absolute', bottom: '2rem' }}
        >
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [0, 18, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={48} />
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="about-content"
          >
            <h2>나믄자리에 대하여</h2>
            <p>
              나믄자리는 공간운영에 특화된 호스트가
              직접 관리하는 다양한 공간들의 집합입니다.
              전통 한옥부터 숲속 휴식공간, 단기임대, 공간대여까지
              각각의 공간마다 고유한 이야기와 정성이 담겨있어
              단순한 이용을 넘어선 특별한 경험을 제공합니다.
            </p>
            <div className="features">
              <div className="feature">
                <MapPin size={32} />
                <h3>다양한 공간</h3>
                <p>숙소, 단기임대, 공간대여까지</p>
              </div>
              <div className="feature">
                <Star size={32} />
                <h3>직접 관리</h3>
                <p>공간운영 전문가의 정성</p>
              </div>
              <div className="feature">
                <Calendar size={32} />
                <h3>특별한 경험</h3>
                <p>단순한 이용을 넘어선 가치</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Spaces Section */}
      <section id="spaces" className="spaces">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="section-title"
          >
            나믄자리 공간들
          </motion.h2>
          <div className="spaces-grid">
            {spaces.map((space, index) => (
              <div
                key={space.id}
                className="space-card clickable"
                tabIndex={0}
                aria-disabled={space.url ? undefined : true}
                onClick={() => {
                  if (space.url) {
                    window.open(space.url, '_blank', 'noopener noreferrer');
                  }
                }}
                style={{ cursor: space.url ? 'pointer' : 'default' }}
              >
                <div className="space-image">
                  <img src={space.image} alt={space.name} />
                  {space.type.includes("오픈예정") && (
                    <div className="coming-soon-badge">오픈예정</div>
                  )}
                </div>
                <div className="space-info">
                  <h3>{space.name}</h3>
                  <p className="location">
                    <MapPin size={16} />
                    {space.location}
                  </p>
                  <p className="space-type">{space.type}</p>
                  <p className="description">{space.description}</p>
                  <div className="space-meta">
                    <div className="price">{space.priceRange}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Host Message Section */}
      <section id="host-message" className="host-message">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="host-message-content"
          >
            <div className="host-message-text">
              <h2>호스트 인삿말</h2>
              <div className="message-quote">
                <p className="quote-text">
                  저희는 기존의 공간을 새로운 가치로 재해석하여
                  여러분에게 특별한 경험을 선물합니다.
                  단순한 숙박이나 이용을 넘어서,
                  각 공간에서 휴식하거나 생산적인 활동을 하면서
                  그 공간만의 고유한 가치를 발견할 수 있도록 돕고 싶습니다.
                </p>
                <p className="quote-text">
                  백년 한옥에서의 평화로운 휴식, 숲속에서의 창작 활동,
                  도시 한가운데서의 집중된 작업 시간까지.
                  각 공간마다 고유한 이야기와 정성이 담겨있어
                  여러분이 그 공간의 진정한 가치를 찾아낼 수 있도록 합니다.
                  나믄자리에서 공간과 함께 성장하는 특별한 순간을 만들어가세요.
                </p>
              </div>
              <div className="host-signature">
                <p className="host-name">나믄자리 호스트</p>
                <p className="host-title">공간 운영 전문가</p>
              </div>
            </div>
            <div className="host-message-image">
              <img src={hostImage} alt="나믄자리 호스트" className="host-image" />
            </div>
          </motion.div>
          {/* 함께하는 사람들 섹션을 container 안, host-message-content 바깥에 위치 */}
          <div className="together-section">
            <h3 className="together-title">함께하는 사람들</h3>
            <div className="together-images">
              <div className="together-person">
                <img src={blonImg} alt="은진이네" className="together-img" />
                <div className="together-label">은진이네</div>
              </div>
              <div className="together-person">
                <img src={onoffImg} alt="제복이네" className="together-img" />
                <div className="together-label">제복이네</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>나믄자리</h3>
              <p>감성적인 공간들이 모여 만드는 특별한 여행 경험</p>
            </div>
            <div className="footer-section">
              <h4>바로가기</h4>
              <ul>
                <li><button onClick={() => scrollToSection('about')}>소개</button></li>
                <li><button onClick={() => scrollToSection('spaces')}>공간</button></li>
                <li><button onClick={() => scrollToSection('host-message')}>호스트</button></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>연락처</h4>
              <p>📞 010-6533-7496</p>
              <p>📧 limpanda7@naver.com</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
