const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

router.get('/get', (req, res) => {
    db.query(
        'SELECT * FROM works',
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('データの取得に失敗しました。');
            }
            res.json(results);
        }
    );
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