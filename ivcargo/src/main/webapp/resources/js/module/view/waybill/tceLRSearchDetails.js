var imageDataCache = {}; // Global variable to cache image data

define(['marionette'
	, '/ivcargo/resources/js/generic/urlparameter.js'
	, PROJECT_IVUIRESOURCES + '/resources/js/generic/tabledatawrapper.js'
	, 'JsonUtility'
	, 'messageUtility'
	, 'focusnavigation'
],
	function(Marionette, UrlParameter, TableDataWrapper) {
		'use strict';// this basically give strictness to this specific js
		let jsonObject = new Object(),
			wayBillId, wayBill = null, childwin = null, photoModel = null, isLRAllowForCancellation = false, 
			_this = '', selectedFiles = [], minimumWeight = 0;
		//this is used to get the access of key in onRender because this keyword is not found in onRender function
		return Marionette.LayoutView.extend({
			initialize: function() {
				//initialize is the first function called on call new view()
				_this = this;
				wayBillId = UrlParameter.getModuleNameFromParam(MASTERID);
				jsonObject.waybillId = wayBillId;
			}, render: function() {
				jsonObject = new Object();
				jsonObject.waybillId = wayBillId;
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL + '/lRSearchWS/tceLRSearchDetails.do?', _this.setDetails, EXECUTE_WITHOUT_ERROR);
			}, setDetails: function(response) {

				let loadelement = new Array();
				let baseHtml = new $.Deferred();

				loadelement.push(baseHtml);

				$("#mainContent").load("/ivcargo/html/module/waybill/tceLRDetails/tceLRSearchDetails.html", function() {
					baseHtml.resolve();
				});

				$.when.apply($, loadelement).done(function() {
					initialiseFocus();

					if (response.message != undefined) {
						let errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						hideLayer();
						setTimeout(() => {
							window.close();
						}, 1000);
						return;
					}
					
					photoModel	= new bootstrap.Modal(document.getElementById('staticBackdropAdd'));
					
					isLRAllowForCancellation	= response.isLRAllowForCancellation;
					
					if(isLRAllowForCancellation)
						$('.lrCancellation').removeClass('hide');
					else
						$('.lrCancellation').remove();
						
					let numItems = $('#rightPanel').children('fieldset').length;
					
					if(numItems > 1) $('.operatorcomunityordercharges').removeClass('sticky-top');
					
					if(response.isResendDelivery)
						$('.resendotpbtn').removeClass('hide');
					else
						$('.resendotpbtn').addClass('hide');
					
					if(!response.bookingPhotoUploaded)
						$('#uploadLRImage').removeClass('hide');
					else
						$('#uploadLRImage').addClass('hide');

					_this.setLRDetails(response);
					_this.setPartyDetails(response);
					_this.setConsignemntDetails(response);
					_this.setRoutes(response);
					_this.setOperatorCommunityOrderCharges(response);
					_this.showHideDetails(response);
					_this.bindEvents(response);
					_this.uploadPOD(response);
					_this.uploadLRImages(response);
					_this.setShortAccessDamageDetails(response);
					document.getElementsByClassName('tablinks')[0].click();

shortcut.add('Alt+x',function() {window.location = deliveryPageUrl + '&wayBillId='+$('#wayBillId').val() + '&waybillNo='+$('#lrNumber').html()});
					hideLayer();
			 });
			}, setLRDetails: function(response) {
				minimumWeight = response.minimumWeightForTranCE;

				const operatorOrderDetailsList = response.operatorOrderDetailsList;
				wayBill = response.wayBill;
				let consignmentSummary = response.consignmentSummary;
			const wayBillActualBookingDateTime = wayBill.wayBillActualBookingDateTime; // example timestamp

const date = new Date(wayBillActualBookingDateTime);

const formattedDate = new Date(wayBill.wayBillActualBookingDateTime).toLocaleString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).replace(',', '').replace(/\//g, '-');

				$('#lrNumber').html(wayBill.wayBillNumber);
				$('#wayBillId').val(wayBillId);
				$('#wayBillCurrentStatus').html(response.wayBillCurrentStatus);
				$('#ewaybillNumber').html(response.formNumberDetails);
				$('#invoiceNo').html(consignmentSummary.consignmentSummaryInvoiceNo);
				$('#declaredValue').html(consignmentSummary.consignmentSummaryDeclaredValue);
				$('#actualWeight').val(consignmentSummary.consignmentSummaryActualWeight);
				//$('#chargeWeight').val(consignmentSummary.consignmentSummaryChargeWeight);
				$('#weigthFreightRate').val(consignmentSummary.consignmentSummaryWeightFreightRate);
				$('#bookedForBranchPincode').html(operatorOrderDetailsList[0].bookedForPincode);
				$('#subCommodity').html(response.subCommodityName || "--");
				$('#lrBookingOn').html(formattedDate || "--");

				if (consignmentSummary.consignmentSummaryChargeWeight < minimumWeight)
					$('#chargeWeight').val(minimumWeight); 
				else
					$('#chargeWeight').val(consignmentSummary.consignmentSummaryChargeWeight);
				
				if (wayBill.wayBillStatus != WAYBILL_STATUS_CANCELLED && wayBill.wayBillRemark != undefined) {
					const wayBillRemark = wayBill.wayBillRemark;
					$('#bookingremark').html(wayBillRemark);
					$('#remarkContainer').show();
				}
				
				if (wayBill.wayBillStatus === WAYBILL_STATUS_CANCELLED && wayBill.wayBillRemark != undefined) {
					const wayBillRemark = wayBill.wayBillRemark;
					const colonIndex = wayBillRemark.indexOf(':');
					const extractedText = colonIndex !== -1 ? wayBillRemark.substring(colonIndex + 1).trim() : wayBillRemark;
					$('#cancelRemark').html(extractedText);
					$('#cancelRemarkContainer').show();
				}

				// cndition for display "who paid gst"		
				if (consignmentSummary.consignmentSummaryTaxBy > 0)
					$('#gstpaidby').html(consignmentSummary.taxByName)
				
				if(consignmentSummary.consignmentSummaryPaymentType > 0)
					$('#paymentType').html(consignmentSummary.paymentTypeName)
				
				_this.lrTypeColorCode(response);
				
				if(response.isDeliveryBranch) {
					if(response.deliveryContactDetails != undefined) {
						$('#deliveryname').html(response.deliveryContactDetails.deliveryContactDetailsDeliveredToName);
						$('#deliveryphoneno').html(response.deliveryContactDetails.deliveryContactDetailsDeliveredToNumber);
					}
					
					$('.deliverydetails').show();
				}
			}, showHideDetails : function(response) {
				if(response.isLrPrintAllow && !response.isDeliveryBranch)
					$('.lrprintbtn').removeClass('hide');
				else
					$('.lrprintbtn').remove();
				
				if(response.showBookingPhoto)
					$('#getImagesFromTCE').removeClass('hide');
				
				if(response.isCrPrintAllow) {
					$('.crprintbtn').removeClass('hide');
					$('#getCRimages').removeClass('hide');
				}
				
				if(response.wayBill.wayBillStatus == WAYBILL_STATUS_DELIVERED && response.isDeliveryBranch)
					$('#uploadPODmodal').removeClass('hide');
					
				if(response.wayBill.wayBillStatus == WAYBILL_STATUS_DELIVERED) {
					$('#getPOD').show();
					$('#getCRimages').show();
				}
				
				if (!response.statusForPOD)
					document.getElementById("uploadPODmodal").classList.add("hide");
				
				if (!response.statusForPOD && !response.isDeliveryBranch) {
					document.getElementById("uploadPODmodal").classList.add("hide");
				} else if (response.statusForPOD && response.isDeliveryBranch && response.wayBill.wayBillStatus === WAYBILL_STATUS_DELIVERED) {
					document.getElementById("uploadPODmodal").classList.remove("hide");
					$('#getPOD').hide()
				}
			}, bindEvents : function(response) {
				$('#uploadLRImage').on('click', function() { 
					 	$('#lrImageModal').modal('show');
					});
				$("#getImagesFromTCE").click(function() {
						_this.getImagesTCE(response.operatorOrderDetailsList[0].communityOrderId);
				});
				
				$("#getCRimages").click(function() {
					_this.getCRimages(response.operatorOrderDetailsList[0].communityOrderId); 
				});
				
				$("#getPOD").click(function() {
					_this.getPODImages(response.operatorOrderDetailsList[0].communityOrderId); 
				});
				
				$('.lrprintbtn').click(function() {
					if(response.isBookingBranch)
						_this.lrPrint();	
					else
						showAlertMessage('error','You are not allowed to take a	 print !')
				});
				
				$('.crprintbtn').click(function() {
					if(response.isDeliveryBranch)
						_this.crPrint() ;
					else
						showAlertMessage('error','You are not allowed to take a	 print !')
				});
				
				$(".statusDetailsBtn").click(function() {
					 _this.viewDetails(wayBillId);
				});
				
				$("#downloadButton").click(function() {
					_this.downloadAllImage();
				});
				
				$("#resendotpbtn").click(function() {
					_this.resendDeliveryOtp(wayBillId); 
				});
				
				if(isLRAllowForCancellation) { 
					$("#cancelLR").click(function() {
						let remark = $("#remark").val().trim()
						
						if(remark == '') {
							showAlertMessage('error', 'Please Fill Remark')
							return;
						}

						_this.cancelLR(); 
					});
				}
				
				if (!response.isDeliveryBranch) {
					$('.crprintbtn').addClass('hide');
				}
			}, lrPrint: function() {
	if (wayBillId !== undefined && wayBillId > 0) {
		window.open(
			'printWayBill.do?pageId=340&eventId=10&modulename=tceLrPrint&masterid=' + wayBillId, 
			'newwindow', 
			'height=300,width=425,toolbar=no,menubar=no,scrollbars=yes,resizable=no,location=no,directories=no,status=no'
		).onload = function() {
			setTimeout(function() {
				this.focus();
				this.print();
			}.bind(this), 4000); 
		};
	}
}, crPrint : function() {
				if(wayBillId != undefined && wayBillId > 0)
					window.open('printWayBill.do?pageId=340&eventId=10&modulename=tceCrPrint&masterid='+wayBillId,'newwindow', 'config=height=300,width=425, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no').onload = function() {
			setTimeout(function() {
				this.focus();
				this.print();
			}.bind(this), 4000); 
		}
			}, setRoutes: function(response) {
				$('#bookedFrom').html('<span style="font-weight:bold;" class="text-primary">' + response.sourceBranchName + '  </span>' + " (" + response.AccountGroupName + ", " + response.sourceCityName + ")");
				$('#bookedTo').html('<span style="font-weight:bold;"  class="text-primary" >' + response.destinationBranchName + '	</span>' + ", " + response.bookedForAccountGroupName + " (" + response.destinationBranchAddress + ", " + response.destinationCityName + ")");
//	start
				var operatorOrderDetailsList = response.operatorOrderDetailsList;
				
				if(operatorOrderDetailsList == undefined)
					return;
				for (var i = 0; i < operatorOrderDetailsList.length; i++) {
					let sourceBranch		= operatorOrderDetailsList[i].sourceBranchName ? operatorOrderDetailsList[i].sourceBranchName + ', ' + operatorOrderDetailsList[i].sourceBranchAddress : "__";
					let destinationBranch	= operatorOrderDetailsList[i].destinationBranchName ? operatorOrderDetailsList[i].destinationBranchName + ', ' + operatorOrderDetailsList[i].destinationBranchAddress : "__";
					let crossingBranch		= operatorOrderDetailsList[i].crossingBranchName ? operatorOrderDetailsList[i].crossingBranchName + ', ' + operatorOrderDetailsList[i].crossingBranchAddress + ', Branch Contact : ' + operatorOrderDetailsList[i].crossingBranchPhone : "__";
					let statusType;
					
					if(operatorOrderDetailsList[i].sourceBranchId > 0 && operatorOrderDetailsList[i].destinationBranchId > 0) {
						statusType = 'Dispatch'
					} else if(operatorOrderDetailsList[i].sourceBranchId > 0 && operatorOrderDetailsList[i].crossingBranchId > 0) {
						statusType = 'Transfer', 
						crossingBranch += operatorOrderDetailsList[i].crossingBranchAccountGroupName ? ` <span class="fs-6">(${operatorOrderDetailsList[i].crossingBranchAccountGroupName})</span>` : '';
						destinationBranch += operatorOrderDetailsList[i].destinationBranchAccountGroupName ? ` <span class="fs-6">(${operatorOrderDetailsList[i].destinationBranchAccountGroupName})</span>` : '';
					} else {
						statusType = 'Delivery' 
					}
					
					let operatorOrderDetailsListTablea = `<tr> 
						<td class=' fw-bold'> ${statusType} </td>
						<td class=' fw-bold'> ${sourceBranch} </td>
						<td class='fw-bold'> ${operatorOrderDetailsList[i].destinationBranchId > 0 ? destinationBranch : operatorOrderDetailsList[i].crossingBranchId > 0 ? crossingBranch : "__"} </td>					</tr>`;
						$('.routeContribution').append(operatorOrderDetailsListTablea);
				}
			}, setPartyDetails: function(response) {
				let consignorDetails = response.ConsignorDetails;
				let consigneeDetails = response.ConsigneeDetails;
				let consignortr = $('<tr class="table-primary" >');

				consignortr.append('<td class="fw-bold">Consignor</td>');
				consignortr.append('<td class="fw-bold">' + consignorDetails.customerDetailsName + '</td>');
				consignortr.append('<td class="fw-bold">' + consignorDetails.gstn + '</td>');
				consignortr.append('<td class="fw-bold">' + consignorDetails.customerDetailsAddress + '</td>');

				let consigneetr = $('<tr style="background: #1cc88a;">');

				consigneetr.append('<td class="text-white fw-bold">Consignee</td>');
				consigneetr.append('<td class="text-white fw-bold">' + consigneeDetails.customerDetailsName + '</td>');
				consigneetr.append('<td class="text-white fw-bold">' + consigneeDetails.gstn + '</td>');
				consigneetr.append('<td class="text-white fw-bold">' + consigneeDetails.customerDetailsAddress + '</td>');


				if (response.isBookingBranch || response.isDeliveryBranch) {
					consignortr.append('<td class=" fw-bold" >' + consignorDetails.customerDetailsMobileNumber + '</td>');
					consigneetr.append('<td class="text-white fw-bold">' + consigneeDetails.customerDetailsMobileNumber + '</td>');
				} else {
					consignortr.append('<td>' + '__' + '</td>');
					consigneetr.append('<td> ' + '__' + ' </td>');
				}

				consignortr.append('<td class="fw-bold">' + (consignorDetails.customerDetailsEmailAddress ? consignorDetails.customerDetailsEmailAddress : '--') + '</td>');
				consigneetr.append('<td class="text-white fw-bold">' + (consigneeDetails.customerDetailsEmailAddress ? consigneeDetails.customerDetailsEmailAddress : '--') + '</td>');


				$('#partyDetails tbody').append(consignortr);
				$('#partyDetails tbody').append(consigneetr);
			}, setConsignemntDetails: function(response) {
				response.tableProperties.showSorting = false;
				TableDataWrapper.setTableData(response);
			}, setBookingCharges: function(response) {
				let wayBillBookingChargesList = response.WayBillBookingChargesList;

				if (wayBillBookingChargesList != undefined && wayBillBookingChargesList.length > 0) {
					$('#chargesDetails').removeClass('hide');
					
					wayBillBookingChargesList.forEach(function(charges) {
						let displayName			= charges['chargeTypeMasterName'];
						let chargeTypeMasterId	= charges['chargeTypeMasterId'];
						let amount				= charges['wayBillBookingChargeChargeAmount'];

						let col = $('<div class="col">');

						let formGroup = $('<div class="form-group" data-attribute="bookLR">');
						col.append(formGroup);

						let label = $('<label class="col-xs-3"><span class="boldspan" id="charge' + chargeTypeMasterId + '" data-selector="totalChargeWeight">' + displayName + '</span></label>')
						formGroup.append(label);

						let divValid = $('<div class="col-xs-3 validation-message">');
						formGroup.append(divValid);

						let input = $('<input class="form-control" type="text" name="charge' + chargeTypeMasterId + '" value="' + amount + '" data-tooltip="' + displayName + '" placeholder="' + displayName + '" id="charge' + chargeTypeMasterId + 'Ele" readonly/>');
						divValid.append(input);

						$('#charges').append(formGroup);
					});
				}
			}, setOperatorCommunityOrderCharges: function(response) {
				let operatorCommunityOrderChargesDetailsList = response.operatorCommunityOrderChargesDetailsList;
				let wayBillTaxTxn = response.wayBillTaxTxn;
				
				let total =	response.wayBill.wayBillGrandTotal;
				
				operatorCommunityOrderChargesDetailsList	= _.sortBy(operatorCommunityOrderChargesDetailsList, 'sequence');
				let table = $('#operatorcomunityordercharges'); // Create table element

				if (operatorCommunityOrderChargesDetailsList != undefined) {
					operatorCommunityOrderChargesDetailsList.forEach(function(charges) {
						let displayName = charges['chargeName'];
						let amount = charges['amount'];

						// Create table row
						let row = $('<tr>');

						// Left side column (label)
						let labelCell = $('<td class="fw-bold" >').text(displayName);
						row.append(labelCell);

						// Right side column (input)
						let inputCell = $('<td>').append($('<input class="form-control form-control-sm text-end" type="text" value="' + amount + '" disabled/>'));
						row.append(inputCell);

						table.append(row); // Append row to table
					});
					if(wayBillTaxTxn != undefined && wayBillTaxTxn != null){
						wayBillTaxTxn.forEach(function(charges) {
							let displayName = charges['taxName'];
							let amount = charges['taxAmount'];
	
							// Create table row
							if(amount > 0){
								let row = $('<tr>');
		
								// Left side column (label)
								let labelCell = $('<td class="fw-bold" >').text(displayName);
								row.append(labelCell);
		
								// Right side column (input)
								let inputCell = $('<td>').append($('<input class="form-control form-control-sm text-end" type="text" value="' + amount + '" disabled/>'));
								row.append(inputCell);
		
								table.append(row); // Append row to table
							}
						});
					}

					// Total row
					let totalRow = $('<tr>');
					let totalLabelCell = $('<td class="fw-bold" >').text('Total');
					let totalAmountCell = $('<td>').append($('<input class="form-control form-control-sm text-end" type="text" value="' + total.toFixed(2) + '" disabled/>'));
					totalRow.append(totalLabelCell, totalAmountCell);

					// Append table to appropriate div based on condition
					if (response.isBookingBranch) {
						table.append(totalRow);
						$('#operatorcomunityordercharges').append(table);
					} else {
						$('#operatorcomunityordercharges').html(totalRow); // Replace content with total row
					}
				}
			}, setOperatorOrderDetails: function(response) {
				var operatorOrderDetails = response.operatorOrderDetailsList;
				$('#viewOperatorOrderDetails').empty();
				let columnArray = new Array();

				for (let i = 0; i < operatorOrderDetails.length; i++) {
					let obj = operatorOrderDetails[i];

					columnArray.push("<td>" + obj.bookingOperatorBranchPincode + "</td>");
					columnArray.push("<td>" + obj.comunityOrderNumber + "</td>");
					columnArray.push("<td>" + obj.crossingBranch + "</td>");
					columnArray.push("<td>" + obj.crossingBranchPincode + "</td>");
					columnArray.push("<td>" + obj.crossingBranchAddress + "</td>");
					columnArray.push("<td>" + obj.crossingBranchPhone + "</td>");
					columnArray.push("<td>" + obj.destinationBranch + "</td>");
					columnArray.push("<td>" + obj.destinationBranchAddress + "</td>");
					columnArray.push("<td>" + obj.destinationBranchCode + "</td>");
					columnArray.push("<td>" + obj.destinationBranchName + "</td>");
					columnArray.push("<td>" + obj.destinationBranchPincode + "</td>");
					columnArray.push("<td>" + obj.sourceBranch + "</td>");
					columnArray.push("<td>" + obj.sourceBranchAddress + "</td>");
					columnArray.push("<td>" + obj.sourceBranchCode + "</td>");
					columnArray.push("<td>" + obj.sourceBranchName + "</td>");
					columnArray.push("<td>" + obj.sourceBranchPhonenumber + "</td>");
					columnArray.push("<td>" + obj.sourceBranchPincode + "</td>");

					$('#viewOperatorOrderDetails').append('<tr>' + columnArray.join(' ') + '</tr>');
					columnArray = [];
				}
			}, setOperatorChargeDetails: function(response) {

				var operatorChargeDetails = response.operatorChargesDetailsList;
				$('#viewOperatorChargeDetails').empty();
				let columnArray = new Array();
				
				operatorChargeDetails	= _.sortBy(operatorChargeDetails, 'sequence');

				for (let i = 0; i < operatorChargeDetails.length; i++) {
					let obj = operatorChargeDetails[i];

					columnArray.push("<td>" + obj.chargeName + "</td>");
					columnArray.push("<td>" + obj.amount + "</td>");

					$('#viewOperatorChargeDetails').append('<tr>' + columnArray.join(' ') + '</tr>');
					columnArray = [];
				}
			}, lrTypeColorCode: function(response) {
				// Apply styles to the first span element
				$("#wayBillCurrentStatus").children("span:first").css({
					"padding": "4px",
					"font-weight": "bold",
					"border-radius": "10%"
				});

				// Check the value of the first span element and add class accordingly
				if ($("#wayBillCurrentStatus").children("span:first").text().trim() === 'DELIVERED') {
					$("#wayBillCurrentStatus").children("span:first").addClass('bg-success');
				} 
						 
				if (wayBill.wayBillTypeId == WAYBILL_TYPE_PAID) {
					$('.card-header').attr('style', 'background-color:#0073BA; font-weight:bold');
					$('#lrType').html( response.wayBillType ).css({
						'background':'#0073BA',
						'border-radius': '10%',
						"padding":"4px",
						
					})
				} else {
					$('#lrType').html(response.wayBillType ).css({
						'background':'#E77072',
						'border-radius': '10%',
						"padding":"4px",
					})

					$('.paymentdiv').hide()
					$('.card-header').attr('style', 'background-color:#E77072; font-weight:bold');
				}
			}, getImagesTCE: function(comunityOrderId) {
				jsonObject = new Object();
				jsonObject.comunityOrderId	= comunityOrderId;
				jsonObject.moduleId			= BOOKING;

				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL + '/photoTransactionWS/getPhotosFromTCEForView.do', _this.setImageDetails, EXECUTE_WITHOUT_ERROR);
			}, getCRimages: function(comunityOrderId) {
				jsonObject = new Object();
				jsonObject.comunityOrderId	= comunityOrderId;
				jsonObject.moduleId			= GENERATE_CR;

				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL + '/photoTransactionWS/getPhotosFromTCEForView.do', _this.setImageDetails, EXECUTE_WITHOUT_ERROR);
			}, getPODImages: function(comunityOrderId) {
				jsonObject = new Object();
				jsonObject.comunityOrderId	= comunityOrderId;
				jsonObject.moduleId			= TCE_DELIVERY_POD;

				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL + '/photoTransactionWS/getPhotosFromTCEForView.do', _this.setImageDetails, EXECUTE_WITHOUT_ERROR);
			}, setImageDetails: function(response) {
				hideLayer();
				
				var imageContainer = document.getElementById('imageContainer');
					
				if(response.error != undefined && response.error){
					 showMessage('info', 'Image Not Found !');
					 return false;
				}
				
				if(photoModel != null)
					photoModel.show();
					 
				var filenames = JSON.parse(response.imageStr);
		
				if (Object.keys(filenames).length === 0) {
					imageContainer.innerHTML = '';
					// If filenames object is empty, show a message in a div
					var messageDiv = document.createElement('div');
					messageDiv.textContent = "No photos available";
		
					imageContainer.appendChild(messageDiv);	 
					return; // Exit the function
				}
	
				_this.cacheImageData(filenames); // Cache the image data
				imageContainer.innerHTML = ''; // Clear previous content
				
				var imgContainer = document.createElement('div'); // Container for the image
				imgContainer.classList.add('photodiv')
				// Iterate through the filenames and create containers for each image
				for (var filename in filenames) {
					if (filenames.hasOwnProperty(filename)) {
						var img = document.createElement('img');
						img.className = 'displayedImage';
						img.src = 'data:image/jpeg;base64,' + filenames[filename];
						imgContainer.appendChild(img);
					}
				}
		
				imageContainer.appendChild(imgContainer);
			}, cacheImageData: function(filenames) {
				// Cache the image data in the global variable
				for (var filename in filenames) {
					if (filenames.hasOwnProperty(filename)) {
						imageDataCache[filename] = filenames[filename];
					}
				}
			}, downloadAllImage() {
				for (let filename in imageDataCache) {
					if (imageDataCache.hasOwnProperty(filename)) {
						var img = document.createElement('img');
						img.className = 'displayedImage';
						var base64String= img.src = 'data:image/jpeg;base64,' + imageDataCache[filename];
	
						// Remove data URL prefix
						let base64Image = base64String.replace(/^data:image\/jpeg;base64,/, '');
						// Convert base64 to blob
						let blob = new Blob([new Uint8Array(atob(base64Image).split('').map(char => char.charCodeAt(0)))], { type: 'image/jpeg'	 });
	
						// Create temporary URL for the blob
						let url = URL.createObjectURL(blob);
	
						// Create a link element
						let link = document.createElement('a');
						link.href = url;
						link.download = filename; // Set the filename
						document.body.appendChild(link);
	
						// Trigger download
						link.click();
	
						// Clean up
						document.body.removeChild(link);
						URL.revokeObjectURL(url);
					}
				}
			}, viewDetails : function(wayBillId) {
				let params	= getParamsForNewWindow(screen.width, screen.height)
				 
				childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=lrStatusDetails&masterid='+wayBillId+'', 'newwindow', params);
			}, cancelLR : function() {
				if(!confirm('Are you sure to cancel LR ?'))
					return;
				
				jsonObject = new Object();
				jsonObject.waybillId	= wayBillId;
				jsonObject.cancelRemark = $('#remark').val();

				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL + '/lrCancellationWS/cancelWayBill.do?', _this.setResponseAferLRCancel, EXECUTE_WITH_NEW_ERROR);
			}, setResponseAferLRCancel : function(response) {
				hideLayer();
				
				if (response.message != undefined) {
					if(response.message.type != 1)
						return;
				}
				
				if(response.successfullyCancel != undefined && response.successfullyCancel)
					location.reload();
					
			}, setPodResponse : function(response){
				hideLayer()
				
				if (response.message != undefined) {
					document.getElementById("uploadPODmodal").classList.add("hide");
					return;
				}
				
				document.getElementById("uploadPODmodal").classList.remove("hide");
				location.reload();
			}, uploadPOD: function(response){
				
				$('#uploadPODmodal').on('click', function() {
					if(wayBill.wayBillStatus == WAYBILL_STATUS_DELIVERED) {
						$('#exampleModal').modal('show');
					} else {
						showAlertMessage('error','You do not have permision !')
					}
				});

				var fileInput = $("#fileInput");
				var uploadbtn = $('#uploadPOD');
				var clearBtn = $('#clearFiles');

			/*	uploadbtn.on("click", function() {
					fileInput.click();
				});*/
				
uploadbtn.on('click', function() {
    if (selectedFiles.length > 0) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Previous selected files will be removed.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                console.log('User confirmed. Triggering file input...');
                fileInput.click();
            } else {
                console.log('No action.');
            }
        });
    } else {
        fileInput.click();
    }
});




				clearBtn.on("click", function() {
					fileInput.val(''); 
					selectedFiles = []; 
					updatePreview();
				});

				fileInput.on("change", function() {
					var files = fileInput[0].files;

					var validFiles = Array.from(files).filter(function(file) {
						return file.type === 'image/jpeg' || file.type === 'image/png' || file.name.toLowerCase().endsWith('.jpeg') || file.name.toLowerCase().endsWith('.png');
					});

					selectedFiles = validFiles;
					updatePreview();
				});

				function updatePreview() {
					if (selectedFiles.length === 0) {
						$('#filePreview').text('No selected file');
					} else {
						var preview = '';
						selectedFiles.forEach(function(file, index) {
							var imageUrl = URL.createObjectURL(file);
							preview += '<div class="preview-item" style="position: relative;"><img src="' + imageUrl + '" alt="' + file.name + '" style="max-width: 100px; max-height: 100px; margin: 5px;"><button class="btn btn-danger delete-btn" style="position: absolute; top: 5px; " data-index="' + index + '"><i class="fas fa-trash"></i></button></div>';
						});
						$('#filePreview').html(preview);
					}
				}

				$(document).on('click', '.delete-btn', function() {
					var index = $(this).data('index');
					selectedFiles.splice(index, 1);
					updatePreview();
				});
				
				function fileToBase64(file) {
					return new Promise((resolve, reject) => {
						const reader = new FileReader();

						reader.onload = function(event) {
							resolve(event.target.result.split(',')[1]); 
						};

						reader.onerror = function(error) {
							reject(error);
						};

						reader.readAsDataURL(file);
					});
				};
				
			 async function uploadFilesAjax(){
					var imageStr  = "";
					var jsonObject = new Object();
					for(const file of selectedFiles) {
						const base64Data =	await fileToBase64(file);
						imageStr += 'data:image/jpeg;base64,'+base64Data;
					}
					
					jsonObject['imageStr'] = imageStr;
					jsonObject['communityOrderReference'] = wayBill.wayBillNumber;
					jsonObject['communityOrderId'] = wayBill.communityOrderId;
					jsonObject['waybillId'] = wayBill.wayBillId;
					jsonObject['moduleId'] = TCE_DELIVERY_POD;
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/photoTransactionWS/uploadPodOfTceLRDelivery.do?', _this.setPodResponse, EXECUTE_WITH_NEW_ERROR);
				}

				$('#saveimages').on('click', function() { 
					if(selectedFiles.length == 0)
						showAlertMessage('error', 'Click Atleast One Pic !')
					else if(selectedFiles.length > 0 && selectedFiles.length <= 5)
						uploadFilesAjax(response), $('#exampleModal').modal('hide');
					else
						showAlertMessage('error', 'Only 5 File are allowed !')
				});
			}, uploadLRImages: function(response){
				var fileInput = $("#fileInputLR");
				var uploadbtn = $('#uploadLRImages');
				var clearBtn = $('#clearLrImageFiles');

				uploadbtn.on("click", function() {
					fileInput.click();
				});

				clearBtn.on("click", function() {
					fileInput.val(''); 
					selectedFiles = []; 
					updatePreview();
				});

				fileInput.on("change", function() {
					var files = fileInput[0].files;

					var validFiles = Array.from(files).filter(function(file) {
						return file.type === 'image/jpeg' || file.type === 'image/png' || file.name.toLowerCase().endsWith('.jpeg') || file.name.toLowerCase().endsWith('.png');
					});

					selectedFiles = validFiles;
					updatePreview();
				});

				function updatePreview() {
					if (selectedFiles.length === 0) {
						$('#filePreviewLR').text('No selected file');
					} else {
						var preview = '';
						selectedFiles.forEach(function(file, index) {
							var imageUrl = URL.createObjectURL(file);
							preview += '<div class="preview-item" style="position: relative;"><img src="' + imageUrl + '" alt="' + file.name + '" style="max-width: 100px; max-height: 100px; margin: 5px;"><button class="btn btn-danger delete-btn" style="position: absolute; top: 5px; " data-index="' + index + '"><i class="fas fa-trash"></i></button></div>';
						});
						$('#filePreviewLR').html(preview);
					}
				}

				$(document).on('click', '.delete-btn', function() {
					var index = $(this).data('index');
					selectedFiles.splice(index, 1);
					updatePreview();
				});
				
				function fileToBase64(file) {
					return new Promise((resolve, reject) => {
						const reader = new FileReader();

						reader.onload = function(event) {
							resolve(event.target.result.split(',')[1]); 
						};

						reader.onerror = function(error) {
							reject(error);
						};

						reader.readAsDataURL(file);
					});
				};
				
			 async function uploadLRFilesAjax(){
					var imageStr  = "";
					var jsonObject = new Object();
					
					for(const file of selectedFiles) {
						const base64Data =	await fileToBase64(file);
						imageStr += 'data:image/jpeg;base64,'+base64Data;
					}
					
					jsonObject['imageStr'] 					= imageStr;
					jsonObject['communityOrderReference'] 	= wayBill.wayBillNumber;
					jsonObject['communityOrderId'] 			= wayBill.communityOrderId;
					jsonObject['waybillId'] 				= wayBill.wayBillId;
					jsonObject['tranceModuleId'] 			= 1;
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/photoTransactionWS/uploadTranCELRImages.do?', _this.setPodResponse, EXECUTE_WITH_NEW_ERROR);
				}

				$('#saveLRimages').on('click', function() { 
					if(selectedFiles.length == 0)
						showAlertMessage('error', 'Click Atleast One Pic !')
					else if(selectedFiles.length > 0 && selectedFiles.length <= 5)
						uploadLRFilesAjax(response), $('#lrImageModal').modal('hide');
					else
						showAlertMessage('error', 'Only 5 File are allowed !')
				});
			}, setShortAccessDamageDetails : function (response) {
				updateTabCounts(response);
				populateTable('shortReceiveTable', response.shortReceiveList);
				populateTable('excessReceiveTable', response.excessReceiveList);
				populateTable('damageReceiveTable', response.damageReceiveList);
				toggleTabDiv(response.shortReceiveList, response.excessReceiveList, response.damageReceiveList);

			}, resendDeliveryOtp : function(wayBillId){
				var jsonObject = new Object();
				jsonObject['waybillId'] 				= wayBill.wayBillId;
				showLayer();
					
				getJSON(jsonObject, WEB_SERVICE_URL + '/lRSearchWS/resendOTPMessageForTranCE.do?', _this.setResendOtpResponse, EXECUTE_WITH_NEW_ERROR);
			
			}, setResendOtpResponse : function (response){
	    
			}
	});
});

