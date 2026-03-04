import { forwardRef, ReactNode, Ref, useEffect, useState } from "react"
import { $getSelection, $setSelection, DecoratorNode, LexicalNode, NodeKey, SerializedLexicalNode, Spread, $createNodeSelection } from "lexical"
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection"
import { cn } from "./extras"
import { useStore } from "./App"
import { Text } from "./store"
import { observer } from "mobx-react"
import Dialog from "./ui/Dialog"
import Select from "./ui/Select"
import { imageTypes, updateImageNodes } from "./ImageSettingsButton"
import { htmlStyleFromJsStyle } from "./Document"

const InsertImageButton = observer(forwardRef(({ className, icon }: { className: string, icon: ReactNode }, ref: Ref<HTMLButtonElement>) => {
  let state = useStore()
  let [isAskingDetails, setIsAskingDetails] = useState(false)

  const onDetails = async ({ src, className }: ImageDetail) => {
    if (!(state.selection?.current instanceof Text)) return
    await new Promise<void>(resolve => {
      (state.selection as { current: Text }).current.editor!.update(() => {
        $getSelection()?.insertNodes([$createImageNode(src, className, {})])
      }, { onUpdate: resolve })
    })
    updateImageNodes(state)
    setIsAskingDetails(false)
  }

  const onInsertIntent = () => {
    setIsAskingDetails(true)
  }

  if (!state.editingGroupId) {
    return <></>
  }

  return <>
    <button onClick={onInsertIntent} className={className} ref={ref}>
      {icon}
    </button>
    {isAskingDetails && <DetailsDialog onValue={onDetails} onCancel={() => setIsAskingDetails(false)}/>}
  </>
}))
export default InsertImageButton

type ImageDetail = {
  src: string,
  className: string
}

const DetailsDialog = observer(({ onValue, onCancel }: {
  onValue: (value: ImageDetail) => void,
  onCancel: () => void
}) => {
  let store = useStore();
  let [imageType, setImageType] = useState<ImageType | undefined>()

  const onInsert = () => {
    if (!imageType) return
    if (!store.images[imageType]) {
      alert(`No ${imageType} image found. First add using the image settings.`)
      return
    }
    onValue({ src: "", className: imageType })
  }

  return <Dialog onClose={onCancel}>
    <p className="text-xl font-bold mb-2">Insert Image</p>
    
    <p className="mb-1">Type...</p>
    <Select
      options={Object.keys(imageTypes).map(type => ({ value: type as ImageType, label: type }))}
      value={imageType}
      onChange={setImageType}
      className="mb-2"/>

    <div>
      <div className="mt-4 float-right flex gap-2">
        <button onClick={onCancel} className={cn("px-2.5 py-1.5 bg-slate-300 rounded-md")}>
          Cancel
        </button>
        <button onClick={onInsert} className={cn("flex justify-center gap-2 px-2.5 py-1.5 bg-blue-400 rounded-md relative")}>
          Insert
        </button>
      </div>    
    </div>
  </Dialog>
})
type ImageType = keyof typeof imageTypes

export type SerializedImageNode = Spread<
  {
    type: "image",
    version: 1,
    src: string,
    className: string,
    style: Record<string, string>
  },
  SerializedLexicalNode
>;

const Image = observer(({ src, className, style: styles, nodeKey }: {
  src: string
  className: string
  style: Record<string, string>,
  nodeKey: NodeKey
}) => {
  let [editor] = useLexicalComposerContext()
  let [isSelected] = useLexicalNodeSelection(nodeKey)
  let state = useStore()
  let selectedEditor = state.selection?.current instanceof Text ? state.selection.current.editor : undefined;

  useEffect(() => {
    editor.getElementByKey(nodeKey)!.style.width = styles.width ?? ""
  }, [editor, nodeKey, styles.width])
  
  return (
    <img 
      src={src}
      className={cn(className, isSelected && editor === selectedEditor && "outline outline-2 outline-blue-500")}
      style={{
        ...styles,
        width: "100%"
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

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string
  __className: string
  __style: Record<string, string>

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__className, node.__style, node.__key)
  }

  constructor(src: string, className: string, style: Record<string, string>, key?: NodeKey) {
    super(key)
    this.__src = src
    this.__className = className
    this.__style = style
  }

  setStyle(style: Record<string, string>) {
    const self = this.getWritable()
    self.__style = style
  }

  setClassName(className: string) {
    const self = this.getWritable()
    self.__className = className
  }

  createDOM(): HTMLElement {
    const span = document.createElement("span")
    span.style.display = "inline-block"
    span.contentEditable = "false"
    return span
  }

  exportDOM() {
    const element = document.createElement("img") 
    element.setAttribute("src", this.__src)
    element.setAttribute("class", this.__className)
    element.setAttribute("style", htmlStyleFromJsStyle(this.__style))
    return { element }
  }

  updateDOM() {
    return false
  }

  decorate(): JSX.Element {
    return <Image 
      src={this.__src}
      className={this.__className}
      style={{...this.__style}} // React freezes the style object which isn't compatible with mobx
      nodeKey={this.getKey()}
    />
  }

  exportJSON(): SerializedImageNode {
    return {
      type: "image",
      version: 1,
      src: this.__src,
      className: this.__className,
      style: this.__style,
    }
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    return $createImageNode(
      serializedNode.src,
      serializedNode.className,
      serializedNode.style
    )
  }
}

export function $createImageNode(src: string, className: string, styles: Record<string, string>) {
  return new ImageNode(src, className, styles)
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode
}

export const isSerializedImageNode = (node: unknown): node is SerializedImageNode =>
  typeof node === "object" && node !== null && "type" in node && node.type === "image"
