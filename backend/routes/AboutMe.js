const express = require('express');
const router = express.Router();
const { db } = require('../db');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { receiveImage, writeJpegs } = require('../utils/imageUpload');
const JWT_SECRET = process.env.JWT_SECRET;

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

// プロフィール写真を差し替える。正方形（中央で切り抜き）にして保存し、画像の URL を返す
// DB の image は、画面側の自動保存でこの URL に書き換える（編集中のほかの項目と一緒に保存されるように）
router.post('/update_image', (req, res) => {
    const token = req.headers['authorization'];
    jwt.verify(token, JWT_SECRET, (err) => {
        if (err) return res.status(401).send('無許可');

        receiveImage(req, res, async () => {
            try {
                const dir = path.join('images', 'aboutme');
                await fs.promises.mkdir(dir, { recursive: true });
                await writeJpegs(req.file.buffer, [
                    { file: path.join(dir, 'profile.jpg'), resize: { width: 800, height: 800, fit: 'cover' } },
                ]);
                const base = process.env.PUBLIC_API_URL || `${req.protocol}://${req.get('host')}`;
                res.json({ image: `${base}/images/aboutme/profile.jpg?v=${Date.now()}` });
            } catch (error) {
                console.error(error);
                res.status(400).send('画像を変換できませんでした。別の画像でお試しください。');
            }
        });
    })
});

module.exports = router;