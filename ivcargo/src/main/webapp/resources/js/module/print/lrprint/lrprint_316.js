var isQRPrintOnPopUpSelection = false;

define([],function() {
    return ({
        renderElements : function() {
            _this = this;
		}, printWindow : function(isPdfExportAllow){
			if(!isPdfExportAllow){
				hideLayer();
				setTimeout(function(){ window.print();window.close();
				},500);
			}
			
		}, setQRDetails: function(responseOut) {
			
				var configuration = responseOut.configuration;
				var isQRCodePrintAllowed = configuration.QRCodePrintAllowed;
				var ifOnlyQRPrintNeeded = configuration.ifOnlyQRPrintNeeded;
				isQRPrintOnPopUpSelection = configuration.isQRPrintOnPopUpSelection;
				var consigneeName = responseOut.consigneeName;
				printQRCodeOnLimit = configuration.printQRCodeOnLimit;
				var destinationBranchName = "";
				var _this = this;
				
				if (responseOut.desthandlingBranchName != undefined)
					destinationBranchName = responseOut.desthandlingBranchName;

				if (responseOut.wayBillDestinationBranchName != undefined && (destinationBranchName == "" || destinationBranchName.length == 0))
					destinationBranchName = responseOut.wayBillDestinationBranchName;
					
				if (isQRCodePrintAllowed || isQRCodePrintAllowed == true || ifOnlyQRPrintNeeded || ifOnlyQRPrintNeeded == true) {
					var waybIllNumberArr = new Array();
					var waybillArr = new Array();
					waybillArr = responseOut.wayBillNumber.split("/");

					for (var k = 0; k < waybillArr.length; k++) {
						waybIllNumberArr.push(waybillArr[k]);
					}

					var dataObjectColl = new Object();
					dataObjectColl.waybillId = responseOut.wayBillId;
					dataObjectColl.lrType = responseOut.wayBillTypeName;
					dataObjectColl.waybillNumber = waybIllNumberArr.join("/");
					//	dataObjectColl.numberOfPackages 			= responseOut.quantity;
					dataObjectColl.numberOfPackages = responseOut.consignmentSummaryQuantity;
					dataObjectColl.bookingDate = responseOut.bookingDateTimeString;
					dataObjectColl.bookingTime = responseOut.bookingTimeString;
					dataObjectColl.packingTypeMasterName = responseOut.packingTypeMasterName;
					dataObjectColl.consigneePhn = responseOut.consigneePhn;
					dataObjectColl.sourceBranch = responseOut.wayBillSourceBranchName;
					dataObjectColl.sourceBranchCode = responseOut.sourceBranchCode
					dataObjectColl.DeliveryToAddress = responseOut.lrDestinationBranchCode

					if (responseOut.desthandlingBranchName != undefined || responseOut.desthandlingBranchName != "undefined")
						dataObjectColl.desthandlingBranchName = responseOut.desthandlingBranchName;
					else
						dataObjectColl.desthandlingBranchName = "--";

					if (responseOut.destBranchAbrvtinCode != undefined || responseOut.destBranchAbrvtinCode != "undefined")
						dataObjectColl.destBranchAbrvtinCode = responseOut.destBranchAbrvtinCode;
					else
						dataObjectColl.destBranchAbrvtinCode = "--";

					dataObjectColl.destinationTo = responseOut.wayBillDestinationCityName;
					dataObjectColl.sourceFrom = responseOut.wayBillSourceCityName;

					if (responseOut.privateMark != null && responseOut.privateMark != undefined) {
						if (responseOut.privateMark.length > 12)
							dataObjectColl.privateMark = (responseOut.privateMark).substring(0, 11);
						else
							dataObjectColl.privateMark = responseOut.privateMark;
					} else
						dataObjectColl.privateMark = "";
						
					dataObjectColl.qrCodeSize = 12;
					dataObjectColl.bodyStyle = "white-space: nowrap;width:100%;font-size:45px;margin:0;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";

					var consignmentDetailsArr = new Array();
					var consignmentArr = responseOut.consignmentMap;

					for (var index in consignmentArr) {
						consignmentDetailsArr.push({ quantity: consignmentArr[index].quantity, consignmentId: consignmentArr[index].consignmentDetailsId, packingTypeName: consignmentArr[index].packingTypeName, saidToContain: consignmentArr[index].saidToContain });
					}

					var templateArray = new Array();
					var consignmentVal = 1;

					for (var i = 0; i < consignmentDetailsArr.length; i++) {
						for (var j = 0; j < consignmentDetailsArr[i].quantity; j++) {
							var dataObject = new Object();
							_.map(dataObjectColl, function(val, key) {
								dataObject[key] = val;
							})

							dataObject.currentPackage = consignmentVal++;
							dataObject.currentPackingType = consignmentDetailsArr[i].packingTypeName;
							dataObject.saidToContain = consignmentDetailsArr[i].saidToContain
							
							if (consigneeName.length > 12)
								consigneeName = (consigneeName.substring(0, 16) + '....');
							
							var consignorName = responseOut.consignorName;
							
							if (consignorName.length > 12)
								consignorName = (consignorName.substring(0, 16) + '....');

							dataObject.htmlTemplate = _.template('<table width="100%" style="margin-left:10px; border: solid 1px;"><tr><td style="border-bottom: solid 1px; border-right: solid 1px;border-left:solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="word-wrap: break-word;word-break: break-all;border-bottom: solid 1px;border-right: solid 1px; padding: 0px 10px 0px 10px;"><span>' + dataObject.destinationTo + '</span><br><span>(' + dataObjectColl.desthandlingBranchName + ')</span></td></tr><tr style="border-bottom:solid 1px; "><td style="border-bottom: solid 1px; border-top: solid 0px;border-right: solid 1px; padding: 0px 10px 0px 10px;border-left:solid 1px;">Consignor</td><td style="border-bottom: solid 1px;border-top: solid 0px; padding: 0px 10px 0px 10px;border-right: solid 1px;">' + consignorName + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;border-left:solid 1px;">Consignee</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;border-right: solid 1px;">' + consigneeName + '</td></tr><tr><td colspan="2" style="border-bottom: solid 0px; border-right: solid 1px; padding: 0px 10px 0px 10px;border-right: solid 1px;border-left:solid 1px;">Date : ' + dataObjectColl.bookingDate + ' ' + dataObjectColl.bookingTime + '</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;border-right: solid 1px;border-left:solid 1px;border-top:solid 1px;">' + dataObject.currentPackage + ' of ' + dataObject.numberOfPackages + '</td><td style="border-bottom: solid 0px; padding: 0px 10px 0px 10px;border-top:solid 1px;">LR.No:' + dataObject.waybillNumber + '</td></tr></table>')({ dataObject: dataObject });
							
							$('#popUpContentForLrAndQr').bPopup({
							}, function() {
										var _thisMod = this;
										$(this).html("<div class='confirm' style='height:150px;width:250px; padding:5px'>"
											+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printLR'/>&nbsp;<b style='font-size:14px;'>Print LR</b><div><br/>"
											+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='printQR'/>&nbsp;<b style='font-size:14px;'>Print QR</b><div><br/>"
											+ "<button id='cancelButton'>Cancel</button>"
											+ "<button autofocus id='confirm'>Print</button></center></div>")

										$("#confirm").focus();

										$("#cancelButton").click(function() {
											window.close();
											_thisMod.close();
										})


										$('#confirm').click(function() {
											if ($('#printLR').prop('checked') && $('#printQR').prop('checked')) {
												//window.resizeTo(0,0);
												//window.moveTo(0,0);
												setTimeout(function() {
													if (responseOut.wayBillTypeId != WAYBILL_TYPE_CREDIT) {
														window.print();
														window.close();
													}
												}, 500);

												/*if (dataObject.numberOfPackages <= 30)
													_this.printQRCodeOnLimt(templateArray, 10);*/
												_this.printQRCodeWithoutLimit(templateArray, 1000);	

												_thisMod.close();
											} else if ($('#printLR').prop('checked') == true) {
												//window.resizeTo(0,0);
												//window.moveTo(0,0);
												setTimeout(function() {
													if (responseOut.wayBillTypeId != WAYBILL_TYPE_CREDIT) {
														window.print();
														window.close();
													}
												}, 500);

												_thisMod.close();
											} else if ($('#printQR').prop('checked') == true) {
												/*if (dataObject.numberOfPackages <= 30)
													_this.printQRCodeOnLimt(templateArray, 10);*/
												_this.printQRCodeWithoutLimit(templateArray, 1000);	

												if (responseOut.wayBillTypeId != WAYBILL_TYPE_CREDIT) {
													_thisMod.close();
													window.close();
												}
											} else if (responseOut.wayBillTypeId != WAYBILL_TYPE_CREDIT)
												window.close();

											_thisMod.close();
										});
										$('#confirm').on('keydown', function(e) {
											if (e.which == 27) {  //escape
												window.close();
											}
										});

									});

							dataObject.qrCodeString = dataObject.waybillId + "~" + consignmentDetailsArr[i].consignmentId + "~" + QR_CODE_USING_CONSIGNMENT + "~" + j;

							dataObject.srcBranchAbrvtinCode = "";
							dataObject.destinationAbrvtinCode = "";
							dataObject.waybillNo = "";
							dataObject.destinationBranch = "";
							dataObject.destBranchAbrvtinCode = "";
							dataObject.numberOfQuntity = "";
							dataObject.QrCodeForSugama = false;

							templateArray.push(dataObject);
						}
					}

					if (!isQRPrintOnPopUpSelection) {
						if (templateArray) {
							if (templateArray.length > 30) {
								var largeTemplateArray = breakArrays(templateArray, 30);

								for (var p = 0; p < largeTemplateArray.length; p++)
									this.printQRCode(largeTemplateArray[p]);
							} else
								this.printQRCode(templateArray);
						}
					}
				}
		}, showPopUp: function(responseOut, isPdfExportAllow) {
			hideLayer();
			var conf = responseOut.configuration;
			isQRPrintOnPopUpSelection = conf.isQRPrintOnPopUpSelection;
			var isPdfExportAllow = responseOut.isPdfExportAllow;
			
			_this = this;
			
			$('#popUpContent316').bPopup({
				}, function() {
					var _thisMod = this;

					$(this).html("<div class='confirm' style='height:150px;width:250px; padding:5px'>"
						+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
						+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='check'  />&nbsp;<b style='font-size:14px;'>Print Charges</b><div>"
						+ "<button id='cancel'>Cancel</button>"
						+ "<button autofocus id='printCharges'>Print</button></center></div>")

					$("#shortcut").html("Shortcut Keys : Enter = Print, Esc = Cancel")
					$("#confirm").focus();
					$('#printCharges').focus();

					$(document).on('keydown', function(event) {
						if (event.keyCode == 27) {
							window.close();
						}
					});

					$("#confirm").click(function() {
						_thisMod.close();
						_this.printWindow(isPdfExportAllow);
					})

					$("#cancel").click(function() {
						_thisMod.close();
						window.close();
					});

					$("#printCharges").click(function() {

						if ($("#check").is(":checked")) {
							$(".hideCharges").show();
							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						} else if ($("#check").not(":checked")) {
							$(".hideCharges").hide();
							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						}
					})
				});
			}, printQRCodeOnLimt: function(templateArray, breakSize) {
				if (templateArray) {
					if (templateArray.length > breakSize) {
						var largeTemplateArray = breakArrays(templateArray, breakSize);
						if (printQRCodeOnLimit)
							largeTemplateArray.length = 1;

						for (var p = 0; p < largeTemplateArray.length; p++) {
							if (isQRPrintOnPopUpSelection)
								this.printQRCode(largeTemplateArray[p]);
						}
					} else
						this.printQRCode(templateArray);
				}
			}, printQRCode: function(templateArray) {
				//genericfunction.js
				printQRCode(templateArray);
			},printQRCodeWithoutLimit: async function(templateArray, breakSize) {
				
				if (printQRCodeOnLimit && templateArray.length > breakSize)
					templateArray = templateArray.slice(0, breakSize);
				
				if (templateArray) {
					if (isQRPrintOnPopUpSelection == "true" || isQRPrintOnPopUpSelection == true) {
						printAllQRCodeWithoutLimit(templateArray);
					}
				}
			}
	});
});	

function breakArrays(myArray, chunk_size) {
	const chunks = [];
	let i = 0;

	while (i < myArray.length) {
		chunks.push(myArray.slice(i, i + chunk_size));
		i += chunk_size;
	}

	return chunks;
}
