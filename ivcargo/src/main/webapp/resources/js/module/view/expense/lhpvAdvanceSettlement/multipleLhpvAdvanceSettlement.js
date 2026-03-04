var LHPV_SEARCH_TYPE_VEHICLE	= 1;
var LHPV_SEARCH_TYPE_VEHICLE_AGENT	= 3;
var LHPV_SEARCH_TYPE_LHPV_NUMBER	= 5;
var LHPV_TRUCK_ADVANCE 	= 13;
var moduleId = LHPV_TRUCK_ADVANCE;
var myNod;
var tableDataHm = null;
var paymentTypeArr = null;
var executive = null;
var PaymentTypeConstant = null;
var ModuleIdentifierConstant = null;
var GeneralConfiguration = null;
var bankPaymentOperationRequired = false;
var moduleId						= 0;
var incomeExpenseModuleId			= 0;
define(
	[
	PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
	'slickGridWrapper2',
	'JsonUtility',
	'messageUtility',
	'autocomplete',
	'focusnavigation',
	'nodvalidation'
	],
	function(Selection) {
	'use strict';
	var  _this;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(null, WEB_SERVICE_URL+'/multipleLhpvAdvanceSettlementWS/getMultipleLhpvAdvanceElement.do', _this.renderElements, EXECUTE_WITH_ERROR);
			return _this;
		}, renderElements :function(response) {
			showLayer();
			var loadelement			= new Array();
			var baseHtml 			= new $.Deferred();
					
			loadelement.push(baseHtml);
					
			$("#mainContent").load("/ivcargo/html/module/expense/multipleLhpvAdvanceSettlement.html",
					function() {
				baseHtml.resolve();
			});

			let bankPaymentOperationModel = new $.Deferred();	//

			loadelement.push(bankPaymentOperationModel);

			$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html", function() {
				bankPaymentOperationModel.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				hideLayer();
				initialiseFocus();
				
				paymentTypeArr					= response.paymentTypeArr;
				executive						= response.executive;
				PaymentTypeConstant				= response.PaymentTypeConstant;
				ModuleIdentifierConstant		= response.ModuleIdentifierConstant;
				GeneralConfiguration			= response.GeneralConfiguration;
				moduleId						= response.moduleId;
				incomeExpenseModuleId			= response.incomeExpenseModuleId;
				bankPaymentOperationRequired	= GeneralConfiguration.BankPaymentOperationRequired;
				
				var elementConfiguration	= new Object();
						
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.vehicleElement		= $('#vehicleNumberEle')
				
				response.vehicleAgentSelection	= true;
				response.vehicleSelection		= true;
				response.viewAllVehicle			= response.AllOptionInVehicleNumber;
				response.elementConfiguration	= elementConfiguration;
				response.isCalenderSelection	= true;
				response.getAgentWiseVehicleAutoComplete	= false;
				
				_this.setSelectType();
				setIssueBankAutocomplete();
				setAccountNoAutocomplete();
				
				Selection.setSelectionToGetData(response);
				
				$("#findBtn").click(function() {
					myNod = nod();
					myNod.configure({
						parentClass:'validation-message'
					});
					if($('#typeEle').exists() && $('#typeEle').is(":visible"))
						addAutocompleteElementInNode(myNod, 'typeEle', 'Select Type !')
					
					if($('#searchByDate').is(":checked") && $('#dateEle').exists() && $('#dateEle').is(":visible"))
						addElementToCheckEmptyInNode(myNod, 'dateEle', 'Select Date !')
						
					if($('#lhpvNumberEle').exists() && $('#lhpvNumberEle').is(":visible"))
						addElementToCheckEmptyInNode(myNod, 'lhpvNumberEle', 'Select LHPV No !')
						
					if($('#vehicleNumberEle').exists() && $('#vehicleNumberEle').is(":visible"))
						addAutocompleteElementInNode(myNod, 'vehicleNumberEle', 'Select Vehicle No !')
						
					if($('#vehicleAgentEle').exists() && $('#vehicleAgentEle').is(":visible"))
						addAutocompleteElementInNode(myNod, 'vehicleAgentEle', 'Select Vehicle Agent !')
					
					myNod.performCheck();
							
					if(myNod.areAll('valid'))
						_this.onFind();
				});
				
				$("#saveBtn").bind("click", function() {
					if(_this.validateForLHPV() && confirm('Are you sure you want to Save Amount ?')){
						_this.settleMultipleLhpvPayment();
					}
				});
				
			});
		}, onFind : function() {
			showLayer();
					
			var jsonObject = Selection.getElementData();
			jsonObject.selectType = $("#typeEle_primary_key").val();
			
			if($("#lhpvNumberEle_primary_key").val() != undefined)
				jsonObject.lhpvNumber = $("#lhpvNumberEle_primary_key").val();
			else
				jsonObject.lhpvNumber = $("#lhpvNumberEle").val()
			
			if(!($('#searchByDate').is(":checked"))){
				jsonObject.fromDate = "";
				jsonObject.toDate	= "";
			}

			getJSON(jsonObject, WEB_SERVICE_URL+'/multipleLhpvAdvanceSettlementWS/getMultipleLhpvAdvanceDetails.do', _this.setData, EXECUTE_WITH_NEW_ERROR);
		}, setData : function(response) {
			hideLayer();
			
			if (response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				$("#saveBtn").addClass('hide');
				$('#multipleLhpvCentralDataTable thead').empty();
				$('#multipleLhpvCentralDataTable tbody').empty();
				$('#multipleLhpvDataTable thead').empty();
				$('#multipleLhpvDataTable tbody').empty();
				return;
			}
			
			$("#saveBtn").removeClass('hide');
			$('#multipleLhpvCentralDataTable thead').empty();
			$('#multipleLhpvCentralDataTable tbody').empty();
			$("#previousVoucherDetails").css("display", "none");
			$("#previousVoucherPrint").css("display", "none");
			
			$('#multipleLhpvDataTable thead').empty();
			$('#multipleLhpvDataTable tbody').empty();
			
			tableDataHm		= response.lhpvHm;
			var headerColumnArray		= new Array();
			var dataColumnArray			= new Array();
			var centralHeaderArray		= new Array();
			var cetralDataArray			= new Array();
			var count					= 0;
			
			$(".font16px").css("font-size", "16px");
			
			var thHead = "<th class='textAlignCenter font16px' style='width:10%;text-align : left' >";
			
			centralHeaderArray.push(" <th class='textAlignCenter font16px' style='width:32%;text-align : left' > Payment Mode</th>");
			centralHeaderArray.push(" <th class='textAlignCenter font16px' style='width:32%;text-align : left' > Payment Type</th>");
			centralHeaderArray.push(" <th class='textAlignCenter font16px' style='width:40%;text-align : left' ></th>");
			
			$('#multipleLhpvCentralDataTable thead').append(centralHeaderArray.join(' '));
			
			cetralDataArray.push("<td class ='font16px' style='text-align: left; width:32%;'> <select id='paymentMode_0' onchange='setValueToInnerTableOnPaymentModeChange(0,this);removeError(paymentMode_0);' class='form-control'></select></td>");
			cetralDataArray.push("<td class ='font16px' style='text-align: left; width:32%;'> <select id='paymentType' onchange='onPaymentTypeSelect(this)'; value=0 class='form-control'></select></td>");
			cetralDataArray.push("<td class ='font16px' style='text-align: left; width:40%;'> <input id='viewPaymentType' onclick='openAddedPaymentTypeModel()'; value='View Paymnet Details' class='form-control btn-sm btn-success'></td>");
					
			_this.appendTR('multipleLhpvCentralDataTable',cetralDataArray);
			cetralDataArray	= [];
			
			setPaymentTypeTable();
			setPaymentModeInnerTable(0, 'paymentMode_');
			
			headerColumnArray.push("<tr><th class='textAlignCenter font16px' style='width:5%;text-align : left' ></th>");
			headerColumnArray.push("<th class='textAlignCenter font16px' style='width:10%;text-align : left'>LHPV No.</th>");
			headerColumnArray.push(thHead +"LHPV Date</th>");
			headerColumnArray.push(thHead +"Created At</th>");
			headerColumnArray.push(thHead +"Payment Mode</th>");
			headerColumnArray.push(thHead +"LHPV Amount</th>");
			headerColumnArray.push(thHead +"Advance Amount</th>");
			headerColumnArray.push(thHead +"Rec Advance Amt</th>");
			headerColumnArray.push(thHead +"Txn Amount</th>");
			headerColumnArray.push(thHead +" Bal Amount</th></tr>");
			$('#multipleLhpvDataTable thead').append(headerColumnArray.join(' '));
			
			if( tableDataHm != undefined && Object.keys(tableDataHm).length > 0){
				for(var key in tableDataHm){
					var	tableData	= tableDataHm[key];
					var lhpvId	= tableData.lhpvId;
					var balAmount = tableData.chargeAmount - tableData.lhpvChargeSettledAmount;
					count++;
					
					var td = "<td class ='font16px' style='text-align: left; width:10%;'>";
					dataColumnArray.push(td + "<input type='checkbox' id='check"+count+"' name='checkbox'  value='"+lhpvId+"_"+tableData.lhpvChargeExpenseVoucherSettlementId+"_"+tableData.lHPVNumber+"' />");
					dataColumnArray.push(td + tableData.lHPVNumber+"</td>");
					dataColumnArray.push(td + tableData.lhpvCreationDateTimeString+"</td>");
					dataColumnArray.push(td + tableData.lhpvBranchName+"</td>");
					dataColumnArray.push(td + "<select id='paymentMode_" + lhpvId +"' onchange='changeValueOnPaymentMode("+lhpvId+");removeError(paymentMode_" + lhpvId + ");' class='form-control'></select></td>");
					dataColumnArray.push(td + "<input id='lhpvAmount_" + lhpvId +"' readonly='readonly' type='text' class='form-control' value=" + tableData.totalAmount +"></td>");
					dataColumnArray.push(td + "<input id='lhpvAdvanceAmt_" + lhpvId +"' readonly='readonly' type='text' class='form-control' value=" + tableData.chargeAmount +"></td>");
					dataColumnArray.push(td + "<input id='receivedAdvanceAmt_" + lhpvId +"' readonly='readonly' type='text' class='form-control' value=" + tableData.lhpvChargeSettledAmount +"></td>");
					dataColumnArray.push(td + "<input id='txnAmount_" + lhpvId +"' onkeyup='setValueOnTxnAmount(" + lhpvId + ");'  maxlength='7' onfocus='resetTextFeild(this, 0);' onblur='resetTextFeild(this, 0);clearIfNotNumeric(this,0);' onkeypress='return noNumbers(event ,this);' type='text' class='form-control' value=''></td>");
					dataColumnArray.push(td + "<input id='balanceAmt_" + lhpvId +"' readonly='readonly' onfocus='resetTextFeild(this, 0);' onblur='resetTextFeild(this, 0);clearIfNotNumeric(this,0);' type='text' class='form-control' value=" + balAmount +"></td>");
				
					_this.appendTR('multipleLhpvDataTable',dataColumnArray);
					dataColumnArray	=[];
					
					setPaymentModeInnerTable(lhpvId, 'paymentMode_');
				}
			}
			
			
		}, setSelectType : function(){
			_this.setSelectTypeAutocompleteInstance();
			
			let autoSelectType = $("#typeEle").getInstance();
			
			let SelectTYPE = [
				{ "selectTypeId":LHPV_SEARCH_TYPE_VEHICLE, "selectTypeName": "Vehicle Number" },
				{ "selectTypeId":LHPV_SEARCH_TYPE_VEHICLE_AGENT, "selectTypeName": "Vehicle Agent" },
				{ "selectTypeId":LHPV_SEARCH_TYPE_LHPV_NUMBER, "selectTypeName": "LHPV No" },
			]
			
			$( autoSelectType ).each(function() {
				this.option.source = SelectTYPE;
			})
		}, setSelectTypeAutocompleteInstance : function() {
			let autoSelectTypeName 			= new Object();
			autoSelectTypeName.primary_key 	= 'selectTypeId';
			autoSelectTypeName.field 		= 'selectTypeName';

			$("#typeEle").autocompleteCustom(autoSelectTypeName)
		}, settleMultipleLhpvPayment : function() {
			showLayer();
					
			let checkBoxArr		= [];
			let lhpvDataArr		= [];
			checkBoxArr			= getAllCheckBoxSelectValue('checkbox');
			
			for(var i = 0; i < checkBoxArr.length; i++) {
				var value	= checkBoxArr[i];
				var id	= value.split("_")[0];
				let lhpvData	= new Object();
				lhpvData.lhpvId = id;
				lhpvData.paymentMode = $('#paymentMode_' + id).val();
				lhpvData.paymentType = $('#paymentType').val();
				lhpvData.totalAmount = $('#lhpvAmount_' + id).val();
				lhpvData.chargeAmount = $('#lhpvAdvanceAmt_' + id).val();
				lhpvData.lhpvChargeSettledAmount = $('#receivedAdvanceAmt_' + id).val();
				lhpvData.chargeTxnAmount	= $('#txnAmount_' + id).val();
				lhpvData.chargeBalanceAmount = $('#balanceAmt_' + id).val();
				lhpvData.lhpvChargeExpenseVoucherSettlementId = value.split("_")[1];
				lhpvData.lHPVNumber = value.split("_")[2];
				
				lhpvDataArr.push(lhpvData);
			}
			
			var jsonObject = new Object();
			jsonObject.lhpvDataArr	= JSON.stringify(lhpvDataArr);
			jsonObject.paymentType = $('#paymentType').val();
			jsonObject["paymentValues"]	= $('#paymentCheckBox').val();

			getJSON(jsonObject, WEB_SERVICE_URL+'/multipleLhpvAdvanceSettlementWS/settleMultipleLHPVTruckAdvance.do', _this.setDataAfterSuccess, EXECUTE_WITH_NEW_ERROR);
		}, setDataAfterSuccess : function(response) {
			hideLayer();
			
			$('#bottom-border-boxshadow').addClass('hide');
			$("#saveBtn").addClass('hide');
			$('#multipleLhpvCentralDataTable thead').empty();
			$('#multipleLhpvCentralDataTable tbody').empty();
			$('#multipleLhpvDataTable thead').empty();
			$('#multipleLhpvDataTable tbody').empty();
			
			if(response.status == 'success') {
				openPrintForVoucherBill(response.exepenseVoucherDetailsId);
				$('#previousVoucherDetailsMessage').html("<h4> Voucher " + response.paymentVoucherNumber + " has been created !</h4>");
				$('#previousVoucherDetailsId').val(response.exepenseVoucherDetailsId);
				$("#previousVoucherDetails").css("display", "block");
				$("#previousVoucherPrint").css("display", "block");
				refreshAndHidePartOfPage('bottom-border-boxshadow','hideAndRefresh');
				$("#lhpvNo").focus();
			}

		}, appendTR : function(id,columnArray) {
			$('#'+id+' tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
		}, validateForLHPV : function(){
			var checkBoxArr		= [];
			checkBoxArr			= getAllCheckBoxSelectValue('checkbox');
			
			if(Number($('#paymentType').val()) <= 0){
				showMessage('error', 'Please Select Payment Type');
				return false;
			}
			
			if(Number($('#paymentType').val()) != PAYMENT_TYPE_CASH_ID && ($('#paymentCheckBox').val() == undefined || $('#paymentCheckBox').val() == 'undefined')){
				showMessage('error', 'Please Select Payment Type');
				return false;
			}
			
			if(checkBoxArr.length == 0){
				showMessage('error', 'Please Select At Least One LHPV');
				return false;	
			}
				
			for(var i = 0; i < checkBoxArr.length; i++) {
				var value	= checkBoxArr[i];
				var id	= value.split("_")[0];
				if(Number($('#paymentMode_'+ id).val()) <= 0){
					showMessage('error', 'Please Select Payment Mode');
					return false;
				}
				if(Number($('#txnAmount_'+ id).val()) <= 0 || $('#txnAmount_'+ id).val() == ''){
					showMessage('error', 'Please Enter Amount');
					return false;
				}
			}
			return true;
		}
	});
});

