import { createPopper, Instance as PopperInstance } from '@popperjs/core'
import { BoxOverlay } from '@spb-web/box-overlay'

export interface TourPopperRender {
  root:Element,
  popper:PopperInstance,
}

export interface TourStepRenderParams<
  Steps extends TourStep<any>[], 
  Step extends TourStep<any>,
> extends TourPopperRender
{
  next:() => Promise<void>,
  prev:() => Promise<void>,
  stop:() => Promise<void>
  isFirst: boolean,
  isLast: boolean,
  isFirstRender: boolean,
  data:Step['data'],
  steps:Steps,
  stepIndex:number,
  step:Step,
}

export type TourStepBefore<
  Steps extends TourStep<any>[],
  Step extends TourStep<any>,
> = (
  params:TourStepRenderParams<Steps, Step>
) => Promise<boolean|void>

export type TourStepRender<
  Steps extends TourStep<any>[],
  Step extends TourStep<any>,
> = (params:TourStepRenderParams<Steps,Step>) => void

export interface TourStep<T> {
  /**
   * Вызывается для рендеринга или обновления попапа
   */
  render?:TourStepRender<TourStep<any>[], this>
  /**
   * Вызывается перед переходм к текущему шагу
   */
  before?:TourStepBefore<TourStep<any>[], this>
  /**
   * Вызывается перед переходм к следующему шагу
   */
  after?:TourStepBefore<TourStep<any>[], this>
  /**
   * Список выделяемых элементов
   */
  elements:(string|Element)[]
  /**
   * Данные которые будут переданы для рендеринга
   */
  data:T
  /**
   * See https://popper.js.org/docs/v2/
   */
  popperOptions?:Parameters<PopperInstance['setOptions']>[0]
}

interface UiTourConstructorOptions {
  render?:(payload:TourPopperRender) => void,
  popperOptions?:Parameters<PopperInstance['setOptions']>[0],
  onStop?:() => void,
  steps?:TourStep<any>[]
}

export class UiTour {
  public box:BoxOverlay = new BoxOverlay()
  private steps:TourStep<any>[] = []
  private currentStepIndex = 0
  private popperElement = document.createElement('div')
  private popperInstance:ReturnType<typeof createPopper>|null = null
  private popperOptions:Parameters<PopperInstance['setOptions']>[0] = {}
  private isFirstRender = true
  private goToStepPromise = Promise.resolve()
  private started = false
  private render:(payload:TourPopperRender) => void = () => {}
  private handleStop:() => void = () => {}

  constructor({
    render = () => {},
    popperOptions = {},
    onStop = () => {},
    steps = [],
  }:UiTourConstructorOptions = {}) {
    this.box.on('updateRect', this.handleUpdateRect)

    this.setRender(render)
    this.setPopperOptions(popperOptions)
    this.onStop(onStop)

    steps.forEach(step => this.add(step))
  }

  public isStarted() {
    return this.started
  }

  public add<T>(step:TourStep<T>) {
    this.steps.push(step)
  }

  public remove(step:TourStep<any>) {
    this.steps.push(step)
  }

  public clear() {
    this.steps = []
  }

  public setRender(render:(payload:TourPopperRender) => void) {
    this.render = render
  }

  public setPopperOptions(
    options:Parameters<PopperInstance['setOptions']>[0]
  ) {
    this.popperOptions = options
    
    const { popperInstance } = this

    if (this.isStarted() && popperInstance) {
      popperInstance.setOptions(options)
      popperInstance.forceUpdate()
    }
  }

  public onStop(callback:() => void) {
    this.onStop = callback
  }

  public async start(stepIndex = 0) {
    if (this.isStarted()) {
      console.warn('[UiTour]: tour already started')
      return
    }

    this.isFirstRender = true
    this.started = true

    this.appendPopper()

    const { popperInstance } = this

    if (!popperInstance) {
      throw new Error('popperInstance is nil')
    }

    this.box.start()
    this.render({
      root: this.popperElement,
      popper: popperInstance,
    })

    await this.goToStep(stepIndex)
  }

