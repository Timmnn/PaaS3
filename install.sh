apt install unzip nodejs npm -y
curl -fsSL https://bun.sh/install | bash
bun install
npm i -g concurrently
export PATH="/path/to/npm/global/bin:$PATH"
bun run dev