// 核心依赖导入
import {
    App,
    Editor,
    MarkdownView,
    Modal,
    Notice,
    Plugin,
    PluginSettingTab,
    Setting,
    WorkspaceLeaf
} from 'obsidian';

// 插件设置相关导入
import { DEFAULT_SETTINGS, WidgetSidebarSettingTab } from './settings';
import { WidgetSidebarSettings } from './types';

// 视图组件导入
import { SidebarView, WidgetSidebarView } from './sidebar';

// 工具类导入
import { getLang } from './local/lang';
import { store } from './store';

/**
 * 小部件侧边栏插件的主类
 * 提供侧边栏视图的创建、管理和设置功能
 */
export default class WidgetSidebar extends Plugin {
    settings: WidgetSidebarSettings;

    /**
     * 插件加载时的初始化函数
     */
    async onload() {
        // 加载插件设置
        await this.loadSettings();
        // 注册侧边栏视图
        this.registerView(
            WidgetSidebarView,
            (leaf) => new SidebarView(leaf, this.app)
        );
        // 添加功能区图标，点击时激活侧边栏视图
        this.addRibbonIcon('notebook-tabs', getLang('ribbon_button_title'), () => {
            this.activateView();
        });
        // 添加设置选项卡，以便用户可以配置插件的各个方面
        this.addSettingTab(new WidgetSidebarSettingTab(this.app, this));
    }

    /**
     * 插件卸载时的清理函数
     */
    onunload() {
    }

    /**
     * 激活侧边栏视图的函数
     */
    async activateView() {
        const { workspace } = this.app;
        let leaf: WorkspaceLeaf | null = null;
        const leaves = workspace.getLeavesOfType(WidgetSidebarView);

        // 检查是否已存在视图
        if (leaves.length > 0) {
            leaf = leaves[0];
        } else {
            // 在右侧边栏创建新视图
            leaf = workspace.getRightLeaf(false);
            if (!leaf) {
                new Notice(getLang('cannot_create_leaf'));
                return;
            }
            await leaf.setViewState({ type: WidgetSidebarView, active: true });
        }

        // 确保视图可见
        workspace.revealLeaf(leaf);
    }

    /**
     * 加载插件设置
     */
    async loadSettings() {
        // 合并默认设置和已保存的设置
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        store.updateSettings(this.settings);
    }

    /**
     * 保存插件设置
     */
    async saveSettings() {
        // 保存设置并更新store
        await this.saveData(this.settings);
        store.updateSettings(this.settings);
    }
}