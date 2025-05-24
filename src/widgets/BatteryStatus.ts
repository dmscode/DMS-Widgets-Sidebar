import { App, setIcon } from "obsidian";
import { ProgressWidgetComponent } from "../components/widgetComponent";
import { voidFunc, WidgetConfig } from "../types";
import { timer } from "../store";

export class BatteryStatus extends ProgressWidgetComponent {
    private batteryIcon: HTMLElement;
    private batteryPercent: HTMLElement;
    private subscriptions: voidFunc[] = [];

    constructor(
        container: HTMLElement,
        widget: WidgetConfig,
        app: App,
    ) {
        super(container, widget, app);
    }

    /**
     * 获取设备电池状态
     * @returns 包含电量百分比和充电状态的对象
     */
    private async getBatteryStatus(): Promise<{ level: number; charging: boolean }> {
        // 默认值
        const defaultStatus = { level: 100, charging: false };

        try {
            // 检查浏览器是否支持Battery API
            if (!('getBattery' in navigator)) {
                console.warn('Battery API not supported');
                return defaultStatus;
            }

            // 获取电池信息
            // @ts-ignore - 某些环境下TypeScript可能不认识navigator.getBattery
            const battery = await navigator.getBattery();

            // 返回电池状态
            return {
                level: Math.floor(battery.level * 100),
                charging: battery.charging
            };
        } catch (error) {
            console.error('获取电池状态失败:', error);
            return defaultStatus;
        }
    }

    /**
     * 更新电池状态显示
     */
    private async updateBatteryDisplay() {
        const { level, charging } = await this.getBatteryStatus();
        // 更新电量填充区域宽度
        this.setProgress(level);
        // 更新电量文本
        this.batteryPercent.setText(`${level}%`);
        this.batteryPercent.dataset.level = `${level}%`;
        // 更新充电状态
        if (charging) {
            setIcon(this.batteryIcon, 'battery-charging');
            this.batteryIcon.dataset.status = 'charging';
        } else {
            setIcon(this.batteryIcon, 'battery');
            this.batteryIcon.dataset.status = 'discharging';
        }
    }

    onload(): void {
        // 创建电池状态显示元素
        this.batteryIcon = this.container.createDiv({ cls: 'dms-sidebar-battery-icon' });
        this.batteryPercent = this.container.createDiv({ cls: 'dms-sidebar-battery-percent' });

        // 初始更新
        this.updateBatteryDisplay();

        // 每分钟更新一次电池状态
        const unsubscribe = timer.subscribe('minute', () => {
            this.updateBatteryDisplay();
        });

        // 添加到订阅列表
        this.subscriptions.push(unsubscribe);
    }

    onunload(): void {
        // 清理所有订阅
        this.subscriptions.forEach(unsubscribe => unsubscribe());
        this.subscriptions = [];
    }
}