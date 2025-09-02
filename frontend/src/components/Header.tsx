import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>☕ Coffee Shop</h1>
          </Link>
          <nav className="nav">
            <Link to="/products" className="nav-link">商品一覧</Link>
            <Link to="/cart" className="nav-link">カート</Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
