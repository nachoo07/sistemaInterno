import { useState, useEffect, useRef, useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import {
  FaUsers, FaMoneyBill, FaExchangeAlt, FaCalendarCheck, FaList,
  FaUserCog, FaCog, FaEnvelope, FaBell, FaBars, FaTimes, FaSearch, FaUserCircle, FaChevronDown, FaEllipsisH, FaClipboardList
} from 'react-icons/fa';
import { LoginContext } from '../../context/login/LoginContext';
import "./homeUser.css"
import AppNavbar from '../navbar/AppNavbar';
import logo from '../../assets/logoyoclaudio.png';
import DesktopNavbar from '../navbar/DesktopNavbar';
import Sidebar from '../sidebar/Sidebar';

const HomeUser = () => {
  const navigate = useNavigate();
  const { auth, logout, userData } = useContext(LoginContext);
  const [isMenuOpen, setIsMenuOpen] = useState(window.innerWidth > 576);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('todos');
  const [activeItem, setActiveItem] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const profileRef = useRef(null);
  const menuItems = [
    { name: 'Asistencia', route: '/attendance', icon: <FaCalendarCheck /> },
  ];

  const handleLogout = async () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Detectar clics fuera del componente para cerrar el menú
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const filteredMenuItems = menuItems.filter(item =>
    (activeCategory === 'todos' || item.category === activeCategory) &&
    (searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className={`app-container ${window.innerWidth <= 576 ? 'mobile-view' : ''}`}>
       {windowWidth <= 576 && (
        <AppNavbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen}/>
      )}
       {windowWidth > 576 && (
        <DesktopNavbar
          logoSrc={logo}
          showSearch={true}
        />
      )}
      <div className="dashboard-layout">
         <Sidebar
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          activeRoute="/homeuser"
        />
        <main className="main-content">
          <div className="content-columns">
            <div className="main-column">
              <section className="dashboard-modules">
                <div className="modules-container">
                  <h2 className="section-title">Módulos del Sistema</h2>
                  <div className="modules-grid">
                    {filteredMenuItems.map((item, index) => (
                      <div
                        key={index}
                        className="module-card"
                        onClick={() => navigate(item.route)}
                      >
                        <div className="module-icon-container">
                          {item.icon}
                        </div>
                        <h3 className="module-title">{item.name}</h3>
                        <span className="module-category-tag">{item.category}</span>
                        <button className="module-menu-btn">
                          <FaEllipsisH />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div >
  );
};

export default HomeUser