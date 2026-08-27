const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: String(process.env.EMAIL_SECURE).toLowerCase() === "true",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const logoBase64 = fs.readFileSync(
    path.resolve(process.cwd(), "src", "assets", "LMAR-LOGO.png")
).toString("base64");
const logoDataUri = `data:image/png;base64,${logoBase64}`;

// async function verifyEmailConnection() {
//     // API-based hai, koi persistent connection verify nahi karni padti
//     if (!process.env.RESEND_API_KEY) {
//         throw new Error("RESEND_API_KEY missing in env");
//     }
//     console.log("✅ Email API key present, ready to send");
//     return true;
// }

async function verifyEmailConnection() {
    try {
        await transporter.verify();
        console.log("✅ Gmail SMTP connection successful");
        return true;
    } catch (error) {
        console.error("❌ Gmail SMTP connection failed:", error.message);
        return false;
    }
}

/*
|--------------------------------------------------------------------------
| FORMAT CURRENCY
|--------------------------------------------------------------------------
*/

function formatCurrency(amount) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(amount || 0));
}


/*
|--------------------------------------------------------------------------
| CUSTOMER QUOTATION EMAIL HTML
|--------------------------------------------------------------------------
*/

function generateQuotationEmailHTML(data, calculation, quotation) {

    const customerName =
        data.customerName || "Customer";

    const quotationId =
        data.quotationId || "N/A";

    const quotationDate =
        data.quotationDate || "N/A";

    const systemSize =
        Number(calculation.systemSize || 0)
            .toFixed(2);

    const panelCount =
        calculation.panelCount || 0;

    const panelType =
        data.panelType || "Solar PV Module";

    const inverter =
        data.inverter || "Solar Inverter";

    const customerPayable =
        formatCurrency(
            calculation.customerPayable
        );

    const finalAmount =
        formatCurrency(
            calculation.finalAmount
        );

    const subsidyAmount =
        formatCurrency(
            calculation.subsidyAmount
        );

    // const pdfUrl =
    //     `https://drive.google.com/file/d/${pdfFile.id}/view`;
    // const pdfDownloadUrl =
    //     `https://drive.google.com/uc?id=${pdfFile.id}&export=download`;


    /*
    |--------------------------------------------------------------------------
    | EMAIL HTML
    |--------------------------------------------------------------------------
    */

    return `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta name="viewport"
      content="width=device-width, initial-scale=1.0">

<title>
LMAR Renewable Energy - Solar Quotation
</title>

</head>


<body style="
    margin:0;
    padding:0;
    background:#f3f6f8;
    font-family:Arial,Helvetica,sans-serif;
    color:#172033;
">


<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background:#f3f6f8;padding:35px 15px;"
>

<tr>

<td align="center">


<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        max-width:680px;
        background:#ffffff;
        border-radius:12px;
        overflow:hidden;
        box-shadow:0 4px 20px rgba(0,0,0,0.08);
    "
>


<!-- ================================================= -->
<!-- HEADER -->
<!-- ================================================= -->

<tr>

<td
    style="
        background:#0b2d59;
        padding:28px 35px;
    "
>

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
>

<tr>

<td>

<div style="
    font-size:27px;
    font-weight:700;
    color:#ffffff;
    letter-spacing:0.5px;
">
    LMAR
</div>

<div style="
    margin-top:4px;
    font-size:12px;
    color:#d9e5f2;
    letter-spacing:1.2px;
">
    RENEWABLE ENERGY
</div>

</td>


<td
    align="right"
    valign="middle"
>

<div style="
    display:inline-block;
    padding:8px 14px;
    border:1px solid #8bc34a;
    border-radius:20px;
    color:#ffffff;
    font-size:11px;
    font-weight:bold;
">
    SOLAR QUOTATION
</div>

</td>

</tr>

</table>

</td>

</tr>


<!-- ================================================= -->
<!-- GREEN ACCENT -->
<!-- ================================================= -->

<tr>

<td
    style="
        height:5px;
        background:#8bc34a;
        font-size:0;
        line-height:0;
    "
>
&nbsp;
</td>

</tr>


<!-- ================================================= -->
<!-- MAIN CONTENT -->
<!-- ================================================= -->

<tr>

<td
    style="
        padding:35px;
    "
>

<div style="
    font-size:15px;
    color:#555f6f;
">
    Dear
    <strong style="color:#0b2d59;">
        ${customerName}
    </strong>,
</div>


<h1 style="
    margin:12px 0 8px;
    font-size:25px;
    color:#0b2d59;
">
    Your Solar Quotation is Ready
</h1>


<p style="
    margin:0 0 25px;
    color:#667085;
    font-size:14px;
    line-height:1.7;
">

Thank you for choosing
<strong>LMAR Renewable Energy</strong>.

We are pleased to share your solar system quotation with you.

</p>


<!-- ================================================= -->
<!-- QUOTATION INFO -->
<!-- ================================================= -->

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="
        border:1px solid #e2e8f0;
        border-radius:8px;
        overflow:hidden;
        margin-bottom:25px;
    "
>

<tr>

<td
    width="50%"
    style="
        padding:14px 16px;
        background:#f8fafc;
        border-bottom:1px solid #e2e8f0;
    "
>

<div style="
    font-size:11px;
    color:#7a8494;
    text-transform:uppercase;
">
    Quotation ID
</div>

<div style="
    margin-top:5px;
    font-size:14px;
    font-weight:bold;
    color:#0b2d59;
">
    ${quotationId}
</div>

</td>


<td
    width="50%"
    style="
        padding:14px 16px;
        background:#f8fafc;
        border-bottom:1px solid #e2e8f0;
    "
>

<div style="
    font-size:11px;
    color:#7a8494;
    text-transform:uppercase;
">
    Quotation Date
</div>

<div style="
    margin-top:5px;
    font-size:14px;
    font-weight:bold;
    color:#0b2d59;
">
    ${quotationDate}
</div>

</td>

</tr>


<tr>

<td
    style="
        padding:14px 16px;
    "
>

<div style="
    font-size:11px;
    color:#7a8494;
    text-transform:uppercase;
">
    System Capacity
</div>

<div style="
    margin-top:5px;
    font-size:17px;
    font-weight:bold;
    color:#0b2d59;
">
    ${systemSize} kW
</div>

</td>


<td
    style="
        padding:14px 16px;
    "
>

<div style="
    font-size:11px;
    color:#7a8494;
    text-transform:uppercase;
">
    Solar Panels
</div>

<div style="
    margin-top:5px;
    font-size:17px;
    font-weight:bold;
    color:#0b2d59;
">
    ${panelCount} Panels
</div>

</td>

</tr>

</table>


<!-- ================================================= -->
<!-- SYSTEM DETAILS -->
<!-- ================================================= -->

<h2 style="
    margin:0 0 12px;
    font-size:16px;
    color:#0b2d59;
">
    System Details
</h2>


<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="
        margin-bottom:25px;
    "
>

<tr>

<td
    style="
        padding:11px 0;
        border-bottom:1px solid #edf0f3;
        font-size:13px;
        color:#667085;
    "
>
    Panel Type
</td>

<td
    align="right"
    style="
        padding:11px 0;
        border-bottom:1px solid #edf0f3;
        font-size:13px;
        font-weight:bold;
        color:#172033;
    "
>
    ${panelType}
</td>

</tr>


<tr>

<td
    style="
        padding:11px 0;
        border-bottom:1px solid #edf0f3;
        font-size:13px;
        color:#667085;
    "
>
    Inverter
</td>

<td
    align="right"
    style="
        padding:11px 0;
        border-bottom:1px solid #edf0f3;
        font-size:13px;
        font-weight:bold;
        color:#172033;
    "
>
    ${inverter}
</td>

</tr>


<tr>

<td
    style="
        padding:11px 0;
        font-size:13px;
        color:#667085;
    "
>
    Potential Subsidy
</td>

<td
    align="right"
    style="
        padding:11px 0;
        font-size:13px;
        font-weight:bold;
        color:#6cae2d;
    "
>
    ${subsidyAmount}
</td>

</tr>

</table>


<!-- ================================================= -->
<!-- PRICE CARD -->
<!-- ================================================= -->

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="
        background:#f5f8f2;
        border:1px solid #dceacb;
        border-radius:10px;
        margin-bottom:28px;
    "
>

<tr>

<td
    style="
        padding:20px;
    "
>

<div style="
    font-size:12px;
    color:#68745c;
    text-transform:uppercase;
    letter-spacing:0.5px;
">
    Net Effective Customer Price
</div>


<div style="
    margin-top:7px;
    font-size:29px;
    font-weight:700;
    color:#0b2d59;
">
    ${customerPayable}
</div>


<div style="
    margin-top:5px;
    font-size:12px;
    color:#667085;
">
    Final amount after applicable subsidy
</div>

</td>

</tr>

</table>


<!-- ================================================= -->
<!-- BUTTONS -->
<!-- ================================================= -->

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
>

<tr>

<td align="center">

<a
    href="${pdfUrl}"
    target="_blank"
    style="
        display:inline-block;
        background:#0b2d59;
        color:#ffffff;
        text-decoration:none;
        padding:13px 25px;
        border-radius:6px;
        font-size:13px;
        font-weight:bold;
        margin-right:8px;
    "
>
    VIEW QUOTATION
</a>


<a
    href="${pdfDownloadUrl}"
    target="_blank"
    style="
        display:inline-block;
        background:#8bc34a;
        color:#ffffff;
        text-decoration:none;
        padding:13px 25px;
        border-radius:6px;
        font-size:13px;
        font-weight:bold;
        margin-left:8px;
    "
>
    DOWNLOAD PDF
</a>

</td>

</tr>

</table>


<p style="
    margin:28px 0 0;
    font-size:12px;
    line-height:1.7;
    color:#7a8494;
    text-align:center;
">

Your detailed quotation PDF is available using the buttons above.

Please contact us if you have any questions regarding your solar project.

</p>

</td>

</tr>


<!-- ================================================= -->
<!-- FOOTER -->
<!-- ================================================= -->

<tr>

<td
    style="
        background:#0b2d59;
        padding:25px 35px;
        text-align:center;
    "
>

<div style="
    color:#ffffff;
    font-size:14px;
    font-weight:bold;
">
    LMAR Renewable Energy
</div>


<div style="
    margin-top:6px;
    color:#b9c8d9;
    font-size:11px;
">
    Powering a Cleaner & Sustainable Future
</div>


<div style="
    margin-top:15px;
    height:1px;
    background:#29496d;
">
&nbsp;
</div>


<div style="
    margin-top:15px;
    color:#9fb0c4;
    font-size:10px;
    line-height:1.6;
">
    This is an automated quotation email.
    Please do not reply directly to this email.
</div>

</td>

</tr>


</table>

</td>

</tr>

</table>


</body>

</html>

`;
}


