import { track, trigger } from "./effect"

const createGetterHandler = (target: any, key: string) => {
  track(target, key)
  const res = Reflect.get(target, key)
  return res
}

const createSetterHandler = (target: any, key: string, value: any) => {
  const res = Reflect.set(target, key, value)
  trigger(target, key)
  return res
}

export default {
  get: createGetterHandler,
  set: createSetterHandler,
}
