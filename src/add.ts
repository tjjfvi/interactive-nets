import { concatHoriz, drawNet } from "./diagram.ts"
import { reduce } from "./net.ts"
import { parseNet } from "./parse.ts"
import { printNet } from "./print.ts"

const net = parseNet(`
out

add = (
  (((z i0) o0) ((o0 i1) o1))
  ((z [i0 i1]) o1)
)

one = ((z (z o)) o)

one = [one0 [one1 one2]]
add = {2 add0 add1}

add0 = ((one0 one1) two)
add1 = ((two one2) three)

out = three
`)

for (let i = 0; i < 1000; i++) {
  console.log("")
  console.log(concatHoriz(drawNet(net), [...printNet(net), ""]).join("\n"))
  if (!net[1].length) break
  net[1] = reduce(net[1][0]!).concat(net[1].slice(1))
}
