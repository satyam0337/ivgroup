  define(['language'],function(language){
	return ({
		renderElements : function(response){
        	_this = this;
        	this.setDataForView(response);
		},
		setDataForView : function(response) {
        	let bPopup = $("#startModal").bPopup();
        	
			renderRoot(response.latestWayBillNumber, 0);
			
			$(".start-grid .position").click(function() {
				$(".start-grid .position").removeClass("selected")
				$(this).addClass("selected")
			})
	
			$("#startModalPrintBtn").click(() => {
				hideAllMessages();
				let $selected = $(".start-grid .position.selected");
				if ($selected.length === 0) {
					showMessage("error", "Please select a position");
					return;
				}
				let skip = Number($selected.data("skip"));
				renderRoot(response.latestWayBillNumber, skip);
				bPopup.close();
				setTimeout(() => { window.print(); }, 500);
			});
			
			$("#startModalCloseBtn").click(() => {
				bPopup.close();
				window.close();
			});   
		}
	});
});

const renderRoot = (packingTypeWiseConsignments, skip) => {
	let lrs = new Map()
	for (let c of packingTypeWiseConsignments) {
		let lr = lrs.get(c.wayBillNumber)
		if (!lr) {
		  lrs.set(c.wayBillNumber, { items: [], totalQuantity: 0 })
		  lr = lrs.get(c.wayBillNumber)
		}
		lr.items.push(...
			Array.from({ length: c.quantity })
			.map((_, i) => ({ ...c, index: i }))
		)
		lr.totalQuantity += c.quantity
	}
	
	let $root = $("#root")
	$root.empty()
	
	$root.css("width", "21cm")
	$root.css("margin", "0 auto")
	document.body.style.setProperty("--page-padding-top", "0.4cm")
	document.body.style.setProperty("--page-padding-right", "0.3cm")
	document.body.style.setProperty("--page-padding-bottom", "0cm")
	document.body.style.setProperty("--page-padding-left", "0.3cm")
	
	document.body.style.setProperty("--item-height", "6cm")
	document.body.style.setProperty("--item-padding", "0.2cm")
  
	let $grid =
		$("<div/>")
		.css("display", "grid")
		.css("grid-template-columns", "1fr 1fr")
		.css("grid-auto-rows", "auto")
		.css("font-size", "12px")
	$root.append($grid)
	
	for (let i = 0; i < skip; i++) {
		$grid.append(
			$("<div/>")
			.css("height", "var(--item-height)")
			.css("page-break-inside", "avoid")
		)
	}
	
	for (let lr of lrs.values()) {
		lr.items
		.map(item => $item({ ...item, totalQuantity: lr.totalQuantity }))
		.forEach(e => $grid.append(e))
	}
}
	
const $item = item => {
	let isSmall = item.destinationBranchName.length > 7
	
	return (
		$("<div/>")
		.css("height", "var(--item-height)")
		.css("page-break-inside", "avoid")
		.css("padding", "var(--item-padding)")
		.append(
			$("<div/>")
			.css("border", "1px solid #000")
			.css("height", "100%")
			.append(
				$("<div/>")
				.css("border-bottom", "1px solid #000")
				.css("padding", "0 2px")
				.append(
					$("<span/>")
					.text("LMT CO. ")
					.css("font-size", "1.5em")
					.css("font-weight", "bold")
				)
				.append(
					$("<span/>")
					.text("C/NEE:" + item.consigneeName.substring(0, 18))
					.css("font-size", "1.2em")
				)
			)
			.append(
				$("<div/>")
				.css("border-bottom", "1px solid #000")
				.css("padding", "0 2px")
				.css("font-size", "1.5em")
				.text("From: " + item.sourceBranchName)
			)
			.append(
				$("<div/>")
				.css("border-bottom", "1px solid #000")
				.css("padding", "0 2px")
				.css("line-height", "1")
				.append(
					$("<span/>")
					.text("LR. ")
					.css("font-size", "2em")
					.css("font-weight", "bold")
				)
				.append(
					$("<span/>")
					.text(item.wayBillNumber)
					.css("font-size", isSmall ? "4em" : "4.5em")
				)
			)
			.append(
				$("<div/>")
				.text("To: " + item.destinationBranchName)
				.css("line-height", "1")
				.css("border-bottom", "1px solid #000")
				.css("padding", "0 2px")
				.css("font-size",  isSmall ? "3em" : "3.8em")
			)
			.append(
				$("<div/>")
				.css("padding", "0 2px")
				.append(
					$("<span/>")
					.text("Qty: ")
					.css("font-size", "1em")
				)
				.append(
					$("<span/>")
					.text((item.index + 1) + " / " + item.totalQuantity + "    " + item.packingTypeName)
					.css("font-size", "2em")
				)
			)
		)
	)
}
