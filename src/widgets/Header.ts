import { WidgetComponent } from "../components/widgetComponent";
// 第三方库导入
import { App } from "obsidian";
// 类型定义导入
import { WidgetConfig } from '../types';

export class Header extends WidgetComponent {
    constructor(
        container: HTMLElement,
        widget: WidgetConfig,
        app: App,
    ) {
        super(container, widget, app);
    }
    onload(): void {
        // 从widget类型中提取标题级别，默认为3级标题
        const headerLevel = this.widget.type.match(/(\d)$/)?.[1] || '3';
        // 创建对应级别的标题元素，设置文本内容和样式类
        this.container.createEl(`h${headerLevel}` as keyof HTMLElementTagNameMap, { 
            text: this.widget.code,
            cls: `dms-widget-header dms-widget-header-${headerLevel}`
        });
    }
}