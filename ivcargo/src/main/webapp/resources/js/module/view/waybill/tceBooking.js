var GeneralConfiguration = null;
var PaymentTypeConstant = null;
var moduleId = 0;
var incomeExpenseModuleId = 0;
var ModuleIdentifierConstant = null;
var isShowMap = true;
let packingTypeList;
define([
	PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	, 'JsonUtility'
	, 'messageUtility'
	, 'autocomplete'
	, 'autocompleteWrapper'
	, 'nodvalidation'
	, 'focusnavigation'//import in require.config
], function() {
	'use strict';
	let imageStr = "";let minimumWeightForTranCE;
	let jsonObject = new Object(), _this = '', bankPaymentOperationRequired = false, consignmentDataHM = {}, isValidEWayBill, idNum = 0,
		routeHm = null, routeLegsList = null, waybillId = 0, routeNumber = 0, newRouteLegsList = null, totalAmount = 0 , dpincode, tceReferenceId, 
		offerId, invoiceDates, consignorPincode,consignorId = 0, consigneePincode,consigneeId = 0, ratesnotfound = false, cftUnitName = CFT_UNIT_INCH_NAME, cftUnitId = CFT_UNIT_INCH_ID, subCommodityHM;
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/tceBookingWS/loadTCEBooking.do?', _this.initializeData, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, initializeData: function(response) {
			minimumWeightForTranCE = response.tceConfiguration.minimumWeightForTranCE;
			
			if (response.message != undefined) {
				hideLayer();
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}

			GeneralConfiguration = response.GeneralConfiguration;

			bankPaymentOperationRequired = GeneralConfiguration.BankPaymentOperationRequired;

			let loadelement		= new Array();
			let baseHtml		= new $.Deferred();
			let generateEwayBillHtml		= new $.Deferred();
			let paymentHtml		= new $.Deferred();
				packingTypeList = response.packingTypeList;
			let subCommodityList = response.subCommodityList;
			
			subCommodityHM = new Map(subCommodityList.map((obj) => [obj.subCommodityMasterId, obj]));

			loadelement.push(baseHtml);
			loadelement.push(generateEwayBillHtml);

			if (bankPaymentOperationRequired)
				loadelement.push(paymentHtml);

			$("#mainContent").load("/ivcargo/template/tcebooking/tceBooking.html", function() {
				baseHtml.resolve();
				
				$("#GenerateEwaybillPanel").load("/ivcargo/template/tcebooking/GenerateEwaybill.html", function() {
					generateEwayBillHtml.resolve();
				})
			});
			
			if (bankPaymentOperationRequired) {
				$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelectionTce.html", function() {
					setIssueBankAutocomplete();
					setAccountNoAutocomplete();
					paymentHtml.resolve();
				});
			} else {
				$("#bankPaymentOperationPanel").remove();
			}

			$.when.apply($, loadelement).done(function() {
				let paymentTypeArr			= response.paymentTypeArr;
				moduleId					= response.moduleId;
				incomeExpenseModuleId		= response.incomeExpenseModuleId;
				ModuleIdentifierConstant	= response.ModuleIdentifierConstant;
				PaymentTypeConstant			= response.PaymentTypeConstant;
				let subCommodityList		= response.subCommodityList;
			
				subCommodityHM = new Map(subCommodityList.map((obj) => [obj.subCommodityMasterId, obj]));
			
				$(function() {
					$('#info').remove()
				});
				// $('#consignorEmailAsterisk').show(); 

				_this.hideandShow();
				_this.setPaymentTypeOption(paymentTypeArr);

				for (let packing of packingTypeList) {
					operationOnSelectTag('packingTypeEle', 'addNew', packing.packingTypeName, packing.packingTypeId)
				}
				
				for (let subComodity of response.subCommodityList) {
					operationOnSelectTag('subCommodityEle', 'addNew', subComodity.subCommodityDescription, subComodity.subCommodityMasterId)
				}
				
				$('#subCommodityEle').on('change', function(event) {
					var subCommodityId = Number($('#subCommodityEle').val());
					const subCommObj = subCommodityHM.get(subCommodityId);

					if (!subCommObj)
						return;

					if (!subCommObj.insuranceRequired) {
						showMessage('error', 'With Selected Sub Commodity You Cannot Book LR !');
						return;
					}
				});
				
				_this.bindEvents();
				_this.oninputfunction();
				_this.onChargeWeightChange();
				_this.ewayBillValidation();
				_this.pincodeValidation();
				_this.lrTypeColor();
				_this.uploadImage();
				_this.inputvalidate();

				initialiseFocus();
				
			  //$('input').off('focus'); //

				$('#toPincodeEle').focus();
				hideLayer();
				
			//	_this.generateEwaybill();
			});
		}, setBookingCharges: function(bookingCharges, taxDetails) {
			bookingCharges	= _.sortBy(bookingCharges, 'sequence');
			$('#charges').empty();
			$('#taxes').empty();
			$('#totalDiv').empty();
			
			let container	 = $('#charges');
			let taxContainer = $('#taxes');
			let totalDiv	 = $('#totalDiv');
			let totalOrderAmount = 0;
			
			$('#weigthFreightRate').val(0);

			bookingCharges.forEach(function(charges) {
				let displayName			= charges['chargeName'];
				let actualName			= charges['chargeName'];
				let chargeTypeMasterId	= charges['chargeTypeId'];
				let amount				= charges['amount'];
				
				if(chargeTypeMasterId == 313)
					displayName = 'RO Insurance';

				if(amount != undefined)
					totalOrderAmount += amount;
				
				if(chargeTypeMasterId == FREIGHT && amount != undefined)
					$('#weigthFreightRate').val((amount / $('#totalChargeWeightEle').val()).toFixed(2));

				let col = $('<tr >');

				let formGroup = $('<td	data-attribute="bookLR">');
				col.append(formGroup);

				let label = $('<label ><span data-tooltip="' + actualName + '" id="charge' + chargeTypeMasterId + '" data-selector="totalChargeWeight">' + displayName + '</span></label>')
				formGroup.append(label);

				let divValid = $('<td class=" validation-message">');
				col.append(divValid);

				let input = $('<input class="form-control  form-control-sm text-end"   type="text" name="charge' + chargeTypeMasterId + '" value = "' + amount.toFixed(2) + '" data-tooltip="' + actualName + '" placeholder="' + actualName + '" id="chargeEle' + chargeTypeMasterId + '" maxlength="8" onkeypress="return noNumbers(event);if(getKeyCode(event) == 17){return false;};" disabled />');
				divValid.append(input);

				container.append(col);
			});

			taxDetails.forEach(function(charges) {
				let displayName			= charges['taxName'];
				let chargeTypeMasterId	= charges['taxMasterId'];
				let amount				= charges['taxAmount'];

				if(amount != undefined && Number($('#taxPaidByEle').val()) == TAX_PAID_BY_TRANSPORTER_ID)
					totalOrderAmount += amount;
			
				let col = $('<tr >');

				let formGroup = $('<td style="padding-left: 18px;" data-attribute="bookLR">');
				col.append(formGroup);

				let label = $('<label ><span id="tax' + chargeTypeMasterId + '" data-selector="totalChargeWeight">' + displayName + '</span></label>')
				formGroup.append(label);

				let divValid = $('<td class=" validation-message">');
				col.append(divValid);

				let input = $('<input class="form-control  form-control-sm text-end"   type="text" name="tax' + chargeTypeMasterId + '" value = "' + amount.toFixed(2) + '" data-tooltip="' + displayName + '" placeholder="' + displayName + '" id="taxEle' + chargeTypeMasterId + '" maxlength="8" onkeypress="return noNumbers(event);if(getKeyCode(event) == 17){return false;};" disabled />');
				divValid.append(input);

				taxContainer.append(col);
			});

			if(Number($('#taxPaidByEle').val()) == TAX_PAID_BY_TRANSPORTER_ID )
				$('#taxTable').removeClass("hide"); 
			else
				$('#taxTable').addClass("hide");
			
			_this.setFinalAmount(totalDiv, totalOrderAmount);

			initialiseFocus();
		}, setFinalAmount: function(container, totalOrderAmount) {
			let col = $('<tr>');

			let formGroup = $('<td	data-attribute="bookLR">');
			col.append(formGroup);

			let label = $('<label class="m-auto" ><span id="charge"	 style="font-size: large; vertical-align: middle;" class="fw-bold" data-selector="totalOrderAmount">Total</span></label>')
			formGroup.append(label);

			let divValid = $('<td class="validation-message pt-4" >');
			col.append(divValid);

			let input = $('<input class="form-control form-control-sm fw-bold  text-end" style="font-size: large; width: 189px; margin-left: auto;" type="text" name="totalOrderAmount" value = "' + totalOrderAmount.toFixed(2) + '" data-tooltip="Total Amount" placeholder="Total Amount" id="totalOrderAmount" maxlength="8" onkeypress="return noNumbers(event);if(getKeyCode(event) == 17){return false;};" disabled/>');
			divValid.append(input);

			$('#popupTotalamount').text(totalOrderAmount.toFixed(2))
			container.append(col);
		}, setTaxes: function(response, container) {
			(response.taxes).forEach(function(tax) {
				let tr = $('<tr>');
				tr.append('<td><b>' + tax['taxName'] + ' ' + tax['taxAmount'].toFixed(2) + ' %</b></td>');

				if (tax.taxPercentage) {
					tr.append('<td><input type="text" name="tax' + tax['taxMasterId'] + '" id="tax' + tax['taxMasterId'] + '" value = "0"'
						+ 'class="form-control text-right" data-tooltip = "' + tax['taxName'] + '" readonly= "readonly"/>'
						+ '<input type="checkbox" id="Perctax' + tax['taxMasterId'] + '" name="Perctax' + tax['taxMasterId'] + '" value="' + tax['taxAmount'].toFixed(2) + '" class="hide" checked="checked"></td>');
				} else {
					tr.append('<td><input type="text" name="tax' + tax['taxMasterId'] + '" id="tax' + tax['taxMasterId'] + '" value = "' + tax['taxAmount'].toFixed(2) + '"'
						+ 'class="form-control text-right" data-tooltip = "' + tax['taxName'] + '" readonly= "readonly"/>'
						+ '<input type="checkbox" id="Perctax' + tax['taxMasterId'] + '" name="Perctax' + tax['taxMasterId'] + '" value="' + tax['taxAmount'].toFixed(2) + '" class="hide" readonly="readonly"></td>');
				}

				container.append(tr);
			});
		},getNearByPincodes: function() {
			console.log('insoide getNearByPincodes.............')
		}, checkRoutes: function() {
			var isChecked = false;
		
			$('input[name="routeDetails"]').each(function(){
				if ($(this).is(':checked')) {
					isChecked = true;
					return false; 
				}
			});
		
			return isChecked; 
		}, bindEvents: function() {
			
			
			// On blur for consignor and consignee
			$("#consignorNumberEle").blur(function() {
				_this.validateConsignorAndConsgineeMobileNumber("consignorNumberEle", "Consignor Mobile Number");
			});

			$("#consigneeNumberEle").blur(function() {
				_this.validateConsignorAndConsgineeMobileNumber("consigneeNumberEle", "Consignee Mobile Number");
			});
			
			$('#addConsignmentEle').click(async function(event) {

				if (!_this.checkRoutes()) {
					showMessage('error' , "No route is selected!");
					return;
				}

				if ( _this.validatePartyDetails() && _this.validateAddArticle()) {
					_this.checkAndAddConsignment();
					_this.lrTypeColor();
					_this.getActualOfferRates();
					$('#chargesDiv').show();
					
				}
				//setTimeout(()=>{$('#quantityEle').focus()},100)
			
			});

			$('#validateAndBookLR').click(function() {
				if (!_this.checkRoutes()) {
					showMessage('error' , "No route is selected!");
					return;
				}
				
				_this.validateAndBookLR();
			});

			$('#bookLREle').click(function() {
				_this.bookLR();
			});
			
			$('#pincodenearby').click(function() {
				_this.getNearByPincodes();
			});
			$('.toggleMapList').click(function(){

				if(isShowMap ==	 true){
					$('.toggleMapList').html('View on List')
					$('.toggleMapList').addClass('btn-success')
					$('.toggleMapList').removeClass('btn-primary')
					$('#pincodeMap').removeClass('hide')
					$('#nPincodeList').addClass('hide')
					$('.mapviewmodal').addClass('modal-xl')
					isShowMap = false
				}else{
					$('.toggleMapList').html('View on Map')
					$('.toggleMapList').addClass('btn-primary')
					$('.toggleMapList').removeClass('btn-success')
					$('#pincodeMap').addClass('hide')
					$('#nPincodeList').removeClass('hide')
					$('.mapviewmodal').removeClass('modal-xl')
					isShowMap = true;

				}
			})
			$("#toPincodeEle").blur(function(event) {
				//_this.getDataByEwaybill();
			});

			$("#lengthEle, #breathEle, #heightEle, #quantityEle").blur(function(event) {
				_this.calculateLBH();
			});

			$("#lbhUnitEle").on("change", function() {
				_this.calculateLBH();
			})

			$("#totalChargeWeightEle").blur(function(event) {
				_this.getActualOfferRates();
			});
			
			$("#hsnCodeEle").blur(function(event) {
				if (!($("#hsnCodeEle").val() === "" || $("#hsnCodeEle").val() == null))
				_this.getSaidToContainOnHSNCode(this); 
			});

			$("#weightEle").keypress(function(event) {
				if (event.keyCode == 13) {
					let weightValue = $(this).val().trim();

					if (weightValue === "") {
						showMessage('error', 'Please enter a value for weight!');
						return false;
					}

					_this.getDetailsOfRoute();
					_this.resetDataAfterBooking();
					$('#bookedLRDetails').addClass('hide');
				}
			});
		 
			$("#ewaybillEle").blur(function() {
				isValidEWayBill = false;
				_this.getDataByEwaybill();
			});

			$("#consignorGstnEle").blur(function() {
				_this.validateGSTNumberByApi(1);
			});

			$("#consigneeGstnEle").blur(function() {
				_this.validateGSTNumberByApi(2);
			});

			$('#consignorGstnEle').keydown(function(event) {
				if (getKeyCode(event) == 13)
					return validateInputTextFeild(9, 'consignorGstnEle', 'consignorGstnEle', 'info', gstnErrMsg);
			});

			$('#consigneeGstnEle').keydown(function(event) {
				if (getKeyCode(event) == 13)
					return validateInputTextFeild(9, 'consigneeGstnEle', 'consigneeGstnEle', 'info', gstnErrMsg);
			});

			$("#length #breadth #height").blur(function() {
				_this.validateLBH();
				_this.calculateLBH();
			});

			$('#lrNumberonbook').click(function() {
				_this.lrSearch();
			});

			$('.lrprintbtn').click(function() {
				_this.lrPrint();
			});

			$('#wayBillTypeEle').on('change', function() {
				_this.lrTypeColor();
			});
			
			$("#lbhUnitEle").on("change", function() {
				if ($(this).is(":checked")) {
					cftUnitName = CFT_UNIT_INCH_NAME;
					cftUnitId = CFT_UNIT_INCH_ID;
					_this.calculateLBH();
				} else {
					cftUnitName = CFT_UNIT_CM_NAME;
					cftUnitId = CFT_UNIT_CM_ID;
					_this.calculateLBH();
				}
				
				$('.cftUnitName').html(cftUnitName);
			});
			
			$('#citywisePincode').click(function() {
				// Fetch citywise pincodes and show in a new tab
				_this.fetchCitywisePincodes()
			});

			$('#offersLink').click(function() {
				_this.getCurrentOffers()
			});
			
			$('#proceedWithBooking').click(function() {
				$('#noticeModal').modal('hide');
				$('#exampleModal').modal('show');
			});
			
			$('#consignorEmailEle').on('input', function() {
				const lowercaseEmail = $(this).val().toLowerCase();
				$(this).val(lowercaseEmail);
			});

			$('#consigneeEmailEle').on('input', function() {
				const lowercaseEmail = $(this).val().toLowerCase();
				$(this).val(lowercaseEmail);
			});
		}, getDetailsOfRoute: function() {
			let jsonObject = {};

			if ($('#toPincodeEle').val() <= 0) {
				showMessage('error', destinationPincodeErrMsg);
				$('#toPincodeEle').focus();
				return;
			}

			jsonObject.destPinCode	= $('#toPincodeEle').val();
			jsonObject.weight		= $('#weightEle').val();

			showLayer();

			getJSON(jsonObject, WEB_SERVICE_URL + '/bookingRateWS/sourceDestinationPincodeWiseGetServiceableLocations.do?', _this.setRoutes, EXECUTE_WITH_ERROR);
		}, setRoutes: function(response) {
			hideLayer();
			if (response.routeList === undefined) {
				_this.resetDataAfterBooking();
				$('#possibleRoutesDetails').empty();
				$('#possibleRoutes').addClass('hide');
				return;
			}
		
			if(Number(response.sourceBalance) < 10000) {
				showMessage('error', 'Balance is Low , Recharge Now for more business.');
				$('.sourceBalancediv').removeClass('hide')
			}
			

			if ( $('#weightEle').val() < minimumWeightForTranCE) {
				showMessage('info', 'Charged Weight Will be 20.')
			}
			
			
			$('#possibleRoutesDetails').empty();

			let routes = response.routeList;
			routeHm = response.routeHm;
			dpincode = $('#toPincodeEle').val();
			tceReferenceId = response.tceReferenceId;
			var serialno = 1;
			
			for (let element of routes) {
				let tr = $('<tr class="routerow">')
				let input = $('<input  type="radio" name="routeDetails" class="checkedroute" data-tooltip="Route' + element.routeNumber + '" value="' + element.routeNumber + '">');

				$(input).click(function() {
					$('#saidToContainEle').select2({ dropdownAutoWidth: true, dropdownPosition: "below",width: '100%' });

					$('tr').removeClass('selected-row');
					
					_this.resetDataAfterBooking();
					$('#eWaybillDetailsDiv').removeClass('hide');
					$('#partyDetailsDiv').removeClass('hide');
					$('#consignmentDetailsDiv').removeClass('hide');
					$('#weightDetailsDiv').removeClass('hide');
					$('#saveButtonDiv').removeClass('hide');
					$('#wayBillTypeEle').focus();

					$(".disableInput").each(function() {
						$(this).prop("disabled", false);
					});

					tr.addClass('selected-row');
					routeNumber = this.value;
					routeLegsList = routeHm[routeNumber].routeLegsList;
				});

				let routeLegs = element.routeLegsList;
				let totalRates = 0;
				let totalEta = 0;

				for (let ele of routeLegs) {
					totalRates += ele.rate;

					if (ele.legEta !== undefined)
						totalEta += ele.legEta

					if (ele.crossingEta !== undefined)
						totalEta += ele.crossingEta
				}
			
				if(routeLegs.length -1 == 0)
					return;
 
				let tdforinput = $('<td class="radiotd" >')
				tdforinput.css("border-left", "none !important")
				tdforinput.append(input)
				
				tr.append('<td class="radiotd" data-toggle="tooltip" data-placement="top" title="' + 'Serial Number' + '">' + serialno + '</td>');
				tr.append(tdforinput)	
				tr.append('<td class="radiotd" data-toggle="tooltip" data-placement="top" title="' + 'Estimated Distance' + '">' + (element.totalDistance).toFixed(2) +	 ' </td>');
				tr.append('<td class="radiotd" data-toggle="tooltip" data-placement="top" title="' + 'Estimated amount' + '">' + (element.grandTotal).toFixed(2) +' </td>');
				tr.append('<td class="radiotd hide" data-toggle="tooltip" data-placement="top" title="' + 'Average Rate' + '">' + (totalRates / routeLegs.length).toFixed(2) + ' </td>'); //hiden
				tr.append('<td class="radiotd" data-toggle="tooltip" data-placement="top" title="' + 'Crossing' + '">' + (routeLegs.length - 1)	 +	'</td>');
				tr.append('<td class="radiotd testtooltip address" data-bs-html="true" data-bs-toggle="tooltip" data-bs-custom-class="custom-tooltip" data-bs-placement="top" data-bs-title="<table class=\'table\'><tr class=\'bg-primary text-white\'><td class=\'text-white fw-bold\'>Destination Branch</td><td class=\'text-white fw-bold\'>Destination Operator</td><td class=\'text-white fw-bold\' >Address</td><td class=\'text-white fw-bold\'>Destination City</td></tr><tr><td>'+routeLegs[routeLegs.length - 1].destBranchName + "</td><td>" + routeLegs[routeLegs.length - 1].destOperatorName + "</td><td>" + routeLegs[routeLegs.length - 1].destinationBranchAddress +'</td><td>' + routeLegs[routeLegs.length - 1].destBranchCity + "</td></tr></table>" +'">' + routeLegs[routeLegs.length - 1].destBranchName + " (" + routeLegs[routeLegs.length - 1].destOperatorName + ", " + routeLegs[routeLegs.length - 1].destinationBranchAddress +', ' + routeLegs[routeLegs.length - 1].destBranchCity + ")" + '</td>');
				tr.append('<td class="radiotd" data-toggle="tooltip" data-placement="top" title="' + 'ETA Hours' + '">' + totalEta +  '</td>');
				tr.append('<td class="radiotd hide" data-toggle="tooltip" data-placement="top" >' + routeLegs[routeLegs.length - 1].destBranchName + ", " + routeLegs[routeLegs.length - 1].destOperatorName + " (" + routeLegs[routeLegs.length - 1].destinationBranchAddress + ", " + routeLegs[routeLegs.length - 1].destBranchCity + ")" + '</td>');
				tr.append('<td class="radiotd d-none" data-toggle="tooltip" data-placement="top">' + routeLegs[0].sourceBranchName + " (" + routeLegs[0].sourceOperatorName + ", " + routeLegs[0].sourceBranchCity + ")" + '</td>');
				serialno++;
				$('#possibleRoutesDetails').append(tr);
			}

			$('input[name="routeDetails"]').on('change', function() {
				if ($(this).is(':checked')) {
					let route = $(this).closest('tr').find('td:eq(1)').text();
					let totalDistance = $(this).closest('tr').find('td:eq(2)').text();
					let estimatedAmount = $(this).closest('tr').find('td:eq(3)').text();
					let avgRate = $(this).closest('tr').find('td:eq(4)').text();
					let noOfLegs = $(this).closest('tr').find('td:eq(5)').text();
					let sourceBranch = $(this).closest('tr').find('td:eq(9)').text();
					let destinationBranch = $(this).closest('tr').find('td:eq(6)').text();
					let etaText = $(this).closest('tr').find('td:eq(7)').text();
					let destinationBranchAddress = $(this).closest('tr').find('td:eq(8)').text();

					etaText = etaText.split(" ")[0];
					let eta = +etaText
					let currentDateTime = new Date();
					let newDateTime = new Date(currentDateTime.getTime() + eta * 60 * 60 * 1000);
					let day = newDateTime.getDate();
					let month = newDateTime.toLocaleString('default', { month: 'short' });
					let year = newDateTime.getFullYear();
					let hours = newDateTime.getHours();
					let minutes = newDateTime.getMinutes();
					let ampm = hours >= 12 ? 'PM' : 'AM';
					hours = hours % 12;
					hours = hours ? hours : 12;
					minutes = minutes < 10 ? '0' + minutes : minutes;
					$('#etatimeonbook').text(day + ' ' + month + ',' + ' ' + year )
					$('#popupDeliveryDate').text(day + ' ' + month + ',' + ' ' + year )
					$('#Descityonbook').text(destinationBranchAddress )	
					$('#popupTotalamount').text(estimatedAmount)
					$('#popupDeliveryBranch').text(destinationBranch.split(', ')[0] + ', '+ destinationBranch.split(', ')[2])
					$('#popupDeliveryAddress').text(destinationBranchAddress.split("(")[1].split(")")[0])
					$('#popupsourceAddress').text(sourceBranch)
				}
			});

			$('#possibleRoutes').removeClass('hide');

			$(document).ready(function() {
				$('[data-toggle="tooltip"]').tooltip({
					sanitize: false
				});
				
				$('[data-bs-toggle="tooltip"]').tooltip({
					sanitize: false
				});
				
				$(window).bind('scroll', function() {
					let selectedRow = $('.selected-row');

					if ($(window).scrollTop() > 400) {
						$('.selected-head').addClass('sticky-row')
						selectedRow.addClass('sticky-row');
						$('.radiotd').attr('style','max-width: none !important')
						$('.routerow td:nth-child(2)').hide();
						$('.routeCheckboxlabel').hide();
					} else {
						$('.selected-head').removeClass('sticky-row')
						selectedRow.removeClass('sticky-row');
						$('.radiotd').attr('style','max-width: 200px !important')
						$('.routerow td:nth-child(2)').show();
						$('.routeCheckboxlabel').show();
					}
				});
			});

		}, getActualOfferRates: function() {
			let jsonObject = {};
			jsonObject.declareValue		= $('#declaredValueEle').val();
			jsonObject.weight			= $('#totalChargeWeightEle').val();
			jsonObject.routeLegsList	= JSON.stringify(routeLegsList);
			jsonObject.tceReferenceId	= tceReferenceId;
			jsonObject.taxPaidBy		= $('#taxPaidByEle').val();
			
			let itemList = [];
	
			for (let k in consignmentDataHM) {
				itemList.push(consignmentDataHM[k]);
			}
			
			jsonObject.item_list		= JSON.stringify(itemList);
			
			if(Number($('#totalChargeWeightEle').val()) < Number(minimumWeightForTranCE)){
				showMessage('error', 'Charged Weight Cannot Be Less Than '+minimumWeightForTranCE);
				return;
			}

			showLayer();

			getJSON(jsonObject, WEB_SERVICE_URL + '/bookingRateWS/getActualOfferRates.do?', _this.setOfferRates, EXECUTE_WITH_ERROR);
		}, setOfferRates: function(response) {
			hideLayer();
			
			if(response.message) {
				ratesnotfound = true; 
				$('#charges').empty();
				$('#taxes').empty();
				$('#totalDiv').empty();
				$('#chargesDiv').hide()
				return;
			}
			
			ratesnotfound = false ; 
			$('#chargesDiv').show()
			
			if(response.offerNotFound != undefined && response.offerNotFound) {
				showMessage('error', 'Offer Not Found For the Selected Route On Charged Weight !');
				return;
			}
			
			newRouteLegsList	= response.offers;
			let offersSummary	= response.offersSummary;
			totalAmount			= offersSummary.totalAmount;
			offerId				= response.offerId;
			
			if(response.offerNotFound != undefined && response.offerNotFound) {
				showMessage('error', 'Offer Not Found For The Selected Route On Charged Weight !');
				return;
			}
			
			if(totalAmount == undefined || totalAmount == 0) {
				showMessage('error', 'Total Offer Amount Cannot Be Zero !');
				return;
			}
			
			_this.setBookingCharges(offersSummary.charges, offersSummary.taxDetails);
		}, getSaidToContainOnHSNCode : function(obj) {
			let jsonObject = {};
			jsonObject.hsnCode = obj.value;
			
			$('#saidToContainEle').empty();

			getJSON(jsonObject, WEB_SERVICE_URL + '/tceBookingWS/getSaidToContainListByHSN.do?', _this.setSaidToContains, EXECUTE_WITHOUT_ERROR);
		}, setSaidToContains : function(response) {
			let saidToContainList	= response.saidToContainList;
			
			if(saidToContainList != undefined && saidToContainList.length > 0) {
				for (let packing of saidToContainList) {
					operationOnSelectTag('saidToContainEle', 'addNew', packing.saidToContainName, packing.saidToContainId)
				}
				
				$('#saidToContainEle').select2({ dropdownAutoWidth: true, dropdownPosition: "below", width: '100%' })
				$('#saidToContainEle').select2('open');
				
				$('#saidToContainEle').on('click', function() {				
					setTimeout(()=>{
						$('#packingTypeEle').focus();
					}, 500);
				})

				$('#saidToContainEle').on('change', function() {
					setTimeout(()=>{
						$('#packingTypeEle').focus()
					}, 500);
				});
			} else
				showMessage('error', 'Said To Contains not found for this HSN Code !');
		}, validateAddArticle: function() {
			if (!validateInputTextFeild(1, 'quantityEle', 'quantityEle', 'error', quantityErrMsg))
				return false;
				
		   	if (!validateInputTextFeild(1, 'hsnCodeEle', 'hsnCodeEle', 'error', hsnCodeErrMsg))
				return false;

			if (!validateInputTextFeild(1, 'packingTypeEle', 'packingTypeEle', 'error', articleTypeErrMsg))
				return false;

			if (!validateInputTextFeild(1, 'saidToContainEle', 'saidToContainEle', 'error', saidToContaionErrMsg))
				return false;
				
			if (!validateInputTextFeild(1, 'lbhUnitEle', 'lbhUnitEle', 'error', unitErrMsg))
				return false;

			if (!validateInputTextFeild(1, 'lengthEle', 'lengthEle', 'error', lengthErrMsg))
				return false;
			 
			var regex = /^\d{1,6}(\.\d{2})?$/;
		
			if (!regex.test($('#lengthEle').val())) {
				$('#lengthEle').focus()
				showMessage('error','Please, Enter proper length')
				return false;
			}

			if (!validateInputTextFeild(1, 'breathEle', 'breathEle', 'error', breadthErrMsg))
				return false;

			if (!regex.test($('#breathEle').val())) {
				$('#breathEle').focus()
				showMessage('error','Please, Enter proper breadth')	
				return false;
			}

			if (!validateInputTextFeild(1, 'heightEle', 'heightEle', 'error', heightErrMsg))
				return false;
				
			if (!regex.test($('#heightEle').val())) {
				$('#heightEle').focus()
				showMessage('error','Please, Enter proper height')
				return false;
			}

			return validateInputTextFeild(1, 'actualWeightEle', 'actualWeightEle', 'error', actWeightErrMsg);
		}, validateLBH: function() {
			let lengthEle	= 'length';
			let breadthEle	= 'breadth';
			let heightEle	= 'height';

			if (!validateInput(1, lengthEle, lengthEle, 'packageError', lengthErrMsg)) {
				setTimeout(function() {
					$('#' + lengthEle).focus();
					showMessage('error', lengthErrMsg);
				}, 200);
				return false;
			}

			if (!validateInput(1, breadthEle, breadthEle, 'packageError', breadthErrMsg)) {
				setTimeout(function() {
					$('#' + breadthEle).focus();
					showMessage('error', breadthErrMsg);
				}, 200);
				return false;
			}

			if (!validateInput(1, heightEle, heightEle, 'packageError', heightErrMsg)) {
				setTimeout(function() {
					$('#' + heightEle).focus();
					showMessage('error', heightErrMsg);
				}, 200);
				return false;
			}

			return true;
		}, checkAndAddConsignment: function() {
			/*if(isValidEWayBill == false){
				showMessage('error','Please Enter Valid EwayBill Number !')
				return;
			}*/
			
			if ($('#myTable thead tr').length == 0)
				_this.addConsignmentTableStructure();

			_this.addConsignment();
		}, addConsignmentTableStructure: function() {
			let tr = $('<tr>');

			tr.append('<th class="routeth" >Qty</th>');
			tr.append('<th class="routeth" >Packing Type</th>');
			tr.append('<th class="routeth" >Said To Contain</th>');
			tr.append('<th class="routeth" >HSN Code</th>');
			tr.append('<th class="routeth" >CFT Unit</th>');
			tr.append('<th class="routeth" data-bs-toggle="tooltip" title="Length">L</th>');
			tr.append('<th class="routeth" data-bs-toggle="tooltip" title="Breath" >B</th>');
			tr.append('<th class="routeth" data-bs-toggle="tooltip" title="Height" >H</th>');
			tr.append('<th class="routeth" data-bs-toggle="tooltip" title="Actual Weight (In kg)">Act Wt (In kg)</th>');
			tr.append('<th class="routeth" data-bs-toggle="tooltip" title="Charged Weight (In kg)" >Chrg Wt (In kg)</th>');
			tr.append('<th class="routeth" >' + "<a class='button-normal' style='color:white'><i class='fa fa-arrow-up'></i></a>" + '</th>')

			$('#myTable thead').append(tr);
		}, addConsignment: function() {
			let consignmentObject = {};
			
			let quantity			= $('#quantityEle').val();
			let packingTypeId		= $('#packingTypeEle').val();
			let packingType			= $("#packingTypeEle option:selected").text();
			let consignmentGoodsId	= $('#saidToContainEle').val();
			let saidToContain		= $("#saidToContainEle option:selected").text();
			let actualWeight		= $('#actualWeightEle').val();
			let chargeWeight		= $('#chargeWeightEle').val();
			
			if (Number(actualWeight) > Number(chargeWeight)) {
				showMessage('info', 'Charge weight has been replaced with actual weight !')
				chargeWeight		= Math.ceil(Number(actualWeight));
				$('#chargeWeightEle').val(chargeWeight);
			}
			
			actualWeight			= Math.ceil(Number(actualWeight));
			
			let length				= $('#lengthEle').val();
			let height				= $('#heightEle').val();
			let breadth				= $('#breathEle').val();
			let hsnCode				= $('#hsnCodeEle').val();
			
			consignmentObject.quantity				= quantity;
			consignmentObject.packingTypeId			= packingTypeId;
			consignmentObject.packingType			= packingType;
			consignmentObject.saidToContain			= saidToContain;
			consignmentObject.consignmentGoodsId	= consignmentGoodsId;
			consignmentObject.actualWeight			= actualWeight;
			consignmentObject.chargeWeight			= chargeWeight;
			consignmentObject.length				= length;
			consignmentObject.height				= height;
			consignmentObject.breadth				= breadth;
			consignmentObject.amount				= 0;
			consignmentObject.hsnCode				= hsnCode;
			consignmentObject.cftUnitId				= cftUnitId;
			consignmentObject.weightUnit			= 'kg';
			
			idNum++;
			consignmentDataHM[idNum] = consignmentObject;
				
			let tr = $('<tr class="text-center" id = "articleTableRow_' + idNum + '">');

			tr.append('<td>' + quantity + '</td>');
			tr.append('<td>' + packingType + '</td>');
			tr.append('<td class="elipsis" data-bs-toggle="tooltip" title="'+saidToContain+'" >' + saidToContain + '</td>');
			tr.append('<td>' + hsnCode + '</td>');
			tr.append('<td>' + cftUnitName + '</td>');
			tr.append('<td>' + length + '</td>');
			tr.append('<td>' + breadth +  '</td>');
			tr.append('<td>' + height + '</td>');
			
			tr.append('<td>' + actualWeight	 + '</td>');
			tr.append('<td>' + chargeWeight	 + '</td>');
			tr.append('<td>' + "<a id='delete_" + idNum + "'class='delete btn btn-danger' style='text-decoration: none;cursor:pointer'>Delete</a>" + '</td>');

			$('#consignmentTables').removeClass('hide');
			$('#myTable tbody').append(tr);

			$('.delete').click(function() {
				_this.deleteConsignmentTableRow(this.id);
			});

			$('[data-bs-toggle="tooltip"]').tooltip({
				sanitize	: false,
				placement	: 'top'
			});

			_this.setTotalActualWeight(consignmentDataHM);
			_this.resetArticleDetails();
		}, setTotalActualWeight: function(consignmentDataHM) {
			let totalActualWeight = 0;
			let totalChargeWeight = 0;

			for (let k in consignmentDataHM) {
				totalActualWeight += Number(consignmentDataHM[k].actualWeight);
				totalChargeWeight += Number(consignmentDataHM[k].chargeWeight);
			}
			
			if(totalChargeWeight < minimumWeightForTranCE && totalChargeWeight > 0)
				$('#totalChargeWeightEle').val(minimumWeightForTranCE);	
			else
				$('#totalChargeWeightEle').val(totalChargeWeight);
			
			$('#totalActualWeightEle').val(totalActualWeight);
		}, resetArticleDetails: function() {
			$('#quantityEle').val('');
			$('#hsnCodeEle').val('');
			$('#packingTypeEle').val('');
			$('#packingTypeEle').trigger('change');
			$('#subCommodityEle').val('');
			$('#subCommodityEle').trigger('change');
			$('#typeofPackingId').val(0);
			$('#consignmentGoodsId').val(0);
			$('#actualWeightEle').val('');
			$('#chargeWeightEle').val('');
			$('#lengthEle').val('');
			$('#heightEle').val('');
			$('#breathEle').val('');
			$('#saidToContainEle').empty();
		}, deleteConsignmentTableRow: function(deleteButtonId) {
			let num = deleteButtonId;
			let indexVal = Number(num.split('_')[1]);
			$('#articleTableRow_' + indexVal).remove();
			delete consignmentDataHM[indexVal];
			
			_this.setTotalActualWeight(consignmentDataHM);
			_this.getActualOfferRates();
			
			if ($('#myTable tbody tr').length == 0) {
				$('#chargesDiv input').val('0');
				$('#chargesDiv').hide();
				$('#quantityEle').focus();
				$('#weigthFreightRate').val(0)
				next = 'hsnCodeEle';
			} else
				$('#chargesDiv').show()
		}, calculateLBH: function() {
			let unit			= cftUnitId
			let length			= $('#lengthEle').val();
			let height			= $('#heightEle').val();
			let breadth			= $('#breathEle').val();
			let noOfArt			= $('#quantityEle').val();
			let chrgWeight		= 0;
			let cftValue		= 1;
			let volume			= Number(length) * Number(breadth) * Number(height);

			if (unit == CFT_UNIT_CM_ID)
				chrgWeight = (volume  * noOfArt) / 6000;
			else if (unit == CFT_UNIT_INCH_ID)
				chrgWeight = (volume  * noOfArt) / 366;
			else
				chrgWeight = volume;

			if ($('#actualWeightEle').val() === "" || Math.ceil(chrgWeight) > Number($('#actualWeightEle').val()))
				$('#chargeWeightEle').val(Math.ceil(chrgWeight));
			
			if (Number($('#actualWeightEle').val()) > Number(chrgWeight)) {
				showMessage('info', 'Charge weight has been replaced with actual weight !')
				chrgWeight		= Math.ceil(Number($('#actualWeightEle').val()));
				$('#chargeWeightEle').val(chrgWeight);
			}
		}, bookLR: function() {
			showLayer();
	
			if (newRouteLegsList == undefined || newRouteLegsList == null || newRouteLegsList.length == 0) {
				showMessage('error', 'Cannot Book LR As Offer Not Found For The Selected Route On Charged Weight !');
				hideLayer();
				return;
			}
			
			let jsonObject = _this.getDataToBookLR();
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/tceBookingWS/bookLR.do?', _this.setResponse, EXECUTE_WITHOUT_ERROR);
			//hideLayer();
		}, getDataByEwaybill: function() {
			console.log('inside getDataByEwaybill..............')
			if ($('#ewaybillEle').val() == '')
				return;

			jsonObject.ewaybillNumber = $('#ewaybillEle').val().trim();

			showLayer();
			
			_this.resetBothPartyData();

			getJSON(jsonObject, WEB_SERVICE_URL + '/tceBookingWS/fetchDataByEWayBillNumber.do?', _this.setPartyDetailsOnEwayBill, EXECUTE_WITH_ERROR);
		}, validateGSTNumberByApi: function(partyType) {
			if (isValidEWayBill)
				return;
				
			if (partyType == CUSTOMER_TYPE_CONSIGNOR_ID) {
				if(!validateInputTextFeild(9, 'consignorGstnEle', 'consignorGstnEle', 'info', gstnErrMsg))
					return;
				
				jsonObject.gstNumber = $('#consignorGstnEle').val();
			} else {
				if(!validateInputTextFeild(9, 'consignorGstnEle', 'consignorGstnEle', 'info', gstnErrMsg))
					return;
				
				jsonObject.gstNumber = $('#consigneeGstnEle').val();
			}
				
			if(jsonObject.gstNumber.trim().toUpperCase() == 'URP')	{
				console.log('gstnumber : ', jsonObject.gstNumber);
				return;
			}	

			jsonObject.partyTypeId = partyType;
			showLayer();

			getJSON(jsonObject, WEB_SERVICE_URL + '/tceBookingWS/fetchDataByGSTNumber.do?', _this.setPartyDetailsOnGST, EXECUTE_WITHOUT_ERROR);
		}, setPartyDetailsOnEwayBill: function(response) {
			hideLayer();
			isValidEWayBill = response.isValidEWayBill;

			if (!isValidEWayBill) {
				$('#ewaybillEle').css('outline','1px solid red')
				showMessage('error', 'Please, Enter valid E-WayBill No.');
				
				$('#ewaybillEle').focus();

				$(".disableInput").each(function() {
					$(this).prop("disabled", false);
					$(this).val('');
				});

				return;
			} else {
				$('#ewaybillEle').css('outline','none')
				$(".disableInput").each(function() {
					$(this).prop("disabled", true);
				});

				$('.basic').addClass('hide')
				$('#consignorEmailEle').focus()
				$('#arrow-icon1').addClass('arrowrotate')
				$('#basic').removeClass('scheduler-border')
			}
			
			invoiceDates		 = response.invoiceDates;
			let consignorDetails = response.consignorDetails;
			let consigneeDetails = response.consigneeDetails;
			
			consignorPincode	 = consignorDetails.pincode;
			consigneePincode	 = consigneeDetails.pincode;
			if(consignorDetails.corporateAccountId != undefined)
				consignorId			 = consignorDetails.corporateAccountId;
			if(consigneeDetails.corporateAccountId != undefined)
				consigneeId			 = consigneeDetails.corporateAccountId;

		$('#declaredValueEle').val(response.totalDeclaredValue);
			$('#invoiceNumberEle').val(response.invoiceNumbers);
			$('#consignorNameEle').val(consignorDetails.name).attr('title', consignorDetails.name)
			$('#consignorGstnEle').val(consignorDetails.gstNumber);

			if(consignorDetails.mobileNumber != undefined)
				$('#consignorNumberEle').val(consignorDetails.mobileNumber);

			if(consignorDetails.mobileNumber != undefined)
				$('#consignorEmailEle').val(consignorDetails.emailAddress);
				
			$('#consignorPincode').val(consignorDetails.pincode);
			
			if(consignorDetails.address != null && consignorDetails.address.trim() != '')
				$('#consignorAddressEle').val(consignorDetails.address).attr('title', consignorDetails.address);
			else
				$('#consignorAddressEle').prop('disabled', false);
				
			$('#consigneeNameEle').val(consigneeDetails.name).attr('title', consigneeDetails.name)
			$('#consigneeGstnEle').val(consigneeDetails.gstNumber);
			
			if(consigneeDetails.mobileNumber != undefined)
				$('#consigneeNumberEle').val(consigneeDetails.mobileNumber);
			
			if(consigneeDetails.emailAddress != undefined)
				$('#consigneeEmailEle').val(consigneeDetails.emailAddress);
			
			if(consigneeDetails.address != null && consigneeDetails.address.trim() != '')
				$('#consigneeAddressEle').val(consigneeDetails.address).attr('title', consigneeDetails.address)
			else
				$('#consigneeAddressEle').prop('disabled', false)
				
			$('#consigneePincode').val(consigneeDetails.pincode);
				
			_this.selectTaxPaidBy($('#wayBillTypeEle').val(), consigneeDetails.gstNumber, consignorDetails.gstNumber);
			_this.populateHsnCodes(response);
		}, selectTaxPaidBy: function(wayBillTypeId, consineeGst, consinorGst) {
			if (Number(wayBillTypeId) == WAYBILL_TYPE_PAID) {
				if(consinorGst != undefined && consinorGst != null && consinorGst.trim() != 'URP' && consinorGst.trim() != '')
					$('#taxPaidByEle').val(TAX_PAID_BY_CONSINGOR_ID);
				else
					$('#taxPaidByEle').val(TAX_PAID_BY_TRANSPORTER_ID);
			} else if(consineeGst != undefined && consineeGst != null && consineeGst != 'URP' && consineeGst.trim() != '')
				$('#taxPaidByEle').val(TAX_PAID_BY_CONSINGEE_ID);
			else
				$('#taxPaidByEle').val(TAX_PAID_BY_TRANSPORTER_ID);
		}, setPartyDetailsOnGST: function(response) {
			hideLayer();
			
			let partyTypeId = response.partyTypeId;
		
			if (!response.isValidGSTNumber) {
				showMessage('error', 'Please, Enter valid GST Number !');
				_this.resetPartyDetails(partyTypeId);
			} else {
				var gstDetails = response.gstDetails;
				
				if(partyTypeId == CUSTOMER_TYPE_CONSIGNOR_ID) {
					$('#consignorNameEle').val(gstDetails.legalBusinessName).attr('title', gstDetails.legalBusinessName);
					
					if(gstDetails.mobileNumber != undefined)
						$('#consignorNumberEle').val(gstDetails.mobileNumber);
				
					if(gstDetails.mobileNumber != undefined)
						$('#consignorEmailEle').val(gstDetails.emailAddress);
				
					$('#consignorPincode').val(gstDetails.pinCode);
				
					if(gstDetails.fullAddress != null && gstDetails.fullAddress.trim() != '')
						$('#consignorAddressEle').val(gstDetails.fullAddress).attr('title', gstDetails.fullAddress);
					else
						$('#consignorAddressEle').prop('disabled', false);
					
					$('#consignorAddressEle').prop("disabled", true);
					$('#consignorNameEle').prop("disabled", true);
					$('#consignorPincode').prop("disabled", true);
					$('#consignorAddressEle').prop("disabled", true);
				} else {
					$('#consigneeNameEle').val(gstDetails.legalBusinessName).attr('title', gstDetails.legalBusinessName);
				
					if(gstDetails.mobileNumber != undefined)
						$('#consigneeNumberEle').val(gstDetails.mobileNumber);
				
					if(gstDetails.mobileNumber != undefined)
						$('#consigneeEmailEle').val(gstDetails.emailAddress);
				
					$('#consigneePincode').val(gstDetails.pinCode);
					
					if(gstDetails.fullAddress != null && gstDetails.fullAddress.trim() != '')
						$('#consigneeAddressEle').val(gstDetails.fullAddress).attr('title', gstDetails.fullAddress);
					else
						$('#consigneeAddressEle').prop('disabled', false);
						
					$('#consigneeAddressEle').prop("disabled", true);
					$('#consigneeNameEle').prop("disabled", true);
					$('#consigneePincode').prop("disabled", true);
					$('#consigneeAddressEle').prop("disabled", true);
				}
			}
		}, resetPartyDetails: function(partyTypeId) {
			if (partyTypeId == CUSTOMER_TYPE_CONSIGNOR_ID) {
				$('#consignorGstnEle').val('');
				$('#consignorNameEle').val('');
				$('#consignorPincode').val('');
				$('#consignorAddressEle').val('');
				$('#consignorEmailEle').val('');
				$('#consigneeNumberEle').val('');
			} else {
				$('#consigneeGstnEle').val('');
				$('#consigneeNameEle').val('');
				$('#consigneePincode').val('');
				$('#consigneeAddressEle').val('');
				$('#consigneeEmailEle').val('');
				$('#consignorNumberEle').val('');
			}
		}, resetBothPartyData() {
			_this.resetPartyDetails(CUSTOMER_TYPE_CONSIGNOR_ID);
			_this.resetPartyDetails(CUSTOMER_TYPE_CONSIGNEE_ID);
			
		/*	$('#consignorNameEle').val('');
			$('#consignorNumberEle').val('');
			$('#consignorAddressEle').val('');
			$('#consignorGstnEle').val('');
			$('#consignorEmailEle').val('');
			
			$('#consigneeNameEle').val('');
			$('#consigneeNumberEle').val('');
			$('#consigneeAddressEle').val('');
			$('#consigneeGstnEle').val('');
			$('#consigneeEmailEle').val('');*/
			
		}, validateEwaybillDetails: function() {
			return !(!validateInputTextFeild(1, 'ewaybillEle', 'ewaybillEle', 'error', 'Please, Enter Ewaybill Number !')
				|| !validateInputTextFeild(1, 'invoiceNumberEle', 'invoiceNumberEle', 'error', 'Please, Enter Invoice Number !'));
		}, validatePartyDetails: function() {
			let consignorMobileNumber	= $('#consignorNumberEle').val();
			let consigeeMobileNumber	= $('#consigneeNumberEle').val();
			
			if (!validateInputTextFeild(1, 'consignorGstnEle', 'consignorGstnEle', 'error', 'Enter Consignor GST')
				|| !validateInputTextFeild(1, 'consignorNameEle', 'consignorNameEle', 'error', validPartyNameErrorMsg('Consignor'))
				|| !validateInputTextFeild(1, 'consignorNumberEle', 'consignorNumberEle', 'error', consinorMobileNumberLenErrMsg)
				|| !validateInputTextFeild(5, 'consignorNumberEle', 'consignorNumberEle', 'error', consinorMobileNumberLenErrMsg)
				|| !validateInputTextFeild(1, 'consignorAddressEle', 'consignorAddressEle', 'error', 'Enter Consignor Address')
				|| !validateInputTextFeild(1, 'consigneeGstnEle', 'consigneeGstnEle', 'error', 'Enter Consignee GST')
				|| !validateInputTextFeild(1, 'consigneeNameEle', 'consigneeNameEle', 'error', validPartyNameErrorMsg('Consignee'))
				|| !validateInputTextFeild(1, 'consigneeNumberEle', 'consigneeNumberEle', 'error', consineeMobileNumberLenErrMsg)
				|| !validateInputTextFeild(5, 'consigneeNumberEle', 'consigneeNumberEle', 'error', consineeMobileNumberLenErrMsg)
				|| !validateInputTextFeild(1, 'consigneeAddressEle', 'consigneeAddressEle', 'error', 'Enter Consignee Address')
				|| !_this.validateMobileNumber(consignorMobileNumber, $('#consignorNumberEle')[0])
				|| !_this.validateMobileNumber(consigeeMobileNumber, $('#consigneeNumberEle')[0])) {
				$('.partyDetail').removeClass('hide');
				$('#partyDetailsDiv').addClass('scheduler-border');
				return false;
			}

			return true;
		}, validateMobileNumber: function(number, inputField) {
			var regex = /^(.)\1+$/;

			if (regex.test(number)) {
				inputField.focus();
				showMessage('error', 'Enter Valid Mobile Number !');
				return false;
			}
			
			return true;
		}, validateConsignorOrConsigneeMobile: function() {
			if (configuration.validateConsignorOrConsigneeMobile == 'false') return true;

			var consignorValidate = checkValidMobileNumber('consignorNumberEle');
			var consigneeValidate = checkValidMobileNumber('consigneePhn');

			if (($('#consignorNumberEle').val() == "" && $('#consigneeNumberEle').val() == "") || (!consignorValidate && !consigneeValidate)) {
				showMessage('error', validConsinorAndConsigneeMobileErrMsg);
				return false;
			} else if ($('#consignorNumberEle').val() == "" && !consigneeValidate) {
				showMessage('error', validConsineeMobileErrMsg);
				return false;
			} else if ($('#consigneeNumberEle').val() == "" && !consignorValidate) {
				showMessage('error', validConsinorMobileErrMsg);
				return false;
			}

			return true;
		}, validatePaymentDetails: function() {
			let paymentType			= $('#paymentType').val();
			let wayBillTypeValue	= $('#wayBillTypeEle').val();

			if (wayBillTypeValue == WAYBILL_TYPE_PAID && paymentType == 0) {
				showMessage('error', iconForErrMsg + ' Please, Select Payment Type!');
				return false;
			}

			if (bankPaymentOperationRequired && isValidPaymentMode(paymentType)) { //Defined in paymentTypeSelection.js
				let trCount = $("#storedPaymentDetails	tr").length;

				if (trCount == 0) {
					showMessage('error', iconForErrMsg + ' Please, Add Payment details!');
					return false;
				}
			}

			return true;
		}, getDataToBookLR: function() {
			let itemList	= [];
			let chargeList	= [];
			let taxList		= [];

			for (let k in consignmentDataHM) {
				itemList.push(consignmentDataHM[k]);
			}

			$('#charges').find("input").each(function() {
				const fieldId = $(this).attr("id");

				if (fieldId.replace(/\D/g, '') > 0) {
					let chargeobj = new Object();

					chargeobj.chargeName	= $(this).attr("placeholder");
					chargeobj.chargeTypeId	= fieldId.replace(/\D/g, '');
					chargeobj.amount		= $(this).val();
					chargeList.push(chargeobj);
				}
			});
			
			$('#taxes').find("input").each(function() {
				const fieldId = $(this).attr("id");

				if (fieldId.replace(/\D/g, '') > 0) {
					let chargeobj = new Object();

					chargeobj.taxName		= $(this).attr("placeholder");
					chargeobj.taxTypeId		= fieldId.replace(/\D/g, '');
					chargeobj.taxAmount		= $(this).val();
					
					taxList.push(chargeobj);
				}
			});

			let finalObj = new Object();

			finalObj.item_list				= JSON.stringify(itemList);
			finalObj.communityChargeDetails = JSON.stringify(chargeList);
			finalObj.taxList				= JSON.stringify(taxList);
			finalObj.routeLegsList			= JSON.stringify(newRouteLegsList);

			if(invoiceDates != undefined && invoiceDates != null && invoiceDates.trim() != '')
				finalObj.invoiceDates		= invoiceDates;
			else
				finalObj.invoiceDates		= '07/11/2024';

			finalObj.consignorPincode		= $('#consignorPincode').val();
			finalObj.consigneePincode		= $('#consigneePincode').val();
			finalObj.consignorId			= consignorId;
			finalObj.consigneeId			= consigneeId;
			
			finalObj.totalOrderAmount		= totalAmount;

			finalObj.consignorName			= $('#consignorNameEle').val();
			finalObj.consignorNumber		= $('#consignorNumberEle').val();
			finalObj.consignorAddress		= $('#consignorAddressEle').val();
			finalObj.consignorGstn			= $('#consignorGstnEle').val();
			finalObj.consigneeName			= $('#consigneeNameEle').val();
			finalObj.consigneeNumber		= $('#consigneeNumberEle').val();
			finalObj.consigneeAddress		= $('#consigneeAddressEle').val();
			finalObj.consigneeGstn			= $('#consigneeGstnEle').val();
			finalObj.taxPaidById			= $('#taxPaidByEle').val();
			finalObj.wayBillTypeId			= $('#wayBillTypeEle').val();
			finalObj.deliveryTypeId			= $('#deliveryTypeId').val();
			finalObj.totalOrderAmount		= $('#totalOrderAmount').val();
			finalObj.ewaybillNumber			= $('#ewaybillEle').val();
			//finalObj.ewaybillNumber		= '671556555388';
			finalObj.totalChargeWeight		= $('#totalChargeWeightEle').val();
			finalObj.totalActualWeight		= $('#totalActualWeightEle').val();
			finalObj.weigthFreightRate		= $('#weigthFreightRate').val();
			finalObj.invoiceNumber			= $('#invoiceNumberEle').val();
			finalObj.declareValue			= $('#declaredValueEle').val();
			finalObj.cftUnitId				= cftUnitId;
			finalObj["paymentMode"]			= $('#paymentType').val();
			finalObj["paymentValues"]		= $('#paymentCheckBox').val();
			finalObj["imageStr"]			= imageStr;
			finalObj.chargeTypeId			= CHARGETYPE_ID_WEIGHT;
			finalObj.bookedForPincode		= dpincode;
			finalObj.tceReferenceId			= tceReferenceId;
			finalObj.remark					= $('#remarkEle').val();
			finalObj.offerId				= offerId;
			finalObj.subCommodityId = $('#subCommodityEle').val();
			finalObj.consignorEmail = $('#consignorEmailEle').val();
			finalObj.consigneeEmail = $('#consigneeEmailEle').val();
			


			return finalObj;
		}, setResponse: function(response) {
				  /*   let lrtype = $('#wayBillTypeEle').val() 
					 let errorMessage = response.message;
					 console.log(response,';;;;')

			if (response.message.typeName ===  "error" && response.message.description === 'Insufficient balance !') {
				if (lrtype == WAYBILL_TYPE_PAID) {
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' , 'Insufficient Balance for Paid LR Booking')
					return;
				} else if (lrtype == WAYBILL_TYPE_TO_PAY) {
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' , 'Insuficient Balance !')
					return;
				}
				return;
			}	*/
				
					
			if (response.message != undefined) {
				hideLayer();
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				
				if (errorMessage.type != MESSAGE_TYPE_SUCCESS)
					return;
			}
		
			$('#exampleModal').modal('hide');
			waybillId = response.waybillId;
			// Update href attribute with dynamic masterid
			$('#bookedLRDetails').removeClass('hide');
			$('.sourceBalancediv').addClass('hide')
			$('#lrNumberonbook').html('<a href="#">' + response.wayBillNumber + '</a>');
			$('#remarkEle').val('');
			$('#consignorEmailEle').val('');
			$('#consigneeEmailEle').val('');
			_this.resetRouteDetails();
			_this.resetDataAfterBooking();
			_this.resetBothPartyData();
			_this.lrPrint();
		}, resetDataAfterBooking: function() {
			$('#taxPaidByEle').val(TAX_PAID_BY_CONSINGOR_ID);
			$('#ewaybillEle').val('');
			$('#totalChargeWeightEle').val('');
			$('#totalActualWeightEle').val('');
			$('#weigthFreightRate').val('');
			$('#invoiceNumberEle').val('');
			$('#declaredValueEle').val('');
			$('#hsnCodeEle').val('');
			$('#chargesDiv').hide()
			$('#storedPaymentDetails').empty();
			$('#viewAddedPaymentDetailsCreate').addClass('hide');
			$('#paymentType').val(PAYMENT_TYPE_CASH_ID);
			let canvas			= document.querySelector("#canvas");
			canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
			$('#capturedImages').html('');
			imageStr = "";

			$('#photoCount').text('0/5 Photos Captured')
			$('.photoCount').hide()
			$('.basic').removeClass('hide')
			$('#basic').addClass('scheduler-border')
			$('.Ewaybill').removeClass('hide')
			$('#eWaybillDetailsDiv').addClass('scheduler-border')
			$('.partyDetail').removeClass('hide')
			$('#partyDetailsDiv').addClass('scheduler-border')
			$('#eWaybillDetailsDiv').addClass('hide');
			$('#partyDetailsDiv').addClass('hide');
			$('#consignmentDetailsDiv').addClass('hide');
			$('#weightDetailsDiv').addClass('hide');
			$('#chargesDiv').addClass('hide');
			$('#saveButtonDiv').addClass('hide');
			$('#charges').empty();
			$('#taxes').empty();
			$('#totalDiv').empty();
			consignmentDataHM = {};
			$('#myTable tbody').empty();
			$('#consignmentTables').addClass('hide');
			$("#lbhUnitEle").prop("checked", true);
			_this.resetArticleDetails();
		}, resetRouteDetails: function() {
			$('#toPincodeEle').val('');
			$('#weightEle').val('0');
			$('#possibleRoutesDetails').empty();
			$('#possibleRoutes').addClass('hide');
		}, lrSearch: function() {
			if (waybillId != undefined && waybillId > 0)
				window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + waybillId + '&NumberType=1&BranchId=0');
		}, lrPrint: function() {
			if (waybillId != undefined && waybillId > 0)
				window.open('printWayBill.do?pageId=340&eventId=10&modulename=tceLrPrint&masterid=' + waybillId, 'newwindow', 'config=height=300,width=425, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}, hideandShow: function() {
			$('.wayBillTypepaypaid').click(function() {
				$('#ewaybillEle').focus()
			})

			$('.clickable-legend').on('click', function() {
				$('.basic').toggleClass('hide')
				$('#arrow-icon1').toggleClass('arrowrotate')
				$('#basic').toggleClass('scheduler-border')
			});

			$('.clickable-legend-2').on('click', function() {
				$('.Ewaybill').toggleClass('hide')
				$('#arrow-icon2').toggleClass('arrowrotate')
				$('#eWaybillDetailsDiv').toggleClass('scheduler-border')
			})

			$('.clickable-legend-3').on('click', function() {
				$('.partyDetail').toggleClass('hide')
				$('#arrow-icon3').toggleClass('arrowrotate')
				$('#partyDetailsDiv').toggleClass('scheduler-border')
			})

			$('#quantityEle').on('keyup', function(event) {
				if (event.keyCode === 13) {
					$('.Ewaybill').addClass('hide')
					$('#arrow-icon2').addClass('arrowrotate')
					$('#eWaybillDetailsDiv').removeClass('scheduler-border')
					$('.partyDetail').addClass('hide')
					$('#arrow-icon3').addClass('arrowrotate')
					$('#partyDetailsDiv').removeClass('scheduler-border')

					setTimeout(() => {
						if (idNum == 0) {
							$('#eWaybillDetailsDiv')[0].scrollIntoView();
						} else if(idNum >0) {
							var qtyvalue = $('#quantityEle').val()
							if (qtyvalue == '') {
								$('#paymentType').focus()
							}
						}
					}, 100)	
				}
			});
		}, setPaymentTypeOption: function(paymentTypeArr) {
			let elementId = 'paymentType'; // Assuming 'paymentType' is the correct ID

			$('#' + elementId).find('option').remove();
			$('#' + elementId).append('<option value="0">-- Select --</option>');

			if (!jQuery.isEmptyObject(paymentTypeArr)) {
				for (const element of paymentTypeArr) {
					$('#' + elementId).append('<option value="' + element.paymentTypeId + '">' + element.paymentTypeName + '</option>');
				}
			}

			$('#paymentType').val(PAYMENT_TYPE_CASH_ID);

			$('#paymentType').on('change', function() {
				hideShowBankPaymentTypeOptions(document.getElementById("paymentType"));
			});
		}, oninputfunction: function() {
			$('#consigneeAddressEle, #consignorAddressEle,#consigneeNameEle, #consignorNameEle').on('input', function() {
				let inputValue = $(this).val();
				$(this).attr('title', inputValue);
			});
		}, onChargeWeightChange: function() {
			let actualWeight = $('#actualWeightEle');
			let chargeWeight = $('#chargeWeightEle');
			
			actualWeight.on('input', function() {
				_this.calculateLBH();
				
				let actualWeightValue = Number(actualWeight.val());
				let chargeWeightValue = Number(chargeWeight.val());
				
				if (actualWeightValue > chargeWeightValue) {
					chargeWeight.val(Math.ceil(actualWeightValue));
					showMessage('info', 'Charge weight has been replaced with actual weight!');
				}
			});
		}, ewayBillValidation: function() {
			let ewayBillValid = false;

			$("#ewaybillEle").on("focus", function() {
				$("#ewaybillEle").on("keyup", function(event) {
					let input = event.target;
					let ewaybillno = input.value.trim();

					ewayBillValid = ewaybillno.length >= 12;
				});

				$("input:not(#ewaybillEle)").on("focus", function() {
					if (!ewayBillValid) {
						showMessage('error', "Please, Enter valid E-WayBill No.");
						setTimeout(() => {
							$('#ewaybillEle').focus();
						}, 100);
					}
				});
			})

		}, pincodeValidation: function() {
			let isFirstInputValid = false;

			$("#toPincodeEle").on("keyup", function(event) {
				let input = event.target;
				let pincode = input.value.trim();

				isFirstInputValid = pincode.length >= 6;
			});

			$("input:not(#toPincodeEle)").on("focus", function() {
				if (!isFirstInputValid) {
					showMessage('error', "Please Enter 6 Digit Pin Code.");
					setTimeout(() => {
						$('#toPincodeEle').focus()
					}, 0)
				}
			});
		}, lrTypeColor: function() {
			let wayBillTypeValue = $('#wayBillTypeEle').val();
			let lrtype = $('#leftPanel');
			
			$('#viewAddedPaymentDetailsCreate').addClass('hide');
			$('#storedPaymentDetails').empty();

			if (Number(wayBillTypeValue) == WAYBILL_TYPE_PAID) {
				$('#Lrtypeonbook').html('<span style="background-color: #0073BA;color: white;font-weight: bold;border-radius: 10%;font-size: 15px;padding: 4px;"> PAID</span>')
				$('#popuplrtype').html('<span style="background-color: #0073BA;color: white;font-weight: bold;border-radius: 10%;font-size: 15px;padding: 4px;"> PAID</span>');
				$('#wayBillTypeEle').attr('style', 'background-color:#0073BA; color:white; font-weight:bold');
				$('#addConsignmentEle').attr('style', 'background-color:#0073BA; color:white; font-weight:bold')
				$('#start-camera').attr('style', 'background-color:#0073BA; color:white; font-weight:bold; border:none;')
				$('.routeth').attr('style', 'background-color:#0073BA; color:white; font-size:18px; text-align: center;	padding: 5px; white-space: nowrap;')
				lrtype.attr('style', 'border-left: 5px solid #0073BA ; ');
				$('#paymentdiv').removeClass('hide');
				$('.booklrpopup').attr('style', 'background-color: #0073BA;color: white;');
				$('#paymentType').val(PAYMENT_TYPE_CASH_ID);
				$('#GenerateEwayBillbtn').attr('style', 'background-color:#0073BA; color:white; ');
				
				//$('#consignorEmailAsterisk').show(); 
				//$('#consigneeEmailAsterisk').hide(); 

				_this.selectTaxPaidBy($('#wayBillTypeEle').val(), $('#consigneeGstnEle').val(), $('#consignorGstnEle').val());
			} else if (Number(wayBillTypeValue) == WAYBILL_TYPE_TO_PAY) {
				$('#Lrtypeonbook').html('<span style="background-color: #E77072;color: white;font-weight: bold;border-radius: 10%;font-size: 15px;padding: 4px;"> TO PAY</span>')
				$('#popuplrtype').html('<span style="background-color: #E77072;color: white;font-weight: bold;border-radius: 10%;font-size: 15px;padding: 4px;"> TO PAY</span>');
				$('#wayBillTypeEle').attr('style', 'background-color:#E77072; color:white; font-weight:bold');
				$('#addConsignmentEle').attr('style', 'background-color:#E77072; color:white; font-weight:bold; border:none;')
				$('#start-camera').attr('style', 'background-color:#E77072; color:white; font-weight:bold; border:none;')
				$('.routeth').attr('style', 'background-color:#E77072; color:white; font-size:18px; text-align: center;	padding: 5px; white-space: nowrap;')
				$('#paymentdiv').addClass('hide');
				$('#paymentType').val(0);
				$('.booklrpopup').attr('style', 'background-color: #E77072;color: white;')
				lrtype.attr('style', 'border-left: 5px solid #E77072;');
				//$('#taxPaidByEle').val(TAX_PAID_BY_CONSINGEE_ID);
				//$('#consigneeEmailAsterisk').show(); 
				$('#GenerateEwayBillbtn').attr('style', 'background-color:#E77072; color:white;');

				//$('#consignorEmailAsterisk').hide(); 

				_this.selectTaxPaidBy($('#wayBillTypeEle').val(), $('#consigneeGstnEle').val(), $('#consignorGstnEle').val());
			}
		}, uploadImage: function() {
			let cameraButton	= document.querySelector("#start-camera");
			let video			= document.querySelector("#video");
			let clickButton		= document.querySelector("#click-photo");
			let clearButton		= document.querySelector("#clear-photo");
			let canvas			= document.querySelector("#canvas");
			let maxPhotos = 5;

			// Function to update the photo count display
			function updatePhotoCount() {
				let count = $('#capturedImages img').length;
				$('#photoCount').text(count + '/' + maxPhotos + ' Photos Captured');
				
				if(count > 0) {
				   $('.photoCount').text(count +' Photos Captured');
				   $('.photoCount').show()
				}
			}

			cameraButton.addEventListener('click', async function() {
				/*if ($('#taxPaidByEle').val() === '0' || $('#taxPaidByEle').val() === null) {
					showMessage('error', 'Please Select GST Paid By');
					$('#taxPaidByEle').focus();
				} */
					try {
						let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
						video.srcObject = stream;

						if (stream) {
							$('#catchphoto').modal('show');
						}
					} catch (error) {
						showMessage('error', 'Error accessing camera. Please Allow Camera.')
						console.error('Error accessing camera:', error);
					}
				
			});

			clickButton.addEventListener('click', function() {
				if ($('#capturedImages img').length < maxPhotos) {
					canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

					imageStr += canvas.toDataURL('image/jpeg');

					const capturedImage = $('<img>').attr({
						src: canvas.toDataURL('image/jpeg'),
						alt: 'Captured Image',
					});

					$('#capturedImages').prepend(capturedImage);
					updatePhotoCount(); // Update the photo count display
					if ($('#capturedImages img').length === 1) {
						$('#capturedImages img').removeClass('col-md-6');
					} else {
						$('#capturedImages img').addClass('col-md-6');
					}
				} else {
					showMessage('error', 'You can capture maximum of 5 photos.');
				}
			});

			clearButton.addEventListener('click', function() {
				canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
				$('#capturedImages').html('');
				imageStr = "";
				updatePhotoCount(); // Update the photo count display
				$('.photoCount').hide()
			});
		}, validateAndBookLR: function() {
			let isInvoiceNumberEntered = true;

			$('#invoiceNumberEle').on('input', function() {
				let invoicval = $('#invoiceNumberEle').val();

				if ($('#invoiceNumberEle').val() != undefined)
					isInvoiceNumberEntered = invoicval.length != 0;
			});

			let allFieldsFilled = true;

			$(".partyDetail input:not(#consignorEmailEle):not(#consigneeEmailEle)").each(function() {
				if ($(this).val().trim().length === 0) {
					allFieldsFilled = false;
					return false;
				}
			});

			
			if (!_this.validateEmails()) {
				return;
			}

			if (!isInvoiceNumberEntered || $('#invoiceNumberEle').val() != undefined && $('#invoiceNumberEle').val().length === 0) {
				showMessage('error', 'Please, Enter Invoice Number in EwayBill Section !');
				return;
			}

			if ($('#ewaybillEle').val() != undefined && $('#ewaybillEle').val().length < 12) {
				showMessage('error', 'Please Fill EwayBill Section !');
				$('.Ewaybill').removeClass('hide');
				$('#eWaybillDetailsDiv').addClass('scheduler-border');
				$('#ewaybillEle').focus();
				return;
			}

			if (!allFieldsFilled) {
				showMessage('error', 'Please fill  all fields in Party Details Section !');
				$('.partyDetail').removeClass('hide');
				$('#partyDetailsDiv').addClass('scheduler-border');
				$('#partyDetailsDiv').focus();
				return;
			}

			if (!validateInputTextFeild(1, 'taxPaidByEle', 'taxPaidByEle', 'error', 'Please Select GST Paid By'))
				return;

			if ($('#myTable tbody tr').length == 0) {
				showMessage('error', 'Please, Add Consignment !');
				return;
			}

			if (!_this.validatePaymentDetails())
				return;
			
			/*if (imageStr != null && imageStr == '') {
				showMessage('error', 'Please, Take Photo of the Customer !');
				return;
			} */
			
			if($('#wayBillTypeEle').val() == WAYBILL_TYPE_PAID && $('#taxPaidByEle').val() == TAX_PAID_BY_CONSINGEE_ID) {
				showMessage('error', 'Please, Select Proper GST Paid By!'); 
				return
			}
			
			if($('#wayBillTypeEle').val() == WAYBILL_TYPE_TO_PAY && $('#taxPaidByEle').val() == TAX_PAID_BY_CONSINGOR_ID) {
				showMessage('error', 'Please, Select Proper GST Paid By!'); 
				return
			}
			
			if (!validateInputTextFeild(1, 'subCommodityEle', 'subCommodityEle', 'error', subCommodityErrMsg))
				return ;
				//subCommodityHM
				
				var subCommodityId = Number($('#subCommodityEle').val());
				const subCommObj = subCommodityHM.get(subCommodityId);
				if(!subCommObj.insuranceRequired){
					showMessage('error', 'With Selected Sub Commodity You Cannot Book LR !');
					return;
				}
			
			if ($('#remarkEle').val().trim().length === 0) {
				showMessage('error', 'Please Enter Remark!');
				return;
			}

			if (newRouteLegsList == undefined || newRouteLegsList == null || newRouteLegsList.length == 0 || ratesnotfound) {
				showMessage('error', 'Cannot Book LR As Offer Not Found For The Selected Route On Charged Weight !');
				hideLayer();
				return;
			}
			
			 $('#noticeModal').modal('show');
			
			//$('#exampleModal').modal('show');
		}, inputvalidate: function() {

			$("#consignorNumberEle").keypress(function(event) {
				if (event.which == 13) {
					if (!validateInputTextFeild(1, 'consignorNumberEle', 'consignorNumberEle', 'error', consinorMobileNumberLenErrMsg)
						|| !validateInputTextFeild(5, 'consignorNumberEle', 'consignorNumberEle', 'error', consinorMobileNumberLenErrMsg))
						return false;


					let number = $('#consignorNumberEle').val().trim()

					if (/^(.)\1+$/.test(number)) {
						showMessage('error', 'Enter Valid mobile Number')
						return false;
					}
				}
			});
			
			$("#consignorGstnEle").keypress(function(event) {
				if (event.which == 13 && !validateInputTextFeild(1, 'consignorGstnEle', 'consignorGstnEle', 'error', 'Enter Consignor GST'))
					return false;
			})

			$("#consignorNameEle").keypress(function(event) {
				if (event.which == 13 && !validateInputTextFeild(1, 'consignorNameEle', 'consignorNameEle', 'error', validPartyNameErrorMsg('Consignor')))
					return false;
			})

			$("#consignorAddressEle").keypress(function(event) {
				if (event.which == 13 && !validateInputTextFeild(1, 'consignorAddressEle', 'consignorAddressEle', 'error', 'Enter Consignor Address'))
					return false;
			})

			$("#consigneeGstnEle").keypress(function(event) {
				if (event.which == 13 && !validateInputTextFeild(1, 'consigneeGstnEle', 'consigneeGstnEle', 'error', 'Enter Consignee GST'))
					return false;
			})

			$("#consigneeNameEle").keypress(function(event) {
				if (event.which == 13 && !validateInputTextFeild(1, 'consigneeNameEle', 'consigneeNameEle', 'error', validPartyNameErrorMsg('Consignee')))
					return false;
			})

			$("#consigneeNumberEle").keypress(function(event) {
				if (event.which == 13) {
					if (!validateInputTextFeild(1, 'consigneeNumberEle', 'consigneeNumberEle', 'error', consineeMobileNumberLenErrMsg)
						|| !validateInputTextFeild(5, 'consigneeNumberEle', 'consigneeNumberEle', 'error', consineeMobileNumberLenErrMsg) )
						return false;
					
					let number = $('#consignorNumberEle').val().trim()
					
					if (/^(.)\1+$/.test(number)) {
						showMessage('error', 'Enter Valid mobile Number')
						return false;
					}
				}
			})

			$("#consigneeAddressEle").keypress(function(event) {
				if (event.which == 13 && !validateInputTextFeild(1, 'consigneeAddressEle', 'consigneeAddressEle', 'error', 'Enter Consignee Address'))
					return false;
			})
			// consignment validaiton 

			$("#quantityEle").keypress(function(event) {
				if (event.which == 13 && !validateInputTextFeild(1, 'quantityEle', 'quantityEle', 'error', quantityErrMsg))
					return false;
			})
			$("#hsnCodeEle").keypress(function(event) {
				if (event.which == 13 && !validateInputTextFeild(1, 'hsnCodeEle', 'hsnCodeEle', 'error', hsnCodeErrMsg))
					return false;
			})
			$("#packingTypeEle").keypress(function(event) {
				if (event.which == 13 && !validateInputTextFeild(1, 'packingTypeEle', 'packingTypeEle', 'error', articleTypeErrMsg))
					return false;
			})

			$("#saidToContainEle").keypress(function(event) {
				if (event.which == 13 && !validateInputTextFeild(1, 'saidToContainEle', 'saidToContainEle', 'error', saidToContaionErrMsg))
					return false;
			})

			$("#lengthEle").keypress(function(event) {
				if (event.which == 13 && !validateInputTextFeild(1, 'lengthEle', 'lengthEle', 'error', lengthErrMsg))
					return false;
			})

			$("#breathEle").keypress(function(event) {
				if (event.which == 13 && !validateInputTextFeild(1, 'breathEle', 'breathEle', 'error', breadthErrMsg))
					return false;
			})

			$("#heightEle").keypress(function(event) {
				if (event.which == 13 && !validateInputTextFeild(1, 'heightEle', 'heightEle', 'error', heightErrMsg))
					return false;
			})

			$("#actualWeightEle").keypress(function(event) {
				if (event.which == 13 && !validateInputTextFeild(1, 'actualWeightEle', 'actualWeightEle', 'error', actWeightErrMsg))
					return false;
			})
		
			return true;
		},getNearByPincodes : function (){
			let jsonObject = {};
			jsonObject.toPincode	= $('#toPincodeEle').val();
			
			if($('#toPincodeEle').val() == undefined || $('#toPincodeEle').val() == null || $('#toPincodeEle').val().trim().length == undefined || $('#toPincodeEle').val().trim().length < 6){
				
				showMessage('error', "Please Enter 6 Digit Pin Code.");
						setTimeout(() => {
							$('#toPincodeEle').focus()
				}, 0)
	
				return;
			}
			$('#nPincodeList').empty();
			showLayer();

			return new Promise(resolve => {
				getJSON(jsonObject, WEB_SERVICE_URL + '/tceBookingWS/fetchNearByServicablePincodes.do?', response => {
					_this.setNearByPincodes(response);
					resolve()
				}, EXECUTE_WITH_ERROR);
			})
		},setNearByPincodes : function (response){
			
			$('#nPincodeList').empty();
			$('#pincodeMap').empty();

			if(response.result != undefined && response.result.length > 0){
				var list = "";
				
				const pincodeMap = response.result.reduce((acc, item) => {
					  acc[item.pincode] = item;	 // Use item properties as keys and values
					  return acc;
				}, {});
				
				Object.keys(pincodeMap).forEach(pincode => {
				  list += "<li class='pincodelitag' role='button' >"+pincode+"</li>"
				});
				$('#nPincodeList').on('click', '.pincodelitag', function() {
					$('#toPincodeEle').val($(this).text());
				});
				const uniqueData = [];
				const seenPincodes = {};

				for (const item of response.result) {
					if (!seenPincodes[item.pincode]) {
						seenPincodes[item.pincode] = true; 
						uniqueData.push(item); 
					}
				}	
				
				const latitudes = uniqueData.map(branch => branch.latitude);
				const longitudes = uniqueData.map(branch => branch.longitude);
				const minLat = Math.min(...latitudes);
				const maxLat = Math.max(...latitudes);
				const minLng = Math.min(...longitudes);
				const maxLng = Math.max(...longitudes);
				
				const olaMaps = new OlaMapsSDK.OlaMaps({
					apiKey: '370PTUkmV2qEWEbF9xvjpHMzD4mmkl5Me2yExXVU',
				});

				const myMap = olaMaps.init({
					style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
					container: 'pincodeMap',
					center:[(minLng + maxLng) / 2, (minLat + maxLat) / 2],
					zoom: 10,
				});


				uniqueData.forEach(branch => {
					const customMarker = document.createElement('div');
					customMarker.innerHTML = `<span class='customMarkerClass' > ${branch.pincode} </span> <svg display="block" height="41px" width="27px" viewBox="0 0 27 41"><g fill-rule="nonzero"><g transform="translate(3.0, 29.0)" fill="#000000"><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="10.5" ry="5.25002273"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="10.5" ry="5.25002273"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="9.5" ry="4.77275007"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="8.5" ry="4.29549936"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="7.5" ry="3.81822308"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="6.5" ry="3.34094679"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="5.5" ry="2.86367051"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="4.5" ry="2.38636864"></ellipse></g><g fill="blue"><path d="M27,13.5 C27,19.074644 20.250001,27.000002 14.75,34.500002 C14.016665,35.500004 12.983335,35.500004 12.25,34.500002 C6.7499993,27.000002 0,19.222562 0,13.5 C0,6.0441559 6.0441559,0 13.5,0 C20.955844,0 27,6.0441559 27,13.5 Z"></path></g><g opacity="0.25" fill="#000000"><path d="M13.5,0 C6.0441559,0 0,6.0441559 0,13.5 C0,19.222562 6.7499993,27 12.25,34.5 C13,35.522727 14.016664,35.500004 14.75,34.5 C20.250001,27 27,19.074644 27,13.5 C27,6.0441559 20.955844,0 13.5,0 Z M13.5,1 C20.415404,1 26,6.584596 26,13.5 C26,15.898657 24.495584,19.181431 22.220703,22.738281 C19.945823,26.295132 16.705119,30.142167 13.943359,33.908203 C13.743445,34.180814 13.612715,34.322738 13.5,34.441406 C13.387285,34.322738 13.256555,34.180814 13.056641,33.908203 C10.284481,30.127985 7.4148684,26.314159 5.015625,22.773438 C2.6163816,19.232715 1,15.953538 1,13.5 C1,6.584596 6.584596,1 13.5,1 Z"></path></g><g transform="translate(6.0, 7.0)" fill="#FFFFFF"></g><g transform="translate(8.0, 8.0)"><circle fill="#000000" opacity="0.25" cx="5.5" cy="5.5" r="5.4999962"></circle><circle fill="#FFFFFF" cx="5.5" cy="5.5" r="5.4999962"></circle></g></g></svg>`;
					customMarker.addEventListener('click', () => {
						$('#toPincodeEle').val(branch.pincode)
					});
					olaMaps
						.addMarker({ element: customMarker, offset: [0, 6], anchor: 'bottom', color: 'blue' })
						.setLngLat([branch.longitude, branch.latitude]) 
						.addTo(myMap);
				});
				
				myMap.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 50 });

				$('#nPincodeList').append(list);
				isShowMap = true;
				$('.toggleMapList').html('View on Map')
				$('.toggleMapList').addClass('btn-primary')
				$('.toggleMapList').removeClass('btn-success')
				$('#pincodeMap').addClass('hide')
				$('#nPincodeList').removeClass('hide')
				$('#nearbypincodemodal').modal('show')
				$('.mapviewmodal').removeClass('modal-xl')
			}else{
				showMessage('error' , "No Nearby Pincodes Found!");
			}
			hideLayer();
			//<li>Hazardous chemical items</li>
		}, fetchCitywisePincodes() {
			return new Promise((resolve, reject) => {
				getJSON({}, WEB_SERVICE_URL + '/tceBookingWS/fetchAllServicablePincodes.do?', response => {
					try {
						this.setCitywisePincodes(response);
						resolve(response); 
					} catch (error) {
						reject(error);
					}
				}, error => {
					reject(error);
				});
			});
		}, setCitywisePincodes: function(response) {
			const newTab = window.open('', '_blank');
			newTab.document.write(`
				<html>
					<head>
						<title>Citywise Pincodes</title>
						<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
						<style>
							body { font-family: Arial, sans-serif; background-color:  #f4f4f9;	color: #333; margin: 0; padding: 20px; }
							.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
							h2 { margin: 0; color: #4a4a8d; }
							.collapsible { background-color: #6c7ae0; color: white; padding: 12px;text-align: left; width: 100%; border: none; font-size: 16px; border-radius: 5px; cursor: pointer; }
							.active, .collapsible:hover { background-color: #5b64d4; }
							.content { padding: 0 18px; display: none; overflow: hidden; background-color: #eaeaea; border-radius: 5px; margin-top: 5px; }
							.pincode-row { display: flex; flex-wrap: wrap; }
							.pincode-item {	 width: 17.66%; padding: 8px; text-align: start; border: 1px solid #ddd; border-radius: 5px; background-color: #fff; margin: 5px; }
							#printButton { padding: 10px 15px; background-color: #28a745; color: white; border: none; cursor: pointer; font-size: 16px; border-radius: 5px; }
							#printButton:hover { background-color: #218838; }
							#cityFilter { margin-bottom: 20px; padding: 10px; font-size: 16px; width: 100%; border: 1px solid #ccc; border-radius: 5px; }
						</style>
					</head>
					<body>
						<div class="header">
							<h2>Citywise Pincodes</h2>
							<button id="printButton">Print Pincodes</button>
						</div>
						<input type="text" id="cityFilter" placeholder="Enter city name to filter..." />
						<div id="pincodeContainer"></div>
						<script>
							$(document).ready(function() {
								const data = ${JSON.stringify(response)};
								const $container = $('#pincodeContainer');
								
								// Function to display pincodes
								const displayPincodes = (filter = "") => {
									$container.empty();
									$.each(data, function(city, pincodes) {
										if (city.toLowerCase().includes(filter.toLowerCase())) {
											const $cityButton = $('<button class="collapsible"></button>').text(city);
											const $contentDiv = $('<div class="content"><div class="pincode-row"></div></div>');
											pincodes.forEach(pincode => $contentDiv.find('.pincode-row').append(\`<div class="pincode-item">\${pincode}</div>\`));
											$cityButton.click(function() { $(this).toggleClass('active').next('.content').slideToggle(); });
											$container.append($cityButton).append($contentDiv);
										}
									});
								};
		
								displayPincodes(); 
		
								$('#cityFilter').on('input', function() { displayPincodes($(this).val()); });
		
							  
								$('#printButton').click(function() {
									let printContent = '';
									$.each(data, function(city, pincodes) {
										if (!$('#cityFilter').val() || city.toLowerCase().includes($('#cityFilter').val().toLowerCase())) {
											printContent += \`<div style="margin-bottom: 20px; text-align: center;"><h2 style="margin: 0; color: #4a4a8d;">\${city}</h2><div style="display: flex; flex-wrap: wrap;">\`;
											pincodes.forEach((pincode, index) => {
												printContent += \`<div style="width: 18%; padding: 5px; text-align: center; border: 1px solid #ddd; margin: 5px; border-radius: 5px; background-color: #fff;">\${pincode}</div>\`;
												if ((index + 1) % 5 === 0) printContent += '</div><div style="display: flex; flex-wrap: wrap;">';
											});
											printContent += '</div></div>';
										}
									});
									const printWindow = window.open('', '_blank');
									printWindow.document.write(\`
										<html><head><title>Print Pincodes</title><style>body { font-family: Arial, sans-serif; margin: 20px; } h2 { color: #4a4a8d; }</style></head><body>\${printContent}</body></html>\`);
									printWindow.document.close();
									printWindow.print();
								});
							});
						</script>
					</body>
				</html>
			`);
			newTab.document.close();
		}, validateEmails: function() {
			const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			let isValid = true;
		
			const consignorEmail = $('#consignorEmailEle').val();
		
			if (consignorEmail && !emailPattern.test(consignorEmail)) {
				showMessage('error', 'Please enter a valid Consignor Email address.');
				$('#consignorEmailEle').focus();
				isValid = false;
			}
		
			const consigneeEmail = $('#consigneeEmailEle').val();
		
			if (consigneeEmail && !emailPattern.test(consigneeEmail)) {
				showMessage('error', 'Please enter a valid Consignee Email address.');
				$('#consigneeEmailEle').focus();
				isValid = false;
			}
	
		   if (consignorEmail && consigneeEmail && consignorEmail === consigneeEmail) {
				showMessage('error', 'Consignor and Consignee Email addresses cannot be the same.');
				$('#consigneeEmailEle').focus();
				isValid = false;
			}

		return isValid;
	}, generateEwaybill: function() {
		let jsonObject = _this.getDataToGenerateEwayBill();
			
		getJSON(jsonObject, WEB_SERVICE_URL + '/tceBookingWS/processEWayBillGeneration.do?', _this.setEwayBillResponse, EXECUTE_WITHOUT_ERROR);
	}, getDataToGenerateEwayBill: function() {
			let itemList	= [];
			
			/*for (let k in consignmentDataHM) {
						itemList.push(consignmentDataHM[k]);
			}
			let finalObj = new Object();

			finalObj.item_list				= JSON.stringify(itemList);
			finalObj.invoiceDates			= '07/11/2024';
			finalObj.consignorPincode		= $('#consignorPincode').val();
			finalObj.consigneePincode		= $('#consigneePincode').val();
			finalObj.declareValue			= totalAmount;
			finalObj.consignorName			= $('#consignorNameEle').val();
			finalObj.consignorNumber		= $('#consignorNumberEle').val();
			finalObj.consignorAddress		= $('#consignorAddressEle').val();
			finalObj.consignorGstn			= $('#consignorGstnEle').val();
			finalObj.consigneeName			= $('#consigneeNameEle').val();
			finalObj.consigneeNumber		= $('#consigneeNumberEle').val();
			finalObj.consigneeAddress		= $('#consigneeAddressEle').val();
			finalObj.consigneeGstn			= $('#consigneeGstnEle').val();*/
			
			let consignmentObject = {};
			consignmentObject.quantity				= 1;
			consignmentObject.packingTypeId			= 1257;
			consignmentObject.packingType			= 'BOX';
			consignmentObject.saidToContain			= 'Wheat';
			consignmentObject.amount				= 300;
			consignmentObject.hsnCode				= 1001;
			consignmentObject.taxableAmount			= 300;
			consignmentObject.cgstRate				= 9;
			consignmentObject.sgstRate				= 9;
			consignmentObject.igstRate				= 0;
			consignmentObject.cessRate				= 0;
			
			itemList.push(consignmentObject);
			
			let consignmentObject2 = {};
			consignmentObject2.quantity				= 1;
			consignmentObject2.packingTypeId		= 1257;
			consignmentObject2.packingType			= 'BOX';
			consignmentObject2.saidToContain		= 'Wheat';
			consignmentObject2.amount				= 300;
			consignmentObject2.hsnCode				= 1001;
			consignmentObject2.taxableAmount			= 300;
			consignmentObject2.cgstRate					= 9;
			consignmentObject2.sgstRate					= 9;
			consignmentObject2.igstRate					= 0;
			consignmentObject2.cessRate					= 0;
			
			itemList.push(consignmentObject2);
			
			let finalObj = new Object();

			finalObj.item_list				= JSON.stringify(itemList);
			finalObj.invoiceDates			= '07/11/2024';
			finalObj.invoiceNumber			= Math.floor(100000 + Math.random() * 900000);
			finalObj.consignorGstn			= '05AAABC0181E1ZE';
			finalObj.consignorName			= 'welton';
			finalObj.consignorAddress		= '2ND CROSS NO 59 19 A GROUND FLOOR OSBORNE ROAD';
			finalObj.consignorPincode		= 248001;
			finalObj.place_of_consignor		= 'Dehradun';
			finalObj.state_of_consignor		= 'UTTARAKHAND';
			
			finalObj.consigneePincode		= 249193;
			finalObj.consigneeName			= 'sthuthya';
			finalObj.consigneeAddress		= 'Shree Nilaya Dasarahosahalli';
			finalObj.consigneeGstn			= '05AAABB0639G1Z8';
			finalObj.declareValue			= 318;
			finalObj.place_of_consignee		= 'Beml Nagar';
			finalObj.state_of_consignee		= 'UTTARAKHAND';
			
			return finalObj;
			
	},setEwayBillResponse: function(response){
		console.log('setEwayBillResponse .....', response);
			
},getCurrentOffers() {
	window.open('ExecutiveOffers.do?pageId=340&eventId=1&modulename=executiveOffers', '_blank');
},populateHsnCodes: function(response){
 	const $hsnCodeDropdown = $("#hsnCodeEle"); 

    $hsnCodeDropdown.empty().append('<option value="" disabled selected></option>');

	    if (response && response.itemList && Array.isArray(response.itemList)) {
	        response.itemList.forEach(function (item) {
	            if (item.hsnCode) {
	                $hsnCodeDropdown.append(
	                    $('<option>', {
	                        value: item.hsnCode,
	                        text: item.hsnCode,
	                    })
	                );
	            }
	        });
	    } else {
	        console.error("No valid itemList data found in response.");
		}
	}, validateConsignorAndConsgineeMobileNumber: function(inputId, errorMessage) {

			let $input = $(`#${inputId}`);
			let number = $input.val().trim();

			if (number === "") {
				showMessage('error', `${errorMessage} cannot be empty.`);
				$input.focus();
				return false;
			}

			if (!/^\d{10}$/.test(number)) {
				showMessage('error', `Enter a valid 10-digit ${errorMessage}.`);
				$input.focus();
				return false;
			}

			/*// Check for repetitive digits (e.g., 1111111111)
			if (/^(.)\1+$/.test(number)) {
				showMessage('error', `${errorMessage} cannot have repetitive digits.`);
				$input.focus();
				return false;
			}*/

			return true;
		}

	});
});
