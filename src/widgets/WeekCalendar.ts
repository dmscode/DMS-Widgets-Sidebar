import { App, ItemView, moment, setTooltip } from "obsidian";
import { WidgetConfig } from "../types";
import { timer } from "../store";

/**
 * 更新日历显示
 * @param time moment对象
 * @param weekDays 星期显示元素数组
 * @param dates 日期显示元素数组
 */
function updateCalendarDisplay(time: moment.Moment | undefined, weekDays: HTMLElement[], dates: HTMLElement[]) {
    if (!time) return;

    const currentDay = time.day(); // 获取当前日期
    const currentDate = time.date(); // 获取当前日期

    // 获取本周的起始日期（周日）
    const weekStart = time.clone().subtract(currentDay, 'days')

    // 更新星期和日期显示
    for (let i = 0; i < 7; i++) {
        const dayDate = weekStart.clone().add(i, 'days');
        const thisDate = dayDate.format('DD');
        // 更新日期数字
        dates[i].setText(thisDate);
        setTooltip(dates[i], dayDate.format('YYYY-MM-DD'), { placement: 'top' });
        // 如果是当天，添加高亮样式
        dates[i].toggleClass('dms-sidebar-week-calendar-current', +thisDate === currentDate);
    }
}

/**
 * 渲染周历组件
 * @param this 组件上下文，包含widget配置、视图实例、容器元素和应用实例
 */
export function renderWeekCalendar(
    this: {
        widget: WidgetConfig;
        view: ItemView;
        container: HTMLElement;
        app: App;
    }) {
    // 创建星期行容器
    const weekRow = this.container.createDiv({ cls: 'dms-sidebar-week-calendar-row' });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => {
        return weekRow.createSpan({ cls: 'dms-sidebar-week-calendar-weekday', text: day });
    });

    // 创建日期行容器
    const dateRow = this.container.createDiv({ cls: 'dms-sidebar-week-calendar-row' });
    const dates = Array(7).fill(null).map(() => {
        return dateRow.createSpan({ cls: 'dms-sidebar-week-calendar-date' });
    });

    // 初始化时更新一次显示
    updateCalendarDisplay(timer.getState().moment, weekDays, dates);

    // 订阅时间状态更新（每小时更新一次）
    const unsubscribe = timer.subscribe('hours', () => {
        updateCalendarDisplay(timer.getState().moment, weekDays, dates);
    });
    
    // 在视图关闭时取消订阅
    this.view.register(() => unsubscribe());
}