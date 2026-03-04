import { MutableRefObject, useContext, useEffect, useRef } from "react"
import { importFromSnapshot, type Node, selectionRef, Store, Table, Text } from "./store";
import { observer } from "mobx-react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { $applyNodeReplacement, $getRoot, $getSelection, $isRangeSelection, $isTextNode, COMMAND_PRIORITY_EDITOR, EditorConfig, FOCUS_COMMAND, LexicalEditor, ParagraphNode, SerializedParagraphNode, TextNode as LexicalTextNode, LexicalNode, Transform } from "lexical";
import { $patchStyleText } from "@lexical/selection"
import { $generateHtmlFromNodes } from "@lexical/html"
import { autorun } from "mobx";
import { applySet, arrayActions, clone, deepEquals, findParent, fromSnapshot, getParent, getSnapshot, standaloneAction } from "mobx-keystone";
import { StoreContext, useStore } from "./App";
import { assertNever, cn, useReffed } from "./extras";
import { $isDataNode, DataNode } from "./DataSearch";
import { fileOpen, fileSave } from "browser-fs-access";
import { ImageNode } from "./InsertImageButton";
import { hideLoadingOverlay, showLoadingOverlay, showToast, gitPushFiles, writeFile  } from "./ivcargo";
import { getImageDirFromType, ImageType, imageTypes, IVEDITOR_TEMP_DIR, removeSrcFromImageNodes } from "./ImageSettingsButton";
import { getHtmlFilePath, getIveFilePath, getPreviewHtmlFilePath } from "./OpenForGroup";
import { QrCodeNode } from "./InsertQrCodeButton";
import { DEFAULT_FONT_SIZE } from "./Toolbar";
// import * as prettier from "prettier/standalone"
// import * as prettierHtmlPlugin from "prettier/plugins/html"

const Document = observer(() => {
  let state = useContext(StoreContext)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {

      if (e.code === "ArrowUp" && e.ctrlKey) {
        onCtrlArrowUp(state)
      }

      if (e.code === "KeyZ" && e.ctrlKey) {
        if (e.shiftKey) {
          onCtrlShiftZ(state)
          return
        }
        onCtrlZ(state)
      }

      if (e.key === "Escape" && state.selection?.current) {
        onEscape(state)
      }

      if (e.code === "KeyS" && e.ctrlKey) {
        e.preventDefault()
        void onSavePreview(state)
      }

      if (e.code === "KeyP" && e.ctrlKey) {
        e.preventDefault()
        void onPublish(state)
      }

      if (e.code === "KeyC" && e.ctrlKey) {
        void onCopy(state)
      }

      if (e.code === "KeyV" && e.ctrlKey) {
        void onPaste(state, e)
      }

      if (e.code === "Delete") {
        onDelete(state)
      }
    }

    window.onbeforeunload = function() {
      return "Are you sure you want to exit?"
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [state])

  if (!state.isDocumentInitialized) return

  return <div className={cn(state.isDebugViewOn && "debug-view")} id="document">
    <div style={
      state.page.type === "pageless" ? {} :
      ({
        ...(
          state.page.orientation === "portrait"
            ? { width: state.page.width, height: state.page.height }
            : { width: state.page.height, height: state.page.width }
        ),
        border: "1px solid #dc2626"
      })
    }>
      <Node value={state.document.root} parentPosition=""/>
    </div>
  </div>
})
export default Document

const onCtrlArrowUp = standaloneAction("app/Document/onCtrlArrowUp", (state: Store) => {
  if (state.selection === null) return
  let parent = findParent<Text | Table>(state.selection.current, n => n instanceof Text || n instanceof Table)
  if (!parent) return
  if (parent === state.document.root) return
  if (state.selection.current instanceof Text) {
    state.selection.current.editor!.blur()
  }
  state.selection = selectionRef(parent)
})

const onCtrlZ = standaloneAction("app/Document/onCtrlZ", (state: Store) => {
  state.selection = null
  state.history.undo()
})

