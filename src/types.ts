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
 * 侧边栏配置接口
 * @interface SidebarConfig
 * @description 定义单个侧边栏的配置结构
 * @property {string} title - 侧边栏标题
 * @property {string} viewType - 侧边栏唯一标识符
 * @property {WidgetConfig[]} widgets - 侧边栏包含的小部件配置数组
 */
export interface SidebarConfig {
    title: string;
    viewType: string;
    widgets: WidgetConfig[];
}

/**
 * 侧边栏设置接口
 * @interface WidgetSidebarSettings
 * @property {string} sidebarStyle - 侧边栏样式
 * @property {WidgetConfig[]} widgets - 小部件配置数组
 */
export interface WidgetSidebarSettings_1 {
    sidebarStyle: string;
    widgets: WidgetConfig[];
}

/**
 * 侧边栏全局配置接口
 * @interface WidgetSidebarGlobal
 * @property {string} sidebarStyle - 侧边栏全局样式配置
 */
export interface WidgetSidebarGlobal {
    sidebarStyle: string;
}
/**
 * 侧边栏配置映射接口
 * @interface WidgetSidebarsConfig
 * @description 用于存储多个侧边栏配置的映射对象，键为侧边栏ID，值为对应的侧边栏配置
 */
export interface WidgetSidebarsConfig  {
    [key: string]: SidebarConfig;
}

/**
 * 侧边栏设置接口（版本2）
 * @interface WidgetSidebarSettings_2
 * @description 定义插件的主要配置结构，包含版本信息、全局设置和多侧边栏配置
 * @property {number} configVersion - 配置版本号
 * @property {Object} global - 全局配置选项
 * @property {string} global.sidebarStyle - 侧边栏全局样式
 * @property {Object.<string, SidebarConfig>} sidebars - 多侧边栏配置映射，key为侧边栏ID
 */
export interface WidgetSidebarSettings_2 {
    configVersion: number;
    global: WidgetSidebarGlobal,
    sidebars: WidgetSidebarsConfig,
}

export type WidgetSidebarSettings = WidgetSidebarSettings_1 | WidgetSidebarSettings_2;

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