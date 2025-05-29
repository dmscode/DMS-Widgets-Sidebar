// 核心依赖
import { App, ItemView, WorkspaceLeaf, Component } from 'obsidian';

// 本地化与状态管理
import { getLang } from './local/lang';
import { globalStore, sidebarsStore, timerStore } from './store';

// 组件
import { getWidgetComponent } from './widgets/widgets';
import { SidebarConfig, WidgetSidebarGlobal } from './types';

/**
 * 生成 DMS Widgets Sidebar 的标准化视图类型字符串。
 *
 * @param viewType - 要附加到侧边栏标识符的具体视图类型。
 * @returns 格式为 `DMS-Widgets-Sidebar-View-{viewType}` 的字符串。
 */
export const getSidebarViewType = (viewType: string): string => `DMS-Widgets-Sidebar-View-${viewType}`;

/**
 * 小部件侧边栏视图类
 * 继承自 Obsidian 的 ItemView 类
 */
export class SidebarView extends ItemView {
    private container: Element;
    private widgets: Component[] = [];
    private viewType: string;
    private sidebarConfig: SidebarConfig;
    private globalConfig: WidgetSidebarGlobal;

    constructor(leaf: WorkspaceLeaf, viewType: string) {
        super(leaf);
        this.container = this.containerEl.children[1];
        this.viewType = viewType;
        // 订阅 store 的变更，当数据更新时刷新视图
        globalStore.subscribe('', () => {
            this.refreshView();
        });
        sidebarsStore.subscribe(viewType, () => {
            this.refreshView();
        })
        this.sidebarConfig = sidebarsStore.getState()[this.viewType];
        this.globalConfig = globalStore.getState();
    }

    // ItemView 接口实现
    getViewType(): string {
        return getSidebarViewType(this.viewType);
    }

    getDisplayText(): string {
        return this.sidebarConfig.title;
    }

    getIcon(): string {
        return 'notebook-tabs';
    }

    // 生命周期方法
    async onOpen(): Promise<void> {
        await this.refreshView();
        this.container.addEventListener('click', this.linkClickHandler.bind(this));
    }

    async onClose(): Promise<void> {
        this.container.removeEventListener('click', this.linkClickHandler.bind(this));
        this.unloadWidgets();
    }

    onResize(): void {
        this.container.setAttr('style',`--dms-sidebar-width: ${this.container.clientWidth + 'px'}`)
    }

    // 小部件管理
    private async refreshView(): Promise<void> {
        this.unloadWidgets();
        // 获取当前设置
        this.sidebarConfig = sidebarsStore.getState()[this.viewType];
        this.globalConfig = globalStore.getState();
        // 如果设置为空，则卸载视图
        if(!this.sidebarConfig) {
            this.unload();
            return;
        }
        // 清空容器内容
        this.container.empty();
        // 添加侧边栏样式类
        this.container.classList.add('dms-widget-sidebar');
        // 设置侧边栏样式属性
        this.container.setAttr('data-widget-sidebar-style', this.globalConfig.sidebarStyle);
        // 设置侧边栏视图类型属性
        this.container.setAttr('data-widget-sidebar-view-type', this.sidebarConfig.viewType);
        // 获取容器元素尺寸
        this.onResize();
        // 遍历并创建所有小部件
        for (const [index, widget] of this.sidebarConfig.widgets.entries()) {
            const widgetContainer = this.container.createDiv({ cls: 'dms-widget-container', attr: {
                'data-widget-style': (!widget.style || widget.style==='default') ? this.globalConfig.sidebarStyle : widget.style,
                'data-widget-type': widget.type,
                'data-widget-index': index.toString(),
            } });
            const render = getWidgetComponent(widgetContainer, widget, this.app);
            this.widgets.push(render);
            render.load();
        }
    }

    private unloadWidgets(): void {
        this.widgets.forEach(widget => widget.unload());
        this.widgets = [];
    }

    // 事件处理
    private linkClickHandler(e: MouseEvent): void {
        // 检查点击目标是否为内部链接的锚标签
        if(e.target instanceof HTMLElement && e.target.tagName === 'A' && e.target.classList.contains('internal-link')) {
            // 阻止默认的链接跳转行为
            e.preventDefault();
            // 获取链接地址
            const href = e.target.getAttribute('href');
            if(href) {
                // 使用正则表达式检查是否为外部链接
                const isExternalLink = /^(\w+):\/\//i.test(href);
                if (isExternalLink) {
                    // 外部链接：使用浏览器在新标签页中打开
                    window.open(href, '_blank', 'noopener');
                } else {
                    // 内部链接：使用 Obsidian API 打开
                    this.app.workspace.openLinkText(href, '');
                }
            }
        }
    }
}