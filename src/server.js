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

app.listen(PORT, () => {
    console.log(`LMAR Quotation API running on port ${PORT}`);
});