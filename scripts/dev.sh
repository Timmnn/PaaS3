docker compose down



 concurrently \
   "cd frontend && bun run dev" \
   "cd backend && bun run dev" \
   "docker compose up db nginx reverse-proxy whoami"