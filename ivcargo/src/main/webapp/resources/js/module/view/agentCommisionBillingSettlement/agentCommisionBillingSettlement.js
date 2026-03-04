var PaymentTypeConstant = null
,ModuleIdentifierConstant = null
,GeneralConfiguration   = null
,moduleId= 0
,differentPaymentInMultiplePayment 	= true
,configObj = null; 
define([  
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,'JsonUtility'
	,'messageUtility'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
	],function(UrlParameter) {
	'use strict';
	var jsonObject = new Object()
	, myNod
	,  _this = ''
		, agentCommissionBillingSummaryId
		,agentcommidlist
		,paymentStatusArrForSelection
		,bankPaymentOperationRequired = false
		,doneTheStuff = false, paymentTypeArr = null;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			this.$el.html(this.template);
			
			agentCommissionBillingSummaryId 		= UrlParameter.getModuleNameFromParam(MASTERID);

			if(agentCommissionBillingSummaryId !=null){
				showMessage('success',' Agent commission settlement done successfully !');
			}
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/agentCommissionBillingSettlementWS/getAgentCommissionBillingSettlementElement.do?',_this.setElementDetails,	EXECUTE_WITH_ERROR);
			return _this;
		},setElementDetails : function(response){
			//focus navigation initiates through this function
			initialiseFocus();
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			var paymentHtml = new $.Deferred();
			
			configObj = response;
			
			PaymentTypeConstant				= response.PaymentTypeConstant;
			ModuleIdentifierConstant		= response.ModuleIdentifierConstant;
			moduleId						= response.moduleId;
			GeneralConfiguration			= response.GeneralConfiguration
			bankPaymentOperationRequired	= GeneralConfiguration.BankPaymentOperationRequired;
			paymentStatusArrForSelection	= response.paymentStatusArrForSelection;
			paymentTypeArr					= response.paymentTypeArr;
			
			loadelement.push(baseHtml);
			
			if(bankPaymentOperationRequired)
				loadelement.push(paymentHtml);

			$("#mainContent").load("/ivcargo/html/module/agentCommisionBillingSettlement/agentCommisionBillingSettlement.html",function() {
				baseHtml.resolve();
			});
			
			if(bankPaymentOperationRequired) {
				$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html",
					function() {
						paymentHtml.resolve();
				});
			}

			$.when.apply($, loadelement).done(function() {
				$( "#agentCommissionNumberEle" ).keydown(function(e) {
					if (e.which == 13) {
						_this.searchDetailsByAgentCommissionNumber();
					}
				});
				
				if(bankPaymentOperationRequired) {
					$("#viewAddedPaymentDetails").click(function() {
						openAddedPaymentTypeModel();
					});
							
					setIssueBankAutocomplete();
					setAccountNoAutocomplete();
				}
				
				hideLayer();
			});
		},searchDetailsByAgentCommissionNumber:function(){
			myNod = nod();

			myNod.configure({
				parentClass:'validation-message'
			});

			myNod.add({
				selector: '#agentCommissionNumberEle',
				validate: 'presence',
				errorMessage: 'Enter Agent Commission Number !'
			});
			myNod.add({
				selector: '#agentCommissionNumberEle',
				validate: 'integer',
				errorMessage: 'Enter Valid Agent Commission Number !'
			});

			myNod.performCheck();
			
			if(!(myNod.areAll('valid'))){
				return;
			}
			
			showLayer();

			var jsonObject = new Object();
			jsonObject["agentCommisionBillingNumber"] 	= $('#agentCommissionNumberEle').val();

			getJSON(jsonObject, WEB_SERVICE_URL+'/agentCommissionBillingSettlementWS/getAgentCommissionBillingDetailsByCommissionNumber.do?', _this.setData, EXECUTE_WITH_ERROR);
		},setData : function(response) {
			
			if(response.message != undefined){
				$('#agentCommissionNumberEle').val("");
				setTimeout(function(){$('#agentCommissionNumberEle').focus()}, 100);
				hideLayer();
				return;
			}
			
			if(configObj.AllowPaymentTypeForAll) {
				var newOption0 = $('<option/>');
				newOption0.html("-- Select Payment Type --");
				newOption0.attr('id',0);
				newOption0.val(0);
				$("#paymentModeForAll").append(newOption0);
				
				for (var j = 0; j < paymentTypeArr.length; j++) {
					var newOption0 = $('<option/>');
					newOption0.html(paymentTypeArr[j].paymentTypeName);
					newOption0.attr('id', paymentTypeArr[j].paymentTypeId);
					newOption0.val(paymentTypeArr[j].paymentTypeId);
					$("#paymentModeForAll").append(newOption0);
				}
			} else
				$("#paymentModeForAll").addClass('hide');
			
			if(configObj.AllowSettlementAmoutForAll)
				$('#totalSettlementAmountEle').addClass('show');
			else
				$('#totalSettlementAmountEle').addClass('hide');
			
			$("#agentCommissionSettlementDiv").empty();
			$('#bottom-border-boxshadow').removeClass('hide');
			
			if(response.AgentCommisionBillingModel != undefined) {
				hideAllMessages();
				$("#agentCommissionSettlementDiv").empty();
				$('#bottom-border-boxshadow').removeClass('hide');

				var agentCommisionBillingModel 	= response.AgentCommisionBillingModel;
				
				var table = $('<table id="agentCommissionSettlement" class="table table-bordered" />');

				agentcommidlist = new Array();
				
				for (var i = 0; i < agentCommisionBillingModel.length; i++) {
					if(i == 0) {
						var tr 	=  $('<tr class="header"/>');

						var th0 	= $('<th/>');
						var th1 	= $('<th/>');
						var th2 	= $('<th/>');
						var th3 	= $('<th/>');
						var th4 	= $('<th/>');
						var th5 	= $('<th/>');
						var th6 	= $('<th/>');
						
						if(configObj.showPaymentStatusSelection)
							var th7 	= $('<th/>');
						
						var th8 	= $('<th/>');
						var th9 	= $('<th/>');
						var th10 	= $('<th/>');
						var th11 	= $('<th/>');
						
						if(configObj.PartPaymentAllowed)
							var th12 	= $('<th/>');

						th0.append("Sr No");
						th1.append("LR No");
						th2.append("Bkg Date");
						th3.append("Source");
						th4.append("To");
						th5.append("LR Type");
						th6.append("Payment Mode");
						
						if(configObj.showPaymentStatusSelection)
							th7.append("Payment Type");
						
						th8.append("Freight");
						th9.append("Commission Receivable");
						th10.append("Commission Payable");
						th11.append("Settlement Amount");
						
						if(configObj.PartPaymentAllowed)
							th12.append("Balance Amount");

						tr.append(th0);
						tr.append(th1);
						tr.append(th2);
						tr.append(th3);
						tr.append(th4);
						tr.append(th5);
						tr.append(th6);
						
						if(configObj.showPaymentStatusSelection)
							tr.append(th7);
						
						tr.append(th8);
						tr.append(th9);
						tr.append(th10);
						tr.append(th11);
						
						if(configObj.PartPaymentAllowed)
							tr.append(th12);

						table.append(tr);
					} 
					
					var tr 	=  $('<tr/>'); 

					var td0 	= $('<td/>');
					var td1 	= $('<td/>');
					var td2 	= $('<td/>');
					var td3 	= $('<td/>');
					var td4 	= $('<td/>');
					var td5 	= $('<td/>');
					var td6 	= $('<td/>');
					
					if(configObj.showPaymentStatusSelection)
						var td7 	= $('<td/>');
					
					var td8 	= $('<td/>');
					var td9 	= $('<td/>');
					var td10 	= $('<td/>');
					var td11 	= $('<td/>');
					
					if(configObj.PartPaymentAllowed)
						var td12 	= $('<td/>');
						
					let agentCommisionBillingDetailId	= agentCommisionBillingModel[i].agentCommisionBillingDetailId;

					var select 	= $('<select type="text" class="form-control">').attr("onchange", 'showHideChequeDetails(this)');
					select.attr('id',"paymentModeEle_" + agentCommisionBillingDetailId);
					
					var newOption = $('<option/>');
					newOption.html("-- Select Payment Mode --");
					newOption.attr('id',0);
					newOption.val(0);
					$(select).append(newOption);
					
					for (var j = 0; j < paymentTypeArr.length; j++) {
						var newOption = $('<option/>');
						newOption.html(paymentTypeArr[j].paymentTypeName);
						newOption.attr('id', paymentTypeArr[j].paymentTypeId);
						newOption.val(paymentTypeArr[j].paymentTypeId);
						$(select).append(newOption);
					}
					
					if(configObj.showPaymentStatusSelection) {
						var selectPaymentType 	= $('<select type="text" class="form-control">').attr("onchange", '');
						selectPaymentType.attr('id',"paymentTypeEle_" + agentCommisionBillingDetailId);
						
						var newOption1 = $('<option/>');
						newOption1.html("-- Select Payment Type --");
						newOption1.attr('id',0);
						newOption1.val(0);
						$(selectPaymentType).append(newOption1);

						for (var j = 0; j < paymentStatusArrForSelection.length; j++) {
							var newOption1 = $('<option/>');
							newOption1.html(paymentStatusArrForSelection[j].paymentStatusString);
							newOption1.attr('id', paymentStatusArrForSelection[j].paymentStatusId);
							newOption1.val(paymentStatusArrForSelection[j].paymentStatusId);
							$(selectPaymentType).append(newOption1);
						}
					}
					
					if(configObj.PartPaymentAllowed) {
						var input	= $('<input type="checkbox">')
						input.attr('id', "check_" + agentCommisionBillingDetailId);
						input.attr('name', "waybills");
						input.val(agentCommisionBillingDetailId);
					}

					var input1	= $('<input type="hidden">')
					input1.attr('id', "agentCommissionBillingSummaryId_" + agentCommisionBillingDetailId);
					input1.val(agentCommisionBillingModel[i].agentCommisionBillingSummaryId);

					var input2	= $('<input type="hidden">')
					input2.attr('id', "agentCommisionBillingDetailId_" + agentCommisionBillingDetailId);
					input2.val(agentCommisionBillingDetailId);
	
					agentcommidlist.push(agentCommisionBillingDetailId);
					
					var input3	= $('<input type="text" class="form-control">')
					input3.attr('id', "settlementAmount_" + agentCommisionBillingDetailId);
					input3.attr("onkeyup", 'validateReceivedPayment(this)');

					var input4	= $('<input type="hidden">')
					input4.attr('id', "commissionReceivable_" + agentCommisionBillingDetailId);
					input4.val(agentCommisionBillingModel[i].commissionReceivable);

					var input5	= $('<input type="hidden">')
					input5.attr('id', "commissionPayable_" + agentCommisionBillingDetailId);
					input5.val(agentCommisionBillingModel[i].commissionPayable);

					var input6	= $('<input type="hidden">')
					input6.attr('id', "wayBillId_" + agentCommisionBillingDetailId);
					input6.val(agentCommisionBillingModel[i].wayBillId);
					
					var input7	= $('<input type="hidden">')
					input7.attr('id',"wayBillNumber_" + agentCommisionBillingDetailId);
					input7.val(agentCommisionBillingModel[i].wayBillNumber);
					
					var input8	= $('<input type="hidden">')
					input8.attr('id',"balancePayable_" + agentCommisionBillingDetailId);
					input8.val(agentCommisionBillingModel[i].balanceAmount);
					
					var input9	= $('<input type="hidden">')
					input9.attr('id',"srcBranch_" + agentCommisionBillingDetailId);
					input9.val(agentCommisionBillingModel[i].sourceBranchId);
					
					if(configObj.PartPaymentAllowed)
						td0.append(input);
					else
						td0.append(i+1);
					
					td1.append(agentCommisionBillingModel[i].wayBillNumber);
					td1.append(input1);
					td1.append(input2);
					td1.append(input6);
					td1.append(input7);
					td2.append(agentCommisionBillingModel[i].bookingDateTimestampStr);
					td3.append(agentCommisionBillingModel[i].sourceBranchName);
					td3.append(input9)
					td4.append(agentCommisionBillingModel[i].destinationBranchName);
					td5.append(agentCommisionBillingModel[i].wayBillTypeName);
					td6.append(select);
					
					if(configObj.showPaymentStatusSelection)
						td7.append(selectPaymentType);
					
					td8.append(agentCommisionBillingModel[i].freightAmt);
					td9.append(agentCommisionBillingModel[i].commissionReceivable);
					td9.append(input4);
					td10.append(agentCommisionBillingModel[i].commissionPayable);
					td10.append(input5);
					td11.append(input3);
					
					if(configObj.PartPaymentAllowed) {
						td12.append(agentCommisionBillingModel[i].balanceAmount.toFixed(2));
						td12.append(input8);
					}

					tr.append(td0);
					tr.append(td1);
					tr.append(td2);
					tr.append(td3);
					tr.append(td4);
					tr.append(td5);
					tr.append(td6);
					
					if(configObj.showPaymentStatusSelection)
						tr.append(td7);
					
					tr.append(td8);
					tr.append(td9);
					tr.append(td10);
					tr.append(td11);
					
					if(configObj.PartPaymentAllowed)
						tr.append(td12);
					
					table.append(tr);
				}
				
				$('#agentCommissionSettlementDiv').append(table);
			} else {
				$('#bottom-border-boxshadow').addClass('hide');
			}

			hideLayer();
			
			$( "#dispatchBtn" ).click(function() {
				_this.submitData();
			});
		}, submitData : function () {
			var checkBoxArray	= new Array();
			
			$.each($("input[name=waybills]:checked"), function(){ 
				checkBoxArray.push($(this).val());
			});
			
			if(configObj.PartPaymentAllowed && checkBoxArray.length == 0) {
				showMessage('error', 'Please Select At least One LR!');
				hideLayer();
				return;
			}
			
			if(!_this.validateInputs())
				return;
			
			showLayer();
			var commissionArray	 = new Array();
			
			if(configObj.PartPaymentAllowed) {
				for(var i = 0; i < checkBoxArray.length; i++) {
					var agentCommisionBillingDetailId	= checkBoxArray[i];
					
					var commissionData	= new Object();
					
					commissionData.agentCommisionBillingDetailId 	= agentCommisionBillingDetailId;
					commissionData.paymentMode						= $('#paymentModeEle_' + agentCommisionBillingDetailId).val();
					commissionData.settlementAmount					= $('#settlementAmount_' + agentCommisionBillingDetailId).val();
					
					if($('#paymentDataTr_0').exists())
						commissionData.paymentData					= $("#paymentDataTr_0 #paymentCheckBox").val();
					else
						commissionData.paymentData					= $('#paymentDataTr_' + agentCommisionBillingDetailId + " #paymentCheckBox").val();
					
					commissionData.receivableAmount					= $('#commissionReceivable_' + agentCommisionBillingDetailId).val();
					commissionData.payableAmount					= $('#commissionPayable_' + agentCommisionBillingDetailId).val();
					commissionData.wayBillId						= $('#wayBillId_' + agentCommisionBillingDetailId).val();
					commissionData.wayBillNumber					= $('#wayBillNumber_' + agentCommisionBillingDetailId).val();
					commissionData.agentSrcBranchId					= $('#srcBranch_' + agentCommisionBillingDetailId).val();
					
					if($('#paymentTypeEle_' + agentCommisionBillingDetailId).exists() && $('#paymentTypeEle_' + agentCommisionBillingDetailId).is(":visible"))
						commissionData.paymentStatus				= $('#paymentTypeEle_' + agentCommisionBillingDetailId).val();
					else
						commissionData.paymentStatus				= 3;
					
					if($('#balancePayable_' + agentCommisionBillingDetailId).exists() && $('#balancePayable_' + agentCommisionBillingDetailId).is(":visible"))
						commissionData.balanceAmount				= $('#balancePayable_' + agentCommisionBillingDetailId).val();
					else
						commissionData.balanceAmount				= 0;
					
					commissionArray.push(commissionData);
				}
			} else {
				for(var i = 0; i < agentcommidlist.length; i++) {
					var agentCommisionBillingDetailId	= agentcommidlist[i];
					
					if(Number($('#paymentModeEle_' + agentCommisionBillingDetailId).val()) > 0
					&& $('#settlementAmount_' + agentCommisionBillingDetailId).val() > 0) {
						var commissionData	= new Object();
						
						commissionData.agentCommisionBillingDetailId 	= agentCommisionBillingDetailId;
						commissionData.paymentMode						= $('#paymentModeEle_' + agentCommisionBillingDetailId).val();
						commissionData.settlementAmount					= $('#settlementAmount_' + agentCommisionBillingDetailId).val();
						
						if($('#paymentDataTr_0').exists())
							commissionData.paymentData					= $("#paymentDataTr_0 #paymentCheckBox").val();
						else
							commissionData.paymentData					= $('#paymentDataTr_' + agentCommisionBillingDetailId + " #paymentCheckBox").val();
						
						commissionData.receivableAmount					= $('#commissionReceivable_' + agentCommisionBillingDetailId).val();
						commissionData.payableAmount					= $('#commissionPayable_' + agentCommisionBillingDetailId).val();
						commissionData.wayBillId						= $('#wayBillId_' + agentCommisionBillingDetailId).val();
						commissionData.wayBillNumber					= $('#wayBillNumber_' + agentCommisionBillingDetailId).val();
						commissionData.agentSrcBranchId					= $('#srcBranch_' + agentCommisionBillingDetailId).val();
						
						if($('#paymentTypeEle_' + agentCommisionBillingDetailId).exists() && $('#paymentTypeEle_' + agentCommisionBillingDetailId).is(":visible"))
							commissionData.paymentStatus				= $('#paymentTypeEle_' + agentCommisionBillingDetailId).val();
						else
							commissionData.paymentStatus				= 3;
						
						if($('#balancePayable_' + agentCommisionBillingDetailId).exists() && $('#balancePayable_' + agentCommisionBillingDetailId).is(":visible"))
							commissionData.balanceAmount				= $('#balancePayable_' + agentCommisionBillingDetailId).val();
						else
							commissionData.balanceAmount				= 0;
						
						commissionArray.push(commissionData);
					}
				}
			}
			
			var finalJsonObj 						 		= new Object();
			finalJsonObj.commissionArray  	  				= JSON.stringify(commissionArray);
			finalJsonObj.agentCommisionBillingSummaryId  	= $('#agentCommissionBillingSummaryId_' + agentcommidlist[0]).val();
			finalJsonObj.agentCommisionBillingNumber	  	= $('#agentCommissionNumberEle').val();
			finalJsonObj.paymentModeForAll	  				= $('#paymentModeForAll').val();
			
			finalJsonObj.agentCommissionBillingDetailsIds	  	= checkBoxArray.join(',');
			finalJsonObj.agentcommidlist	= agentcommidlist.join(',');
			
			var rowCount 		= $('#storedPaymentDetails tr').length;

			if(!$('#storedPaymentDetails').is(':empty') && rowCount > 0) {
				var paymentCheckBoxArr			= getAllCheckBoxSelectValue('paymentCheckBox');
				finalJsonObj.paymentValues		= paymentCheckBoxArr.join(',');
			}
			
			if(!confirm('Are you sure for settlement !'))
				reurn;
			
			if(!doneTheStuff) {
				getJSON(finalJsonObj, WEB_SERVICE_URL	+ '/agentCommissionBillingSettlementWS/validateAndSaveAgentCommissionBillingDetails.do?',_this.afterSuccess,EXECUTE_WITH_ERROR);
				doneTheStuff	= true;
			}
		},afterSuccess : function (response) {
			if(response.message != undefined){
				hideLayer();
				return;
			}
			hideLayer();
			var MyRouter = new Marionette.AppRouter({});
			MyRouter.navigate('&modulename=agentCommisionBillingSettlement&masterid='+response.agentCommissionBillingSummaryId);
			location.reload();
		},validateInputs : function () {
			if(configObj.PartPaymentAllowed){
				for(var i = 0; i < agentcommidlist.length; i++) {
					if ($("#check_"+agentcommidlist[i]).prop('checked')){
						if($('#paymentModeEle_' + agentcommidlist[i]).val() == 0) {
							showMessage('error', "Select Payment Mode !");
							$('#paymentModeEle_' + agentcommidlist[i]).focus();
							$('#paymentModeEle_' + agentcommidlist[i]).css({"border-color": "red"});
							return false;
						}
						
						if($('#paymentTypeEle_' + agentcommidlist[i]).val() == 0) {
							showMessage('error', "Select Payment Status !");
							$('#paymentTypeEle_' + agentcommidlist[i]).focus();
							$('#paymentTypeEle_' + agentcommidlist[i]).css({"border-color": "red"});
							return false;
						}
						
						if($('#settlementAmount_' + agentcommidlist[i]).val() == 0) {
							showMessage('error', "Enter Settlement Amount !");
							$('#settlementAmount_' + agentcommidlist[i]).focus();
							$('#settlementAmount_' + agentcommidlist[i]).css({"border-color": "red"});
							return false;
						}
						
						if($('#balancePayable_' + agentcommidlist[i]).val() > 0) {
							if(Number($('#balancePayable_' + agentcommidlist[i]).val()) < Number($('#settlementAmount_' + agentcommidlist[i]).val())) {
								showMessage('error', "Enter Proper Amount !");
								$('#settlementAmount_' + agentcommidlist[i]).focus();
								$('#settlementAmount_' + agentcommidlist[i]).val(0);
								$('#settlementAmount_' + agentcommidlist[i]).css({"border-color": "red"});
								return false;
							}
						}
					}
				}
				
			} else {
				for(var i = 0; i < agentcommidlist.length; i++){
					if($('#paymentModeEle_' + agentcommidlist[i]).val() == 0) {
						showMessage('error', "Select Payment Mode !");
						$('#paymentModeEle_' + agentcommidlist[i]).focus();
						$('#paymentModeEle_' + agentcommidlist[i]).css({"border-color": "red"});
						return false;
					}

					if($('#settlementAmount_' + agentcommidlist[i]).val() == 0) {
						showMessage('error', "Enter Settlement Amount !");
						$('#settlementAmount_' + agentcommidlist[i]).focus();
						$('#settlementAmount_' + agentcommidlist[i]).css({"border-color": "red"});
						return false;
					}

					if($('#commissionReceivable_' + agentcommidlist[i]).val() > 0) {
						if($('#commissionReceivable_' + agentcommidlist[i]).val() < $('#settlementAmount_' + agentcommidlist[i]).val()) {
							showMessage('error', "Enter Proper Amount !");
							$('#settlementAmount_' + agentcommidlist[i]).focus();
							$('#settlementAmount_' + agentcommidlist[i]).val(0);
							$('#settlementAmount_' + agentcommidlist[i]).css({"border-color": "red"});
							return false;
						}
					}
					
					if($('#commissionPayable_' + agentcommidlist[i]).val() > 0) {
						if($('#commissionPayable_' + agentcommidlist[i]).val() < $('#settlementAmount_' + agentcommidlist[i]).val()) {
							showMessage('error', "Enter Proper Amount !");
							$('#settlementAmount_' + agentcommidlist[i]).focus();
							$('#settlementAmount_' + agentcommidlist[i]).val(0);
							$('#settlementAmount_' + agentcommidlist[i]).css({"border-color": "red"});
							return false;
						}
					}
				}
			}
			
			return true;
		}
	});
});

