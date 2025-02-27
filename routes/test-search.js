const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");
const axios = require("axios");
const path = require("path");

const router = express.Router();

async function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        const companies = [];
        let isFirstRow = true;

        fs.createReadStream(filePath)
            .pipe(csv({ headers: false }))
            .on("data", (row) => {
                if (isFirstRow) {
                    isFirstRow = false;
                    return;
                }
                const [name, phone, website, facebook] = Object.values(row).map((val) => val.trim());
                companies.push({ name, phone, website, facebook });
            })
            .on("end", () => resolve(companies))
            .on("error", (error) => reject(error));
    });
}

async function searchCompany(company) {
    console.log(company)
    try {
        const response = await axios.post('http://localhost:3000/search-company', company, {
            headers: { "Content-Type": "application/json" },
        });
        return { input: company, bestMatch: response.data.bestMatch || null };
    } catch (error) {
        return { input: company, error: error.response?.data || "Request failed" };
    }
}

router.post("/", async (req, res) => {
    try {
        const csvFilePath = path.join(__dirname, "../files/API-input-sample.csv");
        const companies = await readCSV(csvFilePath);
        const results = await Promise.all(companies.map(searchCompany));
        const metrics = computeSearchMetrics(results);
        res.json({ success: true, metrics });
    } catch (error) {
        console.error("Error in /test-search:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

function computeSearchMetrics(results) {
    const total = results.length;
    const matches = results.filter((res) => res.bestMatch).length;
    const successRate = ((matches / total) * 100).toFixed(2);

    return {
        totalSearches: total,
        successfulMatches: matches,
        successRate: `${successRate}%`,
    };
}

module.exports = router;
