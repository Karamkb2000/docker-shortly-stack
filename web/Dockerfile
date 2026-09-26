# =============================================================================
#  web/Dockerfile  —  FRONTEND: build with Node, serve with nginx  (BUILD LIVE)
#  Two stages: (1) a "build" stage runs the build script to make dist/,
#  (2) a tiny nginx stage serves dist/ and reverse-proxies to the API.
#  NOTE: nginx.conf (already provided) proxies to api:5000 and adds a /r/ route
#        for short-link redirects — the Dockerfile itself is stack-agnostic.
# =============================================================================

# --- STEP 1 — syntax directive (first line) ----------------------------------
# HOW : # syntax=docker/dockerfile:1.7


# --- STEP 2 — build stage on the FULL node image -----------------------------
# WHY : needs node/npm to run the build; name it "build" for the copy later.
# HOW : FROM node:20-bookworm AS build


# --- STEP 3 — working directory ----------------------------------------------
# HOW : WORKDIR /app


# --- STEP 4 — copy exactly what the build needs ------------------------------
# WHY : separate COPYs cache well (changing public/ won't bust the package.json layer).
# HOW : COPY package.json ./
# HOW : COPY build.js ./
# HOW : COPY public ./public


# --- STEP 5 — run the build (public/ -> dist/) -------------------------------
# WHAT: runs the "build" script in package.json (node build.js), producing dist/.
# HOW : RUN npm run build


# =============================================================================
#  STAGE 2 — the nginx runtime (nothing from Node carries over except dist/)
# =============================================================================

# --- STEP 6 — start fresh from nginx on Alpine -------------------------------
# WHY : -alpine = tiny base -> small final image.
# HOW : FROM nginx:1.27-alpine AS runtime


# --- STEP 7 — install curl for the healthcheck -------------------------------
# NOTE: Alpine uses `apk`, not apt-get.  add = install, --no-cache = don't keep index.
# HOW : RUN apk add --no-cache curl


# --- STEP 8 — install our site config ----------------------------------------
# WHAT: replace nginx's default site with ours (serves static files + proxies /api and /r).
# HOW : COPY nginx.conf /etc/nginx/conf.d/default.conf


# --- STEP 9 — copy the built site FROM the build stage -----------------------
# WHAT: the multi-stage payoff — take dist/ into nginx's web root.
# FLAG: --from=build (source is the earlier stage, not the build context).
# HOW : COPY --from=build /app/dist /usr/share/nginx/html


# --- STEP 10 — document the port ---------------------------------------------
# HOW : EXPOSE 80


# --- STEP 11 — healthcheck: fetch the page -----------------------------------
# FLAGS: same as the api — interval/timeout/start-period/retries; curl -fsS; || exit 1.
# HOW : HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
#           CMD curl -fsS http://localhost/ || exit 1


# --- (NO CMD) ----------------------------------------------------------------
# WHY : the official nginx image already sets the right ENTRYPOINT/CMD to run
#       nginx in the foreground, so we don't repeat it.
