import { WidgetComponent } from "../components/widgetComponent";
// 第三方库导入
import { App, TFile } from "obsidian";
// 类型定义导入
import { WidgetConfig } from '../types';

/**
 * 文件类型统计项目的类型定义
 */
interface FileStatItem {
    type: string;      // 文件类型
    icon: string;      // 类型图标
    count: number;     // 文件数量
    description: string; // 类型描述
}

/**
 * 文件统计挂件类
 * @extends WidgetComponent
 */
export class FileStats extends WidgetComponent {
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
        // 获取所有文件
        const files = this.app.vault.getFiles();
        // 获取排除规则
        const excludePatterns = this.widget.code.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        // 过滤掉被排除的文件
        const filteredFiles = files.filter(file => {
            const filePath = file.path;
            return !excludePatterns.some(pattern => filePath.startsWith(pattern));
        });
        // 统计不同类型的文件
        const stats = this.getFileStats(filteredFiles).filter(item => item.count > 0);
        // 按数量从多到少排序
        stats.sort((a, b) => b.count - a.count);
        // 渲染统计结果
        stats.forEach(item => this.createStatItem(item));
    }

    /**
     * 获取文件统计信息
     * @param files 文件列表
     * @returns 文件统计项目数组
     */
    private getFileStats(files: TFile[]): FileStatItem[] {
        // 初始化统计项
        const stats: FileStatItem[] = [
            {
                type: 'total',
                icon: '📊',
                count: files.length,
                description: 'Total'
            },
            {
                type: 'markdown',
                icon: '📝',
                count: files.filter(file => file.extension === 'md').length,
                description: 'Note'
            },
            {
                type: 'image',
                icon: '🖼️',
                count: files.filter(file => [
                    'png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg'
                ].includes(file.extension)).length,
                description: 'Image'
            },
            {
                type: 'code',
                icon: '👨‍💻',
                count: files.filter(file => [
                    'js', 'css', 'json', 'yaml', 'yml', 'ts', 'html'
                ].includes(file.extension)).length,
                description: 'Code'
            },
            {
                type: 'audio',
                icon: '🎵',
                count: files.filter(file => [
                    'mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'
                ].includes(file.extension)).length,
                description: 'Audio'
            },
            {
                type: 'video',
                icon: '🎬',
                count: files.filter(file => [
                    'mp4', 'webm', 'mkv', 'avi', 'mov', 'flv'
                ].includes(file.extension)).length,
                description: 'Video'
            },
            {
                type: 'pdf',
                icon: '📚',
                count: files.filter(file => file.extension === 'pdf').length,
                description: 'PDF'
            },
            {
                type: 'document',
                icon: '📑',
                count: files.filter(file => [
                    'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'
                ].includes(file.extension)).length,
                description: 'Document'
            },
            {
                type: 'archive',
                icon: '🗄️',
                count: files.filter(file => [
                    'zip', 'rar', '7z', 'tar', 'gz'
                ].includes(file.extension)).length,
                description: 'Archive'
            }
        ];

        // 获取其他文件类型的统计
        const extensionStats = new Map<string, number>();
        files.forEach(file => {
            const ext = file.extension;
            if (ext && ![
                'md',
                'png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg',
                'js', 'css', 'json', 'yaml', 'yml', 'ts', 'html',
                'mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac',
                'mp4', 'webm', 'mkv', 'avi', 'mov', 'flv',
                'pdf',
                'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf',
                'zip', 'rar', '7z', 'tar', 'gz'
            ].includes(ext)) {
                extensionStats.set(ext, (extensionStats.get(ext) || 0) + 1);
            }
        });

        // 添加其他文件类型的统计项
        extensionStats.forEach((count, ext) => {
            stats.push({
                type: ext,
                icon: '📄',
                count,
                description: `.${ext}`
            });
        });

        return stats;
    }

    /**
     * 创建单个统计项
     * @param item 统计项数据
     */
    private createStatItem(item: FileStatItem) {
        // 创建统计项容器
        const statItem = this.container.createEl('div', {
            cls: 'dms-sidebar-file-stat-item'
        });

        // 创建图标和类型描述
        const typeInfo = statItem.createEl('span', {
            cls: 'dms-sidebar-file-stat-type'
        });
        typeInfo.createEl('span', {
            text: item.icon,
            cls: 'dms-sidebar-file-stat-icon'
        });
        typeInfo.createEl('span', {
            text: item.description,
            cls: 'dms-sidebar-file-stat-desc'
        });

        // 创建数量显示
        statItem.createEl('span', {
            text: String(item.count),
            cls: 'dms-sidebar-file-stat-count'
        });
    }
}