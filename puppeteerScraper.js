const puppeteer = require("puppeteer");

async function scrapeWithPuppeteer(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const data = await page.evaluate(() => {
        return {
            phoneNumbers: [...document.querySelectorAll("a[href^='tel:']")].map(a => a.href),
            socialLinks: [...document.querySelectorAll("a[href*='facebook.com'], a[href*='twitter.com'], a[href*='linkedin.com']")].map(a => a.href),
        };
    });

    await browser.close();
    return { url, ...data };
}

module.exports = { scrapeWithPuppeteer };
