// Obsidian 核心模块导入
import {
    App,                // 应用程序核心
    ButtonComponent,    // 按钮组件
    PluginSettingTab,  // 插件设置页面基类
    Setting,           // 设置项组件
    Notice,            // 通知组件
} from 'obsidian';

// 本地模块导入
import WidgetSidebar from './main';              // 插件主类
import { getLang } from './local/lang';          // 国际化工具函数
import { ThemeList } from './theme';             // 主题列表
import { WidgetEditModal } from './settings/widgetEditModal'; // 小部件编辑模态框
import { globalStore, sidebarsStore, timerStore } from './store';     // 状态管理
import { openSimpleEditModal } from "./components/simpleEditModal";   // 打开简单编辑弹窗

// 类型定义导入
import {
    SidebarConfig,
    WidgetConfig,
    WidgetSidebarsConfig,              // 侧边栏配置映射接口
    WidgetSidebarSettings_2,           // 小部件配置接口
} from './types';

/**
 * 小部件侧边栏设置标签页类
 * 用于管理小部件的配置和显示
 * @extends PluginSettingTab
 */
export class WidgetSidebarSettingTab extends PluginSettingTab {
    /** 插件实例引用 */
    plugin: WidgetSidebar;
    /** 边栏列表容器元素 */
    sidebarListContainer: HTMLDivElement | null = null;
    /** 小部件列表容器元素 */
    widgetListContainers: { [key: string]: HTMLDivElement } = {};
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
        new Setting(containerEl)
            .setName(getLang('widget_style_title', '小部件侧边栏样式'))
            .setHeading()
        new Setting(containerEl)
            .setName(getLang('widget_style_selector_title', '选择侧边栏样式'))
            .setDesc(getLang('widget_style_selector_desc', '选择小部件侧边栏的样式'))
            .addDropdown(dropdown => dropdown
               // 添加样式选项
               .addOptions(ThemeList)
               // 设置当前选中的样式值
               .setValue(globalStore.getState().sidebarStyle)
               // 监听样式变更并保存
               .onChange(async (value) => {
                    await this.saveSettings({
                        sidebarStyle: value,
                    }, 'global');
                })
           );

