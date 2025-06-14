import { App, ItemView, moment, setTooltip } from "obsidian";
import { WidgetComponent } from "../components/widgetComponent";
import { voidFunc, WidgetConfig } from "../types";
import { timerStore } from "../store";

export class MonthCalendar extends WidgetComponent {
    private yearMonthEl: HTMLElement;
    private dateGrid: HTMLElement;
    private subscription: voidFunc[] = [];

    constructor(
        container: HTMLElement,
        widget: WidgetConfig,
        app: App,
    ) {
        super(container, widget, app);
    }

    /**
     * 更新月历显示
     * @param time moment对象
     */
    private updateCalendarDisplay(time: moment.Moment | undefined) {
        if (!time) return;

        const currentYear = time.year();
        const currentMonth = time.month(); // 0-11
        const currentDate = time.date(); // 当前日期

        // 更新年月标题
        this.yearMonthEl.setText(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`);

        // 获取当月第一天
        const firstDayOfMonth = time.clone().startOf('month');
        // 获取当月第一天是星期几 (0-6, 0表示星期日)
        const firstDayWeekday = firstDayOfMonth.day();
        // 获取当月天数
        const daysInMonth = time.daysInMonth();

        // 清空所有日期单元格
        this.dateGrid.empty();

        // 填充日期
        let day = -firstDayWeekday + 1;
        for (let i = 0; i < 6; i++) { // 最多6行
            const row = this.dateGrid.createDiv({ cls: 'dms-sidebar-month-calendar-row' });
            // 如果已经超出当月天数，结束
            if (day > daysInMonth) {
                break;
            }
            for (let j = 0; j < 7; j++) { // 7列，对应周日到周六
                // 创建日期单元格
                const cell = row.createSpan({ cls: 'dms-sidebar-month-calendar-date' });
                // 空白
                if (day<= 0 || day > daysInMonth) {
                    day++;
                    continue;
                }

                // 填充日期
                const dateText = String(day).padStart(2, '0');
                cell.setText(dateText);

                // 设置日期提示
                const dateObj = firstDayOfMonth.clone().add(day - 1, 'days');
                setTooltip(cell, dateObj.format('YYYY-MM-DD'), { placement: 'top' });

                // 如果是当天，添加高亮样式
                if (currentMonth === time.month() && day === currentDate) {
                    cell.addClass('dms-sidebar-month-calendar-current');
                }
                day++;
            }

            // 如果已经填充完当月所有日期，结束循环
            if (day > daysInMonth) {
                break;
            }
        }
    }

    onload(): void {
        // 创建年月标题行
        const yearMonthRow = this.container.createDiv({ cls: 'dms-sidebar-month-calendar-header' });
        this.yearMonthEl = yearMonthRow.createSpan({ cls: 'dms-sidebar-month-calendar-yearmonth' });

        // 创建星期行容器
        const weekRow = this.container.createDiv({ cls: 'dms-sidebar-month-calendar-weekdays' });
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
            weekRow.createSpan({ cls: 'dms-sidebar-month-calendar-weekday', text: day });
        });

        // 创建日期网格容器
        this.dateGrid = this.container.createDiv({ cls: 'dms-sidebar-month-calendar-grid' });

        // 初始化时更新一次显示
        this.updateCalendarDisplay(timerStore.getState().moment?.clone());

        // 订阅时间状态更新（每天更新一次）
        this.subscription.push(
            timerStore.subscribe('day', () => {
                this.updateCalendarDisplay(timerStore.getState().moment?.clone());
            })
        );
    }

    onunload(): void {
        this.subscription.forEach(v => v());
    }
}