import { openIVEditor, typeAndHitEnter } from "../utils"
import { Key } from "webdriverio"

describe("minmal", () => {
  before(async () => {
    await openIVEditor()
  })

  it("can designed", async () => {

    // --------------------
    // step 1
    let $00_00 = $("[data-cell='0-0 0-0']")
    await $00_00.click()
    await $("#toolbar [aria-label='Insert Column Right']").click()
    await $("#toolbar [aria-label='Insert Column Right']").click()
    await expect($("#document")).toMatchElementSnapshot("minimal-step-1")

    
    // --------------------
    // step 2
    let $00_01 = $("[data-cell='0-0 0-1']")
    await $00_01.click()
    await typeAndHitEnter($("#sidebar [aria-label='Width']"), "4%")
    await $00_00.click()
    await typeAndHitEnter($("#sidebar [aria-label='Width']"), "48%")
    let $00_02 = $("[data-cell='0-0 0-2']")
    await $00_02.click()
    await typeAndHitEnter($("#sidebar [aria-label='Width']"), "48%")
    await expect($("#document")).toMatchElementSnapshot("minimal-step-2")

    // --------------------
    // step 3
    await $00_00.click()
    await $("#toolbar [aria-label='Insert Table']").click()
    await $("#toolbar [aria-label='Insert Row Below']").click()
    await expect($("#document")).toMatchElementSnapshot("minimal-step-3")

    // --------------------
    // step 4
    await $("#toolbar [aria-label='Insert Table']").click()
    await $("#toolbar [aria-label='Insert Column Right']").click()
    await $("#toolbar [aria-label='Insert Column Right']").click()
    let $00_00_00 = $("[data-cell='0-0 0-0 0-0 0-0']")
    await $00_00_00.click()
    await typeAndHitEnter($("#sidebar [aria-label='Width']"), "33%")
    let $00_00_01 = $("[data-cell='0-0 0-0 0-0 0-1']")
    await $00_00_01.click()
    await typeAndHitEnter($("#sidebar [aria-label='Width']"), "33%")
    let $00_00_02 = $("[data-cell='0-0 0-0 0-0 0-2']")
    await $00_00_02.click()
    await typeAndHitEnter($("#sidebar [aria-label='Width']"), "33%")
    await expect($("#document")).toMatchElementSnapshot("minimal-step-4")

  
    // --------------------
    // step 5
    await $00_00_00.click()
    await browser.keys("LR Number: ")
    await browser.keys([Key.Control, "d"])
    await browser.keys("lr number")
    await browser.keys([Key.Enter])

    await $00_00_01.click()
    await browser.keys("Source: ")
    await browser.keys([Key.Control, "d"])
    await browser.keys("lr source")
    await browser.keys([Key.Enter])

    await $00_00_02.click()
    await browser.keys("Destination: ")
    await browser.keys([Key.Control, "d"])
    await browser.keys("lr destination")
    await browser.keys([Key.Enter])

    await $00_00_00.click()
    await browser.keys([Key.Control, "a"])
    await $("#toolbar [aria-label='Bold']").click()

    await expect($("#document")).toMatchElementSnapshot("minimal-step-5")

    // --------------------
    // step 6
    let $00_00_10 = $("[data-cell='0-0 0-0 1-0']")
    await $00_00_10.click()
    await $("#toolbar [aria-label='Insert Table']").click()
    await $("#toolbar [aria-label='Insert Column Right']").click()
    await $("#toolbar [aria-label='Insert Table']").click()
    await $("#toolbar [aria-label='Insert Row Below']").click()

    let $00_00_10_00_00 = $("[data-cell='0-0 0-0 1-0 0-0 0-0']")
    await $00_00_10_00_00.click()
    await $("#toolbar [aria-label='Bold']").click()
    await browser.keys("From: ")
    await browser.keys([Key.Control, "d"])
    await browser.keys("consignor name")
    await browser.keys([Key.Enter])
    await browser.keys([Key.Enter])
    await browser.keys([Key.Control, "d"])
    await browser.keys("consignor address")
    await browser.keys([Key.Enter])

    let $00_00_10_00_10 = $("[data-cell='0-0 0-0 1-0 0-0 1-0']")
    await $00_00_10_00_10.click()
    await browser.keys("To: ")
    await browser.keys([Key.Control, "d"])
    await browser.keys("consignee name")
    await browser.keys([Key.Enter])
    await browser.keys([Key.Enter])
    await browser.keys([Key.Control, "d"])
    await browser.keys("consignee address")
    await browser.keys([Key.Enter])

    await browser.keys([Key.Control, Key.ArrowUp])
    await typeAndHitEnter($("#sidebar [aria-label='Width']"), "50%")
    let $00_00_10_01 = $("[data-cell='0-0 0-0 1-0 0-1']")
    await $00_00_10_01.click()
    await typeAndHitEnter($("#sidebar [aria-label='Width']"), "50%")

    await expect($("#document")).toMatchElementSnapshot("minimal-step-6")

    // --------------------
    // step 7
    await $("#toolbar [aria-label='Insert Table']").click()
    await $("#toolbar [aria-label='Insert Column Right']").click()
    await $("#toolbar [aria-label='Insert Row Below']").click()
    let $00_00_10_01_00 = $("[data-cell='0-0 0-0 1-0 0-1 0-0']")
    await $00_00_10_01_00.click()
    await browser.keys("Charge")
    await typeAndHitEnter($("#sidebar [aria-label='Width']"), "50%")
    let $00_00_10_01_01 = $("[data-cell='0-0 0-0 1-0 0-1 0-1']")
    await $00_00_10_01_01.click()
    await typeAndHitEnter($("#sidebar [aria-label='Width']"), "50%")
    await $00_00_10_01_01.click()
    await browser.keys("Amount")

    let $00_00_10_01_10 = $("[data-cell='0-0 0-0 1-0 0-1 1-0']")
    await $00_00_10_01_10.click()
    await browser.keys([Key.Control, "d"])
    await browser.keys("chargename dynamic")
    await browser.keys([Key.Enter])

    let $00_00_10_01_11 = $("[data-cell='0-0 0-0 1-0 0-1 1-1']")
    await $00_00_10_01_11.click()
    await browser.keys([Key.Control, "d"])
    await browser.keys("chargevalue dynamic")
    await browser.keys([Key.Enter])

    await expect($("#document")).toMatchElementSnapshot("minimal-step-7")

    // --------------------
    // step 8
    await browser.keys([Key.Control, Key.ArrowUp])
    await $("#sidebar [aria-label='Border Inside']").click()
    await browser.keys([Key.Control, Key.ArrowUp])
    await $("#sidebar [aria-label='Border Inside']").click()
    await browser.keys([Key.Control, Key.ArrowUp])
    await $("#sidebar [aria-label='Border Inside']").click()

    await $00_00_10_00_00.click()
    await browser.keys([Key.Control, Key.ArrowUp])
    await $("#sidebar [aria-label='Border Inside']").click()

    let $00_00_00_00 = $("[data-cell='0-0 0-0 0-0 0-0']")
    await $00_00_00_00.click()
    await browser.keys([Key.Control, Key.ArrowUp])
    await $("#sidebar [aria-label='Border Inside']").click()

    await expect($("#document")).toMatchElementSnapshot("minimal-step-8")

    // --------------------
    // step 9
    await browser.keys([Key.Control, Key.ArrowUp])
    await browser.keys([Key.Control, "c"])
    await $00_02.click()
    await browser.keys([Key.Control, "v"])
    await expect($("#document")).toMatchElementSnapshot("minimal-step-9")

    // --------------------
    // step 10
    await $00_01.click()
    await $("#sidebar [aria-label='Border Top']").click()
    await $("#sidebar [aria-label='Border Top']").click()
    await $("#sidebar [aria-label='Border Bottom']").click()
    await $("#sidebar [aria-label='Border Bottom']").click()
    await expect($("#document")).toMatchElementSnapshot("minimal-step-10")

    // --------------------
    // step 11
    await $00_00_10_01_00.click()
    await $("#toolbar [aria-label='Center Align']").click()
    await $00_00_10_01_01.click()
    await $("#toolbar [aria-label='Center Align']").click()
    await $00_00_10_01_11.click()
    await $("#toolbar [aria-label='Right Align']").click()

    let $00_02_10_01_00 = $("[data-cell='0-0 0-2 1-0 0-1 0-0']")
    await $00_02_10_01_00.click()
    await $("#toolbar [aria-label='Center Align']").click()

    let $00_02_10_01_01 = $("[data-cell='0-0 0-2 1-0 0-1 0-1']")
    await $00_02_10_01_01.click()
    await $("#toolbar [aria-label='Center Align']").click()

    let $00_02_10_01_11 = $("[data-cell='0-0 0-2 1-0 0-1 1-1']")
    await $00_02_10_01_11.click()
    await $("#toolbar [aria-label='Right Align']").click()

    await expect($("#document")).toMatchElementSnapshot("minimal-step-11")

    // --------------------
    // step 12
    await browser.keys([Key.Control, Key.ArrowUp])
    await browser.keys([Key.Control, Key.ArrowUp])
    await browser.keys([Key.Control, Key.ArrowUp])
    await browser.keys([Key.Control, Key.ArrowUp])
    await browser.keys([Key.Control, Key.ArrowUp])
    await typeAndHitEnter($("#sidebar [aria-label='Padding Top']"), "20px");
    await typeAndHitEnter($("#sidebar [aria-label='Padding Right']"), "20px");
    await typeAndHitEnter($("#sidebar [aria-label='Padding Bottom']"), "20px");
    await typeAndHitEnter($("#sidebar [aria-label='Padding Left']"), "20px");

    await expect($("#document")).toMatchElementSnapshot("minimal-step-12")

    // --------------------
    // step 13
    await $00_00_10_01_10.click()
    await $("#sidebar [aria-label='Border Bottom']").click()
    await $00_00_10_01_11.click()
    await $("#sidebar [aria-label='Border Bottom']").click()
    let $00_02_10_01_10 = $("[data-cell='0-0 0-2 1-0 0-1 1-0']")
    await $00_02_10_01_10.click()
    await $("#sidebar [aria-label='Border Bottom']").click()
    await $00_02_10_01_11.click()
    await $("#sidebar [aria-label='Border Bottom']").click()
    await expect($("#document")).toMatchElementSnapshot("minimal-step-13")
  })
})