import {Tour} from '../src'

const t = new Tour()

t.add({
  elements: ['.q1'],
  before: () => new Promise(r => setTimeout(r, 500)),
  data: 'step1'
})

t.add({
  elements: ['.q2'],
  before: () => new Promise(r => setTimeout(r, 1000)),
  data: 'step2'
})

t.add({
  elements: ['.q3'],
  before: () => new Promise(r => setTimeout(r, 500)),
  data: 'step3'
})

t.add({
  elements: ['.q1', '.q2'],
  before: () => {
    return new Promise(r => setTimeout(r, 500))
  },
  data: 'step4',
  popperOptions: {
    
  }
})

t.add({
  elements: ['.q2'],
  before: () => new Promise(r => setTimeout(r, 500)),
  data: 'step5'
})

t.add({
  elements: ['.q1', '.q2', '.q3'],
  before: () => new Promise(r => setTimeout(r, 500)),
  data: 'step6'
})

// @ts-ignore
window.onborging = t