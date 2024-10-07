const express = require("express");
const router = express.Router();
const { encrypt, decrypt } = require("../encryption");

router.get("/verify", async (req, res) => {
    const { apiKey } = req.query;

    if (!apiKey) {
        res.status(400).json({
            response: 400,
            data: {
                message: "API Key is required",
            },
        });
        return;
    }

    try {
        const decryptedEmail = decrypt(apiKey);
        res.json({ decryptedEmail });
    } catch (error) {
        console.error("Decryption error:", error);
        res.status(500).json({
            response: 500,
            data: {
                message: "Failed to decrypt API Key",
            },
        });
    }
});


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

    try {
        const apiKey = encrypt(email);
        res.json({ apiKey });
    } catch (error) {
        console.error("Encryption error:", error);
        res.status(500).json({
            response: 500,
            data: {
                message: "Failed to encrypt email",
            },
        });
    }
});

module.exports = router;
