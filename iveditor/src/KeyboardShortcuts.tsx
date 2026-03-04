import { useEffect } from "react"


const KeyboardShortcuts = ({ onClose }: { onClose: () => void }) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  })

  return <div>
    <div className="fixed top-[15%] left-[50%] translate-x-[-50%] bg-white rounded-md p-4 z-[2]">
      <div className="flex flex-col">
        {Shortcuts.map(([label, keys]) =>
          <div key={keys.join(" + ")} className="flex justify-between gap-4 border-b border-slate-300 p-2 last:border-none">
            <span>{label}</span>
            <span>{keys.join(" + ")}</span>
          </div>
        )}
      </div>
    </div>
    <div onClick={onClose} className="fixed inset-0 bg-[rgba(0,0,0,0.2)] backdrop-blur-md z-[1]"></div>
  </div>
}
export default KeyboardShortcuts

let Shortcuts: [string, string[]][] = [
  ["Undo", ["CTRL", "Z"]],
  ["Redo", ["CTRL", "SHIFT", "Z"]],
  ["Save preview", ["CTRL", "S"]],
  ["Publish", ["CTRL", "P"]],
  ["Insert data", ["CTRL", "D"]],
  ["Select parent table", ["CTRL", "UP"]]
]