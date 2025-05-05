// 第三方库导入
import { App, setIcon, setTooltip } from "obsidian";

// 组件基类导入
import { WidgetComponent } from "../components/widgetComponent";

// 类型定义导入
import { WidgetConfig } from '../types';

/**
 * 导航项目的类型定义
 */
interface NavItem {
    description: string;  // 条目描述
    icon: string;        // 条目图标
    link: string;        // 条目链接
    iconType: 'img' | 'icon' | 'emoji';  // 图标类型
}

/**
 * 快速导航组件类
 * @extends WidgetComponent
 */
export class QuickNav extends WidgetComponent {
    constructor(
        container: HTMLElement,
        widget: WidgetConfig,
        app: App,
    ) {
        super(container, widget, app);
    }

    /**
     * 组件加载时的初始化函数
     */
    onload(): void {
        // 解析配置代码获取导航项
        const navItems = this.parseNavItems(this.widget.code);
        // 渲染所有导航项
        navItems.forEach(item => this.createNavItem(this.container, item));
    }

    /**
     * 解析配置代码生成导航项数组
     * @param code 配置代码文本
     * @returns 导航项数组
     */
    private parseNavItems(code: string): NavItem[] {
        return code.split('\n')
            .filter(line => line.trim())
            .map(line => {
                // 使用竖线分割，处理前后空白
                const parts = line.split('|').map(part => part.trim());
                const [description = '', icon = '', link = ''] = parts;
                // 判断图标类型
                const iconType = this.getIconType(icon);
                return { description, icon, link, iconType };
            });
    }

    /**
     * 判断图标类型
     * @param icon 图标文本
     * @returns 图标类型
     */
    private getIconType(icon: string): 'img' | 'icon' | 'emoji' {
        // 检查是否为图片链接或图片文件
        if (icon.match(/^https?:\/\/.+/) || icon.match(/\.\w+$/i)) {
            return 'img';
        }
        // 检查是否为字母数字和连字符的组合
        if (icon.match(/^[a-zA-Z0-9-]+$/)) {
            return 'icon';
        }
        // 其他情况视为emoji
        return 'emoji';
    }

    /**
     * 创建单个导航项
     * @param container 父容器元素
     * @param item 导航项数据
     */
    private createNavItem(container: HTMLElement, item: NavItem) {
        // 创建导航项容器
        const navItem = this.createLink(item.link, '', container, [`dms-sidebar-quick-nav-item`, `dms-sidebar-quick-nav-item-${item.iconType}`]);
        setTooltip(navItem, item.description, {
            placement: 'top',
        });

        if (item.iconType === 'img') {
            // 创建图片元素
            navItem.createEl('img', {
                cls: 'dms-sidebar-quick-nav-icon',
                attr: { src: item.icon }
            })
        } else if (item.iconType === 'icon') {
            // 创建图标元素
            setIcon(navItem, item.icon);
        } else {
            // 创建emoji元素
            navItem.setText(item.icon);
        }
    }
}