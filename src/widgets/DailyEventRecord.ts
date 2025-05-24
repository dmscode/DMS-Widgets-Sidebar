import { WidgetComponent } from "../components/widgetComponent";
import { App, Notice, parseYaml, setIcon, setTooltip, TFile, Modal } from "obsidian";
import { WidgetConfig, voidFunc } from '../types';
import { getLang } from "../local/lang";

/**
 * 每日事件记录挂件类
 * 用于记录和显示每日事件完成时间
 * @extends WidgetComponent
 */
export class DailyEventRecord extends WidgetComponent {
    private config: { title: string; note: string };
    private recordData: { date: string; times: string[] }[] = [];
    private noteFile: TFile | null = null;
    private subscription: voidFunc[] = [];

    constructor(
        container: HTMLElement,
        widget: WidgetConfig,
        app: App,
    ) {
        super(container, widget, app);
        this.config = this.parseConfig(widget.code);
    }

    /**
     * 解析YAML格式的挂件配置
     * @param code YAML格式的代码字符串
     * @returns 解析后的配置对象
     */
    private parseConfig(code: string): { title: string; note: string } {
        // 默认值
        const defaultConfig = {
            title: getLang('daily_event_record_default_title', '每日事件记录'),
            note: ''
        };

        if (!code || code.trim() === '') return defaultConfig;

        try {
            const config = parseYaml(code) as { title: string; note: string };
            return {
                title: config.title || defaultConfig.title,
                note: config.note || defaultConfig.note
            };
        } catch (error) {
            console.error('解析YAML失败:', error);
            return defaultConfig;
        }
    }

    /**
     * 组件加载时的初始化函数
     */
    async onload(): Promise<void> {
        // 创建挂件容器
        this.container.addClass('dms-sidebar-daily-event-record');

        // 创建标题
        this.container.createEl('h3', {
            text: this.config.title,
            cls: 'dms-sidebar-daily-event-record-title'
        });

        // 如果没有指定笔记，显示提示信息
        if (!this.config.note) {
            this.container.createEl('div', {
                text: getLang('daily_event_record_no_note', '请在配置中指定记录笔记'),
                cls: 'dms-sidebar-daily-event-record-error'
            });
            return;
        }

        // 加载笔记数据
        await this.loadNoteData();

        // 创建点阵图
        this.createDotMatrix();

        // 创建今日记录列表
        this.createTodayRecordList();

        // 创建添加按钮
        this.createAddButton();
    }

    /**
     * 加载笔记数据
     */
    private async loadNoteData(): Promise<void> {
        try {
            // 获取笔记文件
            this.noteFile = this.app.vault.getAbstractFileByPath(this.config.note) as TFile;

            if (!this.noteFile) {
                // 如果笔记不存在，创建新笔记
                this.noteFile = await this.app.vault.create(this.config.note, '');
            }

            // 读取笔记内容
            const content = await this.app.vault.read(this.noteFile);

            // 解析记录数据
            this.parseRecordData(content);
        } catch (error) {
            console.error('加载笔记数据失败:', error);
            this.container.createEl('div', {
                text: getLang('daily_event_record_load_error', '加载记录数据失败'),
                cls: 'dms-sidebar-daily-event-record-error'
            });
        }
    }

    /**
     * 解析记录数据
     * @param content 笔记内容
     */
    private parseRecordData(content: string): void {
        this.recordData = [];

        // 按行分割内容
        const lines = content.split('\n')
                             .map(line => line.trim())
                             .filter(line => line !== '')
                             .filter(line => /^[-*]\s+\d{2}-\d{2}\s+\/\s+/.test(line))
                             .map(line => line.replace(/^[-*]\s+/, ''));

        // 解析每行数据
        for (const line of lines) {
            // 分割日期和时间记录
            const parts = line.split('/');
            if (parts.length !== 2) continue;

            // 验证日期格式是否符合MM-DD格式（两位月份-两位日期）
            const dateStr = parts[0].trim();
            const datePattern = /^\d{2}-\d{2}$/;
            if (!datePattern.test(dateStr)) continue;

            const times = parts[1].split('|').map(time => time.trim()).filter(time => time !== '');

            this.recordData.push({ date: dateStr, times });
        }
    }

