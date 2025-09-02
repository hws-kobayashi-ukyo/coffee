# ☕ Coffee EC Site

React (TypeScript) + Node.js + Python (FastAPI) で構築されたコーヒーECサイトです。

## 🚀 プロジェクト構成

```
coffee/
├── frontend/          # フロントエンド (React + TypeScript)
├── admin/             # 管理画面 (React + TypeScript)
├── server/            # Node.js サーバー (API Gateway)
├── backend/           # バックエンド (Python FastAPI)
├── Makefile          # 簡易起動コマンド
└── README.md
```

## 🛠️ 技術スタック

- **フロントエンド**: React 18 + TypeScript
- **管理画面**: React 18 + TypeScript  
- **サーバー**: Node.js + Express
- **バックエンド**: Python + FastAPI
- **データベース**: SQLite
- **スタイル**: CSS

## ⚡ クイックスタート

### 1. 依存関係のインストール

```bash
make install
```

### 2. 開発環境のセットアップ

```bash
make setup-dev
```

### 3. 全サービスの起動

```bash
make start-all
```

アプリケーションが以下のURLで利用可能になります：

- **フロントエンド（顧客向け）**: http://localhost:3000
- **管理画面**: http://localhost:3001
- **Node.js サーバー**: http://localhost:3002
- **FastAPI バックエンド**: http://localhost:8000

## 📋 利用可能なコマンド

```bash
make help              # ヘルプを表示
make install           # 全ての依存関係をインストール
make start-backend     # バックエンド (FastAPI) を起動
make start-server      # Node.js サーバーを起動
make start-frontend    # フロントエンド (React) を起動
make start-admin       # 管理画面 (React) を起動
make start-all         # 全サービスを並行起動
make stop-all          # 全サービスを停止
make clean             # ビルドファイルとnode_modulesを削除
make build             # プロダクション用ビルド
```

## 🔧 個別サービスの起動

各サービスを個別に起動する場合：

### バックエンド (FastAPI)
```bash
make start-backend
# または
cd backend && ./venv/bin/python main.py
```

### Node.js サーバー
```bash
make start-server
# または
cd server && npm start
```

### フロントエンド
```bash
make start-frontend
# または
cd frontend && npm start
```

### 管理画面
```bash
make start-admin
# または
cd admin && npm start
```

## 📊 機能

### フロントエンド（顧客向け）
- 商品一覧表示
- 商品詳細表示
- ショッピングカート機能
- 注文機能

### 管理画面
- ダッシュボード（統計表示）
- 商品管理（CRUD操作）
- 注文管理

### バックエンド
- 商品管理API
- 注文管理API
- SQLiteデータベース
- サンプルデータ自動生成

## 🗄️ データベース

プロジェクトはSQLiteを使用し、初回起動時に以下のテーブルが自動作成されます：

- `products` - 商品情報
- `users` - ユーザー情報
- `orders` - 注文情報
- `order_items` - 注文アイテム詳細

サンプルデータも自動で挿入されます。

## 🔒 管理者アカウント

管理画面にアクセスする際の初期アカウント：

- **Email**: admin@coffee.com
- **Password**: admin123

## 🧹 クリーンアップ

開発環境をリセットする場合：

```bash
make clean
```

## 🚀 デプロイ

プロダクション用ビルドを作成：

```bash
make build
```

## 📝 開発メモ

- フロントエンドはポート3000で動作
- 管理画面はポート3001で動作  
- Node.jsサーバーはポート3002で動作
- FastAPIバックエンドはポート8000で動作
- 全サービスはCORSが適切に設定されています
アプリ作ってAdvanced Securityの機能試す
