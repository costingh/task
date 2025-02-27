const express = require("express");
const dotenv = require("dotenv");
const searchRoute = require("./routes/search");
const scrapeRoute = require("./routes/scrape-company-list.js");
const testSearchRoute = require("./routes/test-search.js");

dotenv.config();
const app = express();
app.use(express.json());

app.use("/search-company", searchRoute);
app.use("/scrape-all", scrapeRoute);
app.use("/test-search", testSearchRoute);

app.listen(3000, () => console.log("Server running on port 3000"));
