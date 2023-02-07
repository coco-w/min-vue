interface ReactiveEffectOptions {
  scheduler?: any
  onStop?: any
}

let activeEffect: ReactiveEffect | null = null

export class ReactiveEffect {
  fn: any
  deps: Set<ReactiveEffect>[] = []
  scheduler?: any
  onStop?: any
  active: boolean = true
  constructor(fn: any) {
    this.fn = fn
  }
  run() {
    activeEffect = this
    return this.fn()
  }
  stop() {
    if (this.active) {
      if (this.onStop) {
        this.onStop()
      }
      for (const dep of this.deps) {
        dep.delete(this)
      }
      this.active = false
    }
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
  if (activeEffect) {
    deps.add(activeEffect)
    activeEffect.deps.push(deps)
  }
}

export const trigger = (target: any, key: any) => {
  const depsMap = trackMap.get(target)
  const deps = depsMap?.get(key)
  if (deps) {
    for (const eff of deps) {
      if (eff.scheduler) {
        eff.scheduler(eff.fn)
      } else {
        eff.run()
      }
    }
  }
}
export const effect = (fn: () => any, options: ReactiveEffectOptions = {}) => {
  // const { scheduler, onStop } = options
  const eff = new ReactiveEffect(fn)
  Object.assign(eff, options)
  eff.run()
  const runner: any = eff.run.bind(eff)
  runner.effect = eff
  return runner
}

export const stop = (fn: any) => {
  fn.effect.stop()
}
