// 类型定义导入
import { WidgetSidebarSettings_2 } from '../types';
import { getLang } from '../local/lang';
/**
 * 插件默认设置
 * @property {string} sidebarStyle - 侧边栏样式，默认为'default'
 * @property {Array} widgets - 小部件配置数组，初始为空
 */
export const default_settings: WidgetSidebarSettings_2 = {
    configVersion: 2,
    global: {
        sidebarStyle: 'card',
    },
    sidebars: {
        default: {
            title: '默认',
            viewType: 'default',
            widgets: [
                {
                    title: getLang('default_widget_header_1_title', '默认标题'),
                    type: 'header_1',
                    style: 'default',
                    code: 'Hello World!'
                },
                {
                    title: getLang('default_widget_digital_clcok_title', '数字时钟'),
                    type: 'digital_clock',
                    style: 'default',
                    code: ''
                },
                {
                    title: getLang('default_widget_week_calendar_title', '周历'),
                    type: 'week_calendar',
                    style: 'default',
                    code: '',
                },
                {
                    title: getLang('default_widget_time_progress_title', '时间进度'),
                    type: 'time_progress',
                    style: 'default',
                    code: ''
                },
                {
                    title: getLang('default_widget_donate_title', '捐赠'),
                    type: 'text',
                    style: 'default',
                    code: getLang('default_widget_donate_content', '如果您喜欢这个插件，请考虑捐赠支持开发者。'),
                },
            ]
        }
    }
}