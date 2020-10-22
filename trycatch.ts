export default function trycatch(fn : Function, ...args : any) : [(null|Error), any]{
    try {
      return [null, fn(...args)]
    } catch (error) {
      return [error, null]
    }
  }