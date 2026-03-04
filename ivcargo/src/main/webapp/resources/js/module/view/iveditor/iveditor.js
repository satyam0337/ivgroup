const IS_DEVELOPMENT = window.location.hostname.includes("localhost")

define([
	"JsonUtility",
	"messageUtility",
	"/ivcargo/resources/js/barcode/qrcode/qrcode.js"
], function() {
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			this.$el.html(this.template);
		}, render : function() {
			init()
			return _this;
		}
	});
});

const init = async () => {
	await new Promise(r => setTimeout(r, 0))
	let reactRoot = document.createElement("div")
	reactRoot.id = "react-root"
	document.querySelector("#mainContent").appendChild(reactRoot)
	document.querySelector("#leftTD")?.remove()
	
	if (IS_DEVELOPMENT) {
		const RefreshRuntime = (await import("http://localhost:5173/@react-refresh")).default
		RefreshRuntime.injectIntoGlobalHook(window)
		window.$RefreshReg$ = () => {}
		window.$RefreshSig$ = () => (type) => type
		window.__vite_plugin_react_preamble_installed__ = true
		await import("http://localhost:5173/@vite/client")
		await import("http://localhost:5173/src/main.tsx")
	} else {
	    const stylesheet = document.createElement("link")
	    stylesheet.rel = "stylesheet"
	    stylesheet.href = "/ivcargo/resources/iveditor/index.css"
	    document.head.appendChild(stylesheet)
	    await import("/ivcargo/resources/iveditor/index.js")
	}
	
	
	const updateReactRootTop = () => {
		reactRoot.style.setProperty("--react-root-top", Math.max(reactRoot.getBoundingClientRect().top, 0) + "px")
	}
	window.addEventListener("scroll", updateReactRootTop)
	updateReactRootTop()
	
	hideLayer()
}