/*
|--------------------------------------------------------------------------
| SEND CUSTOMER QUOTATION EMAIL
|--------------------------------------------------------------------------
*/

// async function sendQuotationEmail({
//     customerName,
//     customerEmail,
//     quotationId,
//     calculation,
//     pdfBuffer,
//     pdfFileName,
//     pdfUrl,
// }) {

//     try {

//         if (!customerEmail) {
//             throw new Error(
//                 "Customer email is required"
//             );
//         }

//         if (!pdfBuffer) {
//             throw new Error(
//                 "PDF buffer is missing"
//             );
//         }

//         if (!pdfFileName) {
//             throw new Error(
//                 "PDF file name is missing"
//             );
//         }
//         const mailOptions = {
//             from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
//             to: customerEmail,

//             subject: `Your Solar Quotation - ${quotationId}`,

//             html: `
//                 <div style="
//                     font-family: Arial, sans-serif;
//                     max-width: 650px;
//                     margin: auto;
//                     padding: 30px;
//                     color: #333;
//                 ">

//                     <h2 style="margin-bottom: 5px;">
//                         LMAR Renewable Energy
//                     </h2>

//                     <p>
//                         Dear <strong>${customerName}</strong>,
//                     </p>

//                     <p>
//                         Thank you for choosing
//                         <strong>LMAR Renewable Energy</strong>.
//                     </p>

