import { reactive } from "../reactive"
import { effect } from "../effect"

describe("effect", () => {
  it("happy path", () => {
    const user = reactive({
      age: 10,
    })
    let nextAge
    effect(() => {
      nextAge = user.age + 1
    })
    expect(nextAge).toBe(11)
    user.age++
    expect(nextAge).toBe(12)
  })
  it("runner", () => {
    let foo = 10
    const runner = effect(() => {
      foo++
      return "foo"
    })
    expect(foo).toBe(11)
    const r = runner()
    expect(foo).toBe(12)
    expect(r).toBe("foo")
  })
  it("scheduler", () => {
    let dummy
    let run: any
    const scheduler = jest.fn(() => {
      run = runner
    })
    const obj = reactive({ foo: 1 })
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      { scheduler }
    )
    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)
    // should be called on first trigger
    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1)
    // should not run yet
    expect(dummy).toBe(1)
    // manually run
    run()
    // should have run
    expect(dummy).toBe(2)
  })
  it("job queue", () => {
    // 定义一个任务队列
    const jobQueue = new Set()
    // 使用 Promise.resolve() 创建一个 Promise 实例，我们用它将一个任务添加到微任务队列
    const p: any = Promise.resolve()

    // 一个标志代表是否正在刷新队列
    let isFlushing = false

    function flushJob() {
      // 如果队列正在刷新，则什么都不做
      if (isFlushing) return
      // 设置为true，代表正在刷新
      isFlushing = true
      // 在微任务队列中刷新 jobQueue 队列
      p.then(() => {
        jobQueue.forEach((job: any) => job())
      }).finally(() => {
        // 结束后重置 isFlushing
        isFlushing = false
        // 虽然scheduler执行两次，但是由于是Set，所以只有一项
        expect(jobQueue.size).toBe(1)
        // 期望最终结果拿数组存储后进行断言
        expect(logArr).toEqual([1, 3])
      })
    }

    const obj = reactive({ foo: 1 })
    let logArr: number[] = []

    effect(
      () => {
        logArr.push(obj.foo)
      },
      {
        scheduler(fn: any) {
          // 每次调度时，将副作用函数添加到 jobQueue 队列中
          jobQueue.add(fn)
          // 调用 flushJob 刷新队列
          flushJob()
        },
      }
    )

    obj.foo++
    obj.foo++

    expect(obj.foo).toBe(3)
  })
})
