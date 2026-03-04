var moduleId=0;
var	ModuleIdentifierConstant 	= null;
var PaymentTypeConstant			= null;
var pendingRechargeHM = null;
var wayBillId;
var TOKEN_KEY = null;
var	TOKEN_VALUE = null;
var generateNewTokenForDuplicateChecking = true;
define([ 'marionette'
	,'JsonUtility'
	,'messageUtility'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	,'jquerylingua'
	,'language'
	,'nodvalidation'
	,'focusnavigation'
	,'autocomplete'
	,'selectizewrapper'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'/ivcargo/resources/js/module/redirectAfterUpdate.js',
	],
	function(Marionette, JsonUtility, MessageUtility, UrlParameter, jquerylingua, language, NodValidation, FocusNavigation,AutoComplete,Selectizewrapper,Selection,FilePath) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(), _this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//initialize is the first function called on call new view()
			_this = this;
		}, render : function() {
			_this.getIntialData();
			return _this;
		}, getIntialData : function() {
			showLayer();
			jsonObject.generateNewTokenForDuplicateChecking = generateNewTokenForDuplicateChecking;
			getJSON(jsonObject, WEB_SERVICE_URL + '/rechargeRequestWS/getPendingRechargeRequestList.do?', _this.setIntialData, EXECUTE_WITHOUT_ERROR);
		}, setIntialData: function(response) {
			var baseHtml 	= new $.Deferred();
			
			var loadelement = new Array();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/rechargeapproval/rechargeApproval.html",
					function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				_this.setData(response);
				hideLayer();
				
			});
			
			return _this;
		}, setData : function(response) {
			var	pendingRechargeList		= response.pendingRechargeList;
			var	PaymentTypeConstant		= response.paymentTypeConstant;
			var totalGrandTotal			= 0;
			TOKEN_KEY					= response.TOKEN_KEY;
			TOKEN_VALUE					= response.TOKEN_VALUE;
			
			$('#pendingRechargeDetails thead').empty();
			$('#pendingRechargeDetails tbody').empty();
			$('#pendingRechargeDetails tfoot').empty();
				
			if(pendingRechargeList != undefined && pendingRechargeList.length > 0) {
				pendingRechargeHM = pendingRechargeList.reduce(function(map, obj) {
					map[obj.pendingRechargeRequestId] = obj;
					return map;
				}, {});
					
				var columnHeadSubArray			= new Array();
				var columnArray					= new Array();
	
				columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Sr No.</th>");
				columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Branch Name.</th>");
				columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Recharge Amt.</th>");
				columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Requested Date.</th>");
				columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Payment Mode</th>");
				columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Requested By.</th>");
				columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Status.</th>");
				columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Remark.</th>");
				columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Action.</th>");
					
				$('#pendingRechargeDetails thead').append('<tr id="reportDetailsTableHeader" class="text-success text-center">' + columnHeadSubArray.join(' ') + '</tr>');
					
				for(var i = 0; i < pendingRechargeList.length; i++) {
					var obj = pendingRechargeList[i];
							
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.branchName + "</td>");
					columnArray.push("<td><input type='text' id='rechargeAmount_" + obj.pendingRechargeRequestId + "' name='rechargeAmount' value='" + obj.rechargeAmount + "' maxlength='7' class='form-control' style='width: 120px; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.requestedDateTimeStr + "</td>");
						
					if(obj.paymentModeId != PaymentTypeConstant.PAYMENT_TYPE_CASH_ID)
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596' onclick='paymentTypeDetails(\""+obj.paymentType+"\",\""+obj.bankName+"\",\""+obj.accountNumber+"\",\""+obj.transactionNumber+"\",\""+obj.requestedDateTimeStr+"\");' >" + obj.paymentType + "</td>");
					else
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.paymentType + "</td>");
						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.requestedBy + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.statusStr + "</td>");
					
					if(obj.remark != undefined && obj.remark != null && obj.remark != "")
						columnArray.push("<td style='text-align: center; vertical-align: middle;max-width: 85px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;'><b style='font-size: 14px; color: #1d7596' onclick='showRemarkDetails(this,\""+obj.remark+"\");' >" +obj.remark+ "</td>");
					else
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + "--" + "</td>");
						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'><a href='#' class='btn btn-success' id='approve_" + obj.pendingRechargeRequestId + "' onclick='approveRechargeAmount("+obj.prepaidAmountId+", "+obj.pendingRechargeRequestId+", "+obj.rechargeAmount+", "+obj.paymentModeId+", "+obj.branchId+");' >Approve</a>&nbsp;<a href='#' class='btn btn-danger' onclick='rejectRechargeAmount("+obj.pendingRechargeRequestId+");'>Reject</a></td>");
						
					$('#pendingRechargeDetails tbody').append('<tr id="row_'+obj.pendingRechargeRequestId+'">' + columnArray.join(' ') + '</tr>');
					
					totalGrandTotal	= totalGrandTotal + obj.rechargeAmount;	
					columnArray = [];
				}
				
				var columnFootSubArray			= new Array();
				
				columnFootSubArray.push("<td style='text-align: center; vertical-align: middle;'><b>Total</b></td>");
				columnFootSubArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
				
				columnFootSubArray.push("<td style='text-align: right; vertical-align: middle; background-color: #E6E6FA;' id=pendingRechargeDetailsGrandTotal'>" + totalGrandTotal.toFixed(2) + "</td>");
				
				columnFootSubArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
				columnFootSubArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
				columnFootSubArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
				columnFootSubArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
				columnFootSubArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
				columnFootSubArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
				
				$('#pendingRechargeDetails tfoot').append('<tr id="reportDetailsTableFooter" class="text-success text-center">' + columnFootSubArray.join(' ') + '</tr>');	
				$('#prePaidAmountPaymentForEdit').removeClass('hide');
			} else {
				showMessage('info', 'No Record Found !');
			}
				
			hideLayer();
		}, subBranchWisePrepaidAmountResposne : function(response) {
			if(response.message != undefined) {
				$('#agentBranchPrepaidEle').val('');
				$('#rechargeAmountEle').val('');
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				$('#currentAmountEle').html(" ");
				return;
			}
		}
	});
});

