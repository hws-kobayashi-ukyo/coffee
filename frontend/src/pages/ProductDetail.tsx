import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { productService, cartService } from '../services/api';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchProduct(parseInt(id));
    }
  }, [id]);

  const fetchProduct = async (productId: number) => {
    try {
      const response = await productService.getById(productId);
      setProduct(response.data);
    } catch (err) {
      setError('商品の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!product) return;
    
    try {
      const sessionId = getSessionId();
      await cartService.addToCart(sessionId, {
        productId: product.id,
        quantity: quantity,
        price: product.price,
        name: product.name
      });
      alert('カートに追加しました');
      navigate('/cart');
    } catch (err) {
      alert('カートへの追加に失敗しました');
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

  if (loading) return <div className="loading">読み込み中...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="error">商品が見つかりません</div>;

  return (
    <div className="container">
      <button onClick={() => navigate(-1)} className="btn btn-secondary">
        ← 戻る
      </button>
      
      <div className="product-detail">
        <div className="product-image-large">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} />
          ) : (
            <div className="no-image">画像なし</div>
          )}
        </div>
        
        <div className="product-info-large">
          <h1>{product.name}</h1>
          <p className="product-description">{product.description}</p>
          <div className="product-price">¥{product.price.toLocaleString()}</div>
          <div className="product-stock">在庫: {product.stock}個</div>
          
          <div className="add-to-cart-section">
            <label htmlFor="quantity">数量:</label>
            <select 
              id="quantity"
              value={quantity} 
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              disabled={product.stock === 0}
            >
              {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            
            <button 
              className="btn btn-primary add-to-cart-btn"
              onClick={addToCart}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? '在庫切れ' : 'カートに追加'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
