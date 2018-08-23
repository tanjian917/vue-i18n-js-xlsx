## 说明
将Vue中的国际化语言资源相互转换，方便语言资源的管理和维护。导出的xlsx交给翻译组，翻译组完成后运行该工具转成JS文件。

__注:__
```
1、xlsx中的"带翻译"为未翻译内容，需要翻译
2、导出的JS文件,使用CommonJS模块规范
```
## 技术栈
nodejs + node-xlsx

## 项目运行

#### 注意：由于涉及大量的 ES6/7 等新属性，node 需要 6.0 以上版本 

```
git clone https://github.com/tanjian917/vue-i18n-js-xlsx.git  

cd vue-i18n-js-xlsx

npm install  或 yarn(推荐)

node index.js

vue-i18n-js-xlsx 参数说明:
                type: Number 1(JS转xlsx),2(xlsx转JS),默认为1
                lpath: String JS资源存放目录(文件夹),默认为当前目录下的langs目录
                xlsxpath: String xlsx文件路径(默认当前目录下的data.xlsx)
                format: Bool 是否格式化(仅对xlsx转JS生效,默认为true)
                help: Any 显示参数说明
```

## JS资源使用
```
let en = require('./xxx.js');
```