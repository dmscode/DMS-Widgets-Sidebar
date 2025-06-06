export const zh = {
  // components\simpleEditModal.ts
  simple_edit_modal_save_button_title: '保存',
  // main.ts
  ribbon_button_title: '打开默认挂件侧边栏',
  cannot_create_leaf: '无法创建新的侧边栏',
  command_active_sidebar: '激活挂件侧边栏',
  // command_active_sidebar: '激活侧边栏',  // 重复
  // settings\defaultSettings.ts
  default_widget_header_1_title: '大标题',
  default_widget_digital_clcok_title: '数字时钟',
  default_widget_week_calendar_title: '周历',
  default_widget_time_progress_title: '时间进度',
  default_widget_donate_title: '咖啡时间~',
  default_widget_donate_content: '[请给我买杯咖啡~☕](https://afdian.com/a/daomishu)',
  // settings\updateConfig.ts
  default_view_title: '默认挂件侧边栏',
  // settings\widgetEditModal.ts
  edit_widget_modal_title: '编辑挂件',
  edit_widget_modal_widget_type_desc: '挂件类型决定了具体的渲染方式。请参考插件文档了解支持的类型。对于未列出的类型，该类型将被视为代码语言，挂件代码将被渲染为代码块。（这种方法可以用来调用其他插件进行渲染，例如使用dataviewjs类型来渲染Dataview视图）',
  edit_widget_modal_widget_title: '挂件名称',
  edit_widget_modal_widget_title_desc: '挂件名称仅用于在设置中区分不同的挂件。',
  edit_widget_modal_widget_title_placeholder: '请输入挂件名称...',
  edit_widget_modal_widget_type: '挂件类型',
  edit_widget_modal_widget_custom_type: '自定义类型',
  edit_widget_modal_widget_custom_type_desc: '自定义类型用于渲染内置类型不支持的代码块。请在此处输入要渲染的代码块类型。',
  edit_widget_modal_widget_custom_type_placeholder: '请输入自定义类型...',
  edit_widget_modal_widget_style: '挂件样式',
  edit_widget_modal_widget_style_desc: '选择挂件的样式。"none"表示不使用额外样式。"default"继承全局侧边栏样式设置。',
  edit_widget_modal_widget_custom_style: '自定义样式',
  edit_widget_modal_widget_custom_style_desc: '为挂件添加自定义CSS样式。此设置仅在样式选择为"custom"时生效。',
  edit_widget_modal_widget_custom_style_placeholder: '请输入自定义CSS样式...',
  edit_widget_modal_widget_code: '挂件代码',
  edit_widget_modal_widget_code_desc: '挂件的具体代码。编写格式根据具体类型而变化，请参考插件文档了解详情。如果使用第三方插件渲染代码块，您只需在此处编写代码块内的具体代码即可。',
  edit_widget_modal_widget_code_placeholder: '请输入挂件代码...',
  // settings.ts
  widget_style_title: '挂件样式',
  widget_style_selector_title: '选择挂件样式',
  widget_style_selector_desc: '这里只包含一些基础样式设置。对于复杂效果，建议通过CSS片段实现。`none`表示不使用额外样式（允许完全自定义）。',
  sidebar_list_title: '挂件边栏列表',
  add_sidebar_button_title: '添加侧边栏',
  new_view_title: '新挂件侧边栏',
  sidebar_edit_button_tooltip: '编辑侧边栏',
  sidebar_delete_button_tooltip: '删除侧边栏',
  delete_default_sidebar_notice: '无法删除默认侧边栏！',
  delete_sidebar_button_confirm: '确认删除该侧边栏？',
  add_widget_button_title: '添加挂件',
  move_up_button_title: '上移',
  move_down_button_title: '下移',
  edit_widget_button_title: '编辑挂件',
  delete_widget_button_title: '删除挂件',
  delete_widget_button_title_confirm: '确认删除该挂件？',
  // Widget Types
  // header_1
  widget_type_header_1: '大标题',
  widget_type_header_1_desc: '渲染一个大标题',
  // header_3
  widget_type_header_3: '小标题',
  widget_type_header_3_desc: '渲染一个小标题',
  // digital_clock
  widget_type_digital_clock: '数字时钟',
  widget_type_digital_clock_desc: '渲染一个数字时钟',
  // time_progress
  widget_type_time_progress: '时间进度',
  widget_type_time_progress_desc: '渲染一个时间进度条',
  // week_calendar
  widget_type_week_calendar: '周历',
  widget_type_week_calendar_desc: '渲染一个每周日历视图',
  // month_calendar
  widget_type_month_calendar: '月历',
  widget_type_month_calendar_desc: '渲染一个每月日历视图',
  // countdown_day
  widget_type_countdown_day: '倒数日',
  widget_type_countdown_day_desc: '显示距离特定日期还有多少天或已经过去多少天',
  // text
  widget_type_text: '文本',
  widget_type_text_desc: '以 Markdown 格式渲染文本',
  // image
  widget_type_image: '图片',
  widget_type_image_desc: '渲染一张图片',
  // quick_nav
  widget_type_quick_nav: '快速导航',
  widget_type_quick_nav_desc: '渲染一个快速导航栏，每个条目都是一个链接。您可以在插件文档中找到详细的使用说明。',
  // year_points
  widget_type_year_points: '年度点阵',
  widget_type_year_points_desc: '渲染一个年度点阵进度条，用于显示当前年份的进度',
  // file_stats
  widget_type_file_stats: '文件统计',
  widget_type_file_stats_desc: '显示仓库中不同类型文件的数量统计，code 可以包含要排除的内容，每行一个项目。如果笔记路径以任何项目内容开头，该笔记将被排除',
  // working_time_progress
  widget_type_working_time_progress: '工作时间进度',
  widget_type_working_time_progress_desc: '显示一天中的工作时间进度',
  // random_notes
  widget_type_random_notes: '随机笔记',
  widget_type_random_notes_desc: '显示仓库中的随机笔记，code 可以包含要排除的内容，每行一个项目。如果笔记路径以任何项目内容开头，该笔记将被排除',
  // battery_status
  widget_type_battery_status: '电池状态',
  widget_type_battery_status_desc: '显示设备电量和充电状态',
  // daily_event_record
  widget_type_daily_event_record: '日常事件记录',
  widget_type_daily_event_record_desc: '记录并显示日常事件完成时间',
  // countdown_timer
  widget_type_countdown_timer: '倒计时器',
  widget_type_countdown_timer_desc: '显示一个倒计时器，您可以设置倒计时时间。如果需要使用预设时间，请输入每行一个预设时间。如果未设置预设，将使用默认预设（1分钟、3分钟、5分钟）。',
  // widgets\CountdownDay.ts
  countdown_unnamed_event: '未命名事件',
  countdown_future_prefix: '距离 ',
  countdown_future_suffix: '',
  countdown_day_singular: '天',
  countdown_day_plural: '天',
  countdown_today_prefix: '今天是 ',
  countdown_today_suffix: '',
  countdown_today: '今天',
  countdown_past_prefix: '',
  countdown_past_suffix: ' 已经过去',
  // countdown_day_singular: '天',  // 重复
  // countdown_day_plural: '天',  // 重复
  // widgets\DailyEventRecord.ts
  daily_event_record_default_title: '日常事件记录',
  daily_event_record_no_note: '请在配置中指定笔记',
  daily_event_record_load_error: '加载记录数据失败',
  daily_event_record_today_title: '今日记录',
  daily_event_record_edit_tooltip: '编辑记录',
  daily_event_record_delete_tooltip: '删除记录',
  daily_event_record_no_records: '暂无记录',
  daily_event_record_add_button: '添加记录',
  daily_event_record_add_success: '记录已添加',
  daily_event_record_add_error: '添加记录失败',
  daily_event_record_edit_success: '记录已更新',
  daily_event_record_edit_error: '编辑记录失败',
  daily_event_record_invalid_time: '时间格式无效，请使用 HH:mm 格式开头',
  daily_event_record_delete_confirm: '确定要删除此条记录吗？',
  daily_event_record_delete_success: '记录已删除',
  daily_event_record_delete_error: '删除记录失败',
  // widgets\RandomNotes.ts
  random_notes_title: '随机笔记',
  random_notes_refresh_tooltip: '刷新随机笔记',
  // widgets\WorkingTimeProgress.ts
  working_time_progress_minute: '分钟',
  working_time_progress_hour: '小时',
  // working_time_progress_minute: '分钟',  // 重复
  working_time_progress_working: '工作中',
  working_time_progress_resting: '休息中',
  working_time_progress_working_is_remaining: '剩余'
};