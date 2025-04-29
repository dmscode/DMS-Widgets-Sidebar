export const en =  {
    // main.ts
    ribbon_button_title: 'Widget Sidebar',
    cannot_create_leaf: 'Could not create a new Sidebar',
    // sidebar.ts
    view_title: 'Widget Sidebar',
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
};