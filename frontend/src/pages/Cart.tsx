import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CartItem } from '../types';
import { cartService } from '../services/api';

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  const updateQuantity = async (productId: number, quantity: number) => {
    try {
      const sessionId = getSessionId();
      const response = await cartService.updateCart(sessionId, productId, quantity);
      setCartItems(response.data);
    } catch (err) {
      alert('数量の更新に失敗しました');
    }
  };

  const removeFromCart = async (productId: number) => {
    try {
      const sessionId = getSessionId();
      const response = await cartService.removeFromCart(sessionId, productId);
      setCartItems(response.data);
    } catch (err) {
      alert('商品の削除に失敗しました');
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

  return (
    <div className="container">
      <h2>ショッピングカート</h2>
      
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>カートは空です</p>
          <Link to="/products" className="btn btn-primary">
            商品を見る
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.productId} className="cart-item">
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <div className="cart-item-price">
                    ¥{item.price.toLocaleString()} × {item.quantity}
                  </div>
                </div>
                
                <div className="cart-item-controls">
                  <select
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
                  >
                    {Array.from({ length: 10 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                  
                  <button 
                    className="btn btn-danger"
                    onClick={() => removeFromCart(item.productId)}
                  >
                    削除
                  </button>
                </div>
                
                <div className="cart-item-total">
                  ¥{(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <div className="total-amount">
              合計: ¥{getTotalAmount().toLocaleString()}
            </div>
            
            <div className="cart-actions">
              <Link to="/products" className="btn btn-secondary">
                買い物を続ける
              </Link>
              <Link to="/checkout" className="btn btn-primary">
                注文手続きへ
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
