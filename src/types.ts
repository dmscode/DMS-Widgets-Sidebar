import { moment } from "obsidian";
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
    style: string;
}

/**
 * 侧边栏设置接口
 * @interface WidgetSidebarSettings
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
 * 空函数类型定义
 * @returns {void} 无返回值
 */
export type voidFunc = () => void;

/**
 * 计时器接口定义
 * @interface Timer
 * @property {number} [id] - 计时器ID
 * @property {string|number} [second] - 秒数
 * @property {string|number} [minute] - 分钟数
 * @property {string|number} [hour] - 小时数
 * @property {string|number} [day] - 天数
 * @property {moment.Moment} [moment] - moment时间对象
 */
export interface Timer {
    id?: number;
    second?: string | number;
    minute?: string | number;
    hour?: string | number;
    day?: string | number;
    moment?: moment.Moment;
}

/**
 * 进度配置接口
 * @interface progressConfg
 * @property {string} [title] - 进度标题 (可选)
 * @property {number} progress - 进度值
 * @property {string} [precent] - 进度百分比 (可选)
 * @property {string[]} [cls] - 进度条样式类名数组 (可选)
 */
export interface progressConfg {
    title?: string;
    progress: number;
    precent?: string;
    cls?: string[];
}