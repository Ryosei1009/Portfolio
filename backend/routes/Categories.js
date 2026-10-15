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
    // 保存のときに、作品側の書き換えとカテゴリの更新を1回のトランザクションで送るため
    multipleStatements: true,
});

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

        db.query('SELECT name FROM categories', (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).send('データの更新に失敗しました。');
            }
            const current = rows.map((row) => row.name);
            const previousNames = items.map((item) => item.previous_name).filter((name) => name !== null);
            if (!previousNames.every((name) => current.includes(name))) {
                return res.status(409).send('カテゴリが別の画面で変更されています。ページを読み込み直してください。');
            }
            // 一覧から外したカテゴリに作品が残っていたら、消さずに止める
            const removed = current.filter((name) => !previousNames.includes(name));
            const check = removed.length > 0
                ? (cb) => db.query('SELECT category, COUNT(*) AS count FROM works WHERE category IN (?) GROUP BY category', [removed], cb)
                : (cb) => cb(null, []);

            check((err, used) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('データの更新に失敗しました。');
                }
                if (used.length > 0) {
                    return res.status(400).send(`作品が入っているカテゴリは削除できません（${used.map((row) => `${row.category}: ${row.count}件`).join('、')}）。`);
                }

                const renames = items
                    .map((item, index) => ({ from: item.previous_name, to: names[index], temp: `${TEMP_PREFIX}${index}` }))
                    .filter((rename) => rename.from !== null && rename.from !== rename.to);
                const sql = [
                    'START TRANSACTION;',
                    ...renames.map(() => 'UPDATE works SET category = ? WHERE category = ?;'),
                    ...renames.map(() => 'UPDATE works SET category = ? WHERE category = ?;'),
                    'INSERT INTO categories (position, name) VALUES ? ON DUPLICATE KEY UPDATE name = VALUES(name);',
                    'DELETE FROM categories WHERE position > ?;',
                    'COMMIT;',
                ].join('\n');
                const params = [
                    ...renames.flatMap((rename) => [rename.temp, rename.from]),
                    ...renames.flatMap((rename) => [rename.to, rename.temp]),
                    names.map((name, index) => [index + 1, name]),
                    names.length,
                ];

                db.query(sql, params, (err) => {
                    if (err) {
                        console.error(err);
                        // 途中で失敗したときは、書きかけの変更を取り消す
                        return db.query('ROLLBACK', () => res.status(500).send('データの更新に失敗しました。'));
                    }
                    res.json(names);
                });
            });
        });
    })
});

module.exports = router;
