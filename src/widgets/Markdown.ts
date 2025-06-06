import { WidgetComponent } from "../components/widgetComponent";
// 第三方库导入
import { App, ItemView } from "obsidian";
// 类型定义导入
import { WidgetConfig } from '../types';

export class Markdown extends WidgetComponent {
    constructor(
        container: HTMLElement,
        widget: WidgetConfig,
        app: App,
    ) {
        super(container, widget, app);
    }

    /**
     * 渲染Markdown内容
     * 使用Obsidian的MarkdownRenderer进行渲染
     */
    onload(): void {
        this.markdownRender(this.container, this.widget.code);
    }
}