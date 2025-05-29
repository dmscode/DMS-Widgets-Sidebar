import { App, moment, parseYaml } from "obsidian";
import { ProgressWidgetComponent } from "../components/widgetComponent";
import { voidFunc, WidgetConfig } from "../types";
import { timerStore } from "../store";
import { getLang } from "../local/lang";

/**
 * 工作时间进度挂件类
 */
export class WorkingTimeProgress extends ProgressWidgetComponent {
    private titleEl: HTMLElement;
    private timeRemainingEl: HTMLElement;
    private subscription: voidFunc[] = [];
    private config: { startTime: string; endTime: string };

    constructor(
        container: HTMLElement,
        widget: WidgetConfig,
        app: App,
    ) {
        super(container, widget, app);
        this.config = this.getConfig(this.widget.code);
    }

    /**
     * 解析YAML格式的挂件代码
     * @param code YAML格式的代码字符串
     * @returns 解析后的对象，包含开始时间和结束时间
     */
    private getConfig(code: string): { startTime: string; endTime: string } {
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
     * 格式化剩余时间
     * @param minutes 剩余分钟数
     * @returns 格式化后的时间字符串
     */
    private formatRemainingTime(minutes: number): string {
        if (minutes < 60) {
            return `${minutes} ${getLang('working_time_progress_minute', '分钟')}`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours} ${getLang('working_time_progress_hour', '小时')} ${remainingMinutes} ${getLang('working_time_progress_minute', '分钟')}`;
    }

    /**
     * 计算工作时间进度
     * @param currentTime 当前时间
     * @returns 进度信息对象
     */
    private calculateWorkProgress(currentTime: moment.Moment): {
        isWorking: boolean;
        progress: number;
        remainingMinutes: number;
        remainingTimeText: string;
        isNextDay: boolean;
    } {
        // 创建基于当前时间的时间点
        const now = moment(currentTime);

        // 创建今天的开始和结束时间点
        let start = moment(currentTime).startOf('day').add(moment.duration(this.config.startTime));
        let end = moment(currentTime).startOf('day').add(moment.duration(this.config.endTime));
        let isNextDay = false;

        // 如果结束时间小于开始时间或以+开头，则结束时间为第二天
        if (end.isBefore(start) || this.config.endTime.startsWith('+')) {
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
            remainingTimeText: this.formatRemainingTime(remainingMinutes),
            isNextDay
        };
    }

    /**
     * 更新显示
     * @param currentTime 当前时间
     */
    private updateDisplay(currentTime: moment.Moment | undefined) {
        if (!currentTime) return;
        const progress = this.calculateWorkProgress(currentTime);

        // 更新标题
        this.titleEl.setText(progress.isWorking ? getLang('working_time_progress_working', '工作中') : getLang('working_time_progress_resting', '休息中'));
        this.container.dataset.status = progress.isWorking ? 'working' : 'resting';

        // 更新时间范围显示
        this.timeRemainingEl.setText(
            progress.isWorking ?
            `${getLang('working_time_progress_working_is_remaining', '剩余')} ${progress.remainingTimeText}` :
            ''
        );

        // 更新进度条
        if (progress.isWorking) {
            this.setProgress(100-progress.progress);
        }
    }

    onload(): void {
        // 创建显示元素
        this.titleEl = this.container.createDiv({ cls: 'dms-sidebar-working-time-title' });
        this.timeRemainingEl = this.container.createDiv({ cls: 'dms-sidebar-working-time-remaining' });
        // 设置进度条方向
        this.setDirection('vertical', 'end');

        // 初始更新
        const initialTime = timerStore.getState().moment;
        if (initialTime) {
            this.updateDisplay(initialTime);
        }

        // 订阅时间变化
        this.subscription.push(
            timerStore.subscribe('minute', () => {
                this.updateDisplay(timerStore.getState().moment);
            })
        );
    }

    onunload(): void {
        this.subscription.forEach(v => v());
    }
}