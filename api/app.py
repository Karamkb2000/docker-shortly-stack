import os
import secrets

import psycopg2
import redis
from flask import Flask, request, jsonify, redirect

app = Flask(__name__)

cache = redis.Redis.from_url(os.environ.get("REDIS_URL", "redis://cache:6379"))


def get_db():
    return psycopg2.connect(
        host=os.environ.get("PGHOST", "db"),
        port=os.environ.get("PGPORT", "5432"),
        user=os.environ.get("PGUSER", "app"),
        password=os.environ.get("PGPASSWORD", "app"),
        dbname=os.environ.get("PGDATABASE", "urls"),
    )

#test
def ensure_schema():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS links (code TEXT PRIMARY KEY, url TEXT NOT NULL)")
    conn.commit()
    cur.close()
    conn.close()


@app.get("/health")
def health():
    return jsonify(status="ok")


@app.get("/api/links")
def list_links():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT code, url FROM links ORDER BY code")
    rows = [{"code": c, "url": u} for (c, u) in cur.fetchall()]
    cur.close()
    conn.close()
    return jsonify(rows)


@app.post("/api/links")
def create_link():
    data = request.get_json(silent=True) or {}
    url = (data.get("url") or "").strip()
    if not url:
        return jsonify(error="url is required"), 400
    code = secrets.token_urlsafe(4)[:6]
    conn = get_db()
    cur = conn.cursor()
    cur.execute("INSERT INTO links (code, url) VALUES (%s, %s)", (code, url))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify(code=code, url=url), 201


@app.get("/api/stats")
def stats():
    total = cache.get("total_clicks")
    return jsonify(totalClicks=int(total) if total else 0)


@app.get("/r/<code>")
def go(code):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT url FROM links WHERE code = %s", (code,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        return jsonify(error="not found"), 404
    cache.incr("clicks:" + code)
    return redirect(row[0], code=302)


try:
    ensure_schema()
except Exception as exc:
    print("schema init deferred:", exc)
