import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql2";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";

const port = 5000;

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());
app.use(bodyParser.json()); // parse requests
app.use(cookieParser());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      // httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // one week
    },
  })
);

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  // port: 3306,
  password: "root1234",
  database: "Signup",
});

app.get("/", (req, res) => {
  if (req.session.user) {
    return res.json({ valid: true, username: req.session.user });
  } else {
    return res.status(401).json({ valid: false });
  }
});

app.post("/signup", (req, res) => {
  const sql = "INSERT INTO users (name, email, password) VALUES (?)";
  const values = [req.body.name, req.body.email, req.body.password];
  db.query(sql, [values], (err, result) => {
    if (err) return res.json({ Message: "Error in server" });
    return res.json(result);
  });
});

app.post("/login", (req, res) => {
  const sql = "SELECT *FROM users  WHERE email=? AND password=?";
  // const values = [req.body.email, req.body.password];
  db.query(sql, [req.body.email, req.body.password], (err, result) => {
    if (err) return res.json("Error inside server");
    if (result.length > 0) {
      req.session.user = result[0].name;
      // console.log(req.session.user);
      return res.json({ Login: true });
    } else {
      return res.json({ Login: false });
    }
  });
});
app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
  console.log(`http://localhost:${port}`);
});
