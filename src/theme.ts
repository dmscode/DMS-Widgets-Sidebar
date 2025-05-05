import { widgetTypes } from "./widgets/widgets";
/**
 * 全局主题
 * 具备所有插件样式的主题。
 */
const globalTheme:string[] = [
    'card',
]
/**
 * 挂件样式
 * 挂件可以选用的样式
 */
const widgetStyle:{
    [ke:string]: string[]
} = {
    header_1: [ 'test' ]
}
/**
 * 样式与挂件的对应关系
 * 主题拥有哪些挂件的样式？
 */
const styleForWidget:{
    [ke:string]: string[]
} = {
    "abc": ['header_1', 'header_3']
}
// 将样式与挂件的对应关系转换为挂件名称与样式的对应关系
Object.keys(styleForWidget).forEach(key => {
    const widgets = styleForWidget[key]
    widgets.forEach(widget => {
        if(!widgetStyle[widget]) {
            widgetStyle[widget] = []
        }
        widgetStyle[widget].push(key)
    })
})

const ArrayToObject = (arr: string[]) => {
    return arr.reduce((obj, item) => {
        obj[item] = item;
        return obj;
    }, {} as Record<string, string>);
}

const getWidgetStyleList = (type: string) => {
    return ArrayToObject(
        ['default'].concat(globalTheme, widgetStyle[type] || [], ['custom', 'none'])
    )
}
export const ThemeList = ArrayToObject(globalTheme.concat(['none']))
export const widgetStyleList = widgetTypes.reduce((obj, type) => {
    obj[type] = getWidgetStyleList(type)
    return obj
}, {} as Record<string, Record<string, string>>)