import { Aux, Net, Tree } from "./net.ts"

export type Diagram = string[]

function strafe(delta: number) {
  if (delta % 2 !== 0) throw new Error("cannot strafe odd delta")
  if (delta === 0) {
    return [
      "|",
    ]
  }
  const spacing = " ".repeat(Math.abs(delta))
  if (delta === 2) {
    return [
      " \\ ",
      "  |",
      "  |",
    ]
  }
  if (delta === -2) {
    return [
      " / ",
      "|  ",
      "|  ",
    ]
  }
  if (delta > 0) {
    return [
      " \\" + "__".repeat(delta / 2 - 2) + "_  ",
      spacing.slice(0, -1) + "\\ ",
      spacing + "|",
    ]
  }
  return [
    "  _" + "__".repeat(-delta / 2 - 2) + "/ ",
    " /" + spacing.slice(0, -1),
    "|" + spacing,
  ]
}

export function concatHoriz(...ds: Diagram[]) {
  return ds.reduce((a, b) => {
    if (a.length > b.length) b = [...b, ...Array(a.length - b.length).fill(b.at(-1) ?? "")]
    if (b.length > a.length) a = [...a, ...Array(b.length - a.length).fill(a.at(-1) ?? "")]
    return a.map((a, i) => a + b[i])
  }, [""])
}

function spacing(gap: number) {
  return [" ".repeat(gap)]
}

function ctr(tag: number) {
  if (tag === 0) {
    return [
      "  / \\  ",
      " /   \\ ",
      "/_____\\",
      " |   | ",
    ]
  }
  if (tag < 8) {
    const char = " X-+!*&@"[tag]!
    return [
      `  /${char}\\  `,
      ` /${char.repeat(3)}\\ `,
      `/${char.repeat(5)}\\`,
      " |   | ",
    ]
  }
  const hex = tag.toString(16)
  const center = [, ` ${hex} `, hex[0] + " " + hex[1], hex][hex.length]
  return [
    "  / \\  ",
    ` /${center}\\ `,
    "/_____\\",
    " |   | ",
  ]
}

const era = [
  "_|_",
  "   ",
]

function drawTree(tree: Tree, left = 0): [Diagram, number, [Aux, number][]] {
  if (tree.type === "aux") return [[" | "], 1, [[tree, left + 1]]]
  if (tree.type === "nil") return [era, 1, []]
  const [a, ai, au] = drawTree(tree.left, left)
  const [b, bi, bu] = drawTree(tree.right, left + a[0]!.length + 1)
  return [
    [
      ...concatHoriz(
        spacing(a[0]!.length - 3),
        ctr(tree.tag),
        spacing(b[0]!.length - 3),
      ),
      ...concatHoriz(
        spacing(ai),
        strafe(-(a[0]!.length - ai - 2)),
        spacing(3),
        strafe(bi - 1),
        spacing(b[0]!.length - bi - 1),
      ),
      ...concatHoriz(a, spacing(1), b),
    ],
    a[0]!.length,
    [...au, ...bu],
  ]
}

function cap(delta: number) {
  if (delta < 4 || delta % 2 !== 0) throw new Error("invalid cup delta")
  return [
    "  " + "__".repeat((delta - 4) / 2) + "_  ",
    " /" + " ".repeat(delta - 3) + "\\ ",
    "|" + " ".repeat(delta - 1) + "|",
  ]
}

export function drawNet(net: Net): Diagram {
  let caps = [""]
  let trees = [""]
  const auxes: [Aux, number][] = []
  let i = 0
  for (const tree of net[0]) {
    const [a, ai, au] = drawTree(tree, i)
    i += a[0]!.length + 1
    trees = concatHoriz(trees, a, spacing(1))
    caps = concatHoriz(caps, spacing(ai), ["|"], spacing(a[0]!.length - ai))
    auxes.push(...au)
  }
  for (const pair of net[1]) {
    const [a, ai, au] = drawTree(pair[0], i)
    i += a[0]!.length + 1
    const [b, bi, bu] = drawTree(pair[1], i)
    i += b[0]!.length + 1
    auxes.push(...au, ...bu)
    trees = concatHoriz(trees, a, spacing(1), b, spacing(1))
    caps = concatHoriz(
      caps,
      spacing(ai),
      cap(bi + a[0]!.length - ai + 1),
      spacing(b[0]!.length - bi),
    )
  }
  const jumps = auxes.map(([aux, l], i) =>
    [auxes.findIndex(([a]) => aux.other === a) - i, l] as const
  )
  const cups = []
  for (let d = 1;; d++) {
    let i = 0
    let active = 0
    let str = ""
    for (const [deltaI, left] of jumps) {
      const line = active ? "_" : " "
      const piece = deltaI === d
        ? `${line}${line}\\`
        : deltaI === -d
        ? `/${active > 1 ? "__" : "  "}`
        : Math.abs(deltaI) > d
        ? `${line}|${line}`
        : `${line}${line}${line}`
      str += (active ? "__" : "  ").repeat((left - 1 - i) / 2) + piece
      i = left + 3
      active += deltaI === d ? 1 : deltaI === -d ? -1 : 0
      str += active ? "_" : " "
    }
    if (str.trim() === "") break
    if (/^[ |]+$/.test(str)) continue
    str += " ".repeat(caps[0]!.length - i)
    cups.push(str)
  }
  return [...caps, ...trees, ...cups, " ".repeat(caps[0]!.length)]
}
