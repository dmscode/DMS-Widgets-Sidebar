import { App, ItemView, normalizePath } from "obsidian";
import { WidgetConfig } from "../types";

const getImgUrl = (url: string, app: App) => {
    url = url.trim();
    if (url.startsWith('http')) {
        return url;
    }
    const normalizedPath = normalizePath(url);
    const resourceUri = app.vault.adapter.getResourcePath(normalizedPath);
    return resourceUri;
}

export function renderImage (
    this: {
        widget: WidgetConfig;
        view: ItemView;
        container: HTMLElement;
        app: App;
    }) {
        this.container.createEl('img', {
            attr: {
                src: getImgUrl(this.widget.code, this.app),
            }
        })
}