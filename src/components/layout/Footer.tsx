import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <p className="footer-copyright">
            © {currentYear} All rights reserved.
          </p>
          <p className="footer-developer">
            Developed by - <strong>Siddhant Patni</strong>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;