import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';
import logo from '../assets/logo.png'

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className='container'>
            <div className="hero-text">
            <h1 className="hero-title">
              Blockchain-Powered <span className="highlight">Certificate Verification</span>
            </h1>
            <p className="hero-subtitle">
              Secure, tamper-proof, and instantly verifiable academic certificates. 
              Eliminate fraud with blockchain technology and give students complete control over their credentials.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary">Get Started</Link>
              <Link to="/login" className="btn btn-secondary">Login</Link>
            </div>
          </div>
          </div>
          <div className="hero-image">
            <div className="certificate-mockup">
              <div className="certificate">
                <div className="certificate-header">
                  <div className="university-logo"></div>
                  <h3>Digital Certificate</h3>
                </div>
                <div className="certificate-body">
                  <div className="student-name">Xyz..</div>
                  <div className="degree">Bachelor of Science</div>
                  <div className="blockchain-id">ID: 0x1a2b3c4d...</div>
                </div>
                <div className="qr-code"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title1">Why Choose Our Platform?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Fraud-Proof Security</h3>
              <p>Certificates stored on blockchain cannot be tampered with or faked. Complete authenticity guaranteed.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Verification</h3>
              <p>Employers and institutions can verify certificates in seconds using blockchain ID or QR code.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Decentralized Storage</h3>
              <p>Certificates stored on IPFS ensure accessibility even if traditional servers go down.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Universal Access</h3>
              <p>Students can access their certificates anywhere, anytime, from any device with internet.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title1">How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number1">1</div>
              <div className="step-content">
                <h3>University Issues Certificate</h3>
                <p>Universities upload student data and generate blockchain-verified certificates with unique IDs.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number1">2</div>
              <div className="step-content">
                <h3>Blockchain Storage</h3>
                <p>Certificate data is recorded on blockchain and stored on IPFS for permanent, tamper-proof storage.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number1">3</div>
              <div className="step-content">
                <h3>Instant Verification</h3>
                <p>Anyone can verify certificate authenticity using the blockchain ID</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="target-audience">
        <div className="container">
          <h2 className="section-title1">Built For Everyone</h2>
          <div className="audience-grid">
            <div className="audience-card">
              <div className="audience-icon">🏛️</div>
              <h3>Universities</h3>
              <ul>
                <li>Bulk certificate issuance</li>
                <li>Multiple certificate templates</li>
                <li>Excel upload support</li>
                <li>Automated PDF generation</li>
              </ul>
              <Link to="/register" className="audience-cta">Register University</Link>
            </div>
            <div className="audience-card">
              <div className="audience-icon">🎓</div>
              <h3>Students</h3>
              <ul>
                <li>Access all certificates in one place</li>
                <li>Download blockchain-verified PDFs</li>
                <li>Share certificates securely</li>
                <li>No risk of document loss</li>
              </ul>
              <Link to="/login" className="audience-cta">Student Login</Link>
            </div>
            <div className="audience-card">
              <div className="audience-icon">💼</div>
              <h3>Employers</h3>
              <ul>
                <li>Instant certificate verification</li>
                <li>No need to contact universities</li>
                <li>100% authenticity guarantee</li>
                <li>Reduce hiring fraud</li>
              </ul>
              <Link to="/verify" className="audience-cta">Verify Certificate</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Secure Your Certificates?</h2>
            <p>Join thousands of universities and students already using blockchain-verified certificates.</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-large">Get Started Now</Link>
              <Link to="/verify" className="btn btn-outline btn-large">Verify a Certificate</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <img src={logo} alt="CertiPort" className="footer-logo" />
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/verify">Verify Certificate</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>For Universities</h4>
              <ul>
                <li><Link to="/register">Register Institution</Link></li>
                <li><a href="#bulk-upload">Bulk Certificate Upload</a></li>
                <li><a href="#templates">Certificate Templates</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>For Student</h4>
              <ul>
                <li><a href="#help">View Certificate</a></li>
                <li><a href="#contact">Download Certificate</a></li>
                <li><a href="#api">Verify certificate</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 CertiPort. All rights reserved. | Powered by Blockchain Technology</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;