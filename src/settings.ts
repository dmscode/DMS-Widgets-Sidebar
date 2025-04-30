// Obsidian 核心模块导入
import { 
    App,                // 应用程序核心
    ButtonComponent,    // 按钮组件
    Modal,             // 模态框组件
    Notice,            // 通知组件
    PluginSettingTab,  // 插件设置页面基类
    Setting,           // 设置项组件
    TextComponent,     // 文本输入组件
} from 'obsidian';

// 本地模块导入
import WidgetSidebar from './main';              // 插件主类
import { getLang } from './local/lang';          // 国际化工具函数
import { Widget } from './widgets/widgets';       // 小部件基类

// 类型定义导入
import { 
    WidgetConfig,           // 小部件配置接口
} from './types';

/**
 * 小部件侧边栏设置标签页类
 * 用于管理小部件的配置和显示
 * @extends PluginSettingTab
 */
export class WidgetSidebarSettingTab extends PluginSettingTab {
    /** 插件实例引用 */
    plugin: WidgetSidebar;
    /** 小部件列表容器元素 */
    widgetListContainer: HTMLDivElement | null = null;
    /** 小部件编辑模态框实例 */
    editModal: WidgetEditModal;

    /**
     * 构造函数
     * @param app - Obsidian应用实例
     * @param plugin - 小部件侧边栏插件实例
     */
    constructor(app: App, plugin: WidgetSidebar) {
        // 调用父类构造函数
        super(app, plugin);
        // 保存插件实例引用
        this.plugin = plugin;
        // 初始化编辑模态框
        this.editModal = new WidgetEditModal(app);
    }

    /**
     * 显示设置界面
     * 包含基础设置和小部件列表管理
     * @description 负责渲染插件的设置页面，包括侧边栏样式选择和小部件列表管理
     */
    display(): void {
        const {containerEl} = this;
        
        // 初始化设置容器
        containerEl.empty();
        containerEl.classList.add('dms-widget-sidebar-settings');
        
        // 渲染侧边栏样式设置区域
        containerEl.createEl('h2', { text: getLang('widget_style_title') });
        new Setting(containerEl)
            .setName(getLang('widget_style_selector_title'))
            .setDesc(getLang('widget_style_selector_desc'))
            .addDropdown(dropdown => dropdown
               // 添加样式选项
               .addOptions({
                    'card': 'card',
                    'none': 'none',
                })
               // 设置当前选中的样式值
               .setValue(this.plugin.settings.sidebarStyle)
               // 监听样式变更并保存
               .onChange(async (value) => {
                    this.plugin.settings.sidebarStyle = value;
                    await this.plugin.saveSettings();
                })
           );

        // 渲染小部件列表区域
        containerEl.createEl('h2', { text: getLang('widget_list_title') });
        this.widgetListContainer = containerEl.createEl('div', { cls: 'dms-widget-list-container' });
        this.refreshWidgetList();

        // 添加新增小部件按钮
        new Setting(containerEl)
            .addButton(button => button
                .setButtonText(getLang('add_widget_button_title'))
                .setCta()
                .onClick(async () => {
                    // 创建新的小部件配置对象
                    const newWidget: WidgetConfig = {
                        title: `Widget-${this.plugin.settings.widgets.length + 1}`,
                        type: 'text',
                        code: ''
                    }
                    // 保存新小部件并更新界面
                    this.plugin.settings.widgets.push(newWidget);
                    await this.plugin.saveSettings();
                    this.refreshWidgetList();
                    // 打开编辑模态框
                    this.editModal.setData(newWidget, (widget) => this.saveWidgetConfig(widget, this.plugin.settings.widgets.length - 1))
                    this.editModal.open();
                })
           );
    }

    /**
     * 刷新小部件列表显示
     * 清空并重新生成所有小部件的列表项
     */
    private refreshWidgetList(): void {
        if (this.widgetListContainer) {
            // 清空现有的小部件列表内容
            this.widgetListContainer.empty();
            // 遍历所有小部件配置，为每个小部件创建列表项
            this.plugin.settings.widgets.forEach(this.addWidgetListItem, this);
        }
    }
    /**
     * 添加单个小部件的列表项
     * @param widget 小部件配置对象
     * @param index 小部件在列表中的索引
     */
    private addWidgetListItem(widget: WidgetConfig, index:number): void {
        if (!this.widgetListContainer) return;
        
        // 创建小部件项的容器元素
        const widgetContainer = this.widgetListContainer.createEl('div', { cls: 'dms-widget-item-setting' });

        // 添加小部件标题显示
        widgetContainer?.createEl('span', { text: widget.title });
        
        // 添加控制按钮组
        // 1. 向上移动按钮：第一个项目禁用
        new ButtonComponent(widgetContainer)
            .setIcon('up-chevron-glyph')
            .setTooltip(getLang('move_up_button_title'))
            .setDisabled(index === 0)
            .onClick(() => this.moveWidgetUp(index));
            
        // 2. 向下移动按钮：最后一个项目禁用
        new ButtonComponent(widgetContainer)
            .setIcon('down-chevron-glyph')
            .setTooltip(getLang('move_down_button_title'))
            .setDisabled(index === this.plugin.settings.widgets.length - 1)
            .onClick(() => this.moveWidgetDown(index));
            
        // 3. 编辑按钮：打开编辑模态框
        new ButtonComponent(widgetContainer)
           .setIcon('edit')
           .setTooltip(getLang('edit_widget_button_title'))
           .onClick(() => this.editWidget(index));
           
        // 4. 删除按钮：移除当前小部件
        new ButtonComponent(widgetContainer)
            .setIcon('trash')
            .setWarning()
            .setTooltip(getLang('delete_widget_button_title'))
            .onClick(() => this.deleteWidget(index));
    }
    /**
     * 向上移动指定索引位置的小部件
     * @param index 要移动的小部件索引
     */
    private async moveWidgetUp(index: number): Promise<void> {
        // 使用解构赋值交换当前小部件与上一个小部件的位置
        [this.plugin.settings.widgets[index], this.plugin.settings.widgets[index - 1]] = [
            this.plugin.settings.widgets[index - 1],
            this.plugin.settings.widgets[index],
        ];
        await this.plugin.saveSettings();
        // 刷新小部件列表显示
        this.refreshWidgetList();
    }

