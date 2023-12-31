// require
const bcrypt = require("bcrypt");
const isAuthenticated = require("../middlewares/isAuthenticated");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const router = require("express").Router();
require("dotenv").config();

// object
const prisma = new PrismaClient();

// コメント投稿API
router.post("/post", isAuthenticated, async (req, res) => {
    const { content } = req.body;

    if(!content) {
        return res
            .status(400)
            .json({ message: "投稿内容がありません。" });
    }

    try {
        const newPost = await prisma.post.create({
            data: {
                content,
                authorId: req.userId,
            },
            include: {
                author: {
                    include: {
                        profile: true,
                    }
                },
            },
        });
        res.status(201).json(newPost);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "サーバーエラー発生" });
    }
});

// 投稿情報取得API
router.get("/get_latest_post", async (req,res) => {
    try {
        const latestPosts = await prisma.post.findMany({
// 2023.7.6 Add Start
            select: {
                id: true,
                content: true,
                createdAt: true,
                authorId: true,
                author: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        profile: true,
                    },
                },
            },
// 2023.7.6 Add End
            take: 10, orderBy: { createdAt: "desc" },
// 2023.7.6 Del Start
//            include: {
//                author: {
//                    include: {
//                        profile: true,
//                    }
//                },
//            }
// 2023.7.6 Del End
        });
        return res.json(latestPosts);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "サーバーエラー発生" });
    }
});

// 閲覧中ユーザの投稿内容のみ取得するAPI
router.get("/:userId", async(req, res) => {
    const { userId } = req.params;

    try {
        const userPosts = await prisma.post.findMany({
// 2023.7.6 Add Start
            select: {
                id: true,
                content: true,
                createdAt: true,
                authorId: true,
                author: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
// 2023.7.6 Add End
            where: {
                authorId: parseInt(userId),
            },
            orderBy: {
                createdAt: "desc",
            },
// 2023.7.6 Del Start
//            include: {
//                author: true,
//            },
// 2023.7.6 Del End
        });
        return res.status(200).json(userPosts);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "サーバーエラー発生" });
    }
});

module.exports = router;