/**
 * 全局类型定义
 * 包含小部件和侧边栏相关的接口及类型定义
 */

/**
 * 小部件配置接口
 * @interface WidgetConfig
 * @property {string} title - 小部件标题
 * @property {string} type - 小部件类型
 * @property {string} code - 小部件代码内容
 */
export interface WidgetConfig {
    title: string;
    type: string;
    code: string;
}

/**
 * 侧边栏设置接口
 * @interface WidgetSidebarSettings
 * @property {string} sidebarStyle - 侧边栏样式
 * @property {WidgetConfig[]} widgets - 小部件配置数组
 */
export interface WidgetSidebarSettings {
    sidebarStyle: string;
    widgets: WidgetConfig[];
}

/**
 * 设置回调函数类型
 * @param {WidgetConfig} widget - 小部件配置对象
 * @returns {void}
 */
export type setbackType = (widget: WidgetConfig) => void;

/**
 * 监听器类型
 * 用于定义无参数无返回值的回调函数
 */
export type Listener = () => void;