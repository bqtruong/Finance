var request = require("request"),
    cheerio = require("cheerio"),
    target = "https://www.google.com/finance/company_news?q=NASDAQ%3AYHOO",
    urls = [],
    wordBank = [],
    wordCount = [];

request(target, function(error, response, body) //Request to Google Finance News
{
    if (error)
    {
        console.log("There was an error: " + error);
    }
    else
    {
        var $ = cheerio.load(body);
        var secondURLreg = new RegExp("[^http]http.+(?=&cid)")
        $("a", "#news-main").each(function() 
        {
            var url = this.attribs.href;
            if (url.startsWith("http"))
            {
                urls.push(url.match(secondURLreg)[0].substring(1));
            }
        });
        for (var linkIndex = 0; linkIndex < urls.length; linkIndex++)
        {
            var link = urls[linkIndex];
            request(link, function(err, res, bod) //Request to links
            {
                if (err)
                {
                    console.log("There was an error: " + err);
                }
                else
                {
                    var $page = cheerio.load(bod);
                    var text = $page("body").text().replace(/\s+/g, " ").replace(/[^A-Za-z ]/g, "").toLowerCase().split(" ");
                    for (var wordIndex = 0; wordIndex < text.length; wordIndex++)
                    {
                        if (text[wordIndex].length > 15)
                        {
                            text.splice(wordIndex, 1);
                            wordIndex--;
                        }
                        else
                        {
                            if (wordBank.indexOf(text[wordIndex]) != -1)
                            {
                                wordCount[wordBank.indexOf(text[wordIndex])]++;
                            }
                            else
                            {
                                wordBank.push(text[wordIndex]);
                                wordCount.push(1);
                            }
                        }
                    }
                    // for (var word = 0; word < wordBank.length; word++)
                    // {
                    //     console.log(wordBank[word]);
                    // }
                }
            });
        }
    }
});