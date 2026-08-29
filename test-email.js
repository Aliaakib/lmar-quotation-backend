require("dotenv").config();

const {
    sendQuotationEmail,
    verifyEmailConnection,
} = require("././src/services/email.service"); // apna actual path daalo

const fs = require("fs");
const path = require("path");

async function runTest() {
    try {
        await verifyEmailConnection();

        // Dummy PDF buffer (koi bhi chhota PDF file test ke liye)
        const pdfBuffer = fs.readFileSync(
            path.resolve(__dirname, "test-sample.pdf")
        );

        const result = await sendQuotationEmail({
            customerEmail: "lmarrenewableenergy1@gmail.com",
            data: {
                customerName: "Test Customer",
                quotationId: "TEST-001",
                quotationDate: new Date().toLocaleDateString("en-IN"),
            },
            calculation: {
                systemSize: 5,
                panelCount: 10,
                finalAmount: 350000,
                subsidyAmount: 78000,
                customerPayable: 272000,
            },
            quotation: {
                pdfBuffer,
            },
        });

        console.log("TEST RESULT:", result);
    } catch (err) {
        console.error("TEST FAILED:", err);
    }
}

runTest();