//                     <p>
//                         Please find your solar quotation attached
//                         with this email.
//                     </p>

//                     <div style="
//                         background: #f5f7f8;
//                         padding: 20px;
//                         border-radius: 8px;
//                         margin: 20px 0;
//                     ">

//                         <p>
//                             <strong>Quotation ID:</strong>
//                             ${quotationId}
//                         </p>

//                         <p>
//                             <strong>System Size:</strong>
//                             ${calculation.systemSize} kW
//                         </p>

//                         <p>
//                             <strong>Final Amount:</strong>
//                             ₹${calculation.finalAmount.toFixed(2)}
//                         </p>

//                         <p>
//                             <strong>Subsidy:</strong>
//                             ₹${calculation.subsidyAmount.toFixed(2)}
//                         </p>

//                         <p>
//                             <strong>Customer Payable:</strong>
//                             ₹${calculation.customerPayable.toFixed(2)}
//                         </p>

//                     </div>

//                     <p>
//                         Please review the attached quotation.
//                     </p>

//                     ${pdfUrl
//                     ? `
//                             <p>
//                                 You can also
//                                 <a href="${pdfUrl}">
//                                     view your quotation online
//                                 </a>.
//                             </p>
//                             `
//                     : ""
//                 }

//                     <p>
//                         If you have any questions, please feel free
//                         to contact us.
//                     </p>

