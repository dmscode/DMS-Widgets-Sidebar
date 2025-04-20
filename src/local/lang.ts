import { getLanguage } from 'obsidian';
import { zh } from './lang/zh';
import { en } from './lang/en';

const langs:{
	[langName: string]: {
		[key: string]: string
	}
} = {
	'zh': zh,
	'en': en
}

let langName = getLanguage();
if (!langs[langName]) {
	langName = 'en';
}
/**
 * 获取指定键值对应的语言文本
 * @param key - 语言文本的键值
 * @param defaultValue - 可选的默认值，当找不到对应文本时返回
 * Note: 如果默认值为空字符串，则可以通过返回结果判断是否获取到文本
 * @returns 返回找到的语言文本或默认值
 */
export function getLang(key: string, defaultValue?: string) {
    // 如果提供了默认值，则将键值设为默认值
    if(defaultValue === undefined) {
        defaultValue = key
    }
    // 按优先级依次查找：当前语言 -> 英语 -> 默认值
    return langs[langName][key] || langs['en'][key] || defaultValue;
}