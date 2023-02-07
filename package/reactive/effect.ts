let activeEffect: any = null

export class ReactiveEffect {
  fn: any
  constructor(fn: any) {
    this.fn = fn
  }
  run() {
    activeEffect = this
    return this.fn()
  }
}

const trackMap = new Map<any, Map<any, Set<ReactiveEffect>>>()
export const track = (target: any, key: any) => {
  let depsMap = trackMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    trackMap.set(target, depsMap)
  }

  let deps = depsMap.get(key)
  if (!deps) {
    deps = new Set()
    depsMap.set(key, deps)
  }

  deps.add(activeEffect)
}

export const trigger = (target: any, key: any) => {
  const depsMap = trackMap.get(target)
  const deps = depsMap?.get(key)
  if (deps) {
    for (const eff of deps) {
      eff.run()
    }
  }
}
export const effect = (fn: () => any) => {
  const eff = new ReactiveEffect(fn)
  eff.run()
  return eff.run.bind(eff)
}
