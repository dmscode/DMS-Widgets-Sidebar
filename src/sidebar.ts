// 核心依赖
import { App, ItemView, WorkspaceLeaf, MarkdownRenderer } from 'obsidian';
import { moment } from "obsidian";

// 本地化与状态管理
import { getLang } from './local/lang';
import { store } from './store';
import { timer } from './store';

// 组件
import { Widget } from './widgets/widgets';
import { Timer } from './types';

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
        store.subscribe('', () => {
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
        this.registerTimer();
        this.refreshView();
    }
    /**
     * 注册计时器
     * 用于每秒更新时间状态，并在每分钟开始时更新分钟状态
     */
    registerTimer() {
        // 清除已存在的计时器
        this.unregisterTimer();
        
        // 首先进行一次初始化
        const initialTime = moment();
        const initialData: Timer = {
            second: initialTime.second(),
            minute: initialTime.minute(),
            moment: initialTime
        };
        timer.updateState(initialData);
        // 创建新的计时器并获取其ID
        const id = this.registerInterval(window.setInterval(() => {
            // 获取当前时间
            const time = moment();
            const second = time.second();
            
            // 构建计时器数据，只包含必要的更新
            const data: Partial<Timer> = {
                second: second,
                moment: time,
                ...(second === 0 ? { minute: time.minute() } : {})
            } as Timer;
            
            // 更新计时器状态
            timer.updateState(data);
        }, 1000));
        // 保存计时器ID
        timer.updateState({id});
    }

    /**
     * 注销计时器
     * 如果存在计时器ID，则重置计时器状态
     */
    unregisterTimer() {
        if(timer.getState().id) {
            timer.reset();
        }
    }
    // 刷新视图的具体实现
    async refreshView() {
        // 获取当前设置
        const settings = store.getState();
        // 获取容器元素尺寸
        this.onResize();
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
        this.unregisterTimer();
    }
    async onResize() {
        this.containerEl.children[1].setAttr('style',`--dms-sidebar-width: ${this.containerEl.children[1].clientWidth + 'px'}`)
    }
}