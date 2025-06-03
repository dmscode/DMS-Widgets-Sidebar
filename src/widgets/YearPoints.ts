import { App, moment, setTooltip } from "obsidian";
import { WidgetComponent } from "../components/widgetComponent";
import { voidFunc, WidgetConfig } from "../types";
import { timerStore } from "../store";

/**
 * 年度点阵进度挂件类
 */
export class YearPoints extends WidgetComponent {
    private yearContainer: HTMLElement;
    private yearText: HTMLElement;
    private progressText: HTMLElement;
    private pointsContainer: HTMLElement;
    private subscription: voidFunc[] = [];

    constructor(
        container: HTMLElement,
        widget: WidgetConfig,
        app: App,
    ) {
        super(container, widget, app);
    }

    /**
     * 更新显示
     * @param currentTime 当前时间
     */
    private updateDisplay(currentTime: moment.Moment) {
        const currentYear = currentTime.year();
        const isLeapYear = moment([currentYear]).isLeapYear();
        const totalDays = isLeapYear ? 366 : 365;
        const dayOfYear = currentTime.dayOfYear();
        const progress = (dayOfYear / totalDays * 100).toFixed(1);

        // 更新年份和进度文本
        this.yearText.setText(String(currentYear));
        this.progressText.setText(` ${progress}%`);

        // 清空并重新创建点阵
        this.pointsContainer.empty();

        // 创建所有日期点
        for (let day = 1; day <= totalDays; day++) {
            const className = [
                'dms-sidebar-year-points-day',
                ...(day < dayOfYear ? ['dms-sidebar-year-points-past'] : []),
                ...(day === dayOfYear? ['dms-sidebar-year-points-today'] : [])
            ].join(' ');
            const point = this.pointsContainer.createDiv({ cls: className });
            setTooltip(point, `${moment([currentYear]).dayOfYear(day).format('MM-DD')} (${day}/${totalDays})`, { placement: 'top' });
        }
    }

    onload(): void {
        // 创建年份和进度显示容器
        this.yearContainer = this.container.createDiv({ cls: 'dms-sidebar-year-points-header' });
        this.yearText = this.yearContainer.createSpan({ cls: 'dms-sidebar-year-points-year' });
        this.progressText = this.yearContainer.createSpan({ cls: 'dms-sidebar-year-points-progress' });

        // 创建点阵容器
        this.pointsContainer = this.container.createDiv({ cls: 'dms-sidebar-year-points-grid' });

        // 初始更新
        const initialTime = timerStore.getState().moment?.clone();
        if (initialTime) {
            this.updateDisplay(initialTime);
        }

        // 订阅时间变化，每天更新一次
        this.subscription.push(
            timerStore.subscribe('day', () => {
                const time = timerStore.getState().moment?.clone();
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