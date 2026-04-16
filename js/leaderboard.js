/**
 * Leaderboard - frontend client for the /api/leaderboard Netlify Function.
 *
 *   Leaderboard.fetch(difficulty)        -> Promise<{entries: [...]}>
 *   Leaderboard.submit({name, score, days, difficulty})
 *                                         -> Promise<{entry, rank, top: [...]}>
 *   Leaderboard.savedName / setSavedName  -> localStorage-backed username
 *
 * If the API endpoint is unreachable (e.g. local file:// preview, or the
 * Netlify deploy hasn't built yet), the methods throw an Error whose
 * .offline === true so the UI can show a friendly "leaderboard unavailable
 * here, deploy to view" message instead of a stack trace.
 */

const Leaderboard = {
    API: '/api/leaderboard',

    /** Last name the player typed, persisted across sessions. */
    get savedName() {
        return localStorage.getItem('nitrocycle_username') || '';
    },
    setSavedName(name) {
        if (name) localStorage.setItem('nitrocycle_username', name);
    },

    async fetch(difficulty) {
        const url = `${this.API}?difficulty=${encodeURIComponent(difficulty)}`;
        let res;
        try {
            res = await window.fetch(url, { headers: { 'Accept': 'application/json' } });
        } catch (e) {
            const err = new Error('Leaderboard offline');
            err.offline = true;
            throw err;
        }
        if (!res.ok) {
            // The static dev server returns 404 because the function only exists
            // on Netlify. Surface that as "offline" so the UI can adapt.
            if (res.status === 404) {
                const err = new Error('Leaderboard not deployed');
                err.offline = true;
                throw err;
            }
            const text = await res.text().catch(() => '');
            throw new Error(`Leaderboard fetch failed (${res.status}): ${text || res.statusText}`);
        }
        return res.json();
    },

    async submit({ name, score, days, difficulty, won }) {
        const url = `${this.API}?difficulty=${encodeURIComponent(difficulty)}`;
        let res;
        try {
            res = await window.fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ name, score, days, won: !!won })
            });
        } catch (e) {
            const err = new Error('Leaderboard offline');
            err.offline = true;
            throw err;
        }
        if (!res.ok) {
            if (res.status === 404) {
                const err = new Error('Leaderboard not deployed');
                err.offline = true;
                throw err;
            }
            let payload = null;
            try { payload = await res.json(); } catch { /* ignore */ }
            throw new Error(payload?.error || `Submit failed (${res.status})`);
        }
        return res.json();
    },

    /** Format an ISO/epoch timestamp as a short relative date for the UI. */
    formatDate(ts) {
        const d = new Date(ts);
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }
};

window.Leaderboard = Leaderboard;
