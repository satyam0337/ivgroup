  define([
      'language'
      ],function(language){
      return ({
          renderElements : function(response){
              _this = this;
              this.setDataForView(response);
          }, setDataForView : function(response) {
             $("#startModal").modal("show");
			renderRoot(response.latestWayBillNumber, 0);
			$("#startModalPrintBtn").click(() => {
				hideAllMessages();
				let row = $("#startRow").val();
				if (!(1 <= row && row <=5)) {
					showMessage("error", "Row should be between 1 and 5");
					return;
				}
				let isLeft = $("#startPositionLeft").is(":checked");
				let skip = (row-1)*2 + (isLeft ? 0 : 1);
				renderRoot(response.latestWayBillNumber, skip);
				$("#startModal").modal("hide");
				window.print();
			});
			$("#startModalCloseBtn").click(() => {
				$("#startModal").modal("hide");
				window.close();
			});
           /*setTimeout(function() { window.print();window.close();}, 500);*/
         	 }
			});
          });
          const renderRoot = (lrs, skip) => {
	let $root = $("#root")
	$root.empty()
	
	document.body.style.setProperty("--page-padding-top", "1.5cm")
	document.body.style.setProperty("--page-padding-right", "2cm")
	document.body.style.setProperty("--page-padding-bottom", "0cm")
	document.body.style.setProperty("--page-padding-left", "2cm")
  
	let $grid =
		$("<div/>")
		.css("display", "grid")
		.css("grid-template-columns", "1fr 1fr")
		.css("grid-auto-rows", "auto")
		.css("gap", "0.5cm 2cm")
	$root.append($grid)
	
	for (let i = 0; i < skip; i++) {
		$grid.append(
			$("<div/>")
			.css("height", "5cm")
			.css("width", "7.5cm")
		)
	}
	
	for (let lr of lrs) {
		$lr(lr).forEach(e => $grid.append(e))
	}
}

const $lr = lr => {
	return Array.from({ length: lr.quantity }, (_, i) => $consignment({ ...lr, index: i }))
}
	
const $consignment = lr => {
	return (
		$("<div/>")
		.css("border", "1px solid #000")
		.css("font-size", "9px")
		.css("height", "4.5cm")
		.css("width", "7cm")
		.css("margin", "0.25cm")
		.append(
			$("<div/>")
			.css("border-bottom", "1px solid #000")
			.css("padding", "0 2px")
			.append(
				$("<span/>")
				.text("LMT CO. ")
				.css("font-size", "2em")
				.css("font-weight", "bold")
			)
			.append(
				$("<span/>")
				.text("C/NEE:" + lr.consigneeName.substring(0, 18))
				.css("font-size", "1.2em")
			)
		)
		.append(
			$("<div/>")
			.css("border-bottom", "1px solid #000")
			.css("padding", "0 2px")
			.css("font-size", "2em")
			.text("From: " + lr.sourceBranchName)
		)
		.append(
			$("<div/>")
			.css("border-bottom", "1px solid #000")
			.css("padding", "0 2px")
			.append(
				$("<span/>")
				.text("LR. ")
				.css("font-size", "2em")
				//.css("font-weight", "bold")
			)
			.append(
				$("<span/>")
				.text(lr.wayBillNumber)
				.css("font-size", "3em")
				//.css("font-weight", "bold")
			)
		)
		.append(
			$("<div/>")
			.text("To: " + lr.destinationBranchName)
			.css("border-bottom", "1px solid #000")
			.css("padding", "0 2px")
			.css("font-size", "2em")
			.css("font-weight", "normal")
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
				.text((lr.index + 1) + " / " + lr.quantity + "    " + lr.packingTypeName)
				.css("font-size", "2em")
			)			
		)
	)
}
  