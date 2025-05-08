require("dotenv").config();
const express = require("express");
const puppeteer = require("puppeteer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

// AWS S3 config
// const bucketName = process.env.AWS_BUCKET_NAME;
// const region = process.env.AWS_REGION; // e.g., "ap-south-1"
const bucketName = "utsav-dev-s3-bucket"; // Replace with your bucket name
const region = "ap-south-1"; // Replace with your bucket region
const AWS_ACCESS_KEY_ID = "AKIAYS2NUCVX6BMC3TGI"; // Replace with your access key
const AWS_SECRET_ACCESS_KEY = "5/ZFW7xWFRVwalQyfRRJ16WUcMUTWggxU1WXTfgl"; // Replace with your secret key
const PUBLIC_STORAGE_BASE_URL = "https://utsav-dev-v2-media.gumlet.io/";

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID, // Recommended: use .env file
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

app.post("/generate-pdf", async (req, res) => {
  try {
    const { html } = req.body;

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html);
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    // Generate a unique filename
    const fileName = `pdfs/output-${uuidv4()}.pdf`;

    // Upload to S3 using PutObjectCommand
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: pdfBuffer,
      ContentType: "application/pdf",
      //   ACL: "public-read", // 👈 Public access to file
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
