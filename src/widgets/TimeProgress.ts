import { WidgetComponent } from "../components/widgetComponent";
import { ProgressComponent } from "../components/progressComponent";
import { App, moment } from "obsidian";
import { voidFunc, WidgetConfig } from '../types';
import { timerStore } from "../store";

type ItemType = {
    type: string;
    progressbar?: ProgressComponent;
}

export class TimeProgress extends WidgetComponent {
    private items: ItemType[] = [];
    private subscription: voidFunc[] = [];

    constructor(
        container: HTMLElement,
        widget: WidgetConfig,
        app: App,
    ) {
        super(container, widget, app);
    }

    /**
     * 计算时间进度
     * @param time moment对象
     * @param type 时间类型（Year/Month/Week/Day）
     * @returns 进度百分比
     */
    private calculateProgress(time: moment.Moment, type: string): number {
        const start = time.clone().startOf(type.toLowerCase() as moment.unitOfTime.StartOf);
        const end = time.clone().endOf(type.toLowerCase() as moment.unitOfTime.StartOf);
        return ((time.valueOf() - start.valueOf()) / (end.valueOf() - start.valueOf())) * 100;
    }

    /**
     * 更新时间进度UI
     * @param time moment对象
     */
    private updateProgressUI(time: moment.Moment) {
        this.items.forEach(item => {
            const progress = this.calculateProgress(time, item.type);
            item.progressbar?.setProgress(parseFloat(progress.toFixed(2)))
        });
    }

    onload(): void {
        // 创建年、月、周、日的进度条
        this.items = ['Year', 'Month', 'Week', 'Day'].map(type => ({
            type,
            progressbar: new ProgressComponent(this.container, {
                title: type,
                progress: 0,
                precent: '0%',
                cls: ['dms-time-progress-item', `dms-time-progress-item-${type.toLowerCase()}`, 'dms-sidebar-progress-level-reverse'],
            })
        }));

        // 初始化时更新一次进度
        const initialTime = timerStore.getState().moment;
        if (initialTime) {
            this.updateProgressUI(initialTime);
        }

        // 订阅时间状态更新
        this.subscription.push(timerStore.subscribe('minute', () => {
                const time = timerStore.getState().moment;
                if (time) {
                    this.updateProgressUI(time);
                }
            })
        );
    }

    onunload(): void {
        this.subscription.forEach(v => v());
    }
}