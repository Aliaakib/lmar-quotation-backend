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

    if (systemPhase.includes("1 phase")) {

        panelCount = Number(
            data.panels1Phase || 0
        );

    } else if (systemPhase.includes("3 phase")) {

        panelCount = Number(
            data.panels3Phase || 0
        );

    } else {

        panelCount = Number(
            data.panels1Phase ||
            data.panels3Phase ||
            data.panelCount ||
            0
        );
    }

    if (!panelCount || panelCount <= 0) {
        throw new Error("Number of panels is required");
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

    const additionalMarginPerKW = Number(
        data.basePriceIncreasePerKW ||
        data.basePriceIncrease ||
        data.additionalMarginPerKW ||
        0
    );


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

    const discountAmount = Number(
        data.discountAmount ||
        data.discount ||
        0
    );

    if (!discountAmount || discountAmount <= 0) {
        throw new Error("Discount Amount is required");
    }

    const discountPercentage =
        projectValue > 0
            ? (discountAmount / projectValue) * 100
            : 0;

    const basicPriceAfterDiscount =
        projectValue -
        discountAmount;
    // ==========================================
    // 10. GST
    // ==========================================

    const gstPercentage = 18;

    const gstAmount =
        basicPriceAfterDiscount *
        (gstPercentage / 100);

    const finalAmount =
        basicPriceAfterDiscount +
        gstAmount;


    // ==========================================
    // 11. SUBSIDY
    // ==========================================

    const subsidyType = String(
        data.subsidyType ||
        "Residential"
    ).trim().toLowerCase();

    let subsidyAmount = 0;

    if (subsidyType === "residential") {

        subsidyAmount = 78000;

    } else if (subsidyType === "commercial") {

        subsidyAmount =
            systemSize * 18000;
    }


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