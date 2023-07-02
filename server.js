// require
const authRoute = require("./routers/auth");
const cors = require("cors");
const express = require("express");
const postsRoute = require("./routers/posts");
const usersRoute = require("./routers/user");
require("dotenv").config();

// object
const app = express();

// define
const PORT = 5000;

// setting
app.use(cors());
app.use(express.json());                // json形式
app.use("/api/auth", authRoute);        // 認証APIモジュール
app.use("/api/posts", postsRoute);      // 投稿APIモジュール
app.use("/api/user", usersRoute);      // ユーザ情報APIモジュール

app.listen(PORT, () => console.log(` Server is running on ${PORT} `));