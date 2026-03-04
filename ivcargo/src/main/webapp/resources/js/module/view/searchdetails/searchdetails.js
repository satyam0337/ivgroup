var myRouter	= null;

define([
	'marionette'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	,'selectizewrapper'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'//PopulateAutocomplete
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/searchdetails/searchdetailsbehavior.js'//PopulateAutocomplete
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,'validation'
	,'autocompleteWrapper'
	,'focusnavigation'
	], function(Marionette, UrlParameter, Selectizewrapper, Selection, SearchDetails) {
	'use strict'; 
	let myNod, wayBillId, wayBillNumber = null, _this = '', typeOfNumber = 0, branchId = 0,isCRMPage =false;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			wayBillId 		= UrlParameter.getModuleNameFromParam(MASTERID);
			wayBillNumber 	= UrlParameter.getModuleNameFromParam('wayBillNumber');
			branchId 		= UrlParameter.getModuleNameFromParam('branchId');
			typeOfNumber 	= UrlParameter.getModuleNameFromParam("TypeOfNumber");
			isCRMPage 		= UrlParameter.getModuleNameFromParam("isCRMPage");

			this.$el.html(this.template);
		}, render : function() {
			let jsonObject = new Object();
			jsonObject.sourceBranchId	= branchId;
			
			if(isCRMPage != null && isCRMPage != undefined && isCRMPage == 'true') {
				jsonObject.isCRMPage = true;
				getJSON(jsonObject, CUSTOMER_ACCESS_URL_CONSTANT + '/searchWS/getSearchElementConfiguration.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);
			} else	
				getJSON(jsonObject, WEB_SERVICE_URL + '/searchWS/getSearchElementConfiguration.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);
			
			return _this;
		}, setElements: function(response) {
			let loadelement 	= new Array();
			let baseHtml 		= new $.Deferred();
			loadelement.push(baseHtml);
		
			$("#mainContent").load("/ivcargo/html/module/searchdetails/searchdetails.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				if(isCRMPage != null && isCRMPage != undefined && isCRMPage == 'true') {
					//no need
				} else
					_this.setCreateData(response);
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.selectionArr,
					valueField		:	'searchTypeId',
					labelField		:	'searchTypeName',
					searchField		:	'searchTypeName',
					elementId		:	'typeEle',
					create			: 	false,
					onChange		:	_this.displayOtherFeildOnChange,
					maxItems		: 	1
				});
				
				if(wayBillId > 0) {
					$('#numberEle').val(wayBillNumber);
					$('#typeEle').val(typeOfNumber);
					$('#branchEle').val(branchId);
					_this.displayOtherFeildOnType(typeOfNumber);
					_this.setSeletectedValues('typeEle', typeOfNumber);
					
					setTimeout(function() {
						_this.setSeletectedValues('branchEle', branchId);
					}, 200);
					
					if(isCRMPage != null && isCRMPage != undefined && isCRMPage == 'true')
						$('#top-border-boxshadow').addClass('hide');
					
					setTimeout(function() {
						_this.getDetails();
					}, 100);
				}
				
				hideLayer();
			});
		}, setCreateData : function(response) {
			let elementConfiguration	= new Object();
			
			response.agentBranchSelection			= true;//all active group branch selection with selectize
			response.vehicleSelectionWithSelectize	= true;
			
			elementConfiguration.branchElement		= $('#branchEle');
			
			response.elementConfiguration			= elementConfiguration;
			
			Selection.setSelectionToGetData(response);
			
			addElementToCheckEmptyInNode(myNod, 'numberEle', 'Enter Number !');
			addAutocompleteElementInNode1(myNod, 'typeEle', 'Select Valid Type !');
		
			myNod.add({
				selector: '#numberEle',
				validate: 'alphaNumericWithFwdAndBwdSlash',
				errorMessage: 'Enter Number !'
			});
			
			$("#searchBtn").click(function() {
				myNod.performCheck();
				
				wayBillNumber	= null;
				wayBillId		= 0;
				typeOfNumber	= 0;
				
				if(myNod.areAll('valid'))
					_this.getDetails();
			});
			
			$("#numberEle").keyup(function() {
				_this.hideAndDelete();
			});
		}, hideAndDelete : function() {
			$('#LRSearchBasicDetailsDiv').empty();
			$('#middle-border-boxshadow').addClass('hide');
			$('#bottom-border-boxshadow').addClass('hide');
		}, setSeletectedValues : function(id, value) {
			let $select = $('#' + id).selectize();
			let control = $select[0].selectize;
			
			if(control != undefined && value != undefined)
				control.setValue(value);
		}, displayOtherFeildOnChange : function() {
			$('#typeEle').change(function() {
				_this.hideAndDelete();
				_this.displayOtherFeildOnType($('#typeEle').val());
			});
		}, displayOtherFeildOnType : function(searchTypeId) {
			if(searchTypeId == SEARCH_TYPE_ID_TUR
					|| searchTypeId == SEARCH_TYPE_ID_CR
					|| searchTypeId == SEARCH_TYPE_ID_CREDITOR_INVOICE
					|| searchTypeId == SEARCH_TYPE_ID_PAYMENT_VOUCHER
					|| searchTypeId == SEARCH_TYPE_ID_RECEIPT_VOUCHER
					|| searchTypeId == SEARCH_TYPE_ID_BLHPV
					|| searchTypeId == SEARCH_TYPE_ID_CROSSING_AGENT_INVOICE
					|| searchTypeId == SEARCH_TYPE_ID_DOOR_DELIVERY_MEMO
					|| searchTypeId == SEARCH_TYPE_ID_LORRY_HIRE_NUMBER
					|| searchTypeId == SEARCH_TYPE_ID_PUMP_RECEIPT_NUMBER
					|| searchTypeId == SEARCH_TYPE_ID_MR
					|| searchTypeId == SEARCH_TYPE_BILL_COVERING_LETTER
					|| searchTypeId == SEARCH_TYPE_ID_MATHADI_NUMBER
					|| searchTypeId == SEARCH_TYPE_ID_PENDING_LS_BILL_NUMBER
					|| searchTypeId == SEARCH_TYPE_PICK_UP_LS

					) {
				$('#branchDiv').removeClass('hide');
				$('#vehicleNumberDiv').addClass('hide');
			} else if(searchTypeId == SEARCH_TYPE_ID_TRUCK_HISAB_VOUCHER_NUMBER
					|| searchTypeId == SEARCH_TYPE_ID_FUEL_HISAB_VOUCHER_NUMBER) {
				$('#vehicleNumberDiv').removeClass('hide');
				$('#branchDiv').addClass('hide');
			} else {
				$('#branchDiv').addClass('hide');
				$('#vehicleNumberDiv').addClass('hide');
			}
		}, getDetails : function () {
			let jsonObject	= new Object();
			
			jsonObject.number					= $('#numberEle').val();
			jsonObject.id						= wayBillId;
			jsonObject.vehicleNumberMasterId	= $('#vehicleNumberEle').val();
			jsonObject.branchId					= $('#branchEle').val();
			
			if(typeOfNumber != null && typeOfNumber != undefined && typeOfNumber > 0)
				jsonObject.typeOfNumber			= typeOfNumber;
			else
				jsonObject.typeOfNumber			= $('#typeEle').val();
			
			showLayer();
		
			if(isCRMPage != null && isCRMPage != undefined && isCRMPage == 'true') {
				jsonObject.isCRMPage = true;
				getJSON(jsonObject, CUSTOMER_ACCESS_URL_CONSTANT+'/searchWS/getSearchDetailsByNumber.do', _this.setForEdit, EXECUTE_WITH_NEW_ERROR);
			} else
				getJSON(jsonObject, WEB_SERVICE_URL+'/searchWS/getSearchDetailsByNumber.do', _this.setForEdit, EXECUTE_WITH_NEW_ERROR);
		}, setForEdit : function (response) {
			$('#LRSearchBasicDetailsDiv').empty();
			
			if (response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}
			
			myRouter = new Marionette.AppRouter({});
			
			$('#middle-border-boxshadow').removeClass('hide');
			goToPosition('middle-border-boxshadow', 'slow');
			
			if(response.tripHisabSettlementList != undefined)
				SearchDetails.getDataForTripHisabSettlementDetails(response);
			else if(response.bulkLRRateUpdateRequest != undefined)
				SearchDetails.getBulkLRRateUpdateDetails(response);
			else if(response.truckHisabVoucherList != undefined)
				SearchDetails.getTruckHisabVoucherDetails(response);
			else if(response.fuelHisabVoucherList != undefined)
				SearchDetails.getTruckHisabVoucherDetails(response);
			else if(response.billCoveringLetterList != undefined)
				SearchDetails.getBillCoveringLetterDetails(response);
			else if(response.wayBillCrossingLrList != undefined)
				SearchDetails.getWayBillCrossingLrDetails(response);
			else if(response.transferLedger != undefined)
				SearchDetails.setTransferLedgerDetails(response.transferLedger);
			else if(response.transferReceiveLedger != undefined)
				SearchDetails.setTransferReceiveLedgerDetails(response.transferReceiveLedger);
			else if(response.vehicleConfigHamaliList != undefined)
				SearchDetails.setVehicleConfigHamaliDetails(response);
			else if(response.pickupDetailList != undefined)
				SearchDetails.setPickupDetailList(response);
			else if(response.PendingLSPaymentBill != undefined)
				SearchDetails.setPendingLSPaymentBillDetails(response);
			else if(response.billDetailsList != undefined)
				SearchDetails.setCreditorInvoiceDetailList(response, isCRMPage);
			else if(response.doorPickupLedgerList != undefined)
				SearchDetails.setDoorPickupLedgerDetails(response);
		}
	});
});