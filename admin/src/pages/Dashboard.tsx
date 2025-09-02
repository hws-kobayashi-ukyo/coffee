import React, { useState, useEffect } from 'react';
import { productService, orderService } from '../services/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsResponse, ordersResponse] = await Promise.all([
        productService.getAll(),
        orderService.getAll(),
      ]);

      const products = productsResponse.data;
      const orders = ordersResponse.data;

      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
      });
    } catch (error) {
      console.error('統計データの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">読み込み中...</div>;

  return (
    <div className="container">
      <h1>ダッシュボード</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🛍️</div>
          <div className="stat-content">
            <h3>商品数</h3>
            <div className="stat-number">{stats.totalProducts}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>注文数</h3>
            <div className="stat-number">{stats.totalOrders}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>総売上</h3>
            <div className="stat-number">¥{stats.totalRevenue.toLocaleString()}</div>
          </div>
        </div>
      </div>
      
      <div className="quick-actions">
        <h2>クイックアクション</h2>
        <div className="action-buttons">
          <a href="/products" className="btn btn-primary">商品管理</a>
          <a href="/orders" className="btn btn-success">注文管理</a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
