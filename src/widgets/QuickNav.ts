// 第三方库导入
import { App, ItemView, setIcon, setTooltip, WorkspaceLeaf } from "obsidian";

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
 * 渲染快速导航挂件
 * @description 解析配置代码并创建导航项目列表
 */
export function renderQuickNav(this: { container: HTMLElement, widget: WidgetConfig, app: App }) {
    // 解析配置代码获取导航项
    const navItems = parseNavItems(this.widget.code);
    // 渲染所有导航项
    navItems.forEach(item => createNavItem.call(this, this.container, item));
}

/**
 * 解析配置代码生成导航项数组
 * @param code 配置代码文本
 * @returns 导航项数组
 */
function parseNavItems(code: string): NavItem[] {
    return code.split('\n')
        .filter(line => line.trim())
        .map(line => {
            // 使用竖线分割，处理前后空白
            const parts = line.split('|').map(part => part.trim());
            const [description = '', icon = '', link = ''] = parts;
            // 判断图标类型
            const iconType = getIconType(icon);
            return { description, icon, link, iconType };
        });
}

/**
 * 判断图标类型
 * @param icon 图标文本
 * @returns 图标类型
 */
function getIconType(icon: string): 'img' | 'icon' | 'emoji' {
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
function createNavItem(container: HTMLElement, item: NavItem) {
    // 创建导航项容器
    const navItem = container.createEl('a', {
        cls: `dms-sidebar-quick-nav-item dms-sidebar-quick-nav-item-${item.iconType}`,
        attr: {
            dataHref: item.link,
        }
    });
    setTooltip(navItem, item.description, {
        placement: 'top',
    });
    // 添加点击事件监听器
    navItem.addEventListener('click', (event) => {
        event.preventDefault();
        
        // 判断是否为外部链接
        const isExternalLink = /^(https?|obsidian):\/\//i.test(item.link);
        
        if (isExternalLink) {
            // 外部链接：在新标签页中打开
            window.open(item.link, '_blank', 'noopener');
        } else {
            // 内部链接：使用 Obsidian API 在新标签页中打开
            const leaf = this.app.workspace.getLeaf('tab');
            leaf.openFile(this.app.vault.getAbstractFileByPath(item.link));
        }
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