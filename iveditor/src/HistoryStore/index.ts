import { applyPatches, onPatches, Patch } from "mobx-keystone"
import { buffer, debounceTime, map, Observable } from "rxjs"

// https://codesandbox.io/p/sandbox/mobx-undo-redo-v4-mwyi6?file=%2Fsrc%2FHistoryStore.ts

class HistoryStore<T extends object> {
  _changes: Change[] = []
  _pointer = -1
  _isRecording = true
  _root: T

  constructor(root: T, { maxUndos = 50 }: { maxUndos?: number } = {}) {
    this._root = root
    new Observable<Change>(observer => {
      onPatches(root, (patches, inversePatches) => {
        if (!this._isRecording) return
        observer.next({ patches, inversePatches })
      })
    }).pipe(
      bufferDebounceTime(250),
      map(changes => {
        let change: Change = { patches: [], inversePatches: [] }
        for (let c of changes) {
          change.patches.push(...c.patches)
          change.inversePatches.unshift(...c.inversePatches.reverse())
        }
        return change
      })
    ).subscribe(change => {
      this._pointer++
      if (this._changes.length > this._pointer) {
        this._changes.splice(this._pointer, this._changes.length - this._pointer)
      }
      this._changes.push(change)
      if (this._changes.length === maxUndos + 1) {
        this._changes.shift()
        this._pointer--;
      }
    })
  }

  undo() {
    this.withoutUndo(() => {
      if (this._pointer < 0) return
      applyPatches(this._root, this._changes[this._pointer]!.inversePatches)
      this._pointer--
    })
  }

  redo() {
    this.withoutUndo(() => {
      if (this._pointer >= this._changes.length - 1) return
      this._pointer++
      applyPatches(this._root, this._changes[this._pointer]!.patches)
    })
  }

  withoutUndo<T>(f: () => T) {
    let originalIsRecording = this._isRecording
    this._isRecording = false
    let r = f()
    this._isRecording = originalIsRecording
    return r
  }

  canUndo() {
    return !(this._pointer < 0)
  }
}
export default HistoryStore

type Change = 
  { patches: Patch[], inversePatches: Patch[] }

const bufferDebounceTime = (time: number) => <T>($: Observable<T>) =>
  $.pipe(buffer($.pipe(debounceTime(time))))