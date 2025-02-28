const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

router.get('/get', (req, res) => {
    db.query(
        'SELECT * FROM about_me',
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('データの取得に失敗しました。');
            }
            res.json(results);
        }
    );
});

module.exports = router;