//                     <p>
//                         Regards,<br>
//                         <strong>LMAR Renewable Energy</strong>
//                     </p>

//                 </div>
//             `,

//             attachments: [
//                 {
//                     filename: pdfFileName,
//                     content: pdfBuffer,
//                     contentType: "application/pdf",
//                 },
//             ],
//         };

//         const info = await transporter.sendMail(mailOptions);

//         console.log(
//             "✅ Quotation email sent:",
//             info.messageId
//         );

//         return {
//             success: true,
//             messageId: info.messageId,
//         };

//     } catch (error) {
//         console.error(
//             "❌ Failed to send quotation email:",
//             error.response || error.message
//         );

//         throw error;
//     }
// }

async function sendQuotationEmail({
    customerEmail,
    data,
    calculation,
    quotation,
}) {
    try {
        // ==========================================
        // 1. GET GENERATED PDF BUFFER
        // ==========================================

        const pdfBuffer = quotation.pdfBuffer;

        if (!pdfBuffer) {
            throw new Error("PDF buffer is missing");
        }

        console.log("✅ PDF buffer received for email attachment");

        // ==========================================
        // 2. EMAIL OPTIONS
        // ==========================================

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,

            to: customerEmail,

            subject: `Solar Quotation - ${data.quotationId}`,

            html: `
<div style="
    margin:0;
    padding:30px 15px;
    background:#eef2f6;
    font-family:Arial,Helvetica,sans-serif;
    color:#1c2530;
">

    <div style="
        max-width:680px;
        margin:0 auto;
        background:#ffffff;
        border-radius:14px;
        overflow:hidden;
        border:1px solid #e2e8ee;
        box-shadow:0 4px 22px rgba(15,41,66,0.08);
    ">

        <!-- TOP BRAND HEADER -->
        <div style="
            background:#ffffff;
            padding:30px 30px 22px 30px;
            text-align:center;
        ">

            <img
               src="cid:lmarlogo"
                alt="LMAR Renewable Energy"
                style="
                    max-width:220px;
                    max-height:80px;
                    width:auto;
                    height:auto;
                    display:block;
                    margin:0 auto;
                "
            />

        </div>

        <!-- GRADIENT ACCENT (sun-orange to panel-navy via green) -->
        <div style="
            height:5px;
            background:linear-gradient(90deg,#f5a623 0%,#8fc63f 45%,#0f2942 100%);
        "></div>


        <!-- BODY -->
        <div style="
            padding:35px 32px;
        ">

            <p style="
                margin:0 0 18px;
                font-size:16px;
                color:#26332d;
            ">
                Dear
                <strong style="color:#0f2942;">
                    ${data.customerName || "Customer"}
                </strong>,
            </p>


            <p style="
                margin:0 0 15px;
                font-size:15px;
                line-height:1.7;
                color:#4b5563;
            ">
                Thank you for choosing
                <strong style="color:#0f2942;">
                    LMAR Renewable Energy
                </strong>
                for your solar energy requirements.
            </p>


            <p style="
                margin:0;
                font-size:15px;
                line-height:1.7;
                color:#4b5563;
            ">
                Please find your detailed solar quotation attached
                to this email in PDF format.
            </p>


            <!-- QUOTATION SUMMARY -->
            <div style="
                margin:30px 0;
                border:1px solid #e2e8ee;
                border-radius:12px;
                overflow:hidden;
            ">

                <div style="
                    background:#0f2942;
                    padding:16px 20px;
                    border-bottom:1px solid #e2e8ee;
                ">
                    <div style="
                        font-size:18px;
                        font-weight:bold;
                        color:#ffffff;
                    ">
                        Quotation Summary
                    </div>
                </div>


                <div style="
                    padding:20px;
                    background:#ffffff;
                ">

                    <table width="100%" cellpadding="0" cellspacing="0"
                        style="border-collapse:collapse;font-size:14px;">

                        <tr>
                            <td style="
                                padding:9px 0;
                                color:#6b7280;
                            ">
                                Quotation ID
                            </td>
                            <td style="
                                padding:9px 0;
                                text-align:right;
                                font-weight:bold;
                                color:#1c2530;
                            ">
                                ${data.quotationId || "-"}
                            </td>
                        </tr>

                        <tr>
                            <td style="
                                padding:9px 0;
                                color:#6b7280;
                            ">
                                Quotation Date
                            </td>
                            <td style="
                                padding:9px 0;
                                text-align:right;
                                font-weight:bold;
                                color:#1c2530;
                            ">
                                ${data.quotationDate || "-"}
                            </td>
                        </tr>

                        <tr>
                            <td style="
                                padding:9px 0;
                                color:#6b7280;
                            ">
                                System Size
                            </td>
                            <td style="
                                padding:9px 0;
                                text-align:right;
                                font-weight:bold;
                                color:#1c2530;
                            ">
                                ${calculation.systemSize || 0} kW
                            </td>
                        </tr>

                        <tr>
                            <td style="
                                padding:9px 0;
                                color:#6b7280;
                            ">
                                Panel Count
                            </td>
                            <td style="
                                padding:9px 0;
                                text-align:right;
                                font-weight:bold;
                                color:#1c2530;
                            ">
                                ${calculation.panelCount || 0}
                            </td>
                        </tr>

                        <tr>
                            <td colspan="2">
                                <div style="
                                    height:1px;
                                    background:#e5e7eb;
                                    margin:8px 0;
                                "></div>
                            </td>
                        </tr>

                        <tr>
                            <td style="
                                padding:10px 0;
                                color:#4b5563;
                            ">
                                Final Amount
                            </td>
                            <td style="
                                padding:10px 0;
                                text-align:right;
                                font-weight:bold;
                            ">
                                ₹${Number(
                calculation.finalAmount || 0
            ).toFixed(2)}
                            </td>
                        </tr>

                        <tr>
                            <td style="
                                padding:10px 0;
                                color:#4b5563;
                            ">
                                Subsidy
                            </td>
                            <td style="
                                padding:10px 0;
                                text-align:right;
                                font-weight:bold;
                                color:#3f8f2c;
                            ">
                                ₹${Number(
                calculation.subsidyAmount || 0
            ).toFixed(2)}
                            </td>
                        </tr>

                    </table>


                    <!-- CUSTOMER PAYABLE -->
                    <div style="
                        margin-top:15px;
                        padding:18px;
                        background:linear-gradient(90deg,#0f2942 0%,#173a5c 100%);
                        border-radius:9px;
                        border-left:4px solid #f5a623;
                    ">

                        <div style="
                            font-size:12px;
                            color:#cfe0ee;
                            text-transform:uppercase;
                            letter-spacing:.5px;
                        ">
                            Customer Payable
                        </div>

                        <div style="
                            margin-top:5px;
                            font-size:24px;
                            font-weight:bold;
                            color:#ffffff;
                        ">
                            ₹${Number(
                calculation.customerPayable || 0
            ).toFixed(2)}
                        </div>

                    </div>

                </div>
            </div>


            <!-- CTA / CONTACT -->
            <div style="
                margin-top:25px;
                padding:20px;
                background:#f2f6fa;
                border-left:4px solid #8fc63f;
                border-radius:6px;
            ">

                <p style="
                    margin:0;
                    font-size:14px;
                    line-height:1.7;
                    color:#4b5563;
                ">
                    Kindly review the attached quotation.
                    If you have any questions or require further
                    clarification, our team will be happy to assist you.
                </p>

            </div>


            <!-- SIGNATURE -->
            <div style="
                margin-top:32px;
                padding-top:25px;
                border-top:1px solid #e5e7eb;
            ">

                <p style="
                    margin:0;
                    font-size:14px;
                    line-height:1.7;
                    color:#4b5563;
                ">
                    Regards,
                </p>

                <p style="
                    margin:4px 0 0;
                    font-size:17px;
                    font-weight:bold;
                    color:#0f2942;
                ">
                    LMAR Renewable Energy
                </p>

                <p style="
                    margin:3px 0 0;
                    font-size:12px;
                    color:#8fc63f;
                    font-weight:bold;
                    letter-spacing:.5px;
                ">
                    ENERGY THAT NEVER SETS
                </p>

                <p style="
                    margin:10px 0 0;
                    font-size:14px;
                    font-weight:bold;
                    color:#0f2942;
                ">
                    📞 +91 8980805444
                </p>

            </div>

        </div>


        <!-- FOOTER -->
        <div style="
            background:#0f2942;
            padding:20px 25px;
            text-align:center;
        ">

            <p style="
                margin:0;
                color:#ffffff;
                font-size:12px;
                font-weight:bold;
            ">
                LMAR Renewable Energy
            </p>

            <p style="
                margin:6px 0 0;
                color:#a9c1d4;
                font-size:11px;
            ">
                Renewable Energy • Solar Solutions • Sustainable Future
            </p>

            <p style="
                margin:10px 0 0;
                color:#7f96a8;
                font-size:10px;
            ">
                This is an automated quotation email.
                © ${new Date().getFullYear()} LMAR Renewable Energy
            </p>

        </div>

    </div>

</div>
`,

            // ==========================================
            // 3. DIRECT PDF ATTACHMENT + LOGO
            // ==========================================

            // attachments: [
            //     {
            //         filename:
            //             `LMAR Quotation - ${data.quotationId}.pdf`,

            //         content: pdfBuffer,

            //         contentType: "application/pdf",
            //     },

            //     // Logo attachment — required so cid:lmarlogo in the
            //     // header actually resolves to an image (previously missing)
            //     {
            //         filename: "LMAR-LOGO.png",
            //         path: require("path").resolve(
            //             process.cwd(),
            //             "src",
            //             "assets",
            //             "LMAR-LOGO.png"
            //         ),
            //         cid: "lmarlogo",
            //         contentType: "image/png",
            //     },
            // ],
        };

        // ==========================================
        // 4. SEND EMAIL
        // ==========================================

        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: mailOptions.subject,
            html: mailOptions.html,
            attachments: [
                {
                    filename: `LMAR Quotation - ${data.quotationId}.pdf`,
                    content: pdfBuffer,
                },
                {
                    filename: "LMAR-LOGO.png",
                    path: path.resolve(process.cwd(), "src", "assets", "LMAR-LOGO.png"),
                    cid: "lmarlogo",
                    contentType: "image/png",
                },
            ],
        });

        console.log(`✅ Quotation email sent: ${info.messageId}`);

        return {
            success: true,
            messageId: info.messageId,
        };

        // if (error) {
        //     console.error("❌ Resend error:", error);
        //     throw new Error(error.message);
        // }

        // console.log(`✅ Quotation email sent: ${info.id}`);

        // return {
        //     success: true,
        //     messageId: info.id,
        // };

    } catch (error) {

        console.error(
            "❌ Failed to send quotation email:",
            error.response?.data || error.message
        );

        throw error;
    }
}


