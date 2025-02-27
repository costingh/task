const express = require("express");
const router = express.Router();
const { MeiliSearch } = require("meilisearch");

const client = new MeiliSearch({
    host: "http://localhost:7700",
    apiKey: "GNvZfNWOp_TJreIoda48MJsxQ6M3hAOgotl17Sh_Gvk",
});

router.post("/", async (req, res) => {
    try {
        const { name, website, phone, facebook } = req.body;

        if (!name && !website && !phone && !facebook) {
            return res.status(400).json({ error: "At least one search field is required" });
        }

        const index = client.index("companies");

        const queries = [];
        if (name) queries.push(name); 
        if (website) queries.push(website);
        if (phone) queries.push(phone);
        if (facebook) queries.push(facebook);
        
        const query = queries.join(" ");

        const searchResults = await index.search(query, {
            limit: 10, 
            attributesToRetrieve: ["id", "commercialName", "legalName", "allNames", "website", "phoneNumbers", "socialLinks"],
            attributesToHighlight: ["commercialName", "legalName", "allNames"],
        });

        if (searchResults.hits.length === 0) {
            return res.status(404).json({ message: "No company match found." });
        }

        const rankedResults = searchResults.hits.sort((a, b) => {
            let scoreA = 0, scoreB = 0;

            if (a.website === website) scoreA += 4;
            if (b.website === website) scoreB += 4;

            if (a.phoneNumbers?.includes(phone)) scoreA += 3;
            if (b.phoneNumbers?.includes(phone)) scoreB += 3;

            if (a.socialLinks?.includes(facebook)) scoreA += 2;
            if (b.socialLinks?.includes(facebook)) scoreB += 2;

            if (a.commercialName?.toLowerCase() === name?.toLowerCase()) scoreA += 1;
            if (b.commercialName?.toLowerCase() === name?.toLowerCase()) scoreB += 1;

            return scoreB - scoreA;
        });

        res.json({ success: true, bestMatch: rankedResults[0] });
    } catch (error) {
        console.error("Error in /search-company:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
