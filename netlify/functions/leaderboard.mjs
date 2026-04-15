import { getStore, getDeployStore } from "@netlify/blobs";

/**
 * Leaderboard API
 *
 *   GET  /api/leaderboard?difficulty=easy|normal|hard
 *     -> { entries: [{name, score, days, difficulty, timestamp}, ...] }
 *
 *   POST /api/leaderboard?difficulty=easy|normal|hard
 *        body: { name: string, score: number, days: number }
 *     -> { entry, rank, top: [...] }
 *
 * Storage: Netlify Blobs, one key per difficulty (`lb:<diff>`).
 * Data scope: production deploys write to a global store so scores persist
 * across deploys; preview / branch deploys use a deploy-specific store so
 * test data never pollutes the live leaderboard.
 */

const ALLOWED_DIFFS = new Set(["easy", "normal", "hard"]);
const MAX_ENTRIES = 100;     // hard cap per difficulty in storage
const TOP_N = 10;            // returned to clients
const MAX_NAME_LEN = 16;

function getLeaderboardStore(context) {
    // Globally scoped store on production so scores persist across deploys.
    // Deploy-scoped on previews / branch deploys so test scores stay isolated.
    const isProd = context?.deploy?.context === "production";
    const opts = { name: "leaderboard", consistency: "strong" };
    return isProd ? getStore(opts) : getDeployStore(opts);
}

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json; charset=utf-8" }
    });
}

function sanitizeName(raw) {
    if (typeof raw !== "string") return "";
    // Strip control chars and collapse whitespace; clamp to MAX_NAME_LEN.
    return raw
        .replace(/[\u0000-\u001f\u007f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, MAX_NAME_LEN);
}

export default async (request, context) => {
    const url = new URL(request.url);
    const diff = (url.searchParams.get("difficulty") || "normal").toLowerCase();
    if (!ALLOWED_DIFFS.has(diff)) {
        return jsonResponse({ error: "Invalid difficulty" }, 400);
    }

    const store = getLeaderboardStore(context);
    const key = `lb:${diff}`;

    // ----- READ -----
    if (request.method === "GET") {
        const entries = (await store.get(key, { type: "json" })) || [];
        return jsonResponse({ entries: entries.slice(0, TOP_N) });
    }

    // ----- WRITE -----
    if (request.method === "POST") {
        let body;
        try {
            body = await request.json();
        } catch {
            return jsonResponse({ error: "Invalid JSON body" }, 400);
        }

        const name = sanitizeName(body.name);
        const score = Number(body.score);
        const days = Number(body.days);

        if (!name) {
            return jsonResponse({ error: "Name required" }, 400);
        }
        if (!Number.isFinite(score) || score < 0 || score > 100000) {
            return jsonResponse({ error: "Invalid score" }, 400);
        }
        if (!Number.isFinite(days) || days < 1 || days > 1000) {
            return jsonResponse({ error: "Invalid days" }, 400);
        }

        const entry = {
            name,
            score: Math.floor(score),
            days: Math.floor(days),
            difficulty: diff,
            timestamp: Date.now()
        };

        const existing = (await store.get(key, { type: "json" })) || [];
        existing.push(entry);

        // Sort: higher score wins, fewer days breaks ties, earlier timestamp last
        existing.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (a.days !== b.days) return a.days - b.days;
            return a.timestamp - b.timestamp;
        });

        const trimmed = existing.slice(0, MAX_ENTRIES);
        await store.setJSON(key, trimmed);

        // Player's rank (1-indexed). Could be > TOP_N if they didn't make the
        // visible board.
        const rank = trimmed.findIndex((e) => e.timestamp === entry.timestamp) + 1;

        return jsonResponse({
            entry,
            rank,
            top: trimmed.slice(0, TOP_N)
        });
    }

    return jsonResponse({ error: "Method not allowed" }, 405);
};

export const config = {
    // Friendlier URL than the default /.netlify/functions/leaderboard
    path: "/api/leaderboard"
};
