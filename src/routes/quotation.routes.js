const express = require("express");

const {
    receiveFormSubmission
} = require("../controllers/quotation.controller");

const {
    verifyApiSecret
} = require("../middleware/auth.middleware");

const router = express.Router();

router.post(
    "/form-submit",
    verifyApiSecret,
    receiveFormSubmission
);

router.post(
    "/test-customer-quotation",
    receiveFormSubmission
);

module.exports = router;