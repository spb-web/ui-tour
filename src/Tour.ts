import { createPopper, Instance as PopperInstance } from '@popperjs/core'
import { BoxOverlay } from '@spbweb/box-overlay'
import { defaultRender } from './utils'

export type TourStepRenderParams<D, T> = {
  root:Element,
  next:() => Promise<void>,
  prev:() => Promise<void>,
  stop:() => Promise<void>
  isFirst: boolean,
  isLast: boolean,
  isFirstRender: boolean,
  data:D,
  steps:T,
  stepIndex:number,
}

export type TourStepBeforeParams<T> = {
  step:T,
  popper:PopperInstance,
}

export type TourStepBefore<T> = (params:TourStepBeforeParams<T>) => Promise<void>

export type TourStepRender<D,T> = (params:TourStepRenderParams<D,T>) => void

export interface TourStep<T> {
  render?:TourStepRender<this['data'], any[]>
  before?:TourStepBefore<this>
  elements:(string|Element)[]
  data:T
  popperOptions?:Parameters<PopperInstance['setOptions']>[0]
}

export class Tour {
  public box:BoxOverlay
  private steps:TourStep<any>[] = []
  private currentStepIndex = 0
  private popperElement = document.createElement('div')
  private popperInstance:ReturnType<typeof createPopper>|null = null
  private isFirstRender = true
  private goToStepPromise = Promise.resolve()
  private started = false

  constructor() {
    this.box = new BoxOverlay(this.handleUpdateRect)
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

  public async start(stepIndex = 0) {
    if (this.started) {
      console.warn('[UiTour]: tour already started')
      return
    }

    this.isFirstRender = true
    this.started = true

    this.appendPopper()
    this.box.start()

    await this.goToStep(stepIndex)
  }

  public async stop() {
    if (!this.started) {
      console.warn('[UiTour]: tour already stoped')
      return
    }

    this.started = false

    await this.goToStepPromise

    this.popperElement.innerHTML = ''
    this.removePopper()
    this.box.stop()
    this.box.clear()
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
    return Object.assign({}, step.popperOptions || {})
  }

  private goToStep(stepIndex:number) {
    const { steps } = this
    const { length } = steps

    // Check step index [BEGIN]
    if (stepIndex < 0 || stepIndex >= length) {
      throw new Error(
        '[UiTour]: stepIndex go outside the range of the steps array'
        + `\n steps length is ${length}; stepIndex is ${stepIndex}`
      )
    }
    // Check step index [END]

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
    
        // Call steps middleware
        if (step.before) {
          await step.before({
            step,
            popper
          })
        }
  
        const render = step.render ? step.render : defaultRender
  
        popper.setOptions(
          this.getPopperOptions(step)
        )
  
        // Render popup content
        render({
          root: this.popperElement,
          isFirst: stepIndex === 0,
          isLast: stepIndex === this.steps.length - 1,
          isFirstRender: this.isFirstRender,
          data: step.data,
          steps,
          stepIndex,
          next: async () => {
            this.currentStepIndex = stepIndex + 1 
            await this.goToStep(this.currentStepIndex)
          },
          prev: async () => {
            this.currentStepIndex = stepIndex - 1 
            await this.goToStep(this.currentStepIndex)
          },
          stop: () => this.stop(),
        })
  
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
    if (!this.popperInstance) {
      throw new Error('popperInstance is nil')
    }

    this.popperInstance.forceUpdate()
  }
}
