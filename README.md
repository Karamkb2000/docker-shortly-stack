# shortly-stack — Docker Compose microservices (URL shortener)

A second multi-service example, with a **Python/Flask** API (contrast to the Node one in `docker-microservices`).

```
        ┌────── frontend network ──────┐   ┌──────── backend network ────────┐
browser →  web (nginx, :8080)  →  api (Flask/gunicorn, :5000)  →  db (Postgres)   cache (Redis)
                                              worker (Node) ───────────────────────┘
```
- **web** — nginx serving a static UI, proxying `/api` and `/r` to the API. Multi-stage (node build → nginx).
- **api** — Flask + gunicorn: create/list short links (Postgres), count clicks (Redis), redirect `/r/<code>`. Multi-stage **Python** Dockerfile, non-root, healthcheck.
- **worker** — Node process aggregating per-code click counts into a Redis total. Multi-stage, non-root.
- **db** — Postgres (named volume + init script). **cache** — Redis (named volume).
- Two networks isolate tiers; only `api` is on both.

## Run
```bash
cp .env.example .env
docker compose up --build
```
Open http://localhost:8080 — shorten a URL, click the `/r/<code>` link, and watch **total clicks** update (the worker aggregates from Redis every 5s).

## Commands
```bash
docker compose ps
docker compose logs -f worker
docker compose down          # keep data
docker compose down -v       # wipe volumes
```