const onCtrlShiftZ = standaloneAction("app/Document/onCtrlShiftZ", (state: Store) => {
  state.selection = null
  state.history.redo()
})

const onEscape = standaloneAction("app/Document/onEscape", (state: Store) => {
  state.selection = null
})

const onDelete = standaloneAction("app/Document/onDelete", (state: Store) => {
  if (!(state.selection?.current instanceof Table)) return
  let table = state.selection.current
  if (getParent(getParent(table)!) === state.document.root) return
  let parent = getParent<Node[]>(table)!
  let newText = new Text({})
  parent.splice(parent.indexOf(table), 1, newText)
  state.selection = selectionRef(newText)
})

export const onSavePreview = async (store: Store) => {
  if (!store.editingGroupId) {
    alert("Can't save preview as there is no group opened");
    return
  }
  showLoadingOverlay()
  await writeFile(getPreviewHtmlFilePath(store), await getHtml(store, "preview"))
  hideLoadingOverlay()
  setTimeout(() => {
    showToast("success", "Preview saved successfully")
  }, 0);
}

export const onPublish = async (store: Store) => {
  if (!store.editingGroupId) {
    alert("Can't publish as there is no group opened");
    return
  }
  if (!confirm("Are you sure you want to publish?")) return
  showLoadingOverlay()
  await Promise.all([
    writeFile(
      getHtmlFilePath(store),
      await getHtml(store, "forPublish")
    ),
    writeFile(
      getIveFilePath(store),
      exportIve(store)
    ),
    ...Object.keys(store.images).flatMap(async _imageType => {
      let imageType = _imageType as ImageType;
      let url = store.images[imageType]
      if (!url) return []
      if (!url.startsWith(IVEDITOR_TEMP_DIR)) return []
      return [writeFile(
        getImageDirFromType(imageType) + store.editingGroupId + "." + url.split(".").pop(),
        await fetch(url).then(r => r.blob())
      )]
    })
  ])
  showLoadingOverlay()
  await gitPushFiles([
    getHtmlFilePath(store),
    getIveFilePath(store),
    ...Object.keys(store.images).flatMap(_imageType => {
      let imageType = _imageType as ImageType;
      let url = store.images[imageType]
      if (!url) return []
      if (!url.startsWith(IVEDITOR_TEMP_DIR)) return []
      return [getImageDirFromType(imageType) + store.editingGroupId + "." + url.split(".").pop()]
    })
  ])
  hideLoadingOverlay()
  setTimeout(() => {
    showToast("success", "Published successfully")
  }, 0);
}

export const getHtml = async (store: Store, type: "preview" | "forPublish") => {
  let popupHtml =
    !store.document.popupId ? "" : 
    `<div id="${store.document.popupId}" style="display: none;"></div>\n`

  let html = `<html><body><style>${DOCUMENT_STYLE}</style>\n${popupHtml}${nodeToHtml(store.document.root)}</body></html>`

  let exportedDocument = (new DOMParser()).parseFromString(html, "text/html")
  
  if (store.document.type === "lrPrint") {
    store.lrPrintDataAttributes.value!
    .filter(d => d.includes("dynamic") && isCssSelectorValid(d))
    .flatMap(d => [...exportedDocument.querySelectorAll(`${d}`)] as HTMLElement[])
    .forEach(el => {
      let td = el.closest("td")!
      for (let attr of el.attributes) {
        if (attr.name === "style") {
          td.style.cssText += ";" + el.style.cssText;
          continue
        }
        td.setAttribute(attr.name, el.getAttribute(attr.name)!)
      }
      td.style.textAlign = el.closest("p")!.style.textAlign
      td.innerHTML = el.textContent!
    })
  }

  if (store.document.type === "invoicePrint") {
    exportedDocument.querySelectorAll<HTMLElement>("[data-dataTableDetail]").forEach(el => {
      let td = el.closest("td")!
      for (let attr of el.attributes) {
        if (attr.name === "style") {
          td.style.cssText += ";" + el.style.cssText;
          continue
        }
        td.setAttribute(attr.name, el.getAttribute(attr.name)!)
      }
      td.style.textAlign = el.closest("p")!.style.textAlign
      td.innerHTML = el.textContent!

      td.closest("tr")!.setAttribute("data-row", "dataTableDetails")
    })
  }

  if (type === "forPublish") {
    exportedDocument.querySelectorAll("img").forEach(img => {
      if (img.className.split(" ").some(c => Object.keys(imageTypes).includes(c))) {
        img.removeAttribute("src")
      }
    })
  }

  html = exportedDocument.querySelector("body")!.innerHTML

  //html = html.replace(/white-space: pre-wrap;/g, "")

  /*html = 
    await prettier.format(
      html,
      { parser: "html", plugins: [prettierHtmlPlugin], bracketSameLine: true }
    )*/

  
  return html
}

