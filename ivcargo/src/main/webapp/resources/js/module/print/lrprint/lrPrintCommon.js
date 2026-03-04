/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define(['JsonUtility'],
	function() {
	let _this;

	return Marionette.LayoutView.extend({
		initialize : function() {
			//_this object is added because this object is not found in onRender function
			_this = this;
		}, render: function() {
			
		}, generatePdf : function(responseOut, isLrPdfAllow, isPdfExportAllow) {
			let config = responseOut.configuration;
			let accountGroupId = config.accountGroupId;
			let chargeTypeModelArr = responseOut.chargeTypeModelArr;
			let jsonObject = new Object();
			
			if (isLrPdfAllow == true || isLrPdfAllow || isPdfExportAllow == true || isPdfExportAllow) {

				if (config.isAllowPhotoSubregionWise) {
					$("#header").css('width', '100%');

					if (responseOut.wayBillSourceSubregionId == 3728
						|| responseOut.wayBillSourceSubregionId == 3840
						|| responseOut.wayBillSourceSubregionId == 37
						|| responseOut.wayBillSourceSubregionId == 40
						|| responseOut.wayBillSourceSubregionId == 41) {
							if(responseOut.wayBillSourceSubregionId == 3840) {
								$("#header").attr('src', accountGroupId + '_' + responseOut.wayBillSourceSubregionId + '.svg');
								$(".logo").attr('src', accountGroupId + '_' + responseOut.wayBillSourceSubregionId + '.svg');
							} else
								$("#header").attr('src', accountGroupId + '_' + responseOut.wayBillSourceSubregionId + '.png');
					}
				}
				
				if (config.headerImgPDF) {
					if (responseOut.lrPrintType == 'lrprint_498' || responseOut.lrPrintType == 'lrprint_226' || responseOut.lrPrintType == 'lrprint_628' || responseOut.lrPrintType == 'lrprint_345' || responseOut.lrPrintType == 'lrprint_896' || responseOut.lrPrintType == 'lrprint_619' 
						|| responseOut.lrPrintType == 'lrprint_896') {

						$("#header").attr('src', accountGroupId + '.png');
						$("#header").css('width', '100%');
					}
				}

				if (config.isAllowHeaderImageSubRegionWise) {
					$("#header").css('width', '100%');

					if (responseOut.wayBillSourceSubregionId == 37 || responseOut.wayBillSourceSubregionId == 41 || responseOut.wayBillSourceSubregionId == 40)
						console.log('hi')
					else
						$("#header").attr('src', '209_40.png');
				}

				$("#header").css('display', 'block');
				
				let ogMarginTop = $("#copy1").css("margin-top");

				if (responseOut.lrPrintType == 'lrprint_768') {
					$("#header").attr('src', accountGroupId + '.jpg');
					$("#header").css('width', '100%');
					$("#copy1").css('margin-top', '0px');
				}
								
				$(".dataPdf").hide();
				$(".transportname").hide();
				$(".carriergst").show();
				$(".removeLetterSpacing").css("letter-spacing", '10px !important');
				$("table:not(.noBorder)").attr("border", "1");
				$("table").css("width", "100%");
				$("#copy2").hide();
				$("#copy3").hide();
				$("#copy1").css('margin-top', '0px');
				
				const chargesMap = new Map();
				let grandTotal = $("*[data-lr='grandTotal']").html();
				
				if(config.hideChargesInLrPdf) {
					for (let index in chargeTypeModelArr) {
						let chargeTypeMasterId	= chargeTypeModelArr[index].chargeTypeMasterId;
						
						let amount = $("*[data-selector='chargeValue" + chargeTypeMasterId + "']").html();
						chargesMap.set(chargeTypeMasterId, amount);
						$("*[data-selector='chargeValue" + chargeTypeMasterId + "']").html(0);
					}
					
					$("*[data-lr='grandTotal']").html(0);
				}

				jsonObject.waybillId = responseOut.wayBillId;
				jsonObject.lrPrint = $("#mainContent").html();
				
				if(config.hideChargesInLrPdf) {
					for (let index in chargeTypeModelArr) {
						let chargeTypeMasterId	= chargeTypeModelArr[index].chargeTypeMasterId;
						
						$("*[data-selector='chargeValue" + chargeTypeMasterId + "']").html(chargesMap.get(chargeTypeMasterId));
					}
									
					$("*[data-lr='grandTotal']").html(grandTotal);
				}
				
				$("#header").css('display', 'none');
				$("#headerpdfimg").css('display', 'none');
				$(".dataPdf").show();
				$(".pdfTableHide").hide();
				$(".transportname").show();
				$(".carriergst").hide();
				$(".removeLetterSpacing").css("letter-spacing", '0px !important');
				$("table").removeAttr("border"); // Removes the border attribute
				$("table").css("width", ""); // Resets the width to default
				$("#copy2").show();
				$("#copy3").show();
				$("#copy1").css('margin-top', ogMarginTop);
			} else
				$(".pdfTableHide").hide();
			
			if (isLrPdfAllow == true || isLrPdfAllow)
				getJSON(jsonObject, WEB_SERVICE_URL + '/lrPrintWS/generateLRPrintPdfBywayBillId.do?', _this.getResponse, EXECUTE_WITHOUT_ERROR);
			else if (isPdfExportAllow == true || isPdfExportAllow)
				getJSON(jsonObject, WEB_SERVICE_URL + '/lrPrintWS/generateLRPrintPdfExportByWayBillId.do?', _this.getResponseAfterExport, EXECUTE_WITH_ERROR);
		
			if(responseOut.wayBillSourceSubregionId == 3728)
				$(".logo").attr("src", "/ivcargo/images/Logo/270_3728.svg");							
			else if(responseOut.wayBillSourceSubregionId == 3840)
				$(".logo").attr("src", "/ivcargo/images/Logo/270_3840.svg");
		}, getResponseAfterExport : function(response) {
			generateFileToDownload(response);//calling from genericfunction.js
		}, getResponse() {
			hideAllMessages();
		}
	});	
});