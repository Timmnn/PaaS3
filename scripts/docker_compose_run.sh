[ ! -f backend/.env ] || export $(sed 's/#.*//g' .env | xargs)
export PRIVATE_POSTGRES_HOST=db
docker compose up --build -d