const isCssSelectorValid = (selector: string) => {
  try {
    document.createDocumentFragment().querySelector(selector)
    return true
  } catch {
    return false
  }
}


export const onImportFromIve = async (store: Store) => {
  importFromSnapshot(
    store, 
    JSON.parse(await fileOpen({ extensions: [".ive"] }).then(f => f.text()))
  )
}

export const onDownloadIve = async (store: Store) => {
  await fileSave(
    new Blob([exportIve(store)], { type: "application/ive", }),
    { fileName: "untitled.ive" }
  )
}

export const exportIve = (store: Store) => {
  let document = clone(store.document)
  removeSrcFromImageNodes(document.root)
  return JSON.stringify(getSnapshot(document))
}

export const onDownloadHtml = async (store: Store) => {
  await fileSave(
    new Blob([await getHtml(store, "forPublish")], { type: "text/html" }),
    { fileName: "untitled.html" }
  )
}

const onCopy = async (store: Store) => {
  if (!store.selection) return
  if (store.selection.current instanceof Text) return
  await clipboardWriteText(`iveClipboard:${JSON.stringify(getSnapshot(store.selection.current))}`)
  // navigator.clipboard.writeText doesn't work for large amount of texts
}

const clipboardWriteText = async (data: string) => {
  const textarea = document.createElement("textarea")
  textarea.value = data
  textarea.style.opacity = "0"
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  const success = document.execCommand("copy")
  document.body.removeChild(textarea)
  if (!success) throw new Error("Could not copy data")
}

const onPaste = async (store: Store, event: Event) => {
  if (!store.selection) return
  let clipboardText = await navigator.clipboard.readText()
  if (!clipboardText.startsWith("iveClipboard:")) return
  event.preventDefault()
  clipboardText = clipboardText.slice("iveClipboard:".length)

  let node = store.selection.current
  let nodeParent = getParent<Node[]>(node)!
  applySet(store, "selection", null)
  let newNode = fromSnapshot(JSON.parse(clipboardText), { generateNewIds: true }) as Node
  arrayActions.splice(nodeParent, nodeParent.indexOf(node), 1, newNode)
}


type NodeProps =
  { value: Text | Table
  , parentPosition: string
  }

const Node = observer(({ value, parentPosition }: NodeProps) => {
  return (
    value instanceof Text
      ? <TextNode value={value} /> :
    value instanceof Table
      ? <TableNode value={value} parentPosition={parentPosition}/> :
    assertNever(value)
  )
})

const nodeToHtml = (v: Text | Table) =>
  v instanceof Text ? textNodeToHtml(v) :
  v instanceof Table ? tableNodeToHtml(v) :
  assertNever(v)

type TableNodeProps =
  { value: Table
  , parentPosition: string
  }

