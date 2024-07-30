touch ./backend/.env
# write .env.example to .env

cat ./backend/.env.example > ./backend/.env


npm i -g drizzle-kit
(
   cd backend/drizzle &&
   bun install drizzle-orm drizzle-kit pg &&
   bash ./sync_schema.sh
)

bash ./scripts/docker_compose_run.sh