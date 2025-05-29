const fs = require('fs');
const path = require('path');

// 匹配 getlang('key') 的正则表达式
const langKeyRegex = /getLang\(['"](.*?)['"],\s+['"`](.*?)['"`]\)/g;
// 用于存储语言键的
const keys = new Set();
// 用于存储挂件类型的代码
let code = 'export const langKeys = {\n';
let widgetTypeCode = '';
let count = 0;

// 递归遍历目录
function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            // 如果是 widgets 目录，添加 WidgetTypes 注释
            if (file === 'widgets') {
              code += '---WidgetTypes---\n';
            }
            walkDir(filePath);
        } else if (stat.isFile() && /\.(js|jsx|ts|tsx)$/.test(file)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            // 提取挂件列表
            if(/widgets\.ts$/.test(filePath)) {
              const widgetTypesMatch = content.match(/(?:const render:.*\r?\n)((?:\s+.*\r?\n)+)(?:\s*\})/) || [];
              console.log(`正在处理文件: ${file} ，找到 ${widgetTypesMatch.length} 个挂件类型`);
              widgetTypeCode += `  // Widget Types\n`;
              // 提取挂件类型
              if(widgetTypesMatch.length > 1) {
                const widgetList = widgetTypesMatch[1].split(/\r?\n/).map(line => line.split(':')[0].trim()).filter(line => line && !line.startsWith('//'));
                widgetList.forEach(widget => {
                    widget = widget.replace(/['"`]/g, ''); // 去除引号
                    if (widget) {
                      widgetTypeCode += `  // ${widget}\n`;
                      widgetTypeCode += `  widget_type_${widget}: '',\n`;
                      widgetTypeCode += `  widget_type_${widget}_desc: '',\n`;
                    }
                });
              }
            }
            // 检查文件内容是否包含语言键
            if (!langKeyRegex.test(content)) { // 如果文件中没有语言键，跳过content
                return;
            }
            // const matchCount = (content.match(langKeyRegex) || []).length;
            langKeyRegex.lastIndex = 0; // 重置正则表达式的 lastIndex
            const matchs = [...content.matchAll(langKeyRegex)]
            console.log(`正在处理文件: ${file} ，找到 ${matchs.length} 个语言键`);
            const relativePath = path.relative(path.join(__dirname, 'src'), filePath);
            code += `  // ${relativePath}\n`;
            matchs.forEach(match => {
                const key = match[1];
                const lang = match[2];
                if(key.includes('+')) {
                    console.log(`跳过包含 + 的语言键: ${key}`);
                    return;
                }
                // 检查是否已经存在相同的语言键
                if (keys.has(key)) {
                    console.log(`跳过重复的语言键: ${key}`);
                    code += `  // ${key}: '${lang}',  // 重复\n`;
                    return;
                }
                // 检查是否已经存在相同的语言键
                keys.add(key);
                // 添加语言键到代码中
                code += `  ${key}: '${lang}',\n`;
                count++;
            });
        }
    });
}

// 开始扫描
console.log('开始扫描文件...');
walkDir(path.join(__dirname, 'src'));

code += '};\n';

code = code.replace(/^---WidgetTypes---$\n/m, widgetTypeCode); // 替换 WidgetTypes 注释

// 将结果写入文件
const outputPath = path.join(__dirname, 'src/local/lang-keys.js');
fs.writeFileSync(outputPath,code, 'utf-8');

console.log(`扫描完成！共找到 ${count} 个语言键`);
console.log(`结果已保存到: ${outputPath}`);