function openTab(evt, tabName) {
	// Hide all tab contents
	const tabContents = document.getElementsByClassName("tab-content");
	for (let i = 0; i < tabContents.length; i++) {
$(tabContents[i]).addClass("hide");
	}

	// Remove the active class from all tabs
	const tabLinks = document.getElementsByClassName("tablinks");
	for (let i = 0; i < tabLinks.length; i++) {
		tabLinks[i].className = tabLinks[i].className.replace(" active", "");
	}

	// Show the selected tab content
	$('#'+tabName).removeClass("hide")
	evt.currentTarget.className += " active";
}


// Function to populate table rows
function populateTable(tableId, data, corporateAccount) {
	
	if(data.length === 0){
		return false;
	}

	const tableBody = document.getElementById(tableId).querySelector("tbody");
	tableBody.innerHTML = ''; // Clear existing rows

	data.forEach((item, index) => {
		let itemId = 0;
		let settlementIdType = '';
		let number = '';
		let article = '';
		let date = '';
		let saidToContain = ''; 

		// Determine the type of ID to pass based on tableId
		if (tableId === 'shortReceiveTable') {
			itemId = item.shortReceiveId || 0;
			settlementIdType = 'shortReceiveId';
			number = item.shortNumber;
			article = item.shortArticle;
			date = item.shortDate;
		} else if (tableId === 'damageReceiveTable') {
			itemId = item.damageReceiveId || 0;
			settlementIdType = 'shortDamageId';
			number = item.damageNumber;
			article = item.damageArticle;
			date = item.damageDate;
		} else if (tableId === 'excessReceiveTable') {
			itemId = item.excessReceiveId || 0;
			settlementIdType = 'shortExcessId';
			number = item.excessNumber;
			article = item.excessArticle;
			date = item.excessDate;

			// Loop through corporateAccount and assign only one saidToContain per item
			if (corporateAccount && corporateAccount.length > 0) {
				const corporateAccountItem = corporateAccount[index]; // Get the matching record by index
				if (corporateAccountItem) {
					saidToContain = corporateAccountItem.saidToContain || '--'; // Set saidToContain from the corresponding corporateAccount
				}
			}
		}

		const row = `
		<tr>
			<td>${number || '--'}</td> <!-- Dynamic number -->
			<td>${item.turNumber || '--'}</td>
			<td>${item.branchName || '--'}</td>
			<td>${item.packingType || '--'}</td>
			<td>${item.totalArticle || '--'}</td>
			<td>${article || '--'}</td> <!-- Dynamic article -->
			<td>${tableId === 'excessReceiveTable' ? saidToContain : (item.saidToContain || '--')}</td> <!-- Conditional saidToContain -->
			<td>${item.amount || '--'}</td>
			<td>${date || '--'}</td> <!-- Dynamic date -->
			<td>${item.remark || '--'}</td>
			<td>
				<a href="javascript:void(0)" class="btn btn-info btn-sm" 
				   onclick="viewSettlementDetails('${itemId}', '${settlementIdType}')">
				   <b>View Settlement Details</b>
				</a>
			</td>
		</tr>`;
		
		tableBody.innerHTML += row;
	});
}

