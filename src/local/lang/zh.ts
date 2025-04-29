export const zh = {
    // main.ts
    ribbon_button_title: '挂件侧边栏',
    cannot_create_leaf: '无法创建新的侧边栏',
    // sidebar.ts
    view_title: '挂件侧边栏',
    // setting.ts
    widget_style_title: '挂件样式',
    widget_style_selector_title: '选择挂件样式',
    widget_style_selector_desc: '这里只包含一些基础样式设置。对于复杂效果，建议通过CSS片段实现。`none`表示不使用额外样式（允许完全自定义）。',
    widget_list_title: '挂件列表',
    add_widget_button_title: '添加挂件',
    move_up_button_title: '上移',
    move_down_button_title: '下移',
    edit_widget_button_title: '编辑挂件',
    delete_widget_button_title: '删除挂件',
    delete_widget_button_title_confirm: '确认删除该挂件？',

    // Edit Widget Modal
    edit_widget_modal_title: '编辑挂件',
    edit_widget_modal_widget_title: '挂件名称',
    edit_widget_modal_widget_title_desc: '挂件名称仅用于在设置中区分不同的挂件。',
    edit_widget_modal_widget_title_placeholder: '请输入挂件名称...',
    edit_widget_modal_widget_type: '挂件类型',
    edit_widget_modal_widget_type_desc: '挂件类型决定了具体的渲染方式。请参考插件文档了解支持的类型。对于未列出的类型，该类型将被视为代码语言，挂件代码将被渲染为代码块。（这种方法可以用来调用其他插件进行渲染，例如使用dataviewjs类型来渲染Dataview视图）',
    edit_widget_modal_widget_type_placeholder: '请输入挂件类型...',
    edit_widget_modal_widget_custom_type: '自定义类型',
    edit_widget_modal_widget_custom_type_desc: '自定义类型用于渲染内置类型不支持的代码块。请在此处输入要渲染的代码块类型。',
    edit_widget_modal_widget_custom_type_placeholder: '请输入自定义类型...',
    edit_widget_modal_widget_code: '挂件代码',
    edit_widget_modal_widget_code_desc: '挂件的具体代码。编写格式根据具体类型而变化，请参考插件文档了解详情。如果使用第三方插件渲染代码块，您只需在此处编写代码块内的具体代码即可。',
    edit_widget_modal_widget_code_placeholder: '请输入挂件代码...',
    edit_widget_modal_save_button_title: '保存',
    edit_widget_modal_cancel_button_title: '取消',
    // Default Settings
    default_widget_header_1_title: '大标题',
    default_widget_digital_clcok_title: '数字时钟',
    default_widget_time_progress_title: '时间进度',
    default_widget_week_calendar_title: '周历',
    default_widget_donate_title: '咖啡时间~',
    default_widget_donate_content: '[请给我买杯咖啡~☕](https://afdian.com/a/daomishu)',
    // Widgets Types
    // Header
    widget_type_header_1: '大标题',
    widget_type_header_1_desc: '渲染一个大标题',
    widget_type_header_3: '小标题',
    widget_type_header_3_desc: '渲染一个小标题',
    // Digital Clock
    widget_type_digital_clock: '数字时钟',
    widget_type_digital_clock_desc: '渲染一个数字时钟',
    // TimeProgress
    widget_type_time_progress: '时间进度',
    widget_type_time_progress_desc: '渲染一个时间进度条',
    // Week Calendar
    widget_type_week_calendar: '周历',
    widget_type_week_calendar_desc: '渲染一个每周日历视图',
    // Month Calendar
    widget_type_month_calendar: '月历',
    widget_type_month_calendar_desc: '渲染一个每月日历视图',
    // Custom
    widget_type_custom: '自定义',
    widget_type_custom_desc: '渲染一个代码块，代码块的类型由自定义类型决定',
    // Countdown Day
    widget_type_countdown_day: '倒数日',
    widget_type_countdown_day_desc: '显示距离特定日期还有多少天或已经过去多少天',
    // Countdown Day Widget Text
    countdown_unnamed_event: '未命名事件',
    countdown_future_prefix: '距离 ',
    countdown_future_suffix: ' 还有',
    countdown_today_prefix: '今天是 ',
    countdown_today_suffix: '',
    countdown_today: '今天',
    countdown_past_prefix: '',
    countdown_past_suffix: ' 已经过去',
    countdown_day_singular: '天',
    countdown_day_plural: '天',
    // Image
    widget_type_image: '图片',
    widget_type_image_desc: '渲染一张图片',
    // Quick Nav
    widget_type_quick_nav: '快速导航',
    widget_type_quick_nav_desc: '渲染一个快速导航栏，每个条目都是一个链接。您可以在插件文档中找到详细的使用说明。',
    // Year Points
    widget_type_year_points: '年度点阵',
    widget_type_year_points_desc: '渲染一个年度点阵进度条，用于显示当前年份的进度',
    // Text
    widget_type_text: '文本',
    widget_type_text_desc: '以 Markdown 格式渲染文本',
    // File Stats
    widget_type_file_stats: '文件统计',
    widget_type_file_stats_desc: '显示仓库中不同类型文件的数量统计',
};