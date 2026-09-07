const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const quotationRoutes = require("./routes/quotation.routes");
const googleRoutes = require("./routes/google.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "LMAR Quotation API is running"
    });
});

app.use("/oauth2", googleRoutes);
app.use("/api/quotation", quotationRoutes);

const PORT = process.env.PORT || 5000;

app.get("/privacy", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Privacy Policy - LMAR Quotation Automation</title>
      </head>
      <body>
        <h1>Privacy Policy</h1>
        <p>LMAR Quotation Automation uses Google APIs to create documents,
        store quotation files, and send quotation emails.</p>

        <p>We only use Google account data required for these operations.</p>

        <p>We do not sell or share personal information with third parties
        except where required to provide the requested service.</p>

        <p>For questions, contact the application administrator.</p>
      </body>
    </html>
  `);
});

app.get("/terms", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Terms of Service - LMAR Quotation Automation</title>
      </head>
      <body>
        <h1>Terms of Service</h1>
        <p>LMAR Quotation Automation is an internal quotation automation
        service.</p>

        <p>The service is provided to authorized users for creating,
        managing, and sending quotations.</p>

        <p>Users are responsible for the information they submit to the
        system.</p>

        <p>For questions, contact the application administrator.</p>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
    console.log(`LMAR Quotation API running on port ${PORT}`);
});