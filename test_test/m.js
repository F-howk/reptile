const http = require("https"); // http模块
const path = require("path");
const fs = require("fs");
const cheerio = require("cheerio");
const officegen = require('officegen')

let host = 'www.liepin.com';

let pathList = ``;
let list = pathList.split('\n')
let inx = 1200;
let l1 = list.splice(inx)
for (let i = 0; i < l1.length; i++) {
    let detail_path = l1[i].replace('https://'+host,'')
    http.get({
        hostname: host,
        port: 443,
        path: detail_path,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36'
        }
    }, response => { // 数据流
        console.log('[---detailStatusCode---]', response.statusCode)
        let detail_rst = "";
        // 监听data事件 每64kb触发一次
        response.on('data', readData => {
            detail_rst += readData; // 累加数据
        })

        // 监听end事件
        response.on('end', () => {
            let str = ''
            let $ = cheerio.load(detail_rst)
            let detail = $('.salary').text().replace(/\n/g, '').replace(/\t/g, '')
            str += (inx + i ) + '\t'+ detail + '\n';
            fs.appendFile('./m.txt', str, () => {})
        })
    })
}
// setTimeout(()=>{
//     fs.appendFile('./txt.txt', str, () => {})
// },10000)