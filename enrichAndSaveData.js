const { MeiliSearch } = require("meilisearch");

const client = new MeiliSearch({
	host: "http://localhost:7700",
	apiKey: "GNvZfNWOp_TJreIoda48MJsxQ6M3hAOgotl17Sh_Gvk",
    timeout: 100000,
});

async function enrichAndSaveData(results, companyDetails) {
    try {
        const enrichedData = results
            .filter((result) => result !== null)
            .map((result, index) => {
                return {
                    id: index + 1,
                    ...result,
                    ...companyDetails[result.url],
                };
            });

        const batchSize = 10;
        for (let i = 0; i < enrichedData.length; i += batchSize) {
            const batch = enrichedData.slice(i, i + batchSize);
            try {
                const response = await client.index("companies").addDocuments(batch);
                console.log(`Data saved (batch ${Math.floor(i / batchSize) + 1})`, response);
            } catch (batchError) {
                console.error(`Error saving batch ${Math.floor(i / batchSize) + 1}:`, batchError);
            }
        }

        return enrichedData;
    } catch (error) {
        console.error("Error saving data:", error);
    }
}


module.exports = { enrichAndSaveData };
