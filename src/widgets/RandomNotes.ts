import { App, ItemView, setIcon, setTooltip, TFile } from "obsidian";
import { WidgetConfig } from "../types";
import { getLang } from "../local/lang";

/**
 * 渲染随机笔记列表组件
 * @param this 组件上下文，包含widget配置、视图实例、容器元素和应用实例
 */
/**
 * 渲染随机笔记列表
 * @param container 容器元素
 * @param files 文件列表
 */
function renderNotesList(container: HTMLElement, files: TFile[]) {
    // 清空容器
    container.empty();

    // 随机选择5个文件
    const selectedFiles = [];
    const fileCount = Math.min(5, files.length);
    const usedIndexes = new Set<number>();

    while (selectedFiles.length < fileCount) {
        const randomIndex = Math.floor(Math.random() * files.length);
        if (!usedIndexes.has(randomIndex)) {
            usedIndexes.add(randomIndex);
            selectedFiles.push(files[randomIndex]);
        }
    }

    // 渲染每个文件
    selectedFiles.forEach(file => {
        const itemEl = container.createDiv({ cls: 'dms-sidebar-random-notes-item' });
        setIcon(itemEl, 'file-text');
        // 创建标题
        const titleEl = itemEl.createEl('a', {
            cls: 'internal-link dms-sidebar-random-notes-title',
            href: file.path,
            text: file.basename,
            attr: {
                rel: 'noopener',
                target: '_blank',
            }
        });
        const ctime = window.moment(file.stat.ctime);
        const mtime = window.moment(file.stat.mtime);
        setTooltip(titleEl, `${ctime.format('YYYY-MM-DD HH:mm')} / ${mtime.format('YYYY-MM-DD HH:mm')}`, {
            placement: 'top',
        });
    });
}

export function renderRandomNotes(
    this: {
        widget: WidgetConfig;
        view: ItemView;
        container: HTMLElement;
        app: App;
    }) {
    // 创建标题行
    const headerEl = this.container.createEl('div', { cls: 'dms-sidebar-random-notes-header' });
    
    // 添加标题
    headerEl.createEl('h3', { text: getLang('random_notes_title') });
    
    // 添加刷新按钮
    const refreshButton = headerEl.createEl('a', { cls: 'dms-sidebar-random-notes-refresh' });
    setIcon(refreshButton, 'refresh-cw');
    setTooltip(refreshButton, getLang('random_notes_refresh_tooltip'), { placement: 'top' });
    
    // 创建内容容器
    const contentEl = this.container.createDiv({ cls: 'dms-sidebar-random-notes-content' });
    
    // 获取排除列表
    const excludeList = this.widget.code ? this.widget.code.split('\n').filter(line => line.trim() !== '') : [];

    // 获取所有 md 文件
    const files = this.app.vault.getFiles()
        .filter(file => {
            // 只保留 md 文件
            if (file.extension !== 'md') return false;
            // 检查是否在排除列表中
            return !excludeList.some(exclude => file.path.startsWith(exclude));
        });

    // 渲染笔记列表
    renderNotesList(contentEl, files);

    // 添加刷新按钮点击事件
    refreshButton.addEventListener('click', () => {
        renderNotesList(contentEl, files);
    });
}