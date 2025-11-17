FROM node:20

# Install Chromium, Python, Redis
RUN apt-get update && apt-get install -y \
    # python3 python3-pip python3-venv \
    # redis-server \
    # imagemagick \ 
    # libglib2.0-0 \
    # libsm6 \
    # libxrender1 \
    # libxext6 \
    # fonts-dejavu-core \ 
    ghostscript \
    graphicsmagick \
    chromium \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to use system Chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Set working directory and copy files
WORKDIR /app
COPY . .

# Environment
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

# Install pnpm and dependencies & clear pnpm store to avoid aritfacts
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm store prune && rm -rf ~/.pnpm-store

# Install root dependencies
RUN pnpm install --frozen-lockfile

# Ensure prisma schema is valid & Build backend
# RUN pnpm exec prisma validate
RUN pnpm prisma generate
RUN pnpm nx build api

# Install puppeteer
# RUN npx puppeteer browsers install chrome

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
# CMD ["sh", "-c", "node apps/backend/dist/main.js"] 

# RUN pnpm add -g concurrently
# CMD ["concurrently", "-k", \
#     "node apps/api/dist/main.js"]

# Final command
CMD ["node", "apps/api/dist/main.js"]


