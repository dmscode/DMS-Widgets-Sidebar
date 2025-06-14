// Obsidian 核心模块导入
import {
    App,                // 应用程序核心
    Modal,             // 模态框组件
    Setting,           // 设置项组件
    TextComponent,     // 文本输入组件
    DropdownComponent, // 下拉选择组件
} from 'obsidian';

// 本地模块导入
import { getLang } from '../local/lang';          // 国际化工具函数
import { widgetTypes } from '../widgets/widgets';       // 小部件基类


// 从主题模块导入主题和小部件样式列表获取函数
import { widgetStyleList } from '../theme';

// 类型定义导入
import {
    WidgetConfig,           // 小部件配置接口
    setbackType,           // 保存回调函数
} from '../types';
/**
 * 小部件编辑模态框类
 * 用于编辑小部件的标题、类型和代码
 */
export class WidgetEditModal extends Modal {
    // 当前编辑的小部件配置
    private widget: WidgetConfig;
    // 保存回调函数
    private setback: setbackType;
    // 标记是否有修改
    private hasChanged:boolean = false;
    // 小部件类型列表
    private types: string[];
    // 类型选择框组件
    private typeChoice: Setting;
    // 类型描述片段
    private typeDescFragment: DocumentFragment;
    // 自定义类型输入框组件
    private customTypeComponent: TextComponent;
    // 类型名称元素
    private widgetTypeName: HTMLElement;
    // 类型描述元素
    private widgetTypeDesc: HTMLElement;
    // 样式选择框组件
    private styleChoice: DropdownComponent;
    // 自定义样式输入框组件
    private customStyleComponent: TextComponent;

    /**
     * 构造函数
     * @param app - Obsidian应用实例
     */
    constructor(app: App) {
        // 调用父类Modal的构造函数
        super(app);
        // 设置模态框标题
        this.setTitle(getLang('edit_widget_modal_title', '编辑小部件'));
        // 添加模态框的自定义CSS类
        this.containerEl.classList.add('dms-widget-edit-modal');
        // 初始化可用的小部件类型列表
        this.types = widgetTypes;
    }
    /**
     * 设置模态框数据和回调函数
     * @param widget 小部件配置
     * @param setback 保存回调函数
     */
    setData(widget: WidgetConfig, setback:setbackType): void {
        this.widget = widget;
        this.setback = setback;
        this.hasChanged = false;
        this.initTypeDesc();
    }
    /**
     * 检查当前小部件类型是否为自定义类型
     * @returns {boolean} 如果类型不在预定义类型列表中返回true，否则返回false
     */
    isCustomType(): boolean {
        return !this.types.includes(this.widget.type);
    }

    /**
     * 检查当前小部件样式是否为自定义样式
     * @returns {boolean} 如果样式不在预定义样式列表中返回true，否则返回false
     */
    isCustomStyle(): boolean {
        // 检查当前小部件的样式是否存在于该类型的预定义样式列表中
        return this.widget.style === 'custom' || !Object.keys(this.getWidgetStyleList(this.widget.type)).includes(this.widget.style);
    }
    getWidgetStyleList(type: string) {
        return widgetStyleList[type] || {
            default: 'default',
            custom: 'custom',
            base: 'base',
        }
    }
    /**
     * 初始化样式相关组件
     * 设置样式选择和自定义样式输入的初始状态
     */
    private initStyleComponents(): void {
        // 如果没有设置样式，默认使用'default'
        if (!this.widget.style) {
            this.widget.style = 'default';
        }
    }

