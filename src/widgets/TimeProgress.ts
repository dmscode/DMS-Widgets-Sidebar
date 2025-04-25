import { App, ItemView, moment } from "obsidian";
import { WidgetConfig } from "../types";
import { timer } from "../store";

type ItemType = {
    type: string;
    container: HTMLElement;
    label?: HTMLElement;
    progressbar?: HTMLProgressElement;
    percent?: HTMLElement;
}

/**
 * 渲染时间进度组件
 * @param this 组件上下文，包含widget配置、视图实例、容器元素和应用实例
 */
/**
 * 计算时间进度
 * @param time moment对象
 * @param type 时间类型（Year/Month/Week/Day）
 * @returns 进度百分比
 */
function calculateProgress(time: moment.Moment, type: string): number {
    const start = time.clone().startOf(type.toLowerCase() as moment.unitOfTime.StartOf);
    const end = time.clone().endOf(type.toLowerCase() as moment.unitOfTime.StartOf);
    return ((time.valueOf() - start.valueOf()) / (end.valueOf() - start.valueOf())) * 100;
}

/**
 * 更新时间进度UI
 * @param items 进度条项目列表
 * @param time moment对象
 */
function updateProgressUI(items: ItemType[], time: moment.Moment) {
    items.forEach(item => {
        const progress = calculateProgress(time, item.type);
        if (item.progressbar && item.percent) {
            item.progressbar.value = parseFloat(progress.toFixed(2));
            item.percent.setText(`${progress.toFixed(2)}%`);
        }
    });
}

export function renderTimeProgress(
    this: {
        widget: WidgetConfig;
        view: ItemView;
        container: HTMLElement;
        app: App;
    }) {

    // 创建年、月、周、日的进度条
    const items:ItemType[] = ['Year', 'Month', 'Week', 'Day'].map(type => ({
        type,
        container: this.container.createDiv({ cls: 'dms-time-progress-item dms-time-progress-'+type.toLowerCase() })
    }));

    // 为每个项目创建标题、进度条和百分比显示
    items.forEach(item => {
        item.label = item.container.createSpan({ cls: 'dms-time-progress-label', text: item.type });
        item.progressbar = item.container.createEl('progress', { cls: 'dms-time-progress-bar', attr: { max: '100', value: '0' } });
        item.percent = item.container.createSpan({ cls: 'dms-time-progress-percent' });
    });

    // 初始化时更新一次进度
    const initialTime = timer.getState().moment;
    if (initialTime) {
        updateProgressUI(items, initialTime);
    }

    // 订阅时间状态更新
    const unsubscribe = timer.subscribe('minute', () => {
        const time = timer.getState().moment;
        if (time) {
            updateProgressUI(items, time);
        }
    });

    // 在视图关闭时取消订阅
    this.view.register(() => unsubscribe());
}