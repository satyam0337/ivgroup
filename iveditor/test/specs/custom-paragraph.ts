import { Key } from "webdriverio"
import { openIVEditor } from "../utils"

describe("custom paragraph", () => {
  before(async () => {
    await openIVEditor()
  })

  it("has font size as the max of it's children", async () => {
    let $00_00 = $("[data-cell='0-0 0-0']")
    await $00_00.click()
    await browser.keys("test1")
    await browser.keys([Key.Control, 'a']);
    await $("button[aria-label='Decrement Font Size']").click()
    await $("button[aria-label='Decrement Font Size']").click()

    await expect((await $("span.*=test1").getCSSProperty("font-size")).value).toBe("14px")
    await expect((await $("p.*=test1").getCSSProperty("font-size")).value).toBe("14px")
    
    await $00_00.click()
    await $("button[aria-label='Increment Font Size']").click()
    await $("button[aria-label='Increment Font Size']").click()
    await browser.keys("test2")
    await expect((await $("span.*=test1").getCSSProperty("font-size")).value).toBe("14px")
    await expect((await $("span.*=test2").getCSSProperty("font-size")).value).toBe("16px")
    await expect((await $("p.*=test1test2").getCSSProperty("font-size")).value).toBe("16px")

    await $("[aria-label='Insert Column Right']").click()
    let $00_01 = $("[data-cell='0-0 0-1']")
    await $00_01.click()
    await browser.keys("test3")
    await expect((await $("span.*=test3").getCSSProperty("font-size")).value).toBe("16px")
    await expect((await $("p.*=test3").getCSSProperty("font-size")).value).toBe("16px")
  })

  it("works when updating the editor state directly", async () => {
    await browser.keys([Key.Control, Key.ArrowUp])
    await $("button[aria-label='Decrement Font Size']").click()
    await $("button[aria-label='Decrement Font Size']").click()
    await expect((await $("span.*=test1").getCSSProperty("font-size")).value).toBe("12px")
    await expect((await $("span.*=test2").getCSSProperty("font-size")).value).toBe("14px")
    await expect((await $("p.*=test1test2").getCSSProperty("font-size")).value).toBe("14px")
    await expect((await $("span.*=test3").getCSSProperty("font-size")).value).toBe("14px")
    await expect((await $("p.*=test3").getCSSProperty("font-size")).value).toBe("14px")
  })

  it("works with data nodes", async () => {
    let $00_01 = $("[data-cell='0-0 0-1']")
    await $00_01.click()
    await browser.keys([Key.Control, "d"])
    await browser.keys("lr number")
    await browser.keys([Key.Enter])

    await browser.keys([Key.Shift, Key.ArrowLeft])
    await $("button[aria-label='Increment Font Size']").click()
    await $("button[aria-label='Increment Font Size']").click()
    await expect((await $("span.*=data-lr\='number'").getCSSProperty("font-size")).value).toBe("16px")
    await expect((await $("p.*=data-lr\='number'").getCSSProperty("font-size")).value).toBe("16px")
  })

  it("is unaffected by child non-text nodes such as qrcode", async () => {
    let $00_00 = $("[data-cell='0-0 0-0']")
    await $00_00.click()
    await $("button[aria-label='Insert QRCode']").click()
    await browser.keys([Key.Shift, Key.ArrowLeft])
    await $("button[aria-label='Increment Font Size']").click()
    await $("button[aria-label='Increment Font Size']").click()
    await expect((await $("p.*=test1test2").getCSSProperty("font-size")).value).toBe("14px")
    await browser.keys([Key.Shift, Key.ArrowLeft])
    await $("button[aria-label='Increment Font Size']").click()
    await $("button[aria-label='Increment Font Size']").click()
    await expect((await $("p.*=test1test2").getCSSProperty("font-size")).value).toBe("16px")
  })
})