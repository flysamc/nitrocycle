#!/bin/bash
# NitroCycle - Hetzner Deploy Script
# Sets up nginx + Node.js leaderboard backend
set -e

echo "=== NitroCycle Hetzner Deploy ==="

# Install deps
apt-get update -qq
apt-get install -y -qq nginx nodejs npm git curl > /dev/null 2>&1
echo "[OK] Dependencies installed"

# Clone/update repo
WEBDIR="/var/www/nitrocycle"
if [ -d "$WEBDIR/.git" ]; then
    cd "$WEBDIR" && git pull origin main
else
    rm -rf "$WEBDIR"
    git clone https://github.com/flysamc/nitrocycle.git "$WEBDIR"
fi
echo "[OK] Code deployed to $WEBDIR"

# Install Node deps for leaderboard
cd "$WEBDIR"
npm install --omit=dev 2>/dev/null || true

# Create standalone leaderboard server
mkdir -p "$WEBDIR/server"
cat > "$WEBDIR/server/leaderboard-server.js" << 'SERVEREOF'
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const DATA_DIR = '/var/lib/nitrocycle';
const MAX_ENTRIES = 100;
const TOP_N = 10;
const MAX_NAME_LEN = 16;
const ALLOWED_DIFFS = ['easy', 'normal', 'hard'];

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function getEntries(diff) {
    const file = path.join(DATA_DIR, `lb-${diff}.json`);
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return []; }
}

function saveEntries(diff, entries) {
    const file = path.join(DATA_DIR, `lb-${diff}.json`);
    fs.writeFileSync(file, JSON.stringify(entries, null, 2));
}

function sanitizeName(raw) {
    if (typeof raw !== 'string') return '';
    return raw.replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LEN);
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    if (!url.pathname.startsWith('/api/leaderboard')) {
        res.writeHead(404); res.end(); return;
    }

    const diff = (url.searchParams.get('difficulty') || 'normal').toLowerCase();
    if (!ALLOWED_DIFFS.includes(diff)) {
        res.writeHead(400, {'Content-Type':'application/json'});
        res.end(JSON.stringify({error:'Invalid difficulty'})); return;
    }

    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    if (req.method === 'GET') {
        const entries = getEntries(diff);
        res.writeHead(200, {'Content-Type':'application/json'});
        res.end(JSON.stringify({entries: entries.slice(0, TOP_N)}));
        return;
    }

    if (req.method === 'POST') {
        let body = '';
        req.on('data', c => body += c);
        req.on('end', () => {
            let data;
            try { data = JSON.parse(body); } catch {
                res.writeHead(400, {'Content-Type':'application/json'});
                res.end(JSON.stringify({error:'Invalid JSON'})); return;
            }
            const name = sanitizeName(data.name);
            const score = Number(data.score);
            const days = Number(data.days);
            const won = Boolean(data.won);

            if (!name) { res.writeHead(400, {'Content-Type':'application/json'}); res.end(JSON.stringify({error:'Name required'})); return; }
            if (!isFinite(score) || score < 0 || score > 100000) { res.writeHead(400, {'Content-Type':'application/json'}); res.end(JSON.stringify({error:'Invalid score'})); return; }
            if (!isFinite(days) || days < 1 || days > 1000) { res.writeHead(400, {'Content-Type':'application/json'}); res.end(JSON.stringify({error:'Invalid days'})); return; }

            const entry = { name, score: Math.floor(score), days: Math.floor(days), won, difficulty: diff, timestamp: Date.now() };
            const entries = getEntries(diff);
            entries.push(entry);
            entries.sort((a, b) => {
                const aW = a.won ? 1 : 0, bW = b.won ? 1 : 0;
                if (bW !== aW) return bW - aW;
                if (b.score !== a.score) return b.score - a.score;
                if (a.days !== b.days) return a.days - b.days;
                return a.timestamp - b.timestamp;
            });
            const trimmed = entries.slice(0, MAX_ENTRIES);
            saveEntries(diff, trimmed);
            const rank = trimmed.findIndex(e => e.timestamp === entry.timestamp) + 1;

            res.writeHead(200, {'Content-Type':'application/json'});
            res.end(JSON.stringify({entry, rank, top: trimmed.slice(0, TOP_N)}));
        });
        return;
    }

    res.writeHead(405, {'Content-Type':'application/json'});
    res.end(JSON.stringify({error:'Method not allowed'}));
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`Leaderboard API running on port ${PORT}`);
});
SERVEREOF
echo "[OK] Leaderboard server created"

# Create systemd service for leaderboard
cat > /etc/systemd/system/nitrocycle-lb.service << 'SVCEOF'
[Unit]
Description=NitroCycle Leaderboard API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/nitrocycle/server
ExecStart=/usr/bin/node /var/www/nitrocycle/server/leaderboard-server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SVCEOF

systemctl daemon-reload
systemctl enable nitrocycle-lb
systemctl restart nitrocycle-lb
echo "[OK] Leaderboard service started"

# Configure nginx
cat > /etc/nginx/sites-available/nitrocycle << 'NGINXEOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root /var/www/nitrocycle;
    index index.html;

    # Static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Leaderboard API proxy
    location /api/leaderboard {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|gif|ico|svg)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
NGINXEOF

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/nitrocycle /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx
echo "[OK] Nginx configured"

# Open firewall (ufw if active)
ufw allow 80/tcp 2>/dev/null || true
ufw allow 443/tcp 2>/dev/null || true

echo ""
echo "=== DEPLOY COMPLETE ==="
echo "Game is live at: http://$(curl -s ifconfig.me)"
echo "Leaderboard API: http://$(curl -s ifconfig.me)/api/leaderboard"
