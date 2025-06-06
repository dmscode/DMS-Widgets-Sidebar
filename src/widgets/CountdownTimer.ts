import { App, setIcon } from "obsidian";
import { timerStore } from "src/store";
import { ProgressWidgetComponent } from "../components/widgetComponent";
import { WidgetConfig, voidFunc } from "../types";
import { getLang } from "../local/lang";

/**
 * 解析时间字符串为总秒数。
 * 支持格式: 03, 01:06, 01:02:03。
 * @param str 时间字符串
 * @returns 总秒数
 */
const parseTimeString = (str: string): number => {
    // 按冒号分割字符串，去除每部分的空白
    // 从右向左遍历，每一部分乘以60的幂次累加为总秒数
    const parts = str.split(":").map(s => s.trim()).map(Number);
    let total = 0;
    for (let i = 0; i < parts.length; i++) {
        total += parts[parts.length - 1 - i] * Math.pow(60, i);
    }
    return isNaN(total) ? 0 : total;
}
/**
 * 将数字补齐为两位字符串。
 * @param num 需要补齐的数字
 * @returns 补齐后的字符串，至少两位
 * 步骤：
 * 1. 将数字转为字符串。
 * 2. 若长度不足2位，则在前面补0。
 */
const dbNum = (num: number): string => String(num).padStart(2, "0");

/**
 * 将秒数格式化为字符串，格式为 "HH:MM:SS" 或 "MM:SS"。
 * 如果小时数大于0，则返回 "HH:MM:SS" 格式，否则返回 "MM:SS" 格式。
 * 
 * @param sec - 需要格式化的秒数
 * @returns 格式化后的时间字符串
 */
const formatTime = (sec: number): string => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${dbNum(h)}:${dbNum(m)}:${dbNum(s)}`;
  else return `${dbNum(m)}:${dbNum(s)}`;
}

export class CountdownTimer extends ProgressWidgetComponent {
    private timer: voidFunc | null = null;
    private running = false;
    private remaining = 0;
    private initial = 0;
    private displayEl: HTMLElement;
    private startPauseBtn: HTMLDivElement;
    private resetBtn: HTMLDivElement;
    private presetContainer: HTMLElement;
    private presets: number[] = [];

    constructor(
        container: HTMLElement,
        widget: WidgetConfig,
        app: App,
    ) {
        super(container, widget, app);
        this.getConfig();
    }

    /**
     * @private
     * 解析并设置倒计时预设时间。
     * 
     * 此方法会根据 `this.widget.code` 的内容，将每一行解析为秒数，并过滤掉非正数的结果，最终生成 `this.presets` 数组。
     * 如果未能解析出任何有效的预设时间，则会使用默认的预设时间（60, 180, 300 秒，分别对应 1、3、5 分钟）。
     * 
     * 依赖外部的 `parseTimeString` 方法将字符串转换为秒数。
     */
    private getConfig() {
        // 解析预设
        this.presets = [];
        if (this.widget.code) {
            this.presets = this.widget.code
                .split("\n")
                .map(line => parseTimeString(line.trim()))
                .filter(sec => sec > 0);
        }
        if (this.presets.length === 0) this.presets = [60, 180, 300]; // 默认1,3,5分钟
    }

    private freshTimer() {
        if (this.remaining > 0) {
            this.remaining--;
            this.updateDisplay();
            if (this.remaining === 0) {
                this.stopTimer();
                this.beep(); // 倒计时结束时发出提示音
            }
        }
    }
    private updateDisplay() {
        this.displayEl.setText(formatTime(this.remaining));
        this.container.dataset.status = this.running ? "running" : "paused";
        /**
         * 计算倒计时进度百分比。
         *
         * - 当计时器未运行且剩余时间等于初始时间时，进度为 0。
         * - 否则，进度为剩余时间与初始时间的百分比。
         *
         * @remarks
         * 该变量用于表示倒计时的当前进度百分比（0 到 100 之间）。
         *
         * @example
         * // 初始时间为 100，剩余时间为 50
         * // progress = (50 / 100) * 100 = 50
         */
        const progress = !this.running && this.remaining === this.initial ? 0 : (this.remaining / this.initial) * 100;
        this.setProgress(progress);
    }

    private startTimer() {
        if (this.running || this.remaining <= 0) return;
        this.running = true;
        this.updateDisplay();
        setIcon(this.startPauseBtn, "pause");
        setIcon(this.resetBtn, "square");
        this.timer = timerStore.subscribe('second', this.freshTimer.bind(this));
    }

    private pauseTimer() {
        if (!this.running) return;
        this.running = false;
        this.updateDisplay();
        setIcon(this.startPauseBtn, "play");
        setIcon(this.resetBtn, "reset");
        if (this.timer) {
            this.timer();
            this.timer = null;
        }
    }

    private stopTimer() {
        this.pauseTimer();
        this.remaining = 0;
        this.updateDisplay();
    }

    private resetTimer() {
        this.pauseTimer();
        this.remaining = this.initial;
        this.updateDisplay();
    }

    private setTimer(sec: number) {
        this.pauseTimer();
        this.initial = sec;
        this.remaining = sec;
        this.updateDisplay();
    }

    private beep() {
        // 播放提示音
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        
        // 配置声音
        osc.type = 'sine';       // 音色：sine(正弦波)/square(方波)
        osc.frequency.value = 440; // 频率(Hz)，A4标准音高
        
        // 连接并播放
        osc.connect(ctx.destination);
        osc.start();
        
        // 0.5秒后停止
        setTimeout(() => osc.stop(), 500);
    }

    onload(): void {
        // 默认选第一个
        this.initial = this.presets[0];
        this.remaining = this.initial;

        // 剩余时间显示
        this.displayEl = this.container.createDiv({ cls: "dms-sidebar-countdown-timer-display" });
        this.updateDisplay();

        // 按钮行
        const btnRow = this.container.createDiv({ cls: "dms-sidebar-countdown-timer-btn-row" });
        this.startPauseBtn = btnRow.createEl("div", { cls: "dms-sidebar-countdown-timer-btn" });
        setIcon(this.startPauseBtn, "play");
        this.resetBtn = btnRow.createEl("div", { cls: "dms-sidebar-countdown-timer-btn" });
        setIcon(this.resetBtn, "reset");

        this.startPauseBtn.onclick = () => {
            if (this.running) this.pauseTimer();
            else this.startTimer();
        };
        this.resetBtn.onclick = () => this.resetTimer();

        // 预设行
        this.presetContainer = this.container.createDiv({ cls: "dms-sidebar-countdown-timer-presets" });
        this.presets.forEach((sec, i) => {
            const btn = this.presetContainer.createEl("div", { cls: "dms-sidebar-countdown-timer-preset-btn" });
            if(sec === this.initial) {
                btn.classList.add("dms-sidebar-countdown-timer-preset-current");
            }
            btn.setText(formatTime(sec));
            btn.onclick = () => {
                this.presetContainer.querySelectorAll(".dms-sidebar-countdown-timer-preset-current").forEach(b => {
                    b.classList.remove("dms-sidebar-countdown-timer-preset-current");
                })
                btn.classList.add("dms-sidebar-countdown-timer-preset-current");
                this.setTimer(sec);
            }
        });
    }

    onunload(): void {
        this.pauseTimer();
    }
}
