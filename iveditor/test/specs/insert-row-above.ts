import { openIVEditor } from "../utils"

describe("insert row above", () => {
  before(async () => {
    await openIVEditor()
  })

  it("reconciliation doesn't empty the selected cell", async () => {
    let $00_00 = $("[data-cell='0-0 0-0']")

    await $00_00.click()
    await browser.keys("abc")
    await expect(await $00_00.getText()).toBe("abc")
    
    await $("[aria-label='Insert Row Above']").click()
    await expect(await $00_00.getText()).toBe("")

    let $00_10 = $("[data-cell='0-0 1-0']")
    await expect(await $00_10.getText()).toBe("abc")
  })
})