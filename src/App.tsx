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
import { LocationTracer, LocationComparator } from './components/tools/location';
import { MarkdownViewer, HTMLViewer } from './components/tools/viewer';
import { TextComparator } from './components/tools/text';
import { TimeConverter } from './components/tools/time';
import TimezoneConverter from './components/tools/timezone/timezone-converter/TimezoneConverter';
import WorldClock from './components/tools/time/world-clock/WorldClock';
import { Base64Tool } from './components/tools/base64/Base64Tool';
import { CodeFormatter } from './components/tools/formatter/CodeFormatter';
import { ROUTES } from './routes';
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
              <Route 
                path={ROUTES.LOCATION_TRACER} 
                element={
                  <ErrorBoundary>
                    <LocationTracer />
                  </ErrorBoundary>
                } 
              />
              <Route 
                path={ROUTES.LOCATION_COMPARATOR} 
                element={
                  <ErrorBoundary>
                    <LocationComparator />
                  </ErrorBoundary>
                } 
              />
              <Route 
                path={ROUTES.BASE64_ENCODER} 
                element={
                  <ErrorBoundary>
                    <Base64Tool />
                  </ErrorBoundary>
                } 
              />
              <Route 
                path={ROUTES.MARKDOWN_VIEWER} 
                element={
                  <ErrorBoundary>
                    <MarkdownViewer />
                  </ErrorBoundary>
                } 
              />
              <Route 
                path={ROUTES.HTML_VIEWER} 
                element={
                  <ErrorBoundary>
                    <HTMLViewer />
                  </ErrorBoundary>
                } 
              />
              <Route 
                path={ROUTES.CODE_FORMATTER} 
                element={
                  <ErrorBoundary>
                    <CodeFormatter />
                  </ErrorBoundary>
                } 
              />
              <Route 
                path={ROUTES.TEXT_COMPARATOR} 
                element={
                  <ErrorBoundary>
                    <TextComparator />
                  </ErrorBoundary>
                } 
              />
              <Route 
                path={ROUTES.TIME_CONVERTER} 
                element={
                  <ErrorBoundary>
                    <TimeConverter />
                  </ErrorBoundary>
                } 
              />
              <Route 
                path={ROUTES.TIMEZONE_CONVERTER} 
                element={
                  <ErrorBoundary>
                    <TimezoneConverter />
                  </ErrorBoundary>
                } 
              />
              <Route 
                path={ROUTES.WORLD_CLOCK} 
                element={
                  <ErrorBoundary>
                    <WorldClock />
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