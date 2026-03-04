import { useEffect, useMemo, useState } from "react"
import { AccountGroup, Document, importFromSnapshot, Store } from "./store"
import { cn } from "./extras"
import Icon from "@mdi/react"
import { mdiLoading } from "@mdi/js"
import { useStore } from "./App"
import { applySet, applySnapshot, getSnapshot  } from "mobx-keystone"
import { observer } from "mobx-react"
import Select from "./ui/Select"

const OpenForGroup = observer(({ onClose }: { onClose: () => void }) => {
  let store = useStore()
  let groupOptions = useMemo(() => store.accountGroups.value?.map(g =>
    ({
      label: `${g.code}: ${g.name} (${g.id})`,
      value: g.id
    })
  ), [store.accountGroups.value])
  let [selectedGroupId, setSelectedGroupId] = useState(undefined as undefined | AccountGroup["id"])
  let [selectedDocumentType, setSelectedDocumentType] = useState<Document["type"]>("lrPrint")
  let printTypeOptions = useMemo(() => 
    !selectedGroupId ? [] : [
      { value: `lrprint_${selectedGroupId}`, label: `Default (lrprint_${selectedGroupId})` },
      { value: `lrprint_A4_${selectedGroupId}`, label: `Branch Wise Laser (lrprint_A4_${selectedGroupId})` },
      { value: `lrprint_dot_matrix_${selectedGroupId}`, label: `Branch Wise Dot Matrix (lrprint_dot_matrix_${selectedGroupId})` },
      { value: CUSTOM_PRINT_TYPE, label: "Custom" }
    ], [selectedGroupId])
  let [_selectedPrintType, _setSelectedPrintType] = useState(undefined as string | undefined)
  let [customPrintType, setCustomPrintType] = useState("")
  let selectedPrintType = _selectedPrintType === CUSTOM_PRINT_TYPE ? customPrintType : _selectedPrintType
  let [error, setError] = useState(undefined as undefined | string)
  let [isShowingConfirmCreate, setIsShowingConfirmCreate] = useState(false)
  let [isOpening, setIsOpening] = useState(false)
  let [isOverwriting, setIsOverwriting] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  const onOpen = async () => {
    if (!selectedGroupId || (selectedDocumentType === "lrPrint" ? !selectedPrintType : false)) return
    setIsOpening(true)
    try {
      let printDirectory = selectedDocumentType === "lrPrint" ? LR_PRINT_DIRECTORY : INVOICE_PRINT_DIRECTORY
      if (!selectedPrintType) selectedPrintType = `invoicePrint_${selectedGroupId}`
      let iveExists = await fetch(printDirectory + selectedPrintType + ".ive", { method: "HEAD" }).then(r => r.ok)
      let htmlExists = await fetch(printDirectory + selectedPrintType + ".html", { method: "HEAD" }).then(r => r.ok)

      if (htmlExists) {
        setIsOverwriting(true)
      }

      if (!iveExists) {
        setIsShowingConfirmCreate(true)
        return
      }

      let fileContent = await fetch(printDirectory + selectedPrintType + ".ive").then(r => r.text())

      store.history.withoutUndo(() => {
        applySet(store, "editingGroupId", selectedGroupId)
        applySet(store, "editingPrintType", selectedPrintType)
        importFromSnapshot(store, JSON.parse(fileContent))
        applySet(store, "isDocumentInitialized", true)
      })
      
      setIsOpening(false)
      onClose()
    } catch (e) {
      console.error(e)
      setError((e as Error).message)
      setIsOpening(false)
    }
  }

  const onYes = () => {
    setIsShowingConfirmCreate(false)
    setIsOpening(true)
    try {
      if (!selectedPrintType) selectedPrintType = `invoicePrint_${selectedGroupId}`
      store.history.withoutUndo(() => {
        applySet(store, "selection", null)
        applySet(store, "editingGroupId", selectedGroupId)
        applySet(store, "editingPrintType", selectedPrintType)
        applySnapshot(store.document, getSnapshot(new Document({ type: selectedDocumentType })))
        applySet(store, "isDocumentInitialized", true)
      })
      setIsOpening(false)
      onClose()
    } catch (e) {
      console.error(e)
      setError((e as Error).message)
      setIsOpening(false)
    }
  }

  return <div>
    <div className="fixed top-[15%] left-[50%] translate-x-[-50%] bg-white rounded-md p-4 z-[2]">
      {error && <p>Something went wrong... {error}. Press escape to close.</p>}
      {!error && <div>
        <p className="mb-1">Open group...</p>
        <Select
          value={selectedGroupId}
          options={groupOptions ?? []}
          onChange={setSelectedGroupId}
          className="mb-2"/>

        <p className="mb-1">Document Type...</p>
        <Select<Document["type"]>
          value={selectedDocumentType}
          options={[
            { label: "LR Print", value: "lrPrint" },
            { label: "Invoice Print", value: "invoicePrint" }
          ]}
          onChange={(v) => {
            if (v) setSelectedDocumentType(v)
          }}
          className="mb-2"
        />


        {selectedDocumentType === "lrPrint" && <>
          <p className="mb-1">Print Type...</p>
          <Select
            value={_selectedPrintType}
            options={printTypeOptions}
            onChange={v => {
              _setSelectedPrintType(v)
              setCustomPrintType("")
            }}
            className="mb-2"/>
          {_selectedPrintType === CUSTOM_PRINT_TYPE && <>
            <input
              value={customPrintType}
              onChange={e => setCustomPrintType(e.target.value)}
              placeholder="Custom LR Type"
              className="w-[300px] rounded-md border border-slate-200 p-1"/>
          </>}
        </>}
        <div>
          <div className="mt-4 float-right flex gap-2">
            <button onClick={onClose} className={cn("px-2.5 py-1.5 bg-slate-300 rounded-md")}>
              Cancel
            </button>
            <button onClick={onOpen} disabled={isOpening} className={cn("flex justify-center gap-2 px-2.5 py-1.5 bg-blue-400 rounded-md relative")}>
              Open
              {isOpening && <div className="absolute inset-0 bg-blue-400 rounded-md flex justify-center items-center">
                <Icon path={mdiLoading} size={1} className="animate-spin"/>
              </div>}
            </button>
          </div>
        </div>
      </div>}
    </div>
    {isShowingConfirmCreate && <ConfirmCreate isOverwriting={isOverwriting} onNo={() => onClose()} onYes={onYes}/>}
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] backdrop-blur-md z-[1]"></div>
  </div>
})
export default OpenForGroup

