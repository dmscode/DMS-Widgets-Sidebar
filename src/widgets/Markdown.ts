import { App, ItemView, MarkdownRenderer } from "obsidian";
import { WidgetConfig } from "../types";

/**
 * 渲染标题组件
 * @param this 组件上下文，包含widget配置、视图实例、容器元素和应用实例
 */
export async function renderText(
    this: {
        widget: WidgetConfig;
        view: ItemView;
        container: HTMLElement;
        app: App;
    }) {
        await MarkdownRenderer.render(this.app, this.widget.code, this.container, '', this.view);
}