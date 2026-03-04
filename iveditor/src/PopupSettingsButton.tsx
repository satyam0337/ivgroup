import { forwardRef, ReactNode, useId, useState } from "react"
import Dialog from "./ui/Dialog";
import { cn } from "./extras";
import { useStore } from "./App";
import { applySet } from "mobx-keystone";
import { observer } from "mobx-react";

const PopupSettingsButton = forwardRef(({ className, icon }: { className: string, icon: ReactNode }, ref: React.Ref<HTMLButtonElement> | undefined ) => {
  const [isSettingsShown, setIsSettingsShown] = useState(false)
  return <>
    <button onClick={() => setIsSettingsShown(true)} className={className} ref={ref}>
      {icon}
    </button>
    {isSettingsShown && <SettingDialog onClose={() => setIsSettingsShown(false)}/>}
  </>
})
export default PopupSettingsButton;

const SettingDialog = observer(({ onClose }: { onClose: () => void }) => {
  let store = useStore()
  let popupId = store.document.popupId
  const setPopupId = (id: typeof popupId) => {
    applySet(store.document, "popupId", id)
  }
  let [otherPopupId, setOtherPopupId] = useState(
    popupId !== undefined && popupId !== POPUP_TBB_PRINT_ZERO_CHARGES
      ? popupId
      : ""
  )
  let radioName = useId()

  return <Dialog onClose={onClose}>
    <p className="mb-2">Select Popup...</p>
    <div>
      <label className="block space-x-2">
        <input
          type="radio"
          name={radioName}
          checked={popupId === undefined}
          onChange={e => {
            if (e.target.checked) {
              setPopupId(undefined)
              setOtherPopupId("")
            }}
          }/>
        <span className="text-base">No Popup</span>
      </label>
      <label className="block space-x-2">
        <input
          type="radio"
          name={radioName}
          checked={popupId === POPUP_TBB_PRINT_ZERO_CHARGES}
          onChange={e => {
            if (e.target.checked) {
              setPopupId(POPUP_TBB_PRINT_ZERO_CHARGES)
              setOtherPopupId("")
            }
          }}/>
        <span className="text-base">Option to Print Zero Charges for TBB</span>
      </label>
      <label className="block space-x-2">
        <input
          type="radio"
          name={radioName}
          checked={popupId === otherPopupId}
          onChange={e => e.target.checked && setPopupId(otherPopupId)}/>
        <input
          type="text"
          placeholder="Other"
          onChange={e => {
            setOtherPopupId(e.target.value)
            setPopupId(e.target.value)
          }}
          value={otherPopupId}
          className="rounded-md border border-slate-300 p-1 text-base"/>
      </label>
    </div>
    <div className="float-right mt-4">
      <button
        onClick={onClose}
        className={cn("flex justify-center gap-2 px-2.5 py-1.5 bg-blue-400 rounded-md relative")}>
          Ok
      </button>
    </div>
  </Dialog>
})

const POPUP_TBB_PRINT_ZERO_CHARGES = "popupTbbPrintZeroCharges"