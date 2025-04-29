import { App, ItemView, moment, parseYaml } from "obsidian";
import { WidgetConfig } from "../types";
import { timer } from "../store";
import { getLang } from "../local/lang";

/**
 * 解析YAML格式的挂件代码
 * @param code YAML格式的代码字符串
 * @returns 解析后的对象，包含开始时间和结束时间
 */
function getConfig(code: string): { startTime: string; endTime: string } {
    // 默认值
    const defaultResult = {
        startTime: '09:00',
        endTime: '18:00'
    };
    if (!code || code.trim() === '') return defaultResult;
    try {
        // 按行分割并解析每一行的键值对
        return parseYaml(code)
    } catch (error) {
        console.error('解析YAML失败:', error);
        return defaultResult;
    }
}

/**
 * 计算工作时间进度
 * @param currentTime 当前时间
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @returns 进度信息对象
 */
/**
 * 格式化剩余时间
 * @param minutes 剩余分钟数
 * @returns 格式化后的时间字符串
 */
function formatRemainingTime(minutes: number): string {
    if (minutes < 60) {
        return `${minutes} ${getLang('working_time_progress_minute')}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} ${getLang('working_time_progress_hour')} ${remainingMinutes} ${getLang('working_time_progress_minute')}`;
}

function calculateWorkProgress(currentTime: moment.Moment, startTime: string, endTime: string): {
    isWorking: boolean;
    progress: number;
    remainingMinutes: number;
    remainingTimeText: string;
    isNextDay: boolean;
} {
    // 创建基于当前时间的时间点
    const now = moment(currentTime);
    
    // 创建今天的开始和结束时间点
    let start = moment(currentTime).startOf('day').add(moment.duration(startTime));
    let end = moment(currentTime).startOf('day').add(moment.duration(endTime));
    let isNextDay = false;

    // 如果结束时间小于开始时间或以+开头，则结束时间为第二天
    if (end.isBefore(start) || endTime.startsWith('+')) {
        end.add(1, 'day');
        isNextDay = true;
    }

    // 如果当前时间在今天的开始时间之前，但实际上是昨天开始的工作时间范围内
    if (isNextDay && now.isBefore(end) && now.isBefore(start)) {
        start.subtract(1, 'day');
        end.subtract(1, 'day');
    }

    const isWorking = now.isBetween(start, end, null, '[]');
    let progress = 0;
    let remainingMinutes = 0;

    if (isWorking) {
        progress = ((now.valueOf() - start.valueOf()) / (end.valueOf() - start.valueOf())) * 100;
        remainingMinutes = Math.round(end.diff(now, 'seconds')/60);
    } else if (now.isBefore(start)) {
        remainingMinutes = Math.round(start.diff(now, 'seconds')/60);
    }

    return {
        isWorking,
        progress: parseFloat(progress.toFixed(2)),
        remainingMinutes,
        remainingTimeText: formatRemainingTime(remainingMinutes),
        isNextDay
    };
}

/**
 * 渲染工作时间进度挂件
 * @param this 组件上下文，包含widget配置、视图实例、容器元素和应用实例
 */
export function renderWorkingTimeProgress(
    this: {
        widget: WidgetConfig;
        view: ItemView;
        container: HTMLElement;
        app: App;
    }) {
    // 创建显示元素
    const progressBar = this.container.createDiv({ cls: 'dms-sidebar-working-time-progress-bar' });
    const titleEl = this.container.createDiv({ cls: 'dms-sidebar-working-time-title' });
    const timeRemainingEl = this.container.createDiv({ cls: 'dms-sidebar-working-time-remaining' });

    // 解析配置
    const config = getConfig(this.widget.code);

    // 更新显示函数
    const updateDisplay = (currentTime: moment.Moment) => {
        const progress = calculateWorkProgress(currentTime, config.startTime, config.endTime);

        // 更新标题
        titleEl.setText(progress.isWorking ? getLang('working_time_progress_working') : getLang('working_time_progress_resting'));
        this.container.dataset.status = progress.isWorking ? 'working' : 'resting';

        // 更新时间范围显示
        timeRemainingEl.setText(
            progress.isWorking ?
            `${getLang('working_time_progress_working_is_remaining')} ${progress.remainingTimeText}` :
            ''
        );

        // 更新进度条
        if (progress.isWorking) {
            progressBar.setAttribute('style', `height: ${100 - progress.progress}%;`);
        }
    }

    // 初始更新
    const initialTime = timer.getState().moment;
    if (initialTime) {
        updateDisplay(initialTime);
    }

    // 订阅时间变化
    const unsubscribe = timer.subscribe('minute', () => {
        const time = timer.getState().moment;
        if (time) {
            updateDisplay(time);
        }
    });

    // 在视图关闭时取消订阅
    this.view.register(() => unsubscribe());
}