import { Aux, con, ctr, dup, Net, nil, Pair, Tree, wires } from "./net.ts"

export type Tokens = {
  next(): string | undefined
  peek(): string | undefined
}

const rIdent = /^[a-zA-Z0-9_.'-]+$/
const rToken = /\s*([{}()[\]*=]|[a-zA-Z0-9_.'-]+)\s*|(.)/g

function lex(input: string): Tokens {
  const iter = _lex(input)
  let next = iter.next().value
  return {
    next() {
      const val = next
      next = iter.next().value
      return val
    },
    peek() {
      return next
    },
  }
}

function* _lex(input: string) {
  for (const match of input.matchAll(rToken)) {
    if (match[2]) throw new Error(`invalid character ${match[2]}`)
    yield match[1]!
  }
  return undefined
}

function parseTree(tokens: Tokens, wires: Record<string, Aux>): Tree {
  const token = tokens.next()
  switch (token) {
    case "(": {
      const node = con(parseTree(tokens, wires), parseTree(tokens, wires))
      if (tokens.next() !== ")") throw new Error("expected )")
      return node
    }
    case "[": {
      const node = dup(parseTree(tokens, wires), parseTree(tokens, wires))
      if (tokens.next() !== "]") throw new Error("expected ]")
      return node
    }
    case "{": {
      const tag = +tokens.next()!
      if (isNaN(tag)) throw new Error("expected tag")
      const node = ctr(tag, parseTree(tokens, wires), parseTree(tokens, wires))
      if (tokens.next() !== "}") throw new Error("expected }")
      return node
    }
    case "*": {
      return nil
    }
    default: {
      if (!token || !rIdent.test(token)) {
        throw new Error("expected tree")
      }
      return wires[token]!
    }
  }
}

export function parseNet(input: string): Net {
  const tokens = lex(input)
  const w = wires()
  const trees = []
  while (tokens.peek() && tokens.peek() !== "=") {
    trees.push(parseTree(tokens, w))
  }
  const pairs: Pair[] = []
  if (tokens.peek() === "=") {
    if (!trees.length) parseTree(tokens, w)
    tokens.next()
    pairs.push([trees.pop()!, parseTree(tokens, w)])
  }
  while (tokens.peek()) {
    const a = parseTree(tokens, w)
    if (tokens.next() !== "=") throw new Error("expected =")
    const b = parseTree(tokens, w)
    pairs.push([a, b])
  }
  const unmatched = Object.keys(w)
  if (unmatched.length) {
    throw new Error(`unmatched ${unmatched.join(", ")}`)
  }
  return [trees, pairs]
}
