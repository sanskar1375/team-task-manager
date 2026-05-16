#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found. Install Docker Desktop from https://www.docker.com/products/docker-desktop"
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "[1/5] Docker daemon not running. Launching Docker Desktop..."
  if [ "$(uname)" = "Darwin" ]; then
    open -a Docker 2>/dev/null || true
  fi
  echo -n "      waiting for Docker daemon"
  for _ in $(seq 1 60); do
    if docker info >/dev/null 2>&1; then
      echo " - ready."
      break
    fi
    echo -n "."
    sleep 2
  done
  if ! docker info >/dev/null 2>&1; then
    echo ""
    echo "Docker daemon still not responding. Start Docker Desktop manually, then re-run this script."
    exit 1
  fi
fi

if docker ps --format '{{.Names}}' | grep -q '^ttm-pg$'; then
  echo "[1/5] Postgres container already running."
elif docker ps -a --format '{{.Names}}' | grep -q '^ttm-pg$'; then
  echo "[1/5] Starting existing Postgres container..."
  docker start ttm-pg >/dev/null
else
  echo "[1/5] Creating Postgres container..."
  docker run --name ttm-pg \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=team_task_manager \
    -p 5432:5432 \
    -d postgres:16 >/dev/null
fi

echo -n "      waiting for Postgres"
for _ in $(seq 1 30); do
  if docker exec ttm-pg pg_isready -U postgres -d team_task_manager >/dev/null 2>&1; then
    echo " - ready."
    break
  fi
  echo -n "."
  sleep 1
done

if [ ! -f server/.env ]; then
  echo "[2/5] Creating server/.env..."
  cat > server/.env <<'EOF'
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/team_task_manager?schema=public
JWT_SECRET=local_dev_secret_change_me_64_chars_long_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:5173
EOF
else
  echo "[2/5] server/.env exists."
fi

if [ ! -f client/.env ]; then
  echo "      Creating client/.env..."
  echo "VITE_API_URL=http://localhost:4000" > client/.env
fi

echo "[3/5] Installing dependencies..."
if [ ! -d node_modules ]; then npm install --silent --no-audit --no-fund; fi
if [ ! -d server/node_modules ]; then npm install --prefix server --silent --no-audit --no-fund; fi
if [ ! -d client/node_modules ]; then npm install --prefix client --silent --no-audit --no-fund; fi

echo "[4/5] Running Prisma migrate + seed..."
(
  cd server
  npx prisma generate
  if [ -d prisma/migrations ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
    npx prisma migrate deploy
  else
    npx prisma migrate dev --name init --skip-seed
  fi
  npm run seed
)

echo "[5/5] Starting dev servers (Ctrl+C to stop both)..."
echo "      Web:  http://localhost:5173"
echo "      API:  http://localhost:4000"
echo "      Demo: admin@demo.com / Demo1234!  (or member@demo.com / Demo1234!)"
echo ""
npm run dev
