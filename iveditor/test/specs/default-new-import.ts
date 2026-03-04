import { openIVEditor } from "../utils"
import { Key } from "webdriverio"

describe("default-new-import", () => {
  before(async () => {
    await openIVEditor()
  })

  it("looks ok", async () => {
    await $("#toolbar button[aria-label='Menu']").click()
    await $("#toolbar").$("button.*=Import From...").click()
    await $("#importFrom [aria-label='Select...']").click()
    await browser.keys("Default New")
    await browser.keys([Key.Enter])
    await $("#importFrom").$("button.*=Import").click()
    await $(".*=data-account='name'").waitForDisplayed()
    await new Promise(r => setTimeout(r, 1000))
    await expect(browser).toMatchFullPageSnapshot("default-new-import")
    // We actually would like do the following...
    // await expect($("#document")).toMatchElementSnapshot()
    // ...but it doesn't take full snapshot of the element, it gets cut accoring to viewport
  })
})