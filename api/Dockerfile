# =============================================================================
#  api/Dockerfile  —  PYTHON / Flask + gunicorn  (BUILD THIS LIVE)
#  Fill in each STEP below. Delete the "# HOW:" hint line after you type the
#  real instruction, or just uncomment it. Build order: deps stage -> runtime.
#  Goal: install deps in a BIG python image, ship in a SMALL one, run non-root.
# =============================================================================

# --- STEP 1 — syntax directive (must be the very FIRST line) ------------------
# WHAT: pin the modern Dockerfile frontend.
# WHY : unlocks BuildKit features + better layer caching, regardless of Docker version.
# HOW : # syntax=docker/dockerfile:1.7


# --- STEP 2 — start the "deps" (install) stage on the FULL python image -------
# WHAT: begin stage 1 from full Python 3.12 and name it "deps".
# WHY : the full image has compilers/headers some pip wheels need to build.
# HOW : FROM python:3.12-bookworm AS deps


# --- STEP 3 — set the working directory ---------------------------------------
# WHAT: work under /app so later relative paths resolve there.
# HOW : WORKDIR /app


# --- STEP 4 — copy ONLY the requirements file first ---------------------------
# WHAT: bring in requirements.txt before anything else.
# WHY : the pip-install layer then caches and only re-runs when deps change
#       (same caching trick as package.json in Node).
# HOW : COPY requirements.txt ./


# --- STEP 5 — install the Python packages into an ISOLATED prefix -------------
# WHAT: pip install everything into /install (not the system location).
# WHY : one clean folder we can copy into the slim image = the multi-stage payoff.
# FLAGS: --no-cache-dir (don't keep pip's download cache = smaller)
#        --prefix=/install (install target dir)   -r (read the list from a file)
# HOW : RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# =============================================================================
#  STAGE 2 — the small image we actually SHIP
# =============================================================================

# --- STEP 6 — start the "runtime" stage on the SLIM python image --------------
# WHAT: begin stage 2 from slim Python 3.12 and name it "runtime".
# WHY : slim = no build tools = much smaller final image.
# HOW : FROM python:3.12-slim-bookworm AS runtime


# --- STEP 7 — set two Python env vars -----------------------------------------
# WHAT: make logs immediate and skip .pyc files.
# WHY : PYTHONUNBUFFERED=1 -> logs show up now in `docker logs`
#       PYTHONDONTWRITEBYTECODE=1 -> no stray __pycache__ files
# HOW : ENV PYTHONUNBUFFERED=1 \
#           PYTHONDONTWRITEBYTECODE=1


# --- STEP 8 — install curl (for the healthcheck) and clean up ----------------
# WHAT: install curl in ONE layer and delete the apt cache.
# FLAGS: -y (auto-yes)  --no-install-recommends (skip extras)  rm -rf lists (smaller)
# HOW : RUN apt-get update \
#           && apt-get install -y --no-install-recommends curl \
#           && rm -rf /var/lib/apt/lists/*


# --- STEP 9 — set the working directory for this stage ------------------------
# HOW : WORKDIR /app


# --- STEP 10 — create a NON-ROOT user to run the app -------------------------
# WHAT: make a system user named appuser.
# WHY : running as root inside a container is a security risk.
# FLAGS: --system (service account)  --create-home (gunicorn expects a home)
#        --shell /usr/sbin/nologin (no interactive login)
# HOW : RUN useradd --system --create-home --shell /usr/sbin/nologin appuser


# --- STEP 11 — copy the installed packages FROM the deps stage ---------------
# WHAT: move /install into /usr/local (Python's default location) so gunicorn finds them.
# WHY : this is why STEP 5 used --prefix=/install — one folder to copy.
# HOW : COPY --from=deps /install /usr/local


# --- STEP 12 — copy the app code, owned by the non-root user -----------------
# FLAG: --chown=appuser:appuser sets owner:group on copy (files are root by default).
# HOW : COPY --chown=appuser:appuser app.py ./


# --- STEP 13 — drop privileges ----------------------------------------------
# WHAT: everything after this runs as appuser, not root.
# HOW : USER appuser


# --- STEP 14 — document the listen port -------------------------------------
# WHAT: metadata only (does NOT publish the port).
# HOW : EXPOSE 5000


# --- STEP 15 — add a HEALTHCHECK --------------------------------------------
# WHAT: let Docker test if the app is healthy by hitting /health.
# FLAGS: --interval (how often)  --timeout (fail a slow check)
#        --start-period (grace at boot)  --retries (fails before "unhealthy")
#        curl -f (fail on HTTP errors) -s (silent) -S (still show errors)
#        || exit 1 (make a failure a failed check)
# HOW : HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
#           CMD curl -fsS http://localhost:5000/health || exit 1


# --- STEP 16 — the default command: run gunicorn ----------------------------
# WHAT: start the app with gunicorn (production WSGI server; NOT Flask's dev server).
# TOKENS: --bind 0.0.0.0:5000 (listen on all interfaces so other containers reach it)
#         --workers 2 (2 worker processes)   app:app (module:variable -> Flask obj `app`)
# NOTE : no ENTRYPOINT/tini here — gunicorn's master handles signals itself.
# HOW : CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "app:app"]
