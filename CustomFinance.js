var request = require("request"),
    cheerio = require("cheerio");

// Scrapes Google Finance stock given by search query 'ticker' for article links.
// Returns array of URLs.
function scrapeGoogle(ticker) {
    var page = "https://www.google.com/finance/company_news?q=" + ticker;
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

// Scrapes article page given by 'link' for body.
// Returns string containing article body.
function scrapeSite(link) {
    return new Promise(function(resolve, reject) {
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
                    });
                    resolve(docText);
                }
            });
    });
};

// Parses 'text' for word repetition of words 'minLength' and greater.
// Empty return.
function textToBank(text, minLength) {
    text = text.replace(/\s+/g, " ").replace(/[^A-Za-z ]/g, "").toLowerCase().split(" ");
    if (words.length == 0) {
        words.push({
            word: text[0],
            value: 0
        });
    }
    for (var a = 0; a < text.length; a++) {
        if (text[a].length >= minLength) {
            for (var b = 0; b < words.length; b++) {
                if (text[a] == words[b].word) {
                    words[b].value += 1;
                    break;
                } else if (b == words.length - 1) {
                    words.push({
                        word: text[a],
                        value: 1
                    });
                    break;
                }
            }
        }
    }
    return;
};

// Sorts words by descending order of repetition.
// Empty return.
// Credit to: http://stackoverflow.com/questions/11499268/sort-two-arrays-the-same-way
function sortWords() {
    words.sort(function(a, b) {
        return ((a.value > b.value) ? -1 : ((a.value == b.value) ? 0 : 1))
    });
    return;
};

var ticker = "GOOG",
    words = [],
    minWordLength = 5,
    numToDisplay = 30;

scrapeGoogle(ticker).then((list) => {
    var numProcessed = 0;
    list.forEach((site) => {
        scrapeSite(site).then((article) => {
            textToBank(article, minWordLength);
            numProcessed++;
            if (numProcessed == list.length) {
                sortWords();
                for (var i = 0; i < numToDisplay; i++) {
                    console.log(words[i].word + ": " + words[i].value);
                }
            }
        }).catch((error) => console.log("Promise rejected: " + error));
    });
}).catch((error) => console.log("Promise rejected: " + error));