const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// ミドルウェア
app.use(cors());
app.use(express.json());

// ログミドルウェア
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ヘルスチェック
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// FastAPIへのプロキシ関数
const proxyToBackend = async (req, res, path, method = 'GET') => {
    try {
        const config = {
            method: method,
            url: `${BACKEND_URL}${path}`,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (method !== 'GET' && method !== 'DELETE') {
            config.data = req.body;
        }

        const response = await axios(config);
        res.json(response.data);
    } catch (error) {
        console.error('Backend error:', error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

// 商品関連のエンドポイント
app.get('/api/products', (req, res) => {
    proxyToBackend(req, res, '/api/products', 'GET');
});

app.get('/api/products/:id', (req, res) => {
    proxyToBackend(req, res, `/api/products/${req.params.id}`, 'GET');
});

app.post('/api/products', (req, res) => {
    proxyToBackend(req, res, '/api/products', 'POST');
});

app.put('/api/products/:id', (req, res) => {
    proxyToBackend(req, res, `/api/products/${req.params.id}`, 'PUT');
});

app.delete('/api/products/:id', (req, res) => {
    proxyToBackend(req, res, `/api/products/${req.params.id}`, 'DELETE');
});

// 注文関連のエンドポイント
app.post('/api/orders', (req, res) => {
    proxyToBackend(req, res, '/api/orders', 'POST');
});

app.get('/api/orders', (req, res) => {
    proxyToBackend(req, res, '/api/orders', 'GET');
});

// カート機能（セッション管理）
const carts = new Map();

app.get('/api/cart/:sessionId', (req, res) => {
    const sessionId = req.params.sessionId;
    const cart = carts.get(sessionId) || [];
    res.json(cart);
});

app.post('/api/cart/:sessionId', (req, res) => {
    const sessionId = req.params.sessionId;
    const { productId, quantity, price, name } = req.body;
    
    let cart = carts.get(sessionId) || [];
    
    // 既存のアイテムをチェック
    const existingItemIndex = cart.findIndex(item => item.productId === productId);
    
    if (existingItemIndex > -1) {
        // 既存のアイテムの数量を更新
        cart[existingItemIndex].quantity += quantity;
    } else {
        // 新しいアイテムを追加
        cart.push({ productId, quantity, price, name });
    }
    
    carts.set(sessionId, cart);
    res.json(cart);
});

app.put('/api/cart/:sessionId/:productId', (req, res) => {
    const sessionId = req.params.sessionId;
    const productId = parseInt(req.params.productId);
    const { quantity } = req.body;
    
    let cart = carts.get(sessionId) || [];
    const itemIndex = cart.findIndex(item => item.productId === productId);
    
    if (itemIndex > -1) {
        if (quantity <= 0) {
            cart.splice(itemIndex, 1);
        } else {
            cart[itemIndex].quantity = quantity;
        }
        carts.set(sessionId, cart);
    }
    
    res.json(cart);
});

app.delete('/api/cart/:sessionId/:productId', (req, res) => {
    const sessionId = req.params.sessionId;
    const productId = parseInt(req.params.productId);
    
    let cart = carts.get(sessionId) || [];
    cart = cart.filter(item => item.productId !== productId);
    carts.set(sessionId, cart);
    
    res.json(cart);
});

app.delete('/api/cart/:sessionId', (req, res) => {
    const sessionId = req.params.sessionId;
    carts.delete(sessionId);
    res.json([]);
});

// エラーハンドリング
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404ハンドリング
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Backend URL: ${BACKEND_URL}`);
});
