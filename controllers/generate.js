const puppeteer = require("puppeteer-core");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const createS3Client = require("../configurations/bucketConfig");
const s3 = createS3Client();

module.exports = {
  async test(req, res) {
    res.json({ message: "Test endpoint is working!" });
  },
  async generatePdf(req, res) {
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
      const fileName = `receipt_pdfs/output-${uuidv4()}.pdf`;

      const bucketName = process.env.AWS_BUCKET_NAME;
      const PUBLIC_STORAGE_BASE_URL = process.env.PUBLIC_STORAGE_BASE_URL;

      // Upload to S3 using PutObjectCommand
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: pdfBuffer,
        ContentType: "application/pdf",
        ACL: "public-read", // Make the file publicly readable
      });

      await s3.send(command);

      const publicUrl = `${PUBLIC_STORAGE_BASE_URL}${fileName}`;
      res.json({ success: true, url: publicUrl });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },
  async generateImage(req, res) {
    try {
      const { html } = req.body;
      // Generate image using Puppeteer

      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath:
          process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium",
      });

      //   const page = await browser.newPage();
      //   await page.setContent(html);
      //   const imageBuffer = await page.screenshot({ fullPage: true });
      const page = await browser.newPage();
      // await page.setViewport({ width: 430, height: 581 }); // <-- match your body size
      await page.setViewport({ width: 360, height: 456 }); // <-- match your body size

      await page.setContent(html, { waitUntil: "networkidle0" });
      const imageBuffer = await page.screenshot({ fullPage: false }); // fullPage false = crop to viewport
      await browser.close();

      // Generate a unique filename
      const fileName = `receipt_images/output-${uuidv4()}.jpg`;
      const bucketName = process.env.AWS_BUCKET_NAME;
      const PUBLIC_STORAGE_BASE_URL = process.env.PUBLIC_STORAGE_BASE_URL;
      // Upload to S3 using PutObjectCommand
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: imageBuffer,
        ContentType: "image/jpeg",
        ACL: "public-read", // Make the image publicly readable
      });

      await s3.send(command);

      const publicUrl = `${PUBLIC_STORAGE_BASE_URL}${fileName}`;
      res.json({ success: true, url: publicUrl });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },
};
