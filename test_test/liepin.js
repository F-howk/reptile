const http = require("https"); // http模块
const fs = require("fs");
const cheerio = require("cheerio");

let host = 'www.liepin.com';
let page = 11;
let c_page = 0
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
let UA = [
    'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-us) AppleWebKit/534.50 (KHTML, like Gecko) Version/5.1 Safari/534.50',
    'Mozilla/5.0 (Windows NT 6.1; rv:2.0.1) Gecko/20100101 Firefox/4.0.1',
    'Opera/9.80 (Windows NT 6.1; U; en) Presto/2.8.131 Version/11.11',
    'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-us) AppleWebKit/534.50 (KHTML, like Gecko) Version/5.1 Safari/534.50',
    'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; 360SE)',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
]
let CUA = () => UA[Math.round(Math.random() * (UA.length - 1))];

function getInfo(url, type, num = 3) {
    return new Promise(((resolve, reject) => {
        setTimeout(() => {
            if (num <= 0) {
                reject('err')
            }
            let options = {
                hostname: host,
                port: 443,
                path: url,
                headers: {
                    'User-Agent': CUA()
                },
                timeout: 1000
            }
            if (type == 'list') {
                http.get(options, res => { // 数据流
                    console.log('[---statusCode---]', res.statusCode)
                    let rst = "";
                    // 监听data事件 每64kb触发一次
                    res.on('data', readData => {
                        rst += readData; // 累加数据
                    })
                    res.on('end', () => {
                        let $ = cheerio.load(rst);
                        $(".job-list-item").each((i, v) => {
                            let result = '';
                            let item = $(v).find('.job-title-box>.ellipsis-1').text();
                            let items = $(v).find('.job-title-box .job-dq-box .ellipsis-1').text();
                            let salary = $(v).find('.job-salary').text();
                            let tag = $(v).find('.job-labels-box .labels-tag');
                            let company = $(v).find('.company-name').text();
                            let tags = $(v).find('.company-tags-box span');
                            let a = $(v).find('.job-detail-box>a')[0].attribs.href;
                            let detail_path = a.replace('https://' + host, '');
                            let tag_value = $(tag[0]).text() + '\t' + $(tag[1]).text()
                            let tags_value = $(tags[0]).text() + '\t' + $(tags[tags.length - 1]).text()
                            getInfo(detail_path, 'detail').then(detail => {
                                result += company + '\t' + item + '\t' + items + '\t' + salary + '\t' + tag_value + '\t' + tags_value + '\t' + detail + '\t' + a + '\n';
                                fs.appendFile('./liepin.txt', result, () => {})
                                resolve(result)
                            }).catch(() => {})
                        })
                    })
                }).on('error', err => {
                    getInfo(url, type, num - 1)
                        .then(res => {
                            resolve(result)
                        }).catch(() => {
                            fs.appendFile('./liepinerr.txt', `[--error--]: ==>${url}-${type}-${num - 1}` + JSON.stringify(err) + '\n', () => {})
                            reject('err')
                        })
                })
            } else {
                http.get(options, res => { // 数据流
                    console.log('[---detailStatusCode---]', res.statusCode)
                    let detail_rst = "";
                    // 监听data事件 每64kb触发一次
                    res.on('data', readData => {
                        detail_rst += readData; // 累加数据
                    })

                    // 监听end事件
                    res.on('end', () => {
                        let $ = cheerio.load(detail_rst)
                        let detail = $('.job-intro-container dd').text().replace(/\n/g, '').replace(/\t/g, '')
                        resolve(detail)
                    })
                }).on('error', err => {
                    getInfo(url, type, num - 1).then(res => {
                        resolve(res)
                    }).catch(() => {
                        fs.appendFile('./liepinerr.txt', `[--error--]: ==>${url}-${type}-${num - 1}` + JSON.stringify(err) + '\n', () => {})
                        reject('err')
                    })
                })
            }
        }, ((Math.random() * 2) + 1) * 1000)
    }))
}
fs.writeFileSync('./liepin.txt', '')
fs.writeFileSync('./liepinerr.txt', '')

for (let i = c_page; i <= page; i++) {
    searchName.forEach((value) => {
        let path = `/zhaopin/?headId=0ea1b796bc9d60cd2bdaca9f9fc556f9&ckId=tz4mtuqipo1jjwu4acv9judfyx56oud9&oldCkId=0ea1b796bc9d60cd2bdaca9f9fc556f9&fkId=9glarpmbf2f4up72nzld3cmbv64gbjea&skId=9glarpmbf2f4up72nzld3cmbv64gbjea&sfrom=search_job_pc&key=${encodeURI(value)}&industry=5$190&jobKind=2&currentPage=${i}`
        getInfo(path, 'list').then(res => {}).catch(() => {})
    })
}