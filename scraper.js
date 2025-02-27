const axios = require("axios");
const cheerio = require("cheerio");

async function scrapeWebsite(url) {
    try {
        console.log(`Scraping ${url}...`);
        const { data } = await axios.get(url, { timeout: 5000 });
        const $ = cheerio.load(data);

        const phoneNumbers = $("a[href^='tel:']")
            .map((i, el) => $(el).attr("href").replace("tel:", ""))
            .get();
        const socialLinks = $("a[href*='facebook.com'], a[href*='twitter.com'], a[href*='linkedin.com']")
            .map((i, el) => $(el).attr("href"))
            .get();

        let result = { url, phoneNumbers, socialLinks };

        return result;
    } catch (error) {
        console.error(`Error scraping ${url}:`, error.message);
        return null;
    }
}

module.exports = { scrapeWebsite };
