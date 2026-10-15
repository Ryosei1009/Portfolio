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

router.get('/get', (req, res) => {
    // 非公開の作品は、有効なトークンを持つ管理者にだけ返す
    const token = req.headers['authorization'];
    jwt.verify(token, JWT_SECRET, (authErr) => {
        const where = authErr ? 'WHERE is_published = 1 ' : '';
        db.query(
            `SELECT * FROM works ${where}ORDER BY is_featured DESC, sort_order, id`,
            (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('データの取得に失敗しました。');
                }
                res.json(results);
            }
        );
    });
});

router.post('/update/name', (req, res) => {
    const token = req.headers['authorization'];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).send('無許可');
        const { id, name } = req.body;
        
        db.query(
            'UPDATE works SET name = ? where id = ?',
            [name, id],
            (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('データの取得に失敗しました。');
                }
                res.json(results);
            }
        );
    })
});

// 作品カードの設定（カード用タイトル・カテゴリ・成果・代表作・公開）を更新する
router.post('/update/settings', (req, res) => {
    const token = req.headers['authorization'];
    jwt.verify(token, JWT_SECRET, (err) => {
        if (err) return res.status(401).send('無許可');
        const { id, name, category, highlight, is_featured, is_published } = req.body;

        db.query(
            'UPDATE works SET name = ?, category = ?, highlight = ?, is_featured = ?, is_published = ? WHERE id = ?',
            [name, category, highlight || null, Number(is_featured) === 1 ? 1 : 0, Number(is_published) === 0 ? 0 : 1, id],
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

router.post('/update', (req, res) => {
    const token = req.headers['authorization'];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).send('無許可');
        const { id, each_name, url, url_name, purpose, outlook, device_1, device_2, device_3, device_4, device_5 } = req.body;
        
        db.query(
            'UPDATE works SET each_name = ?, url = ?, url_name = ?, purpose = ?, outlook = ?, device_1 = ?, device_2 = ?, device_3 = ?, device_4 = ?, device_5 = ? where id = ?',
            [each_name, url, url_name, purpose, outlook, device_1, device_2, device_3, device_4, device_5, id],
            (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('データの取得に失敗しました。');
                }
                res.json(results);
            }
        );
    })
});

module.exports = router;