FROM node:20

# Install Chromium, Python, Redis
RUN apt-get update && apt-get install -y \
    # python3 python3-pip python3-venv \
    chromium \
    redis-server \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app
COPY . .

# Install pnpm and dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile
RUN pnpm exec prisma generate
RUN pnpm nx build backend

# Setup Python virtual environment
# RUN python3 -m venv /opt/venv && \
#     . /opt/venv/bin/activate && \
#     /opt/venv/bin/pip install --upgrade pip && \
#     /opt/venv/bin/pip install -r apps/pdf-parser/requirements.txt

# Environment
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

# Install concurrently globally
RUN pnpm add -g concurrently

# Expose backend port
EXPOSE 3000

# Start Redis + Node.js backend + Python service
# CMD ["sh", "-c", "redis-server & concurrently --raw 'node apps/backend/dist/main.js' '/opt/venv/bin/python3 apps/pdf-parser/main.py'"]
CMD ["sh", "-c", "redis-server & concurrently --raw 'node apps/backend/dist/main.js'"]
