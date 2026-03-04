import { observer } from "mobx-react"
import { useStore } from "./App"
import Icon from "@mdi/react"
import { mdiBorderAll, mdiBorderInside, mdiBorderNone, mdiBorderOutside, mdiClose, mdiPlus } from "@mdi/js"
import { applySet, findParent, objectActions, standaloneAction } from "mobx-keystone"
import { Store, Table, Text } from "./store"
import { assertNever, cn } from "./extras"
import { useEffect, useState } from "react"
import { autorun } from "mobx"
import Tooltip from "./Tooltip"
import { $isImageNode, ImageNode } from "./InsertImageButton"
import { $getSelection, $isNodeSelection, COMMAND_PRIORITY_CRITICAL, SELECTION_CHANGE_COMMAND } from "lexical"
import { $isQrCodeNode, QrCodeNode } from "./InsertQrCodeButton"

const Sidebar = observer(() => {
  return <div>
    <div className="w-[250px]"></div>
    <div id="sidebar" className="w-[250px] bg-white border-l border-slate-200 p-2 fixed top-[calc(var(--react-root-top)+59px)] right-[0] bottom-[0] overflow-y-auto overflow-x-hidden">
      <TableStyles />
      <CellStyles/>
      <ImageStyles/>
      <QrCodeStyles/>
      <datalist id="css-properties">
        {CSS_PROPERTIES.map(name => 
          <option value={name} key={name}></option>
        )}
      </datalist>
    </div>
  </div>
})
export default Sidebar

const TableStyles = observer(() => {
  let state = useStore()
  let buttonStyle = "p-2 rounded-md hover:bg-slate-200 text-slate-800"

  if (!(state.selection?.current instanceof Table)) return
  let selectedTable = state.selection!.current

  return <div className="mb-2">
    <div className="font-bold">Table Styles</div>
    <div className="pt-2"/>
    <div>
      <Tooltip content="Border All">
        <button onClick={() => onTableBorderStyleChange(state, "border-all")} className={cn(buttonStyle, selectedTable.className.includes("border-all") && "bg-blue-100 mx-1")} aria-label="Border All">
          <Icon path={mdiBorderAll} size={1}/>
        </button>
      </Tooltip>
      <Tooltip content="Border Inside">
        <button onClick={() => onTableBorderStyleChange(state, "border-inside")} className={cn(buttonStyle, selectedTable.className.includes("border-inside") && "bg-blue-100 mx-1")} aria-label="Border Inside">
          <Icon path={mdiBorderInside} size={1}/>
        </button>
      </Tooltip>
      <Tooltip content="Border Outside">
        <button onClick={() => onTableBorderStyleChange(state, "border-outside")} className={cn(buttonStyle, selectedTable.className.includes("border-outside") && "bg-blue-100 mx-1")} aria-label="Border Outside">
          <Icon path={mdiBorderOutside} size={1}/>
        </button>
      </Tooltip>
      <Tooltip content="Border None">
        <button  onClick={() => onTableBorderStyleChange(state, "border-none")} className={cn(buttonStyle, selectedTable.className.includes("border-none") && "bg-blue-100 mx-1")} aria-label="Border None">
          <Icon path={mdiBorderNone} size={1}/>
        </button>
      </Tooltip>
    </div>
    <div className="pt-2"/>
    <CustomStyle
      style={selectedTable.style}
      setStyle={v => applySet(selectedTable, "style", v)}/>
    <div className="pt-2"/>
    <label className="flex">
      <input
        type="checkbox"
        checked={selectedTable.isFirstRowInThead}
        onChange={e => applySet(selectedTable, "isFirstRowInThead", e.target.checked)}/>
      <span className="pl-1">Is First Row Header</span>
    </label>
    <div className="pt-2"/>
    <label className="flex">
      <input
        type="checkbox"
        checked={selectedTable.isFirstRowInTfoot}
        onChange={e => applySet(selectedTable, "isFirstRowInTfoot", e.target.checked)}/>
      <span className="pl-1">Is Last Row Footer</span>
    </label>
  </div>
})

