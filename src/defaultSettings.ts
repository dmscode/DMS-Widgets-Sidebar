// 类型定义导入
import { WidgetSidebarSettings } from './types';
import { getLang } from './local/lang';
/**
 * 插件默认设置
 * @property {string} sidebarStyle - 侧边栏样式，默认为'default'
 * @property {Array} widgets - 小部件配置数组，初始为空
 */
export const default_settings: WidgetSidebarSettings = {
    sidebarStyle: 'card',
    widgets: [
        {
            title: getLang('default_widget_1_title'),
            type: 'header_1',
            code: 'Hello World!'
        },
        {
            title: getLang('default_widget_2_title'),
            type: 'digital_clock',
            code: ''
        },
        {
            title: getLang('default_widget_3_title'),
            type: 'time_progress',
            code: ''
        },
        {
            title: getLang('default_widget_0_title'),
            type: 'text',
            code: getLang('default_widget_0_content'),
        },
    ],
}