export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
export function throttle(func, delay) {
  let timer = null
  return function (...args) {
    if (!timer) {
      func(...args)
      timer = setTimeout(() => {
        timer = null
      }, delay)
    }
  }
}
