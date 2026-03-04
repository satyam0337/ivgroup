export {
  assertNever,
  useReffed,
  cn,
  useEffectEvent
}

import clsx, { ClassValue } from "clsx"
import { useLayoutEffect, useRef, useState } from "react"
import { twMerge } from "tailwind-merge"


const assertNever =
  (() => {}) as (x?: never) => never

const useReffed = <T extends unknown>(a: T) => {
  let aRef = useRef(a)
  useLayoutEffect(() => {
    aRef.current = a
  }, [a])
  return aRef
}

const cn = (...a: ClassValue[]) => twMerge(clsx(...a))

const useEffectEvent = <F extends (...a: never) => unknown>(f: F) => {
  let fRef = useReffed(f)
  return useState(() => (...a: never) => fRef.current(...a))[0] as F
}