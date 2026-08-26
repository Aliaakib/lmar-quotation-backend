const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const oauthPath = path.resolve(
    __dirname,
    "../../credentials/oauth-client.json"
);

const tokenPath = path.resolve(
    __dirname,
    "../../credentials/token.json"
);

// Read OAuth client credentials
const oauthCredentials = JSON.parse(
    fs.readFileSync(oauthPath, "utf8")
);

const { client_id, client_secret, redirect_uris } =
    oauthCredentials.web;

const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
);

// Load saved token if available
if (fs.existsSync(tokenPath)) {
    const tokens = JSON.parse(
        fs.readFileSync(tokenPath, "utf8")
    );

    oauth2Client.setCredentials(tokens);
}

// Save token whenever Google refreshes it
oauth2Client.on("tokens", (tokens) => {
    let existingTokens = {};

    if (fs.existsSync(tokenPath)) {
        existingTokens = JSON.parse(
            fs.readFileSync(tokenPath, "utf8")
        );
    }

    const updatedTokens = {
        ...existingTokens,
        ...tokens,
    };

    fs.writeFileSync(
        tokenPath,
        JSON.stringify(updatedTokens, null, 2)
    );

    console.log("✅ Google OAuth token updated");
});

const docs = google.docs({
    version: "v1",
    auth: oauth2Client,
});

const drive = google.drive({
    version: "v3",
    auth: oauth2Client,
});

module.exports = {
    oauth2Client,
    docs,
    drive,
};