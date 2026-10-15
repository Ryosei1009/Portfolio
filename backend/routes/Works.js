const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const JWT_SECRET = process.env.JWT_SECRET;

// アップロードされた作品画像は、メモリで受け取って変換してから保存する
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)),
});

// 1枚の画像から、原寸・一覧用（_mid）・サムネイル（_small）の3サイズを作る
const IMAGE_SIZES = [
    { suffix: '', width: 1920 },
    { suffix: '_mid', width: 500 },
    { suffix: '_small', width: 150 },
];

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

// 作品の画像（1〜5枚目）を差し替える。multipart/form-data で image・id・image_id を送る
router.post('/update_image', (req, res) => {
    const token = req.headers['authorization'];
    jwt.verify(token, JWT_SECRET, (err) => {
        if (err) return res.status(401).send('無許可');

        upload.single('image')(req, res, (uploadErr) => {
            if (uploadErr) {
                return res.status(400).send(uploadErr.code === 'LIMIT_FILE_SIZE' ? '画像は10MBまでにしてください。' : '画像を受け取れませんでした。');
            }
            if (!req.file) return res.status(400).send('JPEG・PNG・WebP の画像を選んでください。');

            const id = Number(req.body.id);
            const imageId = Number(req.body.image_id);
            if (!Number.isInteger(id) || !Number.isInteger(imageId) || imageId < 1 || imageId > 5) {
                return res.status(400).send('作品か画像の番号が正しくありません。');
            }

            db.query('SELECT id FROM works WHERE id = ?', [id], async (err, rows) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('画像の保存に失敗しました。');
                }
                if (rows.length === 0) return res.status(404).send('作品が見つかりません。');

                try {
                    const dir = path.join('images', 'works', String(id));
                    await fs.promises.mkdir(dir, { recursive: true });
                    const image = sharp(req.file.buffer).rotate();
                    // 3サイズとも作れてから差し替える（途中で失敗しても、元の画像が中途半端に残らない）
                    const files = await Promise.all(IMAGE_SIZES.map(async ({ suffix, width }) => {
                        const file = path.join(dir, `${imageId}${suffix}.jpg`);
                        await image.clone()
                            .resize({ width, withoutEnlargement: true })
                            .jpeg({ quality: 82, mozjpeg: true })
                            .toFile(`${file}.tmp`);
                        return file;
                    }));
                    await Promise.all(files.map((file) => fs.promises.rename(`${file}.tmp`, file)));
                    res.json({ id, image_id: imageId });
                } catch (error) {
                    console.error(error);
                    res.status(400).send('画像を変換できませんでした。別の画像でお試しください。');
                }
            });
        });
    })
});

// 作品を新しく作る（記事が書き終わるまで見えないよう、非公開で作る）
router.post('/create', (req, res) => {
    const token = req.headers['authorization'];
    jwt.verify(token, JWT_SECRET, (err) => {
        if (err) return res.status(401).send('無許可');
        const { name, each_name, category } = req.body;
        if (!name || !each_name || !category) return res.status(400).send('タイトルとカテゴリを入力してください。');

        db.query(
            `INSERT INTO works (name, each_name, url, url_name, purpose, outlook, category,
                device_1, device_2, device_3, device_4, device_5, sort_order, is_featured, highlight, is_published)
            SELECT ?, ?, 'none', '', '', '', ?, '', '', '', '', '', COALESCE(MAX(sort_order), 0) + 1, 0, NULL, 0 FROM works`,
            [name, each_name, category],
            (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('作品の作成に失敗しました。');
                }
                db.query('SELECT * FROM works WHERE id = ?', [results.insertId], (err, rows) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('作品の作成に失敗しました。');
                    }
                    res.json(rows[0]);
                });
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

// 作品の表示順をまとめて更新する（orders: [{ id, sort_order }, ...]）
router.post('/update/order', (req, res) => {
    const token = req.headers['authorization'];
    jwt.verify(token, JWT_SECRET, (err) => {
        if (err) return res.status(401).send('無許可');
        const orders = (Array.isArray(req.body.orders) ? req.body.orders : [])
            .map((order) => ({ id: Number(order.id), sort_order: Number(order.sort_order) }))
            .filter((order) => Number.isInteger(order.id) && Number.isInteger(order.sort_order));
        if (orders.length === 0) return res.status(400).send('並び順が指定されていません。');

        db.query(
            `UPDATE works SET sort_order = CASE id ${orders.map(() => 'WHEN ? THEN ?').join(' ')} END WHERE id IN (?)`,
            [...orders.flatMap((order) => [order.id, order.sort_order]), orders.map((order) => order.id)],
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