import { mdiMagnify } from "@mdi/js";
import Icon from "@mdi/react";
import { useStore } from "./App";
import { observer } from "mobx-react";
import { cn, useEffectEvent } from "./extras";
import { useEffect, useRef, useState } from "react";
import { Text } from "./store";
import { $getSelection, $applyNodeReplacement, type DOMConversionMap, type DOMConversionOutput, type DOMExportOutput, type EditorConfig, type NodeKey, type SerializedTextNode, type Spread, TextNode, LexicalEditor, $isRangeSelection, LexicalNode, } from "lexical";

const DataSearch = observer(() => {
  let state = useStore()
  let [isOpen, setIsOpen] = useState(false)
  let [query, setQuery] = useState("")
  let dataAttributes = state.document.type === "lrPrint" ? state.lrPrintDataAttributes.value : state.invoicePrintDataAttributes.value
 let filteredDataAttributes =
    dataAttributes && [
      ...search(dataAttributes, query),
      query
    ]
  let [selectedIndex, setSelectedIndex] = useState(0)
  let itemsContainerRef = useRef(null as null | HTMLDivElement)

  const insertDataNode = (dataAttribute: string) => {
    if (!(state.selection?.current instanceof Text)) return
    state.selection.current.editor!.update(() => {
      let selection = $getSelection()
      let dataNode = $createDataNode(dataAttribute)
      if (!$isRangeSelection(selection)) return
      dataNode.setStyle(selection.style)
      selection.insertNodes([dataNode])
    })
  }

  const scrollItemIntoViewIfNeeded = (index: number) => {
    let selectedItem = itemsContainerRef.current!.children[index]!
    let selectedItemRect = selectedItem.getBoundingClientRect()
    let containerRect = itemsContainerRef.current!.getBoundingClientRect()
    if (
      (selectedItemRect.top > containerRect.top + containerRect.height) ||
      selectedItemRect.top < containerRect.top
    ) {
      selectedItem.scrollIntoView()
    }
  }

  const close = () => {
    setIsOpen(false)
    setQuery("")
    setSelectedIndex(0)
  }

  const onKeyDown: JSX.IntrinsicElements["input"]["onKeyDown"] = e => {
    if (e.key === "ArrowUp") {
      if (selectedIndex === 0) return
      setSelectedIndex(selectedIndex - 1)
      scrollItemIntoViewIfNeeded(selectedIndex - 1)
      return
    }

    if (e.key === "ArrowDown") {
      if (selectedIndex === filteredDataAttributes!.length - 1) return
      setSelectedIndex(selectedIndex + 1)
      scrollItemIntoViewIfNeeded(selectedIndex + 1)
      return
    }

    if (e.key !== "Enter") setSelectedIndex(0)
  }

  const onWindowKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "d" && e.ctrlKey && !isOpen) {
      e.preventDefault()
      let selection = state.selection?.current
      if (selection instanceof Text && selection.editor?.getEditorState().read(() => $getSelection())) {
        setIsOpen(true)
      }
    }
    if (e.key === "Escape" && isOpen) {
      close()
    }
    if (e.key === "Enter" && isOpen) {
      e.preventDefault()
      close()
      insertDataNode(filteredDataAttributes![selectedIndex]!)
    }
  })

  useEffect(() => {
    window.addEventListener("keydown", onWindowKeyDown)
    return () => window.removeEventListener("keydown", onWindowKeyDown)
  }, [onWindowKeyDown])

  return isOpen && <>
    <div className="flex flex-col fixed top-[15%] bottom-[15%] w-[60%] left-[50%] translate-x-[-50%] bg-white rounded-md p-2 z-[2]">
      <div className="flex items-center gap-1- px-2">
        <Icon path={mdiMagnify} size={1}/>
        <input onKeyDown={onKeyDown} className="text-xl flex-1 p-2" value={query} onChange={e => setQuery(e.target.value)} autoFocus/>
      </div>
      <div className="overflow-auto p-2" ref={itemsContainerRef}>
        {filteredDataAttributes?.map((dataAttribute, i) =>
          <div
            onMouseOver={() => setSelectedIndex(i)}
            onClick={() => {
              close()
              insertDataNode(dataAttribute)
            }}
            className={cn("p-2 rounded-md cursor-pointer", i === selectedIndex && "bg-blue-500 text-white")}
            key={dataAttribute}>
              {dataAttribute}
          </div>
        )}
      </div>
    </div>
    <div onClick={() => { close() }} className="fixed inset-0 bg-[rgba(0,0,0,0.2)] backdrop-blur-md z-[1]"></div>
  </>
})
export default DataSearch;

// https://github.com/facebook/lexical/blob/031891eda7f37563666f3fcf0d8f18d1fa8904a7/packages/lexical-playground/src/nodes/MentionNode.ts
export class DataNode extends TextNode {
  __dataAttribute: string;

  static getType(): string {
    return "data";
  }

  static clone(node: DataNode): DataNode {
    return new DataNode(node.__dataAttribute, node.__text, node.__key);
  }
  static importJSON(serializedNode: SerializedDataNode): DataNode {
    const node = $createDataNode(serializedNode.dataAttribute);
    node.setTextContent(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  constructor(dataAttribute: string, text?: string, key?: NodeKey) {
    super(text ?? dataAttribute, key);
    this.__dataAttribute = dataAttribute;
  }

  exportJSON(): SerializedDataNode {
    return {
      ...super.exportJSON(),
      dataAttribute: this.__dataAttribute,
      type: "data",
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.className = "bg-slate-200";
    let [k, v] = this.__text!.replace(/[\[\]\"\']/g, "").split("=")
    dom.setAttribute(k!, v!)
    return dom;
  }

  exportDOM(e: LexicalEditor): DOMExportOutput {
    let {element: _element} = super.exportDOM(e)
    let element = _element as HTMLElement
    element.removeAttribute("data-lexical-text")
    element.classList.remove("bg-slate-200")
    element.innerHTML = element.innerHTML.replace("bg-slate-200", "").replace(/\[data-.+=[\"\'].+[\"\']\]/g, "")

    return {element};
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-data")) {
          return null;
        }
        return {
          conversion: $convertDataElement,
          priority: 1,
        };
      },
    };
  }

  isTextEntity(): true {
    return true;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }
}

function $createDataNode(dataAttribute: string): DataNode {
  const dataNode = new DataNode(dataAttribute);
  dataNode.setMode("segmented").toggleDirectionless();
  return $applyNodeReplacement(dataNode);
}

export function $isDataNode(node: LexicalNode | null | undefined): node is DataNode {
  return node instanceof DataNode
}

type SerializedDataNode = Spread<
  {
    dataAttribute: string;
  },
  SerializedTextNode
>;

function $convertDataElement(
  domNode: HTMLElement,
): DOMConversionOutput | null {
  const textContent = domNode.textContent;

  if (textContent !== null) {
    const node = $createDataNode(textContent);
    return {
      node,
    };
  }

  return null;
}

const search = (values: string[], query: string) => {
  return values.map(
    value => ({
      score: query.split(" ").map(q => value.toLowerCase().includes(q.toLowerCase())).filter(Boolean).length,
      score2:
        query.split(" ")
        .filter(q => value.toLowerCase().includes(q.toLowerCase()))
        .map(q => value.length - q.length)
        .reduce((a, b) => a + b, 0),
      value
    })
  )
  .filter(a => a.score !== 0)
  .sort((a, b) => (b.score * 1000 + a.score2) - (a.score * 1000 + b.score2))
  .map(a => a.value)
}