function toggleTabDiv(shortReceiveList, excessReceiveList, damageReceiveList) {

   // const tabDiv = document.querySelector('.tab'); // Select the tab div
     //const shortTabContent = document.getElementById('shortReceive');
    //const $('#shortReceive') = document.getElementById('excessReceive');
   // const damageTabContent = document.getElementById('damageReceive');
    const hasRecords = shortReceiveList.length > 0 || excessReceiveList.length > 0 || damageReceiveList.length > 0;

	if (hasRecords) {
		$('#RecieveDetailsTableDiv').removeClass('hide')
		//tabDiv.removeClass('hide'); // Show the tab div if any table has records
		//if (shortReceiveList.length > 0 || excessReceiveList.length > 0 || damageReceiveList.length > 0) {
			$('#shortReceive').removeClass('hide');
			$('#excessReceive').removeClass('hide')
			$('#damageReceive').removeClass('hide')
	//	}
		
	} else {
		$('#RecieveDetailsTableDiv').addClass('hide')
		//tabDiv.addClass('hide'); // Hide the tab div if no tables have records
		$('#shortReceive').addClass('hide'); // Ensure all tab contents are hidden
		$('#excessReceive').addClass('hide');
		$('#damageReceive').addClass('hide');
		//$('#shortReceive').hide();


	}
}
function updateTabCounts(response) {
	// Extract counts or default to 0 if not present
	const totalUnsettledShortCount = response.totalUnsettledShort || 0;
	const totalUnsettledDamageCount = response.totalUnsettledDamage	 || 0;
	const totalUnsettledExcessCount = response.totalUnsettledExcess || 0;
	// Update the tab link text
   document.getElementById("shortReceiveTab").innerText = `Short Receive Details (Pending Settlement = ${totalUnsettledShortCount})`;
	document.getElementById("excessReceiveTab").innerText = `Excess Receive Details (Pending Settlement = ${totalUnsettledExcessCount})`;
	document.getElementById("damageReceiveTab").innerText = `Damage Receive Details (Pending Settlement = ${totalUnsettledDamageCount})`;
}

