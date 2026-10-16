const mysql = require('mysql2');

// バックエンド全体で使う DB 接続（接続をいくつか用意して使い回すプール）
// 1本の接続だと、DB の再起動などで接続が切れたときに復帰できず、プロセスごと落ちていた
// プールは切れた接続を捨てて、次のリクエストで新しくつなぎ直す
const db = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    enableKeepAlive: true,
});

// 1つの接続の上でトランザクションを行う。work(conn) が失敗したら取り消す
// conn は mysql2/promise の接続（await conn.query(sql, params) で使う）
const withTransaction = async (work) => {
    const conn = await db.promise().getConnection();
    try {
        await conn.beginTransaction();
        const result = await work(conn);
        await conn.commit();
        return result;
    } catch (error) {
        await conn.rollback().catch(() => {});
        throw error;
    } finally {
        conn.release();
    }
};

module.exports = { db, withTransaction };
