const { parentPort, workerData } = require("worker_threads");
const { scrapeWebsite } = require("./scraper");

(async () => {
    try {
        const result = await scrapeWebsite(workerData.url);
        parentPort.postMessage(result);
    } catch (error) {
        parentPort.postMessage(null);
    }
})();
