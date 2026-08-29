const fs = require("fs");
const path = require("path");
const { drive } = require("../config/google");

const counterFilePath = path.resolve(__dirname, "../data/quotationCounter.json");

/**
 * Returns YYMMDD string for a date in IST (Asia/Kolkata) timezone
 */
function getFormattedDatePrefix(dateObj = new Date()) {
    try {
        const formatter = new Intl.DateTimeFormat("en-IN", {
            timeZone: "Asia/Kolkata",
            year: "2-digit",
            month: "2-digit",
            day: "2-digit"
        });

        const parts = formatter.formatToParts(dateObj);
        const day = parts.find(p => p.type === "day").value;
        const month = parts.find(p => p.type === "month").value;
        const year = parts.find(p => p.type === "year").value;

        return `${year}${month}${day}`;
    } catch (e) {
        const year = String(dateObj.getFullYear()).slice(-2);
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        return `${year}${month}${day}`;
    }
}

/**
 * Generates next sequential Quotation ID in format: LMAR-YYMMDD-XXX
 * Sequence resets to 001 on a new date.
 * Checks both local storage and Google Drive to guarantee uniqueness across server restarts.
 */
async function generateQuotationId() {
    const todayStr = getFormattedDatePrefix(new Date());
    let maxDriveSeq = 0;

    // 1. Query Google Drive for highest sequence number created today
    try {
        if (drive && drive.files) {
            const folderId = process.env.GOOGLE_QUOTATION_PDF_FOLDER_ID;
            let q = `name contains 'LMAR-${todayStr}-' and trashed = false`;
            if (folderId) {
                q = `'${folderId}' in parents and ${q}`;
            }

            const res = await drive.files.list({
                q: q,
                fields: "files(name)",
                pageSize: 100
            });

            if (res.data && res.data.files) {
                for (const file of res.data.files) {
                    const match = file.name.match(/LMAR-\d{6}-(\d{3})/);
                    if (match && match[1]) {
                        const num = parseInt(match[1], 10);
                        if (num > maxDriveSeq) {
                            maxDriveSeq = num;
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.warn("⚠️ Warning: could not check Google Drive for highest sequence:", err.message);
    }

    // 2. Read local file counter
    let localCounter = 0;
    try {
        const dir = path.dirname(counterFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        if (fs.existsSync(counterFilePath)) {
            const raw = fs.readFileSync(counterFilePath, "utf8");
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === "object" && parsed.date === todayStr && typeof parsed.counter === "number") {
                localCounter = parsed.counter;
            }
        }
    } catch (e) {
        console.warn("⚠️ Could not read quotationCounter.json:", e.message);
    }

    // 3. Compute next sequence
    const nextSeq = Math.max(localCounter, maxDriveSeq) + 1;

    // 4. Save updated counter back to local disk
    try {
        fs.writeFileSync(counterFilePath, JSON.stringify({ date: todayStr, counter: nextSeq }, null, 2), "utf8");
    } catch (e) {
        console.warn("⚠️ Could not write quotationCounter.json:", e.message);
    }

    const sequenceStr = String(nextSeq).padStart(3, "0");
    const quotationId = `LMAR-${todayStr}-${sequenceStr}`;

    console.log(`✅ Generated Quotation ID: ${quotationId} (Drive Max: ${maxDriveSeq}, Local Prev: ${localCounter})`);
    return quotationId;
}

module.exports = {
    generateQuotationId,
    getFormattedDatePrefix
};
