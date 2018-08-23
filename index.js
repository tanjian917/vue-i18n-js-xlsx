let xlsx = require('node-xlsx');
let fs = require('fs');
let path = require('path');
let config = {
    type: 1,
    cwd: process.cwd(),
    lpath: process.cwd() + '/langs',
    xlsxpath: process.cwd() + '/data.xlsx',
    format: true
}

function saveJs2Xlsx(worksheets) {
    console.log('正在保存xlsx文件:' + config.xlsxpath);
    fs.writeFileSync(config.xlsxpath, worksheets, { encoding: 'utf8' })
    console.log('保存成功:' + config.xlsxpath);
}
function savexlsx2Js(data,name='xxx.js') {
    console.log('正在保存JS文件:' + path.join(config.lpath,name));
    fs.writeFileSync(path.join(config.lpath,name), data)
    console.log('保存成功:' + path.join(config.lpath,name));
}


function interatorLangs(opts = {}) {
    let { sources, pKey, curDepth, keyArr, maxDepth} = opts;
    curDepth = curDepth || 0;
    if (maxDepth && curDepth > maxDepth) return;

    Object.keys(sources).forEach(key => {
        let val = sources[key], keyChain = (pKey ? pKey + '.' : '') + key;
        if (typeof val === 'object'){
            interatorLangs({
                sources: val,
                pKey: keyChain,
                curDepth: curDepth + 1,
                maxDepth,
                keyArr
            });
        } 
        else keyArr.push(keyChain);
    });
}

function getValueByKeyChain(tarObj, keyChain = '') {
    let result = {keys: [],value: '待翻译'};
    if (keyChain) {
        let tmpObj = tarObj, index = 0, keys = keyChain.split('.'), len = keys.length;
        while (index < len) {
            let key = keys[index];
            if(tmpObj.hasOwnProperty(key))tmpObj = tmpObj[key];
            else{
                tmpObj = undefined;
                break;
            }
            index++;
        }
        result.keys = keys.concat([]);
        if(typeof tmpObj === 'undefined')tmpObj = '待翻译';
        result.value = tmpObj;
    }
    return result;
}

function js2Xlsx() {
    console.log('正在扫描'+config.lpath+'目录下的JS文件.');
    let files = fs.readdirSync(config.lpath),langsSet = new Set();
    files.forEach(filename=>{
        let filePath = path.join(config.lpath,filename);
        let stats = fs.statSync(filePath);
        if(stats.isFile() && filename.charAt(0) != '.' && filename != 'index.js'){
            langsSet.add({
                lang: filename.split('.')[0].toLowerCase(),
                sources: require(filePath),
                keyArr: []
            })
        }
    });

    let langs = [...langsSet],cnIndex = -1;
    for(let i=0,len=langs.length;i<len;i++){
        let lang = langs[i].lang;
        if(lang === 'cn' || lang === 'zh'){
            cnIndex = i;
            break;
        }
    }
    if(cnIndex != -1)langs.splice(0,-1,langs.splice(cnIndex,1)[0]);
    console.log('正在遍历文件内容.');
    interatorLangs(langs[0]);
    
    langSets = new Set();

    let xlsxData = [],maxDepth = 0;
    langs[0].keyArr.forEach(key => {
        let rkeys = null,values = [];
        langs.forEach(item=>{
            let {keys,value} = getValueByKeyChain(item.sources, key);
            if(keys.length>maxDepth)maxDepth = keys.length;
            langSets.add(item.lang);
            if(!rkeys)rkeys = keys;
            values.push(value);
        })
        xlsxData.push([...rkeys,...values])
    });
    let headArr = [],len = headArr.length;
    while(len<maxDepth){
        headArr.push('c-'+(len+1));
        len = headArr.length;
    }
    xlsxData.splice(0,-1,[...headArr,...Array.from(langSets)])
    saveJs2Xlsx(xlsx.build([{name: "翻译", data: xlsxData}]));
}

function interatorObj2Str(obj,format=false){
    let keys = Object.keys(obj),result = '{'+(format?'\n':'');
    
    keys.forEach((key,index)=>{
        if(typeof obj[key] === 'object'){
            result +=  (index>0?',':'') + ((format && index>0)?'\n':'') + (format?`     `:'') + key +':' + interatorObj2Str(obj[key],format);
        }else{
            result +=  (index>0?',':'') + ((format && index>0)?'\n':'') + (format?`        `:'') + key +':`' + obj[key] + '`';
        }
    })
    result += (format?'\n     ':'')+'}';
    return result;
}

function xlsx2Js() {
    console.log('正在读取和解析xlsx文件.');
    let stat = fs.statSync(config.xlsxpath);
    if(stat.isFile()){
        let worksheets = xlsx.parse(config.xlsxpath)[0];
        let valueOffset = 0,langs = {};
        let headers = worksheets.data.shift();
       
        headers.forEach((val,index)=>{
            if(val.slice(0,2) == 'c-')valueOffset ++;
            else{
                let result = {};
                worksheets.data.forEach(val=>{
                    let i = 0,tmpObj = result;

                    while(i<valueOffset){ 
                        let key = val[i];
                        if(typeof tmpObj[key] === 'undefined'){
                            tmpObj[key] = (i==(valueOffset-1))?val[index]:{};
                        }
                        tmpObj = tmpObj[key];
                        i ++;
                    };
                })
                savexlsx2Js("module.exports = "+interatorObj2Str(result,config.format),val+'.js');
            }
        });
    }
}

function bootstrap() {
    let arglen = process.argv.length;
    if (arglen > 2) {
        for (let i = 2; i < arglen; i++) {
            let keyValue = process.argv[i].split('=');
            let key = keyValue[0].trim();
            let val = '';
            if (keyValue.length > 1) val = keyValue[1].trim();
            config[keyValue[0].trim()] = val;
        }
    }
    if(config.hasOwnProperty('help')){
        console.log(`vue-i18n-js-xlsx 参数说明:
            type: Number 1(JS转xlsx),2(xlsx转JS),默认为1
            lpath: String JS资源存放目录(文件夹),默认为当前目录下的langs目录
            xlsxpath: String xlsx文件路径(默认当前目录下的data.xlsx)
            format: Bool 是否格式化(仅对xlsx转JS生效,默认为true)
        `)
        return;
    }
    switch (config.type) {
        case 1:
            js2Xlsx()
            break;
        default:
            xlsx2Js();
            break;
    }
}
bootstrap();