    /**
     * 向下移动指定索引位置的小部件
     * @param index 要移动的小部件索引
     */
    private async moveWidgetDown(index: number): Promise<void> {
        // 使用解构赋值交换当前小部件与下一个小部件的位置
        [this.plugin.settings.widgets[index], this.plugin.settings.widgets[index + 1]] = [
            this.plugin.settings.widgets[index + 1],
            this.plugin.settings.widgets[index],
        ];
        await this.plugin.saveSettings();
        // 刷新小部件列表显示
        this.refreshWidgetList();
    }

    /**
     * 编辑指定索引位置的小部件
     * @param index 要编辑的小部件索引
     */
    private editWidget(index: number): void {
        // 设置编辑模态框的数据和保存回调函数
        this.editModal.setData(this.plugin.settings.widgets[index], (widget) => this.saveWidgetConfig(widget, index));
        // 打开编辑模态框
        this.editModal.open();
    }
    /**
     * 删除指定索引位置的小部件
     * @param index 要删除的小部件索引
     */
    private async deleteWidget(index: number): Promise<void> {
        // 显示确认对话框
        const confirmed = await confirm(getLang('delete_widget_button_title_confirm'));
        if (!confirmed) return;
        // 从小部件数组中移除指定索引的小部件
        this.plugin.settings.widgets.splice(index, 1);
        await this.plugin.saveSettings();
        // 刷新小部件列表显示
        this.refreshWidgetList();
    }

    /**
     * 保存小部件配置到指定索引位置
     * @param widget 小部件配置对象
     * @param index 要保存的位置索引
     */
    private async saveWidgetConfig(widget: WidgetConfig, index: number): Promise<void> {
        // 更新指定索引位置的小部件配置
        this.plugin.settings.widgets[index] = widget;
        await this.plugin.saveSettings();
        // 刷新小部件列表显示
        this.refreshWidgetList();
    }
}

/**
 * 定义回调函数类型，用于保存小部件配置
 * @param widget 小部件配置对象
 * @returns void
 */
import { setbackType } from './types';
/**
 * 小部件编辑模态框类
 * 用于编辑小部件的标题、类型和代码
 */
class WidgetEditModal extends Modal {
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

    /**
     * 构造函数
     * @param app - Obsidian应用实例
     */
    constructor(app: App) {
        // 调用父类Modal的构造函数
        super(app);
        // 设置模态框标题
        this.setTitle(getLang('edit_widget_modal_title'));
        // 添加模态框的自定义CSS类
        this.containerEl.classList.add('dms-widget-edit-modal');
        // 初始化可用的小部件类型列表
        this.types = [...Widget.getTypes()];
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
     * 初始化类型描述区域
     * 创建包含类型名称和描述的文档片段
     */
    initTypeDesc() {
        // 确定显示的类型：自定义类型显示'custom'，否则显示实际类型
        const type = this.isCustomType() ? 'custom' : this.widget.type;
        
        // 创建文档片段用于存储类型描述内容
        this.typeDescFragment = document.createDocumentFragment();
        
        // 添加类型描述的标题段落
        this.typeDescFragment.createEl('p', { text: getLang('edit_widget_modal_widget_type_desc') });
        
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

        // 1. 创建标题输入设置项
        new Setting(contentEl)
            .setName(getLang('edit_widget_modal_widget_title'))
            .setDesc(getLang('edit_widget_modal_widget_title_desc'))
            .addText(text => text
                .setPlaceholder(getLang('edit_widget_modal_widget_title_placeholder'))
                .setValue(this.widget.title)
                .onChange((value) => {
                    // 更新标题并标记变更状态
                    this.widget.title = value;
                    this.hasChanged = true;
                }));

        // 2. 创建类型选择下拉框设置项
        this.typeChoice = new Setting(contentEl)
            .setName(getLang('edit_widget_modal_widget_type'))
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
                }))

        // 3. 创建自定义类型输入框设置项
        const customType = new Setting(contentEl)
            .setName(getLang('edit_widget_modal_widget_custom_type'))
            .setDesc(getLang('edit_widget_modal_widget_custom_type_desc'))
            .setClass('dms-widget-custom-type')
            .setDisabled(!this.isCustomType())
            .addText(text => {
                // 保存自定义类型组件引用
                this.customTypeComponent = text;
                return text
                    .setPlaceholder(getLang('edit_widget_modal_widget_custom_type_placeholder'))
                    .setValue(this.widget.type)
                    .onChange((value) => {
                        // 更新类型值并标记变更状态
                        this.widget.type = value;
                        this.hasChanged = true;
                    })
                }
            );

        // 4. 创建代码编辑区域设置项
        new Setting(contentEl)
            .setName(getLang('edit_widget_modal_widget_code'))
            .setDesc(getLang('edit_widget_modal_widget_code_desc'))
            .setClass('dms-widget-code')
            .addTextArea(text => text
              .setPlaceholder(getLang('edit_widget_modal_widget_code_placeholder'))
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