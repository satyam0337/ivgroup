import { forwardRef, ReactNode, Ref, useEffect, useState } from "react";
import Dialog from "./ui/Dialog";
import { observer } from "mobx-react";
import { useStore } from "./App";
import { applySet, standaloneAction, walkTree, WalkTreeMode } from "mobx-keystone";
import Icon from "@mdi/react";
import { mdiCancel } from "@mdi/js";
import { fileOpen } from "browser-fs-access";
import { writeFile } from "./ivcargo";
import { nanoid } from "nanoid"
import { Node, Store } from "./store";
import { reaction } from "mobx";
import { isSerializedImageNode } from "./InsertImageButton";
import { cn } from "./extras";

const ImageSettingsButton = observer(forwardRef(({ className, icon }: { className: string, icon: ReactNode }, ref: Ref<HTMLButtonElement>) => {
  let store = useStore()
  let [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    reaction(() => store.editingGroupId, () => {
      setDefaultImages(store)
    })

    reaction(() => JSON.stringify(store.images), () => {
      updateImageNodes(store)
    })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!store.editingGroupId) {
    return <></>
  }

  return <>
    <button ref={ref} className={className} onClick={() => setIsDialogOpen(true)}>
      {icon}
    </button>
    {isDialogOpen && <ImageSettingsDialog onClose={() => setIsDialogOpen(false)}/>}
  </>
}))
export default ImageSettingsButton;

const ImageSettingsDialog = observer(({ onClose }: { onClose: () => void }) => {
  let store = useStore()
  let images = store.images

  const onUploadIntent = async (imageType: ImageType) => {
    let file = await fileOpen({ extensions: imageExtensions })
    let fileExtension = file.name.split(".").pop()
    if (fileExtension !== "png") {
      alert("Only png images allowed")
      return;
    }
    let fileName = nanoid() + "." + fileExtension
    let fileUrl = IVEDITOR_TEMP_DIR + fileName
    await writeFile(fileUrl, file)
    applySet(store.images, imageType, fileUrl)
  }
  
  const onReset = async (imageType: ImageType) => {
    if (!store.editingGroupId) return
    let newUrl = await getDefaultUrlOfImageType(imageType, store.editingGroupId)
    if (newUrl === undefined && isImageTypeUsed(store, imageType)) {
      alert("Cannot delete image, it is being used in the document. First delete from it from the document.")
      return
    }
    applySet(store.images, imageType, newUrl)
  }

  return <Dialog onClose={onClose}>
    <div className="w-[600px] flex flex-wrap">
      {imageTypesKeys.map(imageType =>
        <div className="w-[150px] min-h-[150px] p-2" key={imageType}>
          <p className="text-sm mb-2 h-[40px]">{titleCaseFromCamelCase(imageType)}</p>
          <div className="mb-2">
            {images[imageType]
              ? <img src={images[imageType]} className="block w-full h-[100px] object-contain" />
              : <div className="h-[100px] flex flex-col items-center justify-center opacity-50">
                  <Icon path={mdiCancel} size={1} />
                  <p className="text-xs">No Image</p>
                </div>
            }
          </div>
          <div className="mb-1">
            <button onClick={() => onUploadIntent(imageType)} className="w-full flex justify-center px-1.5 py-0.5 bg-blue-400 rounded-md">
              {images[imageType] ? "Update" : "Upload"}
            </button>
          </div>
          {images[imageType] && !images[imageType].startsWith("/ivcargo/images/") &&
            <div>
              <button onClick={() => onReset(imageType)} className="w-full flex justify-center px-1.5 py-0.5 bg-red-400 rounded-md">
                Reset
              </button>
            </div>
          }
        </div>
      )}
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

export const imageTypes = {
  companyLogo: {
    folderName: "Logo"
  },
  companyHeaderLogo: {
    folderName: "logoheader"
  },
  companyQRLogo: {
    folderName: "QR"
  },
  companySignLogo: {
    folderName: "Sign"
  },
  companyWaterMarkLogo: {
    folderName: "wmk"
  },
  companyGodLogo: {
    folderName: "godlogo"
  },
}
export const imageTypesKeys = Object.keys(imageTypes) as ImageType[]

export type ImageType =
  keyof typeof imageTypes

const imageExtensions =
  ["png"]

const getDefaultUrlOfImageType = (imageType: ImageType, accountGroupId: number) => {
   return Promise.all(
    imageExtensions
    .map(async ext => {
      let url = `/ivcargo/images/${imageTypes[imageType].folderName}/${accountGroupId}.${ext}`
      if (await fetch(url).then(r => r.ok)) {
        return url
      }
      return undefined
    })
  ).then(possibleUrls => possibleUrls.filter(Boolean)[0])
}

export const IVEDITOR_TEMP_DIR =
  "/ivcargo/resources/iveditor/temp/"

export const getImageDirFromType = (imageType: ImageType) =>
  `/ivcargo/images/${imageTypes[imageType].folderName}/`

const titleCaseFromCamelCase = (x: string) => 
  x.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, c => c.toUpperCase())

const setDefaultImages = (store: Store) => { 
  if (!store.editingGroupId) return
  imageTypesKeys.forEach(async imageType =>  {
    applySet(store.images, imageType, await getDefaultUrlOfImageType(imageType, store.editingGroupId!))
  })
}

export const updateImageNodes = standaloneAction("app/ImageSettingsButton/updateImageNodes", (store: Store) => {
  store.history.withoutUndo(() => {
    walkTree(store.document.root, node => {
      if (isSerializedImageNode(node)) {
        let imageType = node.className.split(" ").find(c => Object.keys(imageTypes).includes(c))
        if (!imageType) return
        node.src = store.images[imageType as ImageType] ?? ""
      }
    }, WalkTreeMode.ParentFirst)
  })
})

export const removeSrcFromImageNodes = standaloneAction("app/ImageSettingsButton/removeSrcFromImageNodes", (rootNode: Node) => {
  walkTree(rootNode, node => {
    if (isSerializedImageNode(node)) {
      let imageType = node.className.split(" ").find(c => Object.keys(imageTypes).includes(c))
      if (!imageType) return
      node.src = ""
    }
  }, WalkTreeMode.ParentFirst)
})

export const isImageTypeUsed = (store: Store, imageType: ImageType) => {
  let result = false
  walkTree(store.document.root, node => {
    if (isSerializedImageNode(node) && node.className.includes(imageType)) result = true
  }, WalkTreeMode.ParentFirst)
  return result
}