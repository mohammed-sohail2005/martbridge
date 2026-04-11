import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Layout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="layout-container">
      <header className="header">
        <div className="header-content container">
          <div className="logo-group" onClick={() => navigate('/')}>
            <img src="/logo.png" alt="MartBridge Logo" className="logo-icon" />
            <div className="logo-text-stack">
              <div className="logo">MartBridge</div>
              <div className="tag">Smart Supply App</div>
            </div>
          </div>

        </div>
      </header>
      
      <main className="container main-content">
        {children}
      </main>

      <footer className="footer container">
        <div className="footer-line"></div>
        <p>© {new Date().getFullYear()} MartBridge • Premium Supply Logistics</p>
      </footer>

      <style jsx="true">{`
        .layout-container {
          min-height: 100vh;
          background: var(--bg-gradient);
          display: flex;
          flex-direction: column;
          color: var(--text-color);
          overflow-x: hidden;
        }

        .header {
          width: 100%;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 1000;
          border-bottom: 1px solid rgba(11, 177, 93, 0.1);
        }

        .header-content {
          height: 80px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-group {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .logo-group:hover {
          transform: scale(1.02);
        }

        .logo-icon {
          width: 45px;
          height: 45px;
          object-fit: contain;
        }

        .logo-text-stack {
          display: flex;
          flex-direction: column;
        }

        .logo {
          font-size: 24px;
          font-weight: 800;
          color: var(--primary-color);
          line-height: 1;
        }

        .tag {
          font-size: 11px;
          color: var(--secondary-color);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 4px;
        }

        .desktop-nav {
          display: flex;
          gap: 30px;
        }

        .desktop-nav a {
          text-decoration: none;
          color: var(--text-color);
          font-size: 14px;
          font-weight: 600;
          transition: 0.3s;
        }

        .desktop-nav a:hover {
          color: var(--primary-color);
        }

        .menu-toggle {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .hamburger {
          width: 24px;
          height: 2px;
          background: var(--primary-color);
          position: relative;
          transition: 0.3s;
        }

        .hamburger::before, .hamburger::after {
          content: '';
          position: absolute;
          width: 24px;
          height: 2px;
          background: var(--primary-color);
          transition: 0.3s;
        }

        .hamburger::before { top: -8px; }
        .hamburger::after { bottom: -8px; }

        .hamburger.open {
          background: transparent;
        }

        .hamburger.open::before {
          top: 0;
          transform: rotate(45deg);
        }

        .hamburger.open::after {
          bottom: 0;
          transform: rotate(-45deg);
        }

        .mobile-nav {
          position: absolute;
          top: 80px;
          left: 0;
          right: 0;
          background: white;
          padding: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .mobile-nav a {
          text-decoration: none;
          color: var(--text-color);
          font-weight: 600;
          font-size: 16px;
          padding: 10px 5px;
        }

        .mobile-nav hr {
          border: none;
          border-top: 1px solid #eee;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 40px;
          padding-bottom: 60px;
        }

        .footer {
          text-align: center;
          padding-bottom: 30px;
        }

        .footer-line {
          width: 100%;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(11, 177, 93, 0.2), transparent);
          margin-bottom: 20px;
        }

        .footer p {
          font-size: 12px;
          color: #4f8f6e;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .header-content { height: 70px; }
          .main-content { padding-top: 25px; }
        }
      `}</style>
    </div>
  );
};

export default Layout;
