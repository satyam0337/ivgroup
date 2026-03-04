var billCoveringLetterId;
define([ 'marionette'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	,'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,'focusnavigation'
	],
	function(Marionette, UrlParameter, slickGridWrapper2, Selection) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	myNod,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			//initialize is the first function called on call new view()
			_this = this;
			billCoveringLetterId 				= UrlParameter.getModuleNameFromParam('billCoveringLetterId');
		}, render: function() {
			jsonObject	= new Object();

			jsonObject.billCoveringLetterId	= billCoveringLetterId;

			getJSON(jsonObject, WEB_SERVICE_URL + '/creditorInvoiceWS/getBillCoveringLetterDetailsById.do?', _this.setBillCoveringLetterDetails, EXECUTE_WITHOUT_ERROR);
		}, setBillCoveringLetterDetails : function(response) {
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/creditorInvoice/EditBillCoveringLetter.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				if(response.message != undefined) {
					var errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					hideLayer();

					setTimeout(() => {
						window.close();
					}, 1000);

					return;
				}
				
				$('#bottom-border-boxshadow').removeClass('hide');
				
				response.executiveTypeWiseBranch		= true;
				
				let elementConfiguration	= new Object();
						
				elementConfiguration.branchElement		= $('#branchEle');
				response.elementConfiguration			= elementConfiguration;
						
				Selection.setSelectionToGetData(response);

				response.Language		= {};

				hideLayer();
				slickGridWrapper2.setGrid(response);

				_this.addBills(response);

				$("#cancelBtn").click(function() {
					_this.cancelBillCoverLetter(response);								
				});
			});
		}, cancelBillCoverLetter : function(response) {
			var billDetails								= response.CorporateAccount;
			var jsonObject 								= new Object();
			jsonObject["billCoveringLetterId"] 			= billCoveringLetterId;
			jsonObject["BillDetails"] 					= billDetails;
			
			for(var b = 0; b < billDetails.length; b++) {
				let billStatus	= billDetails[b].billStatus;
				
				if(billStatus != BILL_CLEARANCE_STATUS_DUE_PAYMENT_ID) {
					showMessage('info', 'Cancellation not allowed, as payment is taken for some of the Bills.');
					return;
				}
			}
	
			if (confirm('Are you sure you want to cancel Bill Cover Letter?'))
				getJSON(jsonObject, WEB_SERVICE_URL+'/creditorInvoiceWS/cancelBillCoverLetter.do', reloadAfterCancel, EXECUTE_WITH_ERROR);
		}, addBills : function(response) {
			$('#top-border-boxshadow').removeClass('hide');

			myNod = nod();
			myNod.configure({
				parentClass:'validation-message'
			});

			myNod.add({
				selector		: '#billNoEle',
				validate		: ['presence'],
				errorMessage	: ['Please Enter a Bill No!']
			});

			myNod.add({
				selector		: '#branchEle',
				validate		: ['validateAutocomplete:#branchEle'],
				errorMessage	: ['Select proper Branch !']
			});

			hideLayer();
			
			$("#saveBtn").click(function() {
				myNod.performCheck();

				if(myNod.areAll('valid'))
					_this.getBillDetails(response);								
			});
		}, getBillDetails : function (response) {
			var jsonObject = new Object();

			jsonObject["billNumber"] 					= $('#billNoEle').val();
			jsonObject["branchId"] 						= $('#branchEle').val();
			jsonObject["billCoveringLetterId"] 			= response.CorporateAccount[0].billCoverLetterId;
			jsonObject["billCreditorId"] 				= response.CorporateAccount[0].billCreditorId;
			
			showLayer();

			getJSON(jsonObject, WEB_SERVICE_URL+'/creditorInvoiceWS/getBillDetailsToShow.do',_this.setBillDetails, EXECUTE_WITH_ERROR);
		}, setBillDetails : function (response){
			hideLayer();
			
			if(response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}

			$('#left-border-boxshadow').removeClass('hide');
			$('#billDetails').empty();

			var BillDetailsModel	= response.BillDetailsModel;

			var columnArray			= new Array();

			var obj1				= BillDetailsModel;
			
			for(var i = 0; i < obj1.length; i++){
				var obj = obj1[i];
				
				columnArray.push("<td><input  type='checkbox' id='singleCheckBox" + obj.billBillId + "' name='singleCheckBox' class='form-control singleCheckBox' value='" + obj.billBillId + "'/></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='billId_" + obj.billBillId + "' name='billId_" + obj.billBillId + "' value='"+ obj.billBillNumber +"'>" + (obj.billBillNumber) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='creditorId_" + obj.billBillId + "' name='creditorId_" + obj.billBillId + "' value='"+ obj.billCreditorName +"'>" + (obj.billCreditorName) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='billTotalId_" + obj.billBillId + "' name='billTotalId_" + obj.billBillId + "' value='"+ obj.billGrandTotal +"'>" + (obj.billGrandTotal) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='dateTimeId_" + obj.billBillId + "' name='dateTimeId_" + obj.billBillId + "' value='"+ obj.billCreationDateString +"'>" + (obj.billCreationDateString) + "</td>");
				$('#reportTable tbody').append('<tr id="billDetails_'+ obj.billBillId +'">' + columnArray.join(' ') + '</tr>');
			}
			
			$("#addBill").bind("click", function() {
				_this.addBillsToBillCover(obj);
			});

			columnArray	= [];
		}, addBillsToBillCover : function (){
			var checkBoxArray	= new Array();
			
			$.each($("input[name=singleCheckBox]:checked"), function(){
				checkBoxArray.push($(this).val());
			});
			
			if(checkBoxArray.length == 0){
				showMessage('error', 'Please Select At least One Bill !');
				hideLayer();
				return;
			}
			
			if (confirm('Are you sure you want to Add Bill?')) {
				showLayer();
				var jsonObject = new Object();
				jsonObject["billIds"]						= checkBoxArray.join(',');
				jsonObject["billCoveringLetterId"] 			= billCoveringLetterId;
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/creditorInvoiceWS/addBillToBillCoverLetter.do', reloadAfterResponse, EXECUTE_WITH_ERROR);
			}
		}
	});
});

