const fs = require("fs");
const path = require("path");

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
 */
function generateQuotationId() {
    try {
        const dir = path.dirname(counterFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const todayStr = getFormattedDatePrefix(new Date());

        let state = {
            date: todayStr,
            counter: 0
        };

        if (fs.existsSync(counterFilePath)) {
            try {
                const raw = fs.readFileSync(counterFilePath, "utf8");
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === "object" && parsed.date && typeof parsed.counter === "number") {
                    state = parsed;
                }
            } catch (e) {
                console.error("⚠️ Warning: could not parse quotationCounter.json, resetting counter.", e.message);
            }
        }

        if (state.date !== todayStr) {
            state.date = todayStr;
            state.counter = 1;
        } else {
            state.counter = (Number(state.counter) || 0) + 1;
        }

        fs.writeFileSync(counterFilePath, JSON.stringify(state, null, 2), "utf8");

        const sequenceStr = String(state.counter).padStart(3, "0");
        const quotationId = `LMAR-${todayStr}-${sequenceStr}`;

        console.log(`✅ Generated Quotation ID: ${quotationId}`);
        return quotationId;

    } catch (error) {
        console.error("❌ Error generating Quotation ID:", error.message);
        const todayStr = getFormattedDatePrefix(new Date());
        return `LMAR-${todayStr}-001`;
    }
}

module.exports = {
    generateQuotationId,
    getFormattedDatePrefix
};