async function sendInternalQuotationEmail({
    agentEmail,
    data,
    calculation,
    quotation,
}) {
    try {
        if (!agentEmail) {
            throw new Error("Agent email is required");
        }

        if (!quotation?.pdfBuffer) {
            throw new Error("Internal quotation PDF buffer is missing");
        }

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
            to: agentEmail,
            subject: `Internal Solar Quotation - ${data.quotationId}`,

            html: `
                <div style="
                    margin:0;
                    padding:30px 15px;
                    background:#eef2f6;
                    font-family:Arial, Helvetica, sans-serif;
                    color:#1c2530;
                ">

                    <!-- MAIN CONTAINER -->
                    <div style="
                        max-width:700px;
                        margin:0 auto;
                        background:#ffffff;
                        border-radius:14px;
                        overflow:hidden;
                        box-shadow:0 4px 22px rgba(15,41,66,0.10);
                    ">

                        <!-- HEADER -->
                        <div style="
                            background:#ffffff;
                            padding:30px 35px 22px 35px;
                            text-align:center;
                            border-bottom:1px solid #eef1f4;
                        ">

                            <!-- LOGO -->
                            <img
                                  src="cid:lmar-logo"
                                alt="LMAR Renewable Energy"
                                style="
                                    max-width:220px;
                                    max-height:80px;
                                    object-fit:contain;
                                    display:block;
                                    margin:0 auto;
                                "
                            />

                        </div>

                        <!-- GRADIENT ACCENT (sun-orange to panel-navy via green) -->
                        <div style="
                            height:5px;
                            background:linear-gradient(90deg,#f5a623 0%,#8fc63f 45%,#0f2942 100%);
                        "></div>


                        <!-- TITLE SECTION -->
                        <div style="
                            padding:30px 35px 10px 35px;
                        ">

                            <div style="
                                display:inline-block;
                                background:#eaf3ff;
                                color:#0f2942;
                                padding:7px 14px;
                                border-radius:20px;
                                font-size:12px;
                                font-weight:bold;
                                letter-spacing:.5px;
                            ">
                                INTERNAL QUOTATION
                            </div>

                            <h1 style="
                                margin:16px 0 8px 0;
                                color:#0f2942;
                                font-size:25px;
                                line-height:1.3;
                            ">
                                Quotation Generated Successfully
                            </h1>

                            <p style="
                                margin:0;
                                color:#667382;
                                font-size:14px;
                                line-height:1.6;
                            ">
                                The internal quotation for this solar project
                                has been generated and is attached to this email.
                            </p>

                        </div>


                        <!-- QUOTATION INFORMATION -->
                        <div style="
                            margin:25px 35px;
                            border:1px solid #e2e8ee;
                            border-radius:12px;
                            overflow:hidden;
                        ">

                            <div style="
                                background:#0f2942;
                                padding:15px 20px;
                                color:#ffffff;
                                font-size:16px;
                                font-weight:bold;
                            ">
                                Quotation Details
                            </div>

                            <table style="
                                width:100%;
                                border-collapse:collapse;
                                font-size:14px;
                            ">

                                <tr>
                                    <td style="
                                        padding:13px 20px;
                                        border-bottom:1px solid #f0f2f5;
                                        color:#667382;
                                        width:45%;
                                    ">
                                        <strong>Quotation ID</strong>
                                    </td>

                                    <td style="
                                        padding:13px 20px;
                                        border-bottom:1px solid #f0f2f5;
                                        color:#1c2530;
                                    ">
                                        ${data.quotationId || "-"}
                                    </td>
                                </tr>

                                <tr>
                                    <td style="
                                        padding:13px 20px;
                                        border-bottom:1px solid #f0f2f5;
                                        color:#667382;
                                    ">
                                        <strong>Customer</strong>
                                    </td>

                                    <td style="
                                        padding:13px 20px;
                                        border-bottom:1px solid #f0f2f5;
                                    ">
                                        ${data.customerName || "-"}
                                    </td>
                                </tr>

                                <tr>
                                    <td style="
                                        padding:13px 20px;
                                        border-bottom:1px solid #f0f2f5;
                                        color:#667382;
                                    ">
                                        <strong>System Size</strong>
                                    </td>

                                    <td style="
                                        padding:13px 20px;
                                        border-bottom:1px solid #f0f2f5;
                                    ">
                                        ${calculation.systemSize || 0} kW
                                    </td>
                                </tr>

                                <tr>
                                    <td style="
                                        padding:13px 20px;
                                        border-bottom:1px solid #f0f2f5;
                                        color:#667382;
                                    ">
                                        <strong>Final Amount</strong>
                                    </td>

                                    <td style="
                                        padding:13px 20px;
                                        border-bottom:1px solid #f0f2f5;
                                        font-weight:bold;
                                    ">
                                        ₹${Number(
                calculation.finalAmount || 0
            ).toFixed(2)}
                                    </td>
                                </tr>

                                <tr>
                                    <td style="
                                        padding:13px 20px;
                                        border-bottom:1px solid #f0f2f5;
                                        color:#667382;
                                    ">
                                        <strong>Subsidy</strong>
                                    </td>

                                    <td style="
                                        padding:13px 20px;
                                        border-bottom:1px solid #f0f2f5;
                                        color:#3f8f2c;
                                    ">
                                        ₹${Number(
                calculation.subsidyAmount || 0
            ).toFixed(2)}
                                    </td>
                                </tr>

                                <tr>
                                    <td style="
                                        padding:15px 20px;
                                        color:#0f2942;
                                        font-weight:bold;
                                        background:#f7f9fb;
                                    ">
                                        Customer Payable
                                    </td>

                                    <td style="
                                        padding:15px 20px;
                                        color:#0f2942;
                                        font-size:17px;
                                        font-weight:bold;
                                        background:#f7f9fb;
                                    ">
                                        ₹${Number(
                calculation.customerPayable || 0
            ).toFixed(2)}
                                    </td>
                                </tr>

                            </table>

                        </div>


                        <!-- DEALER COMMISSION -->
                        <div style="
                            margin:25px 35px;
                            background:#fff9ec;
                            border:1px solid #f5dfa0;
                            border-radius:12px;
                            overflow:hidden;
                        ">

                            <div style="
                                background:#f5a623;
                                padding:14px 20px;
                                color:#3a2a06;
                                font-size:16px;
                                font-weight:bold;
                            ">
                                Dealer Commission
                            </div>

                            <div style="
                                padding:18px 20px;
                                font-size:15px;
                            ">

                                <div style="
                                    padding-bottom:10px;
                                    border-bottom:1px solid #f2e3bb;
                                ">
                                    <strong>Fixed Dealer Margin:</strong>
                                    ₹${Number(
                calculation.fixedDealerMargin || 0
            ).toFixed(2)}
                                </div>

                                <div style="
                                    padding:10px 0;
                                    border-bottom:1px solid #f2e3bb;
                                ">
                                    <strong>Additional Margin:</strong>
                                    ₹${Number(
                calculation.additionalDealerMargin || 0
            ).toFixed(2)}
                                </div>

                                <div style="
                                    padding-top:12px;
                                    color:#0f2942;
                                    font-size:18px;
                                ">
                                    <strong>Total Dealer Margin:</strong>
                                    ₹${Number(
                calculation.totalDealerMargin || 0
            ).toFixed(2)}
                                </div>

                            </div>

                        </div>


                        <!-- ATTACHMENT NOTICE -->
                        <div style="
                            margin:25px 35px;
                            padding:18px 20px;
                            background:#f2f6fa;
                            border-left:4px solid #8fc63f;
                            border-radius:6px;
                        ">

                            <p style="
                                margin:0;
                                font-size:14px;
                                color:#4c5866;
                                line-height:1.6;
                            ">
                                <strong style="color:#0f2942;">
                                    PDF Attached
                                </strong>
                                <br>
                                Please find the internal quotation PDF
                                attached with this email for your records.
                            </p>

                        </div>


                        <!-- SIGNATURE -->
                        <div style="
                            padding:10px 35px 35px 35px;
                        ">

                            <p style="
                                margin:0;
                                font-size:15px;
                                line-height:1.7;
                                color:#3f4b58;
                            ">
                                Regards,<br>

                                <strong style="
                                    color:#0f2942;
                                    font-size:16px;
                                ">
                                    LMAR Renewable Energy
                                </strong>

                                <br>

                                <span style="
                                    color:#8fc63f;
                                    font-size:13px;
                                    font-weight:bold;
                                    letter-spacing:.5px;
                                ">
                                    ENERGY THAT NEVER SETS
                                </span>

                                <br><br>

                                <span style="
                                    color:#0f2942;
                                    font-size:13px;
                                    font-weight:bold;
                                ">
                                    +91 8980805444
                                </span>
                            </p>

                        </div>


                        <!-- FOOTER -->
                        <div style="
                            background:#0f2942;
                            padding:20px 30px;
                            text-align:center;
                            color:#ffffff;
                        ">

                            <div style="
                                font-size:12px;
                                opacity:.9;
                                line-height:1.6;
                            ">
                                This is an automated internal quotation email.
                            </div>

                            <div style="
                                margin-top:6px;
                                font-size:11px;
                                opacity:.65;
                            ">
                                © ${new Date().getFullYear()}
                                LMAR Renewable Energy
                            </div>

                        </div>

                    </div>

                </div>
            `,

            attachments: [
                {
                    filename: `LMAR Internal Quotation - ${data.quotationId}.pdf`,
                    content: quotation.pdfBuffer,
                    contentType: "application/pdf",
                },
                {
                    filename: "LMAR-LOGO.png",
                    path: require("path").resolve(process.cwd(), "src", "assets", "LMAR-LOGO.png"),
                    cid: "lmar-logo",
                    contentType: "image/png",
                },
            ],
        };

        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
            to: agentEmail,
            subject: mailOptions.subject,
            html: mailOptions.html,
            attachments: [
                {
                    filename: `LMAR Internal Quotation - ${data.quotationId}.pdf`,
                    content: quotation.pdfBuffer,
                    contentType: "application/pdf",
                },
            ],
        });

        console.log(`✅ Quotation email sent: ${info.messageId}`);

        return {
            success: true,
            messageId: info.messageId,
        };

        // if (error) {
        //     console.error("❌ Resend error:", error);
        //     throw new Error(error.message);
        // }

        // console.log(`✅ Internal quotation email sent to agent: ${agentEmail}`);
        // console.log(`📧 Message ID: ${info.id}`);

        // return {
        //     success: true,
        //     messageId: info.id,
        // };

    } catch (error) {
        console.error(
            "❌ Failed to send internal quotation email:",
            error.response?.data || error.message
        );

        throw error;
    }
}
module.exports = {

    transporter,

    verifyEmailConnection,

    generateQuotationEmailHTML,

    sendQuotationEmail,
    sendInternalQuotationEmail,

};