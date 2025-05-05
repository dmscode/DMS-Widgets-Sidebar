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
            title: getLang('default_widget_header_1_title'),
            type: 'header_1',
            style: 'default',
            code: 'Hello World!'
        },
        {
            title: getLang('default_widget_digital_clcok_title'),
            type: 'digital_clock',
            style: 'default',
            code: ''
        },
        {
            title: getLang('default_widget_week_calendar_title'),
            type: 'week_calendar',
            style: 'default',
            code: '',
        },
        {
            title: getLang('default_widget_time_progress_title'),
            type: 'time_progress',
            style: 'default',
            code: ''
        },
        {
            title: getLang('default_widget_donate_title'),
            type: 'text',
            style: 'default',
            code: getLang('default_widget_donate_content'),
        },
    ],
}