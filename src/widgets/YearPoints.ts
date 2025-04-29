import { App, ItemView, moment, setTooltip } from "obsidian";
import { WidgetConfig } from "../types";
import { timer } from "../store";

/**
 * 渲染年度点阵进度组件
 * @param this 组件上下文，包含widget配置、视图实例、容器元素和应用实例
 */
export function renderYearPoints(
    this: {
        widget: WidgetConfig;
        view: ItemView;
        container: HTMLElement;
        app: App;
    }) {
    // 创建年份和进度显示容器
    const yearContainer = this.container.createDiv({ cls: 'dms-sidebar-year-points-header' });
    const yearText = yearContainer.createSpan({ cls: 'dms-sidebar-year-points-year' });
    const progressText = yearContainer.createSpan({ cls: 'dms-sidebar-year-points-progress' });

    // 创建点阵容器
    const pointsContainer = this.container.createDiv({ cls: 'dms-sidebar-year-points-grid' });

    // 更新显示函数
    function updateDisplay(currentTime: moment.Moment) {
        const currentYear = currentTime.year();
        const isLeapYear = moment([currentYear]).isLeapYear();
        const totalDays = isLeapYear ? 366 : 365;
        const dayOfYear = currentTime.dayOfYear();
        const progress = (dayOfYear / totalDays * 100).toFixed(1);

        // 更新年份和进度文本
        yearText.setText(String(currentYear));
        progressText.setText(` ${progress}%`);

        // 清空并重新创建点阵
        pointsContainer.empty();

        // 创建所有日期点
        for (let day = 1; day <= totalDays; day++) {
            const className = [
                'dms-sidebar-year-points-day',
                ...(day < dayOfYear ? ['dms-sidebar-year-points-past'] : []),
                ...(day === dayOfYear? ['dms-sidebar-year-points-today'] : [])
            ].join(' ');
            const point = pointsContainer.createDiv({ cls: className });
            setTooltip(point, `${moment([currentYear]).dayOfYear(day).format('MM-DD')} (${day}/${totalDays})`, { placement: 'top' });
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