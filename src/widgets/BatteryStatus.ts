import { App, ItemView, moment, setIcon } from "obsidian";
import { WidgetConfig } from "../types";
import { timer } from "../store";

/**
 * 获取设备电池状态
 * @returns 包含电量百分比和充电状态的对象
 */
function getBatteryStatus(): Promise<{ level: number; charging: boolean }> {
    return new Promise(async (resolve) => {
        // 默认值
        const defaultStatus = { level: 100, charging: false };
        
        try {
            // 检查浏览器是否支持Battery API
            if (!('getBattery' in navigator)) {
                console.warn('Battery API not supported');
                resolve(defaultStatus);
                return;
            }
            
            // 获取电池信息
            // @ts-ignore - 某些环境下TypeScript可能不认识navigator.getBattery
            const battery = await navigator.getBattery();
            
            // 返回电池状态
            resolve({
                level: Math.floor(battery.level * 100),
                charging: battery.charging
            });
        } catch (error) {
            console.error('获取电池状态失败:', error);
            resolve(defaultStatus);
        }
    });
}

/**
 * 根据电量级别获取对应的CSS类名
 * @param level 电量百分比
 * @returns CSS类名
 */
function getBatteryLevelClass(level: number): string {
    if (level <= 20) return 'dms-sidebar-battery-low';
    if (level <= 50) return 'dms-sidebar-battery-medium';
    return 'dms-sidebar-battery-high';
}

/**
 * 渲染电池状态挂件
 * @param this 组件上下文，包含widget配置、视图实例、容器元素和应用实例
 */
export function renderBatteryStatus(
    this: {
        widget: WidgetConfig;
        view: ItemView;
        container: HTMLElement;
        app: App;
    }) {
        const batteryLevel = this.container.createDiv({ cls: 'dms-sidebar-battery-level' });
        const batteryIcon = this.container.createDiv({ cls: 'dms-sidebar-battery-icon' });
        const batteryPercent = this.container.createDiv({ cls: 'dms-sidebar-battery-percent' });
    // 更新电池状态显示
    const updateBatteryDisplay = async () => {
        const { level, charging } = await getBatteryStatus();
        // 更新电量填充区域高度
        batteryLevel.setAttribute('style', `width: ${level}%`);
        // 更新电量文本
        batteryPercent.setText(`${level}%`);
        // 更新充电状态
        if (charging) {
            setIcon(batteryIcon, 'battery-charging');
            batteryIcon.dataset.status = 'charging';
        } else {
            setIcon(batteryIcon, 'battery');
            batteryIcon.dataset.status = 'discharging';
        }
        // 更新电量级别
        const levelStatus = Math.floor(level / 20) * 20;
        batteryLevel.dataset.level = String(levelStatus);
    };
    
    // 初始更新
    updateBatteryDisplay();
    
    // 每分钟更新一次电池状态
    const unsubscribe = timer.subscribe('minute', () => {
        updateBatteryDisplay();
    });
    
    // 在视图关闭时取消订阅
    this.view.register(() => unsubscribe());
}