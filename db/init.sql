CREATE TABLE IF NOT EXISTS links (
    code TEXT PRIMARY KEY,
    url TEXT NOT NULL
);

INSERT INTO links (code, url) VALUES ('devops', 'https://github.com/DevOps-Orgnization-Course');
