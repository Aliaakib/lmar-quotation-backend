require("dotenv").config();

const {
    sendQuotationEmail,
    verifyEmailConnection,
} = require("./services/email.service");

const {
    exportQuotationAsPDF,
} = require("./services/googleQuotation.service");

async function testEmail() {
    try {

        // ==========================================
        // 1. EMAIL CONNECTION
        // ==========================================

        await verifyEmailConnection();

        // ==========================================
        // 2. ACTUAL GOOGLE DOC ID
        // ==========================================

        const customerDocumentId = "YOUR_REAL_GOOGLE_DOC_ID";

        // ==========================================
        // 3. GENERATE PDF
        // ==========================================

        const pdf = await exportQuotationAsPDF(
            customerDocumentId,
            "LMAR-TEST-003.pdf"
        );

        console.log("✅ PDF generated successfully");

        // ==========================================
        // 4. SEND EMAIL
        // ==========================================

        const result = await sendQuotationEmail({

            customerEmail:
                "aliaakibbukhari110@gmail.com",

            data: {
                customerName:
                    "ALIAAKIB",

                quotationId:
                    "LMAR-TEST-003",

                quotationDate:
                    "25-08-2026",

                panelType:
                    "Adani Bifacial 540+ WP",

                inverter:
                    "Solaryaan 1 Phase 3.6",
            },

            calculation: {
                systemSize: 3.24,
                panelCount: 6,
                finalAmount: 196130.16,
                subsidyAmount: 78000,
                customerPayable: 118130.16,
            },

            quotation: {
                pdfBuffer: pdf.pdfBuffer,
                pdfUrl: pdf.pdfUrl,
                pdfDownloadUrl: pdf.pdfDownloadUrl,
            },

        });

        console.log("🎉 EMAIL TEST COMPLETED");
        console.log(result);

    } catch (error) {

        console.error("❌ EMAIL TEST FAILED");
        console.error(error.message);

    }
}

testEmail();