const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require("../config");

router.get("/", async (req, res) => {
    const { email } = req.query;

    if (!email) {
        res.status(400).json({
            response: 400,
            data: {
                message: "Email is required",
            },
        });
        return;
    }

    if (!email.includes("@ap.be") && !email.includes("@student.ap.be")) {
        res.status(400).json({
            response: 400,
            data: {
                message: "This email is not allowed",
            },
        });
        return;
    }

    try {
        const token = jwt.sign({ email: email }, JWT_SECRET);

        res.json({ token });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            response: 500,
            data: {
                message: "Failed to generate token",
            },
        });
    }
});

module.exports = router;
