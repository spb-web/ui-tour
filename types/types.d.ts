import { Instance as PopperInstance } from '@popperjs/core';
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
export interface UiTourConstructorOptions {
    render?: (payload: TourPopperRender) => void;
    popperOptions?: Parameters<PopperInstance['setOptions']>[0];
    onStop?: () => void;
    steps?: TourStep<any>[];
}
