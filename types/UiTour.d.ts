import { Instance as PopperInstance } from '@popperjs/core';
import { BoxOverlay } from '@spb-web/box-overlay';
declare const stoppedEventName = "stopped";
interface Events {
    [stoppedEventName]: () => void;
}
import { TourPopperRender, TourStep, UiTourConstructorOptions } from './types';
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
    private emitter;
    constructor({ render, popperOptions, steps, }?: UiTourConstructorOptions);
    getPopoverElement(): HTMLDivElement;
    isStarted(): boolean;
    add<T>(step: TourStep<T>): void;
    remove(step: TourStep<any>): void;
    clear(): void;
    setRender(render: (payload: TourPopperRender) => void): void;
    setPopperOptions(options: Parameters<PopperInstance['setOptions']>[0]): void;
    start(stepIndex?: number): Promise<void>;
    stop(): Promise<void>;
    on<E extends keyof Events>(event: E, callback: Events[E]): import("nanoevents").Unsubscribe;
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
