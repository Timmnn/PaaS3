concurrently \
   "cd frontend && bun run dev" \
   "cd backend && bun run dev" \
   "docker compose up db" \
   "docker compose up nginx"