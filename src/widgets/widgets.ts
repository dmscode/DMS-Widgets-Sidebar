// 第三方库导入
import { App, ItemView, MarkdownRenderer } from "obsidian";

// 类型定义导入
import { WidgetConfig } from '../types';

// 组件导入
import { renderHeader } from './Header';
import { renderDigitalClock } from './DigitalClock';
import { renderText } from './Markdown';
import { renderTimeProgress } from './TimeProgress';
import { renderWeekCalendar } from './WeekCalendar';
import { renderMonthCalendar } from './MonthCalendar';
import { renderCountdownDay } from './CountdownDay';
import { renderImage } from './Image';
import { renderQuickNav } from './QuickNav';
import { renderYearPoints } from './YearPoints';
import { renderFileStats } from './FileStats';
import { renderWorkingTimeProgress } from './WorkingTimeProgress';
import { renderRandomNotes } from './RandomNotes';
import { renderBatteryStatus } from './BatteryStatus';
import { renderCountdownTimer } from './CountdownTimer';

// 定义渲染函数的类型接口
type Render = {
    [key: string]: () => void;
}

// 渲染函数映射表
const render: Render = {
    'header_1': renderHeader,
    'header_3': renderHeader,
    'digital_clock': renderDigitalClock,
    'time_progress': renderTimeProgress,
    'week_calendar': renderWeekCalendar,
    'month_calendar': renderMonthCalendar,
    'countdown_day': renderCountdownDay,
    'text': renderText,
    'image': renderImage,
    'quick_nav': renderQuickNav,
    'year_points': renderYearPoints,
    'file_stats': renderFileStats,
    'working_time_progress': renderWorkingTimeProgress,
    'random_notes': renderRandomNotes,
    'battery_status': renderBatteryStatus,
    // 'countdown_timer': renderCountdownTimer,
}

// Widget 类：用于处理和渲染不同类型的小部件
export class Widget {
    widget: WidgetConfig;
    view: ItemView;
    container: HTMLElement;
    app: App;
    render: Render = {};

    constructor (
        container: HTMLElement,
        widget: WidgetConfig,
        view: ItemView,
    ){
        // 初始化基本属性
        this.container = container;
        this.widget = widget;
        this.view = view;
        this.app = view.app;

        // 绑定所有渲染函数到当前实例
        Object.keys(render).forEach((key) => {
            this.render[key] = render[key].bind(this);
        });

        // 根据小部件类型选择对应的渲染方法
        if (this.render[this.widget.type]) {
            this.render[this.widget.type]();
        }else {
            this.defaultRender();
        }
    }

    // 默认渲染方法：将代码渲染为 Markdown 代码块
    async defaultRender() {
        const codeblock = '```'+this.widget.type+'\n'+this.widget.code+'\n```';
        await MarkdownRenderer.render(this.app, codeblock, this.container, '', this.view);
    }

    // 获取所有支持的小部件类型
    static getTypes() {
        return Object.keys(render);
    }
}