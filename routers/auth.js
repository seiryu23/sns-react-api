// require
const router = require("express").Router();
const bcrypt = require("bcrypt");
const generateIdenticon = require("../utils/generateIdenticon");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

// object
const prisma = new PrismaClient();

// 新規ユーザ登録API
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    const defaultIconImage = generateIdenticon(email);

    // ハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            username,
            email,
            password: hashedPassword,
            profile: {
                create: {
                    bio: "はじめまして",
                    profileImageUrl: defaultIconImage,
                },
            },
        },
    });
    return res.json({ user });
});

// ユーザログインAPI
router.post("/login", async (req,res) => {
    const { email, password } = req.body;

    // 検索
    const user = await prisma.user.findUnique({ where: {email} });

    // ユーザ取得チェック
    if(!user) {
        return res
            .status(401)
            .json({ error: "メールアドレスかパスワードが間違っています。" })
    }

    // パスワードチェック
    const isPasswordVaild = await bcrypt.compare(password, user.password);
    if(!isPasswordVaild) {
        return res
            .status(401)
            .json({ error: "パスワードが間違っています。" });
    }

    // トークン発行
    const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
        expiresIn: "1d",
    });

    return res.json({ token });
});

module.exports = router;