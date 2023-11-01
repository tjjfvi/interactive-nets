/// <reference lib="dom"/>

import lzstring from "https://esm.sh/lz-string@1.4.4"
import { concatHoriz, drawNet } from "./diagram.ts"
import { reduce } from "./net.ts"
import { parseNet } from "./parse.ts"
import { printNet } from "./print.ts"

const initial = getInitialNet() ?? `
out

add = (
  (((z i0) o0) ((o0 i1) o1))
  ((z [i0 i1]) o1)
)

one = ((z (z o)) o)

[one0 [one1 one2]] = one
{2 add0 add1} = add

add0 = ((one0 one1) two)
add1 = ((two one2) three)

out = three
`.trimStart()

const inputTextarea = document.getElementById("input") as HTMLTextAreaElement
const outputPre = document.getElementById("output")!
const parallel = document.getElementById("parallel") as HTMLInputElement
const autoSubst = document.getElementById("autoSubst") as HTMLInputElement

inputTextarea.value = initial

inputTextarea.addEventListener("change", exec)
inputTextarea.addEventListener("keyup", exec)
parallel.addEventListener("change", exec)
autoSubst.addEventListener("change", exec)

exec()

function exec() {
  try {
    let output = ""
    const net = parseNet(inputTextarea.value)
    let steps = 0
    for (; steps < 1000; steps++) {
      if (autoSubst.checked) {
        while (net[1].some((x) => x[0].type === "aux" || x[1].type === "aux")) {
          net[1] = net[1].flatMap((x) =>
            x[0].type === "aux" || x[1].type === "aux" ? reduce(x) : [x]
          )
        }
      }
      output += concatHoriz(drawNet(net), [...printNet(net), ""]).join("\n") + "\n\n"
      if (!net[1].length) break
      if (parallel.checked) {
        net[1] = net[1].flatMap(reduce)
      } else {
        net[1] = reduce(net[1][0]!).concat(net[1].slice(1))
      }
    }

    outputPre.textContent = `${steps} steps\n\n` + output

    history.replaceState({}, "", "#0" + lzstring.compressToEncodedURIComponent(inputTextarea.value))
  } catch (e) {
    outputPre.textContent = e + ""
  }
}

function getInitialNet(): string | undefined {
  if (location.hash.startsWith("#0")) {
    return lzstring.decompressFromEncodedURIComponent(location.hash.slice(2))
  }
  return
}
