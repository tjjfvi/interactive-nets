import { printNet } from "./diagram.ts"
import { con, dup, dup2, Net, reduce, wires } from "./net.ts"

const w = wires()

const add = con(
  con(con(con(w.z!, w.i0!), w.o0!), con(con(w.o0!, w.i1!), w.o1!)),
  con(con(w.z!, dup(w.i0!, w.i1!)), w.o1!),
)

const one = con(con(w.z!, con(w.z!, w.o!)), w.o!)

const net: Net = [
  [w.u!],
  [
    [one, dup(w.o1!, dup(w.o2!, w.o3!))],
    [add, dup2(con(con(w.o1!, w.o2!), w.t!), con(con(w.t!, w.o3!), w.u!))],
  ],
]

for (let i = 0; i < 1000; i++) {
  console.log("")
  console.log(printNet(net).join("\n"))
  if (!net[1].length) break
  net[1] = reduce(net[1][0]!).concat(net[1].slice(1))
}
