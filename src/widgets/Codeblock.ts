import { WidgetComponent } from "../components/widgetComponent";
// 第三方库导入
import { App } from "obsidian";
// 类型定义导入
import { WidgetConfig } from '../types';

export class Codeblock extends WidgetComponent {
    constructor(
        container: HTMLElement,
        widget: WidgetConfig,
        app: App,
    ) {
        super(container, widget, app);
    }
    onload(): void {
        const codeblock = '```'+this.widget.type+'\n'+this.widget.code+'\n```';
        this.markdownRender(this.container, codeblock)
    }
}