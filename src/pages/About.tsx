import React from 'react';
import './About.css';

const About: React.FC = () => {
  return (
    <div className="about-page">
      <div className="container">
        <div className="about-hero">
          <h1 className="about-title">About DevToolBox UI</h1>
          <p className="about-subtitle">
            Your comprehensive toolkit for modern web development
          </p>
        </div>

        <div className="about-content">
          <div className="about-section">
            <div className="section-icon">🎯</div>
            <h2 className="section-title">Our Mission</h2>
            <p className="section-description">
              DevToolBox UI is designed to streamline your development workflow by providing 
              essential tools that every developer needs. We believe in creating simple, 
              efficient, and secure utilities that help you focus on what matters most - building great software.
            </p>
          </div>

          <div className="about-section">
            <div className="section-icon">🔧</div>
            <h2 className="section-title">What We Offer</h2>
            <div className="features-grid">
              <div className="feature-item">
                <h3>JWT Token Decoder</h3>
                <p>Decode, validate, and analyze JSON Web Tokens with comprehensive security checks and detailed token information.</p>
              </div>
              <div className="feature-item">
                <h3>Password Generator</h3>
                <p>Generate secure, customizable passwords with strength analysis and various configuration options.</p>
              </div>
              <div className="feature-item">
                <h3>More Tools Coming</h3>
                <p>We're constantly adding new developer utilities based on community feedback and industry needs.</p>
              </div>
            </div>
          </div>

          <div className="about-section">
            <div className="section-icon">🔒</div>
            <h2 className="section-title">Privacy & Security</h2>
            <p className="section-description">
              All processing happens entirely in your browser. Your data never leaves your device, 
              ensuring complete privacy and security. No data is stored on our servers, and no 
              analytics or tracking is performed on your input data.
            </p>
          </div>

          <div className="about-section">
            <div className="section-icon">⚡</div>
            <h2 className="section-title">Performance</h2>
            <p className="section-description">
              Built with modern React and TypeScript, DevToolBox UI is optimized for speed and 
              efficiency. The application works offline and provides instant results without 
              any server dependencies.
            </p>
          </div>

          <div className="about-section">
            <div className="section-icon">🌟</div>
            <h2 className="section-title">Open Source</h2>
            <p className="section-description">
              DevToolBox UI is built with love for the developer community. We believe in 
              transparency, continuous improvement, and sharing knowledge to help developers 
              worldwide be more productive.
            </p>
          </div>
        </div>

        <div className="about-footer">
          <div className="developer-info">
            <h3>Created by Siddhant Patni</h3>
            <p>
              Passionate full-stack developer with expertise in modern web technologies. 
              Committed to building tools that make developers' lives easier and more productive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;