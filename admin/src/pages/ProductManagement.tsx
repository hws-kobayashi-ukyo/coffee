import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { productService } from '../services/api';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    image_url: '',
    stock: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll();
      setProducts(response.data);
    } catch (error) {
      alert('商品の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, formData);
        alert('商品を更新しました');
      } else {
        await productService.create(formData);
        alert('商品を追加しました');
      }
      
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      alert('商品の保存に失敗しました');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category,
      image_url: product.image_url || '',
      stock: product.stock,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('この商品を削除しますか？')) return;
    
    try {
      await productService.delete(id);
      alert('商品を削除しました');
      fetchProducts();
    } catch (error) {
      alert('商品の削除に失敗しました');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      image_url: '',
      stock: 0,
    });
  };

  const openAddModal = () => {
    setEditingProduct(null);
    resetForm();
    setShowModal(true);
  };

  if (loading) return <div className="loading">読み込み中...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>商品管理</h1>
        <button onClick={openAddModal} className="btn btn-primary">
          新しい商品を追加
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>商品名</th>
              <th>価格</th>
              <th>カテゴリ</th>
              <th>在庫</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>¥{product.price.toLocaleString()}</td>
                <td>{product.category}</td>
                <td>{product.stock}</td>
                <td>
                  <button 
                    onClick={() => handleEdit(product)}
                    className="btn btn-warning"
                  >
                    編集
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="btn btn-danger"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingProduct ? '商品編集' : '商品追加'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>商品名:</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>説明:</label>
                <textarea
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="form-group">
                <label>価格:</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>カテゴリ:</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  <option value="">選択してください</option>
                  <option value="coffee">コーヒー</option>
                  <option value="beans">コーヒー豆</option>
                  <option value="equipment">器具</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>画像URL:</label>
                <input
                  type="url"
                  className="form-control"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>在庫数:</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                  required
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? '更新' : '追加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
