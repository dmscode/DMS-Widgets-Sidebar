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
    // Widgets Types
    widget_type_header_1: 'Big title',
    widget_type_header_1_desc: 'Render a big title',
    widget_type_header_3: 'Sub title',
    widget_type_header_3_desc: 'Render a sub title',
    widget_type_custom: 'Custom',
    widget_type_custom_desc: 'Render a code block, the type of the code block is determined by the custom type',
};