    /**
     * 初始化类型描述区域
     * 创建包含类型名称和描述的文档片段
     */
    initTypeDesc() {
        // 确定显示的类型：自定义类型显示'custom'，否则显示实际类型
        const type = this.isCustomType() ? 'custom' : this.widget.type;

        // 创建文档片段用于存储类型描述内容
        this.typeDescFragment = document.createDocumentFragment();

        // 添加类型描述的标题段落
        this.typeDescFragment.createEl('p', { text: getLang('edit_widget_modal_widget_type_desc', '小部件类型') });

        // 创建类型详细信息段落
        const widgetTypeDescPara = this.typeDescFragment.createEl('p');

        // 添加类型名称（粗体显示）
        this.widgetTypeName = widgetTypeDescPara.createEl('strong', { text: getLang('widget_type_'+type, '') || type });

        // 添加分隔符
        widgetTypeDescPara.createEl('span', { text: ': ' });

        // 添加类型描述文本
        this.widgetTypeDesc = widgetTypeDescPara.createEl('span', { text: getLang('widget_type_'+type+'_desc', '') || '' });
    }
    /**
     * 打开模态框时的回调函数
     * 创建编辑界面的各个设置项，包括标题、类型选择和代码编辑区域
     */
    onOpen() {
        const {contentEl} = this;
        // 清空现有内容
        this.contentEl.empty();
        // 初始化样式相关组件
        this.initStyleComponents();

        // 1. 创建标题输入设置项
        new Setting(contentEl)
            .setName(getLang('edit_widget_modal_widget_title', '小部件标题'))
            .setDesc(getLang('edit_widget_modal_widget_title_desc', '请输入小部件的标题'))
            .addText(text => text
                .setPlaceholder(getLang('edit_widget_modal_widget_title_placeholder', '请输入标题'))
                .setValue(this.widget.title)
                .onChange((value) => {
                    // 更新标题并标记变更状态
                    this.widget.title = value;
                    this.hasChanged = true;
                }));

        // 2. 创建类型选择下拉框设置项
        this.typeChoice = new Setting(contentEl)
            .setName(getLang('edit_widget_modal_widget_type', '小部件类型'))
            .setDesc(this.typeDescFragment)
            .addDropdown(dropdown => dropdown
              // 构建类型选项列表，包含预定义类型和自定义类型选项
              .addOptions(this.types.concat(['custom']).reduce((obj, item) => {
                    obj[item] = getLang('widget_type_'+item, '') || item;
                    return obj;
                }, {} as Record<string, string>))
              // 设置当前选中的类型值
              .setValue(this.isCustomType() ? 'custom' : this.widget.type)
              .onChange((value) => {
                    // 处理类型选择变更
                    if(value === 'custom') {
                        // 启用自定义类型输入框
                        customType.setDisabled(false)
                        this.customTypeComponent.setValue(this.widget.type);
                    }else {
                        // 禁用自定义类型输入框
                        customType.setDisabled(true)
                        this.widget.type = value;
                    }
                    this.hasChanged = true;
                    this.refreshTypeDesc(value);
                    this.refreshStyleList();
                }))

        // 3. 创建自定义类型输入框设置项
        const customType = new Setting(contentEl)
            .setName(getLang('edit_widget_modal_widget_custom_type', '自定义小部件类型'))
            .setDesc(getLang('edit_widget_modal_widget_custom_type_desc', '如果您选择了自定义类型，请在此输入小部件类型名称'))
            .setClass('dms-widget-custom-type')
            .setDisabled(!this.isCustomType())
            .addText(text => {
                // 保存自定义类型组件引用
                this.customTypeComponent = text;
                return text
                    .setPlaceholder(getLang('edit_widget_modal_widget_custom_type_placeholder', '请输入自定义小部件类型'))
                    .setValue(this.widget.type)
                    .onChange((value) => {
                        // 更新类型值并标记变更状态
                        this.widget.type = value;
                        this.hasChanged = true;
                        this.refreshStyleList();
                    })
                }
            );

        // 4. 创建样式选择设置项
         new Setting(contentEl)
            .setName(getLang('edit_widget_modal_widget_style', '小部件样式'))
            .setDesc(getLang('edit_widget_modal_widget_style_desc', '请选择小部件的样式'))
            .addDropdown(dropdown => {
                this.styleChoice = dropdown;
                dropdown
                // 构建样式选项列表
                .addOptions(this.getWidgetStyleList(this.widget.type))
                // 设置当前选中的样式值
                .setValue(this.isCustomStyle()? 'custom' : this.widget.style)
                .onChange((value) => {
                    // 处理样式选择变更
                    if(value === 'custom') {
                        // 启用自定义样式输入框
                        customStyle.setDisabled(false);
                        this.customStyleComponent.setValue(this.widget.style || 'default');
                    } else {
                        // 禁用自定义样式输入框
                        customStyle.setDisabled(true);
                        this.widget.style = value;
                    }
                    this.hasChanged = true;
                })
            });

        // 5. 创建自定义样式输入框设置项
        const customStyle = new Setting(contentEl)
            .setName(getLang('edit_widget_modal_widget_custom_style', '自定义小部件样式'))
            .setDesc(getLang('edit_widget_modal_widget_custom_style_desc', '如果您选择了自定义样式，请在此输入小部件样式名称'))
            .setClass('dms-widget-custom-style')
            .setDisabled(this.widget.style !== 'custom')
            .addText(text => {
                this.customStyleComponent = text;
                return text
                    .setPlaceholder(getLang('edit_widget_modal_widget_custom_style_placeholder', '请输入自定义小部件样式'))
                    .setValue(this.widget.style || 'default')
                    .onChange((value) => {
                        this.widget.style = value;
                        this.hasChanged = true;
                    });
            });

        // 6. 创建代码编辑区域设置项
        new Setting(contentEl)
            .setName(getLang('edit_widget_modal_widget_code', '小部件代码'))
            .setDesc(getLang('edit_widget_modal_widget_code_desc', '请输入小部件的代码内容'))
            .setClass('dms-widget-code')
            .addTextArea(text => text
              .setPlaceholder(getLang('edit_widget_modal_widget_code_placeholder', '请输入小部件代码'))
              .setValue(this.widget.code)
              .onChange((value) => {
                    // 更新代码内容并标记变更状态
                    this.widget.code = value;
                    this.hasChanged = true;
                }));
    }
    /**
     * 刷新类型描述显示
     * @param type 小部件类型，默认使用当前小部件的类型
     */
    refreshTypeDesc(type:string = this.widget.type) {
        // 更新类型名称显示，优先使用本地化文本，若无则使用原始类型名
        this.widgetTypeName.setText(getLang('widget_type_'+type, '') || type);
        // 更新类型描述显示，优先使用本地化文本，若无则显示空字符串
        this.widgetTypeDesc.setText(getLang('widget_type_'+type+'_desc', '') || '');
    }
    refreshStyleList() {
        // 刷新样式选项列表
        this.styleChoice.selectEl.empty();
        this.styleChoice.addOptions(this.getWidgetStyleList(this.widget.type));
        // 根据当前样式设置是否启用自定义样式输入框
        this.customStyleComponent.setDisabled(!this.isCustomStyle());
    }
    /**
     * 关闭模态框时的回调函数
     * 清空内容并在有修改时保存更改
     */
    onClose() {
        const {contentEl} = this;
        contentEl.empty();
        // 如果有修改，则调用回调函数保存更改
        if (this.hasChanged) {
            this.setback(this.widget);
        }
    }
}