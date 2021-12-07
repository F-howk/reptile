const http = require("https"); // http模块
const path = require("path");
const fs = require("fs");
const cheerio = require("cheerio");
const officegen = require('officegen')

let host = 'www.liepin.com';
let page = 11;
let c_page = page - 1
let searchName = [
    '人力资源负责人',
    '培训经理',
    '薪酬绩效经理',
    '招聘及人才发展经理',
    '人力资源主任',
    '行政主管',
    '技术部负责人',
    '质量保证经理',
    '工程经理',
    'EHS经理',
    '质量体系主任',
    '采购主任',
    '物流主任',
    '仓库主管',
    '行政总厨',
    '应用厨务顾问',
    '总经理秘书',
    '成本经理',
    '总帐主任',
    '会计主管',
    '会计',
    '工厂厂长',
    '工厂生产经理',
    '工厂生产现场主管',
    '工厂质量保证经理',
    '工厂质量保证专员',
    'OEM质量主管',
    '工厂工程经理',
    '工厂机修主管',
    '机修工',
    '工厂HR负责人',
    '工厂行政主管',
    '工厂供应链负责人',
    '库管',
    '工厂SHE负责人',
];

for(let s_name = 0; s_name < searchName.length;s_name++){
    for(let i = c_page; i < page; i++){
        let paths = `/zhaopin/?headId=cbe2b4d5a877dbfd7088a265e2365ee7&ckId=cbe2b4d5a877dbfd7088a265e2365ee7&key=${encodeURI(searchName[s_name])}&industry=5$190&jobKind=2&currentPage=${page}`;
        let options = {
            hostname: host,
            port: 443,
            path: paths,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36'
            }
        }
        // 请求目标网址的数据
        http.get(options, response => { // 数据流
            console.log('[---statusCode---]', response.statusCode)
            let rst = "";
            // 监听data事件 每64kb触发一次
            response.on('data', readData => {
                rst += readData; // 累加数据
            })
        
            // 监听end事件
            response.on('end', () => {
                var $ = cheerio.load(rst)
                $(".job-list-item").each((i, v) => {
                    let item = $(v).find('.job-title-box>.ellipsis-1').text();
                    let items = $(v).find('.job-title-box .job-dq-box .ellipsis-1').text();
                    let salary = $(v).find('.job-salary').text();
                    let tag = $(v).find('.job-labels-box .labels-tag').text();
                    let company = $(v).find('.company-name').text();
                    let tags = $(v).find('.company-tags-box span').text();
                    let a = $(v).find('.job-detail-box>a')[0].attribs.href;
                    let detail_path = a.replace('https://' + host,'');
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
                            let detail = $('.job-intro-container dd').text().replace(/\n/g,'').replace(/\t/g,'')
                            str += company + '\t' + item + '\t' + items + '\t' + salary + '\t' + tag + '\t' + tags + '\t' + detail + '\t' + a + '\n';
                            fs.appendFile('./txt.txt', str, () => {})
                        })
                    })
                })
                // str += $('.company-name').text().trim().replace(/\n/g, '\t')
        
                // let xlsx = officegen('xlsx')
        
                // xlsx.on('finalize', function (written) {
                //     console.log(
                //         'Finish to create a Microsoft Excel document.'
                //     )
                // })
        
                // xlsx.on('error', function (err) {
                //     console.log(err)
                // })
        
                // let sheet = xlsx.makeNewSheet();
                // let sheet_data = str.split("\n");
                // sheet_data.forEach((sheet_item,sheet_index) =>{
                //     sheet_data[sheet_index] = sheet_item.split("\t")
                // })
                // sheet.data = sheet_data;
                // let out = fs.createWriteStream('./数据.xlsx')
                // xlsx.generate(out)
    
                // 正则
                // const reg = /< img src="(.*?)" data-src="(.*?)"  alt="(.*?)" \/>/img;
        
                // // 循环匹配 把找到的图片地址 都放入数组
                // let imgArr = []
                // let result;
                // while ((result = reg.exec(rst)) != null) {
                //     imgArr.push(result[2])
                // }
        
                // // 循环图片地址 把图片获取过来
                // imgArr.forEach((imgUrl, i) => {
                //     http.get(imgUrl, imgReadStream => { // 数据流
                //         let imgName = new Date().getTime() + path.extname(imgUrl);
        
                //         // 创建一个写入流
                //         let writeStream = fs.createWriteStream("./upload/" + imgName);
        
                //         // 管道流
                //         imgReadStream.pipe(writeStream)
        
                //         console.log("下载图片 " + imgUrl + " 成功...")
                //     })
                // })
        
            })
        })
    }
}
// setTimeout(()=>{
//     fs.appendFile('./txt.txt', str, () => {})
// },10000)