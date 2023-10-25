export type Aux = { type: "aux"; other: Aux }

export type Tree = { type: "nil" } | { type: "two"; tag: number; left: Tree; right: Tree } | Aux

export const nil = { type: "nil" as const }

export function con(a: Tree, b: Tree): Tree {
  return { type: "two", tag: 0, left: a, right: b }
}

export function dup(a: Tree, b: Tree): Tree {
  return { type: "two", tag: 1, left: a, right: b }
}

export function wire(): [Aux, Aux] {
  const x: Tree = { type: "aux", other: null! }
  const y: Tree = { type: "aux", other: x }
  x.other = y
  return [x, y]
}

export function wires(): Record<string, Aux> {
  return new Proxy({}, {
    get: (target: any, key) => {
      if (key in target) {
        const v = target[key]
        delete target[key]
        return v
      }
      const [a, b] = wire()
      target[key] = b
      return a
    },
  })
}

export type Pair = [Tree, Tree]

export type Net = [Tree[], Pair[]]

export function reduce([a, b]: Pair): Pair[] {
  if (a.type === "aux") {
    if (b.type === "aux") {
      a.other.other = b.other
      b.other.other = a.other
    } else {
      delete (a.other as any).other
      Object.assign(a.other, b)
    }
    return []
  }
  if (b.type === "aux") {
    delete (b.other as any).other
    Object.assign(b.other, a)
    return []
  }
  if (a.type === "nil") {
    if (b.type === "nil") {
      return []
    }
    return [[nil, b.left], [nil, b.right]]
  }
  if (b.type === "nil") {
    return [[a.left, nil], [a.right, nil]]
  }
  if (a.tag === b.tag) {
    return [[a.left, b.left], [a.right, b.right]]
  }
  const [[i, I], [j, J], [k, K], [l, L]] = [wire(), wire(), wire(), wire()]
  return [
    [a.left, { type: "two", tag: b.tag, left: k, right: l }],
    [a.right, { type: "two", tag: b.tag, left: i, right: j }],
    [{ type: "two", tag: a.tag, left: K, right: I }, b.left],
    [{ type: "two", tag: a.tag, left: L, right: J }, b.right],
  ]
}
