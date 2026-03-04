import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection"
import { $createNodeSelection, $getSelection, $setSelection, DecoratorNode, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from "lexical"
import { observer } from "mobx-react"
import { forwardRef, ReactNode, Ref, useEffect, useRef } from "react"
import { useStore } from "./App"
import { Text } from "./store"
import { cn } from "./extras"
import { htmlStyleFromJsStyle } from "./Document"
import { QRCode } from "./ivcargo"

const InsertQrcodeButton = observer(forwardRef(({ className, icon, "aria-label": ariaLabel }: { className: string, icon: ReactNode, "aria-label"?: string }, ref: Ref<HTMLButtonElement>) => {
  let state = useStore()

  const onInsertQrCodeIntent = () => {
    if (!(state.selection?.current instanceof Text)) return
    state.selection.current.editor!.update(() => {
      $getSelection()?.insertNodes([$createQrCodeNode(90, {})])
    })
  }

  if (state.document.type === "invoicePrint")
    return <></>

  return <>
    <button onClick={onInsertQrCodeIntent} className={className} ref={ref} aria-label={ariaLabel}>
      {icon}
    </button>
  </>
}))
export default InsertQrcodeButton

export type SerializedQrCodeNode = Spread<
  {
    type: "qrCode",
    version: 1,
    size: number,
    style: Record<string, string>
  },
  SerializedLexicalNode
>;

const QrCode = observer(({ style, nodeKey, size }: {
  size: number,
  style: Record<string, string>,
  nodeKey: NodeKey,
}) => {
  let [editor] = useLexicalComposerContext()
  let [isSelected] = useLexicalNodeSelection(nodeKey)
  let state = useStore()
  let selectedEditor = state.selection?.current instanceof Text ? state.selection.current.editor : undefined;
  let ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.childNodes.forEach(el => el.remove())
    let qrCode = new QRCode(ref.current, { width: size, height: size })
    qrCode.makeCode("test")
  }, [size])

  return (
    <span 
      ref={ref}
      className={cn(isSelected && editor === selectedEditor && "outline outline-2 outline-blue-500")}
      style={{
        display: "inline-block",
        ...style
      }}
      draggable={false}
      onClick={() => {
        editor.update(() => {
          let selection = $createNodeSelection()
          selection.add(nodeKey)
          $setSelection(selection)
        })
      }}
    />
  )
})

export class QrCodeNode extends DecoratorNode<JSX.Element> {
  __size: number
  __style: Record<string, string>

  static getType(): string {
    return "qrCode";
  }

  static clone(node: QrCodeNode): QrCodeNode {
    return new QrCodeNode(node.__size, node.__style, node.__key)
  }

  constructor(size: number, style: Record<string, string>, key?: NodeKey) {
    super(key)
    this.__size = size
    this.__style = style
  }

  setSize(size: number) {
    this.getWritable().__size = size
  }

  setStyle(style: Record<string, string>) {
    this.getWritable().__style = style
  }

  createDOM(): HTMLElement {
    const span = document.createElement("span")
    span.style.display = "inline-block"
    span.contentEditable = "false"
    return span
  }

  exportDOM() {
    const element = document.createElement("span")
    element.setAttribute("data-qrcode", "true")
    element.setAttribute("data-qrcode-size", this.__size.toString())
    let style = { ...this.__style }
    if (style.display === undefined) {
      style.display = "inline-block"
    }
    element.setAttribute("style", htmlStyleFromJsStyle(style))
    return { element }
  }

  updateDOM() {
    return false
  }

  isInline() {
    return true
  }

  decorate(): JSX.Element {
    return <QrCode 
      size={this.__size}
      style={{...this.__style}} // React freezes the style object which isn't compatible with mobx
      nodeKey={this.getKey()}
    />
  }

  exportJSON(): SerializedQrCodeNode {
    return {
      type: "qrCode",
      version: 1,
      size: this.__size,
      style: this.__style,
    }
  }

  static importJSON(serializedNode: SerializedQrCodeNode): QrCodeNode {
    return $createQrCodeNode(
      serializedNode.size,
      serializedNode.style
    )
  }
}

export function $createQrCodeNode(size: number, styles: Record<string, string>) {
  return new QrCodeNode(size, styles)
}

export function $isQrCodeNode(node: LexicalNode | null | undefined): node is QrCodeNode {
  return node instanceof QrCodeNode
}

export const isSerializedQrCodeNode = (node: unknown): node is SerializedQrCodeNode =>
  typeof node === "object" && node !== null && "type" in node && node.type === "qrCode"
