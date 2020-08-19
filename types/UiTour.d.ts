import { Instance as PopperInstance } from '@popperjs/core';
import { BoxOverlay } from '@spbweb/box-overlay';
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
export declare type TourStepBefore<Steps extends TourStep<any>[], Step extends TourStep<any>> = (params: TourStepRenderParams<Steps, Step>) => Promise<void>;
export declare type TourStepRender<Steps extends TourStep<any>[], Step extends TourStep<any>> = (params: TourStepRenderParams<Steps, Step>) => void;
export interface TourStep<T> {
    render?: TourStepRender<TourStep<any>[], this>;
    before?: TourStepBefore<TourStep<any>[], this>;
    elements: (string | Element)[];
    data: T;
    popperOptions?: Parameters<PopperInstance['setOptions']>[0];
}
export declare class UiTour {
    box: BoxOverlay;
    private steps;
    private currentStepIndex;
    private popperElement;
    private popperInstance;
    private isFirstRender;
    private goToStepPromise;
    private started;
    private render;
    private popperOptions;
    private handleStop;
    constructor();
    isStarted(): boolean;
    add<T>(step: TourStep<T>): void;
    remove(step: TourStep<any>): void;
    clear(): void;
    setRender(render: (payload: TourPopperRender) => void): void;
    setPopperOptions(options: Parameters<PopperInstance['setOptions']>[0]): void;
    onStop(callback: () => void): void;
    start(stepIndex?: number): Promise<void>;
    stop(): Promise<void>;
    private appendPopper;
    private removePopper;
    private getPopperOptions;
    private goToStep;
    private handleUpdateRect;
}
