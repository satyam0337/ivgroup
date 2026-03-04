define([
	
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
	'JsonUtility',
	//jsonutility consist of ajax calls to send json object as an ajax hit to the url specified and get call back as specified
	'messageUtility',
	// to get parameter from url to send it to ws
	,'jquerylingua'
	,'language'
	,PROJECT_IVUIRESOURCES+'/resources/js/generic/genericfunctions.js'
	],
	function(UrlParameter) {
	'use strict';// this basically give strictness to this specific js
	let masterId = "0",
	bulkCrPrint	= false,
	jsonObject	= new Object(),
	_this = '';
	var BATCO_SURAT_DLY_BRANCH_ID = 38634;
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			//masterid is fetched and passed when the view is called and it is set to fetch it from webservice
			masterId = UrlParameter.getModuleNameFromParam(MASTERID)
			bulkCrPrint = UrlParameter.getModuleNameFromParam("bulkCrPrint");
			//initialize is the first function called on call new view()
			_this = this;
		}, render: function() {
			if(Number(masterId) != 0)
				jsonObject.crIds = masterId;	
			else
				jsonObject.crIds = localStorage.getItem("crIdString");
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/crPrintWS/getCRPrintByCRIdForMultiple.do?', _this.getResponseForPrint, EXECUTE_WITHOUT_ERROR);

			return _this;
		},getResponseForPrint : function(response) {
			let crData								= response.crData;
			let branchWiseMultiCRPrint				= response.branchWiseMultiCRPrint;
			let branchWiseWithLabelsMultiCRPrint 	= response.branchWiseWithLabelsMultiCRPrint;
			let branchWiseDotMatrixMultiCRPrint 	= response.branchWiseDotMatrixMultiCRPrint;
			let accountGroupId						= response.accountGroupId;
			
			let url	= '';
			
			if(branchWiseMultiCRPrint)
				url	= '/ivcargo/html/print/delivery/' + accountGroupId + '_branchWisedelivery.html';
			else if(branchWiseWithLabelsMultiCRPrint)
				url	= "/ivcargo/html/print/delivery/" + accountGroupId + "_branchWisedeliveryWithLabels.html";
			else if(branchWiseDotMatrixMultiCRPrint)
				url = "/ivcargo/html/print/delivery/multicr/" + accountGroupId + "_dotMatrixMultiCR.html";
			else if(bulkCrPrint)
				url = "/ivcargo/html/print/delivery/bulkCRPrint/" + accountGroupId + "_bulkCRPrint.html";
			else
				url = "/ivcargo/html/print/delivery/multicr/" + accountGroupId + "_multiCR.html";
				
			let isGroupHtmlFileExists	= urlExists(url);
			
			if(!isGroupHtmlFileExists)
				url	= "/ivcargo/html/print/delivery/multicr/default_multiCR.html";
			
			localStorage.removeItem("crIdString");
			
			let loadelement = new Array();
			var count = 0;
			
			for (let key in crData) {
				let baseHtml = new $.Deferred();
				loadelement.push(baseHtml);
				$("#mainContent").append('<div id=data_' + key + '></div>');
				
				$("#data_" + key).load(url, function() {
					baseHtml.resolve();
					
					baseHtml.done(function() {
				    	if(count > 0)	
							 $('#data_'+key).addClass('page-break2');
							
						count++;
					});
				});
			}

			setTimeout(function() {
				_this.setCrData(crData);
			}, 1000);
			
			window.setTimeout(_this.printAfterDelay, 2000);
		}, setCrData : function(response) {

			for (let key in response) {
				_this.setHeaderData(response[key].PrintHeaderModel, key);
				_this.setConsigneeDetails(response[key].consignee, key);
				_this.setCrdetails(response[key], key);
				
				if($('#deliveryCharges').length != 0)
					_this.setDeliveryCharges(response[key], key);
				
				if($('#deliveryChargesWithoutChargeName').length != 0)
					_this.setDeliveryChargesWithoutChargeName(response[key], key);
				
				if($('#consignment').length != 0)
					_this.setConsignment(response[key], key);
				
				_this.setDeliveryChargesStatic(response[key], key);
				_this.setConsignmentStatic(response[key], key);
				_this.setPackingTypeNameWithQuantity(response[key], key);
				_this.setConsignorDetails(response[key].consignor, key);
				_this.setPaymentTypeDetails(response[key].crprintlist, key);
				_this.setTaxDetails(response[key].wayBillTaxTxnHM, key);
				
				
			}
		
			hideLayer();
		}, setHeaderData : function(headerData, key) {
			if(headerData != undefined && headerData != 'undefined' && typeof headerData != 'undefined'){
				$('div[id=data_' + key + ']').find('td[id=accountGroupName]').html(headerData.accountGroupName);
				$('div[id=data_' + key + ']').find('td[id=address]').html(headerData.branchAddress);
				$('div[id=data_' + key + ']').find('span[id=accountGroupName]').html(headerData.accountGroupName);
				$('div[id=data_' + key + ']').find('span[id=address]').html(headerData.branchAddress);
				$('div[id=data_' + key + ']').find('[id=branchGstn]').html(headerData.branchGSTN);
				$('div[id=data_' + key + ']').find('td[id=accountGroupName]').html(headerData.accountGroupName);
				$('div[id=data_' + key + ']').find('td[id=address]').html(headerData.branchAddress);
				$('div[id=data_' + key + ']').find('span[id=accountGroupName]').html(headerData.accountGroupName);
				$('div[id=data_' + key + ']').find('span[id=address]').html(headerData.branchAddress);
				$('div[id=data_' + key + ']').find('[id=branchGstn]').html(headerData.branchGSTN);
				
				if(headerData.branchContactDetailPhoneNumber != undefined && headerData.branchContactDetailPhoneNumber != null) {
					$('div[id=data_' + key + ']').find('td[id="phoneNumber"]').html(headerData.branchContactDetailPhoneNumber);
					$('div[id=data_' + key + ']').find('span[id="phoneNumber"]').html(headerData.branchContactDetailPhoneNumber);
					$('div[id=data_' + key + ']').find('span[id="addressAndPhoneNumber"]').html(headerData.branchAddress + ' (' + headerData.branchContactDetailPhoneNumber+')');
				} else if(headerData.branchContactDetailMobileNumber != undefined && headerData.branchContactDetailMobileNumber != null) {
					$('div[id=data_' + key + ']').find('td[id="phoneNumber"]').html(headerData.branchContactDetailMobileNumber);
					$('div[id=data_' + key + ']').find('span[id="phoneNumber"]').html(headerData.branchContactDetailMobileNumber);
					$('div[id=data_' + key + ']').find('span[id="addressAndPhoneNumber"]').html(headerData.branchAddress + ' (' + headerData.branchContactDetailMobileNumber+')');
				}
				
				if(headerData.accountGroupId == ACCOUNT_GROUP_ID_GLDTS) {
					if(headerData.branchId == POLUR_BRANCH_740)
						$(".showTable").show();
					else
						$(".showSecondTable").show();
				}
				
				//if(headerData.branchId == BATCO_SURAT_DLY_BRANCH_ID)
					//$(".batcoBankDetails").show();
			}
		}, setConsigneeDetails : function(consignee,key){
			if(consignee != undefined && consignee != 'undefined' && typeof consignee != 'undefined'){
				$('div[id=data_' + key + ']').find('td[id=consignee]').html(consignee.customerDetailsName);
				$('div[id=data_' + key + ']').find('span[id=consignee]').html(consignee.customerDetailsName);
				$('div[id=data_' + key + ']').find('td[id=consigneePhoneNumber]').html(consignee.customerDetailsphoneNumber);
				$('div[id=data_' + key + ']').find('span[id=consigneePhoneNumber]').html(consignee.customerDetailsphoneNumber);
				$('div[id=data_' + key + ']').find('span[id=gstn]').html(consignee.gstn);
			}
		}, setConsignorDetails : function(consignor, key) {
			if(consignor != undefined && consignor != 'undefined' && typeof consignor != 'undefined'){
				$('div[id=data_' + key + ']').find('td[id=consignor]').html(consignor.customerDetailsName);
				$('div[id=data_' + key + ']').find('span[id=consignor]').html(consignor.customerDetailsName);
				$('div[id=data_' + key + ']').find('td[id=consignorPhoneNumber]').html(consignor.customerDetailsphoneNumber);
				$('div[id=data_' + key + ']').find('span[id=consignorPhoneNumber]').html(consignor.customerDetailsphoneNumber);
			}
		}, setCrdetails : function(crprintlistData, key) {
			if(crprintlistData != undefined && crprintlistData != 'undefined' && typeof crprintlistData != 'undefined') {
				let crprintlist			= crprintlistData.crprintlist;
				let bookingChargesSum	= crprintlist.bookingChargesSum;
				let deliverySumCharges	= crprintlist.deliverySumCharges;

				
				$('div[id=data_' + key + ']').find('td[id=crNumber]').html(crprintlist.wayBillDeliveryNumber);
				$('div[id=data_' + key + ']').find('td[id=deliveryAddress]').html(crprintlist.consignmentSummaryDeliveryToAddress);
				$('div[id=data_' + key + ']').find('td[id=deliveryContact]').html(crprintlist.consignmentSummaryDeliveryToContact);
				$('div[id=data_' + key + ']').find('td[id=vehicleNumber]').html(crprintlist.vehicleNo);
				$('div[id=data_' + key + ']').find('td[id=crDate]').html(crprintlist.deliveryDate);
				$('div[id=data_' + key + ']').find('td[id=crTime]').html(crprintlist.deliveryDateTimeString);
				$('div[id=data_' + key + ']').find('td[id=crTime1]').html(crprintlist.deliveryDate+'</br>'+crprintlist.deliveryTime);
				$('div[id=data_' + key + ']').find('td[id=crDateTime]').html(crprintlist.deliveryDate+' '+crprintlist.deliveryTime);
				$('div[id=data_' + key + ']').find('td[id=destinationBranch]').html(crprintlist.wayBillDestinationBranchName);
				$('div[id=data_' + key + ']').find('td[id=wayBillDestinationSubregionName]').html(crprintlist.wayBillDestinationSubregionName);
				$('div[id=data_' + key + ']').find('td[id=sourceBranch]').html(crprintlist.wayBillSourceBranchName);
				$('div[id=data_' + key + ']').find('td[id=bookingDate]').html(crprintlist.bookingDate);
				$('div[id=data_' + key + ']').find('td[id=receiveDate]').html(crprintlist.wayBillReceiveTimeString.replace(/ /g, "&nbsp;"));
				$('div[id=data_' + key + ']').find('td[id=lrNumber]').html(crprintlist.wayBillNumber);
				$('div[id=data_' + key + ']').find('td[id=sourceBranch]').html(crprintlist.wayBillSourceBranchName);
				$('div[id=data_' + key + ']').find('td[id=bookingDate]').html(crprintlist.bookingDate);
				$('div[id=data_' + key + ']').find('td[id=lrNumber]').html(crprintlist.wayBillNumber);
				$('div[id=data_' + key + ']').find('td[id=lrType]').html(crprintlist.wayBillType);
				$('div[id=data_' + key + ']').find('[id=articles]').html(crprintlist.quantity);
				$('div[id=data_' + key + ']').find('[id=packingType]').html(crprintlist.packingTypeMasterName);
				$('div[id=data_' + key + ']').find('[id=saidToContain]').html(crprintlist.saidToContain);
				$('div[id=data_' + key + ']').find('td[id=totalArticles]').html(crprintlist.quantity);
				$('div[id=data_' + key + ']').find('span[id=crNumber]').html(crprintlist.wayBillDeliveryNumber);
				$('div[id=data_' + key + ']').find('span[id=deliveryAddress]').html(crprintlist.consignmentSummaryDeliveryToAddress);
				$('div[id=data_' + key + ']').find('span[id=deliveryContact]').html(crprintlist.consignmentSummaryDeliveryToContact);
				$('div[id=data_' + key + ']').find('span[id=vehicleNumber]').html(crprintlist.vehicleNo);
				$('div[id=data_' + key + ']').find('span[id=crDate]').html(crprintlist.deliveryDate);
				$('div[id=data_' + key + ']').find('span[id=crTime]').html(crprintlist.deliveryDateTimeString);
				$('div[id=data_' + key + ']').find('span[id=crTime1]').html(crprintlist.deliveryDate + '</br>' + crprintlist.deliveryTime);
				$('div[id=data_' + key + ']').find('span[id=crDateTime]').html(crprintlist.deliveryDate+' '+crprintlist.deliveryTime);
				$('div[id=data_' + key + ']').find('span[id=destinationBranch]').html(crprintlist.wayBillDestinationBranchName);
				$('div[id=data_' + key + ']').find('span[id=wayBillDestinationSubregionName]').html(crprintlist.wayBillDestinationSubregionName);
				$('div[id=data_' + key + ']').find('span[id=sourceBranch]').html(crprintlist.wayBillSourceBranchName);
				$('div[id=data_' + key + ']').find('span[id=bookingDate]').html(crprintlist.bookingDate);
				$('div[id=data_' + key + ']').find('span[id=lrNumber]').html(crprintlist.wayBillNumber);
				$('div[id=data_' + key + ']').find('span[id=sourceBranch]').html(crprintlist.wayBillSourceBranchName);
				$('div[id=data_' + key + ']').find('span[id=bookingDate]').html(crprintlist.bookingDate);
				$('div[id=data_' + key + ']').find('span[id=lrNumber]').html(crprintlist.wayBillNumber);
				$('div[id=data_' + key + ']').find('span[id=lrType]').html(crprintlist.wayBillType);
				$('div[id=data_' + key + ']').find('[id=articles]').html(crprintlist.quantity);
				$('div[id=data_' + key + ']').find('[id=packingType]').html(crprintlist.packingTypeMasterName);
				$('div[id=data_' + key + ']').find('[id=articleAndPackingType]').html(crprintlist.quantity + " - " + crprintlist.packingTypeMasterName);
				$('div[id=data_' + key + ']').find('[id=saidToContain]').html(crprintlist.saidToContain);
				$('div[id=data_' + key + ']').find('span[id=totalArticles]').html(crprintlist.quantity);
				$('div[id=data_' + key + ']').find('span[id=deliveredToName]').html(crprintlist.deliveredToName);
				$('div[id=data_' + key + ']').find('[id=chargeWeight]').html(crprintlist.chargeWeight);
				$('div[id=data_' + key + ']').find('[id=deliveryDiscount]').html(crprintlist.deliveryDiscount);
				$('div[id=data_' + key + ']').find('[id=deliveredToGodownName]').html(crprintlist.deliveredToGodownName);
				$('div[id=data_' + key + ']').find('[id=deliverySumChargesTotal]').html(deliverySumCharges);
				$('div[id=data_' + key + ']').find('[id=chequeNumber]').html(crprintlist.chequeNumber);
				$('div[id=data_' + key + ']').find('[id=deliveryPaymentType]').html(crprintlist.paymentTypeString);
				$('div[id=data_' + key + ']').find('[id=bankName]').html(crprintlist.bankName);
				$('div[id=data_' + key + ']').find('[id=privateMark]').html(crprintlist.privateMark);
				$('div[id=data_' + key + ']').find('span[id=deliveredToNumber]').html(crprintlist.deliveredToNumber);
				$('div[id=data_' + key + ']').find('[id=invoiceNo]').html(crprintlist.invoiceNo);
				$('div[id=data_' + key + ']').find('[id=bookingTotalGLDTS]').html(bookingChargesSum);
				
				if(crprintlist.deliveryDiscount > 0) {
					$('div[id=data_' + key + ']').find('[id=deliveryDiscount2]').html(crprintlist.deliveryDiscount);
				} else {
					$(".dlydiscounthide").hide();
				}
					

				if(crprintlist.deliveredToGodownName != null && crprintlist.deliveredToGodownName != undefined )
					$('div[id=data_' + key + ']').find('span[id=deliveredToGodownName]').html(crprintlist.deliveredToGodownName);
				else
					$('div[id=data_' + key + ']').find('span[id=deliveredToGodownName]').html('--');
					
				
				if(crprintlist.deliveredToGodownNumber != null && crprintlist.deliveredToGodownNumber != undefined )
					$('div[id=data_' + key + ']').find('span[id=deliveredToGodownNumber]').html(crprintlist.deliveredToGodownNumber);
				else
					$('div[id=data_' + key + ']').find('span[id=deliveredToGodownNumber]').html('--');
				
				if(crprintlist.deliveredToGodownAddress != null && crprintlist.deliveredToGodownAddress != undefined )
					$('div[id=data_' + key + ']').find('span[id=deliveredToGodownAddress]').html(crprintlist.deliveredToGodownAddress);
				else
					$('div[id=data_' + key + ']').find('span[id=deliveredToGodownAddress]').html('--');
					
				if(crprintlist.collectionPersonName != undefined)
					$('div[id=data_' + key + ']').find('span[id=billOn]').html(crprintlist.collectionPersonName);
				else
					$('div[id=data_' + key + ']').find('span[id=billOn]').html(crprintlist.deliveredToName);
				
				
				// For GLDTS	
				if(crprintlist.wayBillTypeId == WAYBILL_TYPE_PAID){
					$('div[id=data_' + key + ']').find('span[id=deliveryTotalWithDiscountForGLDTS]').html(crprintlist.deliverySumCharges - crprintlist.deliveryDiscount);
					$('div[id=data_' + key + ']').find('span[id=deliveryTotalInWordWithDiscountForGLDTS]').html(convertNumberToWord(crprintlist.deliverySumCharges - crprintlist.deliveryDiscount));
				}else {
					$('div[id=data_' + key + ']').find('span[id=deliveryTotalWithDiscountForGLDTS]').html(crprintlist.grandTotal);
					$('div[id=data_' + key + ']').find('span[id=deliveryTotalInWordWithDiscountForGLDTS]').html(convertNumberToWord(crprintlist.grandTotal));
				}	
				
				if(crprintlist.wayBillTypeId == WAYBILL_TYPE_PAID || crprintlist.wayBillTypeId == WAYBILL_TYPE_CREDIT || crprintlist.wayBillTypeId== WAYBILL_TYPE_FOC ){
					$('div[id=data_' + key + ']').find('span[id=deliveryTotalWithDiscountForyash]').html(crprintlist.deliverySumCharges);
				}else {
					$('div[id=data_' + key + ']').find('span[id=deliveryTotalWithDiscountForyash]').html(deliverySumCharges + bookingChargesSum);
				}
				
				$('div[id=data_' + key + ']').find('span[id=bookingTotalnew1]').html(bookingChargesSum);
				$('div[id=data_' + key + ']').find('td[id=grandTotal2]').html(crprintlist.grandTotal);
						
				
				if(crprintlist.wayBillTypeId == WAYBILL_TYPE_TO_PAY || crprintlist.paymentType == PAYMENT_TYPE_BILL_CREDIT_ID) {
					$('div[id=data_' + key + ']').find('td[id=totalAmount]').html(bookingChargesSum);
					$('div[id=data_' + key + ']').find('td[id=bookingTotal]').html(bookingChargesSum);
					$('div[id=data_' + key + ']').find('span[id=totalAmount]').html(bookingChargesSum);
					$('div[id=data_' + key + ']').find('span[id=bookingTotal]').html(bookingChargesSum);
					$('div[id=data_' + key + ']').find('td[id=deliveryTotal]').html(deliverySumCharges + bookingChargesSum);
					$('div[id=data_' + key + ']').find('span[id=deliveryTotal]').html(deliverySumCharges + bookingChargesSum);
					$('div[id=data_' + key + ']').find('td[id=deliveryTotalWithDiscount]').html(crprintlist.grandTotal);
					$('div[id=data_' + key + ']').find('span[id=deliveryTotalWithDiscount]').html(crprintlist.grandTotal);
					$('div[id=data_' + key + ']').find('span[id=deliveryTotalInWordWithDiscount]').html(convertNumberToWord(crprintlist.grandTotal));
				} else {
					$('div[id=data_' + key + ']').find('td[id=deliveryTotal]').html(deliverySumCharges);
					$('div[id=data_' + key + ']').find('span[id=deliveryTotal]').html(deliverySumCharges);
					$('div[id=data_' + key + ']').find('td[id=deliveryTotalWithDiscount]').html(deliverySumCharges - crprintlist.deliveryDiscount);
					$('div[id=data_' + key + ']').find('span[id=deliveryTotalWithDiscount]').html(deliverySumCharges - crprintlist.deliveryDiscount);
					$('div[id=data_' + key + ']').find('span[id=deliveryTotalInWordWithDiscount]').html(convertNumberToWord(deliverySumCharges - crprintlist.deliveryDiscount));
				}
				if(crprintlist.deliveryDiscount > 0) {
					$('div[id=data_' + key + ']').find("tr[id=discountTr]").show();
					$('div[id=data_' + key + ']').find("td[id=DiscountAmnt]").html(crprintlist.deliveryDiscount);
				} else
					$('div[id=data_' + key + ']').find("tr[id=discountTr]").hide();
				
				if(crprintlist.wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
					$('div[id=data_' + key + ']').find('td[id=grandTotal]').html(crprintlist.grandTotal);
					$('div[id=data_' + key + ']').find('span[id=grandTotal]').html(crprintlist.grandTotal);
					
					if(crprintlist.grandTotal == '' || crprintlist.grandTotal == null)
						$('div[id=data_' + key + ']').find('[id=grandTotalInWord]').html("Zero");
					else
						$('div[id=data_' + key + ']').find('[id=grandTotalInWord]').html(convertNumberToWord(crprintlist.grandTotal));
					
					$('div[id=data_' + key + ']').find('td[id=freightCharge]').html(bookingChargesSum);
					$('div[id=data_' + key + ']').find('span[id=freightCharge]').html(bookingChargesSum);
				} else {
					$('div[id=data_' + key + ']').find('td[id=grandTotal]').html(deliverySumCharges);
					
					if(deliverySumCharges == '' || deliverySumCharges == null)
						$('div[id=data_' + key + ']').find('[id=grandTotalInWord]').html("Zero");
					else
						$('div[id=data_' + key + ']').find('[id=grandTotalInWord]').html(convertNumberToWord(deliverySumCharges));
					
					$('div[id=data_' + key + ']').find('td[id=freightCharge]').html(0);
					$('div[id=data_' + key + ']').find('span[id=freightCharge]').html(0);
				}
				
				if(crprintlist.wayBillTypeId == WAYBILL_TYPE_PAID || crprintlist.wayBillTypeId == WAYBILL_TYPE_CREDIT || crprintlist.wayBillTypeId== WAYBILL_TYPE_FOC) {
					$('div[id=data_' + key + ']').find('[id=bookingTotalnew]').html(0);
					$('div[id=data_' + key + ']').find('[id=grandTotal1]').html(deliverySumCharges - crprintlist.deliveryDiscount);
				} else {
					$('div[id=data_' + key + ']').find('[id=bookingTotalnew]').html(bookingChargesSum);
					$('div[id=data_' + key + ']').find('[id=grandTotal1]').html(crprintlist.grandTotal);
				}
				
				if(crprintlist.wayBillTypeId == WAYBILL_TYPE_PAID
						|| (crprintlist.wayBillTypeId == WAYBILL_TYPE_CREDIT
						&& crprintlist.paymentType != PAYMENT_TYPE_BILL_CREDIT_ID))
					$('div[id=data_' + key + ']').find('[id=totalAmountOfBooking]').html(0);
				else
					$('div[id=data_' + key + ']').find('[id=totalAmountOfBooking]').html(bookingChargesSum);
				
				$('div[id=data_' + key + ']').find('td[id=remark]').html(crprintlist.remark);
				$('div[id=data_' + key + ']').find('[id=remark]').html(crprintlist.remark);
				$('div[id=data_' + key + ']').find('td[id=userName]').html(crprintlistData.executiveName);
				$('div[id=data_' + key + ']').find('td[id=printTime]').html(crprintlistData.currentDate + " " + crprintlistData.currentTime);
				$('div[id=data_' + key + ']').find('td[id=actualWeight]').html(crprintlist.actualWeight);
				$('div[id=data_' + key + ']').find('span[id=userName]').html(crprintlistData.executiveName);
				$('div[id=data_' + key + ']').find('span[id=printTime]').html(crprintlistData.currentDate + " " + crprintlistData.currentTime);
				$('div[id=data_' + key + ']').find('span[id=actualWeight]').html(crprintlist.actualWeight);	
				$('div[id=data_' + key + ']').find('td[id=deliveryPersonName]').html(crprintlist.deliveredToPersonName);
				$('div[id=data_' + key + ']').find('td[id=vehicleNumber]').html(crprintlist.ddmVehicleNumber);
				$('div[id=data_' + key + ']').find('td[id=deliveryAt]').html(crprintlist.deliveryStr);
				$('div[id=data_' + key + ']').find('td[id=deliveredToPersonMobileNumber]').html(crprintlist.deliveredToPersonMobileNumber);
				$('div[id=data_' + key + ']').find('span[id=deliveryPersonName]').html(crprintlist.deliveredToPersonName);
				$('div[id=data_' + key + ']').find('span[id=vehicleNumber]').html(crprintlist.ddmVehicleNumber);
				$('div[id=data_' + key + ']').find('span[id=deliveryAt]').html(crprintlist.deliveryStr);
				$('div[id=data_' + key + ']').find('span[id=deliveredToPersonMobileNumber]').html(crprintlist.deliveredToPersonMobileNumber);
				$('div[id=data_' + key + ']').find('span[id=pkgNameWithQtyno]').html(crprintlist.quantity + ' ' + crprintlist.packingTypeMasterName);
				$('div[id=data_' + key + ']').find('span[id=saidToContain]').html(crprintlist.saidToContain);
								
				if(crprintlist.wayBillTypeId == WAYBILL_TYPE_PAID){
						$('div[id=data_' + key + ']').find('[id=payerName]').html(crprintlist.consignerName);
						$('div[id=data_' + key + ']').find('[id=TotalPaidTbbLabel]').html('PAID');

						
				} else if(crprintlist.wayBillTypeId == WAYBILL_TYPE_TO_PAY){
						$('div[id=data_' + key + ']').find('[id=payerName]').html(crprintlist.consigneeName);
						$('div[id=data_' + key + ']').find('[id=TotalPaidTbbLabel]').html(bookingChargesSum);
	
				} else if(crprintlist.wayBillTypeId == WAYBILL_TYPE_CREDIT){
						$('div[id=data_' + key + ']').find('[id=payerName]').html(crprintlist.corporateAccountName);
						$('div[id=data_' + key + ']').find('[id=TotalPaidTbbLabel]').html('TBB');

				}
			}
		}, setDeliveryCharges : function(deliveryChargesHM, key) {
			let deliveryCharges		= deliveryChargesHM.wayBillDlyCharges;
			
			if(deliveryCharges != null){
				for(const element of deliveryCharges){
					let chargeName			= element.chargeTypeMasterName;
					let chargeAmount		= element.wayBillDeliverychargeAmount;
					let tableRow			= createRowInTable(''+chargeName+'', '', '');
					let chargeNameCol		= createColumnInRow(tableRow, '', '', '', '', '', '');
					let chargeAmountCol		= createColumnInRow(tableRow, '', 'padding-left textAlignRight', '', '', '', '');
					
					appendValueInTableCol(chargeNameCol, chargeName);
					appendValueInTableCol(chargeAmountCol, chargeAmount);
					
					$('div[id=data_' + key + ']').find('table[id=deliveryCharges]').append(tableRow);
					
					
				
			}}
		}, setDeliveryChargesWithoutChargeName : function(deliveryChargesHM, key) {
			let deliveryCharges		= deliveryChargesHM.wayBillDlyCharges;
			
			if(deliveryCharges != null) {
				for(const element of deliveryCharges) {
					let chargeName			= element.chargeTypeMasterName;
					let chargeAmount		= element.wayBillDeliverychargeAmount;
					let tableRow			= createRowInTable(''+chargeName+'', '', '');
					let chargeNameCol		= createColumnInRow(tableRow, '', '', '', '', '', '');
					let chargeAmountCol		= createColumnInRow(tableRow, '', '', '', '', '', '');
					appendValueInTableCol(chargeNameCol, '');
					appendValueInTableCol(chargeAmountCol, chargeAmount);
					$('div[id=data_' + key + ']').find('table[id=deliveryChargesWithoutChargeName]').append(tableRow);
				}
			}
		}, setPackingTypeNameWithQuantity:function(responseOut,key){
			let consignmentArr 				= responseOut.consignmentMap;		 
			let article = null;
			let packing = '';
			let saidToContain = '';
			
			for(let index = 0; index < consignmentArr.length;index++){
				if(article != null)	  
					article = article + consignmentArr[index].quantity + " " + consignmentArr[index].packingTypeName;
				else
					article = consignmentArr[index].quantity + " " + consignmentArr[index].packingTypeName;		  

				packing 		= packing + consignmentArr[index].packingTypeName;
				saidToContain 	= saidToContain + consignmentArr[index].saidToContain;
				
				if(index < consignmentArr.length - 1) {
					article 		= article + ", ";
					packing 		= packing + ", ";
					saidToContain 	= saidToContain + ", ";
				}
			}
			
			$('div[id=data_' + key + ']').find('[id=pkgNameWithQty]').html("( " +article+" )");
			$('div[id=data_' + key + ']').find('[id=pkgNameWithQtynoBrace]').html(article);
			$('div[id=data_' + key + ']').find('[id=QtyWithpkgName]').html("("+packing+")");
			$('div[id=data_' + key + ']').find('[id=saidtocontainlist]').html(saidToContain);
		}, setConsignment : function(deliveryChargesHM, key) {
			let consignmentArr	= deliveryChargesHM.consignmentMap;
			
			if(consignmentArr != null){
				for(const element of consignmentArr) {
					let consignmentQuantity			= element.quantity;
					let consignmentPackingType		= element.packingTypeName;
					let consignmentSaidToContain	= element.saidToContain;
					let tableRow					= createRowInTable(''+consignmentQuantity+'','','');
					let consignmentQuantityCol		= createColumnInRow(tableRow, '', '', '', '', '', '')
					let consignmentPackingTypeCol	= createColumnInRow(tableRow, '', '', '', '', '', '');
					let consignmentSeperatorCol		= createColumnInRow(tableRow, '', '', '', '', '', '');
					let consignmentSaidToContainCol	= createColumnInRow(tableRow, '', '', '', '', '', '');
					appendValueInTableCol(consignmentQuantityCol, consignmentQuantity);
					appendValueInTableCol(consignmentPackingTypeCol, consignmentPackingType);
					appendValueInTableCol(consignmentSeperatorCol, 'Of');
					appendValueInTableCol(consignmentSaidToContainCol, consignmentSaidToContain);
					$('div[id=data_' + key + ']').find('table[id=consignment]').append(tableRow);
				}
			}
		}, setDeliveryChargesStatic : function(deliveryChargesHM, key) {
			let DeliveryCharge	= deliveryChargesHM.wayBillDlyCharges;
			
			for(let index in DeliveryCharge){
				$('div[id=data_' + key + ']').find("*[data-selector='chargeName"+DeliveryCharge[index].wayBillChargeMasterId+"']").html(DeliveryCharge[index].chargeTypeMasterName);
				$('div[id=data_' + key + ']').find("*[data-selector='chargeValue"+DeliveryCharge[index].wayBillChargeMasterId+"']").html(DeliveryCharge[index].wayBillDeliverychargeAmount);
			}
		}, setConsignmentStatic : function(responseOut, key) {
			let consignmentArr 				= responseOut.consignmentMap;
			let packingTypeCommaSep			= '';
			let countPackingType			= 0;
			
			for(let index in consignmentArr) {
				$('div[id=data_' + key + ']').find("*[data-consignmentquantityData='" + index + "']").html(consignmentArr[index].quantity);
				$('div[id=data_' + key + ']').find("*[data-consignmentpackingtypeData='" + index + "']").html(consignmentArr[index].packingTypeName);
				$('div[id=data_' + key + ']').find("*[data-consignmentsaidtocontainData='" + index + "']").html(consignmentArr[index].saidToContain);
				
				$('div[id=data_' + key + ']').find("*[data-consignmentseperatorData='" + index + "']").html("of");
				
				$('div[id=data_' + key + ']').find("*[data-selector='qty" + consignmentArr[index].consignmentDetailsId + "']").html(consignmentArr[index].quantity);
				$('div[id=data_' + key + ']').find("*[data-selector='packingtype" + consignmentArr[index].consignmentDetailsId + "']").html(consignmentArr[index].packingTypeName);
				$('div[id=data_' + key + ']').find("*[data-selector='saidToCOntain" + consignmentArr[index].consignmentDetailsId + "']").html(consignmentArr[index].saidToContain);
				
				if(countPackingType < consignmentArr.length-1)
					packingTypeCommaSep += consignmentArr[index].packingTypeName + ', ';
				else
					packingTypeCommaSep += consignmentArr[index].packingTypeName;
					
				++countPackingType;
			}
			
			$('div[id=data_' + key + ']').find('td[id=packingTypeCommaSep]').html(packingTypeCommaSep);
		}, setPaymentTypeDetails : function(crprintlist, key){
			
			var consolidateEWaybillNumber = crprintlist.consolidateEWaybillNumber;
			
			$('div[id=data_' + key + ']').find('[id=deliveryPaymentType]').html(crprintlist.paymentTypeString);
			
			
			if(consolidateEWaybillNumber != undefined && consolidateEWaybillNumber != null)
				$('div[id=data_' + key + ']').find('[id=consolidateEWaybillNumber]').html("Co E-Waybill No : " +consolidateEWaybillNumber);
			else
				$('div[id=data_' + key + ']').find('[id=consolidateEWaybillNumberBlank]').html("Co E-Waybill No : --  ");

		},printAfterDelay : function(){
			setTimeout(function() {
				let elementOpacity1 = document.getElementById('logo1');
				let elementOpacity2 = document.getElementById('logo2');
				if(elementOpacity1 != null && elementOpacity2 != null){
					let path = '/ivcargo/images/wmk/759.png';
					elementOpacity1.src = path;
					elementOpacity2.src = path;
				}
				window.print();
				window.close();
			}, 1000);
		}, setTaxDetails : function(wayBillTaxTxnHM, key) {
			if(wayBillTaxTxnHM != undefined && wayBillTaxTxnHM != null) {
				for (var key in wayBillTaxTxnHM) {
					if(key == SGST_MASTER_ID)
						$('div[id=data_' + key + ']').find('td[id=sgst]').html(Math.round(wayBillTaxTxnHM[key]));
					
					if(key == CGST_MASTER_ID)
						$('div[id=data_' + key + ']').find('td[id=cgst]').html(Math.round(wayBillTaxTxnHM[key]));
					
					if(key == IGST_MASTER_ID)
						$('div[id=data_' + key + ']').find('td[id=igst]').html(Math.round(wayBillTaxTxnHM[key]));
					
					if (key == SGST_MASTER_ID && Math.round(wayBillTaxTxnHM[key]) == 0)
						$(".sgstrow").hide();	
					
					if(key == CGST_MASTER_ID && Math.round(wayBillTaxTxnHM[key]) == 0)
						$(".cgstrow").hide();
					
					if(key == IGST_MASTER_ID && Math.round(wayBillTaxTxnHM[key]) == 0)
						$(".igstrow").hide();
				}
			} else {
				$(".sgstrow").hide();
				$(".cgstrow").hide();
				$(".igstrow").hide();
			}
		}
		
	});
});