    /**
     * 创建点阵图
     */
    private createDotMatrix(): void {
        const matrixContainer = this.container.createDiv({ cls: 'dms-sidebar-daily-event-record-matrix' });

        // 获取最近20条记录（或全部记录，如果少于36条）
        const recentRecords = this.recordData.slice(-36);

        // 创建每条记录的点阵列
        for (const record of recentRecords) {
            const columnEl = matrixContainer.createDiv({ cls: 'dms-sidebar-daily-event-record-column' });

            // 添加日期标签
            columnEl.createDiv({
                text: record.date,
                cls: 'dms-sidebar-daily-event-record-date',
                attr: {
                    'data-date': record.date
                }
            });

            // 为每个时间点创建一个方块
            for (const time of record.times) {
                const dotEl = columnEl.createDiv({ cls: 'dms-sidebar-daily-event-record-dot' });

                // 设置悬停提示
                setTooltip(dotEl, `${time}`);
            }
        }
    }

    /**
     * 创建今日记录列表
     */
    private createTodayRecordList(): void {
        // 获取今天的日期（MM-DD格式）
        const today = window.moment().format('MM-DD');
        // 创建标题
        this.container.createEl('h4', {
            text: `${getLang('daily_event_record_today_title', '今日记录')} (${today})`,
            cls: 'dms-sidebar-daily-event-record-list-title'
        });
        const listContainer = this.container.createDiv({ cls: 'dms-sidebar-daily-event-record-list' });


        // 查找今天的记录
        const todayRecord = this.recordData.find(record => record.date === today);

        if (todayRecord && todayRecord.times.length > 0) {
            // 显示今日的每个记录时间
            for (let i = 0; i < todayRecord.times.length; i++) {
                const time = todayRecord.times[i];
                const itemEl = listContainer.createEl('div', {
                    cls: 'dms-sidebar-daily-event-record-list-item'
                });

                // 创建记录文本
                const textEl = itemEl.createEl('span', {
                    text: `✅ ${time}`,
                    cls: 'dms-sidebar-daily-event-record-list-item-text'
                });

                // 创建按钮容器
                const buttonsEl = itemEl.createEl('div', {
                    cls: 'dms-sidebar-daily-event-record-list-item-buttons'
                });

                // 创建编辑按钮
                const editButton = buttonsEl.createEl('div', {
                    cls: 'dms-sidebar-daily-event-record-edit-button'
                });
                setIcon(editButton, 'pencil');
                setTooltip(editButton, getLang('daily_event_record_edit_tooltip', '编辑记录'));

                // 创建删除按钮
                const deleteButton = buttonsEl.createEl('div', {
                    cls: 'dms-sidebar-daily-event-record-delete-button'
                });
                setIcon(deleteButton, 'trash');
                setTooltip(deleteButton, getLang('daily_event_record_delete_tooltip', '删除记录'));

                // 添加编辑按钮点击事件
                const editListener = () => this.editRecord(i);
                editButton.addEventListener('click', editListener);
                this.subscription.push(() => editButton.removeEventListener('click', editListener));

                // 添加删除按钮点击事件
                const deleteListener = () => this.deleteRecord(i);
                deleteButton.addEventListener('click', deleteListener);
                this.subscription.push(() => deleteButton.removeEventListener('click', deleteListener));
            }
        } else {
            // 显示无记录提示
            listContainer.createEl('li', {
                text: getLang('daily_event_record_no_records', '无记录'),
                cls: 'dms-sidebar-daily-event-record-list-item dms-sidebar-daily-event-record-list-item-empty'
            });
        }
    }