const TableNode = observer(({ value, parentPosition }: TableNodeProps) => {
  const startIndex = value.isFirstRowInThead ? 1 : 0
  const endIndex = value.isFirstRowInTfoot ? value.rows.length - 1 : value.rows.length

  return <table
    className={cn(value.className, value.isFirstRowInThead && "has-thead",value.isFirstRowInTfoot && "has-tfoot")}
    style={{ ...value.style }}>
      {
        value.isFirstRowInThead ? <thead>
          <tr>
            {value.rows[0]!.map((td, i) =>
              <Td value={td} key={td.id} position={
                parentPosition !== "" ? `${parentPosition} 0-${i}` : `0-${i}`
              } />
            )}
          </tr>
        </thead> : <></>
      }
      <tbody>{
        value.rows.slice(startIndex, endIndex).map((tr, i) =>
          <tr key={i}>{
            tr.map((td, j) =>
              <Td value={td} key={td.id} position={
                parentPosition !== ""
                  ? `${parentPosition} ${i + startIndex}-${j}`
                  : `${i + startIndex}-${j}`
              }/>
            )
          }</tr>
        )
      }</tbody>
      {
        value.isFirstRowInTfoot ? <tfoot>
          <tr>
            {value.rows[value.rows.length - 1]!.map((td, i) =>
              <Td value={td} key={td.id} position={
                parentPosition !== ""
                  ? `${parentPosition} ${value.rows.length - 1}-${i}`
                  : `${value.rows.length - 1}-${i}`
              } />
            )}
          </tr>
        </tfoot> : <></>
      }
  </table>
})


const tableNodeToHtml = (value: Table) => {
  const startIndex = value.isFirstRowInThead ? 1 : 0
  const endIndex = value.isFirstRowInTfoot ? value.rows.length - 1 : value.rows.length

  return `<table class="${cn(value.className, value.isFirstRowInThead && "has-thead",value.isFirstRowInTfoot && "has-tfoot")}" style="${htmlStyleFromJsStyle(value.style)}">
    ${
      value.isFirstRowInThead
        ? `<thead>
          <tr>
            ${value.rows[0]!.map((td) =>
              tdToHtml(td)
            ).join("\n")}
          </tr>
        </thead>`
        : ""
    }
    <tbody>
      ${value.rows.slice(startIndex, endIndex).map(tr =>
        `<tr>
          ${tr.map(td =>
            tdToHtml(td)
          ).join("\n")}
        </tr>`
      ).join("\n")}
    </tbody>
    ${
      value.isFirstRowInTfoot ? `<tfoot>
          <tr>
            ${value.rows[value.rows.length - 1]!.map((td) =>
              tdToHtml(td)
            ).join("\n")}
          </tr>
        </tfoot>`
        : ""
    }
  </table>`
}


type TdProps = 
  { value: Text | Table
  , position: string
  }

const Td = observer(({ value, position }: TdProps) => {
  let state = useStore()
  let isSelected = state.selection?.current === value

  let tdStyles = (() => {
    if (!state.isDebugViewOn) return value.tdStyle
    return Object.fromEntries(
      Object.entries(value.tdStyle)
      .map(([key, value]) =>
        key === "borderTop" || key === "borderRight" || key === "borderBottom" || key === "borderLeft"
          ? [key, value.replace("none", "dashed")]
          : [key, value]
      )
    )
  })()

  return (
    <td
      className={cn(value.tdClassName, isSelected && "outline outline-2 outline-blue-500")}
      style={{ ...tdStyles }} // spreading to avoid that mobx-keystone error
      ref={v => {
        value.setTdDOMNode(v === null ? undefined : v)
      }}
      onClick={e => {
        e.stopPropagation()
        window.dispatchEvent(new Event("click2"))
        applySet(state, "selection", selectionRef(value))
      }}
      data-cell={position}>
        <Node value={value} parentPosition={position}/>
    </td>
  )
})

const tdToHtml = (value: Text | Table): string =>
  `<td class="${value.tdClassName}" style="${htmlStyleFromJsStyle(value.tdStyle)}">
    ${nodeToHtml(value)}
  </td>`

type TextNodeProps =
  { value: Text
  }

