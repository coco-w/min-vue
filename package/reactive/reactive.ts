import handler from "./handlers"
export const reactive = (target: any) => {
  const res = new Proxy(target, handler)
  return res
}
