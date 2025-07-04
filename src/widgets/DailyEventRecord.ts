import { WidgetComponent } from "../components/widgetComponent";
import { App, Notice, parseYaml, setIcon, setTooltip, TFile } from "obsidian";
import { WidgetConfig, voidFunc } from '../types';
import { getLang } from "../local/lang";
import { openSimpleEditModal } from "../components/simpleEditModal";

interface DailyEventRecordConfig {
    title: string;
    note: string;
    rules: string[];
}

/**
 * 每日事件记录挂件类
 * 用于记录和显示每日事件完成时间
 * @extends WidgetComponent
 */
export class DailyEventRecord extends WidgetComponent {
    private config: DailyEventRecordConfig;
    private recordData: { date: string; times: string[] }[] = [];
    private noteFile: TFile | null = null;
    private subscription: voidFunc[] = [];
    private markRules: ((mark: string) => string)[] = [];

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
    private parseConfig(code: string): DailyEventRecordConfig {
        // 默认值
        const defaultConfig = {
            title: getLang('daily_event_record_default_title', '每日事件记录'),
            note: '',
            rules: [],
        };

        if (!code || code.trim() === '') return defaultConfig;

        try {
            const config = parseYaml(code) as DailyEventRecordConfig;
            if(config.rules){
                if(!Array.isArray(config.rules)) {
                    config.rules = [];
                }
                if(config.rules.length !== 0) {
                    config.rules = [];
                    code.split('\n').forEach(line => {
                        if(/^\s*[-*]\s+.+$/.test(line)) {
                            const rule = line.replace(/^\s*[-*]\s+/, '').trim();
                            if (rule) {
                                config.rules.push(rule);
                            }
                        }
                    })
                }
            }
            return Object.assign({}, defaultConfig, config);
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
        const titleEl = this.container.createEl('h3', {
            cls: 'dms-sidebar-daily-event-record-title'
        });

        // 创建标题链接
        titleEl.createEl('a', {
            cls: ['internal-link'],
            text: this.config.title,
            href: this.config.note,
            attr: {
                rel: 'noopener',
                target: '_blank',
            }
        })

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

        // 创建标记规则
        this.createMarkRules();

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
            const noteFile = this.app.vault.getAbstractFileByPath(this.config.note);
            if( !noteFile || !(noteFile instanceof TFile)) {
                // 如果笔记文件不存在，尝试创建
                this.noteFile = await this.app.vault.create(this.config.note, '');
            } else {
                // 如果笔记文件存在，直接使用
                this.noteFile = noteFile;
            }

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
     * @private
     * 遍历配置中的规则，为每个规则动态创建一个函数，并将其添加到 `markRules` 数组中。
     * 每个生成的函数接收一个 `mark` 参数，并返回根据规则模板生成的字符串。
     * 
     * 注意：此方法使用了 `new Function` 动态生成函数，需确保 `rule.mark` 的安全性，避免注入风险。
     */
    private createMarkRules(): void {
        for (const rule of this.config.rules) {
            const code = `if (mark && mark.trim() !== '') {
                mark = mark.trim();
                return ${rule};
            } else {
                return '';
            }`;
            const ruleFunc = new Function('mark', code) as (mark: string) => string;
            this.markRules.push(ruleFunc);
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
     * 根据传入的时间字符串，提取并返回对应的标记字符串。
     * 
     * 该方法首先尝试从时间字符串中移除前缀的“HH:MM ”格式，
     * 如果移除后没有有效的标记，则返回空字符串。
     * 随后遍历所有的标记规则（`markRules`），
     * 并返回第一个匹配到的标记字符串。
     * 如果没有任何规则匹配，则返回空字符串。
     * 
     * @param time - 包含时间和可能标记的字符串（如 "08:00 重要"）
     * @returns 匹配到的标记字符串，如果没有则返回空字符串
     */
    private getDotMark(time:string): string {
        const desc = time.replace(/^\d{2}:\d{2}\s*/, '');
        if (!desc || desc.trim() === '' || desc === time) return '';
        // 遍历所有规则，找到第一个匹配的标记
        for (const rule of this.markRules) {
            const mark = rule(desc);
            if (mark) return mark;
        }
        return '';
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
                const mark = this.getDotMark(time);
                const dotEl = columnEl.createDiv({
                    cls: 'dms-sidebar-daily-event-record-dot',
                    attr: {
                        style: mark ? `background-color: ${mark};` : ''
                    }
                });

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

        newTime = newTime.trim();

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
        
        // 使用通用编辑弹窗
        openSimpleEditModal(
            this.app,
            {
                value: currentTime+' ',
                placeholder: 'HH:mm',
                onSubmit: this.handleAddRecord.bind(this)
            }
        );
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

        // 使用通用编辑弹窗
        openSimpleEditModal(
            this.app,
            {
                value: currentTime + ( /^\d+:\d+$/.test(currentTime) ? ' ' : ''),
                placeholder: 'HH:mm',
                onSubmit: (newTime: string) => {
                    this.handleEditRecord(index, currentTime, newTime.trim());
                }
            }
        );
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