function rejectRechargeAmount(pendingRechargeRequestId){
	showLayer();
	var jsonObject = new Object();

	jsonObject.pendingRechargeRequestId		 = pendingRechargeRequestId;
		
	if (confirm('Are you sure you want to reject ?')) {
		getJSON(jsonObject, WEB_SERVICE_URL+'/rechargeRequestWS/rejectRechargeRequest.do', rejectResponseStatus,EXECUTE_WITH_ERROR);
	} else {
		hideLayer();
	} 
}

function approveRechargeAmount(prepaidAmountId, pendingRechargeRequestId, rechargeAmount, paymentTypeId, branchId){
	var rechargeObj	= pendingRechargeHM[pendingRechargeRequestId];
			
			var bankName = rechargeObj.bankName;
			var paymentUniqueValue = 1;
			var wayBillNumber = null;
			var wayBillId	= 0;
			var bankNameId	= rechargeObj.bankId;
			var chequeNo 	= rechargeObj.transactionNumber;
			var chequeDate	= rechargeObj.instrumentDateStr;
			var amount		= rechargeAmount;
			var payerName	= null;
			var accountNo 	= null;
			var cardNo		= null;
			var referenceNo	= rechargeObj.transactionNumber;
			var mobileNo	= null;
			var accountNoId	= rechargeObj.bankAccountId;
			var payeeName	= null;
			var paymentType	= rechargeObj.paymentModeId;
			var chequeGivenTo	= null;
			var chequeGivenBy	= null;
			var upiId			= null;
			
			showLayer();
			var bindPaymentData		= paymentUniqueValue + '_' + wayBillNumber + '_' + wayBillId + '_' + bankNameId + '_' + chequeNo + '_' + chequeDate + '_' + amount + '_' + payerName + '_' + accountNo + '_' + cardNo + '_' + referenceNo + '_' + mobileNo + '_' + accountNoId + '_' + bankName + '_' + payeeName + '_' + paymentType + '_' + chequeGivenTo + '_' + chequeGivenBy + '_' + upiId;
			var jsonObject = new Object();

			jsonObject.filter					 = 2;
			jsonObject.prepaidAmountId			 = prepaidAmountId;
			jsonObject.amountToPay			 	 = rechargeAmount;
			jsonObject.paymentType			 	 = paymentTypeId;
			jsonObject.rechargeAmount 			 = rechargeAmount;
			jsonObject.operationType 			 = 2;
			jsonObject.agentBranchPrepaid		 = branchId;
			jsonObject.pendingRechargeRequestId	 = pendingRechargeRequestId;
			jsonObject["paymentValues"]			 = bindPaymentData;
			jsonObject['prepaidPaymentIdentifier']	= 1;
			
			if(generateNewTokenForDuplicateChecking){
				jsonObject.TOKEN_KEY				 = TOKEN_KEY;
				jsonObject.TOKEN_VALUE				 = TOKEN_VALUE;
				jsonObject.generateNewTokenForDuplicateChecking = generateNewTokenForDuplicateChecking;
			}
		
			if (confirm('Are you sure you want to Approve ?')) {
				getJSON(jsonObject, WEB_SERVICE_URL+'/BranchWisePrepaidAmountWS/updatePrepaidAmountByPrepaidAmountIdFromMaster.do', addBranchWisePrepaidAmountResposne,EXECUTE_WITH_ERROR);
			} else {
				hideLayer();
			} 
}

