import { Modal, App } from "obsidian";
import { getLang } from "src/local/lang";

/**
 * 配置 SimpleEditModal 的选项接口
 */
export interface SimpleEditModalOptions {
  value: string; // 初始输入值
  placeholder?: string; // 输入框占位符
  title?: string; // 弹窗标题
  saveButtonText?: string; // 保存按钮文本
  onSubmit: (value: string) => void; // 提交回调
}

/**
 * 打开一个简单的编辑弹窗
 * @param app Obsidian 应用实例
 * @param options 弹窗配置选项
 */
export function openSimpleEditModal(app: App, options: SimpleEditModalOptions) {
  /**
   * 简单编辑弹窗类
   */
  class SimpleEditModal extends Modal {
    private value: string; // 当前输入值
    private input: HTMLInputElement; // 输入框元素
    private options: SimpleEditModalOptions; // 弹窗配置选项
    private subscription: (() => void)[] = []; // 事件解绑函数集合

    /**
     * 构造函数，初始化弹窗
     * @param app Obsidian 应用实例
     * @param options 弹窗配置选项
     */
    constructor(app: App, options: SimpleEditModalOptions) {
      super(app);
      this.value = options.value;
      this.options = options;
    }

    /**
     * 弹窗打开时的回调
     */
    onOpen() {
      const { contentEl } = this;
      contentEl.empty(); // 清空内容区域

      // 如果有标题，创建标题元素
      if (this.options.title) {
        contentEl.createEl('h3', { text: this.options.title });
      }

      // 创建输入框并设置初始值和样式
      this.input = contentEl.createEl('input', {
        type: 'text',
        value: this.value,
        cls: 'dms-sidebar-simple-edit-modal-input',
        attr: {
          placeholder: this.options.placeholder || ''
        }
      });

      // 创建保存按钮
      const saveButton = contentEl.createEl('button', {
        text: this.options.saveButtonText || getLang('simple_edit_modal_save_button_title', '保存'),
      });

      // 绑定保存按钮点击事件
      const saveListener = this.onSubmit.bind(this);
      saveButton.addEventListener('click', saveListener);
      this.subscription.push(() => saveButton.removeEventListener('click', saveListener));

      // 支持回车提交
      const keyListener = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          this.onSubmit();
        }
      };
      this.input.addEventListener('keydown', keyListener);
      this.subscription.push(() => this.input.removeEventListener('keydown', keyListener));

      // 聚焦输入框
      setTimeout(() => this.input.focus(), 0);
    }

    /**
     * 提交输入内容并关闭弹窗
     */
    onSubmit() {
      this.value = this.input.value; // 获取输入框内容
      this.options.onSubmit(this.value); // 调用提交回调
      this.close(); // 关闭弹窗
    }

    /**
     * 弹窗关闭时的回调
     */
    onClose() {
      const { contentEl } = this;
      contentEl.empty(); // 清空内容区域
      this.subscription.forEach(unsub => unsub()); // 移除所有事件监听
    }
  }

  // 实例化并打开弹窗
  new SimpleEditModal(app, options).open();
}
