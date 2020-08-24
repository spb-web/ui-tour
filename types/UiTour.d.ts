import { Instance as PopperInstance } from '@popperjs/core';
import { BoxOverlay } from '@spb-web/box-overlay';
export interface TourPopperRender {
    root: Element;
    popper: PopperInstance;
}
export interface TourStepRenderParams<Steps extends TourStep<any>[], Step extends TourStep<any>> extends TourPopperRender {
    next: () => Promise<void>;
    prev: () => Promise<void>;
    stop: () => Promise<void>;
    isFirst: boolean;
    isLast: boolean;
    isFirstRender: boolean;
    data: Step['data'];
    steps: Steps;
    stepIndex: number;
    step: Step;
}
export declare type TourStepBefore<Steps extends TourStep<any>[], Step extends TourStep<any>> = (params: TourStepRenderParams<Steps, Step>) => Promise<boolean | void>;
export declare type TourStepRender<Steps extends TourStep<any>[], Step extends TourStep<any>> = (params: TourStepRenderParams<Steps, Step>) => void;
export interface TourStep<T> {
    /**
     * Вызывается для рендеринга или обновления попапа
     */
    render?: TourStepRender<TourStep<any>[], this>;
    /**
     * Вызывается перед переходм к текущему шагу
     */
    before?: TourStepBefore<TourStep<any>[], this>;
    /**
     * Вызывается перед переходм к следующему шагу
     */
    after?: TourStepBefore<TourStep<any>[], this>;
    /**
     * Список выделяемых элементов
     */
    elements: (string | Element)[];
    /**
     * Данные которые будут переданы для рендеринга
     */
    data: T;
    /**
     * See https://popper.js.org/docs/v2/
     */
    popperOptions?: Parameters<PopperInstance['setOptions']>[0];
}
interface UiTourConstructorOptions {
    render?: (payload: TourPopperRender) => void;
    popperOptions?: Parameters<PopperInstance['setOptions']>[0];
    onStop?: () => void;
    steps?: TourStep<any>[];
}
export declare class UiTour {
    box: BoxOverlay;
    private steps;
    private currentStepIndex;
    private popperElement;
    private popperInstance;
    private popperOptions;
    private isFirstRender;
    private goToStepPromise;
    private started;
    private render;
    private handleStop;
    constructor({ render, popperOptions, onStop, steps, }?: UiTourConstructorOptions);
    isStarted(): boolean;
    add<T>(step: TourStep<T>): void;
    remove(step: TourStep<any>): void;
    clear(): void;
    setRender(render: (payload: TourPopperRender) => void): void;
    setPopperOptions(options: Parameters<PopperInstance['setOptions']>[0]): void;
    onStop(callback: () => void): void;
    start(stepIndex?: number): Promise<void>;
    stop(): Promise<void>;
    private stopNow;
    private appendPopper;
    private removePopper;
    private getPopperOptions;
    private checkStepIndex;
    private getTourStepRenderParams;
    private goToStep;
    private handleUpdateRect;
}
export {};
