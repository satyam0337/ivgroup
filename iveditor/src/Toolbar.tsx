import { mdiApplicationCogOutline, mdiChevronDown, mdiFileCogOutline, mdiFormatAlignCenter, mdiFormatAlignLeft, mdiFormatAlignRight, mdiFormatBold, mdiImagePlusOutline, mdiMenu, mdiMinus, mdiPlus, mdiQrcodePlus, mdiTableColumnPlusAfter, mdiTableColumnPlusBefore, mdiTableColumnRemove, mdiTableEye, mdiTablePlus, mdiTableRemove, mdiTableRowPlusAfter, mdiTableRowPlusBefore, mdiTableRowRemove } from "@mdi/js";
import Icon from "@mdi/react";
import { useStore } from "./App";
import { cn } from "./extras";
import { observer } from "mobx-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Node, selectionRef, Store, Table, Text } from "./store";
import { $getSelection, $isElementNode, $isRangeSelection, COMMAND_PRIORITY_CRITICAL, FORMAT_ELEMENT_COMMAND, RangeSelection, SELECTION_CHANGE_COMMAND, SerializedLexicalNode } from "lexical";
import { $getSelectionStyleValueForProperty, $patchStyleText, $isAtNodeEnd } from "@lexical/selection"
import { applySet, applySnapshot, clone, findParent, getParent, getSnapshot, standaloneAction } from "mobx-keystone";
import { autorun, runInAction } from "mobx";
import SelectCreatable from "react-select/creatable"
import Select from "./ui/Select"
import OpenForGroup from "./OpenForGroup";
import KeyboardShortcuts from "./KeyboardShortcuts";
import { onSavePreview, onPublish, onImportFromIve, onDownloadIve, onDownloadHtml } from "./Document";
import Tooltip from "./Tooltip";
import InsertImageButton from "./InsertImageButton";
import ImportFrom from "./ImportFrom";
import PopupSettingsButton from "./PopupSettingsButton";
import { mdiImageCogOutline } from "./ui/extra-icons";
import ImageSettingsButton from "./ImageSettingsButton";
import InsertQrcodeButton from "./InsertQrCodeButton";
import PageSettingsButton from "./PageSettingsButton";
import Dialog from "./ui/Dialog";

