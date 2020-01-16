/*

 * 妹子图(http://www.mzitu.com)下载器
 * npm install
 * node meizi.js <Id>

 */

const fs = require('fs');
const request = require("request");
const cheerio = require("cheerio");
const baseUrl = "https://www.mzitu.com/";

function downloadImg(url,dirName){
	var fName = /\d*\.jpg/.exec(url)[0];
	console.log(url,99);
	//解决妹子图防盗链
	var options = {
      	uri: url,
      	headers: {
        	'If-None-Match': 'W/"5cc2cd8f-2c58"',
           "Referer": "http://www.mzitu.com/all/",
           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 UBrowser/6.1.2107.204 SafarMozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
      	}
    };
	request(options).pipe(fs.createWriteStream(`${dirName}/${fName}`));
}

function download(url){
	console.log(url)
	request({
		uri: url,
      	headers: {
        	'If-None-Match': 'W/"5cc2cd8f-2c58"',
           "Referer": "http://www.mzitu.com/all/",
           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 UBrowser/6.1.2107.204 SafarMozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
      	}
	}, function(error, response, body){
		   if(!error && response.statusCode == 200) {
			   var $ = cheerio.load(body);
			   var maxNum = $(".pagenavi a").eq(-2).text();
			   var dirName = "meizi/"+/(\d*)$/.exec(url)[0]+"_"+$(".content h2.main-title").text();
			   var imgBaseUrl = $(".main-image img").eq(0).attr("src").replace(/[0-9_]*\.jpg$/,"");
			   //var imgBaseUrl = 'test';
			   if(!fs.existsSync(dirName)){
				   fs.mkdir(dirName, 0777, function(err){
					   if(err){
						   console.log(err);
					   }else{
							dImgs();
					   }
				   });
			   }else{
				   dImgs();
			   }
			   function dImgs(){
			   		console.log(maxNum);
				   	for(var i=1;i<=maxNum;i++){
				   		var num = i > 9 ? i : '0'+i;
						downloadImg(`${imgBaseUrl}${num}.jpg`,dirName);
				   	}
			   }

		   	}else{
		   		console.log(body,999)
		   	}
	   });
};

const param = process.argv.splice(2);
param && function(){
	param.forEach(function(t,i){
		var url = /^(http)/.test(t) ? t : baseUrl+t;
		download(url);
	});
}();
