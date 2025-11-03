import React from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME, APP_DESCRIPTION, TOOLS } from '../constants';
import Button from '../components/common/Button';
import { ButtonVariant, InputSize, ToolType } from '../enums';
import { Tool } from '../models/common';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome to <span className="hero-brand">{APP_NAME}</span>
            </h1>
            <p className="hero-description">
              {APP_DESCRIPTION}. Streamline your development workflow with our collection of essential tools.
            </p>
          </div>
        </div>
      </section>

      <section id="tools" className="tools-section">
        <div className="container">
          <div className="tools-grid">
            {TOOLS.map((tool: Tool) => (
              <div key={tool.id} className="enhanced-tool-card">
                <div className="card-header">
                  <div className="tool-icon-large">
                    {tool.icon}
                  </div>
                  <div className="tool-category-badge">
                    <span className={`category-tag category-${tool.category}`}>
                      {tool.category.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="card-content">
                  <h3 className="tool-title-enhanced">{tool.name}</h3>
                  <p className="tool-description-enhanced">{tool.description}</p>
                  
                  <div className="tool-features">
                    {tool.id === ToolType.JWT_DECODER && (
                      <ul className="feature-list">
                        <li>Decode JWT tokens instantly</li>
                        <li>Validate token structure</li>
                        <li>Security analysis</li>
                      </ul>
                    )}
                    {tool.id === ToolType.PASSWORD_GENERATOR && (
                      <ul className="feature-list">
                        <li>Customizable length & criteria</li>
                        <li>Strength analysis</li>
                        <li>Secure random generation</li>
                      </ul>
                    )}
                    {tool.id === ToolType.LOCATION_TRACER && (
                      <ul className="feature-list">
                        <li>Reverse geocoding from coordinates</li>
                        <li>Current location detection</li>
                        <li>Google Maps integration</li>
                      </ul>
                    )}
                  </div>
                </div>
                
                <div className="card-actions">
                  <Button 
                    as={Link} 
                    to={tool.path}
                    variant={ButtonVariant.PRIMARY}
                    size={InputSize.LARGE}
                    className="enhanced-tool-button"
                  >
                    Launch Tool →
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;