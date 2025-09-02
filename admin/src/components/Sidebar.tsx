import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>☕ Coffee Admin</h2>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/" className="nav-item">
          📊 ダッシュボード
        </NavLink>
        <NavLink to="/products" className="nav-item">
          🛍️ 商品管理
        </NavLink>
        <NavLink to="/orders" className="nav-item">
          📦 注文管理
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
