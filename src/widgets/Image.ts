import { WidgetComponent } from "../components/widgetComponent";
// 第三方库导入
import { App, normalizePath } from "obsidian";
// 类型定义导入
import { WidgetConfig } from '../types';

export class Image extends WidgetComponent {
    constructor(
        container: HTMLElement,
        widget: WidgetConfig,
        app: App,
    ) {
        super(container, widget, app);
    }

    /**
     * 获取图片URL
     * @param url 原始URL
     * @returns 处理后的URL
     */
    private getImgUrl(url: string): string {
        url = url.trim();
        if (url.startsWith('http')) {
            return url;
        }
        const normalizedPath = normalizePath(url);
        const resourceUri = this.app.vault.adapter.getResourcePath(normalizedPath);
        return resourceUri;
    }

    onload(): void {
        // 创建图片元素并设置源地址
        this.container.createEl('img', {
            attr: {
                src: this.getImgUrl(this.widget.code),
            }
        });
    }
}