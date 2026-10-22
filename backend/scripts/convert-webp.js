// 既にある JPEG 画像から、同じ場所・同じ名前の WebP を作る（アップロード時に作る WebP と同じ設定）
// 使い方（backend で実行）:
//   node scripts/convert-webp.js            … images/ の下の .jpg / .jpeg をすべて変換する
//   node scripts/convert-webp.js --dry-run  … 変換せずに、変換する予定のファイルだけを表示する
//   node scripts/convert-webp.js <フォルダ> … 別のフォルダを変換する（確認用）
// WebP が既にある画像は飛ばすので、何度実行してもよい
const fs = require('fs');
const path = require('path');

let sharp;
try {
    sharp = require('sharp');
} catch (error) {
    console.error(`sharp を読み込めませんでした（Node.js 20.9 以上が必要です。今は ${process.version}）:`, error.message);
    process.exit(1);
}
const { webpPath } = require('../utils/imageUpload');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const root = path.resolve(args.find((arg) => !arg.startsWith('--')) ?? path.join(__dirname, '..', 'images'));

// フォルダの下の JPEG をすべて探す
const findJpegs = async (dir) => {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    const nested = await Promise.all(entries.map((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return findJpegs(full);
        return /\.jpe?g$/i.test(entry.name) ? [full] : [];
    }));
    return nested.flat();
};

const exists = (file) => fs.promises.access(file).then(() => true, () => false);

const main = async () => {
    if (!(await exists(root))) {
        console.error(`フォルダが見つかりません: ${root}`);
        process.exit(1);
    }
    const jpegs = await findJpegs(root);
    let converted = 0;
    let skipped = 0;
    const failed = [];

    for (const jpeg of jpegs) {
        const webp = webpPath(jpeg);
        if (await exists(webp)) {
            skipped++;
            continue;
        }
        const label = path.relative(root, jpeg);
        if (dryRun) {
            console.log(`変換する予定: ${label}`);
            converted++;
            continue;
        }
        try {
            // 途中のファイルが見えないように、.tmp に書いてから名前を変える
            await sharp(jpeg).webp({ quality: 80 }).toFile(`${webp}.tmp`);
            await fs.promises.rename(`${webp}.tmp`, webp);
            console.log(`変換しました: ${label}`);
            converted++;
        } catch (error) {
            await fs.promises.rm(`${webp}.tmp`, { force: true });
            console.error(`変換できませんでした: ${label}（${error.message}）`);
            failed.push(label);
        }
    }

    console.log(`\n${dryRun ? '変換する予定' : '変換'}: ${converted}件 / WebP が既にあるので飛ばした: ${skipped}件 / 失敗: ${failed.length}件（${root}）`);
    if (failed.length > 0) process.exit(1);
};

main();
