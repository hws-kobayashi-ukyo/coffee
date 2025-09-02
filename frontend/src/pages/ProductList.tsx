import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { productService, cartService } from '../services/api';
import './ProductList.css';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll();
      setProducts(response.data);
    } catch (err) {
      setError('商品の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product) => {
    try {
      const sessionId = getSessionId();
      await cartService.addToCart(sessionId, {
        productId: product.id,
        quantity: 1,
        price: product.price,
        name: product.name
      });
      alert('カートに追加しました');
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

  return (
    <div className="container">
      <h2>商品一覧</h2>
      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} />
              ) : (
                <div className="no-image">画像なし</div>
              )}
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-price">¥{product.price.toLocaleString()}</div>
              <div className="product-stock">在庫: {product.stock}</div>
              <div className="product-actions">
                <Link to={`/products/${product.id}`} className="btn btn-secondary">
                  詳細を見る
                </Link>
                <button 
                  className="btn btn-primary"
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? '在庫切れ' : 'カートに追加'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