    /**
     * 创建添加按钮
     */
    private createAddButton(): void {
        const buttonContainer = this.container.createDiv({ cls: 'dms-sidebar-daily-event-record-button-container' });

        const addButton = buttonContainer.createEl('button', {
            text: getLang('daily_event_record_add_button', '添加记录'),
            cls: 'dms-sidebar-daily-event-record-add-button'
        });
        // 添加点击事件
        const addListener = this.addRecord.bind(this);
        addButton.addEventListener('click', addListener);
        this.subscription.push(() => addButton.removeEventListener('click', addListener));
    }

    /**
     * 保存记录数据并重新加载组件
     * @param successMessage 成功消息
     * @param errorMessage 错误消息
     * @param errorLogPrefix 错误日志前缀
     * @returns 是否成功保存并重新加载
     */
    private async saveAndReloadData(successMessage?: string, errorMessage?: string, errorLogPrefix?: string): Promise<boolean> {
        if (!this.noteFile) return false;

        try {
            // 更新笔记内容
            const content = this.recordData.map(record => {
                return `- ${record.date} / ${record.times.join(' | ')}`;
            }).join('\n');

            // 写入笔记
            await this.app.vault.modify(this.noteFile, content);

            // 重新加载组件
            this.container.empty();
            await this.onload();

            // 显示成功消息（如果提供）
            if (successMessage) {
                new Notice(successMessage);
            }

            return true;
        } catch (error) {
            // 记录错误并显示错误消息
            if (errorLogPrefix) {
                console.error(`${errorLogPrefix}:`, error);
            } else {
                console.error('保存数据失败:', error);
            }

            if (errorMessage) {
                new Notice(errorMessage);
            }

            return false;
        }
    }

    /**
     * 添加新记录的回调函数
     * @param newTime 新的时间值
     */
    private async handleAddRecord(newTime: string): Promise<void> {
        // 如果用户取消或输入为空，则返回
        if (!newTime || newTime.trim() === '') return;

        // 验证时间格式
        if (!this.validateTimeFormat(newTime)) {
            return;
        }

        await this.loadNoteData();

        // 获取当前日期
        const today = window.moment().format('MM-DD');

        // 查找今天的记录
        const todayRecordIndex = this.recordData.findIndex(record => record.date === today);

        if (todayRecordIndex >= 0) {
            // 如果今天已有记录，添加新时间
            this.recordData[todayRecordIndex].times.push(newTime);
        } else {
            // 如果今天没有记录，创建新记录
            this.recordData.push({
                date: today,
                times: [newTime]
            });
        }

        // 保存数据并重新加载组件
        await this.saveAndReloadData(
            getLang('daily_event_record_add_success', '记录已添加'),
            getLang('daily_event_record_add_error', '添加记录失败'),
            '添加记录失败'
        );
    }

    /**
     * 添加新记录
     */
    private async addRecord(): Promise<void> {
        // 获取当前时间作为默认值
        const currentTime = window.moment().format('HH:mm');
        
        // 弹出对话框让用户输入时间
        new EditModal(this.app, currentTime, this.handleAddRecord.bind(this)).open();
    }

    /**
     * 编辑记录的回调函数
     * @param index 记录索引
     * @param originalTime 原始时间值
     * @param newTime 新的时间值
     */
    private async handleEditRecord(index: number, originalTime: string, newTime: string): Promise<void> {
        // 如果用户取消或输入为空，或时间未改变，则返回
        if (!newTime || newTime.trim() === '' || newTime === originalTime) return;

        // 验证时间格式
        if (!this.validateTimeFormat(newTime)) {
            return;
        }

        await this.loadNoteData();
        
        // 获取今天的日期
        const today = window.moment().format('MM-DD');
        // 查找今天的记录
        const todayRecordIndex = this.recordData.findIndex(record => record.date === today);
        if (todayRecordIndex < 0 || !this.noteFile) return;

        // 更新时间
        this.recordData[todayRecordIndex].times[index] = newTime;

        // 保存数据并重新加载组件
        await this.saveAndReloadData(
            getLang('daily_event_record_edit_success', '记录已更新'),
            getLang('daily_event_record_edit_error', '编辑记录失败'),
            '编辑记录失败'
        );
    }

