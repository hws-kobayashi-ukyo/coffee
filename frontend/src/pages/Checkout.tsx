import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem, OrderItem } from '../types';
import { cartService, orderService } from '../services/api';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const sessionId = getSessionId();
      const response = await cartService.getCart(sessionId);
      setCartItems(response.data);
    } catch (err) {
      console.error('カートの取得に失敗しました', err);
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async () => {
    if (cartItems.length === 0) return;
    
    setPlacing(true);
    try {
      const orderItems: OrderItem[] = cartItems.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price
      }));

      const response = await orderService.createOrder(orderItems);
      
      // カートをクリア
      const sessionId = getSessionId();
      await cartService.clearCart(sessionId);
      
      alert(`注文が完了しました！注文番号: ${response.data.order_id}`);
      navigate('/products');
      
    } catch (err) {
      alert('注文の処理に失敗しました');
    } finally {
      setPlacing(false);
    }
  };

  const getSessionId = () => {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'session_' + Date.now();
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (loading) return <div className="loading">読み込み中...</div>;

  if (cartItems.length === 0) {
    return (
      <div className="container">
        <h2>注文手続き</h2>
        <div className="empty-cart">
          <p>カートに商品がありません</p>
          <button onClick={() => navigate('/products')} className="btn btn-primary">
            商品を見る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>注文手続き</h2>
      
      <div className="checkout-content">
        <div className="order-summary">
          <h3>注文内容</h3>
          {cartItems.map(item => (
            <div key={item.productId} className="checkout-item">
              <span className="item-name">{item.name}</span>
              <span className="item-quantity">× {item.quantity}</span>
              <span className="item-price">¥{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          
          <div className="checkout-total">
            <strong>合計: ¥{getTotalAmount().toLocaleString()}</strong>
          </div>
        </div>
        
        <div className="checkout-actions">
          <button 
            onClick={() => navigate('/cart')} 
            className="btn btn-secondary"
            disabled={placing}
          >
            カートに戻る
          </button>
          
          <button 
            onClick={placeOrder} 
            className="btn btn-primary"
            disabled={placing}
          >
            {placing ? '注文処理中...' : '注文を確定する'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
