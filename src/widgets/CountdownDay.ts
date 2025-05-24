import { App, moment, parseYaml } from "obsidian";
import { WidgetComponent } from "../components/widgetComponent";
import { voidFunc, WidgetConfig } from "../types";
import { timer } from "../store";
import { getLang } from "../local/lang";

export class CountdownDay extends WidgetComponent {
    private messageEl: HTMLElement;
    private daysEl: HTMLElement;
    private daysCountEl: HTMLElement;
    private daysUnitEl: HTMLElement;
    private subscription: voidFunc[] = [];
    private config: { name: string; date: string };

    constructor(
        container: HTMLElement,
        widget: WidgetConfig,
        app: App,
    ) {
        super(container, widget, app);
        this.config = this.getConfig(widget.code);
    }

    /**
     * 解析YAML格式的挂件代码
     * @param code YAML格式的代码字符串
     * @returns 解析后的对象，包含name和date属性
     */
    private getConfig(code: string): { name: string; date: string } {
        // 默认值
        const defaultResult = { 
            name: getLang('countdown_unnamed_event', '未命名事件'), 
            date: moment().format('YYYY-MM-DD') 
        };

        if (!code || code.trim() === '') return defaultResult;

        try {
            return parseYaml(code) as { name: string; date: string };
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
    private calculateDaysDifference(targetDate: moment.Moment, currentDate: moment.Moment): number {
        return targetDate.startOf('day').diff(currentDate.startOf('day'), 'days');
    }

    /**
     * 更新倒计时显示
     */
    private updateDisplay(currentTime: moment.Moment | undefined) {
        if (!currentTime) return;

        const targetDate = moment(this.config.date, 'YYYY-MM-DD');
        const daysDiff = this.calculateDaysDifference(targetDate, currentTime);

        // 根据日期差值显示不同的消息
        if (daysDiff > 0) {
            // 未来日期
            this.messageEl.setText(getLang('countdown_future_prefix', '距离 ') + 
                this.config.name + getLang('countdown_future_suffix', ' 还有'));
            // 根据天数选择单复数形式
            this.daysCountEl.setText(String(daysDiff));
            this.daysCountEl.dataset.status = 'future';
            this.daysCountEl.setAttribute('style', 
                `font-size: calc(var(--dms-sidebar-width) / ${String(daysDiff).length/2 + 2})`);
            this.daysUnitEl.setText(daysDiff === 1 ? 
                getLang('countdown_day_singular', '天') : 
                getLang('countdown_day_plural', '天'));
        } else if (daysDiff === 0) {
            // 今天
            this.messageEl.setText(getLang('countdown_today_prefix', '今天是 ') + 
                this.config.name + getLang('countdown_today_suffix', ''));
            this.daysCountEl.setText(getLang('countdown_today', '今天'));
            this.daysCountEl.dataset.status = 'today';
            this.daysUnitEl.setText('');
        } else {
            // 过去日期
            this.messageEl.setText(getLang('countdown_past_prefix', '') + 
                this.config.name + getLang('countdown_past_suffix', ' 已经过去'));
            // 根据天数选择单复数形式
            const absDays = Math.abs(daysDiff);
            this.daysCountEl.setText(String(absDays));
            this.daysCountEl.dataset.status = 'past';
            this.daysCountEl.setAttribute('style', 
                `font-size: calc(var(--dms-sidebar-width) / ${String(absDays).length/2 + 2})`);
            this.daysUnitEl.setText(absDays === 1 ? 
                getLang('countdown_day_singular', '天') : 
                getLang('countdown_day_plural', '天'));
        }
    }

    onload(): void {
        // 创建显示文本的元素
        this.messageEl = this.container.createDiv({ cls: 'dms-sidebar-countdown-day-message' });
        this.daysEl = this.container.createDiv({ cls: 'dms-sidebar-countdown-day-days' });
        this.daysCountEl = this.daysEl.createSpan({ cls: 'dms-sidebar-countdown-day-days-count' });
        this.daysUnitEl = this.daysEl.createSpan({ cls: 'dms-sidebar-countdown-day-days-unit' });

        // 初始更新
        const initialTime = timer.getState().moment;
        if (initialTime) {
            this.updateDisplay(initialTime);
        }

        // 订阅时间变化，每天更新一次
        this.subscription.push(
            timer.subscribe('day', () => {
                const time = timer.getState().moment;
                if (time) {
                    this.updateDisplay(time);
                }
            })
        );
    }

    onunload(): void {
        this.subscription.forEach(v => v());
    }
}