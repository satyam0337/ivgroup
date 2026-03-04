define([
	PROJECT_IVUIRESOURCES + '/resources/js/module/view/doorpickuploadingsheet/pendingLrForDoorPickupDispatch.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,'JsonUtility'
	,'messageUtility'
	,'autocomplete'
	,'autocompleteWrapper'
	,'slickGridWrapper3'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
],function(PendingLrForDoorPickup, UrlParameter){
	'use strict';
	let jsonObject = new Object()
	, myNod
	, _this = ''
	, doorPickupDispatchId
	, doorPickupLsNumber
	, doorPickupBranchId
	, PaymentVoucherSequenceNumber
	, count = 0;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj){
			_this = this;
			this.$el.html(this.template);
			doorPickupDispatchId 						= UrlParameter.getModuleNameFromParam(MASTERID);
			doorPickupLsNumber   						= UrlParameter.getModuleNameFromParam(MASTERID2);
			doorPickupBranchId							= UrlParameter.getModuleNameFromParam("branchId");
			PaymentVoucherSequenceNumber				= UrlParameter.getModuleNameFromParam("PaymentVoucherSequenceNumber");
			
			if(doorPickupDispatchId != null && doorPickupLsNumber != null && doorPickupBranchId != null) {
				let jsonInobj = new Object();
				jsonInobj.doorPickupLsNumber = doorPickupLsNumber;
				
				if(PaymentVoucherSequenceNumber != undefined && PaymentVoucherSequenceNumber != 'undefined')
					showMessage('success', 'Pickup LS ' + doorPickupLsNumber + ' created successfully ! Advance Voucher No : ' + PaymentVoucherSequenceNumber + ' !');
				else
					showMessage('success', 'Pickup LS ' + doorPickupLsNumber + ' created successfully !');
				
				_this.openPrint(doorPickupDispatchId);
			}
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/doorPickupDispatchWS/getDoorPickupDispatchElement.do?',_this.setElementDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setElementDetails : function(response){
			//focus navigation initiates through this function
			initialiseFocus();
			let loadelement = new Array();
			let baseHtml = new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/doorpickupls/doorPickupDispatch.html", function() {
				baseHtml.resolve();
				
				if(doorPickupDispatchId != null && doorPickupLsNumber != null) {
					$("#previousPickupNumber").html(doorPickupLsNumber);
					$("#previousDoorPickupDispatchDetails").removeClass("hide");
				}
					
				$( "#singleLREle" ).keydown(function(e) {
					if ($("#singleLREle").val() != '' && e.which == 13) {
						_this.searchLRByNumber();
					}
				});
				
				$.when.apply($, loadelement).done(function() {
					let keyObject = Object.keys(response);
					
					for (const element of keyObject) {
						if (response[element])
							$("*[data-attribute=" + element + "]").removeClass("hide");
					}

					myNod = nod();

					myNod.configure({
						parentClass:'validation-message'
					});

					hideLayer();
					
					if(response.message != undefined) {
						let errorMessage = response.message;
						$('#selection-div').html(errorMessage.description);
						return;
					}

					$("#findAllBtn").click(function() {
						myNod.performCheck();
						
						if(myNod.areAll('valid'))
							_this.setDataOnPopUp();							
					});

					$("#reprintBtn").click(function() {
						_this.openPrint(doorPickupDispatchId);
					});
					
					$("#settleBtn").click(function() {
						_this.openSettlementModule(doorPickupLsNumber, doorPickupBranchId);
					});
					
					if(response.divisionSelectionList != undefined) {
						$('#DivisionSelection').removeClass('hide');
						_this.setDivisionSelection(response);

						addAutocompleteElementInNode(myNod, 'divisionSelectionEle', 'Please Select Division Type !');
					} else
						$('#DivisionSelection').remove();
				});
			});
		}, searchLRByNumber : function() {
			showLayer();

			let jsonObject = new Object();

			jsonObject["wayBillNumber"] 	= $('#singleLREle').val();
			getJSON(jsonObject, WEB_SERVICE_URL+'/doorPickupDispatchWS/getLRDetailsForDispatchByWayBillNumber.do?', _this.checkData, EXECUTE_WITH_ERROR);
		}, checkData : function(response) {
			hideLayer();
			$( "#singleLREle" ).val("");
			
			if(response.message != undefined) {
				setTimeout(function(){$('#singleLREle').focus()}, 100);
				return;
			}

			if(response.allowMultiplePickupLs != undefined && response.allowMultiplePickupLs) {
				let finalJsonObj = new Object();
				finalJsonObj.waybillId 		= response.wayBill.wayBillId;
				finalJsonObj.wayBillNumber 	= response.wayBill.wayBillNumber;
				finalJsonObj.quantity	 	= response.wayBill.wayBillConsignmentQuantity;
				finalJsonObj.actualWeight 	= response.wayBill.wayBillActualWeight;
					
				let btModalConfirm = new Backbone.BootstrapModal({
					content		: 	"Pickup LS Already Created for Given LR Do You again want to create Pickup LS For Same LR ?",
					modalWidth 	: 	30,
					title		:	'Pickup Confirm',
					okText		:	'YES',
					showFooter 	: 	true,
					okCloses	:	true
				}).open();

				btModalConfirm.on('ok', function() {
					getJSON(finalJsonObj, WEB_SERVICE_URL+'/doorPickupDispatchWS/insertPendingDoorPickupWayBillForDispatch.do', _this.checkData, EXECUTE_WITH_ERROR); //submit JSON
					showLayer();
				});
					
				btModalConfirm.on('cancel', function() {
					$(".ok").removeClass('hide');
					hideLayer();
				});
			} else
				_this.setData(response);
		}, setData : function(response) {
			count	= count + 1;
			
			let pendingDispatch 	= new PendingLrForDoorPickup();
			let object 				= new Object();
			object.ColumnHead 		= _.values(response.columnConfiguration);
			object.data 			= _.values(response.CorporateAccount);
			object.count 			= count;

			pendingDispatch.lrNumberAppend(object);
			
			hideLayer();
			$('#singleLREle').focus();
		}, setDataOnPopUp : function() {
			let object = new Object();
			
			object.divisionId = $('#divisionSelectionEle_primary_key').val();
				
			let btModal = new Backbone.BootstrapModal({
				content		: new PendingLrForDoorPickup(object),
				modalWidth 	: 60,
				title		: 'Pending LRs For Dispatch',
				okText		: 'Add',
				showFooter 	: true
			}).open();
			object.btModal = btModal;
			new PendingLrForDoorPickup(object)
			btModal.open();
		},setDivisionSelection : function(response) {
			let divisionSelectionAutoComplete 				= new Object();
			divisionSelectionAutoComplete.url 				= response.divisionSelectionList;
			divisionSelectionAutoComplete.primary_key 		= 'divisionMasterId';
			divisionSelectionAutoComplete.field 			= 'name';
			$('#divisionSelectionEle').autocompleteCustom(divisionSelectionAutoComplete);
		}, openPrint : function(doorPickupDispatchId) {
			window.open('InterBranch.do?pageId=340&eventId=10&modulename=pickupLoadingSheetPrint&masterid='+doorPickupDispatchId+'&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}, openSettlementModule : function(doorPickupLsNumber, doorPickupBranchId) {
			window.open('Dispatch.do?pageId=340&eventId=1&modulename=pickupLorryHireSettlement&doorPickupLsNumber=' + doorPickupLsNumber + '&doorPickupBranchId=' + doorPickupBranchId);
		}
	});
});