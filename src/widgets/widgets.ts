// 第三方库导入
import { App, ItemView, MarkdownRenderer, Component } from "obsidian";
// 组件基类导入
import { WidgetComponent } from "../components/widgetComponent";
// 类型定义导入
import { WidgetConfig } from '../types';

// 组件导入
import { Codeblock } from './Codeblock';
import { Header } from './Header';
import { DigitalClock } from './DigitalClock';
import { Markdown } from './Markdown';
import { TimeProgress } from './TimeProgress';
import { WeekCalendar } from './WeekCalendar';
import { MonthCalendar } from './MonthCalendar';
import { CountdownDay } from './CountdownDay';
import { Image } from './Image';
import { QuickNav } from './QuickNav';
import { YearPoints } from './YearPoints';
import { FileStats } from './FileStats';
import { WorkingTimeProgress } from './WorkingTimeProgress';
import { RandomNotes } from './RandomNotes';
import { BatteryStatus } from './BatteryStatus';
import { DailyEventRecord } from './DailyEventRecord';
// import { CountdownTimer } from './CountdownTimer';

// 定义渲染函数的类型接口
type Render = {
    [key: string]: typeof WidgetComponent;
}

// 渲染函数映射表
const render: Render = {
    'header_1': Header,
    'header_3': Header,
    'digital_clock': DigitalClock,
    'time_progress': TimeProgress,
    'week_calendar': WeekCalendar,
    'month_calendar': MonthCalendar,
    'countdown_day': CountdownDay,
    'text': Markdown,
    'image': Image,
    'quick_nav': QuickNav,
    'year_points': YearPoints,
    'file_stats': FileStats,
    'working_time_progress': WorkingTimeProgress,
    'random_notes': RandomNotes,
    'battery_status': BatteryStatus,
    'daily_event_record': DailyEventRecord,
    // 'countdown_timer': CountdownTimer,
}
// 导出组件类型
export const widgetTypes = Object.keys(render);

/**
 * 根据指定的组件类型创建并返回对应的组件实例
 * @param container - 用于承载组件的HTML容器元素
 * @param widget - 组件的配置信息
 * @param app - Obsidian应用实例
 * @returns 返回创建的组件实例，如果找不到对应类型则返回默认的Codeblock组件
 */
export const getWidgetComponent = (
    container: HTMLElement,
    widget: WidgetConfig,
    app: App
):WidgetComponent => {
    // 根据type在render映射表中查找对应的组件类，如果未找到则使用默认的Codeblock组件
    return new (render[widget.type] || Codeblock)(container, widget, app);
}