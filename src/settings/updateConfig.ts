import { WidgetSidebarSettings, WidgetSidebarSettings_2 } from "../types";
import { getLang } from "../local/lang";

/**
 * 更新配置对象，将旧版本配置格式转换为新版本
 * @param config 配置对象
 * @returns 更新后的配置对象
 */
export const updateConfig = (config: WidgetSidebarSettings):WidgetSidebarSettings_2 => {
    // 检查是否为旧版本配置（通过判断是否存在 widgets 属性）
    if ('widgets' in config) {
        // 复制现有的 widgets 数组
        const widgets = [...config.widgets];
        // 更新配置结构：设置版本号并将 widgets 移动到默认侧边栏中
        Object.assign(config, {
            configVersion: 2,
            sidebars: {
                default: {
                    title: getLang('default_view_title', '默认视图'),
                    viewType: 'default',
                    widgets,
                }
            }
        });
        // 删除原有的 widgets 属性
        delete (config as { widgets?: any[] }).widgets;
    }
    if('sidebarStyle' in config) {
        Object.assign(config, {
            global: {
                sidebarStyle: config.sidebarStyle
            }
        })
        delete (config as { sidebarStyle?: string }).sidebarStyle;
    }
    return config as WidgetSidebarSettings_2;
}