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

router.post('/update', (req, res) => {
    const token = req.headers['authorization'];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).send('無許可');
        const { name, sub_name, introduction, history, skill, mail, github_url, github_name, image } = req.body;
        
        db.query(
            'UPDATE about_me SET name = ?, sub_name = ?, introduction = ?, history = ?, skill = ?, mail = ?, github_url = ?, github_name = ?, image = ? where id = 1',
            [name, sub_name, introduction, history, skill, mail, github_url, github_name, image],
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