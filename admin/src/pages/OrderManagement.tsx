import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { orderService } from '../services/api';

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderService.getAll();
      setOrders(response.data);
    } catch (error) {
      alert('注文の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': '処理中',
      'completed': '完了',
      'cancelled': 'キャンセル',
    };
    
    const statusClass = {
      'pending': 'badge-warning',
      'completed': 'badge-success',
      'cancelled': 'badge-danger',
    }[status] || 'badge-secondary';

    return (
      <span className={`badge ${statusClass}`}>
        {statusMap[status] || status}
      </span>
    );
  };

  if (loading) return <div className="loading">読み込み中...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>注文管理</h1>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>注文ID</th>
              <th>注文日時</th>
              <th>合計金額</th>
              <th>ステータス</th>
              <th>商品詳細</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{formatDate(order.created_at)}</td>
                <td>¥{order.total_amount.toLocaleString()}</td>
                <td>{getStatusBadge(order.status)}</td>
                <td>
                  <div className="order-items">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        {item.product_name} × {item.quantity}
                        <span className="item-price">
                          (¥{(item.price * item.quantity).toLocaleString()})
                        </span>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <div className="empty-state">
          <p>注文がありません</p>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
