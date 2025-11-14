FROM node:20

# Install system deps (only chromium if workers use PDF/image generation)
RUN apt-get update && apt-get install -y \
    chromium \
    graphicsmagick \
    ghostscript \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
COPY . .

# PNPM
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
RUN corepack enable && corepack prepare pnpm@latest --activate

RUN pnpm install --frozen-lockfile

# Prisma
RUN pnpm exec prisma generate

# Build only workers
RUN pnpm nx build workers

# Workers do NOT expose ports typically
CMD ["node", "dist/apps/workers/main.js"]
