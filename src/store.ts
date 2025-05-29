// 本地配置导入
import { default_settings } from './settings/defaultSettings';  // 默认设置
// 类型定义导入
import { voidFunc, WidgetSidebarGlobal, WidgetSidebarsConfig } from './types';
import { Timer } from './types';
/**
 * 通用状态存储类，支持任意类型的状态管理
 */
class Store<T> {
    // 单例实例映射，用于存储不同类型的状态实例
    private static instances = new Map<string, Store<any>>();
    // 存储所有监听器的映射，支持特定字段的订阅
    private listeners: Map<string, Set<voidFunc>> = new Map();
    // 状态对象
    private state: T;
    // 初始状态
    private initialState: T;
    // 是否允许重置
    private canReset: boolean;

    /**
     * 私有构造函数，初始化状态
     */
    private constructor(initialState: T, canReset: boolean = false) {
        this.state = initialState;
        this.initialState = { ...initialState };
        this.canReset = canReset;
    }

    /**
     * 获取指定类型的 Store 实例
     * @param key - 状态类型的唯一标识符
     * @param initialState - 可选的初始状态
     */
    public static getInstance<S>(key: string, initialState?: S, canReset?: boolean): Store<S> {
        if (!Store.instances.has(key) && initialState) {
            Store.instances.set(key, new Store<S>(initialState, canReset));
        }
        return Store.instances.get(key) as Store<S>;
    }

    /**
     * 获取当前状态
     */
    public getState(): T {
        return { ...this.state }; // 返回浅拷贝，避免外部直接修改内部状态
    }

    /**
     * 更新状态并通知相关监听器
     * @param partialState - 部分状态更新
     */
    public async updateState(partialState: Partial<T>): Promise<void> {
        const newState = { ...this.state, ...partialState };
        // 移出其中值为的 undefined 属性
        Object.keys(partialState).forEach(key => {
            if (partialState[key as keyof T] === undefined) {
                delete newState[key as keyof T];
            }
        });
        // 更新状态
        this.state = newState;

        // 通知相关监听器
        await this.notifyListeners(partialState);
    }

    /**
     * 订阅特定字段的状态变更
     * @param path - 状态字段路径，空字符串表示订阅所有变更
     * @param listener - 监听器回调函数
     */
    public subscribe(path: string, listener: voidFunc): voidFunc {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }
        this.listeners.get(path)!.add(listener);

        return () => {
            const listeners = this.listeners.get(path);
            if (listeners) {
                listeners.delete(listener);
                if (listeners.size === 0) {
                    this.listeners.delete(path);
                }
            }
        };
    }

    /**
     * 通知监听器状态已更新
     */
    private async notifyListeners(partialState: Partial<T>): Promise<void> {
        const paths = Object.keys(partialState);
        const notifiedListeners = new Set<voidFunc>();
        // 触发特定字段的监听器
        for (const path of paths) {
            const listeners = this.listeners.get(path);
            if (listeners) {
                for (const listener of listeners) {
                    if (!notifiedListeners.has(listener)) {
                        await listener();
                        notifiedListeners.add(listener);
                    }
                }
            }
        }

        // 触发全局监听器
        const globalListeners = this.listeners.get('');
        if (globalListeners) {
            for (const listener of globalListeners) {
                if (!notifiedListeners.has(listener)) {
                    await listener();
                    notifiedListeners.add(listener);
                }
            }
        }
    }

    /**
     * 清除所有已注册的监听器
     */
    public clearAllSubscriptions(): void {
        this.listeners.clear();
    }

    /**
     * 重置状态到初始值并清除所有订阅
     * @throws {Error} 如果实例不允许重置则抛出错误
     */
    public reset(): void {
        if (!this.canReset) {
            throw new Error('此Store实例不允许重置');
        }
        this.state = { ...this.initialState };
        this.clearAllSubscriptions();
    }
}

// 导出默认的设置存储实例
export const globalStore = Store.getInstance<WidgetSidebarGlobal>('global', default_settings.global);
export const sidebarsStore = Store.getInstance<WidgetSidebarsConfig>('sidebars', default_settings.sidebars);
export const timerStore = Store.getInstance<Timer>('timer', {}, true);