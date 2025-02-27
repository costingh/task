node server.js
curl -X POST http://localhost:3000/scrape-all


search for a company

curl -X POST "http://localhost:3000/search-company" \
-H "Content-Type: application/json" \
-d '{
      "name": "Acorn Law P.C.",
      "website": "https://acornlawpc.com",
      "phone": "(786) 426-3492",
      "facebook": "https://www.facebook.com/acornfurnitureworkshops"
    }'




create index

curl -X POST 'http://localhost:7700/indexes' \
--header 'Content-Type: application/json' \
--data '{
  "uid": "companies",
  "primaryKey": "url"
}'

curl -X PATCH 'http://localhost:7700/indexes/companies' \
--header 'Content-Type: application/json' \
--data '{
  "primaryKey": "url"
}'

query data

curl -X GET 'http://localhost:7700/indexes/companies/search' \
--header 'Content-Type: application/json' \
--data '{
  "q": "kansaslimousin"
}'


result 
{"hits":[],"query":"","processingTimeMs":0,"limit":20,"offset":0,"estimatedTotalHits":0}


curl -X DELETE 'http://localhost:7700/indexes/companies/documents'

curl -X GET 'http://localhost:7700/indexes/companies/documents' \
-H 'Authorization: Bearer GNvZfNWOp_TJreIoda48MJsxQ6M3hAOgotl17Sh_Gvk'


 ./meilisearch --master-key "GNvZfNWOp_TJreIoda48MJsxQ6M3hAOgotl17Sh_Gvk" --log-level debug




 ## search
 $ curl -X POST "http://localhost:3000/search-company" \
-H "Content-Type: application/json" \
-d '{
      "name": "Pro-Exec Staffing LLC.",
      "website": "https://proexecstaffing.com",
      "phone": "713-248-2245",
      "facebook": "https://www.facebook.com/proexecstaffing"
    }'
{"success":true,"bestMatch":{"id":24,"commercialName":"Pro-Exec Staffing LLC.","legalName":"Pro-Exec Staffing LLC.","allNames":"Pro-Exec Staffing LLC. | Pro Exec Staffing","_formatted":{"id":"24","commercialName":"<em>Pro-Exec Staffing LLC</em>.","legalName":"<em>Pro-Exec Staffing LLC</em>.","allNames":"<em>Pro-Exec Staffing LLC</em>. | Pro Exec Staffing"}}}




curl -X POST "http://localhost:3000/test-search"
{"success":true,"metrics":{"totalSearches":32,"successfulMatches":5,"successRate":"15.63%"}}
