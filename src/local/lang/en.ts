export const en =  {
    // main.ts
    ribbon_button_title: 'Widget sidebar',
    cannot_create_leaf: 'Could not create a new Sidebar',
    // sidebar.ts
    view_title: 'Widget sidebar',
    // setting.ts
    widget_style_title: 'Widget Style',
    widget_style_selector_title: 'Choice Widget Style',
    widget_style_selector_desc: 'This only includes some basic style settings. For complex effects, it is recommended to implement them through CSS snippets. `none` means no additional styles (allowing complete customization).',
    widget_list_title: 'Widget List',
    add_widget_button_title: 'Add Widget',
    move_up_button_title: 'Move Up',
    move_down_button_title: 'Move Down',
    edit_widget_button_title: 'Edit Widget',
    delete_widget_button_title: 'Delete Widget',
    delete_widget_button_title_confirm: 'Are you sure you want to delete this widget?',

    // Edit Widget Modal
    edit_widget_modal_title: 'Edit Widget',
    edit_widget_modal_widget_title: 'Widget Name',
    edit_widget_modal_widget_title_desc: 'The widget name is only used to distinguish widgets in settings.',
    edit_widget_modal_widget_title_placeholder: 'Enter widget name...',
    edit_widget_modal_widget_style: 'Widget Style',
    edit_widget_modal_widget_style_desc: 'Choose the style for this widget. "none" means no additional styles. "default" inherits global sidebar style settings.',
    edit_widget_modal_widget_custom_style: 'Custom Style',
    edit_widget_modal_widget_custom_style_desc: 'Enter a custom style for the widget. This will only take effect when the style is set to "custom".',
    edit_widget_modal_widget_custom_style_placeholder: 'Enter custom style...',
    edit_widget_modal_widget_type: 'Widget Type',
    edit_widget_modal_widget_type_desc: 'The widget type determines the specific rendering method. Please refer to the plugin documentation for supported types. For unlisted types, the type will be treated as a code language and the widget code will be rendered as a code block. (This method can be used to invoke other plugins for rendering, such as using the dataviewjs type to render Dataview views)',
    edit_widget_modal_widget_type_placeholder: 'Enter widget type...',
    edit_widget_modal_widget_custom_type: 'Custom Type',
    edit_widget_modal_widget_custom_type_desc: 'The custom type is used to render code blocks that are not supported by the built-in types. Please enter the type of the code block you want to render here.',
    edit_widget_modal_widget_custom_type_placeholder: 'Enter custom type...',
    edit_widget_modal_widget_code: 'Widget Code',
    edit_widget_modal_widget_code_desc: 'The specific code for the widget. The writing format varies depending on the specific type, please refer to the plugin documentation for details. If using third-party plugins to render code blocks, you only need to write the specific code within the code block here.',
    edit_widget_modal_widget_code_placeholder: 'Enter widget code...',
    edit_widget_modal_save_button_title: 'Save',
    edit_widget_modal_cancel_button_title: 'Cancel',
    // Default Settings
    default_widget_header_1_title: 'Big title',
    default_widget_digital_clcok_title: 'Digital Clock',
    default_widget_time_progress_title: 'Time Progress',
    default_widget_week_calendar_title: 'Week Calendar',
    default_widget_donate_title: 'Coffee time~',
    default_widget_donate_content: '[Pls buy me a cup of coffee~☕](https://afdian.com/a/daomishu)',
    // Widgets Types
    // Header
    widget_type_header_1: 'Big title',
    widget_type_header_1_desc: 'Render a big title',
    widget_type_header_3: 'Sub title',
    widget_type_header_3_desc: 'Render a sub title',
    // Digital Clock
    widget_type_digital_clock: 'Digital Clock',
    widget_type_digital_clock_desc: 'Render a digital clock',
    // TimeProgress
    widget_type_time_progress: 'Time Progress',
    widget_type_time_progress_desc: 'Render a time progress bar',
    // Week Calendar
    widget_type_week_calendar: 'Week Calendar',
    widget_type_week_calendar_desc: 'Render a weekly calendar view',
    // Month Calendar
    widget_type_month_calendar: 'Month Calendar',
    widget_type_month_calendar_desc: 'Render a monthly calendar view',
    // Custom
    widget_type_custom: 'Custom',
    widget_type_custom_desc: 'Render a code block, the type of the code block is determined by the custom type',
    // Countdown Day
    widget_type_countdown_day: 'Countdown Day',
    widget_type_countdown_day_desc: 'Display days remaining until or passed since a specific date',
    // Countdown Day Widget Text
    countdown_unnamed_event: 'Unnamed Event',
    countdown_future_prefix: 'Until ',
    countdown_future_suffix: '',
    countdown_today_prefix: 'Today is ',
    countdown_today_suffix: '',
    countdown_today: 'Today',
    countdown_past_prefix: '',
    countdown_past_suffix: ' has passed for',
    countdown_day_singular: 'day',
    countdown_day_plural: 'days',
    // Image
    widget_type_image: 'Image',
    widget_type_image_desc: 'Render an image',
    // Quick Nav
    widget_type_quick_nav: 'Quick Nav',
    widget_type_quick_nav_desc: 'Render a quick navigation bar, each item is a link. You can find detailed usage instructions in the plugin documentation.',
    // Year Points
    widget_type_year_points: 'Year Points',
    widget_type_year_points_desc: 'Render a year progress bar',
    // Text
    widget_type_text: 'Text',
    widget_type_text_desc: 'Render text as markdown',
    // File Stats
    widget_type_file_stats: 'File Stats',
    widget_type_file_stats_desc: 'Display statistics of different file types in the Vault, code can include content to exclude, one item per line. If a note path starts with any item content, that note will be excluded',
    // Working Time Progress
    widget_type_working_time_progress: 'Working Time Progress',
    widget_type_working_time_progress_desc: 'Display the progress of working time in a day',
    // Working Time Progress Widget Text
    working_time_progress_working: 'Working',
    working_time_progress_resting: 'Resting',
    working_time_progress_working_is_remaining: 'remaining',
    working_time_progress_hour: 'hour(s)',
    working_time_progress_minute: 'minute(s)',
    // Random Notes
    widget_type_random_notes: 'Random Notes',
    widget_type_random_notes_desc: 'Display random notes from the Vault, code can include content to exclude, one item per line. If a note path starts with any item content, that note will be excluded',
    // Random Notes Widget Text
    random_notes_title: 'Random Notes',
    random_notes_refresh_tooltip: 'Refresh Random Notes',
    // Battery Status
    widget_type_battery_status: 'Battery Status',
    widget_type_battery_status_desc: 'Display device battery level and charging status',
    // Daily Event Record
    widget_type_daily_event_record: 'Daily Event Record',
    widget_type_daily_event_record_desc: 'Record and display daily event completion times',
    daily_event_record_default_title: 'Daily Event Record',
    daily_event_record_no_note: 'Please specify a note in the configuration',
    daily_event_record_load_error: 'Failed to load record data',
    daily_event_record_today_title: 'Today\'s Records',
    daily_event_record_no_records: 'No records',
    daily_event_record_add_button: 'Add Record',
    daily_event_record_add_button_confirm: 'Are you sure you want to add this record?',
    daily_event_record_add_error: 'Failed to add record',
    daily_event_record_edit_tooltip: 'Edit Record',
    daily_event_record_delete_tooltip: 'Delete Record',
    daily_event_record_edit_prompt: 'Please enter a new time (HH:mm)',
    daily_event_record_invalid_time: 'Invalid time format, please use HH:mm format',
    daily_event_record_edit_success: 'Record updated',
    daily_event_record_edit_error: 'Failed to edit record',
    daily_event_record_delete_confirm: 'Are you sure you want to delete this record?',
    daily_event_record_delete_success: 'Record deleted',
    daily_event_record_delete_error: 'Failed to delete record',
    daily_event_record_modal_save_button_title: 'Save',
    // 倒计时挂件
    countdown_timer_title: 'Countdown Timer',
    countdown_timer_desc: 'A countdown timer widget that can be set in minutes',
};