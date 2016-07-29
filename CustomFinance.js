var request = require("request"),
    cheerio = require("cheerio"),
    target = "https://www.google.com/finance/company_news?q=NASDAQ%3AYHOO";

function scrapeGoogle(page) {
    return new Promise(function(resolve, reject) {
        var scrape = [];
        request(page, function(error, response, body) //Request to Google Finance News
            {
                if (error) {
                    reject(Error(request.error))
                } else if (response.statusCode == 200) {
                    var $ = cheerio.load(body);
                    var secondURLreg = new RegExp("[^http]http.+(?=&cid)")
                    $("a", "#news-main").each((i, element) => {
                        var url = element.attribs.href
                        if (url.startsWith("http")) {
                            scrape.push(url.match(secondURLreg)[0].substring(1));
                        }
                    });
                    resolve(scrape);
                }
            })
    });
};

function scrapeSiteList(links) {
    var wordBank = []
    wordCount = [];    

    return new Promise(function(resolve, reject) {
        links.map((link) => {
            var docText = "";
            request(link, function(error, response, body) //Request to links
                {
                    if (error) {
                        reject(Error(request.error));
                    } else {
                        var $ = cheerio.load(body);
                        $("p").each((i, element) => {
                            if (element.childNodes.length >= 1) {
                                for (child in element.childNodes) {
                                    if (element.childNodes[child].nodeType == 3) {
                                        docText += element.childNodes[child].nodeValue;
                                    }
                                }
                            } else if (element.childNodes.length == 0 && element.nodeType == 3) {
                                docText += element.nodeValue;
                            }
                            docText.replace(/\s+/g, " ").replace(/[^A-Za-z ]/g, "").toLowerCase().split(" ");
                        });
                        console.log(docText);
                        resolve(wordBank, wordCount);
                    }
                })
        })
    });
};

scrapeGoogle(target)
    .then((list) => {
        scrapeSiteList(list)
            .then((bank, count) => {
                console.log(bank + " " + count);
            })
            .catch((error) => console.log("Promise rejected: " + error));
    })
    .catch((error) => console.log("Promise rejected: " + error));