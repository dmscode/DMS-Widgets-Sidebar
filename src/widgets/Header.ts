import { App, ItemView } from "obsidian";
import { WidgetConfig } from "../types";

/**
 * 渲染标题组件
 * @param this 组件上下文，包含widget配置、视图实例、容器元素和应用实例
 */
export function renderHeader(
    this: {
        widget: WidgetConfig;
        view: ItemView;
        container: HTMLElement;
        app: App;
    }) {
    // 从widget类型中提取标题级别，默认为3级标题
    const headerLevel = this.widget.type.match(/(\d)$/)?.[1] || '3';
    // 创建对应级别的标题元素，设置文本内容和样式类
    this.container.createEl(`h${headerLevel}` as keyof HTMLElementTagNameMap, { text: this.widget.code, cls: `dms-widget-header dms-widget-header-${headerLevel}`  });
}