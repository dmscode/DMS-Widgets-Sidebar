/**
 * Less编译脚本
 * 用于将Less文件编译为CSS，支持监视模式自动重新编译
 */
import fs from 'fs';
import path from 'path';
import less from 'less';

// 源文件和目标文件路径
const SOURCE_FILE = 'src/styles/main.less';
const OUTPUT_FILE = 'dist/styles.css';
const STYLES_DIR = 'src/styles';

// 命令行参数，检查是否为监视模式
const isWatchMode = process.argv.includes('--watch');

// 确保dist目录存在
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

/**
 * 编译Less为CSS
 * @param {string} sourceFile - Less源文件路径
 * @param {string} outputFile - 输出CSS文件路径
 * @returns {Promise<void>}
 */
async function compileLess(sourceFile = SOURCE_FILE, outputFile = OUTPUT_FILE) {
  try {
    // 读取Less源文件
    const lessContent = fs.readFileSync(sourceFile, 'utf8');
    
    // 设置Less编译选项
    const options = {
      filename: path.resolve(sourceFile),
      // 可以添加其他Less编译选项，如压缩等
      compress: false,
    };

    // 编译Less内容
    const output = await less.render(lessContent, options);
    
    // 写入编译后的CSS到目标文件
    fs.writeFileSync(outputFile, output.css);
    
    console.log(`成功编译Less文件: ${sourceFile} -> ${outputFile}`);
  } catch (error) {
    console.error('Less编译错误:', error);
    if (!isWatchMode) {
      process.exit(1);
    }
  }
}

/**
 * 监视Less文件变化并自动重新编译
 */
function watchLessFiles() {
  console.log('启动Less文件监视模式...');
  
  // 递归获取所有Less文件
  function getAllLessFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat && stat.isDirectory()) {
        // 递归处理子目录
        results = results.concat(getAllLessFiles(filePath));
      } else if (path.extname(file) === '.less') {
        // 添加Less文件
        results.push(filePath);
      }
    });
    
    return results;
  }
  
  // 获取所有Less文件
  const lessFiles = getAllLessFiles(STYLES_DIR);
  
  // 监视每个Less文件
  lessFiles.forEach(file => {
    fs.watch(file, (eventType) => {
      if (eventType === 'change') {
        console.log(`检测到文件变化: ${file}`);
        compileLess();
      }
    });
  });
  
  // 监视styles目录，处理新增文件
  fs.watch(STYLES_DIR, { recursive: true }, (eventType, filename) => {
    if (filename && path.extname(filename) === '.less') {
      console.log(`检测到Less文件变化: ${filename}`);
      compileLess();
    }
  });
  
  console.log(`正在监视 ${lessFiles.length} 个Less文件的变化...`);
}

// 执行编译
compileLess();

// 如果是监视模式，启动文件监视
if (isWatchMode) {
  watchLessFiles();
}