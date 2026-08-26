const {
    createQuotationFromTemplate,
    replaceQuotationVariables,
} = require("./services/googleQuotation.service");

async function testQuotation() {

    try {

        // ==========================================
        // CUSTOMER MASTER
        // ==========================================

        const templateId =
            "1jkZ65cKjpYczhbmTq3xDpyHzZp0M3P-9eLoBOrZod-s";

        // ==========================================
        // 1. CREATE COPY
        // ==========================================

        const quotation =
            await createQuotationFromTemplate(
                templateId,
                "TEST - LMAR Customer Quotation"
            );

        console.log("📄 NEW DOCUMENT:");
        console.log(quotation);

        // ==========================================
        // 2. REPLACE VARIABLES
        // ==========================================

        await replaceQuotationVariables(

            quotation.id,

            {

                CUSTOMER_NAME:
                    "Rafik Bhai",

                CUSTOMER_MOBILE:
                    "9876543210",

                QUOTATION_ID:
                    "LMAR-TEST-001",

                QUOTATION_DATE:
                    "25-08-2026",

                SYSTEM_SIZE:
                    "3.24",

                DISCOM:
                    "Torrent",

                RATE_PER_KW:
                    "₹54,000",

                TOTAL_COST:
                    "₹1,74,960",

                DISCOUNT_AMOUNT:
                    "₹8,748",

                BASIC_PRICE_AFTER_DISCOUNT:
                    "₹1,66,212",

                FINAL_AMOUNT:
                    "₹1,96,130",

                SUBSIDY_AMOUNT:
                    "₹78,000",

                CUSTOMER_PAYABLE:
                    "₹1,18,130"

            }

        );

        // ==========================================
        // 3. SUCCESS
        // ==========================================

        console.log(
            "================================="
        );

        console.log(
            "🎉 TEST QUOTATION COMPLETED"
        );

        console.log(
            "================================="
        );

        console.log(
            `Google Doc:
https://docs.google.com/document/d/${quotation.id}/edit`
        );

    } catch (error) {

        console.error(
            "❌ TEST FAILED"
        );

        console.error(
            error.response?.data ||
            error.message ||
            error
        );

    }

}

testQuotation();