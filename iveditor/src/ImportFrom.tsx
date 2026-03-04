import { useState } from "react"
import Dialog from "./ui/Dialog"
import Select from "./ui/Select"
import { assertNever, cn } from "./extras"
import { SnapshotOutOf } from "mobx-keystone"
import { useStore } from "./App"
import { Document, importFromSnapshot, IVEDITOR_PREVIOUS_SESSION_DOCUMENT } from "./store"
import Icon from "@mdi/react"
import { mdiLoading } from "@mdi/js"

const ImportFrom = ({ onClose }: { onClose: () => void }) => {
  let store = useStore()
  let options = [
	{ value: "defaultNew" as const, label: "Default New" },
	{ value: "previousSession" as const, label: "Previous Session" }
  ]
  type Value = (typeof options)[number]["value"] | undefined
  let [selectedValue, setSelectedValue] = useState(undefined as Value)
  let [isImporting, setIsImporting] = useState(false)

  const DEFAULT_NEW_MAP = {
	lrPrint: "/ivcargo/template/lrprint/templates/defaultNew.ive",
	invoicePrint: "/ivcargo/html/print/invoice/templates/defaultNew.ive"
  } as const

  type PrintType = keyof typeof DEFAULT_NEW_MAP

  const getDefaultNewPath = (type?: string) => {
	if (type === "invoicePrint") return DEFAULT_NEW_MAP.invoicePrint
	return DEFAULT_NEW_MAP.lrPrint // safe default
  }


  const onImport = async () => {
	if (!selectedValue) return

	setIsImporting(true)

	if (selectedValue === "defaultNew") {
	  const defaultNewPath = getDefaultNewPath(store.document.type)
	  console.log('defaultNewPath', defaultNewPath)
	  let defaultNewIve = await fetch(defaultNewPath).then(r => r.text())
	  importFromSnapshot(store, JSON.parse(defaultNewIve) as SnapshotOutOf<Document>)
	  setIsImporting(false)
	  onClose()
	  return
	}


	if (selectedValue === "previousSession") {
	  let snapshot = localStorage.getItem(IVEDITOR_PREVIOUS_SESSION_DOCUMENT)
	  if (!snapshot) {
		alert("Sorry, no previous session found")
		return
	  }
	  importFromSnapshot(store, JSON.parse(snapshot) as SnapshotOutOf<Document>)
	  setIsImporting(false)
	  onClose()
	  return
	}

	assertNever(selectedValue)
  }

  return <Dialog onClose={onClose} id="importFrom">
	<p className="mb-2">Import From...</p>
	<Select
	  options={options}
	  value={selectedValue}
	  onChange={setSelectedValue}
	  autoFocus
	  aria-label="Select..." />

	<div className="mt-4 float-right flex gap-2">
	  <button onClick={onClose} className={cn("px-2.5 py-1.5 bg-slate-300 rounded-md")}>
		Cancel
	  </button>
	  <button onClick={onImport} disabled={isImporting} className={cn("flex justify-center gap-2 px-2.5 py-1.5 bg-blue-400 rounded-md relative")}>
		Import
		{isImporting && <div className="absolute inset-0 bg-blue-400 rounded-md flex justify-center items-center">
		  <Icon path={mdiLoading} size={1} className="animate-spin" />
		</div>}
	  </button>
	</div>
  </Dialog>
}
export default ImportFrom
