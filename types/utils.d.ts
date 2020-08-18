import type { TourStepRenderParams } from './Tour';
export declare const defaultRender: <T extends string>({ root, next, prev, stop, isFirst, isLast, isFirstRender, data, }: TourStepRenderParams<T>) => void;
