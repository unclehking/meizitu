/*

 * 妹子图(http://www.mzitu.com)下载器
 * npm install
 * node meizi.js <Id>

 */

const fs = require('fs');
const request = require("request");
const cheerio = require("cheerio");
const baseUrl = "https://www.mzitu.com/";

/** 节流 防止被屏蔽IP */
async function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}
async function downloadImg(url, dirName) {
    return new Promise((resolve,reject) => {
        var fName = /\d*\.jpg/.exec(url)[0];
        //解决妹子图防盗链
        var options = {
            uri: url,
            headers: {
                'If-None-Match': 'W/"5cc2cd8f-2c58"',
                "Referer": "http://www.mzitu.com/all/",
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 UBrowser/6.1.2107.204 SafarMozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
            }
        };
        let writeStream = fs.createWriteStream(`${dirName}/${fName}`, { autoClose: true })
        request(options).pipe(writeStream);
        writeStream.on('finish', function () {
            resolve(`下载: ${url} 完毕！`)
        })
        writeStream.on('error', (err) => {
            reject(err)
        })
    })
}

function download(url) {
    request({
        uri: url,
        headers: {
            'If-None-Match': 'W/"5cc2cd8f-2c58"',
            "Referer": "http://www.mzitu.com/all/",
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 UBrowser/6.1.2107.204 SafarMozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
        }
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            var maxNum = $(".pagenavi a").eq(-2).text();
            var dirName = "" + /(\d*)$/.exec(url)[0] + "_" + $(".content h2.main-title").text();
            var imgBaseUrl = $(".main-image img").eq(0).attr("src").replace(/[0-9_]*\.jpg$/, "");
            if (!fs.existsSync(dirName)) {
                fs.mkdir(dirName, 0777, function (err) {
                    if (err) {
                        console.log(err, 22222);
                    } else {
                        dImgs();
                    }
                });
            } else {
                dImgs();
            }
            async function dImgs() {
                console.log(maxNum);
                for (var i = 1; i <= maxNum; i++) {
                    var num = i > 9 ? i : '0' + i;
                    let message = await downloadImg(`${imgBaseUrl}${num}.jpg`, dirName);
                    console.log(message);
                    await sleep(2000)
                }
            }

        } else {

        }
    });
};

const param = process.argv.splice(2);
param && function () {
    param.forEach(function (t, i) {
        var url = /^(http)/.test(t) ? t : baseUrl + t;
        download(url);
    });
}();
