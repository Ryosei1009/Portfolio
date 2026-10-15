const multer = require('multer');
const fs = require('fs');

// 管理者がアップロードした画像を受け取り、JPEG に変換して保存する（作品画像・プロフィール写真で共通）

// sharp は Node.js 20.9 以上が必要。読み込めなくてもサーバー自体は起動させ、画像のアップロードだけを止める
let sharp = null;
try {
    sharp = require('sharp');
} catch (error) {
    console.error(`画像の変換に使う sharp を読み込めませんでした。画像のアップロードは使えません（Node.js ${process.version}）:`, error.message);
}

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)),
}).single('image');

// フォームの image を受け取る。受け取れなければ理由を返して終える
const receiveImage = (req, res, next) => {
    if (!sharp) {
        return res.status(503).send('サーバーの Node.js が古いため、画像のアップロードは使えません（Node.js 20.9 以上が必要です）。');
    }
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).send(err.code === 'LIMIT_FILE_SIZE' ? '画像は10MBまでにしてください。' : '画像を受け取れませんでした。');
        }
        if (!req.file) return res.status(400).send('JPEG・PNG・WebP の画像を選んでください。');
        next();
    });
};

// outputs: [{ file: 保存先, resize: sharp の resize の指定 }]
// すべて作れてから差し替えるので、途中で失敗しても元の画像が中途半端に残らない
const writeJpegs = async (buffer, outputs) => {
    const image = sharp(buffer).rotate();
    try {
        await Promise.all(outputs.map(({ file, resize }) => (
            image.clone()
                .resize(resize)
                .jpeg({ quality: 82, mozjpeg: true })
                .toFile(`${file}.tmp`)
        )));
    } catch (error) {
        // 作りかけのファイルは消しておく
        await Promise.all(outputs.map(({ file }) => fs.promises.rm(`${file}.tmp`, { force: true })));
        throw error;
    }
    await Promise.all(outputs.map(({ file }) => fs.promises.rename(`${file}.tmp`, file)));
};

module.exports = { receiveImage, writeJpegs };
