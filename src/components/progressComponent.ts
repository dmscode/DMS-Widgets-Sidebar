// 第三方库导入
import { Component } from "obsidian";
import { progressConfg } from "../types";

/**
 * 进度条组件类
 * 用于创建和管理一个包含标题、进度条和百分比显示的UI组件
 */
export class ProgressComponent extends Component {
    // 组件的容器元素
    container: HTMLDivElement;
    // 标题元素，可选
    titleEl: HTMLDivElement | null = null;
    // 进度条轨道元素
    progressTrack: HTMLDivElement;
    // 进度条指示器元素
    progressIndicator: HTMLDivElement;
    // 百分比显示元素，可选
    precentEl: HTMLDivElement | null = null;

    /**
     * 构造函数：初始化进度条组件
     * @param container 父容器元素
     * @param config 进度条配置对象
     */
    constructor(container: HTMLElement, config: progressConfg) {
        super();
        // 创建组件主容器
        this.container = container.createDiv(config.cls ? ['dms-sidebar-progress-bar-wrapper'].concat(config.cls).join(' ') : 'dms-sidebar-progress-wrapper');
        // 如果配置中包含标题，创建标题元素
        if(config.title){
            this.titleEl = this.container.createEl('div', {
                text: config.title,
                cls: 'dms-sidebar-progress-bar-title'
            });
        }
        // 创建进度条轨道和指示器
        this.progressTrack = this.container.createDiv('dms-sidebar-progress-bar-track');
        this.progressIndicator = this.progressTrack.createDiv('dms-sidebar-progress-bar-indicator');
        // 如果配置中包含百分比，创建百分比显示元素
        if(config.precent){
            this.precentEl = this.container.createEl('div', {
                text: config.precent,
                cls: 'dms-sidebar-progress-bar-precent'
            })
        }
        // 设置初始进度值
        this.setProgress(config.progress);
    }

    /**
     * 设置进度条标题
     * @param title 新的标题文本
     */
    setTitle(title: string) {
        if(this.titleEl) {
            this.titleEl.setText(title);
        }
    }

    /**
     * 设置进度条进度
     * @param progress 进度值（0-100）
     */
    setProgress(progress: number) {
        this.progressIndicator.setAttribute('style', `width: ${progress}%`);
        this.progressIndicator.dataset.level = this.getLevel(progress);
        this.setPrecent(`${progress}%`);
    }

    /**
     * 设置进度条百分比显示
     * @param precent 百分比文本
     */
    setPrecent(precent: string) {
        if(this.precentEl) {
            this.precentEl.setText(precent);
        }
    }
    /**
     * 获取当前进度状态
     * @param progress - 进度值（0-100的数值）
     * @returns 根据进度返回对应的状态标识
     */
    private getLevel(progress: number) {
        // 完成状态：进度达到100%
        if (progress >= 100) return '100';
        // 接近完成：进度在81-99%之间
        if (progress >= 80) return '80';
        // 进展良好：进度在61-80%之间
        if (progress >= 60) return '60';
        // 完成一半：进度在41-60%之间
        if (progress >= 40) return '40';
        // 开始阶段：进度在21-40%之间
        if (progress >= 20) return '20';
        // 新建状态：进度在0-20%之间
        return '0';
    }
}