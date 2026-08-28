
// const { google } = require("googleapis");
// const fs = require("fs");
// const path = require("path");

// // ==========================================
// // LOCAL FILE PATHS
// // ==========================================

// const localOauthPath = path.resolve(
//     __dirname,
//     "../../credentials/oauth-client.json"
// );

// const localTokenPath = path.resolve(
//     __dirname,
//     "../../credentials/token.json"
// );

// // ==========================================
// // RENDER SECRET FILE PATHS
// // ==========================================

// const oauthPath =
//     process.env.GOOGLE_OAUTH_CLIENT_FILE || localOauthPath;

// const tokenPath =
//     process.env.GOOGLE_TOKEN_FILE || localTokenPath;

// console.log("🔐 Google OAuth client path:", oauthPath);
// console.log("🔐 Google token path:", tokenPath);

// // ==========================================
// // LOAD OAUTH CLIENT
// // ==========================================

// if (!fs.existsSync(oauthPath)) {
//     throw new Error(
//         `Google OAuth client file not found: ${oauthPath}`
//     );
// }

// const oauthCredentials = JSON.parse(
//     fs.readFileSync(oauthPath, "utf8")
// );

// const {
//     client_id,
//     client_secret,
//     redirect_uris,
// } = oauthCredentials.web;

// const oauth2Client = new google.auth.OAuth2(
//     client_id,
//     client_secret,
//     redirect_uris[0]
// );

// // ==========================================
// // LOAD TOKEN
// // ==========================================

// if (fs.existsSync(tokenPath)) {

//     const tokens = JSON.parse(
//         fs.readFileSync(tokenPath, "utf8")
//     );

//     oauth2Client.setCredentials(tokens);

//     console.log("✅ Google OAuth token loaded");

// } else {

//     console.log(
//         "⚠️ Google token file not found:",
//         tokenPath
//     );
// }

// // ==========================================
// // TOKEN REFRESH
// // ==========================================

// oauth2Client.on("tokens", (tokens) => {

//     console.log("✅ Google OAuth token refreshed");

//     // Don't modify Render Secret Files
//     if (process.env.RENDER) {
//         return;
//     }

//     let existingTokens = {};

//     if (fs.existsSync(tokenPath)) {
//         existingTokens = JSON.parse(
//             fs.readFileSync(tokenPath, "utf8")
//         );
//     }

//     const updatedTokens = {
//         ...existingTokens,
//         ...tokens,
//     };

//     fs.writeFileSync(
//         tokenPath,
//         JSON.stringify(updatedTokens, null, 2)
//     );

//     console.log("✅ Google OAuth token updated locally");
// });

// // ==========================================
// // GOOGLE DOCS
// // ==========================================

// const docs = google.docs({
//     version: "v1",
//     auth: oauth2Client,
// });

// // ==========================================
// // GOOGLE DRIVE
// // ==========================================

// const drive = google.drive({
//     version: "v3",
//     auth: oauth2Client,
// });

// // ==========================================
// // GMAIL
// // ==========================================

// const gmail = google.gmail({
//     version: "v1",
//     auth: oauth2Client,
// });

// // ==========================================
// // EXPORT
// // ==========================================

// module.exports = {
//     oauth2Client,
//     docs,
//     drive,
//     gmail,
// };


const { google } = require("googleapis");

/**
 * LMAR QUOTATION SYSTEM
 * Google OAuth Configuration
 *
 * Works:
 * - Local development
 * - Vercel
 *
 * Credentials are loaded from:
 * GOOGLE_OAUTH_CLIENT_JSON
 * GOOGLE_TOKEN_JSON
 */

// ==========================================
// LOAD OAUTH CLIENT JSON
// ==========================================

if (!process.env.GOOGLE_OAUTH_CLIENT_JSON) {
    throw new Error(
        "GOOGLE_OAUTH_CLIENT_JSON environment variable is missing."
    );
}

let oauthCredentials;

try {
    oauthCredentials = JSON.parse(
        process.env.GOOGLE_OAUTH_CLIENT_JSON
    );
} catch (error) {
    throw new Error(
        "GOOGLE_OAUTH_CLIENT_JSON contains invalid JSON."
    );
}

// ==========================================
// GET WEB CREDENTIALS
// ==========================================

const webCredentials =
    oauthCredentials.web ||
    oauthCredentials.installed;

if (!webCredentials) {
    throw new Error(
        "Google OAuth credentials must contain 'web' or 'installed'."
    );
}

const {
    client_id,
    client_secret,
    redirect_uris = []
} = webCredentials;

if (!client_id) {
    throw new Error("Google OAuth client_id is missing.");
}

if (!client_secret) {
    throw new Error("Google OAuth client_secret is missing.");
}

// ==========================================
// REDIRECT URI
// ==========================================

const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    redirect_uris[0] ||
    "http://localhost:3000/oauth2callback";

// ==========================================
// CREATE OAUTH CLIENT
// ==========================================

const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirectUri
);

// ==========================================
// LOAD TOKEN
// ==========================================

if (process.env.GOOGLE_TOKEN_JSON) {

    try {

        const tokens = JSON.parse(
            process.env.GOOGLE_TOKEN_JSON
        );

        oauth2Client.setCredentials(tokens);

        console.log("✅ Google OAuth token loaded");

    } catch (error) {

        throw new Error(
            "GOOGLE_TOKEN_JSON contains invalid JSON."
        );

    }

} else {

    console.warn(
        "⚠️ GOOGLE_TOKEN_JSON is not configured."
    );

}

// ==========================================
// TOKEN REFRESH
// ==========================================

oauth2Client.on("tokens", (tokens) => {

    console.log("✅ Google OAuth token refreshed");

    /*
     * IMPORTANT:
     *
     * Do NOT try to write token.json on Vercel.
     *
     * Vercel filesystem is not persistent.
     *
     * googleapis will continue using the
     * refresh token already loaded above.
     */

});

// ==========================================
// GOOGLE DOCS
// ==========================================

const docs = google.docs({
    version: "v1",
    auth: oauth2Client
});

// ==========================================
// GOOGLE DRIVE
// ==========================================

const drive = google.drive({
    version: "v3",
    auth: oauth2Client
});

// ==========================================
// GMAIL
// ==========================================

const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client
});

// ==========================================
// EXPORT
// ==========================================

module.exports = {
    oauth2Client,
    docs,
    drive,
    gmail
};