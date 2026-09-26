# syntax=docker/dockerfile:1.7

FROM python:3.10 AS deps
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


FROM python:3.10-slim AS runtime
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/* 

WORKDIR /app

RUN useradd --system --create-home --shell /usr/sbin/nologin testuser
COPY --from=deps /install /usr/local
COPY --chown=testuser:testuser app.py ./

USER testuser
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=6s --start-period=20s --retries=6 \
            CMD Curl -fsS http://localhost:5000/health || exit 1

CMD ["gunicorn", "--bind", "0.0.0.0:5000","--workers", "2", "app:app"]