function viewSettlementDetails(itemId, settlementIdType) {
	// Create the JSON object with the required data
	let jsonObject = {}; // Initialize empty JSON object

	// Create JSON object based on settlementIdType
	if (settlementIdType === 'shortExcessId') {
		jsonObject = {
			excessReceiveId: itemId
		};
	} else if (settlementIdType === 'shortDamageId') {
		jsonObject = {
			damageReceiveId: itemId
		};
	} else if (settlementIdType === 'shortReceiveId') {
		jsonObject = {
			shortReceiveId: itemId
		};
	}

	// Define the URL for the appropriate web service
		let serviceUrl = '';

  if (settlementIdType === 'shortExcessId') {
		serviceUrl = WEB_SERVICE_URL + '/excessReceiveWS/getExcessReceiveSettlementDetail.do?';
	} else if (settlementIdType === 'shortDamageId') {
		serviceUrl = WEB_SERVICE_URL + '/damageReceiveWS/getDamageReceiveSettlementDetail.do?';
	} else if (settlementIdType === 'shortReceiveId') {
		serviceUrl = WEB_SERVICE_URL + '/shortReceiveWS/getShortReceiveSettlementDetail.do?';
	}
	
	  if (serviceUrl) {
		getJSON(jsonObject, serviceUrl, getResponseForView, EXECUTE_WITHOUT_ERROR);
	} else {
		console.error('Invalid settlementIdType:', settlementIdType);
	}
}

