var branchWisePrepaidAmountList = new Array();
var moduleId=0;
var	ModuleIdentifierConstant 	= null;
var PaymentTypeConstant			= null;
var wayBillId;
var bankPaymentOperationRequired = false;
var branchIdObj = {};
var negotiatePaymentStatusId   = 4;
var	prepaidAmountId	= 0;
var	currentAmount	= 0;
var rechargeNoMap   = {};
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
	,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
	],
	function(Marionette, JsonUtility, MessageUtility, UrlParameter, jquerylingua, language, NodValidation, FocusNavigation,AutoComplete,Selectizewrapper,FilePath) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	wayBillId,
	myNod,
	_this = '',
	redirectFilter = 0,
	prepaidAmountPendingPaymentDetailsId = 0
	var fromDate
	var toDate;
	var paymentTypeStatus = new Object;
	var isBranchSelectedFromDropDown = false;
	var paymentTypeArr = new Array(),
	myNod1,myNod2,myNod3
	var paymentStatusArrForSelection = new Array();
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			prepaidAmountPendingPaymentDetailsId = UrlParameter.getModuleNameFromParam("prepaidAmountPendingPaymentDetailsId")
			console.log("prepaidAmountPendingPaymentDetailsId:::",prepaidAmountPendingPaymentDetailsId);
			_this = this;
		},
		render : function() {
			_this.getIntialData();
			return _this;
		},
		getIntialData : function(){
			showLayer();
			jsonObject["prepaidAmountPendingPaymentDetailsId"]  = prepaidAmountPendingPaymentDetailsId
			getJSON(jsonObject, WEB_SERVICE_URL + '/PrepaidPendingPaymentAmtWS/getPrepaidRechargeStatusDetails.do?', _this.setIntialData, EXECUTE_WITHOUT_ERROR);
		},
		setIntialData: function(response) {
			var loadelement = new Array();
			var paymentHtml	= new $.Deferred();
			var baseHtml 	= new $.Deferred();
			var paymentHtml	= new $.Deferred();
			loadelement.push(baseHtml);
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/prepaidAmountPendingPaymentDetails/viewPrepaidRechargeStatusDetails.html",
					function() {
				baseHtml.resolve();
			});
				$.when.apply($, loadelement).done(function() {

					setTimeout(function(){
						hideLayer();
						if(response == null || response.prepaidAmountPendingPaymentDetailsList == null){
							showMessage('error', "No Records Found");
							return;
						}
						if(response.prepaidAmountPendingPaymentDetailsList.length == 0){
							$('#middle-border-boxshadow').addClass('hide');
							$('#bottom-border-boxshadow').addClass('hide');
							$('#top-border-boxshadow').addClass('hide');
							$('#left-border-boxshadow').addClass('hide');
							showMessage('error', "No Records Found");
							return;
						} else {
							$('#middle-border-boxshadow').removeClass('hide');
							$('#bottom-border-boxshadow').removeClass('hide');
							$('#top-border-boxshadow').removeClass('hide');
							$('#left-border-boxshadow').removeClass('hide');
						}
						console.log(response)
						console.log(response.prepaidAmountPendingPaymentDetailsList)
						var prepaidAmountPendingPaymentDetailsList = response.prepaidAmountPendingPaymentDetailsList;
						hideLayer();
						if (!response || jQuery.isEmptyObject(response)) {
							showMessage('error', "System error"); // show message to show system processing error massage on top of the window.
							hideLayer();
						} else {
							if(response.Message!=null)
							{
								hideLayer();
								showMessage('success',response.Message);
							}else{
								hideLayer();
							}
						} 
						$('#statusDetailsTable thead').empty();
						$('#statusDetailsTable tbody').empty();
						$('#statusDetailsTable tfoot').empty();

						var columnHeadArray				= new Array();
						var columnHeadSubArray			= new Array();
						var columnArray					= new Array();
						var	key							= null;

						columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Sr No.</th>");
						columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Branch Name.</th>");
						columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Recharge Amt.</th>");
						columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Received Amt.</th>");
						columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Payment Mode.</th>");
						columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Date.</th>");
						columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Remark.</th>");
						

						$('#statusDetailsTable thead').append('<tr id="statusDetailsTableHeader" class="text-success text-center">' + columnHeadSubArray.join(' ') + '</tr>');
						if(prepaidAmountPendingPaymentDetailsList!=null && prepaidAmountPendingPaymentDetailsList.length > 0){
							for(var i = 0;i<prepaidAmountPendingPaymentDetailsList.length;i++){
								var obj = prepaidAmountPendingPaymentDetailsList[i];
								console.log("::::12:11:::::",obj.remark)
								var remark = "";
								if(obj.remark != 'undefined' && obj.remark != undefined && obj.remark != null){
									remark = obj.remark;
								}
								columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i+1) + "</td>");
								columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.branchName + "</td>");
								columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.grandtotal + "</td>");
								columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.receivedAmount + "</td>");
								columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.paymentTypeName + "</td>");
								columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.receivedDateTimeStr + "</td>");
								columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + remark+ "</td>");
								$('#statusDetailsTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');

								columnArray = [];
							}
							$('#middle-border-boxshadow').removeClass('hide');
							$('#bottom-border-boxshadow').removeClass('hide');
							$('#left-border-boxshadow').removeClass('hide');
						}
					},500);	
				}).fail(function() {
					$("#viewAddedPaymentDetailsCreate").css("display", "block");
				});
			
		},
	});
});
