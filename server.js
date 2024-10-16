// server.js

const express = require("express");
const bodyParser = require("body-parser");
const { Client } = require("pg");
dotenv = require("dotenv").config();

const app = express();
const port = 3000;

// PostgreSQL 클라이언트 설정
const client = new Client({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
});

// PostgreSQL 연결
client
  .connect()
  .then(() => {
    console.log("PostgreSQL에 성공적으로 연결되었습니다.");

    // users 테이블의 내용 조회
    return client.query("SELECT * FROM users");
  })
  .then((result) => {
    console.log("users 테이블 내용:", result.rows);
  })
  .catch((err) => {
    console.error("PostgreSQL 연결 오류:", err);
  });

// 미들웨어 설정
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public")); // HTML 파일을 제공하기 위한 폴더


app.get("/injection", (req, res) => {
    res.sendFile(__dirname + '/public/index.html'); // index.html 파일 제공
});



// 로그인 처리
app.post("/injection/login", async (req, res) => {
  const { username, password } = req.body;

  // SQL 쿼리 (SQL 인젝션 취약점 포함)
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  try {
    const result = await client.query(query);
    if (result.rows.length > 0) {
      // 로그인 성공: 사용자 정보를 출력
      //const user = result.rows; // 첫 번째 사용자 정보
      console.log(result.rows);
      res.send(`로그인 성공! 사용자 정보: <br> 결과: ${JSON.stringify(result.rows)}`);
    } else {
      res.send("로그인 실패: 사용자 이름 또는 비밀번호가 잘못되었습니다.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("서버 오류");
  }
});

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