const CUSTOM_PRINT_TYPE = "CUSTOM_PRINT_TYPE"
const LR_PRINT_DIRECTORY = "/ivcargo/template/lrprint/"
const INVOICE_PRINT_DIRECTORY = "/ivcargo/html/print/invoice/"

export const getPreviewHtmlFilePath = (store: Store) =>
  (store.document.type === "lrPrint" ? LR_PRINT_DIRECTORY : INVOICE_PRINT_DIRECTORY) +
  store.editingPrintType + "_preview.html"

export const getHtmlFilePath = (store: Store) =>
  (store.document.type === "lrPrint" ? LR_PRINT_DIRECTORY : INVOICE_PRINT_DIRECTORY) +
  store.editingPrintType + ".html"

export const getIveFilePath = (store: Store) =>
  (store.document.type === "lrPrint" ? LR_PRINT_DIRECTORY : INVOICE_PRINT_DIRECTORY) +
  store.editingPrintType + ".ive"

const ConfirmCreate = ({ onYes, onNo, isOverwriting }: { onYes: () => void, onNo: () => void, isOverwriting: boolean }) => {
  return <div>
    <div className="fixed top-[15%] left-[50%] translate-x-[-50%] bg-white rounded-md p-4 z-[3]">
      <p>Could not find .ive file{isOverwriting ? ", but found a .html file" : ""}. Do you want to create {isOverwriting ? "an .ive file and overwrite the existing .html file" : "one"}?</p>
      <div className="mt-4 float-right flex gap-2">
        <button onClick={onNo} className={cn("px-2.5 py-1.5 bg-slate-300 rounded-md")}>
          No
        </button>
        <button onClick={onYes} className={cn("flex justify-center gap-2 px-2.5 py-1.5 bg-blue-400 rounded-md")}>
          Yes
        </button>
      </div>
    </div>
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] backdrop-blur-md z-[2]"></div>
  </div>
}