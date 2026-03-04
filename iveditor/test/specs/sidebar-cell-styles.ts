import { openIVEditor, typeAndHitEnter } from "../utils"

describe("sidebar cell styles", () => {
  before(async () => {
    await openIVEditor()
  })

  it("box model and other styles bifercation works", async () => {
    let $00_00 = $("[data-cell='0-0 0-0']")

    await $00_00.click()
    await typeAndHitEnter($("[aria-label='Padding Top']"), "100px")
    await expect(await $00_00.getAttribute("style")).toContain("padding-top: 100px")

    let $styles = $("#sidebar #cellStyles .customStyles")
    await $styles.$("[aria-label='Add']").click()
    await typeAndHitEnter($styles.$("[aria-label='Style 1'] [aria-label='Name']"), "color")
    await expect(await $styles.$("[aria-label='Style 1'] [aria-label='Value']").getValue()).toBe("")

    await typeAndHitEnter($styles.$("[aria-label='Style 1'] [aria-label='Value']"), "red")
    await expect(await $00_00.getAttribute("style")).toContain("padding-top: 100px")
    await expect(await $00_00.getAttribute("style")).toContain("color: red")

    await $styles.$("[aria-label='Style 1'] [aria-label='Delete']").click()
    await expect(await $00_00.getAttribute("style")).toContain("padding-top: 100px")
    await expect(await $00_00.getAttribute("style")).not.toContain("color: red")

    await $styles.$("[aria-label='Add']").click()
    await $styles.$("[aria-label='Style 1'] [aria-label='Name']").click()
    await browser.keys("padding")
    await expect(await $styles.$("[aria-label='Style 1']").isExisting()).toBe(false)

    await expect((await $00_00.getCSSProperty("padding")).value).toBe("100px 0px 0px 0px")
  })
})