function removeBillsFromBillCover(grid, dataView, row) {
	var totalBillInBillCover 					= Number(grid.getDataLength());
	var billStatus								= Number(dataView.getItem(row).billStatus);
	var jsonObject 								= new Object();

	jsonObject["billCoveringLetterId"] 			= dataView.getItem(row).billCoverLetterId;
	jsonObject["branchId"] 						= dataView.getItem(row).billBranchId;
	jsonObject["billId"] 						= dataView.getItem(row).billId;
	
	if(billStatus != BILL_CLEARANCE_STATUS_DUE_PAYMENT_ID) {
		if(billStatus == BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID)
			showMessage('info', 'Cannot Remove Bill whose payment is cleared.');
		else if (billStatus == BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID)
			showMessage('info', 'Cannot Remove Bill whose payment is partially taken.');
		else if (billStatus == BILL_CLEARANCE_STATUS_NEGOTIATED_ID)
			showMessage('info', 'Cannot Remove Bill whose payment is negotiated and cleared.');
		else
			showMessage('info', 'Cannot Remove Bill which is cancelled.');
	} else if(totalBillInBillCover == 1) {
		if (confirm('Removing the last bill from the Cover Letter will' +'\n'+ 'automatically cancel it.')) {
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL+'/creditorInvoiceWS/cancelBillCoverLetter.do', reloadAfterCancel, EXECUTE_WITH_ERROR);
		}
	} else if (confirm('Are you sure you want to remove Bill?'))
		getJSON(jsonObject, WEB_SERVICE_URL+'/creditorInvoiceWS/removeBillFromBillCoverLetter.do', reloadAfterResponse, EXECUTE_WITH_ERROR);
}

function reloadAfterResponse(){
	setTimeout(function(){ location.reload(); }, 200);
	hideLayer();
}

function reloadAfterCancel(response){
	if(response.message != undefined) {
		var errorMessage = response.message;
		showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
		hideLayer();
		window.opener.setValueForParentWindow(true);
		setTimeout(() => {
			window.close();
		}, 200);
		return;
	}
}

function selectAllBill(param){
	$(".singleCheckBox").prop('checked', param)
}