function verifyApiSecret(req, res, next) {

    const receivedSecret = req.headers["x-api-secret"];

    const actualSecret = process.env.NODE_API_SECRET;

    if (!receivedSecret) {
        return res.status(401).json({
            success: false,
            message: "API secret missing"
        });
    }

    if (receivedSecret !== actualSecret) {
        return res.status(401).json({
            success: false,
            message: "Invalid API secret"
        });
    }

    next();
}

module.exports = {
    verifyApiSecret
};