const Toolbar = observer(() => {
  let state = useStore()
  let buttonStyle = "p-2 rounded-md hover:bg-slate-200 text-slate-800"
  let activeEditor = (() => {
    if (!state.selection) return null
    if (!(state.selection.current instanceof Text)) return null
    return state.selection.current.editor!
  })()

  let isBold = state.toolbar.isBold
  let setIsBold = (v: boolean) => runInAction(() => {
    state.toolbar.isBold = v
  })
  let fontSize = state.toolbar.fontSize
  let setFontSize = (v: string) => runInAction(() => {
    state.toolbar.fontSize = v
  })
  let fontFamily = state.toolbar.fontFamily
  let setFontFamily = (v: string) => runInAction(() => {
    state.toolbar.fontFamily = v
  })
  let fontFamilies = [
    { value: "sans-serif", label: "Sans Serif" },
    { value: "serif", label: "Serif" },
    { value: "monospace", label: "Monospace" }
  ]
  let [textAlign, setTextAlign] = useState("left")

  const $updateToolbar = useCallback(() => {
    let selection = $getSelection()
    if (!$isRangeSelection(selection)) return

    setIsBold(
      $getSelectionStyleValueForProperty(selection, "font-weight", "normal") === "bold"
    )

    setFontSize(
      $getSelectionStyleValueForProperty(selection, "font-size", `${DEFAULT_FONT_SIZE}px`).slice(0, -2)
    )

    setFontFamily(
      $getSelectionStyleValueForProperty(selection, "font-family", DEFAULT_FONT_FAMILY)
    )

    let node = getSelectedNode(selection)
    let parentNode = node.getParent()
    setTextAlign(($isElementNode(node) ? node.getFormatType() : parentNode?.getFormatType()) || "left")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!activeEditor) return
    return activeEditor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        $updateToolbar()
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [activeEditor, $updateToolbar]);

  useEffect(() => {
    if (!activeEditor) return
    activeEditor.getEditorState().read(() => {
      $updateToolbar();
    });
  }, [activeEditor, $updateToolbar]);

  useEffect(() => {
    if (!activeEditor) return
    return activeEditor.registerUpdateListener(({editorState}) => {
      editorState.read(() => {
        $updateToolbar();
      });
    })
  }, [activeEditor, $updateToolbar])

  useEffect(() => {
    autorun(() => {
      if (state.selection?.current instanceof Table) {
        let fontSize = getFontSizeOfTable(state.selection.current)
        setFontSize(fontSize === MIXED || fontSize === undefined ? "" : fontSize)

        let fontWeight = getFontWeightOfTable(state.selection.current)
        setIsBold(fontWeight === "bold" ? true : false)

        let fontFamily = getFontFamilyOfTable(state.selection.current)
        setFontFamily(fontFamily === MIXED || fontFamily === undefined ? "" : fontFamily)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateSelectionFontSize = (fontSize: string) => {
    if (activeEditor) {
      activeEditor.update(() => {
        let selection = $getSelection()
        if (!selection || fontSize === "") return
        $patchStyleText(selection, { "font-size": fontSize + "px" })
      })
    }
    if (state.selection?.current instanceof Table) {
      updateFontSizeDeeply(state, () => Number(fontSize))
    }
  }
  const updateSelectionFontSizeByDelta = (delta: number) => {
    if (activeEditor) {
      activeEditor.update(() => {
        let selection = $getSelection()
        if (!selection) return
        $patchStyleText(selection, {
          "font-size":
            v =>
              !v
                ? `${DEFAULT_FONT_SIZE + delta}px`
                : `${Math.max(Math.min(Number(v.slice(0, -2)) + delta, MAX_FONT_SIZE), MIN_FONT_SIZE)}px`
        })
      })
      return
    }
    if (state.selection?.current instanceof Table) {
      updateFontSizeDeeply(state, v => v + delta)
    }
  }

  const updateSelectionFontWeight = (isBold: boolean) => {
    if (activeEditor) {
      activeEditor.update(() => {
        let selection = $getSelection()
        if (!selection) return
        $patchStyleText(selection, { "font-weight": isBold ? "bold" : "normal" })
      })
      return
    }
    if (state.selection?.current instanceof Table) {
      updateFontWeightDeeply(state, isBold ? "bold" : "normal")
    }
  }

  const updateSelectionFontFamily = (fontFamily: string) => {
    if (activeEditor) {
      activeEditor.update(() => {
        let selection = $getSelection()
        if (!selection || fontFamily === "") return
        $patchStyleText(selection, { "font-family": fontFamily })
      })
      return
    }
    if (state.selection?.current instanceof Table) {
      if (fontFamily === "") return
      updateFontFamilyDeeply(state, fontFamily)
    }
  }
  
  return <div id="toolbar" className="bg-white flex items-center p-2 rounded-md border-b border-slate-200 sticky z-[1] top-[0]">
    <Menu/>
    <div className="pl-2"></div>
    <div className="text-xl">
      <Tooltip content={state.editingPrintType ?? ""}>{
        !state.isDocumentInitialized ? "" :
        state.editingGroupId && state.accountGroups.value
          ? state.accountGroups.value.find(g => g.id === state.editingGroupId)?.code
          : "untitled"
      }</Tooltip>
    </div>
    <div className="pl-2"></div>
    <Tooltip content="Bold">
      <button
        className={cn(buttonStyle, isBold && "bg-blue-100")}
        onClick={() => {
          setIsBold(!isBold)
          updateSelectionFontWeight(!isBold)
        }}
        aria-label="Bold">
        <Icon path={mdiFormatBold} size={1}/>
      </button>
    </Tooltip>
    <div className="p-1.5 flex gap-1">
      <button
        className={cn(buttonStyle, "p-1")}
        onClick={() => {
          if (fontSize !== "" && activeEditor) setFontSize(
            Math.max(Math.min(Number(fontSize) - 1, MAX_FONT_SIZE), MIN_FONT_SIZE).toString()
          )
          updateSelectionFontSizeByDelta(-1)
        }}
        aria-label="Decrement Font Size">
          <Icon path={mdiMinus} size={0.5} />
      </button>
      <Tooltip content="Font Size">
        <input
          type="number"
          className="w-[36px] rounded-md border border-slate-200 p-0.5 text-center"
          value={fontSize}
          onChange={e => setFontSize(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault()
              updateSelectionFontSize(fontSize)
            }
          }}
          onBlur={() => {
            updateSelectionFontSize(fontSize)
          }}
          min={MIN_FONT_SIZE}
          max={MAX_FONT_SIZE}
          aria-label="Font Size"/>
      </Tooltip>
      <button
        className={cn(buttonStyle, "p-1")}
        onClick={() => {
          if (fontSize !== "" && activeEditor) setFontSize(
            Math.max(Math.min(Number(fontSize) + 1, MAX_FONT_SIZE), MIN_FONT_SIZE).toString()
          )
          updateSelectionFontSizeByDelta(1)
        }}
        aria-label="Increment Font Size">
          <Icon path={mdiPlus} size={0.5} />
      </button>
    </div>
    <SelectCreatable
      options={fontFamilies}
      value={fontFamilies.find(f => f.value === fontFamily)}
      onChange={v => {
        setFontFamily(v?.value ?? "")
        updateSelectionFontFamily(v?.value ?? DEFAULT_FONT_FAMILY)
      }}
      formatCreateLabel={v => v}
      components={{ DropdownIndicator: () => <Icon path={mdiChevronDown} size={1} /> }}
      classNames={{
        control: () => "w-[150px] !min-h-0 rounded-md border border-slate-200 p-1",
        menu: () => "bg-white border border-slate-200",
        option: state => cn(
          "py-1 px-2 hover:bg-slate-200",
          state.isFocused && "bg-slate-200",
          state.isSelected && "bg-blue-500 hover:bg-blue-500 text-white"
        )
      }}
      classNamePrefix="react-select"
      unstyled />
    <div className="pl-1.5"></div>
    <Tooltip content="Left Align">
      <button onClick={() => activeEditor?.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")} className={cn(buttonStyle, textAlign === "left" && "bg-blue-100 mx-1")} aria-label="Left Align">
        <Icon path={mdiFormatAlignLeft} size={1}/>
      </button>
    </Tooltip>
    <Tooltip content="Center Align">
      <button onClick={() => activeEditor?.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")} className={cn(buttonStyle, textAlign === "center" && "bg-blue-100 mx-1")} aria-label="Center Align">
        <Icon path={mdiFormatAlignCenter} size={1}/>
      </button>
    </Tooltip>
    <Tooltip content="Right Align">
      <button onClick={() => activeEditor?.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")} className={cn(buttonStyle, textAlign === "right" && "bg-blue-100 mx-1")} aria-label="Right Align">
        <Icon path={mdiFormatAlignRight} size={1}/>
      </button>
    </Tooltip>
    <div className="pl-4"></div>
    <Tooltip content="Insert Row Below">
      <button onClick={() => onTableRowBelow(state)} className={buttonStyle} aria-label="Insert Row Below">
        <Icon path={mdiTableRowPlusAfter} size={1}/>
      </button>
    </Tooltip>
    <Tooltip content="Insert Row Above">
      <button onClick={() => onTableRowAbove(state)} className={buttonStyle} aria-label="Insert Row Above">
        <Icon path={mdiTableRowPlusBefore} size={1}/>
      </button>
    </Tooltip>
    <Tooltip content="Delete Row">
      <button onClick={() => onTableRowDelete(state)} className={buttonStyle}>
        <Icon path={mdiTableRowRemove} size={1}/>
      </button>
    </Tooltip>
    <div className="pl-4"></div>
    <Tooltip content="Insert Column Right">
      <button onClick={() => onTableColumnRight(state)} className={buttonStyle} aria-label="Insert Column Right">
        <Icon path={mdiTableColumnPlusAfter} size={1}/>
      </button>
    </Tooltip>
    <Tooltip content="Insert Column Left">
      <button onClick={() => onTableColumnLeft(state)} className={buttonStyle}>
        <Icon path={mdiTableColumnPlusBefore} size={1}/>
      </button>
    </Tooltip>
    <Tooltip content="Delete Column">
      <button onClick={() => onTableColumnDelete(state)} className={buttonStyle}>
        <Icon path={mdiTableColumnRemove} size={1}/>
      </button>
    </Tooltip>
    <div className="pl-4"></div>
    <Tooltip content="Insert Table">
      <button onClick={() => onTableWrap(state)} className={buttonStyle} aria-label="Insert Table">
        <Icon path={mdiTablePlus} size={1}/>
      </button>
    </Tooltip>
    <Tooltip content="Delete Table">
      <button onClick={() => onTableDelete(state)} className={buttonStyle}>
        <Icon path={mdiTableRemove} size={1}/>
      </button>
    </Tooltip>
    <Tooltip content="Toggle Debug View">
      <button onClick={() => applySet(state, "isDebugViewOn", !state.isDebugViewOn)} className={cn(buttonStyle, state.isDebugViewOn && "bg-blue-100 mx-1")}>
        <Icon path={mdiTableEye} size={1}></Icon>
      </button>
    </Tooltip>
    {state.editingGroupId && <div className="pl-4"></div>}
    <Tooltip content="Insert Image">
      <InsertImageButton
        className={buttonStyle}
        icon={<Icon path={mdiImagePlusOutline} size={1}></Icon>}/>
    </Tooltip>
    <Tooltip content="Image Settings">
      <ImageSettingsButton
        className={buttonStyle}
        icon={<Icon path={mdiImageCogOutline} size={1}></Icon>}/>
    </Tooltip>
    {state.document.type === "lrPrint" ? <div className="pl-4"></div> : <></>}
    <Tooltip content="Insert QRCode">
      <InsertQrcodeButton
        className={buttonStyle}
        icon={<Icon path={mdiQrcodePlus} size={1}/>}
        aria-label="Insert QRCode"
      />
    </Tooltip>
    <div className="pl-4"></div>
    <Tooltip content="Page Settings">
      <PageSettingsButton
        className={buttonStyle}
        icon={<Icon path={mdiFileCogOutline} size={1}/>}/>
    </Tooltip>
    <Tooltip content="Popup Settings">
      <PopupSettingsButton
        className={buttonStyle}
        icon={<Icon path={mdiApplicationCogOutline} size={1}/>}/>
    </Tooltip>
  </div>
})
export default Toolbar;

const MAX_FONT_SIZE = 200
const MIN_FONT_SIZE = 1
export const DEFAULT_FONT_SIZE = 16
export const DEFAULT_FONT_FAMILY = "serif"

const Menu = observer(() => {
  let store = useStore()
  let [isOpen, setIsOpen] = useState(false)
  let menuRef = useRef<HTMLDivElement | null>(null)
  let buttonRef = useRef<HTMLButtonElement | null>(null)
  let [isOpenForGroupOpen, setIsOpenForGroupOpen] = useState(false)
  let [isOpenBlankOpen, setIsOpenBlankOpen] = useState(false)
  let [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen] = useState(false)
  let [isImportFromOpen, setIsImportFromOpen] = useState(false)
  let menuItemClassName = "flex justify-between gap-4 w-full text-left p-2 hover:bg-slate-200 text-slate-800 rounded-md leading-none"
  let menuItemShortcutClassName = "text-sm text-slate-500 font-mono leading-none mt-[2px]"
  
  useEffect(() => {
    const onWindowClick = (e: Event) => {
      if (e.type === "click2") {
        setIsOpen(false)
        return
      }
      if (buttonRef.current?.contains(e.target as any)) return
      if (menuRef.current?.contains(e.target as any)) return
      if (isOpen === false) return
      setIsOpen(false)
    }

    window.addEventListener("click", onWindowClick)
    window.addEventListener("click2", onWindowClick)
    return () => {
      window.removeEventListener("click", onWindowClick)
      window.removeEventListener("click2", onWindowClick)
    }
  }, [isOpen])

  const onOpenForGroup = () => {
    if (store.history.canUndo()) {
      if (!confirm("Opening a group's lr will discard your changes. Do you want to continue?")) {
        setIsOpen(false);
        return;
      }
    }
    setIsOpenForGroupOpen(true);
    setIsOpen(false);
  }

  const onOpenBlank = () => {
    if (store.history.canUndo()) {
      if (!confirm("Opening blank will discard your changes. Do you want to continue?")) {
        setIsOpen(false);
        return;
      }
    }
    setIsOpenBlankOpen(true)
    setIsOpen(false)
  }

  return <>
    <button ref={buttonRef} onClick={() => setIsOpen(x => !x)} className={cn("p-2 rounded-md hover:bg-slate-200 text-slate-800", isOpen && "bg-slate-200")} aria-label="Menu">
      <Icon path={mdiMenu} size={1}></Icon>
    </button>
    {isOpen && <div ref={menuRef} className="absolute top-[50px] bg-white rounded-md border border-slate-200 p-2">
      <button onClick={onOpenBlank} className={menuItemClassName}>
        <span>Open blank</span>
      </button>
      <button onClick={onOpenForGroup} className={menuItemClassName}>
        <span>Open for group</span>
      </button>
      <button onClick={() => { void onSavePreview(store); setIsOpen(false) }} className={menuItemClassName}>
        <span>Save preview</span>
        <span className={menuItemShortcutClassName}>CTRL+S</span>
      </button>
      <button onClick={() => { void onPublish(store); setIsOpen(false) }} className={menuItemClassName}>
        <span>Publish</span>
        <span className={menuItemShortcutClassName}>CTRL+P</span>
      </button>
      <button onClick={() => { void onImportFromIve(store); setIsOpen(false) }} className={menuItemClassName}>
        <span>Import from .ive</span>
      </button>
      <button onClick={() => { setIsImportFromOpen(true); setIsOpen(false) }} className={menuItemClassName}>
        <span>Import from...</span>
      </button>
      <button onClick={() => { void onDownloadIve(store); setIsOpen(false) }} className={menuItemClassName}>
        <span>Download .ive</span>
      </button>
      <button onClick={() => { void onDownloadHtml(store); setIsOpen(false) }} className={menuItemClassName}>
        <span>Download .html</span>
      </button>
      <button onClick={() => { setIsKeyboardShortcutsOpen(true); setIsOpen(false) }} className={menuItemClassName}>
        <span>Keyboard Shortcuts</span>
      </button>
    </div>}
    {isOpenForGroupOpen && <OpenForGroup onClose={() => setIsOpenForGroupOpen(false)}/>}
    {isOpenBlankOpen && <OpenBlank onClose={() => setIsOpenBlankOpen(false)}/>}
    {isKeyboardShortcutsOpen && <KeyboardShortcuts onClose={() => setIsKeyboardShortcutsOpen(false)}/>}
    {isImportFromOpen && <ImportFrom onClose={() => setIsImportFromOpen(false)}/>}
  </>
})


const onTableRowBelow = standaloneAction("app/Toolbar/onTableRowBelow", (state: Store) => {
  if (!state.selection?.current) return
  let selectedRow = getParent<Node[]>(state.selection.current)!
  let selectedRows = getParent<Node[][]>(selectedRow)!
  let selectedRowIndex = selectedRows.indexOf(selectedRow)
  let newRow = Array.from({ length: selectedRows[0]!.length }, () => new Text({}))
  selectedRows.splice(selectedRowIndex + 1, 0, newRow)
})

const onTableRowAbove = standaloneAction("app/Toolbar/onTableRowAbove", (state: Store) => {
  if (!state.selection?.current) return
  let selectedRow = getParent<Node[]>(state.selection!.current)!
  let selectedRows = getParent<Node[][]>(selectedRow)!
  let selectedRowIndex = selectedRows.indexOf(selectedRow)
  let newRow = Array.from({ length: selectedRows[0]!.length }, () => new Text({}))
  selectedRows.splice(selectedRowIndex, 0, newRow)
})

const onTableRowDelete = standaloneAction("app/Toolbar/onTableRowDelete", (state: Store) => {
  if (!state.selection?.current) return
  let selectedRow = getParent<Node[]>(state.selection!.current)!
  let selectedRows = getParent<Node[][]>(selectedRow)!
  if (selectedRows.length !== 1) {
    let selectedRowIndex = selectedRows.indexOf(selectedRow)
    selectedRows.splice(selectedRowIndex, 1)
    state.selection = null
    return
  }
  let selectedTable = getParent<Table>(selectedRows)!
  if (getParent(selectedTable) !== state.document) {
    let selectedTableParentRows = getParent<Node[]>(selectedTable)!
    let i = selectedTableParentRows.indexOf(selectedTable)
    let newCell = new Text({})
    selectedTableParentRows.splice(i, 1, newCell)
    state.selection = selectionRef(newCell)
    return
  }
})

const onTableColumnLeft = standaloneAction("app/Toolbar/onTableColumnLeft", (state: Store) => {
  if (!state.selection?.current) return
  let selectedCell = state.selection!.current
  let selectedRow = getParent<Node[]>(selectedCell)!
  let i = selectedRow.indexOf(selectedCell)
  let selectedRows = getParent<Node[][]>(selectedRow)!
  for (let row of selectedRows) {
    row.splice(i, 0, new Text({}))
  }
})

const onTableColumnRight = standaloneAction("app/Toolbar/onTableColumnRight", (state: Store) => {
  if (!state.selection?.current) return
  let selectedCell = state.selection!.current
  let selectedRow = getParent<Node[]>(selectedCell)!
  let i = selectedRow.indexOf(selectedCell)
  let selectedRows = getParent<Node[][]>(selectedRow)!
  for (let row of selectedRows) {
    row.splice(i+1, 0, new Text({}))
  }
})

const onTableColumnDelete = standaloneAction("app/Toolbar/onTableColumnDelete", (state: Store) => {
  if (!state.selection?.current) return
  let selectedCell = state.selection!.current
  let selectedRow = getParent<Node[]>(selectedCell)!
  let selectedRows = getParent<Node[][]>(selectedRow)!
  if (selectedRow.length !== 1) {
    let i = selectedRow.indexOf(selectedCell)
    for (let row of selectedRows) {
      row.splice(i, 1)
    }
    state.selection = null
    return
  }
  let selectedTable = getParent<Table>(selectedRows)!
  if (getParent(selectedTable) !== state.document) {
    let selectedTableParentRows = getParent<Node[]>(selectedTable)!
    let i = selectedTableParentRows.indexOf(selectedTable)
    let newCell = new Text({})
    selectedTableParentRows.splice(i, 1, newCell)
    state.selection = selectionRef(newCell)
    return
  }
})

const onTableDelete = standaloneAction("app/Toolbar/onTableDelete", (state: Store) => {
  if (!state.selection?.current) return
  let selectedTable = findParent<Table>(state.selection.current, n => n instanceof Table)!
  if (getParent(selectedTable) !== state.document && getParent(getParent(selectedTable)!) !== state.document) {
    let selectedTableParentRows = getParent<Node[]>(selectedTable)!
    let i = selectedTableParentRows.indexOf(selectedTable)
    let newText = new Text({})
    selectedTableParentRows.splice(i, 1, newText)
    state.selection = selectionRef(newText)
    return
  }
})

const onTableWrap = standaloneAction("app/Toolbar/onTableWrap", (state: Store) => {
  if (!state.selection?.current) return
  if (getParent(state.selection.current) !== state) {
    let selectedCell = state.selection.current
    let selectedRow = getParent<Node[]>(selectedCell)!
    let i = selectedRow.indexOf(selectedCell)

    let newCell = new Table({
      rows: [[clone(selectedCell)]]
    })
    newCell.tdStyle = clone(selectedCell.tdStyle)
    newCell.rows[0]![0]!.tdStyle = {}
    selectedRow.splice(i, 1, newCell)
    state.selection = selectionRef(newCell.rows[0]![0]!)
    return
  }
})

const updateFontSizeDeeply = standaloneAction("app/Toolbar/updateFontSizeDeeply", (store: Store, reducer: (v: number) => number) => {
  if (!(store.selection?.current instanceof Table)) return
  let node = store.selection.current
  updateStyleOfTableDeeply(node, style => {
    if (!style.match(/font-size:\s*(\d+)px/)) {
      const newSize = Math.max(Math.min(reducer(Number(DEFAULT_FONT_SIZE)), MAX_FONT_SIZE), MIN_FONT_SIZE)
      return style + `font-size: ${newSize}px;`
    } else {
      return style.replace(/font-size:\s*(\d+)px/, (_, size) => {
        const newSize = Math.max(Math.min(reducer(Number(size)), MAX_FONT_SIZE), MIN_FONT_SIZE)
        return `font-size: ${newSize}px`
      })
    }
  })
})


const updateFontWeightDeeply = standaloneAction("app/Toolbar/updateFontWeightDeeply", (store: Store, fontWeight: string) => {
  if (!(store.selection?.current instanceof Table)) return
  let node = store.selection.current
  updateStyleOfTableDeeply(node, style => {
    if (style.match(/font-weight:[^;]+(;|$)/)) {
      return style.replace(/font-weight:[^;]+(;|$)/, `font-weight: ${fontWeight};`)
    } else {
      return style + `font-weight: ${fontWeight};`
    }
  })
})

const updateFontFamilyDeeply = standaloneAction("app/Toolbar/updateFontFamilyDeeply", (store: Store, fontFamily: string) => {
  if (!(store.selection?.current instanceof Table)) return
  let node = store.selection.current
  updateStyleOfTableDeeply(node, style => {
    if (style.match(/font-family:[^;]+(;|$)/)) {
      return style.replace(/font-family:[^;]+(;|$)/, `font-family: ${fontFamily};`)
    } else {
      return style + `font-family: ${fontFamily};`
    }
  })
})

const updateStyleOfTableDeeply =  (table: Table, f: (style: string) => string) => {
  let node = table
  const run = (node: Node) => {
    if (node instanceof Text) {
      const run = (node: SerializedLexicalNode) => {
        if ("style" in node && typeof node.style === "string") {
          node.style = f(node.style)
        }
        if ("children" in node && Array.isArray(node.children)) {
          node.children.forEach(run);
        }
      }
      run(node.root.root)
    } else {
      node.rows.forEach(columns => {
        columns.forEach(cell => {
          run(cell)
        })
      })  
    }
  }
  run(node)
}

const getFontSizeOfTable = (table: Table) =>
  matchStyleOfTable(table, style => style.match(/font-size:\s*(\d+)px/)?.[1])

const getFontWeightOfTable = (table: Table) =>
  matchStyleOfTable(table, style => style.match(/font-weight:\s*([^;]+)(?:;|$)/)?.[1])

const getFontFamilyOfTable = (table: Table) =>
  matchStyleOfTable(table, style => style.match(/font-family:\s*([^;]+)(?:;|$)/)?.[1])

const matchStyleOfTable = <T,>(table: Table, f: (style: string) => T | undefined): undefined | T | MIXED => {
  let value = undefined as undefined | T | MIXED;

  rootLoop: for (let row of table.rows) {
    for (let cell of row) {
      let thisValue = cell instanceof Text ? matchStyleOfText(cell, f) : matchStyleOfTable(cell, f)
      if (thisValue === MIXED) {
        value = MIXED
        break rootLoop
      }
      if (thisValue === undefined)  {
        continue
      }
      if (thisValue !== value && value !== undefined) {
        value = MIXED
        break rootLoop;
      }
      value = thisValue
    }
  }

  return value
}

const matchStyleOfText = <T,>(node: Text, f: (style: string) => T) => {
  let value = undefined as undefined | T | MIXED;

  const run = (node: SerializedLexicalNode) => {
    if (value === MIXED) return

    if ("style" in node && typeof node.style === "string") {
      let thisValue = f(node.style);
      if (thisValue !== undefined) {
        if (thisValue !== value && value !== undefined) {
          value = MIXED
          return
        }
        value = thisValue
      }
    }
    if ("children" in node && Array.isArray(node.children)) {
      node.children.forEach(run);
    }
  }
  run(node.root.root)

  return value
}

const OpenBlank = observer(({ onClose }: { onClose: () => void }) => {
  let store = useStore()
  let [documentType, setDocumentType] = useState<Document["type"] | undefined>("lrPrint")

  const onOpen = () => {
    if (!documentType) return
    store.history.withoutUndo(() => {
      openBlank(store, documentType)
    })
    onClose()
  }

  return <Dialog>
    <p className="text-xl font-bold mb-2">Open Blank</p>
    <Select
      value={documentType}
      options={[
        { label: "LR Print", value: "lrPrint" },
        { label: "Invoice Print", value: "invoicePrint" }
      ]}
      onChange={setDocumentType}/>

    <div className="float-right mt-4 flex gap-2">
      <button
        onClick={onClose}
        className={cn("px-2.5 py-1.5 bg-slate-300 rounded-md")}>
          Cancel
      </button>
      <button
        onClick={onOpen}
        className={cn("px-2.5 py-1.5 bg-blue-400 rounded-md")}>
          Open
      </button>
    </div>
  </Dialog>
})

const openBlank = standaloneAction("app/Toolbar/openBlank", (store: Store, type: Document["type"]) => {
  store.selection = null
  store.editingGroupId = undefined
  applySnapshot(store.document, getSnapshot(new Document({ type })))
  store.isDocumentInitialized = true
})

const MIXED = Symbol("MIXED")
type MIXED = typeof MIXED

const getSelectedNode = (selection: RangeSelection) => {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? anchorNode : focusNode;
  }
}