function addBranchWisePrepaidAmountResposne(response){
	TOKEN_KEY 	= response.TOKEN_KEY;
	TOKEN_VALUE = response.TOKEN_VALUE;
	
	if(response.message != undefined) {
		hideLayer();
		var errorMessage = response.message;
		showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
		return;
	}
	
	if(response.prepaidRechargeNumber != undefined){
		showMessage('success', 'Approval Created Successfully !');
		$('#row_'+response.pendingRechargeRequestId).remove();
		hideLayer();
	}
}

function rejectResponseStatus(response){
	 if(response.message != undefined) {
					hideLayer();
					var errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
					if(errorMessage.typeName ==  'success'){
						$('#row_'+response.pendingRechargeRequestId).remove();
						hideLayer();
					}
					return;
	}
}
function showRemarkDetails(obj,remark){

	$('#remarkDetails').empty();

	$("#remarkDetailsModal").modal({
		backdrop: 'static',
		keyboard: false
	});

	var columnArray		= new Array();

	columnArray.push("<td class='datatd' style='text-align: left; vertical-align: middle; font-size:12px;word-wrap: none;word-break: break-all;white-space: normal;max-width: 85px;'>" + remark + "</td>");

	$('#remarkDetails').append('<tr>' + columnArray.join(' ') + '</tr>');

	columnArray	= [];

}
function paymentTypeDetails(paymentType,bankName,accountNumber,transactionNumber,requestedDateTimeStr){


	$('#paymentDetails').empty();

	$("#paymentDetailsModal").modal({
		backdrop: 'static',
		keyboard: false
	});

	var columnArray		= new Array();

	if(paymentType != undefined && paymentType != null)
		columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + paymentType + "</td>");
	else
		columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>--</td>");

	if(bankName != undefined && bankName != null)
		columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + bankName + "</td>");
	else
		columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>--</td>");

	if(accountNumber != undefined && accountNumber != null)
		columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + accountNumber + "</td>");
	else
		columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>--</td>");

	if(transactionNumber != undefined && transactionNumber != null)
		columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + transactionNumber + "</td>");
	else
		columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>--</td>");

	if(requestedDateTimeStr != undefined && requestedDateTimeStr != null)
		columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + requestedDateTimeStr + "</td>");
	else
		columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>--</td>");

	$('#paymentDetails').append('<tr>' + columnArray.join(' ') + '</tr>');

	columnArray	= [];
}
