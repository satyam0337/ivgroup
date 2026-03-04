import { browser, $ } from "@wdio/globals"
import { Key } from "webdriverio"

export const openIVEditor = async () => {
  await browser.url("http://localhost:8082/ivcargo/Login.do")
  await $("#accountGroupCode").setValue("ivcargo")
  await $("#username").setValue("anant")
  await $("#password").setValue("@nant#0522")
  await $("#textBox").setValue(await $("#captcha").getText())
  await $("#login").click()
  await $(".*=Welcome Anant").waitForDisplayed()
  await browser.url("http://localhost:8082/ivcargo/iveditor.do?pageId=340&eventId=12&modulename=iveditor")
  await $(".*=untitled").waitForDisplayed()
  await browser.execute(() => {
    document.querySelectorAll<HTMLElement>("#clockbox, #marqueMessage, #supportNoNew")
    .forEach(el => el.style.opacity = "0")
  })
}

export const typeAndHitEnter = async ($el: ReturnType<typeof $>, value: string) => {
  await $el.click()
  await browser.keys([Key.Control, "a"])
  await browser.keys(value)
  await browser.keys([Key.Enter])
}