const express = require("express");
const fs = require("fs");
const path = require("path");
const { oauth2Client } = require("../config/google");

const router = express.Router();

const SCOPES = [
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/drive",
];

const tokenPath = path.resolve(
    __dirname,
    "../../credentials/token.json"
);

// ==========================================
// START GOOGLE OAUTH
// ==========================================

router.get("/authorize", (req, res) => {

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: SCOPES,
    });

    res.redirect(authUrl);
});

// ==========================================
// GOOGLE OAUTH CALLBACK
// ==========================================

router.get("/callback", async (req, res) => {

    try {

        const { code } = req.query;

        if (!code) {
            return res
                .status(400)
                .send("Missing authorization code");
        }

        const { tokens } =
            await oauth2Client.getToken(code);

        oauth2Client.setCredentials(tokens);

        // ==========================================
        // SAVE TOKENS
        // ==========================================

        fs.writeFileSync(
            tokenPath,
            JSON.stringify(tokens, null, 2)
        );

        console.log("✅ Google OAuth tokens saved");

        res.send(`
            <h2>✅ Google Authorization Successful</h2>

            <p>
                LMAR Quotation Automation is now
                connected to Google Drive.
            </p>

            <p>
                Google OAuth token has been saved.
            </p>

            <p>
                You can close this window.
            </p>
        `);

    } catch (error) {

        console.error(
            "❌ OAuth callback failed:",
            error.response?.data ||
            error.message
        );

        res
            .status(500)
            .send("Google authorization failed");
    }

});

module.exports = router;