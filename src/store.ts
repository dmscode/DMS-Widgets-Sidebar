// 本地配置导入
import { DEFAULT_SETTINGS } from './settings';
// 类型定义导入
import { Listener, WidgetSidebarSettings } from './types';

/**
 * 单例模式的设置存储类，用于管理插件设置和监听器
 */
class Store {
    // 单例实例
    private static instance: Store;
    // 存储所有监听器的集合
    private listeners: Set<Listener> = new Set();
    // 插件设置对象
    private settings: WidgetSidebarSettings;

    /**
     * 私有构造函数，初始化设置
     */
    private constructor(settings: WidgetSidebarSettings) {
        this.settings = settings;
    }

    /**
     * 获取 Store 实例的静态方法
     * @param settings - 可选的初始设置
     */
    public static getInstance(settings?: WidgetSidebarSettings): Store {
        // 如果实例不存在且提供了设置，则创建新实例
        if (!Store.instance && settings) {
            Store.instance = new Store(settings);
        }
        return Store.instance;
    }

    /**
     * 获取当前设置
     */
    public getSettings(): WidgetSidebarSettings {
        return this.settings;
    }

    /**
     * 更新设置并通知所有监听器
     */
    public async updateSettings(settings: WidgetSidebarSettings): Promise<void> {
        // 更新设置值
        this.settings = settings;
        // 触发所有监听器的回调
        this.notifyListeners();
    }

    /**
     * 添加设置变更监听器
     * @returns 返回用于取消监听的函数
     */
    public subscribe(listener: Listener): () => void {
        // 添加监听器到集合
        this.listeners.add(listener);
        // 返回取消订阅的函数
        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * 通知所有监听器设置已更新
     */
    private notifyListeners(): void {
        // 遍历并执行所有监听器
        this.listeners.forEach(listener => listener());
    }
}

// 导出默认实例
export const store = Store.getInstance(DEFAULT_SETTINGS);