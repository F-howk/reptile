const http = require("http"); // http模块
const path = require("path");
const fs = require("fs");
const cheerio = require("cheerio");
let options = {
    host: '165.225.26.101',
    port: 10605,
    path: 'http://localhost:3000/users',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36'
    }
}
http.get(options, response => { // 数据流
    let rst = "";
    // 监听data事件 每64kb触发一次
    response.on('data', readData => {
        rst += readData; // 累加数据
    })

    // 监听end事件
    response.on('end', () => {
        console.log(rst)
    })
})