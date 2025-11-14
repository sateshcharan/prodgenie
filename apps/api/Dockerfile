FROM node:20

# Install required system dependencies
RUN apt-get update && apt-get install -y \
    ghostscript \
    graphicsmagick \
    chromium \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Puppeteer config
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
COPY . .

# Enable pnpm
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
RUN corepack enable && corepack prepare pnpm@latest --activate

RUN pnpm install --frozen-lockfile

# Prisma
RUN pnpm exec prisma generate

# Build only API
RUN pnpm nx build api

EXPOSE 3000
CMD ["node", "dist/apps/api/main.js"]
