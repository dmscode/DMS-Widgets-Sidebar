import { WidgetComponent } from "../components/widgetComponent";
import { App, setIcon, setTooltip, TFile } from "obsidian";
import { WidgetConfig } from "../types";
import { getLang } from "../local/lang";

/**
 * 随机笔记挂件类
 * @extends WidgetComponent
 */
export class RandomNotes extends WidgetComponent {
    private contentEl: HTMLElement;
    private files: TFile[];

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
        // 创建标题行
        const headerEl = this.container.createEl('div', { cls: 'dms-sidebar-random-notes-header' });

        // 添加标题
        headerEl.createEl('h3', { text: getLang('random_notes_title', '随机笔记') });

        // 添加刷新按钮
        const refreshButton = headerEl.createEl('a', { cls: 'dms-sidebar-random-notes-refresh' });
        setIcon(refreshButton, 'refresh-cw');
        setTooltip(refreshButton, getLang('random_notes_refresh_tooltip', '刷新'), { placement: 'top' });

        // 创建内容容器
        this.contentEl = this.container.createDiv({ cls: 'dms-sidebar-random-notes-content' });

        // 获取排除列表
        const excludeList = this.widget.code ? this.widget.code.split('\n').filter(line => line.trim() !== '') : [];

        // 获取所有 md 文件
        this.files = this.app.vault.getFiles()
            .filter(file => {
                // 只保留 md 文件
                if (file.extension !== 'md') return false;
                // 检查是否在排除列表中
                return !excludeList.some(exclude => file.path.startsWith(exclude));
            });

        // 渲染笔记列表
        this.renderNotesList();

        // 添加刷新按钮点击事件
        refreshButton.addEventListener('click', () => {
            this.renderNotesList();
        });
    }

    /**
     * 渲染随机笔记列表
     */
    private renderNotesList() {
        // 清空容器
        this.contentEl.empty();

        // 随机选择5个文件
        const selectedFiles = [];
        const fileCount = Math.min(5, this.files.length);
        const usedIndexes = new Set<number>();

        while (selectedFiles.length < fileCount) {
            const randomIndex = Math.floor(Math.random() * this.files.length);
            if (!usedIndexes.has(randomIndex)) {
                usedIndexes.add(randomIndex);
                selectedFiles.push(this.files[randomIndex]);
            }
        }

        // 渲染每个文件
        selectedFiles.forEach(file => {
            const itemEl = this.contentEl.createDiv({ cls: 'dms-sidebar-random-notes-item' });
            setIcon(itemEl, 'file-text');
            // 创建标题
            const titleEl = this.createLink(file.path, file.basename, itemEl, ['dms-sidebar-random-notes-title']);
            const ctime = window.moment(file.stat.ctime);
            const mtime = window.moment(file.stat.mtime);
            setTooltip(titleEl, `${ctime.format('YYYY-MM-DD HH:mm')} / ${mtime.format('YYYY-MM-DD HH:mm')}`, {
                placement: 'top',
            });
        });
    }
}