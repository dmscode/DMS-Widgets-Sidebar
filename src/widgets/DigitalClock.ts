import { WidgetComponent } from "../components/widgetComponent";
import { App } from "obsidian";
import { voidFunc, WidgetConfig } from '../types';
import { timerStore } from '../store';

export class DigitalClock extends WidgetComponent {
    private els: HTMLElement[] = [];
    private subscription: voidFunc[] = []

    constructor(
        container: HTMLElement,
        widget: WidgetConfig,
        app: App,
    ) {
        super(container, widget, app);
    }

    /**
     * 更新时钟显示
     * @param time moment对象
     */
    private updateTimeDisplay() {
        const time = timerStore.getState().moment?.clone();
        if (!time) return;

        // 更新小时和分钟显示
        time.format('HH').split('').forEach((v, i) => {
            this.els[i].setText(v);
        });
        time.format('mm').split('').forEach((v, i) => {
            this.els[i + 3].setText(v);
        });
        // 根据秒数的奇偶性切换分隔符的可见性
        this.els[2].toggleClass('blink', time.second() % 2 === 0);
    }

    onload(): void {
        // 创建时钟数字元素
        this.els = '00:00'.split('').map((v) => {
            return this.container.createEl('span', { cls: 'dms-digital-clock-digit', text: v });
        });

        // 初始化时更新一次显示
        this.updateTimeDisplay();

        // 订阅时间状态更新
        this.subscription.push(
            timerStore.subscribe('second', () => {
                this.updateTimeDisplay();
            })
        );
    }
    onunload(): void {
        this.subscription.forEach(v => v());
    }
}