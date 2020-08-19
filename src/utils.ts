// import type { TourStepRenderParams, TourStepRender } from './Tour'

// export const defaultRender:TourStepRender<any, any> = <D extends string, T>({
//   root,
//   next,
//   prev,
//   stop,
//   isFirst,
//   isLast,
//   isFirstRender,
//   data,
// }:TourStepRenderParams<D, T>):void => {
//   if (!isFirstRender) {
//     const nextButton = root.querySelector('.tour-next-button')
//     const prevButton = root.querySelector('.tour-prev-button')
//     const content = root.querySelector('.tour-content-text')

//     if (prevButton instanceof HTMLElement) {
//       prevButton.onclick = prev

//       if (isFirst) {
//         prevButton.setAttribute('disabled', 'disabled')
//       } else {
//         prevButton.removeAttribute('disabled')
//       }
//     }

//     if (nextButton instanceof HTMLElement) {
//       nextButton.onclick = next

//       if (isLast) {
//         nextButton.setAttribute('disabled', 'disabled')
//       } else {
//         nextButton.removeAttribute('disabled')
//       }
//     }

//     if (content instanceof HTMLElement) {
//       content.innerHTML = data.toString()
//     }

//     return
//   }

//   const nextButton = document.createElement('button')

//   nextButton.innerText = 'Next'
//   nextButton.classList.add('tour-next-button')

//   if (isLast) {
//     nextButton.setAttribute('disabled', 'disabled')
//   } else {
//     nextButton.onclick = () => next()
//   }

//   const prevButton = document.createElement('button')

//   prevButton.innerText = 'Prev'
//   prevButton.classList.add('tour-prev-button')

//   if (isFirst) {
//     prevButton.setAttribute('disabled', 'disabled')
//   } else {
//     prevButton.onclick = () => prev()
//   }

//   const stopButton = document.createElement('button')
//   stopButton.innerText = 'stop'
//   stopButton.onclick = stop

//   const content = document.createElement('div')
//   content.classList.add('tour-content-text')
//   content.innerText = data.toString()

//   root.appendChild(content)
//   root.appendChild(stopButton)
//   root.appendChild(nextButton)
//   root.appendChild(prevButton)
// }
