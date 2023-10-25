import { printNet } from "./diagram.ts"
import { con, dup, Net, reduce, wires } from "./net.ts"

const w = wires()

const add = con(
  con(con(con(w.z!, w.i0!), w.o0!), con(con(w.o0!, w.i1!), w.o1!)),
  con(con(w.z!, dup(w.i0!, w.i1!)), w.o1!),
)

const one = con(con(w.z!, con(w.z!, w.o!)), w.o!)

const net: Net = [
  [w.t!],
  [
    [one, dup(w.o1!, w.o2!)],
    [add, con(con(w.o1!, w.o2!), w.t!)],
  ],
]

for (let i = 0; i < 1000; i++) {
  console.log("")
  console.log(printNet(net).join("\n"))
  if (!net[1].length) break
  net[1] = reduce(net[1][0]!).concat(net[1].slice(1))
}
