require("dotenv").config();
const express = require("express");
const puppeteer = require("puppeteer-core");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const createS3Client = require("./configurations/bucketConfig");
const s3 = createS3Client();

const app = express();
app.use(express.json());

app.post("/generate-pdf", async (req, res) => {
  try {
    const { html } = req.body;

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath:
        process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium",
    });

    const page = await browser.newPage();
    await page.setContent(html);
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    // Generate a unique filename
    const fileName = `pdfs/output-${uuidv4()}.pdf`;

    const bucketName = process.env.AWS_BUCKET_NAME;
    const PUBLIC_STORAGE_BASE_URL = process.env.PUBLIC_STORAGE_BASE_URL;

    // Upload to S3 using PutObjectCommand
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: pdfBuffer,
      ContentType: "application/pdf",
    });

    await s3.send(command);

    const publicUrl = `${PUBLIC_STORAGE_BASE_URL}${fileName}`;
    res.json({ success: true, url: publicUrl });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(8080, () => {
  console.log("Listening on port 8080");
});
