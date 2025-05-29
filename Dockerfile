FROM node:20

# Install Chromium + Python
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-venv \
    chromium \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

# Install pnpm and packages
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile
RUN pnpm exec prisma generate
RUN pnpm nx build backend

# Setup Python venv
RUN python3 -m venv /opt/venv && \
    . /opt/venv/bin/activate && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install -r apps/pdf-parser/requirements.txt

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

# Install concurrently
RUN pnpm add -g concurrently

# Expose the backend port
EXPOSE 3000

# Launch both services
CMD ["sh", "-c", "concurrently --raw 'node apps/backend/dist/main.js' '/opt/venv/bin/python3 apps/pdf-parser/main.py'"]
