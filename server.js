const express = require("express");
const bodyParser = require("body-parser");
const webpush = require("web-push");
const mysql = require("mysql2/promise");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// ---------------- CSP 헤더 추가 ----------------
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  );
  next();
});

// 클라이언트가 공개 키 요청 시 전달
app.get("/vapidPublicKey", (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

// VAPID 키 JSON 불러오기
const vapidKeys = JSON.parse(fs.readFileSync("./vapid.json", "utf8"));

// VAPID 설정
webpush.setVapidDetails(
  vapidKeys.contact,      // mailto: 주소
  vapidKeys.publicKey,    // 공개 키
  vapidKeys.privateKey    // 비밀 키
);

// ---------------- MySQL 연결 ----------------
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "smartbroker",
  waitForConnections: true,
  connectionLimit: 10
});

// ---------------- 구독 등록 ----------------
// app.post("/subscribe", async (req, res) => {
//   try {
//     const { endpoint, keys } = req.body;
//     await pool.query("DELETE FROM subscriptions WHERE endpoint = ?", [endpoint]);
//     await pool.query(
//       "INSERT INTO subscriptions (endpoint, p256dh, auth) VALUES (?, ?, ?)",
//       [endpoint, keys.p256dh, keys.auth]
//     );
//     res.status(201).json({ message: "구독 등록 완료" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "DB 저장 실패" });
//   }
// });
app.post("/subscribe", async (req, res) => {
  try {
    const { endpoint, keys } = req.body;

    // endpoint 컬럼에 UNIQUE 걸려 있어야 함
    await pool.query(`
      INSERT INTO subscriptions (endpoint, p256dh, auth)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE p256dh = VALUES(p256dh), auth = VALUES(auth)
    `, [endpoint, keys.p256dh, keys.auth]);

    res.status(201).json({ message: "구독 등록/업데이트 완료" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB 저장 실패" });
  }
});



// ---------------- Helper: 파일 → data URI ----------------
function toDataURI(filePath) {
  if (!fs.existsSync(filePath)) return undefined;
  const ext = path.extname(filePath).slice(1);
  const data = fs.readFileSync(filePath).toString("base64");
  return `data:image/${ext};base64,${data}`;
}

// ---------------- 웹푸시 발송 ----------------
app.post("/send", async (req, res) => {
  try {
    const { title, body } = req.body;
    const [rows] = await pool.query("SELECT * FROM subscriptions");

    const payload = JSON.stringify({
      title,
      body,
      icon: "/icon.jpg",
      badge: "/badge.png",
      image: "/icon2.png",
      url: "/",
      uuid: crypto.randomUUID(),
      timestamp: Date.now()
    });

    const sendPromises = rows.map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      ).catch(err => console.error("푸시 실패:", err))
    );

    await Promise.all(sendPromises);
    res.json({ status: "ok", sent: rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "푸시 발송 실패" });
  }
});

app.listen(4000, () => console.log("Server running on port 4000"));