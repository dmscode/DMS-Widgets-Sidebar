import { App, ItemView, moment, setIcon } from "obsidian";
import { WidgetConfig } from "../types";
import { timer } from "../store";

function getConfig(code: string):  number {
    // 默认值为 5 分钟
    const defaultResult = 300 ;
    
    if (!code || code.trim() === '') return defaultResult;
    
    try {
        const seconds = code.trim().split(/:|：/g).reverse().reduce((acc, char, index) => {
            const value = +char.trim();
            return acc + value * Math.pow(60, index);
        }, 0);
        return isNaN(seconds) ? defaultResult : seconds ;
    } catch (error) {
        console.error('解析配置失败:', error);
        return defaultResult;
    }
}

/**
 * 格式化时间为mm:ss格式
 * @param seconds 总秒数
 * @returns 格式化后的时间字符串
 */
function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * 渲染倒计时挂件
 */
export function renderCountdownTimer(
    this: {
        widget: WidgetConfig;
        view: ItemView;
        container: HTMLElement;
        app: App;
    }) {
    // 解析配置获取总时长
    const totalSeconds = getConfig(this.widget.code);
    let remainingSeconds = totalSeconds;
    let isRunning = false;
    let timerSubscription: null | (() => void) = null;

    // 创建进度条
    const progressBar = this.container.createEl('div', { cls: 'dms-sidebar-countdown-timer-progress-bar' });
    // 创建状态图标
    const iconEl = this.container.createEl('span', { cls: 'dms-sidebar-countdown-timer-icon' });
    setIcon(iconEl, 'play');
    
    // 创建时间显示
    const timeEl = this.container.createEl('span', { cls: 'dms-sidebar-countdown-timer-time' });
    timeEl.setText(formatTime(totalSeconds));

    const refreshTimer = () => {
        if (remainingSeconds > 0) {
            remainingSeconds--;
            timeEl.setText(formatTime(remainingSeconds));
            progressBar.setAttribute('style', `width: ${(1 - remainingSeconds / totalSeconds) * 100}%`);
        }
        if (remainingSeconds === 0) {
            // 停止计时
            stopTimer();
            // 重置状态
            timeEl.setText(formatTime(totalSeconds));
        }
    }
    const stopTimer = () => {
        if (timerSubscription) {
            try {
                timerSubscription();
            } catch (error) {
                console.error('停止计时器失败:', error);
            }
            timerSubscription = null;
            setIcon(iconEl, 'play');
            timeEl.setText(formatTime(totalSeconds));
            progressBar.setAttribute('style', `width: 100%`);
            remainingSeconds = totalSeconds;
            isRunning = false;
        }
    }
    // 点击事件处理
    this.container.addEventListener('click', () => {
        if (isRunning) {
            stopTimer();
        } else {
            // 开始计时
            if (remainingSeconds <= 0) {
                remainingSeconds = totalSeconds;
            }
            isRunning = true;
            setIcon(iconEl, 'pause');
            timerSubscription = timer.subscribe('second', refreshTimer);
        }
    });

    // 在视图关闭时清理
    this.view.register(stopTimer);
}