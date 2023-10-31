import { serveDir } from "https://deno.land/std@0.167.0/http/file_server.ts"
import { serve } from "https://deno.land/std@0.167.0/http/server.ts"

if (Deno.env.get("DEV")) {
  await new Deno.Command("deno", { args: ["task", "build"] }).output()
}

serve(async (req) => {
  const res = await serveDir(req, {
    fsRoot: "./static",
  })
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin")
  res.headers.set("Cross-Origin-Embedder-Policy", "require-corp")
  return res
})
