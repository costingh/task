const express = require("express");
const router = express.Router();
const { Worker } = require("worker_threads");
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");
const { enrichAndSaveData } = require("../enrichAndSaveData");

router.post("/", async (req, res) => {
    const csvFilePath = path.join(__dirname, "../files/sample-websites.csv");
    const companyDetailsFile = path.join(__dirname, "../files/sample-websites-company-names.csv");

    try {
        const websites = await readCSV(csvFilePath);
        const companyDetails = await readCompanyDetails(companyDetailsFile);

        console.log(`Scraping ${websites.length} websites with worker threads...`);

        const scrapePromises = websites.map(scrapeWithWorker);
        const results = await Promise.all(scrapePromises);

        const processedData = await enrichAndSaveData(results, companyDetails);

        const successfulScrapes = results.filter(result => result !== null);
        const totalScraped = successfulScrapes.length;

        let totalPhoneNumbers = 0;
        let totalSocialLinks = 0;
        
        successfulScrapes.forEach(result => {
            totalPhoneNumbers += result.phoneNumbers.length;
            totalSocialLinks += result.socialLinks.length;
        });

        const phoneFillRate = totalScraped > 0 ? (totalPhoneNumbers / totalScraped).toFixed(2) : "0.00";
        const socialFillRate = totalScraped > 0 ? (totalSocialLinks / totalScraped).toFixed(2) : "0.00";

        res.json({
            success: true,
            totalWebsites: websites.length,
            totalScraped,
            coverage: ((totalScraped / websites.length) * 100).toFixed(2) + "%",
            phoneFillRate,
            socialFillRate,
            data: processedData
        });
    } catch (error) {
        console.error("Error processing CSV:", error);
        res.status(500).json({ error: "Failed to process CSV" });
    }
});

async function readCompanyDetails(filePath) {
    return new Promise((resolve, reject) => {
        const companyData = {};
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
                if (row.domain) {
                    companyData[`https://${row.domain}`] = {
                        commercialName: row.company_commercial_name || null,
                        legalName: row.company_legal_name || null,
                        allNames: row.company_all_available_names || null,
                    };
                }
            })
            .on("end", () => resolve(companyData))
            .on("error", (error) => reject(error));
    });
}

async function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        const websites = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
                if (row.domain) websites.push(`https://${row.domain}`);
            })
            .on("end", () => resolve(websites))
            .on("error", (error) => reject(error));
    });
}

function scrapeWithWorker(url) {
    return new Promise((resolve, reject) => {
        const workerPath = path.join(__dirname, "../worker.js");
        const worker = new Worker(workerPath, { workerData: { url } });
        
        worker.on("message", resolve);
        worker.on("error", reject);
        worker.on("exit", (code) => {
            if (code !== 0) reject(new Error(`Worker stopped with code ${code}`));
        });
    });
}

module.exports = router;
