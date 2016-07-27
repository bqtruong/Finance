var request = require("request"),
    cheerio = require("cheerio"),
    target = "https://www.google.com/finance/company_news?q=NASDAQ%3AYHOO",
    urls = [],
    wordBank = [],
    wordCount = [];

function scrapeGoogle(page) {
    var scrape = [];
    var promise = new Promise(function(resolve, reject) {
        request(page, function(error, response, body) //Request to Google Finance News
        {
            if (error)
            {
                reject(Error(request.error));
            }
            else
            {
                resolve(body);
            }
        })
    });
    promise.then(function(body)
    {
        var $ = cheerio.load(body);
        var secondURLreg = new RegExp("[^http]http.+(?=&cid)")
        $("a", "#news-main").each(function() 
        {
            var url = this.attribs.href;
            if (url.startsWith("http"))
            {
                scrape.push(url.match(secondURLreg)[0].substring(1));
            }
        });
        return scrape;
    }, function(error)
    {
        console.log("Promise rejected: " + error)
    });
};

var temp = scrapeGoogle(target);
console.log(temp);

function scrapeSite(link) {
    var promise = new Promise(function(resolve, reject) 
    {
        request(link, function(error, response, body) //Request to links
        {
            if (error)
            {
                reject(Error(request.error));
            }
            else
            {
                resolve(body);
            }
            
        });
    });
    promise.then(function(body) 
    {
        var $page = cheerio.load(body);
        var text = $page("body").text().replace(/\s+/g, " ").replace(/[^A-Za-z ]/g, "").toLowerCase().split(" ");
        text.forEach(function(word)
        {
            if (word.length > 15)
            {
                text.splice(wordIndex, 1);
            }
            else
            {
                if (wordBank.indexOf(word) != -1)
                {
                    wordCount[wordBank.indexOf(word)]++;
                }
                else
                {
                    wordBank.push(word);
                    wordCount.push(1);
                }
            }
        });
    }, function(error)
    {
        console.log("Promise rejected: " + error);
    });   
};