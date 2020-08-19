import { createPopper } from '@popperjs/core';
import { BoxOverlay } from '@spbweb/box-overlay';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

class Tour {
    constructor() {
        this.steps = [];
        this.currentStepIndex = 0;
        this.popperElement = document.createElement('div');
        this.popperInstance = null;
        this.isFirstRender = true;
        this.goToStepPromise = Promise.resolve();
        this.started = false;
        this.render = () => { };
        this.handleUpdateRect = () => {
            if (!this.popperInstance) {
                throw new Error('popperInstance is nil');
            }
            this.popperInstance.forceUpdate();
        };
        this.box = new BoxOverlay(this.handleUpdateRect);
    }
    isStarted() {
        return this.started;
    }
    add(step) {
        this.steps.push(step);
    }
    remove(step) {
        this.steps.push(step);
    }
    clear() {
        this.steps = [];
    }
    setRender(render) {
        this.render = render;
    }
    start(stepIndex = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.started) {
                console.warn('[UiTour]: tour already started');
                return;
            }
            this.isFirstRender = true;
            this.started = true;
            this.appendPopper();
            const { popperInstance } = this;
            if (!popperInstance) {
                throw new Error('popperInstance is nil');
            }
            this.box.start();
            this.render({
                root: this.popperElement,
                popper: popperInstance,
            });
            yield this.goToStep(stepIndex);
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.started) {
                console.warn('[UiTour]: tour already stoped');
                return;
            }
            this.started = false;
            yield this.goToStepPromise;
            this.popperElement.innerHTML = '';
            this.removePopper();
            this.box.stop();
            this.box.clear();
        });
    }
    appendPopper() {
        const { overlay } = this.box;
        this.popperInstance = createPopper(overlay.getElement(), this.popperElement, {
            modifiers: [
                {
                    name: 'addZIndex',
                    enabled: true,
                    phase: 'write',
                    fn({ state }) {
                        state.elements.popper.style.setProperty('z-index', `${overlay.zIndex + 2}`);
                    },
                }
            ]
        });
        document.body.appendChild(this.popperElement);
    }
    removePopper() {
        const { popperInstance, popperElement } = this;
        const { body } = document;
        if (popperInstance) {
            popperInstance.destroy();
        }
        if (popperElement.parentElement === body) {
            body.removeChild(popperElement);
        }
    }
    getPopperOptions(step) {
        return Object.assign({}, step.popperOptions || {});
    }
    goToStep(stepIndex) {
        const { steps } = this;
        const { length } = steps;
        // Check step index [BEGIN]
        if (stepIndex < 0 || stepIndex >= length) {
            throw new Error('[UiTour]: stepIndex go outside the range of the steps array'
                + `\n steps length is ${length}; stepIndex is ${stepIndex}`);
        }
        // Check step index [END]
        this.goToStepPromise = (() => __awaiter(this, void 0, void 0, function* () {
            try {
                // Waiting for the previous step to complete
                yield this.goToStepPromise;
                this.currentStepIndex = stepIndex;
                const step = steps[stepIndex];
                const { popperInstance: popper } = this;
                if (!popper) {
                    throw new Error('this.popperInstance is nil');
                }
                const tourStepRenderParams = {
                    root: this.popperElement,
                    isFirst: stepIndex === 0,
                    isLast: stepIndex === this.steps.length - 1,
                    isFirstRender: this.isFirstRender,
                    data: step.data,
                    step,
                    steps,
                    stepIndex,
                    popper,
                    next: () => __awaiter(this, void 0, void 0, function* () {
                        this.currentStepIndex = stepIndex + 1;
                        yield this.goToStep(this.currentStepIndex);
                    }),
                    prev: () => __awaiter(this, void 0, void 0, function* () {
                        this.currentStepIndex = stepIndex - 1;
                        yield this.goToStep(this.currentStepIndex);
                    }),
                    stop: () => this.stop(),
                };
                // Call steps middleware
                if (step.before) {
                    yield step.before(tourStepRenderParams);
                }
                const render = step.render ? step.render : () => { };
                popper.setOptions(this.getPopperOptions(step));
                // Render popup content
                render(tourStepRenderParams);
                this.isFirstRender = false;
                popper.forceUpdate();
                this.box.clear();
                step.elements.forEach(element => this.box.add(element));
            }
            catch (error) {
                console.error(error);
            }
        }))();
        return this.goToStepPromise;
    }
}

export { Tour };
