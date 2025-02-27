## Overview

This project is a React-based web application that uses Tailwind CSS for styling. It features interactive components, animations via Framer Motion, and responsive design.

## Installation

To set up the project locally, follow these steps:

```bash
git clone <repository_url>
cd <project_directory>
npm install
```

### Running the Project

Start the development server with:

```javascript
node server.js
```

Node.js is **single-threaded**, meaning that CPU-intensive tasks (like web scraping) can block the event loop and slow down the application. To avoid this, I implemented **Worker Threads**, which allow us to run multiple scraping tasks concurrently, leveraging multi-core processors for efficiency.

### Implementation Details

1. **Worker Threads for Parallel Scraping**
   - Each worker handles a subset of URLs to scrape.
   - The main thread distributes URLs across multiple workers.

2. **Data Extraction Logic**
   - Used `puppeteer` for headless browsing to handle dynamic content.
   - Used `cheerio` for parsing and extracting data from HTML efficiently.

3. **Data Storage**
   - Scraped data is enriched and stored in Mielliesearch.
   - The processed data is then used for further analysis.

## Data Analysis

### Overview

Once the web scraping process is completed, we run an analysis to measure its effectiveness. Our analysis focuses on:

- **Coverage:** How many websites were successfully scraped compared to the total attempted.
- **Data Fill Rates:** How many phone numbers and social media links were extracted per successfully scraped website. (This could've been improved by counting just 1 if a website has > 1 phone numbers)

### Metrics Tracked

#### **Coverage**  
The total number of websites attempted versus successfully scraped:

- **Total Websites:** The number of domains read from the CSV input.
- **Successfully Scraped Websites:** Websites that returned valid data.
- **Coverage Rate:** `(Total Successfully Scraped / Total Websites) * 100%`

#### **Phone Number Fill Rate**  
The average number of phone numbers extracted per successfully scraped website:

- **Total Phone Numbers Extracted**: The sum of all phone numbers scraped.
- **Phone Fill Rate:** `(Total Phone Numbers / Total Successfully Scraped)`

#### **Social Media Links Fill Rate**  
The average number of social media links extracted per successfully scraped website:

- **Total Social Media Links Extracted**: The sum of all social links scraped.
- **Social Fill Rate:** `(Total Social Links / Total Successfully Scraped)`

### Example Analysis Output

```json
{
  "success": true,
  "totalWebsites": 500,
  "totalScraped": 450,
  "coverage": "90.00%",
  "phoneFillRate": "1.75",
  "socialFillRate": "2.40",
  "data": [...]
}

## Data Retrieval

### Storing the Data

After extracting data through web scraping and enriching it with additional company details from `sample-websites-company-names.csv`, the final dataset is stored in **Meilisearch**, a fast and efficient search engine.

The goal is to store the data in a format that allows querying by **multiple datapoints**, such as:
- Company name (commercial or legal)
- Website URL
- Phone number
- Social media profiles

#### **Implementation Details**
- Data is merged with the CSV to include **commercial names, legal names, and all available company names**.
- The enriched data is then stored in batches in Meilisearch to optimize performance.

#### **Storing Data in Meilisearch**
The `enrichAndSaveData` function:
1. Filters out `null` results from the scraping step.
2. Maps the results to include additional company details.
3. Saves the data in Meilisearch in **batches of 10** for efficiency.

## Querying the Data

Once the data is stored, we implement a REST API that allows searching for a company profile using one or multiple datapoints:

## Searchable Fields

Users can search by:

Company name (commercial or legal)
Website URL
Phone number
Facebook profile
Matching Algorithm
The API uses Meilisearch to retrieve potential matches. Results are scored and ranked based on:

Exact website match → Highest priority (+4 points)
Phone number match → High priority (+3 points)
Social media profile match → Medium priority (+2 points)
Company name match → Low priority (+1 point)
The best-matching company profile is returned as the response.

## How to run server locally (you must have Meilisearch installed locally and started in background)

```bash
node server.js
curl -X POST http://localhost:3000/scrape-all
```

## Create index in Meilisearch

```bash
curl -X POST 'http://localhost:7700/indexes' \
--header 'Content-Type: application/json' \
--data '{
  "uid": "companies",
  "primaryKey": "id"
}'
```

## Delete all documents from index

```bash
curl -X DELETE 'http://localhost:7700/indexes/companies/documents'
```

## How to start database locally

```bash
./meilisearch --master-key "GNvZfNWOp_TJreIoda48MJsxQ6M3hAOgotl17Sh_Gvk" --log-level debug
```

## API to search for a company

```bash
$ curl -X POST "http://localhost:3000/search-company" \
-H "Content-Type: application/json" \
-d '{
      "name": "Pro-Exec Staffing LLC.",
      "website": "https://proexecstaffing.com",
      "phone": "713-248-2245",
      "facebook": "https://www.facebook.com/proexecstaffing"
    }'
```

## Response example

```javascript
{"success":true,"bestMatch":{"id":24,"commercialName":"Pro-Exec Staffing LLC.","legalName":"Pro-Exec Staffing LLC.","allNames":"Pro-Exec Staffing LLC. | Pro Exec Staffing","_formatted":{"id":"24","commercialName":"<em>Pro-Exec Staffing LLC</em>.","legalName":"<em>Pro-Exec Staffing LLC</em>.","allNames":"<em>Pro-Exec Staffing LLC</em>. | Pro Exec Staffing"}}}
```

## Results of testing the search with the given input

```bash
curl -X POST "http://localhost:3000/test-search"
{"success":true,"metrics":{"totalSearches":32,"successfulMatches":5,"successRate":"15.63%"}}
```