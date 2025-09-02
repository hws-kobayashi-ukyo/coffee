from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import sqlite3
import json
import os

app = FastAPI(title="Coffee EC Site API", version="1.0.0")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# データベース初期化
def init_db():
    conn = sqlite3.connect('coffee_shop.db')
    cursor = conn.cursor()
    
    # 商品テーブル
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            category TEXT NOT NULL,
            image_url TEXT,
            stock INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # ユーザーテーブル
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            is_admin BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 注文テーブル
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            total_amount REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # 注文アイテムテーブル
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            product_id INTEGER,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders (id),
            FOREIGN KEY (product_id) REFERENCES products (id)
        )
    ''')
    
    # サンプルデータの挿入
    cursor.execute("SELECT COUNT(*) FROM products")
    if cursor.fetchone()[0] == 0:
        sample_products = [
            ("エスプレッソ", "濃厚で香り高いエスプレッソコーヒー", 300, "coffee", "/images/espresso.jpg", 50),
            ("アメリカーノ", "すっきりとした味わいのアメリカーノ", 250, "coffee", "/images/americano.jpg", 40),
            ("カプチーノ", "クリーミーな泡が特徴のカプチーノ", 350, "coffee", "/images/cappuccino.jpg", 35),
            ("ラテ", "まろやかなミルクとコーヒーのハーモニー", 400, "coffee", "/images/latte.jpg", 45),
            ("コーヒー豆（ブラジル）", "高品質なブラジル産コーヒー豆", 1200, "beans", "/images/brazil-beans.jpg", 20),
            ("コーヒー豆（エチオピア）", "フルーティーな香りのエチオピア産", 1500, "beans", "/images/ethiopia-beans.jpg", 15),
        ]
        
        cursor.executemany(
            "INSERT INTO products (name, description, price, category, image_url, stock) VALUES (?, ?, ?, ?, ?, ?)",
            sample_products
        )
    
    # 管理者ユーザーの作成
    cursor.execute("SELECT COUNT(*) FROM users WHERE is_admin = TRUE")
    if cursor.fetchone()[0] == 0:
        cursor.execute(
            "INSERT INTO users (email, password, name, is_admin) VALUES (?, ?, ?, ?)",
            ("admin@coffee.com", "admin123", "管理者", True)
        )
    
    conn.commit()
    conn.close()

# Pydanticモデル
class Product(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None
    price: float
    category: str
    image_url: Optional[str] = None
    stock: int = 0

class User(BaseModel):
    id: Optional[int] = None
    email: str
    name: str
    is_admin: Optional[bool] = False

class Order(BaseModel):
    id: Optional[int] = None
    user_id: int
    total_amount: float
    status: str = "pending"
    created_at: Optional[datetime] = None

class OrderItem(BaseModel):
    product_id: int
    quantity: int
    price: float

class CreateOrder(BaseModel):
    items: List[OrderItem]

# API エンドポイント

@app.on_event("startup")
async def startup_event():
    init_db()

@app.get("/")
async def root():
    return {"message": "Coffee EC Site API"}

# 商品関連
@app.get("/api/products", response_model=List[Product])
async def get_products():
    conn = sqlite3.connect('coffee_shop.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products")
    products = cursor.fetchall()
    conn.close()
    
    return [
        Product(
            id=p[0], name=p[1], description=p[2], price=p[3],
            category=p[4], image_url=p[5], stock=p[6]
        ) for p in products
    ]

@app.get("/api/products/{product_id}", response_model=Product)
async def get_product(product_id: int):
    conn = sqlite3.connect('coffee_shop.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    product = cursor.fetchone()
    conn.close()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return Product(
        id=product[0], name=product[1], description=product[2], price=product[3],
        category=product[4], image_url=product[5], stock=product[6]
    )

@app.post("/api/products", response_model=Product)
async def create_product(product: Product):
    conn = sqlite3.connect('coffee_shop.db')
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO products (name, description, price, category, image_url, stock) VALUES (?, ?, ?, ?, ?, ?)",
        (product.name, product.description, product.price, product.category, product.image_url, product.stock)
    )
    product_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    product.id = product_id
    return product

@app.put("/api/products/{product_id}", response_model=Product)
async def update_product(product_id: int, product: Product):
    conn = sqlite3.connect('coffee_shop.db')
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE products SET name = ?, description = ?, price = ?, category = ?, image_url = ?, stock = ? WHERE id = ?",
        (product.name, product.description, product.price, product.category, product.image_url, product.stock, product_id)
    )
    conn.commit()
    conn.close()
    
    product.id = product_id
    return product

@app.delete("/api/products/{product_id}")
async def delete_product(product_id: int):
    conn = sqlite3.connect('coffee_shop.db')
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Product deleted successfully"}

# 注文関連
@app.post("/api/orders")
async def create_order(order_data: CreateOrder):
    conn = sqlite3.connect('coffee_shop.db')
    cursor = conn.cursor()
    
    # 合計金額を計算
    total_amount = sum(item.price * item.quantity for item in order_data.items)
    
    # 注文を作成
    cursor.execute(
        "INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)",
        (1, total_amount, "pending")  # 仮のuser_id=1
    )
    order_id = cursor.lastrowid
    
    # 注文アイテムを作成
    for item in order_data.items:
        cursor.execute(
            "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
            (order_id, item.product_id, item.quantity, item.price)
        )
        
        # 在庫を減らす
        cursor.execute(
            "UPDATE products SET stock = stock - ? WHERE id = ?",
            (item.quantity, item.product_id)
        )
    
    conn.commit()
    conn.close()
    
    return {"order_id": order_id, "total_amount": total_amount, "status": "created"}

@app.get("/api/orders")
async def get_orders():
    conn = sqlite3.connect('coffee_shop.db')
    cursor = conn.cursor()
    cursor.execute("""
        SELECT o.id, o.user_id, o.total_amount, o.status, o.created_at,
               oi.product_id, oi.quantity, oi.price, p.name
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        ORDER BY o.created_at DESC
    """)
    results = cursor.fetchall()
    conn.close()
    
    orders = {}
    for row in results:
        order_id = row[0]
        if order_id not in orders:
            orders[order_id] = {
                "id": row[0],
                "user_id": row[1],
                "total_amount": row[2],
                "status": row[3],
                "created_at": row[4],
                "items": []
            }
        
        if row[5]:  # product_id exists
            orders[order_id]["items"].append({
                "product_id": row[5],
                "quantity": row[6],
                "price": row[7],
                "product_name": row[8]
            })
    
    return list(orders.values())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
