import { App, ItemView, moment } from "obsidian";
import { WidgetConfig } from "../types";
import { timer } from "../store";

/**
 * 渲染数字时钟组件
 * @param this 组件上下文，包含widget配置、视图实例、容器元素和应用实例
 */
/**
 * 更新时钟显示
 * @param time moment对象
 * @param els 时钟显示元素数组
 */
function updateTimeDisplay(time: moment.Moment | undefined, els: HTMLElement[]) {
    if (!time) return;
    
    // 更新小时和分钟显示
    time.format('HH').split('').forEach((v, i) => {
        els[i].setText(v);
    });
    time.format('mm').split('').forEach((v, i) => {
        els[i + 3].setText(v);
    });
    // 根据秒数的奇偶性切换分隔符的可见性
    els[2].toggleClass('blink', time.second() % 2 === 0);
}

export function renderDigitalClock(
    this: {
        widget: WidgetConfig;
        view: ItemView;
        container: HTMLElement;
        app: App;
    }) {
    const els = '00:00'.split('').map((v) => {
        return this.container.createEl('span', { cls: 'dms-digital-clock-digit', text: v  });
    });

    // 初始化时更新一次显示
    updateTimeDisplay(timer.getState().moment, els);

    // 订阅时间状态更新
    const unsubscribe = timer.subscribe('second', () => {
        updateTimeDisplay(timer.getState().moment, els);
    });
    
    // 在视图关闭时取消订阅
    this.view.register(() => unsubscribe());
}