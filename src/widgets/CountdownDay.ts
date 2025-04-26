import { App, ItemView, moment } from "obsidian";
import { WidgetConfig } from "../types";
import { timer } from "../store";
import { getLang } from "../local/lang";

/**
 * 解析YAML格式的挂件代码
 * @param code YAML格式的代码字符串
 * @returns 解析后的对象，包含name和date属性
 */
function parseYaml(code: string): { name: string; date: string } {
    // 默认值
    const defaultResult = { name: getLang('countdown_unnamed_event', '未命名事件'), date: moment().format('YYYY-MM-DD') };
    
    if (!code || code.trim() === '') return defaultResult;
    
    try {
        // 按行分割并解析每一行的键值对
        const lines = code.split('\n');
        const result: Record<string, string> = {};
        
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine && trimmedLine.includes(':')) {
                const [key, value] = trimmedLine.split(':').map(part => part.trim());
                if (key && value) {
                    result[key] = value;
                }
            }
        });
        
        return {
            name: result.name || defaultResult.name,
            date: result.date || defaultResult.date
        };
    } catch (error) {
        console.error('解析YAML失败:', error);
        return defaultResult;
    }
}

/**
 * 计算两个日期之间的天数差
 * @param targetDate 目标日期
 * @param currentDate 当前日期
 * @returns 天数差值（正数表示未来，负数表示过去）
 */
function calculateDaysDifference(targetDate: moment.Moment, currentDate: moment.Moment): number {
    return targetDate.startOf('day').diff(currentDate.startOf('day'), 'days');
}

/**
 * 渲染倒数日挂件
 * @param this 组件上下文，包含widget配置、视图实例、容器元素和应用实例
 */
export function renderCountdownDay(
    this: {
        widget: WidgetConfig;
        view: ItemView;
        container: HTMLElement;
        app: App;
    }) {
    // 创建显示文本的元素
    const messageEl = this.container.createDiv({ cls: 'dms-sidebar-countdown-day-message' });
    const daysEl = this.container.createDiv({ cls: 'dms-sidebar-countdown-day-days' });
    const daysCountEl = daysEl.createSpan({ cls: 'dms-sidebar-countdown-day-days-count' });
    const daysUnitEl = daysEl.createSpan({ cls: 'dms-sidebar-countdown-day-days-unit' });
    
    // 解析配置
    const config = parseYaml(this.widget.code);
    
    // 更新显示函数
    function updateDisplay(currentTime: moment.Moment | undefined) {
        if (!currentTime) return;
        
        const targetDate = moment(config.date, 'YYYY-MM-DD');
        const daysDiff = calculateDaysDifference(targetDate, currentTime);
        
        // 根据日期差值显示不同的消息
        if (daysDiff > 0) {
            // 未来日期
            messageEl.setText(getLang('countdown_future_prefix', '距离 ') + config.name + getLang('countdown_future_suffix', ' 还有'));
            // 根据天数选择单复数形式
            daysCountEl.setText(String(daysDiff));
            daysCountEl.dataset.status = 'future';
            daysCountEl.setAttribute('style', `font-size: calc(var(--dms-sidebar-width) / ${String(daysDiff).length/2 + 2})`);
            daysUnitEl.setText(daysDiff === 1 ? 
                getLang('countdown_day_singular', '天') : 
                getLang('countdown_day_plural', '天'));
        } else if (daysDiff === 0) {
            // 今天
            messageEl.setText(getLang('countdown_today_prefix', '今天是 ') + config.name + getLang('countdown_today_suffix', ''));
            daysCountEl.setText(getLang('countdown_today', '今天'));
            daysCountEl.dataset.status = 'today';
            daysUnitEl.setText('');
        } else {
            // 过去日期
            messageEl.setText(getLang('countdown_past_prefix', '') + config.name + getLang('countdown_past_suffix', ' 已经过去'));
            // 根据天数选择单复数形式
            const absDays = Math.abs(daysDiff);
            daysCountEl.setText(String(absDays));
            daysCountEl.dataset.status = 'past';
            daysCountEl.setAttribute('style', `font-size: calc(var(--dms-sidebar-width) / ${String(absDays).length/2 + 2})`);
            daysUnitEl.setText(absDays === 1 ? 
                getLang('countdown_day_singular', '天') : 
                getLang('countdown_day_plural', '天'));
        }
    }
    
    // 初始更新
    const initialTime = timer.getState().moment;
    if (initialTime) {
        updateDisplay(initialTime);
    }
    
    // 订阅时间变化，每天更新一次
    const unsubscribe = timer.subscribe('day', () => {
        const time = timer.getState().moment;
        if (time) {
            updateDisplay(time);
        }
    });
    
    // 在视图关闭时取消订阅
    this.view.register(() => unsubscribe());
}