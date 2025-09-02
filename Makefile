# Coffee EC Site Makefile

.PHONY: help install start-backend start-server start-frontend start-admin start-all stop-all clean check-venv

# 仮想環境チェック
check-venv:
	@if [ ! -d "backend/venv" ]; then \
		echo "❌ Python仮想環境が見つかりません。'make install' を実行してください。"; \
		exit 1; \
	fi

# デフォルトターゲット
help:
	@echo "Coffee EC Site - 利用可能なコマンド:"
	@echo ""
	@echo "  install           - 全ての依存関係をインストール"
	@echo "  start-backend     - バックエンド (FastAPI) を起動"
	@echo "  start-server      - Node.js サーバーを起動"
	@echo "  start-frontend    - フロントエンド (React) を起動"
	@echo "  start-admin       - 管理画面 (React) を起動"
	@echo "  start-all         - 全サービスを並行起動"
	@echo "  stop-all          - 全サービスを停止"
	@echo "  clean             - ビルドファイルとnode_modulesを削除"
	@echo "  check-venv        - Python仮想環境の確認"
	@echo ""

# 依存関係のインストール
install:
	@echo "📦 依存関係をインストールしています..."
	@echo "Python仮想環境を作成中..."
	cd backend && python3 -m venv venv
	@echo "Backend dependencies..."
	cd backend && ./venv/bin/pip install -r requirements.txt
	@echo "Server dependencies..."
	cd server && npm install
	@echo "Frontend dependencies..."
	cd frontend && npm install
	@echo "Admin dependencies..."
	cd admin && npm install
	@echo "✅ 全ての依存関係がインストールされました"

# バックエンド起動
start-backend: check-venv
	@echo "🚀 バックエンド (FastAPI) を起動しています..."
	cd backend && ./venv/bin/python main.py

# Node.js サーバー起動
start-server:
	@echo "🚀 Node.js サーバーを起動しています..."
	cd server && npm start

# フロントエンド起動
start-frontend:
	@echo "🚀 フロントエンド (React) を起動しています..."
	cd frontend && npm start

# 管理画面起動
start-admin:
	@echo "🚀 管理画面 (React) を起動しています..."
	cd admin && npm start

# 全サービス並行起動
start-all: check-venv
	@echo "🚀 全サービスを並行起動しています..."
	@echo "バックエンド: http://localhost:8000"
	@echo "Node.js サーバー: http://localhost:3002"
	@echo "フロントエンド: http://localhost:3000"
	@echo "管理画面: http://localhost:3001"
	@echo ""
	@echo "Ctrl+C で全サービスを停止します"
	@trap 'kill 0' EXIT; \
	(cd backend && ./venv/bin/python main.py) & \
	(cd server && npm start) & \
	(cd frontend && npm start) & \
	(cd admin && npm start) & \
	wait

# 全サービス停止
stop-all:
	@echo "🛑 全サービスを停止しています..."
	@pkill -f "./venv/bin/python main.py" || true
	@pkill -f "node.*server" || true
	@pkill -f "react-scripts start" || true
	@echo "✅ 全サービスが停止されました"

# クリーンアップ
clean:
	@echo "🧹 プロジェクトをクリーンアップしています..."
	rm -rf backend/__pycache__
	rm -rf backend/*.db
	rm -rf backend/venv
	rm -rf server/node_modules
	rm -rf frontend/node_modules
	rm -rf frontend/build
	rm -rf admin/node_modules
	rm -rf admin/build
	@echo "✅ クリーンアップが完了しました"

# 開発環境セットアップ
setup-dev: install
	@echo "🔧 開発環境をセットアップしています..."
	@echo "バックエンドデータベースを初期化..."
	cd backend && ./venv/bin/python -c "from main import init_db; init_db()"
	@echo "✅ 開発環境のセットアップが完了しました"
	@echo ""
	@echo "🚀 次のコマンドでアプリケーションを起動できます:"
	@echo "  make start-all"

# プロダクションビルド
build:
	@echo "🏗️ プロダクション用ビルドを作成しています..."
	cd frontend && npm run build
	cd admin && npm run build
	@echo "✅ ビルドが完了しました"
