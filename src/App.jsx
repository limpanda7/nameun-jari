import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, MapPin, Star, Calendar, Users, ArrowRight } from 'lucide-react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import hostImage from './assets/landing/host.jpeg';
import { analytics } from './firebase';
import './App.css';
import logoImg from './assets/landing/logo.png';
import forestImg from './assets/landing/forest.webp';
import blonImg from './assets/landing/blon.png';
import onoffImg from './assets/landing/onoff.png';
import spaceImg from './assets/landing/space.png';
import eunjinImg from './assets/landing/eunjin.jpeg';
import jebokImg from './assets/landing/jebok.jpeg';
import appleBackgroundImg from './assets/apple/background.jpg';
import AppleOrderPage from './components/AppleOrderPage/AppleOrderPage.jsx';
import ForestPage from './components/ForestPage/ForestPage.jsx';
import BlonPage from './components/BlonPage/BlonPage.jsx';
import OnOffPage from './components/OnOffPage/OnOffPage.jsx';
import SpacePage from './components/SpacePage/SpacePage.jsx';
import CommonFooter from './components/CommonFooter/CommonFooter.jsx';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.9]);
  const headerBackground = useTransform(scrollY, [0, 100], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.95)']);

  // 페이지 이동 시 최상단으로 스크롤 또는 해시 섹션으로 스크롤
  useEffect(() => {
    if (location.hash) {
      // 해시가 있으면 해당 섹션으로 스크롤 (헤더 높이 고려)
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          const header = document.querySelector('.header');
          const headerHeight = header ? header.offsetHeight : 0;
          const elementTop = element.getBoundingClientRect().top + window.scrollY;
          const offsetPosition = elementTop - headerHeight - 20; // 20px 추가 여백

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 100);
      }
    } else {
      // 해시가 없으면 최상단으로 스크롤
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, location.hash]);

  const spaces = [
    {
      id: 1,
      name: "백년한옥별채",
      location: "동해",
      type: "숙소",
      image: forestImg,
      description: "백년의 역사를 품은 전통 한옥의 별채",
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
      description: "동해의 아름다운 풍경과 함께하는 단기 임대",
      url: "https://forest100.herokuapp.com/on-off",
      priceRange: "350,000원/1주"
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
    const header = document.querySelector('.header');
    const headerHeight = header ? header.offsetHeight : 0;
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };


  return (
      <Routes>
        <Route path="/blon" element={<BlonPage />} />
        <Route path="/" element={
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
                <button onClick={() => scrollToSection('spaces')}>공간들</button>
                {/*<button onClick={() => scrollToSection('apple-sales')}>동해사과</button>*/}
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
              role="button"
              tabIndex={0}
              onClick={() => scrollToSection('about')}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') scrollToSection('about'); }}
            >
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: [0, 18, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronDown size={72} />
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
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="spaces-intro"
              >
                <p style={{ fontWeight: 'bold', fontSize: '1.15em', marginBottom: '1.2em' }}>" 당신을 위해 남은 자리 "</p>
                <p>
                  나믄자리는 공간 운영에 특화된 호스트가 직접 관리하는 다양한 공간들의 집합입니다.<br/>
                  각 공간마다 고유한 이야기와 정성이 담겨 있어, 단순한 이용을 넘어선 특별한 경험을 선사합니다.
                </p>
              </motion.div>
              <div className="spaces-grid">
                {spaces.map((space, index) => (
                  <div
                    key={space.id}
                    className="space-card clickable"
                    tabIndex={0}
                    aria-disabled={space.url ? undefined : true}
                    onClick={() => {
                      if (space.id === 1) {
                        navigate('/forest');
                      } else if (space.id === 2) {
                        navigate('/blon');
                      } else if (space.id === 3) {
                        navigate('/on-off');
                      } else if (space.id === 4) {
                        navigate('/space');
                      } else if (space.url) {
                        window.open(space.url, '_blank', 'noopener noreferrer');
                      }
                    }}
                    style={{ cursor: space.url ? 'pointer' : 'default' }}
                  >
                    <div className="space-image">
                      <img src={space.image} alt={space.name} />
                      {space.priceRange === "오픈예정" && (
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

          {/*/!* Apple Sales Section *!/*/}
          {/*<section id="apple-sales" className="apple-sales">*/}
          {/*  <div className="apple-background-image" style={{ backgroundImage: `url(${appleBackgroundImg})` }}></div>*/}
          {/*  <div className="container">*/}
          {/*    <motion.div*/}
          {/*      initial={{ opacity: 0, y: 50 }}*/}
          {/*      whileInView={{ opacity: 1, y: 0 }}*/}
          {/*      transition={{ duration: 0.8 }}*/}
          {/*      viewport={{ once: true }}*/}
          {/*      className="apple-sales-content"*/}
          {/*    >*/}
          {/*      <motion.h2*/}
          {/*        initial={{ opacity: 0, y: 30 }}*/}
          {/*        whileInView={{ opacity: 1, y: 0 }}*/}
          {/*        transition={{ duration: 0.8, delay: 0.2 }}*/}
          {/*        viewport={{ once: true }}*/}
          {/*        className="section-title apple-title"*/}
          {/*      >*/}
          {/*        🍎 백년한옥사과*/}
          {/*      </motion.h2>*/}
          {/*      <motion.p*/}
          {/*        initial={{ opacity: 0, y: 30 }}*/}
          {/*        whileInView={{ opacity: 1, y: 0 }}*/}
          {/*        transition={{ duration: 0.8, delay: 0.4 }}*/}
          {/*        viewport={{ once: true }}*/}
          {/*        className="apple-subtitle"*/}
          {/*      >*/}
          {/*        껍질째 먹는 프리미엄 사과*/}
          {/*      </motion.p>*/}

          {/*      <div className="apple-features">*/}
          {/*        <motion.div*/}
          {/*          initial={{ opacity: 0, y: 30 }}*/}
          {/*          whileInView={{ opacity: 1, y: 0 }}*/}
          {/*          transition={{ duration: 0.8, delay: 0.6 }}*/}
          {/*          viewport={{ once: true }}*/}
          {/*          className="apple-feature"*/}
          {/*        >*/}
          {/*          <div className="apple-feature-icon">🏔️</div>*/}
          {/*          <h3>동해 특산</h3>*/}
          {/*          <p>동해의 맑은 공기와 깨끗한 물로 키워진<br/> 특별한 맛</p>*/}
          {/*        </motion.div>*/}

          {/*        <motion.div*/}
          {/*          initial={{ opacity: 0, y: 30 }}*/}
          {/*          whileInView={{ opacity: 1, y: 0 }}*/}
          {/*          transition={{ duration: 0.8, delay: 0.8 }}*/}
          {/*          viewport={{ once: true }}*/}
          {/*          className="apple-feature"*/}
          {/*        >*/}
          {/*          <div className="apple-feature-icon">📦</div>*/}
          {/*          <h3>직배송</h3>*/}
          {/*          <p>농장에서 직접 수확하여 신선하게 배송</p>*/}
          {/*        </motion.div>*/}

          {/*        <motion.div*/}
          {/*          initial={{ opacity: 0, y: 30 }}*/}
          {/*          whileInView={{ opacity: 1, y: 0 }}*/}
          {/*          transition={{ duration: 0.8, delay: 1.0 }}*/}
          {/*          viewport={{ once: true }}*/}
          {/*          className="apple-feature"*/}
          {/*        >*/}
          {/*          <div className="apple-feature-icon">🛒</div>*/}
          {/*          <h3>지금 주문하세요!</h3>*/}
          {/*          <p>신선한 백년한옥사과를 집에서 만나보세요</p>*/}
          {/*          <button*/}
          {/*            className="apple-order-btn"*/}
          {/*            onClick={() => {*/}
          {/*              navigate('/apple-order');*/}
          {/*              window.scrollTo({ top: 0, behavior: 'smooth' });*/}
          {/*            }}*/}
          {/*          >*/}
          {/*            주문하기 <ArrowRight size={20} />*/}
          {/*          </button>*/}
          {/*        </motion.div>*/}
          {/*      </div>*/}
          {/*    </motion.div>*/}
          {/*  </div>*/}
          {/*</section>*/}

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
                      당신을 위해 남은 자리에서, 특별한 순간을 만들어가세요.
                    </p>
                  </div>
                  <div className="host-signature">
                    <p className="host-name">판다부부</p>
                    <p className="host-title">공간 디렉터</p>
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
                    <img src={eunjinImg} alt="채믄진네" className="together-img" />
                    <div className="together-label">채믄진네</div>
                  </div>
                  <div className="together-person">
                    <img src={jebokImg} alt="제복이네" className="together-img" />
                    <div className="together-label">제복이네</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Common Footer */}
          <CommonFooter />
        </div>
      } />

      <Route path="/apple-order" element={<AppleOrderPage />} />
      <Route path="/forest" element={<ForestPage />} />
      <Route path="/on-off" element={<OnOffPage />} />
      <Route path="/space" element={<SpacePage />} />
    </Routes>
  );
}

export default App;
