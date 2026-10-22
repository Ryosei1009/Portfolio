const express = require('express');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

// 工具管理システム（https://api.shinoryo.com/tool/）
// 下の allowedOrigins のチェックより前に置く（許可外のオリジンだと応答が止まるため）
app.use('/tool', require('./tool_management/backend/router'));

app.use(`/images`, express.static(`images`));

// KEY_PATH / CERT_PATH が無いとき（ローカル確認用）は HTTP で起動する
const server = process.env.KEY_PATH && process.env.CERT_PATH
  ? require('https').createServer({
    key: fs.readFileSync(process.env.KEY_PATH),
    cert: fs.readFileSync(process.env.CERT_PATH),
  }, app)
  : require('http').createServer(app)

const allowedOrigins = ['http://localhost:3000', 'https://www.shinoryo.com'];

// 許可していないオリジンのページからのリクエストには 403 を返す（何も返さずに止めない）
// Origin の無いリクエスト（<img> での画像の読み込みや、サーバー間の通信など）はそのまま通す
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).send('許可されていないオリジンです。');
  }
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// パスワードやトークンはログに残さない
const SECRET_HEADERS = ['authorization', 'password', 'cookie', 'set-cookie'];
const maskHeaders = (headers) => Object.fromEntries(
  Object.entries(headers).map(([key, value]) => [key, SECRET_HEADERS.includes(key.toLowerCase()) ? '[省略]' : value])
);

app.use((req, res, next) => {
  const dateTime = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  const shortLogFilePath = 'logs/short-log.txt';
  const logFilePath = 'logs/detailed-log.txt';

  const originalSend = res.send;

  res.send = function (body) {
    const logMessage = `
[${dateTime}]
  Request Details:
  Method: ${req.method}
  URL: ${req.originalUrl}
  Headers: ${JSON.stringify(maskHeaders(req.headers))}
  Query Parameters: ${JSON.stringify(req.query)}
  Body: ${JSON.stringify(req.body)}
  Remote Address: ${req.ip}
  User Agent: ${req.get('User-Agent')}

  Response:
  Status: ${res.statusCode}
  Headers: ${JSON.stringify(maskHeaders(res.getHeaders()))}
  Body: ${req.originalUrl.startsWith('/auth/') ? '[省略]' : body}
---------------------------------------------
`;
    const shortLogMessage = `[${dateTime}] ${req.method} ${req.originalUrl} [${req.ip}]`;
    console.log(shortLogMessage);
    fs.appendFile(shortLogFilePath, `${shortLogMessage}\n`, (err) => {
      if (err) console.error('ログの書き込みエラー (short):', err);
    });
    fs.appendFile(logFilePath, logMessage, (err) => {
      if (err) console.error('ログの書き込みエラー (detailed):', err);
    });
    return originalSend.call(this, body);
  };
  next();
});

const aboutMeRouter = require('./routes/AboutMe');
app.use('/aboutme/', aboutMeRouter);

const worksRouter = require('./routes/Works');
app.use('/works/', worksRouter);

const settingsRouter = require('./routes/Settings');
app.use('/settings/', settingsRouter);

const achievementsRouter = require('./routes/Achievements');
app.use('/achievements/', achievementsRouter);

const categoriesRouter = require('./routes/Categories');
app.use('/categories/', categoriesRouter);

app.post('/auth/check', (req, res) => {
  const token = req.headers['authorization'];

  jwt.verify(token, JWT_SECRET, (err) => {
    if (err) return res.status(401).send('無許可');

    res.send('ok');
  });
});

app.post('/auth/create', (req, res) => {
  const password = req.headers['password'];
  if (password !== process.env.PASSWORD) return res.status(401).send('無許可');

  // 漏れても使い続けられないよう、トークンに有効期限を付ける
  res.json({ token: jwt.sign({ id: 1 }, JWT_SECRET, { expiresIn: '30d' }) });
});

// 起動時に DB へつながるか確かめる。つながらなくてもサーバーは落とさない（DB が戻れば、次のリクエストでつなぎ直す）
const { db } = require('./db');
db.query('SELECT 1', (err) => {
  if (err) return console.error('MySQL に接続できませんでした。DB が使えるようになれば自動でつなぎ直します:', err.message);
  console.log('Connected to MySQL');
});

server.listen(PORT, () => {
  console.log(`Server running`);
});