const TextNode = observer(({ value }: TextNodeProps) => {
  let editorRef = useRef(null as null | LexicalEditor)
  let state = useStore()
  let isSelected = state.selection?.current === value

  useEffect(() => {
    if (isSelected) {
      editorRef.current!.focus()
    }
  }, [isSelected])

  useEffect(() => {
    if (!editorRef.current) return
    value.setEditor(editorRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorRef.current])

  let skipOnChange = useRef(false)

  useEffect(() => {
    return autorun(() => {
      JSON.stringify(value.root)
      if (!editorRef.current) return
      if (deepEquals(value.root, editorRef.current!.getEditorState().toJSON())) return // TODO: try to remove this deepEquals check
      skipOnChange.current = true

      let editor = editorRef.current!
      let newState = editor.parseEditorState(value.root)
      setTimeout(() => { // to prevent flushSync error when rendering the image component
        editor.setEditorState(newState)
      }, 0)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <LexicalComposer initialConfig={{
    namespace: "MyEditor",
    onError: console.error,
    nodes: [
      DataNode,
      ImageNode,
      QrCodeNode,
      CustomParagraphNode,
      {
        replace: ParagraphNode,
        with: () => $createCustomParagraphNode(),
        withKlass: CustomParagraphNode,
      },
    ]
  }}>
    <RichTextPlugin
      contentEditable={<ContentEditable spellCheck={false} />}
      placeholder={<></>}
      ErrorBoundary={LexicalErrorBoundary}
    />
    <MyLexicalPlugin
      onFocus={() => onFocus(state, value)}
      editorRef={editorRef}/>
    <OnChangePlugin onChange={editorState => {
      if (skipOnChange.current) {
        skipOnChange.current = false
        return
      }
      if (deepEquals(value.root, editorState.toJSON())) return
      value.setRoot(editorState.toJSON())
    }} />
  </LexicalComposer>
})

const onFocus = standaloneAction("app/Document/Text/onFocus", (state: Store, textNode: Text) => {
  state.selection = selectionRef(textNode)
})

type MyLexicalPluginProps =
  { onFocus: () => void
  , editorRef: MutableRefObject<LexicalEditor | null>
  }

const MyLexicalPlugin = observer(({ onFocus, editorRef }: MyLexicalPluginProps) => {
  let store = useStore()
  let [editor] = useLexicalComposerContext();
  let onFocusRef = useReffed(onFocus);
  let shouldSkipFocus = useRef(false)

  useEffect(() => {
    return editor.registerCommand(
      FOCUS_COMMAND,
      () => {
        editor.update(() => {
          let selection = $getSelection()
          if (
            $isRangeSelection(selection) &&
            selection.getTextContent() === "" &&
            selection.style === ""
          ) {
            let node = selection.focus.getNode()
            if ($isTextNode(node)) selection.setStyle(node.getStyle())
            // when we deeply update the font size
            // somehow the selection doesn't pick the style as expected
            // do we're doing lexical's job manually
            // seems to work fine
          }

          if ($getRoot().getTextContent().trim() !== "") return
          $getRoot().selectEnd()
          selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $patchStyleText(selection, { "font-size": store.toolbar.fontSize + "px" })
            $patchStyleText(selection, { "font-weight": store.toolbar.isBold ? "bold" : "normal" })
            $patchStyleText(selection, { "font-family": store.toolbar.fontFamily })
          }
          
          shouldSkipFocus.current = true
        })

        onFocusRef.current()
        return false
      },
      COMMAND_PRIORITY_EDITOR
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, onFocusRef])

  useEffect(() => {
    editorRef.current = editor
    return () => { editorRef.current = null }
  }, [editor, editorRef])

  useEffect(() => {
    const transform: Transform<LexicalNode> = (node) => {
      let paragraphNode = node.getParent()
      if (!$isCustomParagraphNode(paragraphNode)) return

      let childFontSizes =
        paragraphNode.getChildren()
        .filter(n => $isTextNode(n) || $isDataNode(n))
        .map(node => node.getStyle().match(/font-size:\s*(\d+)px/)?.[1])
        .filter(Boolean)
        .map(Number)

      paragraphNode.setStyle(
        paragraphNode.getStyle().replace(/font-size:\s*(\d+)px;?/, "") +
        `font-size: ${childFontSizes.length > 0 ? Math.max(...childFontSizes) : DEFAULT_FONT_SIZE}px;`
      )
    }
    let d1 = editor.registerNodeTransform(LexicalTextNode, transform)
    let d2 = editor.registerNodeTransform(DataNode, transform)
    return () => (d1(), d2())
  }, [editor])

  return null
})

export class CustomParagraphNode extends ParagraphNode {
  static getType() {
    return "custom-paragraph"
  }

  static clone(node: CustomParagraphNode) {
    return new CustomParagraphNode(node.__key)
  }

  static importJSON(json: SerializedParagraphNode & { style: string }) {
    // SerializedParagraphNode doesn't seem to inherit style from it's parent LexicalElementNode
    // hence & { style: string }
    let node = $createCustomParagraphNode().updateFromJSON(json);
    node.setStyle(json.style)
    return node
  }

  exportJSON() {
    let json = super.exportJSON() as SerializedParagraphNode & { style: string }
    json.style = this.getStyle()
    return json
  }

  createDOM(config: EditorConfig) {
    const element = super.createDOM(config)
    element.style.cssText = this.getStyle()
    return element
  }
  
  updateDOM(prevNode: CustomParagraphNode, dom: HTMLElement, config: EditorConfig) {
    const updated = super.updateDOM(prevNode, dom, config)
    if (dom.style.cssText !== this.getStyle()) {
      dom.style.cssText = this.getStyle()
      return true
    }
    return updated
  }
}

function $createCustomParagraphNode() {
  return $applyNodeReplacement(new CustomParagraphNode());
}

export function $isCustomParagraphNode(node: LexicalNode | null | undefined): node is CustomParagraphNode {
  return node instanceof CustomParagraphNode
}


const textNodeToHtml = (value: Text) => 
  value.editor!.getEditorState().read(() => $generateHtmlFromNodes(value.editor!))

const DOCUMENT_STYLE = 
`
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

body {
  font-family: serif;
}

table {
  border-collapse: collapse;
  width: 100%;
}

td {
  vertical-align: top;
  min-width: 10px;
}

.debug-view td {
  padding: 10px;
}

/* ------------------------------------------------------------ */
/* Border All */

table.border-all > tbody > tr > td {
  border: 1px solid #000;
}


/* ------------------------------------------------------------ */
/* Border All Has Thead */

table.border-all.has-thead > tbody > tr > td,
table.border-all.has-thead > thead > tr > td {
  border: 1px solid #000;
}


/* ------------------------------------------------------------ */
/* Border Inside */

table.border-inside > tbody > tr > td {
  border: 1px solid #000;
}

table.border-inside > tbody > tr:first-child > td {
  border-top: none;
}

table.border-inside > tbody > tr > td:first-child {
  border-left: none;
}

table.border-inside > tbody > tr:last-child > td {
  border-bottom: none;
}

table.border-inside > tbody > tr > td:last-child {
  border-right: none;
}

.debug-view table.border-inside > tbody > tr:first-child > td {
  border-top: 1px dashed #000;
}

.debug-view table.border-inside > tbody > tr > td:first-child {
  border-left: 1px dashed #000;
}

.debug-view table.border-inside > tbody > tr:last-child > td {
  border-bottom: 1px dashed #000;
}

.debug-view table.border-inside > tbody > tr > td:last-child {
  border-right: 1px dashed #000;
}



/* ------------------------------------------------------------ */
/* Border Inside Has Thead */

table.border-inside.has-thead > tbody > tr > td,
table.border-inside.has-thead > thead > tr > td {
  border: 1px solid #000;
}

table.border-inside.has-thead > thead > tr:first-child > td {
  border-top: none;
}

table.border-inside.has-thead > tbody > tr > td:first-child,
table.border-inside.has-thead > thead > tr > td:first-child {
  border-left: none;
}

table.border-inside.has-thead > tbody > tr:last-child > td {
  border-bottom: none;
}

table.border-inside.has-thead > tbody > tr > td:last-child,
table.border-inside.has-thead > thead > tr > td:last-child {
  border-right: none;
}

.debug-view table.border-inside.has-thead > thead > tr:first-child > td {
  border-top: 1px dashed black;
}

.debug-view table.border-inside.has-thead > tbody > tr > td:first-child,
.debug-view table.border-inside.has-thead > thead > tr > td:first-child {
  border-left: 1px dashed black;
}

.debug-view table.border-inside.has-thead > tbody > tr:last-child > td {
  border-bottom: 1px dashed black;
}

.debug-view table.border-inside.has-thead > tbody > tr > td:last-child,
.debug-view table.border-inside.has-thead > thead > tr > td:last-child {
  border-right: 1px dashed black;
}



/* ------------------------------------------------------------ */
/* Border Outside */

table.border-outside > tbody > tr > td {
  border: none;
}

table.border-outside > tbody > tr:first-child > td {
  border-top: 1px solid black;
}

table.border-outside > tbody > tr > td:first-child {
  border-left: 1px solid black;
}

table.border-outside > tbody > tr:last-child > td {
  border-bottom: 1px solid black;
}

table.border-outside > tbody > tr > td:last-child {
  border-right: 1px solid black;
}

.debug-view table.border-outside > tbody > tr > td {
  border: 1px dashed #000;
}


.debug-view table.border-outside > tbody > tr:first-child > td {
  border-top: 1px solid black;
}

.debug-view table.border-outside > tbody > tr > td:first-child {
  border-left: 1px solid black;
}

.debug-view table.border-outside > tbody > tr:last-child > td {
  border-bottom: 1px solid black;
}

.debug-view table.border-outside > tbody > tr > td:last-child {
  border-right: 1px solid black;
}

/* ------------------------------------------------------------ */
/* Border Outside Has Thead */

table.border-outside.has-thead > tbody > tr > td,
table.border-outside.has-thead > thead > tr > td {
  border: none;
}

table.border-outside.has-thead > thead > tr:first-child > td {
  border-top: 1px solid black;
}

table.border-outside.has-thead > tbody > tr > td:first-child,
table.border-outside.has-thead > tbody > tr > td:first-child {
  border-left: 1px solid black;
}

table.border-outside.has-thead > tbody > tr:last-child > td {
  border-bottom: 1px solid black;
}

table.border-outside.has-thead > tbody > tr > td:last-child,
table.border-outside.has-thead > thead > tr > td:last-child {
  border-right: 1px solid black;
}

.debug-view table.border-outside.has-thead > tbody > tr > td,
.debug-view table.border-outside.has-thead > thead > tr > td {
  border: 1px dashed #000;
}

.debug-view table.border-outside.has-thead > thead > tr:first-child > td {
  border-top: 1px solid black;
}

.debug-view table.border-outside.has-thead > tbody > tr > td:first-child,
.debug-view table.border-outside.has-thead > tbody > tr > td:first-child {
  border-left: 1px solid black;
}

.debug-view table.border-outside.has-thead > tbody > tr:last-child > td {
  border-bottom: 1px solid black;
}

.debug-view table.border-outside.has-thead > tbody > tr > td:last-child,
.debug-view table.border-outside.has-thead > thead > tr > td:last-child {
  border-right: 1px solid black;
}



/* ------------------------------------------------------------ */
/* Border None */

table.border-none > tbody > tr > td {
  border: none;
}

.debug-view table.border-none > tbody > tr > td {
  border: 1px dashed #000;
}




/* ------------------------------------------------------------ */
/* Border None Has Thead */

table.border-none.has-thead > tbody > tr > td,
table.border-none.has-thead > thead > tr > td {
  border: none;
}

.debug-view table.border-none.has-thead > tbody > tr > td,
.debug-view table.border-none.has-thead > thead > tr > td {
  border: 1px dashed #000;
}

`




export const htmlStyleFromJsStyle = (styles: object) =>
  Object.entries(styles)
  .map(([key, value]) => `${kebabize(key).replace("webkit-", "-webkit-").replace("moz-", "-moz-")}: ${value};`)
  .join(" ")

const kebabize = (str: string) =>
  str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase())
