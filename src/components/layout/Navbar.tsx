import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import { useTheme } from '../../context/ThemeContext';
import { ROUTES } from '../../constants';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { theme, changeTheme, themes } = useTheme();
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            🔧 DevToolBox UI
          </Link>
          
          <div className="navbar-menu">
            <Link 
              to="/" 
              className={`navbar-link ${isActive('/') ? 'active' : ''}`}
            >
              🏠 Home
            </Link>
            <Link 
              to={ROUTES.ABOUT}
              className={`navbar-link ${isActive(ROUTES.ABOUT) ? 'active' : ''}`}
            >
              📖 About
            </Link>
            <Link 
              to={ROUTES.CONTACT}
              className={`navbar-link ${isActive(ROUTES.CONTACT) ? 'active' : ''}`}
            >
              📞 Contact
            </Link>
          </div>
        </div>
        
        <div className="navbar-right">
          <div className="theme-selector">
            <button 
              className="theme-button"
              onClick={() => setShowThemeDropdown(!showThemeDropdown)}
            >
              🎨 Theme
            </button>
            {showThemeDropdown && (
              <div className="theme-dropdown">
                {Object.entries(themes).map(([key, themeData]) => (
                  <button
                    key={key}
                    className={`theme-option ${theme === key ? 'active' : ''}`}
                    onClick={() => {
                      changeTheme(key);
                      setShowThemeDropdown(false);
                    }}
                  >
                    <span className="theme-color" style={{ backgroundColor: themeData.primary }}></span>
                    {themeData.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;