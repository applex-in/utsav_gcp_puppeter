const express = require("express");
const { generatePdf, test, generateImage } = require("../controllers/generate");
const router = express.Router({ mergeParams: true });

router.get("/test", test);
router.post("/generate-pdf", generatePdf);
router.post('/generate-image', generateImage)


module.exports = router;
