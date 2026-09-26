# =============================================================================
#  worker/Dockerfile  —  NODE background job  (BUILD THIS LIVE)
#  This is the SAME pattern as a Node API image, MINUS the HTTP parts
#  (no curl, no EXPOSE, no HEALTHCHECK) because a worker serves no web requests.
#  Build order: deps stage -> runtime stage. Run non-root, use tini as init.
# =============================================================================

# --- STEP 1 — syntax directive (first line) ----------------------------------
# WHY : modern BuildKit features + caching.
# HOW : # syntax=docker/dockerfile:1.7


# --- STEP 2 — deps (install) stage on the FULL node image --------------------
# WHY : name it "deps" so the runtime stage can copy node_modules from it.
# HOW : FROM node:20-bookworm AS deps


# --- STEP 3 — working directory ----------------------------------------------
# HOW : WORKDIR /app


# --- STEP 4 — copy ONLY package.json first (for caching) ---------------------
# WHY : npm install then re-runs only when dependencies change, not on code edits.
# HOW : COPY package.json ./


# --- STEP 5 — install production dependencies --------------------------------
# FLAG: --omit=dev skips devDependencies (tests/lint) -> smaller image.
# HOW : RUN npm install --omit=dev


# =============================================================================
#  STAGE 2 — the small image we ship
# =============================================================================

# --- STEP 6 — runtime stage on the SLIM node image --------------------------
# HOW : FROM node:20-bookworm-slim AS runtime


# --- STEP 7 — production mode -------------------------------------------------
# HOW : ENV NODE_ENV=production


# --- STEP 8 — install tini ONLY (no curl!) and clean up ----------------------
# WHY : a worker has no HTTP endpoint, so there's nothing for curl to hit.
#       tini = tiny init that reaps zombies + forwards signals.
# HOW : RUN apt-get update \
#           && apt-get install -y --no-install-recommends tini \
#           && rm -rf /var/lib/apt/lists/*


# --- STEP 9 — working directory for this stage -------------------------------
# HOW : WORKDIR /app


# --- STEP 10 — create a non-root user ---------------------------------------
# WHY : least privilege. system group + system user, no login shell.
# HOW : RUN groupadd --system nodejs \
#           && useradd --system --gid nodejs --home-dir /app --shell /usr/sbin/nologin appuser


# --- STEP 11 — copy deps FROM the deps stage --------------------------------
# HOW : COPY --from=deps /app/node_modules ./node_modules


# --- STEP 12 — copy manifest + source, owned by the non-root user -----------
# FLAG: --chown=appuser:nodejs sets owner:group on copy.
# HOW : COPY --chown=appuser:nodejs package.json ./
# HOW : COPY --chown=appuser:nodejs src ./src


# --- STEP 13 — drop privileges ----------------------------------------------
# HOW : USER appuser


# --- (NO EXPOSE, NO HEALTHCHECK) --------------------------------------------
# WHY : the worker listens on no port and serves no URL to probe.
#       Reliability comes from `restart: unless-stopped` + monitoring in compose.


# --- STEP 14 — init process = tini ------------------------------------------
# TOKENS: exec-form array (no shell). "--" = "everything after is the command".
# HOW : ENTRYPOINT ["/usr/bin/tini", "--"]


# --- STEP 15 — default command: run the worker loop -------------------------
# WHAT: worker.js reads per-code click counters from Redis and aggregates a total.
# HOW : CMD ["node", "src/worker.js"]
