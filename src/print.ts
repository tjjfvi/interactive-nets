import { Aux, Net, Tree } from "./net.ts"

export function printTree(tree: Tree, use: Map<string, Aux>): string {
  if (tree.type === "nil") return "*"
  if (tree.type === "two") {
    const [open, close] = tree.tag === 0 ? "()" : tree.tag === 1 ? "[]" : [`{${tree.tag} `, "}"]
    return `${open}${printTree(tree.left, use)} ${printTree(tree.right, use)}${close}`
  }
  for (let n = 0;; n++) {
    const label = tree.label ? tree.label + (n ? n === 1 ? "'" : "'" + n : "") : "'" + n
    if (use.has(label)) {
      if (use.get(label) !== tree.other) {
        continue
      }
      use.delete(label)
      return label
    } else {
      use.set(label, tree)
      return label
    }
  }
}

export function printNet(net: Net) {
  const use = new Map()
  return [
    ...net[0].map((x) => printTree(x, use)),
    ...net[1].map(([x, y]) => `${printTree(x, use)} = ${printTree(y, use)}`),
  ]
}
