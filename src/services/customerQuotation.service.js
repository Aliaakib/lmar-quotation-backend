const fs = require("fs");
const path = require("path");

/**
 * Generate Customer Quotation HTML
 *
 * This service:
 * 1. Receives form data + calculation
 * 2. Loads customer-quotation.html
 * 3. Replaces placeholders with actual values
 * 4. Returns final HTML
 *
 * PDF generation and email sending
 * will be added in the next step.
 */

function generateCustomerQuotationHTML(data, calculation) {
    try {
        // ==========================================
        // 1. TEMPLATE PATH
        // ==========================================

        const templatePath = path.join(
            __dirname,
            "../customer-quotation/customer-quotation.html"
        );

        // ==========================================
        // 2. CHECK TEMPLATE
        // ==========================================

        if (!fs.existsSync(templatePath)) {
            throw new Error(
                "customer-quotation.html template not found"
            );
        }

        // ==========================================
        // 3. READ HTML TEMPLATE
        // ==========================================

        let html = fs.readFileSync(
            templatePath,
            "utf8"
        );

        // ==========================================
        // 4. CUSTOMER DATA
        // ==========================================

        const customerName =
            data.customerName || "";

        const customerMobile =
            data.customerMobile || "";

        const customerEmail =
            data.customerEmail || "";

        const customerPincode =
            data.customerPincode || "";

        // ==========================================
        // 5. PROJECT DATA
        // ==========================================

        const discom =
            data.discom || "";

        const projectType =
            data.projectType || "";

        const systemPhase =
            data.systemPhase || "";

        const panelType =
            data.panelType || "";

        const structureType =
            data.structureType || "";

        const structureHeight =
            data.structureHeight || "";

        const solarPlantLocation =
            data.solarPlantLocation || "";

        const inverterLocation =
            data.inverterLocation || "";

        // ==========================================
        // 6. CALCULATION DATA
        // ==========================================

        const panelWatt =
            calculation.panelWatt || 540;

        const panelCount =
            calculation.panelCount || 0;

        const totalWatt =
            calculation.totalWatt || 0;

        const systemSize =
            calculation.systemSize || 0;

        const ratePerKW =
            calculation.ratePerKW || 0;

        const projectValue =
            calculation.projectValue || 0;

        const discountPercentage =
            calculation.discountPercentage ?? 0;

        const discountAmount =
            calculation.discountAmount || 0;

        const basicPriceAfterDiscount =
            calculation.basicPriceAfterDiscount || 0;

        const gstPercentage =
            calculation.gstPercentage ?? 5;

        const gstAmount =
            calculation.gstAmount || 0;

        const finalAmount =
            calculation.finalAmount || 0;

        const subsidyType =
            calculation.subsidyType || "";

        const subsidyAmount =
            calculation.subsidyAmount || 0;

        const customerPayable =
            calculation.customerPayable || 0;

        // ==========================================
        // 7. FORMAT CURRENCY
        // ==========================================

        const formatCurrency = (value) => {
            return Number(value ?? 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        };

        // ==========================================
        // 8. REPLACEMENT MAP
        // ==========================================

        const replacements = {

            "{{CUSTOMER_NAME}}":
                customerName,

            "{{CUSTOMER_MOBILE}}":
                customerMobile,

            "{{CUSTOMER_EMAIL}}":
                customerEmail,

            "{{CUSTOMER_PINCODE}}":
                customerPincode,

            "{{DISCOM}}":
                discom,

            "{{PROJECT_TYPE}}":
                projectType,

            "{{SYSTEM_PHASE}}":
                systemPhase,

            "{{PANEL_TYPE}}":
                panelType,

            "{{PANEL_WATT}}":
                panelWatt,

            "{{PANEL_COUNT}}":
                panelCount,

            "{{TOTAL_WATT}}":
                totalWatt,

            "{{SYSTEM_SIZE}}":
                String(systemSize),

            "{{STRUCTURE_TYPE}}":
                structureType,

            "{{STRUCTURE_HEIGHT}}":
                structureHeight,

            "{{SOLAR_PLANT_LOCATION}}":
                solarPlantLocation,

            "{{INVERTER_LOCATION}}":
                inverterLocation,

            "{{RATE_PER_KW}}":
                formatCurrency(ratePerKW),

            "{{PROJECT_VALUE}}":
                formatCurrency(projectValue),

            "{{DISCOUNT_PERCENTAGE}}":
                discountPercentage,

            "{{DISCOUNT_AMOUNT}}":
                formatCurrency(discountAmount),

            "{{BASIC_PRICE_AFTER_DISCOUNT}}":
                formatCurrency(
                    basicPriceAfterDiscount
                ),

            "{{GST_PERCENTAGE}}":
                gstPercentage,

            "{{GST_AMOUNT}}":
                formatCurrency(gstAmount),

            "{{FINAL_AMOUNT}}":
                formatCurrency(finalAmount),

            "{{SUBSIDY_TYPE}}":
                subsidyType,

            "{{SUBSIDY_AMOUNT}}":
                formatCurrency(subsidyAmount),

            "{{CUSTOMER_PAYABLE}}":
                formatCurrency(customerPayable)
        };

        // ==========================================
        // 9. REPLACE ALL PLACEHOLDERS
        // ==========================================

        Object.entries(replacements).forEach(
            ([placeholder, value]) => {

                html = html.replace(
                    new RegExp(
                        placeholder.replace(
                            /[.*+?^${}()|[\]\\]/g,
                            "\\$&"
                        ),
                        "g"
                    ),
                    String(value ?? "")
                );

            }
        );

        // ==========================================
        // 10. RETURN FINAL HTML
        // ==========================================

        return html;

    } catch (error) {

        console.error(
            "Customer Quotation Service Error:",
            error
        );

        throw error;
    }
}

module.exports = {
    generateCustomerQuotationHTML
};