const onTableBorderStyleChange = standaloneAction("app/Sidebar/TableBorderStyle/onTableBorderStyleChange", (state: Store, newStyle: "border-all" | "border-inside" | "border-outside" | "border-none") => {
  let selectedTable = state.selection!.current as Table
  selectedTable.className =
    selectedTable.className
    .split(" ")
    .filter(c =>
      !(
        c === "border-all" ||
        c === "border-inside" ||
        c === "border-outside" ||
        c === "border-none"
      )
    )
    .concat([newStyle])
    .join(" ")
})

const CellStyles = observer(() => {
  let state = useStore()
  let cell = state.selection?.current
  let [computedStyle, setComputedStyle] = useState<CSSStyleDeclaration | undefined>(undefined)
  let [width, setWidth] = useState("auto")
  let [height, setHeight] = useState("auto")
  let [paddingTop, setPaddingTop] = useState("auto")
  let [paddingRight, setPaddingRight] = useState("auto")
  let [paddingBottom, setPaddingBottom] = useState("auto")
  let [paddingLeft, setPaddingLeft] = useState("auto")

  useEffect(() => {
    autorun(() => {
      let selectedCell = state.selection?.current
      if (!selectedCell || !selectedCell.tdDOMNode) return
      let selectedTable = findParent<Table>(selectedCell, n => n instanceof Table)
      if (!selectedTable) return
      JSON.stringify(selectedTable.className)
      JSON.stringify(selectedCell.tdStyle)
      setTimeout(() => {
        setComputedStyle(getComputedStyle(selectedCell.tdDOMNode!))
      }, 0)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getCellBorderStyle = (d: "top" | "right" | "bottom" | "left") => ({
    type:
      cell?.tdStyle["border" + capitalize(d)] === undefined
        ? "auto" as const
        : cell?.tdStyle["border" + capitalize(d)]?.includes("solid") ? "solid" as const : "none" as const,
    style:
      computedStyle?.getPropertyValue(`border-${d}-style`) === "none" || computedStyle?.getPropertyValue(`border-${d}-style`) === "dashed"
        ? "dashed" as const
        : "solid" as const
  })
  let borderTop = getCellBorderStyle("top")
  let borderRight = getCellBorderStyle("right")
  let borderBottom = getCellBorderStyle("bottom")
  let borderLeft = getCellBorderStyle("left")

  const onBorderClick = (d: "top" | "right" | "bottom" | "left") => {
    let { type } = getCellBorderStyle(d)
    let nextType: typeof type = type === "auto" ? "solid" : type === "solid" ? "none" : type === "none" ? "auto" : assertNever(type)
    if (nextType === "solid") {
      objectActions.set(cell!.tdStyle, "border" + capitalize(d), "1px solid #000")
      return
    }
    if (nextType === "none") {
      objectActions.set(cell!.tdStyle, "border" + capitalize(d), "1px none #000")
      return
    }
    if (nextType === "auto") {
      objectActions.delete(cell!.tdStyle, "border" + capitalize(d))
      return
    }
    assertNever(nextType)
  }

  useEffect(() => {
    setWidth(cell?.tdStyle.width ?? "auto")
    setHeight(cell?.tdStyle.height ?? "auto")
    setPaddingTop(cell?.tdStyle.paddingTop ?? "auto")
    setPaddingRight(cell?.tdStyle.paddingRight ?? "auto")
    setPaddingBottom(cell?.tdStyle.paddingBottom ?? "auto")
    setPaddingLeft(cell?.tdStyle.paddingLeft ?? "auto")
  }, [cell])

  const onCellStyleCommit = (x: "width" | "height" | "paddingTop" | "paddingRight" | "paddingBottom" | "paddingLeft") => {
    if (!cell) return
    let value = { width, height, paddingTop, paddingRight, paddingBottom, paddingLeft }[x]
    let setValue = (a: string) =>
      x === "width" ? setWidth(a) :
      x === "height" ? setHeight(a) :
      x === "paddingTop" ? setPaddingTop(a) :
      x === "paddingRight" ? setPaddingRight(a) :
      x === "paddingBottom" ? setPaddingBottom(a) :
      x === "paddingLeft" ? setPaddingLeft(a) :
      assertNever(x)

    if (value === "auto") {
      objectActions.delete(cell.tdStyle, x)
      return
    }

    if (/^[0-9.]+(px|%|cm|mm|in)$/.test(value)) {
      objectActions.set(cell.tdStyle, x, value)
      return
    }

    if (value === "") {
      objectActions.delete(cell.tdStyle, x)
      setValue("auto")
      return
    }

    setValue(cell?.tdStyle[x] ?? "auto")
  }

  return cell && <div className="mb-2" id="cellStyles">
    <div className="font-bold mb-1">Cell Styles</div>
    <div className="relative pt-[100%] w-full overflow-hidden">
      <div className="p-2 absolute w-full top-[2px] cursor-pointer" onClick={() => onBorderClick("top")} aria-label="Border Top">
        <div className="border-t border-[#000]" style={{ borderStyle: borderTop.style }}></div>
        <div className="absolute top-[-50%] left-[50%] translate-x-[-50%] p-1 bg-white">{borderTop.type}</div>
      </div>
      <div className="p-2 absolute bottom-0 w-full cursor-pointer" onClick={() => onBorderClick("bottom")} aria-label="Border Bottom">
        <div className="border-t border-[#000]" style={{ borderStyle: borderBottom.style }}></div>
        <div className="absolute top-[-50%] left-[50%] translate-x-[-50%] p-1 bg-white">{borderBottom.type}</div>
      </div>
      <div className="p-2 absolute origin-top-left bottom-[-17px] rotate-[-90deg] w-[calc(100%-3px)] cursor-pointer" onClick={() => onBorderClick("left")} aria-label="Border Left">
        <div className="border-t border-[#000]" style={{ borderStyle: borderLeft.style }}></div>
        <div className="absolute top-[-50%] left-[50%] translate-x-[-50%] p-1 bg-white">{borderLeft.type}</div>
      </div>
      <div className="p-2 absolute origin-top-right bottom-[-17px] left-[3px] rotate-[90deg] w-[calc(100%-3px)] cursor-pointer" onClick={() => onBorderClick("right")} aria-label="Border Right">
        <div className="border-t border-[#000]" style={{ borderStyle: borderRight.style }}></div>
        <div className="absolute top-[-50%] left-[50%] translate-x-[-50%] p-1 bg-white">{borderRight.type}</div>
      </div>
      <div className="absolute inset-[17px] flex flex-col items-center justify-center leading-none pointer-events-none">
        <Tooltip content="Width" placement="top">
          <input
            className="w-[6ch] text-center pointer-events-auto border border-transparent focus:border-slate-200 p-1"
            value={width}
            onChange={e => setWidth(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onCellStyleCommit("width")}
            onBlur={() => onCellStyleCommit("width")}
            aria-label="Width" />
        </Tooltip>
        &times;
        <Tooltip content="Height">
          <input
            className="w-[6ch] text-center pointer-events-auto border border-transparent focus:border-slate-200 p-1"
            value={height}
            onChange={e => setHeight(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onCellStyleCommit("height")}
            onBlur={() => onCellStyleCommit("height")} />
        </Tooltip>
      </div>
      <div className="absolute inset-[30px] flex flex-col items-center justify-between pointer-events-none">
        <Tooltip content="Top Padding" placement="top">
          <input
            className="w-[6ch] text-center pointer-events-auto border border-transparent focus:border-slate-200 p-1"
            value={paddingTop}
            onChange={e => setPaddingTop(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onCellStyleCommit("paddingTop")}
            onBlur={() => onCellStyleCommit("paddingTop")}
            aria-label="Padding Top" />
        </Tooltip>
        <Tooltip content="Bottom Padding">
          <input
            className="w-[6ch] text-center pointer-events-auto border border-transparent focus:border-slate-200 p-1"
            value={paddingBottom}
            onChange={e => setPaddingBottom(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onCellStyleCommit("paddingBottom")}
            onBlur={() => onCellStyleCommit("paddingBottom")}
            aria-label="Padding Bottom" />
        </Tooltip>
      </div>
      <div className="absolute inset-[30px] flex items-center justify-between pointer-events-none">
        <Tooltip content="Left Padding">
          <input
            className="w-[6ch] text-center pointer-events-auto border border-transparent focus:border-slate-200 p-1"
            value={paddingLeft}
            onChange={e => setPaddingLeft(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onCellStyleCommit("paddingLeft")}
            onBlur={() => onCellStyleCommit("paddingLeft")}
            aria-label="Padding Left" />
        </Tooltip>
        <Tooltip content="Right Padding">
          <input
            className="w-[6ch] text-center pointer-events-auto border border-transparent focus:border-slate-200 p-1"
            value={paddingRight}
            onChange={e => setPaddingRight(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onCellStyleCommit("paddingRight")}
            onBlur={() => onCellStyleCommit("paddingRight")}
            aria-label="Padding Right" />
        </Tooltip>
      </div>
      <div className="absolute inset-[85px] top-[75px] bottom-[75px] pointer-events-none border border-slate-300"/>
      <div className="absolute inset-[25px] pointer-events-none border border-slate-300"/>
    </div>
    <div className="pt-2"></div>
    <CustomStyle
      {...(() => {
        let keys = [
          "width", "height",
          "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "padding",
          "borderTop", "borderRight", "borderBottom", "borderLeft", "border"
        ]

        return {
          style: excludeKeys(cell.tdStyle, keys),
          setStyle: newStyle =>
            applySet(
              cell,
              "tdStyle",
              {
                ...includeKeys(cell.tdStyle, keys),
                ...excludeKeys(newStyle, keys)
              }
            )
        }
      })()}/>
    <div className="pt-2"></div>
    <p className="text-base">Classes</p>
    <input
      type="text"
      value={cell.tdClassName}
      onChange={e => applySet(cell, "tdClassName", e.target.value)}
      className="rounded-md border border-slate-200 p-1" /> 
  </div>
})

const ImageStyles = observer(() => {
  let state = useStore()
  let [style, setStyle] = useState<Record<string, string>>({})
  let [selectedImageNode, setSelectedImageNode] = useState<ImageNode | undefined>(undefined)
  let editor = state.selection?.current instanceof Text ? state.selection.current.editor : undefined

  useEffect(() => {
    if (!editor) return
    const $updateNode = () => {
      let selection = $getSelection()
      if (!selection) { setSelectedImageNode(undefined); return }
      if (!$isNodeSelection(selection)) { setSelectedImageNode(undefined); return }
      let nodes = selection.getNodes()
      if (nodes.length !== 1) { setSelectedImageNode(undefined); return }
      let node = nodes[0]
      if (!$isImageNode(node)) { setSelectedImageNode(undefined); return }
      setSelectedImageNode(node)
      setStyle(node.__style)
    }

    editor.getEditorState().read(() => {
      $updateNode()
    })

    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        $updateNode()
        return false
      },
      COMMAND_PRIORITY_CRITICAL
    )
  }, [editor])

  if (!selectedImageNode) return

  return <div>
    <div className="font-bold mb-2">Image Styles</div>
    <CustomStyle
      style={style}
      setStyle={newStyles => {
        setStyle(newStyles)
        editor!.update(() => {
          selectedImageNode.setStyle({ ...newStyles })
        })
      }}
    />
  </div>
})

const QrCodeStyles = observer(() => {
  let state = useStore()
  let [size, setSize] = useState("")
  let [style, setStyle] = useState<Record<string, string>>({})
  let [selectedNode, setSelectedNode] = useState<QrCodeNode | undefined>(undefined)
  let editor = state.selection?.current instanceof Text ? state.selection.current.editor : undefined

  useEffect(() => {
    if (!editor) return
    const $updateNode = () => {
      let selection = $getSelection()
      if (!selection) { setSelectedNode(undefined); return }
      if (!$isNodeSelection(selection)) { setSelectedNode(undefined); return }
      let nodes = selection.getNodes()
      if (nodes.length !== 1) { setSelectedNode(undefined); return }
      let node = nodes[0]
      if (!$isQrCodeNode(node)) { setSelectedNode(undefined); return }
      setSelectedNode(node)
      setSize(node.__size.toString())
      setStyle(node.__style)
    }

    editor.getEditorState().read(() => {
      $updateNode()
    })

    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        $updateNode()
        return false
      },
      COMMAND_PRIORITY_CRITICAL
    )
  }, [editor])

  if (!selectedNode) return

  return <div>
    <div className="font-bold mb-2">QR Code Styles</div>
    <div className="flex gap-1 items-center mb-1">
      <div className="w-[50%]">Size</div>
      <input
        value={size}
        onChange={e => {
          setSize(e.target.value)
          if (Number.isNaN(Number(e.target.value))) {
            setSize("")
            return
          }
          editor!.update(() => {
            selectedNode.setSize(Number(e.target.value))
          })
        }}
        className="w-[50%] rounded-md border border-slate-200 p-1"/>
    </div>
    <CustomStyle
      style={style}
      setStyle={newStyles => {
        setStyle(newStyles)
        editor!.update(() => {
          selectedNode.setStyle({ ...newStyles })
        })
      }}
    />
  </div>
})

const CustomStyle = ({ style, setStyle }: {
  style: Record<string, string>,
  setStyle: (v: Record<string, string>) => void
}) => {
  let entries = Object.entries(style)
  let setEntries = (es: [string, string][]) => setStyle(Object.fromEntries(es))

  return <div className="customStyles">
    {
      entries
      .map(([key, value], i) => 
        <div className="flex gap-1 items-center mb-2" key={i} aria-label={`Style ${i+1}`}>
          <input
            value={key}
            onChange={e => {
              let newEntries = [...entries]
              newEntries[i]![0] = e.target.value
              setEntries(newEntries)
            }}
            list="css-properties"
            placeholder="css property"
            aria-label="Name"
            className="w-[50%] rounded-md border border-slate-200 p-1" />
          {" : "}
          <input
            value={value}
            onChange={e => {
              let newEntries = [...entries]
              newEntries[i]![1] = e.target.value
              setEntries(newEntries)
            }}
            placeholder="value"
            aria-label="Value"
            className="w-[50%] rounded-md border border-slate-200 p-1" />
          <button onClick={() => {
            let newEntries = [...entries]
            newEntries.splice(i, 1)
            setEntries(newEntries)
          }} aria-label="Delete">
            <Icon path={mdiClose} size={0.75}/>
          </button>
        </div>
      )
    }
    <button
      onClick={() => setEntries([...entries, ["", ""]])}
      className={cn("flex items-center gap-1 p-1 pr-2 bg-slate-200 rounded-md")}
      aria-label="Add">
        <Icon path={mdiPlus} size={0.75}/> Add
    </button>
  </div>
}

const capitalize = (a: string) =>
  a[0]!.toUpperCase() + a.slice(1)

const CSS_PROPERTIES =
  Object.keys(document.documentElement.style)

const excludeKeys = (o: Record<string, string>, ks: string[]) =>
  Object.fromEntries(
    Object.entries(o)
    .filter(([k]) => !ks.includes(k))
  )

const includeKeys = (o: Record<string, string>, ks: string[]) =>
  Object.fromEntries(
    Object.entries(o)
    .filter(([k]) => ks.includes(k))
  )
