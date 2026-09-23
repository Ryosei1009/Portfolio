const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(`/images`, express.static(`images`));

const server = require('https').createServer({
  key: fs.readFileSync(process.env.KEY_PATH),
  cert: fs.readFileSync(process.env.CERT_PATH),
}, app)

const allowedOrigins = ['http://localhost:3000', 'https://www.shinoryo.com'];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  }
});

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
  Headers: ${JSON.stringify(req.headers)}
  Query Parameters: ${JSON.stringify(req.query)}
  Body: ${JSON.stringify(req.body)}
  Remote Address: ${req.ip}
  User Agent: ${req.get('User-Agent')}

  Response:
  Status: ${res.statusCode}
  Headers: ${JSON.stringify(res.getHeaders())}
  Body: ${body}
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

app.post('/auth/check', (req, res) => {
  const token = req.headers['authorization'];

  jwt.verify(token, JWT_SECRET, (err) => {
    if (err) return res.status(401).send('無許可');

    res.send('ok');
  });
});

app.post('/auth/create', (req, res) => {
  const password = req.headers['password'];
  console.log(password);
  console.log(process.env.PASSWORD)
  if (password !== process.env.PASSWORD) return res.status(401).send('無許可');

  res.json({ token: jwt.sign({ id: 1 }, JWT_SECRET) });
});

const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

server.listen(PORT, () => {
  console.log(`Server running`);
});
