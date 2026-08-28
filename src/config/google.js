
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
const fs = require("fs");
const path = require("path");

// ==========================================
// LOCAL FILE PATHS
// ==========================================

const localOauthPath = path.resolve(
    __dirname,
    "../../credentials/oauth-client.json"
);

const localTokenPath = path.resolve(
    __dirname,
    "../../credentials/token.json"
);

// ==========================================
// GOOGLE OAUTH FILE PATHS
// ==========================================

const oauthPath =
    process.env.GOOGLE_OAUTH_CLIENT_FILE ||
    localOauthPath;

const tokenPath =
    process.env.GOOGLE_TOKEN_FILE ||
    localTokenPath;

console.log("=================================");
console.log("GOOGLE AUTH CONFIG");
console.log("=================================");

console.log("Google OAuth client path:", oauthPath);
console.log("Google token path:", tokenPath);

// ==========================================
// LOAD OAUTH CLIENT
// ==========================================

if (!fs.existsSync(oauthPath)) {
    throw new Error(
        `Google OAuth client file not found: ${oauthPath}`
    );
}

const oauthCredentials = JSON.parse(
    fs.readFileSync(oauthPath, "utf8")
);

// ==========================================
// EXTRACT GOOGLE CREDENTIALS
// ==========================================

const credentials = oauthCredentials.web;

if (!credentials) {
    throw new Error(
        "Invalid Google OAuth JSON: 'web' credentials not found."
    );
}

const {
    client_id,
    client_secret,
    redirect_uris
} = credentials;

if (!client_id || !client_secret) {
    throw new Error(
        "Google OAuth client_id or client_secret is missing."
    );
}

if (
    !redirect_uris ||
    !Array.isArray(redirect_uris) ||
    !redirect_uris[0]
) {
    throw new Error(
        "Google OAuth redirect URI is missing."
    );
}

// ==========================================
// CREATE OAUTH CLIENT
// ==========================================

const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
);

// ==========================================
// LOAD TOKEN
// ==========================================

if (!fs.existsSync(tokenPath)) {
    throw new Error(
        `Google token file not found: ${tokenPath}`
    );
}

const tokens = JSON.parse(
    fs.readFileSync(tokenPath, "utf8")
);

oauth2Client.setCredentials(tokens);

console.log("✅ Google OAuth token loaded");

// ==========================================
// TOKEN REFRESH
// ==========================================

oauth2Client.on("tokens", (tokens) => {

    console.log("✅ Google OAuth token refreshed");

    // Render Secret Files are read-only
    if (process.env.RENDER) {
        return;
    }

    let existingTokens = {};

    if (fs.existsSync(tokenPath)) {
        existingTokens = JSON.parse(
            fs.readFileSync(tokenPath, "utf8")
        );
    }

    const updatedTokens = {
        ...existingTokens,
        ...tokens
    };

    fs.writeFileSync(
        tokenPath,
        JSON.stringify(updatedTokens, null, 2)
    );

    console.log("✅ Google OAuth token updated locally");
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