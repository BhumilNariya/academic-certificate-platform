const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const { generateQRCodeDataURI } = require('./qr');

async function renderTemplateToPdf(templateHtmlPath, data, outputPath) {
  // templateHtmlPath: path to EJS/HTML template file
  const html = await ejs.renderFile(templateHtmlPath, data, {});
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox','--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // produce PDF
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '10mm', bottom: '10mm' }
  });

  await browser.close();
  return outputPath;
}

/*
Usage:
- create an EJS template that uses placeholders like <%= studentName %>, <%= qrDataUri %>
- call generateQRCodeDataURI with the certificateId or URL
*/
module.exports = { renderTemplateToPdf };
