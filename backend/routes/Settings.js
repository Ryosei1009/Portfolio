const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

// 画面から書き換えてよい設定（これ以外の名前は無視する）
const EDITABLE_KEYS = ['hero_label', 'hero_catchphrase', 'hero_github_url', 'hero_image_alt'];

// すべての設定を { 名前: 値 } の形で返す
router.get('/get', (req, res) => {
    db.query('SELECT setting_key, setting_value FROM site_settings', (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send('データの取得に失敗しました。');
        }
        res.json(Object.fromEntries(rows.map((row) => [row.setting_key, row.setting_value])));
    });
});

// 設定をまとめて更新する（values: { 名前: 値 }）
router.post('/update', (req, res) => {
    const token = req.headers['authorization'];
    jwt.verify(token, JWT_SECRET, (err) => {
        if (err) return res.status(401).send('無許可');
        const values = req.body.values ?? {};
        const entries = EDITABLE_KEYS
            .filter((key) => typeof values[key] === 'string')
            .map((key) => [key, values[key]]);
        if (entries.length === 0) return res.status(400).send('更新する設定がありません。');

        db.query(
            'INSERT INTO site_settings (setting_key, setting_value) VALUES ? ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
            [entries],
            (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('データの更新に失敗しました。');
                }
                res.json(results);
            }
        );
    })
});

module.exports = router;
