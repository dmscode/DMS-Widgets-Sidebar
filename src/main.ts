// 核心依赖导入
import {
    Notice,
    Plugin,
    WorkspaceLeaf,
    moment,
} from 'obsidian';
import { default_settings } from './settings/defaultSettings';  // 默认设置

// 插件设置相关导入
import { updateConfig } from './settings/updateConfig';
import { WidgetSidebarSettingTab } from './settings';
import { WidgetSidebarSettings, WidgetSidebarSettings_2, WidgetSidebarGlobal, WidgetSidebarsConfig, Timer, voidFunc } from './types';

// 视图组件导入
import { getSidebarViewType, SidebarView } from './sidebar';

// 工具类导入
import { getLang } from './local/lang';
import { globalStore, sidebarsStore, timerStore } from './store';

/**
 * 小部件侧边栏插件的主类
 * 提供侧边栏视图的创建、管理和设置功能
 */
export default class WidgetSidebar extends Plugin {
    private sidebarViewList: {
        [key: string]: {
            title: string,  // 侧边栏标题
            commandID: string,  // 命令ID
        }
    } = {};
    private listeners: voidFunc[] = [];
    /**
     * 插件加载时的初始化函数
     */
    async onload() {
        // 注册计时器
        this.registerTimer();
        // 优先加载核心设置
        await this.loadSettings();
        // 将非核心功能延迟到界面准备就绪后加载
        this.app.workspace.onLayoutReady(() => {
            // 刷新侧边栏视图
            this.refreshSidebars();
            // 订阅 sidebarsStore，当其状态变化时刷新侧边栏视图
            this.listeners.push(
                sidebarsStore.subscribe('', () => {
                    this.refreshSidebars();
                })
            );
            // 添加功能区图标（激活默认侧边栏）
            this.addRibbonIcon('notebook-tabs', getLang('ribbon_button_title', '打开默认挂件侧边栏'), () => {
                this.activateView('default');
            });
            // 添加设置选项卡
            this.addSettingTab(new WidgetSidebarSettingTab(this.app, this));
        });
    }

    /**
     * 插件卸载时的清理函数
     */
    onunload() {
        this.unregisterTimer();
        this.listeners.forEach(v => v());
    }

    /**
     * 激活侧边栏视图的函数
     */
    async activateView(key:string) {
        const { workspace } = this.app;
        let leaf: WorkspaceLeaf | null = null;
        const leaves = workspace.getLeavesOfType(getSidebarViewType(key));

        // 检查是否已存在视图
        if (leaves.length > 0) {
            leaf = leaves[0];
        } else {
            // 在右侧边栏创建新视图
            leaf = workspace.getRightLeaf(false);
            if (!leaf) {
                new Notice(getLang('cannot_create_leaf', '无法创建新的侧边栏视图'));
                return;
            }
            await leaf.setViewState({ type: getSidebarViewType(key), active: true });
        }

        // 确保视图可见
        workspace.revealLeaf(leaf);
    }
    private refreshSidebars() {
        // 刷新所有侧边栏视图
        const sidebars = sidebarsStore.getState();
        // 先卸载所有不存在的侧边栏视图
        for (const key in this.sidebarViewList) {
            if (!sidebars[key]) {
                // 如果侧边栏配置不存在，则卸载视图
                this.app.workspace.detachLeavesOfType(getSidebarViewType(key));
                // 移除命令
                this.removeCommand(this.sidebarViewList[key].commandID);
                // 从列表中删除
                delete this.sidebarViewList[key];
            }
        }
        // 重新注册所有标题发生变化的侧面了命令。
        for (const key in this.sidebarViewList) {
            const sidebar = sidebars[key];
            if (sidebar && sidebar.title !== this.sidebarViewList[key].title) {
                // 如果侧边栏标题发生变化，则更新命令名称
                const commandID = this.sidebarViewList[key].commandID;
                this.removeCommand(commandID);
                this.addCommand({
                    id: commandID,
                    name: getLang('command_active_sidebar', '激活侧边栏') + `: ${sidebar.title}`,
                    callback: () => {
                        this.activateView(key);
                    },
                });
                this.sidebarViewList[key].title = sidebar.title;
            }
        }
        // 然后注册列表中不存在的视图。
        for (const key in sidebars) {
            if (!this.sidebarViewList[key]) {
                // 如果侧边栏配置存在，但视图未注册，则注册视图
                this.registerView(
                    getSidebarViewType(key),
                    (leaf) => new SidebarView(leaf, key)
                );
                // 注册命令
                const commandID = `dms-widget-sidebar-${key}`;
                this.addCommand({
                    id: commandID,
                    name: getLang('command_active_sidebar', '激活侧边栏') + `: ${sidebars[key].title}`,
                    callback: () => {
                        this.activateView(key);
                    },
                });
                // 添加到列表
                this.sidebarViewList[key] = {
                    title: sidebars[key].title,
                    commandID: commandID,
                };
            }
        }
    }
    /**
     * 加载插件设置
     */
    private async loadSettings() {
        let config:WidgetSidebarSettings = await this.loadData();
        if(config && 'widgets' in config){
            // 兼容旧版本配置
            config = updateConfig(config);
        }
        // 合并默认设置和已保存的设置
        const settings = Object.assign({}, default_settings, config);
        globalStore.updateState(settings.global);
        sidebarsStore.updateState(settings.sidebars);
    }

    // 计时器管理
    private registerTimer(): void {
        // 清除已存在的计时器
        this.unregisterTimer();

        // 首先进行一次初始化
        const initialTime = moment();
        const initialData: Timer = {
            second: initialTime.second(),
            minute: initialTime.minute(),
            hour: initialTime.hour(),
            day: initialTime.date(),
            moment: initialTime,  // 使用 clone() 确保 moment 对象不会被修改
        };
        timerStore.updateState(initialData);

        // 创建新的计时器并获取其ID
        const id = this.registerInterval(window.setInterval(() => {
            // 获取当前时间
            const time = moment();
            const second = time.second();
            const minute = time.minute();
            const hour = time.hour();
            // 检查是否已经进入过睡眠模式
            const lastMoment = timerStore.getState().moment?.clone();
            const isSlept = lastMoment && time.diff(lastMoment) > 2000

            // 构建计时器数据，只包含必要的更新
            const data: Partial<Timer> = {
                second: second,
                moment: time,
                ...(isSlept || second === 0 ? { minute } : {}),
                ...(isSlept || (second === 0 && minute === 0) ? { hour } : {}),
                ...(isSlept || (second === 0 && minute === 0 && hour === 0) ? { day: time.date() } : {})
            } as Timer;
            // 更新计时器状态
            timerStore.updateState(data);
        }, 1000));

        // 保存计时器ID
        timerStore.updateState({id});
    }

    private unregisterTimer(): void {
        if(timerStore.getState().id) {
            timerStore.reset();
        }
    }
}