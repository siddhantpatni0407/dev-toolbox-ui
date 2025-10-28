import React, { useState } from 'react';
import Button from '../components/common/Button';
import { ButtonVariant, InputSize } from '../enums';
import './Contact.css';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would send this data to a server
    alert('Thank you for your message! This is a demo form.');
    console.log('Form data:', formData);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="contact-page">
      <div className="container">
        <div className="contact-hero">
          <h1 className="contact-title">Get in Touch</h1>
          <p className="contact-subtitle">
            Have questions, suggestions, or feedback? We'd love to hear from you!
          </p>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <div className="info-section">
              <div className="info-icon">💬</div>
              <h3>Let's Connect</h3>
              <p>
                Whether you have a bug report, feature request, or just want to say hello,
                feel free to reach out. Your feedback helps make DevToolBox UI better!
              </p>
            </div>

            <div className="contact-methods">
              <div className="contact-method">
                <div className="method-icon">📧</div>
                <div className="method-content">
                  <h4>Email</h4>
                  <p>siddhantpatni@example.com</p>
                </div>
              </div>

              <div className="contact-method">
                <div className="method-icon">💼</div>
                <div className="method-content">
                  <h4>LinkedIn</h4>
                  <p>Connect with me on LinkedIn</p>
                </div>
              </div>

              <div className="contact-method">
                <div className="method-icon">🐙</div>
                <div className="method-content">
                  <h4>GitHub</h4>
                  <p>Check out the source code and contribute</p>
                </div>
              </div>
            </div>

            <div className="info-section">
              <div className="info-icon">🚀</div>
              <h3>Feature Requests</h3>
              <p>
                Have an idea for a new developer tool? I'm always looking for ways to
                expand DevToolBox UI with useful utilities that developers need.
              </p>
            </div>

            <div className="info-section">
              <div className="info-icon">🐛</div>
              <h3>Bug Reports</h3>
              <p>
                Found a bug or experiencing issues? Please report them so I can fix
                them quickly and improve the experience for everyone.
              </p>
            </div>
          </div>

          <div className="contact-form-container">
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-header">
                <h2>Send a Message</h2>
                <p>Fill out the form below and I'll get back to you as soon as possible.</p>
              </div>

              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="What is this about?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  placeholder="Tell me more about your question, suggestion, or feedback..."
                />
              </div>

              <div className="form-actions">
                <Button
                  type="submit"
                  variant={ButtonVariant.PRIMARY}
                  size={InputSize.LARGE}
                  className="submit-button"
                >
                  Send Message 📤
                </Button>
              </div>

              <div className="form-note">
                <p>
                  <strong>Note:</strong> This is a demonstration form. In a real application,
                  this would send your message to the developer.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;