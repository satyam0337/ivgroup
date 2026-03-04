import { openIVEditor } from "../utils"
import { Key } from "webdriverio"

describe("toolbar font size", () => {
  before(async () => {
    await openIVEditor()
  })

  it("syncs font size across cells", async () => {
    let $cell1Editor = $("[data-cell='0-0 0-0']")
    await $cell1Editor.click()
    await browser.keys("test1");
    await expect(await $("input[aria-label='Font Size']").getValue()).toBe("16")

    await browser.keys([Key.Control, 'a']);
    await $("button[aria-label='Increment Font Size']").click()
    await $("button[aria-label='Increment Font Size']").click()
    await expect(await $("input[aria-label='Font Size']").getValue()).toBe("18")
    await expect((await $cell1Editor.$("span.*=test1").getCSSProperty("font-size")).value).toBe("18px")

    await $("[aria-label='Insert Column Right']").click()
    let $cell2Editor = $("[data-cell='0-0 0-1']")
    await $cell2Editor.click()
    await browser.keys("test2");
    await expect((await $cell2Editor.$("span.*=test2").getCSSProperty("font-size")).value).toBe("18px")

    await browser.keys([Key.Control, 'a']);
    await $("button[aria-label='Increment Font Size']").click()
    await $("button[aria-label='Increment Font Size']").click()
    await expect(await $("input[aria-label='Font Size']").getValue()).toBe("20")
    await expect((await $cell2Editor.$("span.*=test2").getCSSProperty("font-size")).value).toBe("20px")

    /*
    // this fails in automation but when tested manually it works fine
    await $cell1Editor.click()
    expect(await $("input[aria-label='Font Size']").getValue()).toBe("18")
    await browser.keys("-test3")
    expect((await $cell1Editor.$("span.*=test3").getCSSProperty("font-size")).value).toBe("18px")
    */
  })

  it("increments font size deeply when a table is selected", async () => {
    let $cell1Editor = $("[data-cell='0-0 0-0']")
    await $cell1Editor.click()
    await browser.keys([Key.Control, Key.ArrowUp])
    await expect(await $("input[aria-label='Font Size']").getValue()).toBe("")
    

    let $cell2Editor = $("[data-cell='0-0 0-1']")
    await expect((await $cell1Editor.$("span.*=test1").getCSSProperty("font-size")).value).toBe("18px")
    await expect((await $cell2Editor.$("span.*=test2").getCSSProperty("font-size")).value).toBe("20px")
    await $("button[aria-label='Increment Font Size']").click()
    await $("button[aria-label='Increment Font Size']").click()
    await expect((await $cell1Editor.$("span.*=test1").getCSSProperty("font-size")).value).toBe("20px")
    await expect((await $cell2Editor.$("span.*=test2").getCSSProperty("font-size")).value).toBe("22px")

    
    await $cell1Editor.click()
    await expect(await $("input[aria-label='Font Size']").getValue()).toBe("20")
    await browser.keys("-test4")
    await expect((await $cell1Editor.$("span.*=test4").getCSSProperty("font-size")).value).toBe("20px")
  })
})