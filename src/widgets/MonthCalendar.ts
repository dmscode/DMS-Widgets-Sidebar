import { App, ItemView, moment, setTooltip } from "obsidian";
import { WidgetConfig } from "../types";
import { timer } from "../store";

/**
 * 更新月历显示
 * @param time moment对象
 * @param yearMonthEl 年月标题元素
 * @param dateElements 日期显示元素数组
 */
function updateCalendarDisplay(time: moment.Moment | undefined, yearMonthEl: HTMLElement, dateElements: HTMLElement[][]) {
    if (!time) return;

    const currentYear = time.year();
    const currentMonth = time.month(); // 0-11
    const currentDate = time.date(); // 当前日期
    
    // 更新年月标题
    yearMonthEl.setText(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`);
    
    // 获取当月第一天
    const firstDayOfMonth = time.clone().startOf('month');
    // 获取当月第一天是星期几 (0-6, 0表示星期日)
    const firstDayWeekday = firstDayOfMonth.day();
    // 获取当月天数
    const daysInMonth = time.daysInMonth();
    
    // 清空所有日期单元格
    dateElements.forEach(row => {
        row.forEach(cell => {
            cell.setText('');
            cell.removeClass('dms-sidebar-month-calendar-current');
            setTooltip(cell, '');
        });
    });
    
    // 填充日期
    let day = 1;
    for (let i = 0; i < 6; i++) { // 最多6行
        for (let j = 0; j < 7; j++) { // 7列，对应周日到周六
            // 跳过第一行中第一天之前的单元格
            if (i === 0 && j < firstDayWeekday) {
                continue;
            }
            
            // 如果已经超出当月天数，结束填充
            if (day > daysInMonth) {
                break;
            }
            
            // 填充日期
            const dateText = String(day).padStart(2, '0');
            dateElements[i][j].setText(dateText);
            
            // 设置日期提示
            const dateObj = firstDayOfMonth.clone().add(day - 1, 'days');
            setTooltip(dateElements[i][j], dateObj.format('YYYY-MM-DD'), { placement: 'top' });
            
            // 如果是当天，添加高亮样式
            if (currentMonth === time.month() && day === currentDate) {
                dateElements[i][j].addClass('dms-sidebar-month-calendar-current');
            }
            
            day++;
        }
        
        // 如果已经填充完当月所有日期，结束循环
        if (day > daysInMonth) {
            break;
        }
    }
}

/**
 * 渲染月历组件
 * @param this 组件上下文，包含widget配置、视图实例、容器元素和应用实例
 */
export function renderMonthCalendar(
    this: {
        widget: WidgetConfig;
        view: ItemView;
        container: HTMLElement;
        app: App;
    }) {
    // 创建年月标题行
    const yearMonthRow = this.container.createDiv({ cls: 'dms-sidebar-month-calendar-header' });
    const yearMonthEl = yearMonthRow.createSpan({ cls: 'dms-sidebar-month-calendar-yearmonth' });
    
    // 创建星期行容器
    const weekRow = this.container.createDiv({ cls: 'dms-sidebar-month-calendar-weekdays' });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => {
        return weekRow.createSpan({ cls: 'dms-sidebar-month-calendar-weekday', text: day });
    });

    // 创建日期网格容器
    const dateGrid = this.container.createDiv({ cls: 'dms-sidebar-month-calendar-grid' });
    
    // 创建6行7列的日期网格（最多6行可以显示一个月的所有日期）
    const dateElements: HTMLElement[][] = [];
    for (let i = 0; i < 6; i++) {
        const row = dateGrid.createDiv({ cls: 'dms-sidebar-month-calendar-row' });
        const rowElements: HTMLElement[] = [];
        
        for (let j = 0; j < 7; j++) {
            rowElements.push(row.createSpan({ cls: 'dms-sidebar-month-calendar-date' }));
        }
        
        dateElements.push(rowElements);
    }

    // 初始化时更新一次显示
    updateCalendarDisplay(timer.getState().moment, yearMonthEl, dateElements);

    // 订阅时间状态更新（每天更新一次）
    const unsubscribe = timer.subscribe('day', () => {
        updateCalendarDisplay(timer.getState().moment, yearMonthEl, dateElements);
    });
    
    // 在视图关闭时取消订阅
    this.view.register(() => unsubscribe());
}