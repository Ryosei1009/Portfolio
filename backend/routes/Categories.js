const express = require('express');
const router = express.Router();
const { db, withTransaction } = require('../db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// 保存を途中で止めるときの理由（HTTP のステータスとメッセージ）
class SaveError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

const MAX_ITEMS = 10;
// 名前を入れ替えるとき（A→B と B→A）に作品が混ざらないよう、いったん仮の名前にする
const TEMP_PREFIX = '__renaming__';

// カテゴリを表示順に返す
router.get('/get', (req, res) => {
    db.query('SELECT name FROM categories ORDER BY position', (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send('データの取得に失敗しました。');
        }
        res.json(rows.map((row) => row.name));
    });
});

// カテゴリ一覧を並び順ごと保存する
// items: [{ name: 新しい名前, previous_name: 今の名前（新しく足したカテゴリは null） }, ...]
router.post('/save', (req, res) => {
    const token = req.headers['authorization'];
    jwt.verify(token, JWT_SECRET, (err) => {
        if (err) return res.status(401).send('無許可');
        const items = Array.isArray(req.body.items) ? req.body.items : null;
        if (!items || items.length === 0) return res.status(400).send('カテゴリを1つ以上にしてください。');
        if (items.length > MAX_ITEMS) return res.status(400).send(`カテゴリは${MAX_ITEMS}個までにしてください。`);
        if (!items.every((item) => typeof item.name === 'string' && (item.previous_name === null || typeof item.previous_name === 'string'))) {
            return res.status(400).send('カテゴリの内容が正しくありません。');
        }
        const names = items.map((item) => item.name.trim());
        if (names.some((name) => name === '' || name.length > 50 || name.startsWith(TEMP_PREFIX))) {
            return res.status(400).send('カテゴリの名前は1〜50文字で入力してください。');
        }
        if (new Set(names).size !== names.length) return res.status(400).send('同じ名前のカテゴリがあります。');

        // 確かめてから書き換えるまでを1つのトランザクションで行う（同時に保存されても、間に割り込まれない）
        withTransaction(async (conn) => {
            const [rows] = await conn.query('SELECT name FROM categories FOR UPDATE');
            const current = rows.map((row) => row.name);
            const previousNames = items.map((item) => item.previous_name).filter((name) => name !== null);
            if (!previousNames.every((name) => current.includes(name))) {
                throw new SaveError(409, 'カテゴリが別の画面で変更されています。ページを読み込み直してください。');
            }
            // 一覧から外したカテゴリに作品が残っていたら、消さずに止める
            const removed = current.filter((name) => !previousNames.includes(name));
            if (removed.length > 0) {
                const [used] = await conn.query('SELECT category, COUNT(*) AS count FROM works WHERE category IN (?) GROUP BY category', [removed]);
                if (used.length > 0) {
                    throw new SaveError(400, `作品が入っているカテゴリは削除できません（${used.map((row) => `${row.category}: ${row.count}件`).join('、')}）。`);
                }
            }

            const renames = items
                .map((item, index) => ({ from: item.previous_name, to: names[index], temp: `${TEMP_PREFIX}${index}` }))
                .filter((rename) => rename.from !== null && rename.from !== rename.to);
            for (const rename of renames) {
                await conn.query('UPDATE works SET category = ? WHERE category = ?', [rename.temp, rename.from]);
            }
            for (const rename of renames) {
                await conn.query('UPDATE works SET category = ? WHERE category = ?', [rename.to, rename.temp]);
            }
            await conn.query(
                'INSERT INTO categories (position, name) VALUES ? ON DUPLICATE KEY UPDATE name = VALUES(name)',
                [names.map((name, index) => [index + 1, name])]
            );
            await conn.query('DELETE FROM categories WHERE position > ?', [names.length]);
        })
            .then(() => res.json(names))
            .catch((error) => {
                if (error instanceof SaveError) return res.status(error.status).send(error.message);
                console.error(error);
                res.status(500).send('データの更新に失敗しました。');
            });
    })
});

module.exports = router;
