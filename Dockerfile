FROM node:20

# Install Chromium, Python, Redis
RUN apt-get update && apt-get install -y \
    # python3 python3-pip python3-venv \
    # redis-server \
    chromium \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app
COPY . .

# Environment
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

# Install pnpm and dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate

# Clear pnpm store to avoid aritfacts
RUN pnpm store prune && rm -rf ~/.pnpm-store
RUN pnpm install --frozen-lockfile

# Ensure prisma schema is valid
RUN pnpm exec prisma validate
RUN pnpm exec prisma generate

# Build backend
RUN pnpm nx build backend

# Setup Python virtual environment
# RUN python3 -m venv /opt/venv && \
#     . /opt/venv/bin/activate && \
#     /opt/venv/bin/pip install --upgrade pip && \
#     /opt/venv/bin/pip install -r apps/pdf-parser/requirements.txt


# Install concurrently globally
# RUN pnpm add -g concurrently

# Expose backend port
EXPOSE 3000

# Start Redis + Node.js backend + Python service
# CMD ["sh", "-c", "redis-server & concurrently --raw 'node apps/backend/dist/main.js' '/opt/venv/bin/python3 apps/pdf-parser/main.py'"]
CMD ["sh", "-c", "node apps/backend/dist/main.js"]
