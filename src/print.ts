import { Aux, Net, Tree } from "./net.ts"

export function printNet(net: Net) {
  const use = new Set<string>()
  const labels = new Map<Aux, string>()
  return [
    ...net[0].map((x) => printTree(x)),
    ...net[1].map(([x, y]) => `${printTree(x)} = ${printTree(y)}`),
  ]

  function printTree(tree: Tree): string {
    if (tree.type === "nil") return "*"
    if (tree.type === "two") {
      const [open, close] = tree.tag === 0 ? "()" : tree.tag === 1 ? "[]" : [`{${tree.tag} `, "}"]
      return `${open}${printTree(tree.left)} ${printTree(tree.right)}${close}`
    }
    if (labels.has(tree)) {
      const label = labels.get(tree)!
      labels.delete(tree)
      use.delete(label)
      return label
    } else {
      for (let n = 0;; n++) {
        const label = tree.label ? tree.label + (n ? n === 1 ? "'" : "'" + n : "") : "'" + n
        if (!use.has(label)) {
          use.add(label)
          labels.set(tree.other, label)
          return label
        }
      }
    }
  }
}
