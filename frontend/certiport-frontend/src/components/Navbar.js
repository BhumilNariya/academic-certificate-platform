
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';
import logo from '../assets/logo.png'

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const logout = () => { 
    localStorage.removeItem('token'); 
    localStorage.removeItem('user'); 
    navigate('/'); 
  };
  
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isLandingPage = location.pathname === '/';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`navbar ${isLandingPage ? 'navbar-solid' : 'navbar-solid'}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <img src={logo} alt="CertiPort" className="navbar-logo" />
          <span className="navbar-title">CertiPort</span>
        </Link>

        {/* Desktop Menu */}
        <div className="navbar-menu">
          <div className="navbar-nav">
            <Link to="/verify" className="nav-link">Verify Certificate</Link>
            
            {!user && (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="nav-link nav-link-primary">Register</Link>
              </>
            )}
            
            {user && (
              <>
                {user.role === 'university' && (
                  <Link to="/university" className="nav-link">Dashboard</Link>
                )}
                {user.role === 'student' && (
                  <Link to="/student" className="nav-link">Dashboard</Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="nav-link">Admin Panel</Link>
                )}
                <div className="user-menu">
                  <span className="user-name">Welcome, {user.name || user.email}</span>
                  <button onClick={logout} className="logout-btn">Logout</button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/verify" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
            Verify Certificate
          </Link>
          
          {!user && (
            <>
              <Link to="/login" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="mobile-nav-link mobile-nav-link-primary" onClick={() => setIsMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
          
          {user && (
            <>
              {user.role === 'university' && (
                <Link to="/university" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
              )}
              {user.role === 'student' && (
                <Link to="/student" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  Admin Panel
                </Link>
              )}
              <div className="mobile-user-info">
                <span className="mobile-user-name">{user.name || user.email}</span>
                <button onClick={logout} className="mobile-logout-btn">Logout</button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}