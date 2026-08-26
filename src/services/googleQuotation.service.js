const { drive, docs } = require("../config/google");
const { PassThrough } = require("stream");

/**
 * Create a new Google Docs quotation
 * by copying the master template.
 */
async function createQuotationFromTemplate(templateId, fileName) {
    try {
        const copyResponse = await drive.files.copy({
            fileId: templateId,
            requestBody: {
                name: fileName,
            },
            fields: "id,name,mimeType,webViewLink",
        });

        console.log(
            "✅ Quotation document created:",
            copyResponse.data
        );

        return copyResponse.data;

    } catch (error) {
        console.error(
            "❌ Failed to create quotation:",
            error.response?.data || error.message
        );

        throw error;
    }
}


/**
 * Replace {{PLACEHOLDERS}} inside Google Docs.
 */
async function replaceQuotationVariables(
    documentId,
    variables
) {
    try {

        const requests = Object.entries(
            variables
        ).map(([key, value]) => {

            return {
                replaceAllText: {
                    containsText: {
                        text: `{{${key}}}`,
                        matchCase: true,
                    },

                    replaceText: String(
                        value ?? ""
                    ),
                },
            };

        });

        if (requests.length === 0) {
            return;
        }

        await docs.documents.batchUpdate({
            documentId,

            requestBody: {
                requests,
            },
        });

        console.log(
            "✅ Quotation placeholders replaced"
        );

    } catch (error) {

        console.error(
            "❌ Failed to replace quotation variables:",
            error.response?.data || error.message
        );

        throw error;
    }
}


/**
 * Set Google Drive file permission:
 *
 * Anyone with the link → Viewer
 */
async function makeFilePublic(fileId) {

    try {

        const permissionResponse =
            await drive.permissions.create({

                fileId,

                requestBody: {
                    type: "anyone",
                    role: "reader",
                },

                fields: "id,type,role",

            });

        console.log(
            "✅ PDF sharing enabled:",
            permissionResponse.data
        );

        return permissionResponse.data;

    } catch (error) {

        console.error(
            "❌ Failed to set PDF sharing permission:",
            error.response?.data || error.message
        );

        throw error;
    }
}


/**
 * Export Google Docs document as PDF
 * AND save PDF permanently into Google Drive.
 *
 * Also:
 * Anyone with the link → Viewer
 */
async function exportQuotationAsPDF(
    documentId,
    fileName
) {

    try {

        // ==========================================
        // 1. EXPORT GOOGLE DOC AS PDF
        // ==========================================

        const response =
            await drive.files.export({

                fileId: documentId,

                mimeType: "application/pdf",

            });


        // ==========================================
        // 2. CONVERT RESPONSE TO BUFFER
        // ==========================================

        let pdfBuffer;

        if (
            response.data &&
            typeof response.data.arrayBuffer === "function"
        ) {

            const arrayBuffer =
                await response.data.arrayBuffer();

            pdfBuffer =
                Buffer.from(arrayBuffer);

        } else {

            pdfBuffer =
                Buffer.from(response.data);

        }


        console.log(
            "✅ Quotation PDF generated:",
            fileName
        );


        // ==========================================
        // 3. CREATE PDF STREAM
        // ==========================================

        const pdfStream =
            new PassThrough();

        pdfStream.end(pdfBuffer);


        // ==========================================
        // 4. LMAR PDF DRIVE FOLDER
        // ==========================================

        const folderId =
            "1IsfhAmN3eVD0x9DebSC0E1sCt7cQXHk1";


        // ==========================================
        // 5. UPLOAD PDF TO GOOGLE DRIVE
        // ==========================================

        const uploadResponse =
            await drive.files.create({

                requestBody: {

                    name: fileName,

                    mimeType: "application/pdf",

                    parents: [folderId],

                },

                media: {

                    mimeType: "application/pdf",

                    body: pdfStream,

                },

                fields:
                    "id,name,mimeType,webViewLink,webContentLink",

            });


        const pdfFile =
            uploadResponse.data;


        console.log(
            "✅ Quotation PDF saved to Google Drive:",
            pdfFile
        );


        // ==========================================
        // 6. MAKE PDF PUBLIC
        // ==========================================

        const permission =
            await makeFilePublic(pdfFile.id);


        // ==========================================
        // 7. CREATE CUSTOMER-FRIENDLY URLS
        // ==========================================

        const pdfUrl =
            `https://drive.google.com/file/d/${pdfFile.id}/view`;

        const pdfDownloadUrl =
            `https://drive.google.com/uc?id=${pdfFile.id}&export=download`;


        console.log(
            "✅ PDF accessible with link:"
        );

        console.log(
            pdfUrl
        );


        // ==========================================
        // 8. RETURN PDF DETAILS
        // ==========================================

        return {

            id: pdfFile.id,

            name: pdfFile.name,

            mimeType: pdfFile.mimeType,

            webViewLink:
                pdfFile.webViewLink,

            webContentLink:
                pdfFile.webContentLink,

            pdfUrl,

            pdfDownloadUrl,
            pdfBuffer,
            permission,

        };

    } catch (error) {

        console.error(
            "❌ Failed to export/save quotation PDF:",
            error.response?.data ||
            error.message
        );

        throw error;
    }
}


module.exports = {

    createQuotationFromTemplate,

    replaceQuotationVariables,

    exportQuotationAsPDF,

    makeFilePublic,

};