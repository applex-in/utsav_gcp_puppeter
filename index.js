const express = require("express");
const puppeteer = require("puppeteer");
const app = express();

app.use(express.json());

app.post("/generate-pdf", async (req, res) => {
  const { html } = req.body;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(html);
  const pdfBuffer = await page.pdf({ format: "A4" });
  await browser.close();

  res.type("application/pdf").send(pdfBuffer);
});

app.listen(8080, () => {
  console.log("Listening on port 8080");
});
