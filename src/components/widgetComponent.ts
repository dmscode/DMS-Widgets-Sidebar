// 第三方库导入
import { App, MarkdownRenderer, Component } from "obsidian";
// 类型定义导入
import { WidgetConfig } from '../types';

export class WidgetComponent extends Component {
    app: App;
    container: HTMLElement;
    widget: WidgetConfig;
    constructor(
        container: HTMLElement,
        widget: WidgetConfig,
        app: App,
    ) {
        super();
        this.app = app;
        this.container = container;
        this.widget = widget;

        this.container.empty();
    }
    /**
     * 将 Markdown 内容渲染到指定的 HTML 元素中
     * @param el - 目标 HTML 元素
     * @param content - 需要渲染的 Markdown 内容
     */
    async markdownRender(el: HTMLElement, content: string) {
        // 使用 Obsidian 的 MarkdownRenderer 进行渲染
        await MarkdownRenderer.render(this.app, content, el, '', this);
    }

    /**
     * 创建一个链接元素
     * @param href - 链接地址
     * @param text - 链接文本
     * @param container - 父容器元素
     * @param cls - 额外的 CSS 类名数组
     * @returns 创建的链接元素
     */
    createLink(href: string, text: string, container: HTMLElement, cls: string[] = []) {
        // 创建并返回一个带有指定属性的链接元素
        return container.createEl('a', {
            cls: ['internal-link'].concat(cls).join(' '),
            href,
            text,
            attr: {
                rel: 'noopener',
                target: '_blank',
            }
        });
    }
}

export class ProgressWidgetComponent extends WidgetComponent {
    private progress: number = 0;
    private progressBar: HTMLElement;
    private direction: 'horizontal' | 'vertical' = 'horizontal';
    private align: 'start' | 'end' = 'start';
    constructor(
        container: HTMLElement,
        widget: WidgetConfig,
        app: App,
    ) {
        super(container, widget, app);
        this.container.classList.add('dms-sidebar-progress-widget');
        this.progressBar = this.container.createDiv('dms-sidebar-progress-widget-bar');
    }
    /**
     * 设置进度条的显示方向
     * @param direction - 显示方向，可选值：'horizontal'（水平） 或 'vertical'（垂直）
     * @param align - 对齐方式，可选值：'start'（开始） 或 'end'（结束）
     */
    setDirection(direction: 'horizontal' | 'vertical', align: 'start' | 'end' = 'start') {
        this.direction = direction;
        this.align = align;
        this.progressBar.dataset.direction = direction;
        this.progressBar.dataset.align = align;
        this.progressBar.setAttribute('style', `${this.direction==='horizontal' ? 'width': 'height'}: ${this.progress}%`);
    }
    /**
     * 设置进度条的进度和状态
     * @param progress - 进度值（0-100的数值）
     */
    setProgress(progress: number) {
        this.progress = progress;
        // 设置进度条宽度以显示当前进度
        this.progressBar.setAttribute('style', `${this.direction==='horizontal' ? 'width': 'height'}: ${this.progress}%`);
        // 根据进度值设置对应的状态标识
        this.progressBar.dataset.level = this.getLevel(this.progress);
    }
    /**
     * 获取当前进度状态
     * @param progress - 进度值（0-100的数值）
     * @returns 根据进度返回对应的状态标识
     */
    private getLevel(progress: number) {
        // 完成状态：进度达到100%
        if (progress >= 100) return '100';
        // 接近完成：进度在81-99%之间
        if (progress >= 80) return '80';
        // 进展良好：进度在61-80%之间
        if (progress >= 60) return '60';
        // 完成一半：进度在41-60%之间
        if (progress >= 40) return '40';
        // 开始阶段：进度在21-40%之间
        if (progress >= 20) return '20';
        // 新建状态：进度在0-20%之间
        return '0';
    }
}