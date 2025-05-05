import { App, moment, setTooltip } from "obsidian";
import { WidgetComponent } from "../components/widgetComponent";
import { voidFunc, WidgetConfig } from "../types";
import { timer } from "../store";

export class WeekCalendar extends WidgetComponent {
    private weekDays: HTMLElement[] = [];
    private dates: HTMLElement[] = [];
    private subscription: voidFunc[] = [];

    constructor(
        container: HTMLElement,
        widget: WidgetConfig,
        app: App,
    ) {
        super(container, widget, app);
    }

    /**
     * 更新日历显示
     * @param time moment对象
     */
    private updateCalendarDisplay(time: moment.Moment | undefined) {
        if (!time) return;

        const currentDay = time.day(); // 获取当前日期
        const currentDate = time.date(); // 获取当前日期

        // 获取本周的起始日期（周日）
        const weekStart = time.clone().subtract(currentDay, 'days');

        // 更新星期和日期显示
        for (let i = 0; i < 7; i++) {
            const dayDate = weekStart.clone().add(i, 'days');
            const thisDate = dayDate.format('DD');
            // 更新日期数字
            this.dates[i].setText(thisDate);
            setTooltip(this.dates[i], dayDate.format('YYYY-MM-DD'), { placement: 'top' });
            // 如果是当天，添加高亮样式
            this.dates[i].toggleClass('dms-sidebar-week-calendar-current', +thisDate === currentDate);
        }
    }

    onload(): void {
        // 创建星期行容器
        const weekRow = this.container.createDiv({ cls: 'dms-sidebar-week-calendar-row' });
        this.weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => {
            return weekRow.createSpan({ cls: 'dms-sidebar-week-calendar-weekday', text: day });
        });

        // 创建日期行容器
        const dateRow = this.container.createDiv({ cls: 'dms-sidebar-week-calendar-row' });
        this.dates = Array(7).fill(null).map(() => {
            return dateRow.createSpan({ cls: 'dms-sidebar-week-calendar-date' });
        });

        // 初始化时更新一次显示
        this.updateCalendarDisplay(timer.getState().moment);

        // 订阅时间状态更新（每小时更新一次）
        this.subscription.push(
            timer.subscribe('hours', () => {
                this.updateCalendarDisplay(timer.getState().moment);
            })
        );
    }

    onunload(): void {
        this.subscription.forEach(v => v());
    }
}