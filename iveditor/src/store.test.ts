import { applySnapshot, getSnapshot } from "mobx-keystone";
import { expect, test } from "vitest";
import { Document } from "./store";

test("applySnapshot behavior with undefined", () => {
  let currentDocument = new Document({ popupId: "testPopup" })
  let importingDocument = new Document({})
  applySnapshot(currentDocument, getSnapshot(importingDocument))
  expect(currentDocument.popupId).toBe(undefined)
})

test("document's default type is lrPrint", () => {
  let importingDocumentSnapshot = getSnapshot(new Document({}))
  // @ts-ignore
  delete importingDocumentSnapshot.type
  let currentDocument = new Document({})
  applySnapshot(currentDocument, importingDocumentSnapshot)
  expect(currentDocument.type).toBe("lrPrint")
})