    /**
     * 验证时间格式
     * @param time 时间字符串
     * @returns 是否为有效格式
     */
    private validateTimeFormat(time: string): boolean {
        const timePattern = /^([01]\d|2[0-3]):([0-5]\d)/;
        if (!timePattern.test(time)) {
            new Notice(getLang('daily_event_record_invalid_time', '无效的时间格式，请使用 HH:mm 格式'));
            return false;
        }
        return true;
    }

    /**
     * 编辑记录
     * @param index 记录索引
     */
    private async editRecord(index: number): Promise<void> {
        // 获取今天的日期
        const today = window.moment().format('MM-DD');
        await this.loadNoteData();
        // 查找今天的记录
        const todayRecordIndex = this.recordData.findIndex(record => record.date === today);
        if (todayRecordIndex < 0 || !this.noteFile) return;

        // 获取当前时间值
        const currentTime = this.recordData[todayRecordIndex].times[index];

        // 弹出对话框让用户输入新时间
        new EditModal(this.app, currentTime, (newTime: string) => {
            this.handleEditRecord(index, currentTime, newTime);
        }).open();
    }

    /**
     * 删除记录
     * @param index 记录索引
     */
    private async deleteRecord(index: number): Promise<void> {
        // 获取今天的日期
        const today = window.moment().format('MM-DD');
        await this.loadNoteData();
        // 查找今天的记录
        const todayRecordIndex = this.recordData.findIndex(record => record.date === today);
        if (todayRecordIndex < 0 || !this.noteFile) return;

        // 获取要删除的时间
        const timeToDelete = this.recordData[todayRecordIndex].times[index];

        // 确认删除
        if (!confirm(getLang('daily_event_record_delete_confirm', `确定要删除 ${timeToDelete} 的记录吗？`))) {
            return;
        }

        // 删除时间
        this.recordData[todayRecordIndex].times.splice(index, 1);

        // 如果删除后没有时间记录，则删除整个日期记录
        if (this.recordData[todayRecordIndex].times.length === 0) {
            this.recordData.splice(todayRecordIndex, 1);
        }

        // 保存数据并重新加载组件
        await this.saveAndReloadData(
            getLang('daily_event_record_delete_success', '记录已删除'),
            getLang('daily_event_record_delete_error', '删除记录失败'),
            '删除记录失败'
        );
    }

    async onunload(): Promise<void> {
        // 在这里执行组件卸载时的清理操作，移除所有事件监听器
        this.subscription.forEach(unsubscribe => unsubscribe());
    }
}

class EditModal extends Modal {
    private value: string;
    private subscription: voidFunc[] = [];
    private input: HTMLInputElement;
    private callback: (value:string)=>void;
	constructor(app: App, value: string, callback: (value:string)=>void) {
		super(app);
		this.value = value;
        this.callback = callback;
	}

	onOpen() {
		const {contentEl} = this;
        contentEl.empty();
        contentEl.classList.add('dms-sidebar-daily-event-record-edit-modal');
        this.input = contentEl.createEl('input', {
            type: 'text',
            value: this.value,
            cls: 'dms-sidebar-daily-event-record-edit-modal-input',
            attr: {
                placeholder: 'HH:mm'
            }
        });
        const saveButton = contentEl.createEl('button', {text: getLang('daily_event_record_modal_save_button_title', '保存')});
        // 添加事件监听器
        const saveListener = this.onSubmit.bind(this);
        saveButton.addEventListener('click', saveListener);
        this.subscription.push(() => saveButton.removeEventListener('click', saveListener));
	}

	onSubmit() {
		this.value = this.input.value;
        this.callback(this.value);
        this.close();
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
        this.subscription.forEach(unsubscribe => unsubscribe());
	}
}