function reprintVoucher() {
	var id = $('#previousVoucherDetailsId').val();
	console.log(id);
	openPrintForVoucherBill(id);
}
function openPrintForVoucherBill(id) {
	newwindow=window.open('BillPrint.do?pageId=25&eventId=16&voucherDetailsId='+id, 'newwindow', config='height=410,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function showHideDate(){
	if($('#searchByDate').is(":checked")){
		$("*[data-attribute=date").removeClass("hide");
	} else
		$("*[data-attribute=date").addClass("hide");
}
function selectTypeOnChange(res) {
	var id = Number($('#typeEle_primary_key').val());
	
	var lhpvNoNod = nod();
	lhpvNoNod.configure({
		parentClass:'validation-message'
	});
	
	if (id == LHPV_SEARCH_TYPE_LHPV_NUMBER) {
		$("*[data-attribute=lhpvNumber").removeClass("hide");
		$("*[data-attribute=date").addClass("hide");
		$("*[data-attribute=vehicleNumber").addClass("hide");
		$("*[data-attribute=vehicleAgent").addClass("hide");
		document.getElementById('searchByDate').checked = false;
		$("*[data-attribute=dateCheckBox").addClass("hide");
		
		$('#dateEle_primary_key').val("");
		$('#vehicleNumberEle_primary_key').val("");
		$('#vehicleAgentEle_primary_key').val("");
		$('#dateEle').val("");
		$('#vehicleNumberEle').val("");
		$('#vehicleAgentEle').val("");
		
		addAutocompleteElementInNode(lhpvNoNod, 'lhpvNumberEle', 'Select Lhpv No !');
	} else if (id == LHPV_SEARCH_TYPE_VEHICLE) {
		$("*[data-attribute=vehicleNumber").removeClass("hide");
		$("*[data-attribute=lhpvNumber").addClass("hide");
		$("*[data-attribute=vehicleAgent").addClass("hide");
		document.getElementById('searchByDate').checked = false;
		$("*[data-attribute=dateCheckBox").removeClass("hide");
		
		$('#dateEle_primary_key').val("");
		$('#lhpvNumberEle_primary_key').val("");
		$('#vehicleAgentEle_primary_key').val("");
		$('#dateEle').val("");
		$('#lhpvNumberEle').val("");
		$('#vehicleAgentEle').val("");
		
	} else if (id == LHPV_SEARCH_TYPE_VEHICLE_AGENT) {
		$("*[data-attribute=vehicleAgent").removeClass("hide");
		$("*[data-attribute=vehicleNumber").addClass("hide");
		$("*[data-attribute=lhpvNumber").addClass("hide");
		document.getElementById('searchByDate').checked = false;
		$("*[data-attribute=dateCheckBox").removeClass("hide");
		
		$('#dateEle_primary_key').val("");
		$('#vehicleNumberEle_primary_key').val("");
		$('#lhpvNumberEle_primary_key').val("");
		$('#dateEle').val("");
		$('#vehicleNumberEle').val("");
		$('#lhpvNumberEle').val("");
	} else {
		$("*[data-attribute=date").addClass("hide");
		$("*[data-attribute=lhpvNumber").addClass("hide");
		$("*[data-attribute=vehicleNumber").addClass("hide");
		$("*[data-attribute=vehicleAgent").addClass("hide");
		document.getElementById('searchByDate').checked = false;
		$("*[data-attribute=dateCheckBox").addClass("hide");
		
		$('#dateEle_primary_key').val("");
		$('#vehicleNumberEle_primary_key').val("");
		$('#vehicleAgentEle_primary_key').val("");
		$('#lhpvNumberEle_primary_key').val("");
		$('#dateEle').val("");
		$('#vehicleNumberEle').val("");
		$('#vehicleAgentEle').val("");
		$('#lhpvNumberEle').val("");
	}
}

function setPaymentModeInnerTable(lhpvId, elementId) {
	/*
	 * Property based will be done
	 */
	removeOption(elementId + lhpvId, null);

	createOption(elementId + lhpvId, 0, '--Payment Mode--');
	createOption(elementId + lhpvId, PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID, PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_NAME);
	createOption(elementId + lhpvId, PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID, PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_NAME);
}

function setPaymentTypeTable() {
	
	removeOption('paymentType', null);
	$('#paymentType').append('<option value="0" id="0"> --Payment Type--</option>');
	
	if(!jQuery.isEmptyObject(paymentTypeArr)) {
		for(const element of paymentTypeArr) {
			if(element != null)
				$('#paymentType').append('<option value="' + element.paymentTypeId + '" id="' + element.paymentTypeId + '">' + element.paymentTypeName + '</option>');
		}
	}
}

function removeOption(Id,value) {
	if(value != null) {
		$('#'+Id+' option[value='+value+']').remove();
	} else {
		$('#'+Id+' option[value]').remove();
	}
}
function setValueToInnerTableOnPaymentModeChange(){
	var paymentModeId = $('#paymentMode_0').val();
	
	for(var key in tableDataHm){
		var	tableData	= tableDataHm[key];
		var id = tableData.lhpvId;
		$('#paymentMode_' + id).val(paymentModeId);
		
		if(paymentModeId == PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID){
			$('#txnAmount_' + id).val($('#lhpvAdvanceAmt_'+ id).val() - $('#receivedAdvanceAmt_'+ id).val());
			$('#balanceAmt_' + id).val(0);
			$('#txnAmount_' + id).attr('readonly', true);
		} else{
			$('#txnAmount_' + id).val(0);
			$('#balanceAmt_' + id).val($('#lhpvAdvanceAmt_'+ id).val() - $('#receivedAdvanceAmt_'+ id).val());
			$('#txnAmount_' + id).attr('readonly', false);
		}
	}
}

function changeValueOnPaymentMode(id){
	
	if(Number($('#paymentMode_' + id).val()) == PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID){
		$('#txnAmount_' + id).val($('#lhpvAdvanceAmt_'+ id).val() - $('#receivedAdvanceAmt_'+ id).val());
		$('#balanceAmt_' + id).val(0);
		$('#txnAmount_' + id).attr('readonly', true);
	} else{
		$('#txnAmount_' + id).val(0);
		$('#balanceAmt_' + id).val($('#lhpvAdvanceAmt_'+ id).val() - $('#receivedAdvanceAmt_'+ id).val());
		$('#txnAmount_' + id).attr('readonly', false);
	}
}
function setValueOnTxnAmount(id){
	var advanceAmt = Number($('#lhpvAdvanceAmt_' + id).val());
	var receivedAmt = Number($('#receivedAdvanceAmt_' + id).val());
	var txnAmt = Number($('#txnAmount_' + id).val());
	
	if(txnAmt > (advanceAmt - receivedAmt)){
		$('#txnAmount_' + id).val(0);
		$('#balanceAmt_' + id).val($('#lhpvAdvanceAmt_'+ id).val());
		showMessage('error', 'You can not enter more than amount!');
		return false;
	} else if(txnAmt == (advanceAmt - receivedAmt)){
		$('#txnAmount_' + id).val(0);
		$('#balanceAmt_' + id).val($('#lhpvAdvanceAmt_'+ id).val());
		showMessage('error', 'Please Select Clear Payment Type!');
		return false;
	} else {
		$('#balanceAmt_' + id).val(advanceAmt - receivedAmt - txnAmt);
	}
}
function onPaymentTypeSelect(obj){
	hideShowBankPaymentTypeOptions(obj);
}