function getResponseForView(response) {

	let settlementData = null;	// Declare settlementData and initialize it as null
	
	if (response.ShortReceiveSettlement) {
		settlementData = response.ShortReceiveSettlement.CorporateAccount;
	} else if (response.ExcessReceiveSettlement) {
		settlementData = response.ExcessReceiveSettlement.CorporateAccount;
	} else if (response.DamageReceiveSettlement) {
		settlementData = response.DamageReceiveSettlement.CorporateAccount;
	}
	  
	const tableContainer = document.getElementById("table-container");
	const headersDiv = document.getElementById("table-headers");
	// Clear any previous content in the table container
	tableContainer.innerHTML = "";
	
	if (!settlementData || settlementData.length === 0) {
		tableContainer.innerHTML = "<p>No records found</p>";
	} else {
		// Get headers from the data attribute
		const headers = JSON.parse(headersDiv.getAttribute('data-headers'));
	
		// Create the table element
		const table = document.createElement("table");
	
		// Create the table header
		const thead = document.createElement("thead");
		const headerRow = document.createElement("tr");
	
		headers.forEach(headerText => {
		  const th = document.createElement("th");
		  th.textContent = headerText;
		  headerRow.appendChild(th);
		});
		
		thead.appendChild(headerRow);
		table.appendChild(thead);
	
		// Create the table body
		const tbody = document.createElement("tbody");
	
		// Populate rows with settlement data
		settlementData.forEach(settlement => {
		  const row = document.createElement("tr");
		  const branchNameCell = document.createElement("td");
		  branchNameCell.textContent = settlement.branchName;
		  row.appendChild(branchNameCell);
	
		  const executiveNameCell = document.createElement("td");
		  executiveNameCell.textContent = settlement.executiveName;
		  row.appendChild(executiveNameCell);
	
		  const settlementTypeNameCell = document.createElement("td");
		  settlementTypeNameCell.textContent = settlement.settlementTypeName;
		  row.appendChild(settlementTypeNameCell);
	
	
		  const remarkCell = document.createElement("td");
		  remarkCell.textContent = settlement.remark;
		  row.appendChild(remarkCell);
	
		  const settlementDateCell = document.createElement("td");
		  settlementDateCell.textContent = settlement.settlementDateStr;
		  row.appendChild(settlementDateCell);
	
		  tbody.appendChild(row);
		});
	
		table.appendChild(tbody);
	
		// Append the table to the container
		tableContainer.appendChild(table);
	}
	// Show the modal
	$('#settlementModal').modal('show');
}

