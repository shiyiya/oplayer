export declare type SubtitleSource = {
    default?: boolean;
    name?: string;
    src: string;
    encoding?: string;
    type?: string;
};
export declare type Subtitle = {
    source: SubtitleSource[];
    fontSize?: number;
    enabled?: boolean;
    bottom?: string;
    color?: string;
};
export declare type MenuBar<T = {
    name: string;
    default?: boolean;
    value?: any;
}> = {
    name?: string;
    icon?: string;
    children: T[];
    onChange: (arg: T) => void;
    onClick: () => void;
};
export declare type Setting<T = any> = {
    name: string;
    key?: string;
    /**
     * selector 切换下个面板单选 1 ｜ 2 ｜ 3
     * switcher  当前面板切换 true or false
     */
    type: 'selector' | 'switcher';
    icon?: string;
    children?: Setting[];
    onChange?: (a: T, b?: {
        index: number;
    }) => void | Promise<void>;
    default?: any;
    value?: T;
};
export declare type Thumbnails = {
    src: string;
    number: number;
    width?: number;
    height?: number;
    isVTT?: boolean;
};
export declare type Highlight = {
    text: string;
    time: number;
};
export declare type UiConfig = {
    theme?: {
        primaryColor: `#${string}`;
    };
    /**
     * default: false
     */
    autoFocus?: boolean;
    /**
     * default: true
     */
    hotkey?: boolean;
    /**
     * default: ['2.0', '1.75', '1.25', '1.0', '0.75', '0.5']
     */
    speed?: string[];
    /**
     * default: false
     */
    screenshot?: boolean;
    /**
     * default: true
     */
    fullscreen?: boolean;
    /**
     * default: true
     */
    pictureInPicture?: boolean;
    /**
     * default: true
     */
    miniProgressBar?: boolean;
    subtitle?: Subtitle;
    settings?: Setting[];
    thumbnails?: Thumbnails;
    highlight?: Highlight[];
    menu?: MenuBar[];
    contextmenu?: [];
    airplay?: boolean;
};
//# sourceMappingURL=types.d.ts.map