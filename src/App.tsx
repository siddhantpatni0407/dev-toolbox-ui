import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/common/Layout';
import HomePage from './pages/HomePage';
import About from './pages/About';
import Contact from './pages/Contact';
import JwtDecoder from './components/tools/jwt/JwtDecoder';
import PasswordGenerator from './components/tools/password/PasswordGenerator';
import { ROUTES } from './constants';
import './styles/globals.css';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path={ROUTES.ABOUT} element={<About />} />
              <Route path={ROUTES.CONTACT} element={<Contact />} />
              <Route 
                path={ROUTES.JWT_DECODER} 
                element={
                  <ErrorBoundary>
                    <JwtDecoder />
                  </ErrorBoundary>
                } 
              />
              <Route 
                path={ROUTES.PASSWORD_GENERATOR} 
                element={
                  <ErrorBoundary>
                    <PasswordGenerator />
                  </ErrorBoundary>
                } 
              />
              {/* Add more routes for other tools */}
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;