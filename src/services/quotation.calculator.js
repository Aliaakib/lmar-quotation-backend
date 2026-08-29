function calculateQuotation(data) {

    // ==========================================
    // 1. PANEL / SYSTEM DETAILS
    // ==========================================

    const panelWatt = 540;

    let panelCount = 0;

    const systemPhase = String(
        data.systemPhase || ""
    ).trim().toLowerCase();

    // ==========================================
    // INVERTER
    // ==========================================

    function getFormValueByKey(data, possibleKeys) {
        for (const key of possibleKeys) {
            if (
                data[key] !== undefined &&
                data[key] !== null &&
                String(data[key]).trim() !== ""
            ) {
                return String(data[key]).trim();
            }
        }

        return "";
    }

    const inverter = getFormValueByKey(data, [
        "inverter1Phase",
        "inverter3Phase",
        "inverter",
        "Inverter - 1 Phase",
        "Inverter - 3 Phase",
        "Inverter - 1 Phase *",
        "Inverter - 3 Phase *"
    ]);

    console.log("=================================");
    console.log("INVERTER DEBUG");
    console.log("=================================");
    console.log("All form keys:", Object.keys(data));
    console.log("Selected Inverter:", inverter);

    // ==========================================
    // PANEL COUNT - ROBUST FORM VALUE DETECTION
    // ==========================================

    function parseNumber(value) {
        if (
            value === undefined ||
            value === null ||
            String(value).trim() === ""
        ) {
            return 0;
        }

        const str = String(value).trim();

        // Ignore strings containing model/brand/wattage keywords
        if (/(?:watt|wattage|wp|\bw\b|sunfive|mono|perc|topcon|bifacial|brand|model|type|make|spec)/i.test(str)) {
            return 0;
        }

        const cleanStr = str.replace(/,/g, "");
        const parsed = Number(cleanStr);

        if (Number.isFinite(parsed) && parsed > 0 && parsed <= 300) {
            return parsed;
        }

        // Match numbers in strings like "10 Panels", "Qty: 12", "15 (nos)"
        const match = str.match(/(\d+)\s*(?:nos|panels|panel|pcs)?/i);
        if (match) {
            const extracted = Number(match[1]);
            if (Number.isFinite(extracted) && extracted > 0 && extracted <= 300) {
                return extracted;
            }
        }

        return 0;
    }

    const candidateKeys = [
        "numberOfPanels3Phase",
        "numberOfPanels1Phase",
        "panels3Phase",
        "panels1Phase",
        "panelCount",
        "Number of Panels - 3 Phase",
        "Number of Panels - 1 Phase",
        "Number of Panels",
        "No of Panels"
    ];

    for (const key of candidateKeys) {
        const val = parseNumber(data[key]);
        if (val > 0) {
            panelCount = val;
            break;
        }
    }

    if (panelCount <= 0 && data.rawFormValues && typeof data.rawFormValues === "object") {
        // 1. Search keys with panel/qty keywords
        for (const [rawKey, rawVal] of Object.entries(data.rawFormValues)) {
            const norm = rawKey.toLowerCase();
            const isTypeOrBrandKey = /(?:type|brand|model|watt|location|make|spec|inverter|invertor)/i.test(norm);
            if (isTypeOrBrandKey) continue;

            const isPanelKey = /(?:panel|qty|quantity)/i.test(norm);
            if (isPanelKey) {
                const valStr = Array.isArray(rawVal) ? rawVal[0] : rawVal;
                const val = parseNumber(valStr);
                if (val > 0) {
                    panelCount = val;
                    break;
                }
            }
        }

        // 2. Generic fallback across any field whose value parses to 1..300
        if (panelCount <= 0) {
            for (const [rawKey, rawVal] of Object.entries(data.rawFormValues)) {
                const norm = rawKey.toLowerCase();
                const isNonCountField = /(?:type|brand|model|watt|location|make|spec|inverter|invertor|structure|pincode|mobile|email|price|margin|gst|phase|discom|project|partner|subsidy|customer|dropdown)/i.test(norm);
                if (isNonCountField) continue;

                const valStr = Array.isArray(rawVal) ? rawVal[0] : rawVal;
                const val = parseNumber(valStr);
                if (val > 0) {
                    panelCount = val;
                    break;
                }
            }
        }
    }


    console.log("=================================");
    console.log("PANEL COUNT DEBUG");
    console.log("System Phase:", data.systemPhase);
    console.log("Panels 1 Phase:", data.panels1Phase);
    console.log("Panels 3 Phase:", data.panels3Phase);
    console.log("Panel Count:", data.panelCount);
    console.log("FINAL PANEL COUNT:", panelCount);
    console.log("=================================");


    if (!panelCount || panelCount <= 0) {

        throw new Error(
            "Number of panels is required. Received: " +
            JSON.stringify({
                systemPhase: data.systemPhase,
                panels1Phase: data.panels1Phase,
                panels3Phase: data.panels3Phase,
                panelCount: data.panelCount
            })
        );
    }

    // ==========================================
    // 2. SYSTEM CAPACITY
    // ==========================================

    const totalWatt =
        panelWatt * panelCount;

    const systemSize =
        totalWatt / 1000;


    // ==========================================
    // 3. LMAR COMPANY RATE
    // ==========================================

    const companyRatePerKW = 54000;


    // ==========================================
    // 4. FIXED DEALER MARGIN
    // ==========================================

    const fixedDealerMarginPerKW = 2000;


    // ==========================================
    // 5. ADDITIONAL AGENT INCREASE
    // ==========================================

    const rawAdditionalMargin =
        data.basePriceIncreasePerKW ??
        data.basePriceIncrease ??
        data.additionalMarginPerKW ??
        data["Increase in Base Price (₹ per kW)"] ??
        0;

    const additionalMarginPerKW =
        Number(
            String(rawAdditionalMargin)
                .replace(/₹/g, "")
                .replace(/,/g, "")
                .trim()
        ) || 0;

    console.log("=================================");
    console.log("ADDITIONAL MARGIN DEBUG");
    console.log("Raw additional margin:", rawAdditionalMargin);
    console.log("Parsed additionalMarginPerKW:", additionalMarginPerKW);
    console.log("=================================");


    // ==========================================
    // 6. AGENT RATE
    // ==========================================

    const agentRatePerKW =
        companyRatePerKW +
        additionalMarginPerKW;


    // ==========================================
    // 7. SELECTED RATE
    // ==========================================

    const rateType = String(
        data.rateType ||
        data.quotationRateType ||
        "agent"
    ).trim().toLowerCase();

    const ratePerKW =
        rateType === "company"
            ? companyRatePerKW
            : agentRatePerKW;


    // ==========================================
    // 8. PROJECT VALUE
    // ==========================================

    const projectValue =
        systemSize * ratePerKW;


    // ==========================================
    // 9. DISCOUNT (form se aayega, hardcoded nahi)
    // ==========================================

    let rawDiscountAmount = getFormValueByKey(data, [
        "discountAmount",
        "discount",
        "Discount Amount",
        "Discount Amount (₹)",
        "Discount (₹)",
        "Discount",
        "discount_amount"
    ]);

    if (!rawDiscountAmount) {
        const matchingKey = Object.keys(data).find(k =>
            k.toLowerCase().includes("discount")
        );
        if (matchingKey && data[matchingKey] !== undefined && data[matchingKey] !== null) {
            rawDiscountAmount = String(data[matchingKey]).trim();
        }
    }

    let discountAmount = 0;

    if (rawDiscountAmount !== "" && rawDiscountAmount !== null && rawDiscountAmount !== undefined) {
        const parsedDiscount = Number(
            String(rawDiscountAmount)
                .replace(/₹/g, "")
                .replace(/,/g, "")
                .trim()
        );

        if (Number.isFinite(parsedDiscount) && parsedDiscount >= 0) {
            discountAmount = parsedDiscount;
        }
    }

    const discountPercentage =
        projectValue > 0
            ? (discountAmount / projectValue) * 100
            : 0;

    const basicPriceAfterDiscount =
        projectValue -
        discountAmount;

    console.log("=================================");
    console.log("DISCOUNT DEBUG");
    console.log("Raw Discount Input:", rawDiscountAmount);
    console.log("Calculated discountAmount:", discountAmount);
    console.log("discountPercentage:", discountPercentage);
    console.log("basicPriceAfterDiscount:", basicPriceAfterDiscount);
    console.log("=================================");
    // ==========================================
    // 10. GST
    // ==========================================

    const rawGstPercentage = getFormValueByKey(data, [
        "gstPercentage",
        "gstPercent",
        "gstRate",
        "GST (%) Percentage",
        "GST (%)",
        "GST %",
        "GST Percentage",
        "GST",
        "Enter GST % percentage"
    ]);

    let gstPercentage = 5;

    if (
        rawGstPercentage !== "" &&
        rawGstPercentage !== null &&
        rawGstPercentage !== undefined
    ) {

        const parsedGST = Number(
            String(rawGstPercentage)
                .replace(/%/g, "")
                .replace(/,/g, "")
                .trim()
        );

        if (
            Number.isFinite(parsedGST) &&
            parsedGST >= 0
        ) {
            gstPercentage = parsedGST;
        }
    }


    const gstAmount =
        basicPriceAfterDiscount *
        (gstPercentage / 100);

    const finalAmount =
        basicPriceAfterDiscount +
        gstAmount;


    console.log("=================================");
    console.log("GST DEBUG");
    console.log("Raw GST:", rawGstPercentage);
    console.log("GST %:", gstPercentage);
    console.log("GST Amount:", gstAmount);
    console.log("Final Amount:", finalAmount);
    console.log("=================================");

    // ==========================================
    // 11. SUBSIDY
    // ==========================================

    const subsidyTypeRaw = String(
        data.subsidyType ?? ""
    ).trim();

    const subsidyType = subsidyTypeRaw
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    let subsidyAmount = 0;

    switch (subsidyType) {

        case "residential":
            // Residential = ₹78,000
            subsidyAmount = 78000;
            break;

        case "commercial":
            // Commercial = ₹0
            subsidyAmount = 0;
            break;

        case "no":
            // No subsidy = ₹0
            subsidyAmount = 0;
            break;

        default:
            // Unknown / empty = ₹0
            subsidyAmount = 0;
            break;
    }

    console.log("=================================");
    console.log("SUBSIDY DEBUG - NODE.JS");
    console.log("=================================");
    console.log("Received subsidyType:", data.subsidyType);
    console.log("Normalized subsidyType:", subsidyType);
    console.log("Calculated subsidyAmount:", subsidyAmount);
    // ==========================================
    // 12. CUSTOMER PAYABLE
    // ==========================================

    const customerPayable =
        finalAmount -
        subsidyAmount;


    // ==========================================
    // 13. DEALER COMMISSION
    // ==========================================

    const fixedDealerMargin =
        systemSize *
        fixedDealerMarginPerKW;

    const additionalDealerMargin =
        systemSize *
        additionalMarginPerKW;

    const totalDealerMargin =
        fixedDealerMargin +
        additionalDealerMargin;


    // ==========================================
    // 14. RESULT
    // ==========================================

    return {

        panelWatt,
        panelCount,
        totalWatt,
        panelType: data.panelType || "",
        systemSize,
        inverter,
        companyRatePerKW,
        fixedDealerMarginPerKW,
        additionalMarginPerKW,
        agentRatePerKW,
        ratePerKW,
        rateType,

        projectValue,

        discountPercentage,
        discountAmount,
        basicPriceAfterDiscount,

        gstPercentage,
        gstAmount,
        finalAmount,

        subsidyType,
        subsidyAmount,
        customerPayable,

        fixedDealerMargin,
        additionalDealerMargin,
        totalDealerMargin
    };
}


module.exports = {
    calculateQuotation
};