function showHideChequeDetails(obj) {
	var objName 		= obj.id;
	var mySplitResult 	= objName.split("_");
	
	$('#uniqueWayBillId').val(mySplitResult[1]);
	$('#uniqueWayBillNumber').val($('#wayBillNumber_' + mySplitResult[1]).val());
	$('#uniquePaymentType').val($('#paymentModeEle_' + mySplitResult[1]).val());
	$('#uniquePaymentTypeName').val($("#paymentModeEle_" + mySplitResult[1] + " option:selected").text());

	bankAccountNotMandatory	= true;
	hideShowBankPaymentTypeOptions(obj);
}

function settleBillDetails(){

	var tableEl  = $("#agentCommissionSettlement tbody");
	
	var settlementAmount = 0;

	for(var i = 1;i<tableEl[0].rows.length;i++){
		var id = 	tableEl[0].rows[i].cells[0].firstChild.value;
		$('#settlementAmount_'+id).val(0);
		$('#check_'+id).prop('checked', false);
		$('#paymentTypeEle_'+id).val(0);
	}
	
	settlementAmount = $('#totalSettlementAmountEle').val();
	
	for(var i = 1;i<tableEl[0].rows.length;i++){
		
		var id = 	tableEl[0].rows[i].cells[0].firstChild.value;
		
		var balancePayable =  $('#balancePayable_'+id).val();
		
		if(Number(settlementAmount) > 0 && (Number(settlementAmount) >= Number(balancePayable))){
			$('#settlementAmount_'+id).val(Number(balancePayable));
			$('#check_'+id).prop('checked', true);
			$('#paymentTypeEle_'+id).val(1);
		} else if(Number(settlementAmount) > 0 && (Number(settlementAmount) == Number(balancePayable))){
			$('#settlementAmount_'+id).val(Number(balancePayable));
			$('#check_'+id).prop('checked', true);
			$('#paymentTypeEle_'+id).val(1);
		} else if(Number(settlementAmount) > 0 && (Number(settlementAmount) < Number(balancePayable))){
			$('#settlementAmount_'+id).val(Number(settlementAmount));
			$('#check_'+id).prop('checked', true);
			$('#paymentTypeEle_'+id).val(2);
		}
		
		settlementAmount = settlementAmount - balancePayable;
	}
	
}

