const {
    calculateQuotation
} = require("../services/quotation.calculator");

const {
    sendQuotationEmail,
    sendInternalQuotationEmail,
} = require("../services/email.service");

const {
    createQuotationFromTemplate,
    replaceQuotationVariables,
    exportQuotationAsPDF
} = require("../services/googleQuotation.service");

const {
    generateQuotationId
} = require("../services/quotationId.service");

async function receiveFormSubmission(req, res) {

    try {

        const data = req.body || {};

        // Merge raw form values if Apps Script passed rawFormValues object
        if (data.rawFormValues && typeof data.rawFormValues === "object") {
            for (const [key, val] of Object.entries(data.rawFormValues)) {
                const valueStr = Array.isArray(val) ? String(val[0] || "").trim() : String(val || "").trim();
                if (valueStr !== "") {
                    if (data[key] === undefined || data[key] === null || String(data[key]).trim() === "") {
                        data[key] = valueStr;
                    }
                }
            }
        }

        // ==========================================
        // NORMALIZE PANEL COUNT & FILTER OUT PANEL TYPES
        // ==========================================

        const parseValidPanelCount = (val) => {
            if (val === undefined || val === null) return 0;
            const str = String(val).trim();
            if (!str) return 0;

            // Ignore strings containing model/brand/wattage keywords
            if (/(?:watt|wattage|wp|\bw\b|sunfive|mono|perc|topcon|bifacial|brand|model|type|make|spec)/i.test(str)) {
                return 0;
            }

            const cleanStr = str.replace(/,/g, "");
            const num = Number(cleanStr);
            if (Number.isFinite(num) && num > 0 && num <= 300) {
                return num;
            }

            const match = str.match(/(\d+)\s*(?:nos|panels|panel|pcs)?/i);
            if (match) {
                const extracted = Number(match[1]);
                if (Number.isFinite(extracted) && extracted > 0 && extracted <= 300) {
                    return extracted;
                }
            }

            return 0;
        };

        const getFirstValidPanelCount = (...vals) => {
            for (const v of vals) {
                const count = parseValidPanelCount(v);
                if (count > 0) {
                    return String(count);
                }
            }
            return "";
        };

        const findPanelCountFromRawValues = (phaseStr) => {
            if (!data.rawFormValues || typeof data.rawFormValues !== "object") return "";

            const is3Phase = phaseStr && phaseStr.toLowerCase().includes("3 phase");
            const is1Phase = phaseStr && phaseStr.toLowerCase().includes("1 phase");

            // 1. Phase-aware search
            for (const [rawKey, rawVal] of Object.entries(data.rawFormValues)) {
                const normKey = rawKey.toLowerCase();
                const isTypeOrBrandKey = /(?:type|brand|model|watt|location|make|spec|inverter|invertor)/i.test(normKey);
                if (isTypeOrBrandKey) continue;

                const isPanelKey = /(?:panel|qty|quantity)/i.test(normKey);
                if (!isPanelKey) continue;

                if (is3Phase && normKey.includes("1 phase") && !normKey.includes("3 phase")) continue;
                if (is1Phase && normKey.includes("3 phase") && !normKey.includes("1 phase")) continue;

                const valStr = Array.isArray(rawVal) ? rawVal[0] : rawVal;
                const count = parseValidPanelCount(valStr);
                if (count > 0) {
                    return String(count);
                }
            }

            // 2. Generic fallback search across all raw values
            for (const [rawKey, rawVal] of Object.entries(data.rawFormValues)) {
                const normKey = rawKey.toLowerCase();
                const isTypeOrBrandKey = /(?:type|brand|model|watt|location|make|spec|inverter|invertor)/i.test(normKey);
                if (isTypeOrBrandKey) continue;

                const isPanelKey = /(?:panel|qty|quantity)/i.test(normKey);
                if (!isPanelKey) continue;

                const valStr = Array.isArray(rawVal) ? rawVal[0] : rawVal;
                const count = parseValidPanelCount(valStr);
                if (count > 0) {
                    return String(count);
                }
            }

            return "";
        };

        if (
            data.systemPhase &&
            String(data.systemPhase).toLowerCase().includes("1 phase")
        ) {
            data.panels1Phase = getFirstValidPanelCount(
                data.panels1Phase,
                data.numberOfPanels1Phase,
                data["Number of Panels - 1 Phase"],
                data["Number of Panels - 1 Phase *"],
                data["Number of Panels (1 Phase)"],
                data.panelCount
            ) || findPanelCountFromRawValues("1 Phase");

            if (data.panels1Phase) {
                data.panelCount = data.panels1Phase;
            }
        }

        if (
            data.systemPhase &&
            String(data.systemPhase).toLowerCase().includes("3 phase")
        ) {
            data.panels3Phase = getFirstValidPanelCount(
                data.panels3Phase,
                data.numberOfPanels3Phase,
                data["Number of Panels - 3 Phase"],
                data["Number of Panels - 3 Phase *"],
                data["Number of Panels (3 Phase)"],
                data.panelCount
            ) || findPanelCountFromRawValues("3 Phase");

            if (data.panels3Phase) {
                data.panelCount = data.panels3Phase;
            }
        }

        if (!data.panelCount) {
            const fallbackCount = getFirstValidPanelCount(
                data.panels3Phase,
                data.panels1Phase,
                data.panelCount
            ) || findPanelCountFromRawValues(data.systemPhase);

            if (fallbackCount) {
                data.panelCount = fallbackCount;
                if (!data.panels3Phase && String(data.systemPhase || "").toLowerCase().includes("3 phase")) {
                    data.panels3Phase = fallbackCount;
                }
                if (!data.panels1Phase && String(data.systemPhase || "").toLowerCase().includes("1 phase")) {
                    data.panels1Phase = fallbackCount;
                }
            }
        }

        // ==========================================
        // 1. RAW FORM DATA DEBUG
        // ==========================================

        console.log("=================================");
        console.log("RAW FORM DATA RECEIVED");
        console.log("=================================");

        console.log(
            JSON.stringify(data, null, 2)
        );

        // ==========================================
        // 2. BASIC VALIDATION
        // ==========================================

        if (
            !data ||
            Object.keys(data).length === 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Quotation data is missing"
            });

        }

        // ==========================================
        // 3. SEND QUOTATION OPTION
        // ==========================================

        const sendQuotationToCustomer =
            String(
                data.sendQuotationToCustomer || ""
            )
                .trim()
                .toLowerCase();

        console.log(
            "Send quotation to customer:",
            sendQuotationToCustomer
        );

        // ==========================================
        // 4. CUSTOMER VALIDATION
        // ==========================================

        if (
            sendQuotationToCustomer === "yes"
        ) {

            const requiredFields = [
                "customerName",
                "customerMobile",
                "customerEmail"
            ];

            const missingFields =
                requiredFields.filter(
                    field =>
                        data[field] === undefined ||
                        data[field] === null ||
                        String(data[field]).trim() === ""
                );

            if (missingFields.length > 0) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Customer details are required when sending quotation to customer",

                    missingFields

                });

            }

        }

        // ==========================================
        // 5. CALCULATE QUOTATION
        // ==========================================
        // ==========================================
        // 5A. PANEL DEBUG
        // ==========================================

        console.log("========== PANEL DEBUG ==========");
        console.log("systemPhase:", data.systemPhase);
        console.log("panels1Phase:", data.panels1Phase);
        console.log("panels3Phase:", data.panels3Phase);
        console.log("panelCount:", data.panelCount);
        console.log("ALL FORM DATA:", JSON.stringify(data, null, 2));
        console.log("=================================");

        const calculation =
            calculateQuotation(data);

        console.log(
            "✅ Quotation calculation completed."
        );

        console.log(
            JSON.stringify(
                calculation,
                null,
                2
            )
        );

        // ==========================================
        // 6. QUOTATION ID
        // ==========================================

        const quotationId = await generateQuotationId();

        // ==========================================
        // 7. QUOTATION DATE
        // ==========================================

        const quotationDate =
            data.quotationDate ||
            new Date().toLocaleDateString("en-IN");

        // ==========================================
        // 8. INTERNAL QUOTATION VARIABLES
        // ==========================================

        const internalVariables = {

            QUOTATION_ID:
                quotationId,

            QUOTATION_DATE:
                quotationDate,

            SYSTEM_PHASE:
                data.systemPhase || "",

            PANEL_TYPE:
                data.panelType || "",

            PANEL_COUNT:
                calculation.panelCount,

            SYSTEM_SIZE:
                calculation.systemSize.toFixed(2),

            INVERTER: calculation.inverter,

            STRUCTURE_HEIGHT:
                data.structureHeight || "",

            DISCOM:
                data.discom || "",

            PROJECT_VALUE:
                calculation.projectValue.toFixed(2),

            DISCOUNT_PERCENTAGE:
                calculation.discountPercentage,

            DISCOUNT_AMOUNT:
                calculation.discountAmount.toFixed(2),

            BASIC_PRICE_AFTER_DISCOUNT:
                calculation.basicPriceAfterDiscount.toFixed(2),

            GST_PERCENTAGE:
                calculation.gstPercentage,

            GST_AMOUNT:
                calculation.gstAmount.toFixed(2),

            FINAL_AMOUNT:
                calculation.finalAmount.toFixed(2),

            SUBSIDY_AMOUNT:
                calculation.subsidyAmount.toFixed(2),

            CUSTOMER_PAYABLE:
                calculation.customerPayable.toFixed(2),
            FIXED_DEALER_MARGIN_PER_KW:
                calculation.fixedDealerMarginPerKW,

            ADDITIONAL_MARGIN_PER_KW:
                calculation.additionalMarginPerKW,

            FIXED_DEALER_MARGIN:
                calculation.fixedDealerMargin.toFixed(2),

            ADDITIONAL_DEALER_MARGIN:
                calculation.additionalDealerMargin.toFixed(2),

            TOTAL_DEALER_MARGIN:
                calculation.totalDealerMargin.toFixed(2)

        };

        // ==========================================
        // 9. CREATE INTERNAL QUOTATION
        // ==========================================

        const internalTemplateId =
            process.env.INTERNAL_QUOTATION_TEMPLATE_ID;

        if (!internalTemplateId) {

            throw new Error(
                "INTERNAL_QUOTATION_TEMPLATE_ID is missing in .env"
            );

        }

        console.log(
            "Creating Internal LMAR quotation..."
        );

        const customerName = data.customerName ? String(data.customerName).trim() : "";
        const internalDocTitle = customerName
            ? `${customerName} - Internal - ${quotationId}`
            : `LMAR Internal Quotation - ${quotationId}`;
        const internalPdfTitle = `${internalDocTitle}.pdf`;

        const internalQuotation =
            await createQuotationFromTemplate(

                internalTemplateId,

                internalDocTitle

            );

        // ==========================================
        // 10. REPLACE INTERNAL VARIABLES
        // ==========================================

        await replaceQuotationVariables(

            internalQuotation.id,

            internalVariables

        );

        // ==========================================
        // 11. EXPORT INTERNAL PDF
        // ==========================================

        const internalPDF =
            await exportQuotationAsPDF(

                internalQuotation.id,

                internalPdfTitle

            );

        console.log(
            "✅ Internal quotation generated"
        );
        // ==========================================
        // 11A. SEND INTERNAL QUOTATION TO AGENT
        // ==========================================

        if (!data.agentEmail) {
            throw new Error("Agent email is required");
        }

        try {
            await sendInternalQuotationEmail({
                agentEmail: data.agentEmail,
                data: {
                    customerName: data.customerName || "",
                    quotationId,
                    quotationDate,
                    panelType: data.panelType || "",
                    inverter: calculation.inverter || "",
                },
                calculation,
                quotation: {
                    pdfBuffer: internalPDF.pdfBuffer,
                    pdfFileName: internalPDF.name,
                    pdfUrl: internalPDF.pdfUrl,
                },
            });

            console.log(
                `✅ Internal quotation email sent to agent: ${data.agentEmail}`
            );

        } catch (emailError) {

            console.error(
                "⚠️ Internal quotation email failed, continuing:",
                emailError.message
            );

        }

        console.log(
            `✅ Internal quotation email sent to agent: ${data.agentEmail}`
        );
        // ==========================================
        // 12. CUSTOMER QUOTATION
        // ==========================================

        let customerQuotation = null;
        let customerPDF = null;

        if (
            sendQuotationToCustomer === "yes"
        ) {

            const customerTemplateId =
                process.env.CUSTOMER_QUOTATION_TEMPLATE_ID;

            if (!customerTemplateId) {

                throw new Error(
                    "CUSTOMER_QUOTATION_TEMPLATE_ID is missing in .env"
                );

            }

            // ======================================
            // CUSTOMER VARIABLES
            // ======================================

            const customerVariables = {

                CUSTOMER_NAME:
                    data.customerName || "",

                CUSTOMER_MOBILE:
                    data.customerMobile || "",

                QUOTATION_ID:
                    quotationId,

                QUOTATION_DATE:
                    quotationDate,

                SYSTEM_SIZE:
                    calculation.systemSize.toFixed(2),

                DISCOM:
                    data.discom || "",

                PANEL_TYPE:
                    data.panelType ||
                    calculation.panelType ||
                    "",

                RATE_PER_KW:
                    calculation.ratePerKW.toFixed(2),

                TOTAL_COST:
                    calculation.projectValue.toFixed(2),

                DISCOUNT_PERCENTAGE:
                    calculation.discountPercentage,

                DISCOUNT_AMOUNT:
                    calculation.discountAmount.toFixed(2),

                BASIC_PRICE_AFTER_DISCOUNT:
                    calculation.basicPriceAfterDiscount.toFixed(2),

                GST_PERCENTAGE:
                    calculation.gstPercentage,

                GST_AMOUNT:
                    calculation.gstAmount.toFixed(2),

                FINAL_AMOUNT:
                    calculation.finalAmount.toFixed(2),

                SUBSIDY_AMOUNT:
                    calculation.subsidyAmount.toFixed(2),

                CUSTOMER_PAYABLE:
                    calculation.customerPayable.toFixed(2)

            };

            // ======================================
            // CREATE CUSTOMER DOCUMENT
            // ======================================

            console.log(
                "Creating Customer LMAR quotation..."
            );

            const customerDocTitle = customerName
                ? `${customerName} - ${quotationId}`
                : `LMAR Customer Quotation - ${quotationId}`;
            const customerPdfTitle = `${customerDocTitle}.pdf`;

            customerQuotation =
                await createQuotationFromTemplate(

                    customerTemplateId,

                    customerDocTitle

                );

            // ======================================
            // REPLACE CUSTOMER VARIABLES
            // ======================================

            await replaceQuotationVariables(

                customerQuotation.id,

                customerVariables

            );

            // ======================================
            // EXPORT CUSTOMER PDF
            // ======================================

            customerPDF =
                await exportQuotationAsPDF(
                    customerQuotation.id,
                    customerPdfTitle
                );
            if (
                String(sendQuotationToCustomer).toLowerCase() === "yes"
            ) {
                try {
                    await sendQuotationEmail({
                        customerEmail: data.customerEmail,

                        data: {
                            customerName: data.customerName,
                            quotationId: quotationId,
                            quotationDate: quotationDate,
                            panelType: data.panelType || "",
                            inverter:
                                data.inverter1Phase ||
                                data.inverter3Phase ||
                                data.inverter ||
                                "",
                        },

                        calculation,

                        quotation: {
                            pdfBuffer: customerPDF.pdfBuffer,
                            pdfFileName: customerPDF.name,
                            pdfUrl: customerPDF.pdfUrl,
                        },
                    });

                    console.log(
                        "✅ Customer quotation email sent"
                    );
                } catch (customerEmailErr) {
                    console.error(
                        "⚠️ Customer quotation email failed, continuing:",
                        customerEmailErr.message
                    );
                }
            }
            customerQuotation.pdfGenerated = true;

            console.log(
                "✅ Customer quotation generated"
            );

        }
        // ==========================================
        // 13. SUCCESS RESPONSE
        // ==========================================

        return res.status(200).json({

            success: true,

            message:
                "LMAR quotation generated successfully",

            quotationId,

            sendQuotationToCustomer,

            customerName:
                data.customerName || null,

            calculation,

            // ======================================
            // INTERNAL QUOTATION
            // ======================================

            internalQuotation: {

                documentId:
                    internalQuotation.id,

                documentName:
                    internalQuotation.name,

                googleDocUrl:
                    internalQuotation.webViewLink,

                pdfId:
                    internalPDF?.id || null,

                pdfName:
                    internalPDF?.name || null,

                pdfUrl:
                    internalPDF?.webViewLink ||
                    null,

                pdfDownloadUrl:
                    internalPDF?.webContentLink ||
                    null
            },

            // ======================================
            // CUSTOMER QUOTATION
            // ======================================

            customerQuotation:
                customerQuotation
                    ? {

                        documentId:
                            customerQuotation.id,

                        documentName:
                            customerQuotation.name,

                        googleDocUrl:
                            customerQuotation.webViewLink,

                        pdfId:
                            customerPDF?.id || null,

                        pdfName:
                            customerPDF?.name || null,

                        pdfUrl:
                            customerPDF?.webViewLink ||
                            null,

                        pdfDownloadUrl:
                            customerPDF?.webContentLink ||
                            null

                    }
                    : null

        });

    } catch (error) {

        console.error(
            "❌ Quotation Controller Error:",
            error.response?.data ||
            error.message ||
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to generate quotation"

        });

    }

}

module.exports = {
    receiveFormSubmission
};