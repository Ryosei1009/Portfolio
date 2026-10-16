const express = require('express');
const router = express.Router();
const { db, withTransaction } = require('../db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const MAX_ITEMS = 6;

// 実績カードを表示順に返す
router.get('/get', (req, res) => {
    db.query('SELECT value, label FROM achievements ORDER BY position', (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send('データの取得に失敗しました。');
        }
        res.json(rows);
    });
});

// 実績カードを並び順ごと保存する（items: [{ value, label }, ...]、上から 1, 2, 3… 番目）
// 1〜n 番目の書き換えと n より後ろの削除を1つのトランザクションで行い、途中の状態を誰にも見せない
router.post('/save', (req, res) => {
    const token = req.headers['authorization'];
    jwt.verify(token, JWT_SECRET, (err) => {
        if (err) return res.status(401).send('無許可');
        const items = Array.isArray(req.body.items) ? req.body.items : null;
        if (!items || items.length === 0) return res.status(400).send('カードを1枚以上にしてください。');
        if (items.length > MAX_ITEMS) return res.status(400).send(`カードは${MAX_ITEMS}枚までにしてください。`);
        if (!items.every((item) => typeof item.value === 'string' && typeof item.label === 'string')) {
            return res.status(400).send('カードの内容が正しくありません。');
        }

        const rows = items.map((item, index) => [index + 1, item.value.slice(0, 50), item.label.slice(0, 200)]);
        withTransaction(async (conn) => {
            await conn.query(
                'INSERT INTO achievements (position, value, label) VALUES ? ON DUPLICATE KEY UPDATE value = VALUES(value), label = VALUES(label)',
                [rows]
            );
            await conn.query('DELETE FROM achievements WHERE position > ?', [rows.length]);
        })
            .then(() => res.json({ count: rows.length }))
            .catch((error) => {
                console.error(error);
                res.status(500).send('データの更新に失敗しました。');
            });
    })
});

module.exports = router;
