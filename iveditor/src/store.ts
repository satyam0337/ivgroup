export {
  Text,
  Table,
  type Node,
  Document,
  Store,
  createStore,
  selectionRef,
}

import { applySnapshot, detach, getSnapshot, idProp, Model, model, modelAction, onSnapshot, registerRootStore, rootRef, SnapshotOutOf, standaloneAction, tProp, types } from "mobx-keystone"
import { LexicalEditor, SerializedEditorState } from "lexical"
import HistoryStore from "./HistoryStore"
import { action, observable, runInAction, toJS } from "mobx"
import { getAccountGroups, showToast } from "./ivcargo"
import { ImageType, updateImageNodes } from "./ImageSettingsButton"
import { exportIve } from "./Document"
import { LATEST_VERSION, migrate } from "./migration"
import { DEFAULT_FONT_FAMILY, DEFAULT_FONT_SIZE } from "./Toolbar"

const TEXT_EMPTY_ROOT = {"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0}],"direction":null,"format":"","indent":0,"type":"root","version":1}} as unknown as SerializedEditorState

@model("app/Text")
class Text extends Model({
  id: idProp,
  root: tProp(types.unchecked<SerializedEditorState>(), () => TEXT_EMPTY_ROOT),
  tdStyle: tProp(types.record(types.string), {}),
  tdClassName: tProp(types.string, "")
}) {

  @observable
  editor: LexicalEditor | undefined

  @action
  setEditor(editor: LexicalEditor) {
    this.editor = editor
  }

  @observable tdDOMNode: HTMLElement | undefined

  @action
  setTdDOMNode(v: HTMLElement | undefined) {
    this.tdDOMNode = v
  }

  getRefId() {
    return this.id
  }

  @modelAction
  setRoot(root: SerializedEditorState) {
    this.root = root
  }
}

@model("app/Table")
class Table extends Model({
  id: idProp,
  rows: tProp(types.array(types.array(
    types.or(
      types.model(Text),
      types.model<Table>(() => Table)
    )
  ))),
  className: tProp(types.string, "border-all"),
  tdStyle: tProp(types.record(types.string), {}),
  style: tProp(types.record(types.string), {}),
  isFirstRowInThead: tProp(types.boolean, false),
  isFirstRowInTfoot: tProp(types.boolean, false),
  tdClassName: tProp(types.string, "")
}) {
  @observable tdDOMNode: HTMLElement | undefined

  @action
  setTdDOMNode(v: HTMLElement | undefined) {
    this.tdDOMNode = v
  }

  getRefId() {
    return this.id
  }
}

const selectionRef = rootRef<Table | Text>("app/selectionRef", {
  onResolvedValueChange(ref, newNode, oldNode) {
    if (oldNode && !newNode) {
      detach(ref)
    }
  },
})

type Node = Table | Text

@model("app/Document")
class Document extends Model({
  version: tProp(types.number, LATEST_VERSION),
  type: tProp(
    types.or(
      types.literal("lrPrint"),
      types.literal("invoicePrint")
    ),
    "lrPrint"
  ),
  root: tProp(
    types.or(
      types.model(Text),
      types.model<Table>(() => Table)
    ),
    () => new Table({ rows: [[new Table({ rows: [[new Text({})]], className: "border-all" })]], className: "border-none" })
  ),
  popupId: tProp(types.or(types.string, types.undefined), undefined)
}) {

}

@model("app/Store")
class Store extends Model({
  isDocumentInitialized: tProp(types.boolean, false),
  document: tProp(types.model(Document), () => new Document({})),
  selection: tProp(types.or(types.ref(selectionRef), types.null), null),
  isDebugViewOn: tProp(types.boolean, false),
  editingGroupId: tProp(types.or(types.number, types.undefined), undefined),
  editingPrintType: tProp(types.or(types.string, types.undefined), undefined),
  images: tProp(types.unchecked<Partial<Record<ImageType, string | undefined>>>(), () => ({})),
  page: tProp(
    types.unchecked<
    | { type: "pageless" }
    | { type: "paged", width: string, height: string, orientation: "portrait" | "landscape" }
    >(),
    () => ({ type: "pageless" as const })
  )
}) {

  history = new HistoryStore(this.document)

  @observable
  lrPrintDataAttributes: { value: string[] | undefined } = { value: undefined }

  @observable
  invoicePrintDataAttributes: { value: string[] | undefined } = { value: undefined }

  @observable
  accountGroups: { value: AccountGroup[] | undefined } = { value: undefined }

  @observable
  toolbar = {
    fontSize: DEFAULT_FONT_SIZE.toString(),
    isBold: false,
    fontFamily: DEFAULT_FONT_FAMILY
  }

  async onInit() {
    void fetch("/ivcargo/resources/js/module/print/lrprintsetup.js")
    .then(r => r.text())
    .then(lrPrintSetup => {
      let _dataAttributes = lrPrintSetup.match(/\[data-[^'"]+='[^'"]+']/g)!
      runInAction(() => {
        this.lrPrintDataAttributes.value = [...new Set([..._dataAttributes])]
      })
    })

    void Promise.all([
      fetch("/ivcargo/resources/js/module/view/invoiceprint/invoiceprint.js").then(r => r.text()),
      fetch("/ivcargo/resources/js/module/view/invoiceprint/invoiceprintsetup.js").then(r => r.text())
    ])
    .then(([invoicePrintJs, invoicePrintSetupJs]) => {
      runInAction(() => {
        this.invoicePrintDataAttributes.value = [...new Set([
          ...(
            invoicePrintJs.match(/dataObject\.([a-zA-Z0-9]+)/g)!
            .map(x => `[data-dataTableDetail='${x.slice("dataObject.".length)}']`)
          ),
          ...invoicePrintSetupJs.match(/\[data-[^'"]+='[^'"]+']/g)!
        ])]
      })
    })

    void getAccountGroups().then(gs => {
      runInAction(() => {
        this.accountGroups.value = gs
      })
    })

    let currentSessionDocument = localStorage.getItem(IVEDITOR_CURRENT_SESSION_DOCUMENT)
    if (currentSessionDocument) {
      localStorage.setItem(IVEDITOR_PREVIOUS_SESSION_DOCUMENT, currentSessionDocument)
    }
    onSnapshot(this.document, () => {
      localStorage.setItem(IVEDITOR_CURRENT_SESSION_DOCUMENT, exportIve(this))
    })
  }
}

export const IVEDITOR_CURRENT_SESSION_DOCUMENT = "iveditorCurrentSessionDocument"
export const IVEDITOR_PREVIOUS_SESSION_DOCUMENT = "iveditorPreviousSessionDocument"

export type AccountGroup = 
  Awaited<ReturnType<typeof getAccountGroups>>[number]

const createStore = () => {
  let store = new Store({})
  registerRootStore(store)
  // @ts-ignore
  window.store = store
  // @ts-ignore
  window.toJS = toJS
  // @ts-ignore
  window.getSnapshot = getSnapshot
  return store
}

export const importFromSnapshot = standaloneAction("app/store/importFromSnapshot", (store: Store, snapshot: SnapshotOutOf<Document>) => {
  if (snapshot.version > LATEST_VERSION) {
    alert(`Cannot import a higher version of document. You're importing document of version ${snapshot.version} in iveditor of version ${LATEST_VERSION}.`)
    return
  }

  store.selection = null
  try {
    snapshot = migrate(snapshot) as any
  } catch (e) {
    console.error(e)
    showToast("error", "Something went wrong, could not import document")
    return
  }
  applySnapshot(store.document, snapshot)
  updateImageNodes(store)
})