function setPaymentModeForAll(obj) {
	var paymentTypeForAll = $('#paymentModeForAll').val();
	var tableEl  = $("#agentCommissionSettlement tbody");
	
	for(var i = 1; i < tableEl[0].rows.length; i++) {
		$('#paymentModeEle_' + tableEl[0].rows[i].cells[0].firstChild.value).val(paymentTypeForAll);
	}

	$('#uniqueWayBillNumber').val('0');
	hideShowBankPaymentTypeOptions(obj);
}

function validateReceivedPayment(obj){
	
	var id= obj.id;
	var value = obj.value;

	var agentCommissionBillingDetailsId = id.split("_")[1];
	
	if(configObj.PartPaymentAllowed) {
		if(Number(value) > 0){
			if(Number(value)  > Number($("#balancePayable_"+agentCommissionBillingDetailsId).val())){
				showMessage('error', "You can not enter Settlement Amount more than balance Amount !");
				$('#settlementAmount_' + agentCommissionBillingDetailsId).val(0);
			} else if(Number(value) < Number($("#balancePayable_"+agentCommissionBillingDetailsId).val())){
				$('#paymentTypeEle_'+agentCommissionBillingDetailsId).val(2);
				$('#check_'+agentCommissionBillingDetailsId).prop('checked', true);
			} else if (Number(value) == Number($("#balancePayable_"+agentCommissionBillingDetailsId).val())){
				$('#paymentTypeEle_'+agentCommissionBillingDetailsId).val(1);
				$('#check_'+agentCommissionBillingDetailsId).prop('checked', true);
			}
		} else{
			showMessage('error', "Enter Settlement Amount greater then 0 !");
			$('#settlementAmount_' + agentCommissionBillingDetailsId).val('');
		}
	}
	
}