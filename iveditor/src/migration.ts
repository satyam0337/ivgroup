import * as t from "zod/v4-mini"

export const LATEST_VERSION = 2

export const migrate = (documentSnapshot: object) => {
  if (!tIs(documentSnapshot, t.object({ version: t.number() }))) {
    throw new Error("version of document snapshot could not be found")
  }
  let vesion = documentSnapshot.version
  if (vesion === 1) {
    documentSnapshot = migrate1to2(documentSnapshot)
    return documentSnapshot
  }
  return documentSnapshot
}


// version 2 updated lexical from 0.16.1 to 0.32.1
// this added a style property on paragraph node
// we also now have a custom paragraph node
// to resolve line height issues
const migrate1to2 = (documentSnapshot: object) => {
  traverse(documentSnapshot, node => {
    if (!tIs(node, t.object({ type: t.literal("paragraph"), style: t.optional(t.string()) }))) return
    node.type = "custom-paragraph" as any

    let childFontSizes: number[] = []
    traverse(node, node => {
      if (!tIs(node, t.object({
        type: t.union([t.literal("text"), t.literal("data")]),
        style: t.optional(t.string())
      }))) return
      if (!node.style) node.style = ""
      let fontSize = node.style.match(/font-size:\s*(\d+)px/)?.[1]
      if (fontSize) childFontSizes.push(Number(fontSize))
    })
    if (!node.style) node.style = ""
    node.style = (
      node.style.replace(/font-size:\s*(\d+)px;?/, "") +
      `font-size: ${childFontSizes.length > 0 ? Math.max(...childFontSizes) : 16}px;`
    )
  })
  
  ;(documentSnapshot as { version?: number }).version = 2

  return documentSnapshot
}

const traverse = (a: unknown, f: (x: unknown) => void) => {
  f(a)
  if (typeof a === "object" && a !== null) {
    for (let k in a) {
      traverse(a[k as keyof typeof a], f)
    }
  }
}

const tIs = <T extends t.ZodMiniType>(a: unknown, schema: T): a is t.infer<T> =>
  schema.safeParse(a).success