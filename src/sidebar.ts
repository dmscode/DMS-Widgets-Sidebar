// 核心依赖
import { App, ItemView, WorkspaceLeaf, MarkdownRenderer } from 'obsidian';

// 本地化与状态管理
import { getLang } from './local/lang';
import { store } from './store';

// 组件
import { Widget } from './widgets/widgets';

// 定义侧边栏视图的唯一标识符
export const WidgetSidebarView = 'Widget-Sidebar-view';

/**
 * 小部件侧边栏视图类
 * 继承自 Obsidian 的 ItemView 类
 */
export class SidebarView extends ItemView {
    app: App;
    constructor(leaf: WorkspaceLeaf, app:App) {
        super(leaf);
        this.app = app;
        // 订阅 store 的变更，当数据更新时刷新视图
        store.subscribe(() => {
            this.refreshView();
        });
    }

    // 返回视图类型标识符
    getViewType() {
        return WidgetSidebarView;
    }

    // 返回视图显示的标题文本
    getDisplayText() {
        return getLang('view_title');
    }

    // 返回视图的图标名称
    getIcon() {
        return 'notebook-tabs';
    }

    // 视图打开时的处理函数
    async onOpen() {
        this.refreshView();
    }

    // 刷新视图的具体实现
    async refreshView() {
        // 获取当前设置
        const settings = store.getSettings();
        const container = this.containerEl.children[1];
        // 清空容器内容
        container.empty();
        // 添加侧边栏样式类
        container.classList.add('dms-widget-sidebar');
        // 设置侧边栏样式属性
        container.setAttr('data-widget-sidebar-style', settings.sidebarStyle);
        // 遍历并创建所有小部件
        settings.widgets.forEach(async (widget, index) => {
            const widgetContainer = container.createDiv({ cls: 'dms-widget-container', attr: { 
                'data-widget-type': widget.type,
                'data-widget-index': index.toString(),
            } });
            new Widget(widgetContainer, widget, this);
        });
    }

    async onClose() {
        // 无需清理。
    }
}