  public async stop() {
    if (!this.isStarted()) {
      console.warn('[UiTour]: tour already stoped')
      return
    }

    const { popperInstance: popper, currentStepIndex } = this
        
    if (!popper) {
      throw new Error('this.popperInstance is nil')
    }

    this.started = false

    await this.goToStepPromise

    this.checkStepIndex(currentStepIndex)

    const { after } = this.steps[currentStepIndex]

    if (after) {
      await after(
        this.getTourStepRenderParams(
          currentStepIndex,
          popper,
        )
      )
    }

    this.stopNow()
  }

  private stopNow() {
    this.started = false
    this.popperElement.innerHTML = ''
    this.removePopper()
    this.box.stop()
    this.box.clear()
    this.handleStop()
  }

  private appendPopper() {
    const { overlay } = this.box

    this.popperInstance = createPopper(
      overlay.getElement(),
      this.popperElement,
      {
        modifiers: [
          {
            name: 'addZIndex',
            enabled: true,
            phase: 'write',
            fn({ state }) {
              state.elements.popper.style.setProperty(
                'z-index',
                `${overlay.zIndex + 2}`,
              )
            },
          }
        ]
      }
    )

    document.body.appendChild(this.popperElement)
  }

  private removePopper() {
    const { popperInstance, popperElement } = this
    const { body } = document

    if (popperInstance) {
      popperInstance.destroy()
    }

    if (popperElement.parentElement === body) {
      body.removeChild(popperElement)
    }
  }

  private getPopperOptions<T>(
    step:TourStep<T>,
  ):Parameters<PopperInstance['setOptions']>[0] {
    return Object.assign(this.popperOptions, step.popperOptions || {})
  }

  private checkStepIndex(stepIndex:number) {
    if (stepIndex < 0 || stepIndex >= this.steps.length) {
      throw new Error(
        '[UiTour]: stepIndex go outside the range of the steps array'
        + `\n steps length is ${length}; stepIndex is ${stepIndex}`
      )
    }
  }

  private getTourStepRenderParams(stepIndex:number, popper:PopperInstance) {
    const step = this.steps[stepIndex]

    const tourStepRenderParams:TourStepRenderParams<TourStep<any>[], TourStep<any>> = {
      root: this.popperElement,
      isFirst: stepIndex === 0,
      isLast: stepIndex === this.steps.length - 1,
      isFirstRender: this.isFirstRender,
      data: step.data,
      step,
      steps: this.steps,
      stepIndex,
      popper,
      next: async () => {
        if (step.after) {
          await step.after(tourStepRenderParams)
        }

        await this.goToStep(stepIndex + 1)
      },
      prev: async () => {
        if (step.after) {
          await step.after(tourStepRenderParams)
        }

        await this.goToStep(stepIndex - 1)
      },
      stop: async () => {
        await this.stop()
      },
    }

    return tourStepRenderParams
  }

  private goToStep(stepIndex:number) {
    this.checkStepIndex(stepIndex)

    const { steps } = this

    this.goToStepPromise = (async () => {
      try {
        // Waiting for the previous step to complete
        await this.goToStepPromise

        this.currentStepIndex = stepIndex
  
        const step = steps[stepIndex]
        const { popperInstance: popper } = this
        
        if (!popper) {
          throw new Error('this.popperInstance is nil')
        }

        const tourStepRenderParams = this.getTourStepRenderParams(
          stepIndex,
          popper,
        )
    
        // Call steps middleware
        if (step.before) {
          const beforeResult = await step.before(tourStepRenderParams)

          if (beforeResult === false) {
            this.stopNow()

            return
          }
        }
  
        const render = step.render ? step.render : () => {}
  
        popper.setOptions(
          this.getPopperOptions(step)
        )
  
        // Render popup content
        render(tourStepRenderParams)
  
        this.isFirstRender = false
        popper.forceUpdate()
        
        this.box.clear()
        
        step.elements.forEach(element => this.box.add(element))
      } catch (error) {
        console.error(error)
      }
    })()

    return this.goToStepPromise
  } 

  private handleUpdateRect = () => {
    const { popperInstance } = this

    if (!popperInstance) {
      throw new Error('popperInstance is nil')
    }

    requestAnimationFrame(() => {
      popperInstance.forceUpdate()
    })
  }
}
