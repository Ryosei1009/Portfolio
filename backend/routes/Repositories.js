const express = require('express');
const router = express.Router();
const { db } = require('../db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// GitHub の公開リポジトリ一覧と、ポートフォリオでの表示の設定（repositories テーブル）を合わせて返す
// - 名前・説明文・言語は GitHub から取る（ポートフォリオ側では二重に管理しない）
// - repositories に行が無いリポジトリは「未確認」。公開画面には出さず、管理者が表示をオンにするまで待つ

// GitHub API はトークンなしだと1時間に60回までなので、一覧は1時間取っておく
const CACHE_MS = 60 * 60 * 1000;
const GITHUB_TIMEOUT_MS = 10000;
const MAX_PAGES = 3;
const MAX_SAVE_ITEMS = 100;
const NAME_PATTERN = /^[A-Za-z0-9._-]{1,100}$/;
const MAX_SORT_ORDER = 1000000;

class SaveError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

// { username, repos, fetchedAt }。GitHub が落ちていても、前に取れた一覧があればそれを使う
let cache = null;
// 同時に何件来ても、GitHub へ取りに行くのは1回にする
let inflight = null;

// About Me の GitHub の URL（無ければヒーローの GitHub の URL）からユーザー名を取る
const githubUsername = async () => {
    const [[aboutMe], [settings]] = await Promise.all([
        db.promise().query('SELECT github_url FROM about_me ORDER BY id LIMIT 1'),
        db.promise().query("SELECT setting_value FROM site_settings WHERE setting_key = 'hero_github_url'"),
    ]);
    const url = aboutMe[0]?.github_url || settings[0]?.setting_value || '';
    return url.match(/github\.com\/([A-Za-z0-9-]+)/i)?.[1] ?? null;
};

// 説明文の先頭の【個人事業-ゲームサーバー開発】のような見出しは、カテゴリの見出しと重なるので取り除く
const stripHeading = (description) => (description ?? '').replace(/^\s*【[^】]*】\s*/, '');

const fetchFromGithub = async (username) => {
    const headers = {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'shinoryo-portfolio',
    };
    // 任意。回数制限を 5,000 回に増やすだけ（/users/:name/repos は、トークンがあっても公開リポジトリしか返さない）
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

    const repos = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
        const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?type=owner&per_page=100&page=${page}`;
        const response = await fetch(url, { headers, signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS) });
        if (!response.ok) throw new Error(`GitHub API: HTTP ${response.status}`);
        const data = await response.json();
        repos.push(...data);
        if (data.length < 100) break;
    }
    return repos
        .filter((repo) => !repo.private)
        .map((repo) => ({
            name: repo.name,
            description: stripHeading(repo.description),
            html_url: repo.html_url,
            language: repo.language,
            fork: repo.fork,
            archived: repo.archived,
            pushed_at: repo.pushed_at,
        }));
};

// refresh: true なら、取っておいた一覧を使わずに取り直す（管理者の「GitHub から読み直す」）
const githubRepos = async ({ refresh = false } = {}) => {
    const username = await githubUsername();
    if (!username) return [];
    const fresh = cache && cache.username === username && Date.now() - cache.fetchedAt < CACHE_MS;
    if (fresh && !refresh) return cache.repos;

    if (!inflight) {
        inflight = fetchFromGithub(username)
            .then((repos) => {
                cache = { username, repos, fetchedAt: Date.now() };
                return repos;
            })
            .finally(() => {
                inflight = null;
            });
    }
    try {
        return await inflight;
    } catch (error) {
        if (cache && cache.username === username) {
            console.warn('GitHub から取得できなかったため、前に取得した一覧を使います:', error.message);
            return cache.repos;
        }
        throw error;
    }
};

const isAdmin = (token) => new Promise((resolve) => {
    jwt.verify(token, JWT_SECRET, (err) => resolve(!err));
});

// 公開画面: 表示中のものだけ。管理者: GitHub の公開リポジトリをすべて（is_new が true なら未確認、sort_order は null）
// 並びは sort_order → 名前。未確認のものは管理者の一覧の最後に来る
router.get('/get', async (req, res) => {
    try {
        const admin = await isAdmin(req.headers['authorization']);
        const [repos, [rows]] = await Promise.all([
            githubRepos({ refresh: admin && req.query.refresh === '1' }),
            db.promise().query('SELECT name, is_visible, category, sort_order, comment FROM repositories'),
        ]);
        const settings = new Map(rows.map((row) => [row.name, row]));

        const merged = repos.map((repo) => {
            const setting = settings.get(repo.name);
            return {
                ...repo,
                is_new: !setting,
                is_visible: setting ? Number(setting.is_visible) === 1 : false,
                category: setting?.category ?? null,
                sort_order: setting ? setting.sort_order : null,
                comment: setting?.comment ?? '',
            };
        });
        const order = (repo) => repo.sort_order ?? Number.MAX_SAFE_INTEGER;
        merged.sort((a, b) => order(a) - order(b) || a.name.localeCompare(b.name));

        if (admin) return res.json(merged);
        res.json(merged
            .filter((repo) => repo.is_visible)
            .map(({ name, description, html_url, language, category, comment }) => ({ name, description, html_url, language, category, comment })));
    } catch (error) {
        console.error(error);
        res.status(502).send('リポジトリの一覧を取得できませんでした。');
    }
});

// 表示の設定を保存する（items: [{ name, is_visible, category, sort_order, comment }, ...]、変わったリポジトリの分だけ）
router.post('/save', (req, res) => {
    const token = req.headers['authorization'];
    jwt.verify(token, JWT_SECRET, (err) => {
        if (err) return res.status(401).send('無許可');
        const items = Array.isArray(req.body.items) ? req.body.items : null;
        if (!items || items.length === 0) return res.status(400).send('保存する内容がありません。');
        if (items.length > MAX_SAVE_ITEMS) return res.status(400).send(`一度に保存できるのは${MAX_SAVE_ITEMS}件までです。`);
        const valid = items.every((item) => (
            typeof item.name === 'string' && NAME_PATTERN.test(item.name)
            && typeof item.is_visible === 'boolean'
            && (item.category === null || (typeof item.category === 'string' && item.category.length <= 50))
            && Number.isInteger(item.sort_order) && item.sort_order >= 0 && item.sort_order <= MAX_SORT_ORDER
            && typeof item.comment === 'string'
        ));
        if (!valid) return res.status(400).send('リポジトリの設定が正しくありません。');

        const save = async () => {
            // 選んだカテゴリが、別の画面で名前を変えられたり消されたりしていないか確かめる
            const used = [...new Set(items.map((item) => item.category).filter((category) => category !== null))];
            if (used.length > 0) {
                const [rows] = await db.promise().query('SELECT name FROM categories WHERE name IN (?)', [used]);
                if (rows.length !== used.length) {
                    throw new SaveError(409, 'カテゴリが変更されています。ページを読み込み直してください。');
                }
            }
            const rows = items.map((item) => [item.name, item.is_visible ? 1 : 0, item.category, item.sort_order, item.comment.trim().slice(0, 200)]);
            await db.promise().query(
                `INSERT INTO repositories (name, is_visible, category, sort_order, comment) VALUES ?
                 ON DUPLICATE KEY UPDATE is_visible = VALUES(is_visible), category = VALUES(category), sort_order = VALUES(sort_order), comment = VALUES(comment)`,
                [rows]
            );
        };
        save()
            .then(() => res.json({ count: items.length }))
            .catch((error) => {
                if (error instanceof SaveError) return res.status(error.status).send(error.message);
                console.error(error);
                res.status(500).send('データの更新に失敗しました。');
            });
    });
});

module.exports = router;