        // 渲染小部件列表区域
        new Setting(containerEl)
            .setName(getLang('sidebar_list_title', '小部件侧边栏列表'))
            .setHeading()
        this.sidebarListContainer = containerEl.createEl('div', { cls: 'dms-sidebar-list-container' });
        this.refreshSidebarList();
        // 添加新增侧边栏按钮
        new Setting(containerEl)
            .addButton(button => button
                .setButtonText(getLang('add_sidebar_button_title', '添加新挂件侧边栏'))
                .setCta()
                .onClick(async () => {
                    const key = new Date().getTime().toString(36); // 生成唯一键
                    // 创建新的小部件配置对象
                    const sidebar: SidebarConfig = {
                        title: getLang('new_view_title', '新挂件侧边栏'),
                        viewType: key, // 使用唯一键作为视图类型
                        widgets: [], // 初始化小部件列表为空
                    }
                    // 保存新小部件并更新界面
                    await this.saveSingleSidebarSettings(sidebar, key);
                    this.refreshSidebarList();
                })
        );
    }
    private refreshSidebarList(): void {
        if (!this.sidebarListContainer) return;
        // 清空现有的侧边栏列表内容
        this.sidebarListContainer?.empty();
        // 获取当前所有侧边栏配置
        const sidebars = sidebarsStore.getState();
        // 遍历所有侧边栏配置，为每个侧边栏创建列表项
        Object.keys(sidebars).forEach((sidebarKey) => {
            const sidebar = sidebars[sidebarKey];
            // 创建侧边栏项的容器元素
            const sidebarContainer = this.sidebarListContainer?.createEl('div', { cls: 'dms-sidebar-item-list' });
            if (!sidebarContainer) return;
            // 添加侧边栏标题显示
            const sidebarHeader = sidebarContainer.createEl('h3', { cls: 'dms-sidebar-item-header' });
            const headerText = sidebarHeader.createEl('span', { text: sidebar.title });

            // 添加控制按钮组
            // 1. 编辑按钮：打开编辑模态框
            new ButtonComponent(sidebarHeader)
                .setIcon('edit')
                .setTooltip(getLang('sidebar_edit_button_tooltip', '编辑侧边栏'))
                .onClick(() => {
                    openSimpleEditModal(this.app, {
                        value: sidebar.title,
                        onSubmit: async(value) => {
                            // 保存新小部件并更新界面
                            await this.saveSingleSidebarSettings({
                                ...sidebar,
                                title: value, // 更新侧边栏标题
                            });
                            headerText.setText(value); // 更新标题显示
                            // Note: 不使用全局刷新减少性能开销
                            // this.refreshSidebarList();
                        }
                    })
                });

            // 2. 删除按钮：移除当前侧边栏
            if(sidebarKey != 'default') new ButtonComponent(sidebarHeader)
                .setIcon('trash')
                .setWarning()
                .setTooltip(getLang('sidebar_delete_button_tooltip', '删除侧边栏'))
                .onClick(async () => {
                    if (sidebarKey === 'default') {
                        new Notice(getLang('delete_default_sidebar_notice', '无法删除默认侧边栏'));
                        return;
                    }
                    const confirmed = await confirm(getLang('delete_sidebar_button_confirm', '确认删除此侧边栏？'));
                    if (!confirmed) return;
                    // 删除当前侧边栏配置
                    await this.saveSingleSidebarSettings(undefined, sidebarKey); // 保存删除操作
                    this.sidebarListContainer?.removeChild(sidebarContainer); // 从列表中移除当前侧边栏项
                    delete this.widgetListContainers[sidebarKey]; // 删除对应的小部件列表容器
                    // Note: 不使用全局刷新减少性能开销
                    // this.refreshSidebarList();
                });
            // 挂件列表
            const widgetListContainer = sidebarContainer.createEl('div', { cls: 'dms-widget-list-container' });
            this.widgetListContainers[sidebarKey] = widgetListContainer;
            this.refreshWidgetList(sidebarKey);
            // 添加新增小部件按钮
            new Setting(sidebarContainer)
                .addButton(button => button
                    .setButtonText(getLang('add_widget_button_title', '添加新小部件'))
                    .setCta()
                    .onClick(async () => {
                        // 创建新的小部件配置对象
                        const newWidget: WidgetConfig = {
                            title: `Widget-${sidebar.widgets.length + 1}`,
                            type: 'text',
                            style: 'default',
                            code: '',
                        }
                        // 保存新小部件并更新界面
                        sidebar.widgets.push(newWidget);
                        await this.saveSingleSidebarSettings(sidebar);
                        this.refreshWidgetList(sidebarKey); // 刷新小部件列表显示
                        // 打开编辑模态框
                        this.editModal.setData(
                            newWidget,
                            (widget) => this.saveWidgetConfig(widget, sidebarKey, sidebar.widgets.length - 1))
                        this.editModal.open();
                    })
            );
        })
    }
    /**
     * 刷新小部件列表显示
     * 清空并重新生成所有小部件的列表项
     */
    private refreshWidgetList(sidebarKey:string): void {
        const container = this.widgetListContainers[sidebarKey];
        if (container) {
            // 清空现有的小部件列表内容
            container.empty();
            const sidebar = sidebarsStore.getState()[sidebarKey];
            // 遍历所有小部件配置，为每个小部件创建列表项
            sidebar.widgets.forEach((widget, index)=>{
                this.addWidgetListItem(widget, index, sidebarKey);
            });
        }
    }
    /**
     * 添加单个小部件的列表项
     * @param widget 小部件配置对象
     * @param index 小部件在列表中的索引
     */
    private addWidgetListItem(widget: WidgetConfig, index:number, sidebarKey: string): void {
        if (!this.widgetListContainers[sidebarKey]) return;

        // 创建小部件项的容器元素
        const widgetContainer = this.widgetListContainers[sidebarKey].createEl('div', { cls: 'dms-widget-item-setting' });

        // 添加小部件标题显示
        widgetContainer?.createEl('span', { text: widget.title });

        // 添加控制按钮组
        // 1. 向上移动按钮：第一个项目禁用
        new ButtonComponent(widgetContainer)
            .setIcon('up-chevron-glyph')
            .setTooltip(getLang('move_up_button_title', '向上移动小挂件'))
            .setDisabled(index === 0)
            .onClick(() => this.moveWidgetUp(sidebarKey, index));

        // 2. 向下移动按钮：最后一个项目禁用
        new ButtonComponent(widgetContainer)
            .setIcon('down-chevron-glyph')
            .setTooltip(getLang('move_down_button_title', '向下移动小挂件'))
            .setDisabled(index === sidebarsStore.getState()[sidebarKey].widgets.length - 1)
            .onClick(() => this.moveWidgetDown(sidebarKey, index));

        // 3. 编辑按钮：打开编辑模态框
        new ButtonComponent(widgetContainer)
           .setIcon('edit')
           .setTooltip(getLang('edit_widget_button_title', '编辑小挂件'))
           .onClick(() => this.editWidget(sidebarKey, index));

        // 4. 删除按钮：移除当前小部件
        new ButtonComponent(widgetContainer)
            .setIcon('trash')
            .setWarning()
            .setTooltip(getLang('delete_widget_button_title', '删除小挂件'))
            .onClick(() => this.deleteWidget(sidebarKey, index));
    }
    /**
     * 向上移动指定索引位置的小部件
     * @param index 要移动的小部件索引
     */
    private async moveWidgetUp(sidebarKey:string, index: number): Promise<void> {
        const sidebar = sidebarsStore.getState()[sidebarKey];
        // 使用解构赋值交换当前小部件与上一个小部件的位置
        [sidebar.widgets[index], sidebar.widgets[index - 1]] = [
            sidebar.widgets[index - 1],
            sidebar.widgets[index],
        ];
        // 保存新的小部件配置
        await this.saveSingleSidebarSettings(sidebar);
        // 刷新小部件列表显示
        this.refreshWidgetList(sidebarKey);
    }

    /**
     * 向下移动指定索引位置的小部件
     * @param index 要移动的小部件索引
     */
    private async moveWidgetDown(sidebarKey:string, index: number): Promise<void> {
        const sidebar = sidebarsStore.getState()[sidebarKey];
        // 使用解构赋值交换当前小部件与下一个小部件的位置
        [sidebar.widgets[index], sidebar.widgets[index + 1]] = [
            sidebar.widgets[index + 1],
            sidebar.widgets[index],
        ];
        // 保存新的小部件配置
        await this.saveSingleSidebarSettings(sidebar);
        // 刷新小部件列表显示
        this.refreshWidgetList(sidebarKey);
    }

    /**
     * 编辑指定索引位置的小部件
     * @param index 要编辑的小部件索引
     */
    private editWidget(sidebarKey:string, index: number): void {
        // 设置编辑模态框的数据和保存回调函数
        this.editModal.setData(
            sidebarsStore.getState()[sidebarKey].widgets[index],
            (widget) => this.saveWidgetConfig(widget, sidebarKey, index)
        );
        // 打开编辑模态框
        this.editModal.open();
    }
    /**
     * 删除指定索引位置的小部件
     * @param index 要删除的小部件索引
     */
    private async deleteWidget(sidebarKey:string, index: number): Promise<void> {
        // 显示确认对话框
        const confirmed = await confirm(getLang('delete_widget_button_title_confirm', '确认删除此小挂件？'));
        if (!confirmed) return;
        const sidebar = sidebarsStore.getState()[sidebarKey];
        // 从小部件数组中移除指定索引的小部件
        sidebar.widgets.splice(index, 1);
        await this.saveSingleSidebarSettings(sidebar);
        // 刷新小部件列表显示
        this.refreshWidgetList(sidebarKey);
    }

    /**
     * 保存小部件配置到指定索引位置
     * @param widget 小部件配置对象
     * @param index 要保存的位置索引
     */
    private async saveWidgetConfig(widget: WidgetConfig, sidebarKey:string, index: number): Promise<void> {
        const sidebar = sidebarsStore.getState()[sidebarKey];
        sidebar.widgets[index] = widget; // 更新指定索引的小部件配置
        await this.saveSingleSidebarSettings(sidebar);
        // 刷新小部件列表显示
        this.refreshWidgetList(sidebarKey);
    }
    /**
     * 保存设置数据到全局或侧边栏状态，并写入配置文件
     * @param data 要保存的数据对象
     * @param type 保存类型，默认为'all'，可选'global'或'sidebars'
     */
    private async saveSettings(data: any, type: string = 'all'): Promise<void> {
        // 根据 type 更新对应的 store 状态
        if (type === 'all') {
            // 更新全局和侧边栏状态
            globalStore.updateState(data.global);
            sidebarsStore.updateState(data.sidebars);
        }
        if (type === 'global') {
            // 仅更新全局状态
            globalStore.updateState(data);
        }
        if (type === 'sidebars') {
            // 仅更新侧边栏状态
            sidebarsStore.updateState(data);
        }
        // 构造配置文件对象 [tag]: [note content]
        const settings: WidgetSidebarSettings_2 = {
            configVersion: 2,
            global: globalStore.getState(),
            sidebars: sidebarsStore.getState(),
        }
        // 保存配置到插件数据文件
        this.plugin.saveData(settings);
    }
    /**
     * 保存单个侧边栏的小部件配置。
     *
     * 此方法会创建一个仅包含所提供侧边栏的新配置对象，然后持久化该配置并相应更新界面。
     *
     * @param sidebar - 要保存的侧边栏配置对象。
     * @returns 返回一个 Promise，在设置保存完成后 resolve。
     */
    private async saveSingleSidebarSettings(sidebar: SidebarConfig|undefined, key?:string): Promise<void> {
        // 如果未提供 key，则使用侧边栏的 viewType 作为键
        if (!key) {
            key = sidebar?.viewType;
        }
        if (!key) {
            console.error('Key is required to save sidebar settings');
            return;
        }
        // 创建新的小部件侧边栏配置
        const sidebarConfig:WidgetSidebarsConfig|{ [key:string]: undefined } = {}
        sidebarConfig[key] = sidebar;
        // 保存新小部件并更新界面
        await this.saveSettings(sidebarConfig, 'sidebars');
    }
}