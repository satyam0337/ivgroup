import { observer } from "mobx-react";
import { forwardRef, ReactNode, Ref, useState } from "react";
import Dialog from "./ui/Dialog";
import { cn } from "./extras";
import Select from "./ui/Select";
import { useStore } from "./App";
import { applySet } from "mobx-keystone";

const PageSettingsButton = observer(forwardRef(({ className, icon }: { className: string, icon: ReactNode }, ref: Ref<HTMLButtonElement>) => {
  let [isDialogOpen, setIsDialogOpen] = useState(false)

  return <>
    <button ref={ref} className={className} onClick={() => setIsDialogOpen(true)}>
      {icon}
    </button>
    {isDialogOpen && <PageSettingsDialog onClose={() => setIsDialogOpen(false)}/>}
  </>
}))
export default PageSettingsButton;

const PageSettingsDialog = observer(({ onClose }: { onClose: () => void }) => {
  let store = useStore()
  let pageSizeTypes = [
    { value: PAGE_SIZE_TYPE_RESPONSIVE, label: "Pageless / Responsive" },
    ...Object.keys(pageSizes).map(name => ({ value: name as keyof typeof pageSizes, label: name })),
    { value: PAGE_SIZE_TYPE_OTHER, label: "Other" }
  ]
  type PageSizeType = (typeof pageSizeTypes)[number]["value"]
  let [pageSizeType, setPageSizeType] = useState<PageSizeType>(
    store.page.type === "pageless"
      ? PAGE_SIZE_TYPE_RESPONSIVE
      : Object.entries(pageSizes).flatMap(([name, { width, height }]) => {
          let page = store.page as Extract<typeof store.page, { type: "paged" }>
          return width === page.width && height === page.height
            ? [name as PageSizeType]
            : []
        })[0] ?? PAGE_SIZE_TYPE_OTHER
  )
  let [width, setWidth] = useState(
    pageSizeType === PAGE_SIZE_TYPE_OTHER
      ? (store.page as Extract<typeof store.page, { type: "paged" }>).width
      : ""
  )
  let [height, setHeight] = useState(
    pageSizeType === PAGE_SIZE_TYPE_OTHER
      ? (store.page as Extract<typeof store.page, { type: "paged" }>).height
      : ""
  )
  let [orientation, setOrientation] = useState(
    store.page.type === "paged" ? store.page.orientation : undefined
  )

  const onOk = () => {
    if (pageSizeType === PAGE_SIZE_TYPE_RESPONSIVE) {
      applySet(store, "page", { type: "pageless" })
      onClose()
      return
    }
    if (!orientation) {
      alert("Select orientation")
      return
    }
    if (pageSizeType === PAGE_SIZE_TYPE_OTHER) {
      if (!/^[0-9.]+(px|%|cm|mm|in)$/.test(width.trim())) {
        alert("Invalid width")
        return
      }
      if (!/^[0-9.]+(px|%|cm|mm|in)$/.test(height.trim())) {
        alert("Invalid height")
        return
      }
      applySet(store, "page", { type: "paged", width: width.trim(), height: height.trim(), orientation })
      onClose()
      return
    }
    applySet(store, "page", { type: "paged", ...pageSizes[pageSizeType], orientation })
    onClose()
  }
  

  return <Dialog onClose={onClose}>
    <div className="w-[300px]">
      <p>Page size</p>
      <Select
        value={pageSizeType}
        options={pageSizeTypes}
        onChange={value => {
          setPageSizeType(value!)
          if (value === PAGE_SIZE_TYPE_OTHER) {
            setWidth("")
            setHeight("")
          }
          if (value !== PAGE_SIZE_TYPE_RESPONSIVE && orientation === undefined) {
            setOrientation("portrait")
          }
        }}
        className="w-full"/>
      {pageSizeType === PAGE_SIZE_TYPE_OTHER && <div className="flex gap-1 mt-1">
        <input
          value={width}
          onChange={e => {
            setWidth(e.target.value)
          }}
          className="w-[50%] rounded-md border border-slate-300 p-1 text-base"
          placeholder="Width"/>
        <span className="text-xl">&times;</span>
        <input
          value={height}
          onChange={e => {
            setHeight(e.target.value)
          }}
          className="w-[50%] rounded-md border border-slate-300 p-1 text-base"
          placeholder="Height"/>
      </div>}
      {pageSizeType !== PAGE_SIZE_TYPE_RESPONSIVE && <>
        <p className="mt-2">Page Orientation</p>
        <div className="flex gap-2">
          <label className="flex">
            <input
              type="radio"
              checked={orientation === "portrait"}
              onChange={e => e.target.checked && setOrientation("portrait")} />
            <span className="text-base ml-1">Portrait</span>
          </label>
          <label className="flex">
            <input
              type="radio"
              checked={orientation === "landscape"}
              onChange={e => e.target.checked && setOrientation("landscape")} />
            {" "}
            <span className="text-base ml-1">Landscape</span>
          </label>
        </div>
      </>}
      <div className="float-right mt-4 flex gap-2">
        <button
          onClick={onClose}
          className={cn("px-2.5 py-1.5 bg-slate-300 rounded-md")}>
            Cancel
        </button>
        <button
          onClick={onOk}
          className={cn("px-2.5 py-1.5 bg-blue-400 rounded-md")}>
            Ok
        </button>
      </div>
    </div>
  </Dialog>
})

const pageSizes = {
  "A4": {
    width: "210mm",
    height: "297mm"
  },
  "A5": {
    width: "148.5mm",
    height: "210mm"
  },
  "Letter": {
    width: "216mm",
    height: "279mm"
  },
  "Legal": {
    width: "216mm",
    height: "356mm"
  }
}

const PAGE_SIZE_TYPE_OTHER = "OTHER" as const
const PAGE_SIZE_TYPE_RESPONSIVE = "RESPONSIVE" as const
