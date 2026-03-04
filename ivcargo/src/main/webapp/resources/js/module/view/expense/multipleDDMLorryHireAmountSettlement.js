var BranchExpenseConfigurationG	 = null;
var moduleId=0;
var	ModuleIdentifierConstant 	= null;
var PaymentTypeConstant			= null;
var	incomeExpenseModuleId		= 0;
var GeneralConfiguration		= null;
var totalAmount 			= 0;
var lorryhirecharges		= 0
var totalAmountDDM 			= 0;
var lorryhirechargesDDM		= 0
var BranchExpenseConfiguration = null;
var ddmConfiguration = null;
var totalTdsAmount = 0;

define(
		[
		 'JsonUtility',
		 'messageUtility',
		 '/ivcargo/resources/js/generic/urlparameter.js',
		 'jquerylingua',
		 'language',
		 'autocomplete',
	     'autocompleteWrapper',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation',
		 'moment',
		 '/ivcargo/resources/js/confirm/jquery.confirm.min.js',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
		 PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'],
		 function(JsonUtility, MessageUtility, UrlParameter, Lingua, Language, AutoComplete, AutoCompleteWrapper, BootstrapSwitch, NodValidation, FocusNavigation,
				 moment,JConfirm,BootstrapModal, Selection) {
			'use strict';
			let jsonObject = new Object(), myNod, _this = '',ddmLorryHireTdsProperty,tdsChargeList, executive, BranchExpenseConfiguration = null,
			exepenseVoucherDetailsId = 0, paymentVoucherSequenceNumber = "",paymentStatusArrForSelection,c = 0,balanceAmount,count = 0 ,DDMNumberArrCount = new Array(),
			printBtn,exepenseVoucherDetailsIdArr=new Array(),PaymentVoucherSequenceNumberArr = new Array(),paymentTypeArr = new Array(),allowPartialPayment = false,option_1=1,option_2=2,option_3=3,doneTheStuff=false,debitToBranch = false,DDMNumberForRepay,ddmBranchIdForRepay,repayMentWindow=false,minDate,maxDate,
			paymentVoucherNumber= 0, isAllowToCreateSingleVoucher = false, isSingleVoucherCheckedByDefault = false,debitTobranchArr = null;
			
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this = this;
					exepenseVoucherDetailsId 		= UrlParameter.getModuleNameFromParam('voucherDetailsId');
					paymentVoucherSequenceNumber  	= UrlParameter.getModuleNameFromParam('paymentVoucherSequenceNumber');
					DDMNumberForRepay				= UrlParameter.getModuleNameFromParam('DDMNumberForRepay');
					ddmBranchIdForRepay				= UrlParameter.getModuleNameFromParam('ddmBranchId');
					repayMentWindow					= UrlParameter.getModuleNameFromParam('repayMentWindow');
					
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/multipleDdmLorryHireAmountSettlementWS/loadDDMLorryHireAmount.do?', _this.renderDDMHireAmountSettlementElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderDDMHireAmountSettlementElements : function(response) {
					showLayer();
					let loadelement = new Array();
					let baseHtml 	= new $.Deferred();
					let paymentHtml	= new $.Deferred();
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/expense/multipleDDMLorryHireAmountSettlement.html",
							function() {
						baseHtml.resolve();
					});
					
					$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html",
							function() {
						paymentHtml.resolve();
					});
					loadelement.push(paymentHtml);
					
					$.when.apply($, loadelement).done(function() {
						setIssueBankAutocomplete();
						setAccountNoAutocomplete();
						setPumpNameAutocomplete();

						$("#viewAddedPaymentDetailsCreate").css("display", "block");
						
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('ddmlorryhireDetailsBtn', 'hide');
						refreshAndHidePartOfPage('ddmLoryyHireSummaryTableDivBtn', 'hide');

						hideLayer();
						executive							= response.executive;
						ddmLorryHireTdsProperty				= response.DDMLorryHireTdsProperty;
						tdsChargeList						= response.TDSChargeInPercent;
						BranchExpenseConfiguration			= response.BranchExpenseConfiguration;
						paymentStatusArrForSelection		= response.paymentStatusArrForSelection;
						paymentTypeArr						= response.paymentTypeArr;
						moduleId							= response.moduleId;
						ModuleIdentifierConstant 			= response.ModuleIdentifierConstant;
						PaymentTypeConstant 				= response.PaymentTypeConstant;
						incomeExpenseModuleId				= response.incomeExpenseModuleId;
						GeneralConfiguration				= response.GeneralConfiguration;
						ddmConfiguration					= response.ddmConfiguration;
						isAllowToCreateSingleVoucher		= ddmConfiguration.isAllowToCreateSingleVoucher;
						isSingleVoucherCheckedByDefault    	= ddmConfiguration.isSingleVoucherCheckedByDefault;

						$("#ddmNumberEle").focus();
						response.executiveTypeWiseBranch	= true;

						$('#viewAllEle').click(function() {
							if(Number($('#searchByOption').val()) != option_1){
								_this.checkDateSelection();
							}
						});

						$('#searchByOption').on('change',function(){
							$("#reportTable tbody").empty();
							$("#ddmDetails tbody").empty();
							$('#totalTable tbody').empty();
							$("#ddmLoryyHireSummaryTable tbody").empty();
							refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
							refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
							refreshAndHidePartOfPage('ddmlorryhireDetailsBtn', 'hide');
							
							DDMNumberArrCount = [];

							if(Number($('#searchByOption').val()) == option_1){
								$('#ddmNumberAndBranchDiv').removeClass('hide');
								$('#searchBtnDiv').removeClass('hide');
								$('#vehicleNumberDiv').addClass('hide');
								$('#vehicleAgentNameDiv').addClass('hide');
								$('#dateDiv').addClass('hide');
								$('#viewAllEle').attr('checked',false);
							} else if (Number($('#searchByOption').val()) == option_2){
								$('#ddmNumberAndBranchDiv').addClass('hide');
								$('#vehicleNumberDiv').removeClass('hide');
								$('#searchBtnDiv').removeClass('hide');
								$('#vehicleAgentNameDiv').addClass('hide');
							} else if (Number($('#searchByOption').val()) == option_3){
								$('#ddmNumberAndBranchDiv').addClass('hide');
								$('#vehicleNumberDiv').addClass('hide');
								$('#vehicleAgentNameDiv').removeClass('hide');
								$('#searchBtnDiv').removeClass('hide');
							} else {
								$('#ddmNumberAndBranchDiv').addClass('hide');
								$('#vehicleNumberDiv').addClass('hide');
								$('#vehicleAgentNameDiv').addClass('hide');
								$('#searchBtnDiv').addClass('hide');
							}
						});

						if (ddmConfiguration.hideVehicleNumberSelection) {
							let vehicleNumberOption = document.querySelector('#searchByOption option[value="2"]');
							
							if (vehicleNumberOption)
								vehicleNumberOption.style.display = 'none';
						}
	
						if (ddmConfiguration.hideVehicleAgentSelection) {
							let vehicleAgentOption = document.querySelector('#searchByOption option[value="3"]');
							
							if (vehicleAgentOption)
								vehicleAgentOption.style.display = 'none';
						}
							
						let autoVehicleNumber 			= new Object();
						autoVehicleNumber.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getVehicleNumberAutocomplete.do?viewAll=true&hideOwnVehicleNumbers='+ddmConfiguration.hideOwnVehicleNumbers;

						autoVehicleNumber.primary_key 	= 'vehicleNumberMasterId';
						autoVehicleNumber.field 		= 'vehicleNumber';
						$("#vehicleNumber").autocompleteCustom(autoVehicleNumber);

						let vehicleAgent 			= new Object();
						vehicleAgent.url			= WEB_SERVICE_URL+'/vehicleAgentMasterWS/getVehicleAgentForDropDown.do?viewAll=true';
						vehicleAgent.field			= 'name'; // response variable from WS
						vehicleAgent.primary_key	= 'vehicleAgentMasterId';
						$('#vehicleAgentEle').autocompleteCustom(vehicleAgent);

						response.isCalenderSelection	= true;

						let elementConfiguration	= new Object();
						elementConfiguration.branchElement		= $('#branchEle');
						elementConfiguration.dateElement		= $('#dateEle');
						response.elementConfiguration			= elementConfiguration;
						Selection.setSelectionToGetData(response);

						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});

						if(Number($('#searchByOption').val()) == option_1){
							myNod.add({
								selector		: '#ddmNumberEle',
								validate		: 'presence',
								errorMessage	: 'Enter DDM Number !'
							});

							myNod.add({
								selector		: '#branchEle',
								validate		: 'presence',
								errorMessage	: 'Select Branch !'
							});
						}

						if(Number($('#searchByOption').val()) == option_2){
							myNod.add({
								selector		: '#vehicleNumber',
								validate		: 'presence',
								errorMessage	: 'Select Vehicle Number !'
							});
							myNod.add({
								selector		: '#vehicleAgentEle',
								validate		: 'presence',
								errorMessage	: 'Select Vehicle Name !'
							});
						}

						$("#findBtn").click(function() {
							myNod.performCheck();
							
							if(Number($('#searchByOption').val()) == option_1) {
								if($("#ddmNumberEle").val() == ""){
									showAlertMessage('error','Please type proper DDM Number !!');
									$("#ddmNumberEle").focus();
									return false;
								}
								
								if($("#branchEle_primary_key").val() == "") {
									showAlertMessage('error','Please Select Proper Branch !!');
									$("#branchEle").focus();
									return false;
								}
							} else if (Number($('#searchByOption').val()) == option_2) {
								$('#ddmDetails tbody').empty();
								$('#ddmLoryyHireSummaryTable tbody').empty();
								
								if($("#vehicleNumber_primary_key").val() == ""){
									showAlertMessage('error','Please Select Proper vehicle !!');
									$("#vehicleNumber").focus();
									return false;
								}
							} else if (Number($('#searchByOption').val()) == option_3) {
								$('#ddmDetails tbody').empty();
								$('#ddmLoryyHireSummaryTable tbody').empty();
								
								if($("#vehicleAgentEle_primary_key").val() == "") {
									showAlertMessage('error','Please type proper agent !!');
									$("#vehicleAgentEle").focus();
									return false;
								}
							} else {
								showAlertMessage('error','Please select from frop down for search !!');
								return false;
							}
							
							if(myNod.areAll('valid'))
								_this.onFind(0);
						});
						
						if(exepenseVoucherDetailsId > 0 && paymentVoucherSequenceNumber != null) {
							printBtn = $('<b>Voucher No :</b> ' + paymentVoucherSequenceNumber + '&emsp;<button type="button" name="reprintBtn" id="reprintBtn" class="btn btn-success" data-tooltip="Reprint">Reprint</button><div class="row">&nbsp;</div>')
							$('#reprintOption').append(printBtn);

							$("#reprintBtn").bind("click", function() {
								_this.openPrint(exepenseVoucherDetailsId);
							});
						}
						
						if(ddmBranchIdForRepay != null && DDMNumberForRepay != null && ddmBranchIdForRepay > 0 && DDMNumberForRepay > 0){
							let jsonObject 					= new Object();
							jsonObject.DDMNumber			= DDMNumberForRepay;
							jsonObject.searchBy				= 1;
							jsonObject.branchId				= ddmBranchIdForRepay;
							$('#top-border-boxshadow').addClass('hide');
							getJSON(jsonObject, WEB_SERVICE_URL + '/multipleDdmLorryHireAmountSettlementWS/getDDMLorryHireAmountSettlementData.do', _this.setDDMDetailsData, EXECUTE_WITH_ERROR);
						}
						
						$('#paymentType').append($("<option>").attr('value', 0).text("-- Please Select-----"));
						$('#paymentMode').append($("<option>").attr('value', 0).text("-- Please Select-----"));

						$(paymentTypeArr).each(function() {
							$('#paymentMode').append($("<option>").attr('value', this.paymentTypeId).text(this.paymentTypeName));
						});

						$(paymentStatusArrForSelection).each(function() {
							$('#paymentType').append($("<option>").attr('value', this.paymentStatusId).text(this.paymentStatusName));
						});
						
						if(ddmLorryHireTdsProperty.isAllowCentralizedTDS){
							$('#isCretraliseTDS').removeClass('hide');
							$('#centralizeTds').append($("<option>").attr('value', 0).text("--Please Select--"));
							$(tdsChargeList).each(function() {
								$('#centralizeTds').append($("<option>").attr('value', this).text(this));
							});
							$("#centralizeTds").change(function() {
								_this.calculateCentralizedTDSAmount();
							});
						}
												
						$("#paymentType").change(function(){
							 $('.selectAllPaymentType').prop('selectedIndex', $(this).prop('selectedIndex'))
						});		

						if(isAllowToCreateSingleVoucher) {
							$("#isSingleVoucher").removeClass('hide');
													
							$('#isSingleVoucherCheckbox').click(function() {
								let paymentModeVal = parseInt($('#paymentMode').val() || 0);
								
								if(this.checked)
									$('.selectAllPaymentMode').attr('disabled', 'disabled');
								else if(paymentModeVal <= 0)
									$('.selectAllPaymentMode').removeAttr('disabled');
							});
						}				
						
						$("#btSubmit").on("click" ,function() {
							if($('#reportTable :input[type="checkbox"]:checked').length > Number(ddmConfiguration.maxNoOfDDMForSettlement)) {
								showAlertMessage('info','Can Settle More Than ' + ddmConfiguration.maxNoOfDDMForSettlement + ' DDM');
								return false;
							}
																								
							_this.settleDDMLorryHireNew();
						});
					});
				}, onFind : function(deliveryRunSheetLedgerId) {
					totalAmount 			= 0;
					lorryhirecharges		= 0
					showLayer();
					let jsonObject = new Object();
					
					$('#cremark').val("");
					
					let ddmNumber = ''

					if(deliveryRunSheetLedgerId > 0) {
						jsonObject.deliveryRunSheetLedgerId			= deliveryRunSheetLedgerId;
					} else {
						ddmNumber					= $('#ddmNumberEle').val();
						jsonObject.DDMNumber			= ddmNumber.replace(/\s+/g, "");
						jsonObject.searchBy				= $('#searchByOption').val();
						jsonObject.branchId				= $('#branchEle_primary_key').val();
						jsonObject.vehicleNumberId		= $('#vehicleNumber_primary_key').val();
						jsonObject.vehicleAgentId		= $('#vehicleAgentEle_primary_key').val();
						
						if($('#dateDiv').is(":visible")) {
							if($("#dateEle").attr('data-startdate') != undefined)
								jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
							
							if($("#dateEle").attr('data-enddate') != undefined)
								jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
							
							jsonObject.filter		= 1;
						} else
							jsonObject.filter		= 0;
					}
										
					if(ddmNumber != "" && Number($('#searchByOption').val()) == option_1)
						getJSON(jsonObject, WEB_SERVICE_URL + '/multipleDdmLorryHireAmountSettlementWS/getDDMLorryHireAmountSettlementData.do', _this.setDDMDetailsData, EXECUTE_WITH_ERROR);
					else
						getJSON(jsonObject, WEB_SERVICE_URL + '/multipleDdmLorryHireAmountSettlementWS/getDDMLorryHireAmountSettlementData.do', _this.setDDMDetailsDataSearchedByVehicle, EXECUTE_WITH_ERROR);
				}, setDDMDetailsData : function(response) {
					if(response.message != undefined) {
						hideLayer();
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('ddmlorryhireDetailsBtn', 'hide');
						refreshAndHidePartOfPage('ddmLoryyHireSummaryTableDivBtn', 'hide');
						return;
					}
					
					showPartOfPage('ddmlorryhireDetailsBtn');
					showPartOfPage('middle-border-boxshadow');
					showPartOfPage('ddmLoryyHireSummaryTableDivBtn');
					$('#ddmDetails tbody').empty();
					$("#centralizeTds").val(0);
					_this.setDataInTable(response);
					hideLayer();
				}, setDataInTable : function(data) {
					hideLayer();
					let columnArray						= new Array();
					let deliveryRunSheetLedgerlist		= data.DeliveryRunSheetLedger;
					let ddmLorryHireSummary				= data.expenseSettlementList;
					allowPartialPayment					= data.allowPartialPayment;
					debitToBranch						= data.debitToBranch;
					debitTobranchArr 					= data.debitTobranchArr;
					
					if(deliveryRunSheetLedgerlist.length > 0)
						showPartOfPage('bottom-border-boxshadow');
					
					minDate			= data.minDate;
					maxDate			= data.maxDate;
					$('#totalTable tbody').empty();
					
					$("*[data-attribute=manualDate]").removeClass("hide");
					let dateOption	= new Object();
					
					dateOption.minDate	= minDate; 
					dateOption.maxDate	= maxDate;
					dateOption.startDate= maxDate;
					
					$("#manualDateEle").SingleDatePickerCus(dateOption);
					_this.setDDMlorryhireDetails(deliveryRunSheetLedgerlist);
					
					if(!debitToBranch)
						$(".debitToBranchData").remove();
					
					$(".paymentTypeSelection").removeClass("hide");
					
					$("#paymentType").change(function() {
						$('.selectAllPaymentType').prop('selectedIndex', $(this).prop('selectedIndex'))
					});
						
					$("#paymentMode").change(function() {
						var val = parseInt($(this).val() || 0);
						
						 let selectindex = $(this).prop('selectedIndex');
						 $('.selectAllPaymentMode').prop('selectedIndex', selectindex)
						 
						if(val > 0){
							$('.selectAllPaymentMode').prop('disabled', true);
						}else if (!$('#isSingleVoucherCheckbox').prop('checked'))
							$('.selectAllPaymentMode').prop('disabled', false);
					});
									
					$("#cremark").on("input", function() {
						 let remarkValue = $(this).val();
						 $('.setAllRemark').val(remarkValue);
					});

					columnArray = new Array();
					count	= DDMNumberArrCount.length;

					for (const obj of deliveryRunSheetLedgerlist) {
						count++;
						
						balanceAmount 					= obj.dueAmount;
						let deliveryRunSheetLedgerId 	= obj.deliveryRunSheetLedgerId;
						lorryhirechargesDDM				+= obj.deliveryRunSheetLedgerLorryHireAmount;	
						
						if(isValueExistInArray(DDMNumberArrCount, deliveryRunSheetLedgerId)) {
							showMessage('info','DDM Already Added , Please Reload (F5) !');
							return false;
						}
						
						DDMNumberArrCount.push(deliveryRunSheetLedgerId);
						totalAmountDDM += balanceAmount;
						 
						columnArray.push("<td><input type='checkbox' id='singleCheckBox" + obj.deliveryRunSheetLedgerId + "' name='singleCheckBox' class='form-control singleCheckBox' value='" + obj.deliveryRunSheetLedgerId + "'/></td>");
						columnArray.push("<td style='text-align: center; font-weight: bold;'>" + count + "</td>");
						columnArray.push("<td><input type='text' id='DDMNumber" + obj.deliveryRunSheetLedgerId + "' name='pickupNumber' class='form-control' value='"+obj.deliveryRunSheetLedgerDDMNumber+ "' style='width:  170px; text-align: right; background-color: #9bd6f2;text-align: center;font-weight:bold' onkeypress='return noNumbers(event);' readonly='readonly' /></td> ");
						columnArray.push("<td><input type='text' id='lorryHireAmount" + obj.deliveryRunSheetLedgerId+"' name='lorryHireAmount' value='"+ obj.deliveryRunSheetLedgerLorryHireAmount + "' class='form-control' maxlength='7'  style='width:  170px; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td class='paymentTypeSelection'><select style='' name='paymentType' id='paymentType" + obj.deliveryRunSheetLedgerId+"' class='form-control width-150px selectAllPaymentType' onchange='changeClearPayment(" + deliveryRunSheetLedgerId+",this,"+ obj.dueAmount +")'onfocus='' ></select></td>");
						columnArray.push("<td class='paymentModeSelection'><select style='' name='paymentMode' id='paymentMode" + obj.deliveryRunSheetLedgerId+"' onchange='onPaymentModeSelect(" + obj.deliveryRunSheetLedgerId+",this);' class='form-control width-150px selectAllPaymentMode' onchange=''onfocus='' ></select></td>");
						columnArray.push("<td><input type='text' onfocus='if(this.value=='0')this.value=''; id='amount" + obj.deliveryRunSheetLedgerId+"' name='amount' placeholder='Amount' value='' maxlength='7' class='inputAmount inputAmt form-control' oninput='calculateTotal()' style='width: 170px; text-align: right;' onkeypress='return noNumbers(event);' onblur='clearIfNotNumeric(this,0);'/></td>");
						columnArray.push("<td class='tdsrateCol'><select name='tdsrate' id='tdsrate_" + obj.deliveryRunSheetLedgerId+"' class='form-control selectAllTDSRate'></select></td>");
						columnArray.push("<td class='datatd tdsamountCol' align='left' width=''><input type='text' id='tdsamount" + obj.deliveryRunSheetLedgerId+"'  name='tdsamount' class='form-control allCentralizeTDSAmount' value='0' maxlength='7'  style='width:  100px; text-align: right;' onkeypress='return noNumbers(event);' onblur='clearIfNotNumeric(this,0);' onkeyup=''onfocus='if(this.value=='0')this.value='';'/></td>");
						columnArray.push("<td class='hide'><input type='text' id='dueAmount_" + obj.deliveryRunSheetLedgerId+"' name='balanceAmount' value='" + obj.dueAmount + "' maxlength='7' class='form-control dueAmount' style='display: none; width: 170px; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td><input type='text' id='balanceAmount" + obj.deliveryRunSheetLedgerId+"' name='balanceAmount' value='" + obj.dueAmount + "' maxlength='7' class='form-control' style='width: 170px; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td class='hide'><input type='hidden' id='balanceAmount1" + obj.deliveryRunSheetLedgerId+"' name='balanceAmount1' value='" + obj.dueAmount + "' maxlength='7' class='form-control' style='width: 170px; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td class='panNumberCol'><input type='text'  id='panNumber" + obj.deliveryRunSheetLedgerId+"' name='panNumber' placeholder='PAN Number' class='form-control' style='width: 200px; text-transform: uppercase;' maxlength='10'></input></td>");
						columnArray.push("<td class='tanNumberCol'><input type='text'  id='tanNumber" + obj.deliveryRunSheetLedgerId+"' name='tanNumber' placeholder='TAN Number' class='form-control' style='width: 200px; text-transform: uppercase;' maxlength='10'></input></td>");
						columnArray.push("<td><input type='text' id='remark" + obj.deliveryRunSheetLedgerId+"' name='remark' placeholder='Remark' class='form-control setAllRemark' style='width: 200px; text-transform: uppercase;' maxlength='250'></input></td>");
						
						if(debitToBranch)
							columnArray.push("<td id='debitToBranch_" + obj.deliveryRunSheetLedgerId+"' class='tableFont debitToBranchData' style='text-align: center'><select class='form-control' id='debitToBranchSelection_" + obj.deliveryRunSheetLedgerId+"' ></select></td>");
					 	
						$('#reportTable tbody').append("<tr id=billDetails'" + obj.deliveryRunSheetLedgerId+"'>" + columnArray.join(' ') + '</tr>');
						
						if(debitToBranch)
							_this.setDebitToBranch(obj.deliveryRunSheetLedgerId);
						
						columnArray	= [];

						if(allowPartialPayment) {
							$(".paymentTypeSelection").removeClass("hide");
							$('#paymentType' + obj.deliveryRunSheetLedgerId+' option[value]').remove();
							$('#paymentType' + obj.deliveryRunSheetLedgerId).append($("<option>").attr('value', 0).text("-- Please Select-----"));
							$('#paymentMode' + obj.deliveryRunSheetLedgerId+' option[value]').remove();
							$('#paymentMode' + obj.deliveryRunSheetLedgerId).append($("<option>").attr('value', 0).text("-- Please Select-----"));

							$(paymentStatusArrForSelection).each(function() {
								$('#paymentType' + obj.deliveryRunSheetLedgerId).append($("<option>").attr('value', this.paymentStatusId).text(this.paymentStatusName));
							});
							
							$(paymentTypeArr).each(function() {
								$('#paymentMode' + obj.deliveryRunSheetLedgerId).append($("<option>").attr('value', this.paymentTypeId).text(this.paymentTypeName));
							});
							
							$("#paymentType").bind("change", function() {
								_this.calculateTDSAmount(this.value);
							});
						} else {
							$(".paymentTypeSelection").remove();
							$(".paymentModeSelection").remove();
							$(".allPaymentType").remove();	
						}
						
						if(ddmLorryHireTdsProperty.IsTdsAllow) {
							$("#tdsrate_" + obj.deliveryRunSheetLedgerId).empty();
							$('#tdsrate_' + obj.deliveryRunSheetLedgerId).append('<option value="0" selected="selected">--Select--</option>');

							if(tdsChargeList != undefined && typeof tdsChargeList != 'undefined' && tdsChargeList.length > 0) {
								for(const element of tdsChargeList) {
									$('#tdsrate_' + obj.deliveryRunSheetLedgerId).append('<option value="' + element + '" id="' + element + '">' + element + '</option>');
									$('#centralizeTds' + obj.deliveryRunSheetLedgerId).append('<option value="' + element + '" id="' + element + '">' + element + '</option>');
								} 
							} else
								$('.tdsrateCol').remove();

							if(!ddmLorryHireTdsProperty.IsPANNumberRequired)
								$('.panNumberCol').remove();

							if(!ddmLorryHireTdsProperty.IsTANNumberRequired)
								$('.tanNumberCol').remove();
						} else {
							$('.tdsamountCol').remove();
							$('.tdsrateCol').remove();
							$('.panNumberCol').remove();
							$('.tanNumberCol').remove();
							$('#bottom-border-boxshadow').removeAttr('style')
						}

						$("#amount" + obj.deliveryRunSheetLedgerId).bind("blur", function() {
							_this.validateReceiveAmount(obj);
						});

						$("#amount" + obj.deliveryRunSheetLedgerId).bind("keyup", function() {
							_this.validateReceiveAmount(obj);
						});
												
						$("#tdsamount" + obj.deliveryRunSheetLedgerId).bind("keyup", function() {
							_this.validateTDSAmount(obj);
						});

						$("#tdsrate_" + obj.deliveryRunSheetLedgerId).bind("change", function() {
							_this.calculateTDSAmount(obj);
						});
					}
				
					if (ddmLorryHireTdsProperty.IsTdsAllow && ddmConfiguration.centralizedPaymentModeSelectionForAll) {
						$(".allPaymentType").removeClass("hide");
						columnArray.push("<td style='text-align: center; width:270px; vertical-align: inherit; font-size: 19px;'>Total</td>");
						columnArray.push("<td style='text-align: right; width:191px;'><input id='lorryhirchg' class='form-control' style='text-align: end;' readonly value='" + lorryhirechargesDDM + "' /></td>");
						columnArray.push("<td style='text-align: right; width:198px;' ></td>");
						columnArray.push("<td style='text-align: right; width:187px;' >  <input id='sumtotal1' class='form-control ' style='text-align: end;' readonly value='0'/></td>");
						columnArray.push("<td class='tdsrateCol' style='text-align: right; width:68px;' ></td>");
						columnArray.push("<td class='tdsrateCol' style='text-align: right; width:123px;' > <input id='totalTdsAmountId' class='form-control' style='text-align: end;' readonly value='0'/> </td>");
						columnArray.push("<td style='text-align: right; width:188px;' > <input id='balancetotal1' class='form-control ' style='text-align: end;' readonly value='" + totalAmountDDM + "'/> </td>");		
						columnArray.push("<td style='text-align: right;' > <span><B>Total Pay</B> </span> <input id='totalPayAmount' class='form-control resetAmount' style='text-align: end; text-align: end; width: 130px; display: inline; margin-left: 8px;' readonly value='0'/> </td>");
						$('#totalTable tbody').append("<tr>" + columnArray.join(' ') + '</tr>');
						
						columnArray = [];
					}else if (ddmConfiguration.centralizedPaymentModeSelectionForAll) {
						$(".allPaymentType").removeClass("hide");
						columnArray.push("<td style='text-align: center; width:298px; vertical-align: inherit; font-size: 19px;'>Total</td>");
						columnArray.push("<td style='text-align: right; width:15%;'><input id='lorryhirchg' class='form-control' style='text-align: end; width:170px;' readonly value='" + lorryhirechargesDDM + "' /></td>");
						columnArray.push("<td style='text-align: right; width:20%;' ></td>");
						columnArray.push("<td style='text-align: right; width:187px;' >  <input id='sumtotal1' class='form-control ' style='text-align: end;' readonly value='0'/></td>");
						columnArray.push("<td style='text-align: right; width:16%;' > <input id='balancetotal1' class='form-control ' style='text-align: end; width:170px;' readonly value='" + totalAmountDDM + "'/> </td>");		
						columnArray.push("<td style='text-align: center; width:%;'>&nbsp;</td>");
						$('#totalTable tbody').append("<tr>" + columnArray.join(' ') + '</tr>');
						columnArray = [];
					}
					
					$('#paymentType').on('change', function() {
						let paymentTypeVal = $('#paymentType').val(); 
						
						$('.dueAmount').each((el, index) => {
							let id	= index.id.split('_')[1];
							let dueAmts =index.value;
							
							if (paymentTypeVal == PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID) {
								$('#amount'+id).val(dueAmts);
								$('#balanceAmount'+id).val(0);	
								$('#sumtotal1').val(totalAmountDDM);	
								$('#balancetotal1').val(0);
							} else {
								$('#balanceAmount'+id).val(dueAmts);
								$('#amount'+id).val(0);
								$('#balancetotal1').val(totalAmountDDM);
								$('#sumtotal1').val(0);	
							}
						});
						_this.calculateTotalTDSAmount();
					});
					
					if(ddmLorryHireSummary.length > 0) {
						setTimeout(function() { 
							$('#ddmLoryyHireSummaryTableDiv').removeClass('hide');
							$('#ddmLoryyHireSummaryTableDiv').removeAttr('style');
							$('#ddmLoryyHireSummaryTableDivBtn').removeClass('hide');
						}, 200);

						let receivedAmount = 0;

						for (const element of ddmLorryHireSummary) {
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.paymentVoucherNumber + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.branchName + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.paymentModeName + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.receivedAmount + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.expenseDateTimeString + "</td>");
							$('#ddmLoryyHireSummaryTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');

							columnArray	= [];

							receivedAmount += element.receivedAmount;
						}

						columnArray.push("<td style='text-align: center; vertical-align: middle; font:bold;'>Total</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>"+receivedAmount+"</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
						$('#ddmLoryyHireSummaryTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					} else {
						refreshAndHidePartOfPage('ddmLoryyHireSummaryTableDiv', 'hide');
						refreshAndHidePartOfPage('ddmLoryyHireSummaryTableDivBtn', 'hide');
						removeTableRows('ddmLoryyHireSummaryTable', 'tbody');
					}
					
					_this.checkSingleVoucherByDefault(isSingleVoucherCheckedByDefault);
												
					}, validateReceiveAmount : function(obj) {
					let forDDM	= ' for DDM ' + $('#DDMNumber' + obj.deliveryRunSheetLedgerId).val();
					
					if(Number($('#lorryHireAmount' + obj.deliveryRunSheetLedgerId).val()) == Number($('#balanceAmount1' + obj.deliveryRunSheetLedgerId).val())) {
						if(Number($('#amount' + obj.deliveryRunSheetLedgerId).val()) > Number($('#lorryHireAmount' + obj.deliveryRunSheetLedgerId).val())) {
							showMessage('error', 'You can not enter greater value than ' + Number($('#lorryHireAmount' + obj.deliveryRunSheetLedgerId).val()) + forDDM);
							return false;
						}

						$('#balanceAmount' + obj.deliveryRunSheetLedgerId).val(Number($('#lorryHireAmount' + obj.deliveryRunSheetLedgerId).val()) - Number($('#amount' + obj.deliveryRunSheetLedgerId).val()));
					} else if(Number($('#lorryHireAmount' + obj.deliveryRunSheetLedgerId).val()) > Number($('#balanceAmount1' + obj.deliveryRunSheetLedgerId).val())) {
						if(allowPartialPayment) {
							if(Number($('#amount' + obj.deliveryRunSheetLedgerId).val()) > Number($('#balanceAmount1' + obj.deliveryRunSheetLedgerId).val())) {
								showMessage('error', 'You can not enter greater value than ' + Number($('#balanceAmount1' + obj.deliveryRunSheetLedgerId).val()) + forDDM);
								return false;
							}
						} else if(Number($('#amount' + obj.deliveryRunSheetLedgerId).val()) > Number($('#lorryHireAmount' + obj.deliveryRunSheetLedgerId).val())) {
							showMessage('error', 'You can not enter greater value than ' + Number($('#lorryHireAmount' + obj.deliveryRunSheetLedgerId).val()) + forDDM);
							return false;
						}
						
						$('#balanceAmount' + obj.deliveryRunSheetLedgerId).val(Number($('#balanceAmount1' + obj.deliveryRunSheetLedgerId).val()) - Number($('#amount' + obj.deliveryRunSheetLedgerId).val()));
					}
					
					_this.calculateTDSAmount(obj);
				}, validateReceiveAmountForVehicleSearch : function(obj) {
					let objVal				= 0;
					totalAmountDDM 			= 0;
					lorryhirechargesDDM		= 0;
					lorryhirecharges    = 0;
					
					let table 	= $("#reportTable");
					let count 	= parseFloat(table[0].rows.length - 1);

					for (let row = count; row > 0; row--) {
						let deliveryRunSheetLedgerId = 	table[0].rows[row].cells[0].firstChild.value;
						
						let forDDM	= ' for DDM ' + $('#DDMNumber' + deliveryRunSheetLedgerId).val();
					
						if(Number($('#lorryHireAmount' + deliveryRunSheetLedgerId).val()) == Number($('#balanceAmount1' + deliveryRunSheetLedgerId).val())) {
							if(Number($('#amount' + deliveryRunSheetLedgerId).val()) > Number($('#lorryHireAmount' + deliveryRunSheetLedgerId).val())) {
								showMessage('error', 'You can not enter greater value than ' + Number($('#lorryHireAmount' + deliveryRunSheetLedgerId).val()) + forDDM);
								return false;
							}

							$('#balanceAmount' + deliveryRunSheetLedgerId).val(Number($('#lorryHireAmount' + deliveryRunSheetLedgerId).val()) - Number($('#amount' + deliveryRunSheetLedgerId).val()));
						} else if(Number($('#lorryHireAmount' + deliveryRunSheetLedgerId).val()) > Number($('#balanceAmount1' + deliveryRunSheetLedgerId).val())) {
							if(!allowPartialPayment) {
								if(Number($('#amount' + deliveryRunSheetLedgerId).val()) > Number($('#lorryHireAmount' + deliveryRunSheetLedgerId).val())) {
									showMessage('error', 'You can not enter greater value than ' + Number($('#lorryHireAmount' + deliveryRunSheetLedgerId).val()) + forDDM);
									return false;
								}
							}
							
							// If allowPartialPayment is true, then check if amount is greater than balanceAmount1
							if(allowPartialPayment) {
								if(Number($('#amount' + deliveryRunSheetLedgerId).val()) > Number($('#balanceAmount1' + deliveryRunSheetLedgerId).val())) {
									showMessage('error', 'You can not enter greater value than ' + Number($('#balanceAmount1' + deliveryRunSheetLedgerId).val()) + forDDM);
									return false;
								}
							}
							
							$('#balanceAmount' + deliveryRunSheetLedgerId).val(Number($('#balanceAmount1' + deliveryRunSheetLedgerId).val()) - Number($('#amount' + deliveryRunSheetLedgerId).val()));
						}
						
						_this.calculateTDSAmountForVehicleSearch(obj);
					}
				}, validateTDSAmount : function(obj) {
					if(obj.value > Number($('#amount' + obj.deliveryRunSheetLedgerId).val())) {
						showMessage('info', 'You can not enter greater value than ' + Number($('#amount').val()));
						obj.value = 0;
					}
				}, validateTDSAmountForVehicleSearch : function(obj) {
					let table 	= $("#reportTable");
					let count 	= parseFloat(table[0].rows.length-1);

					for (let row = count; row > 0; row--) {
						let deliveryRunSheetLedgerId = 	table[0].rows[row].cells[0].firstChild.value;
							
						if(Number($('#tdsamount' + deliveryRunSheetLedgerId).val()) > Number($('#amount' + deliveryRunSheetLedgerId).val())) {
							showMessage('info', 'You can not enter greater value than ' + Number($('#amount' + deliveryRunSheetLedgerId).val()));
							$('#tdsamount' + deliveryRunSheetLedgerId).val('0');
						}
					}
				}, calculateTDSAmount : function(obj) {
					let amount		= $('#lorryHireAmount' + obj.deliveryRunSheetLedgerId).val();
					let tdsrate		= $('#tdsrate_' + obj.deliveryRunSheetLedgerId).val();
					
					if(amount > 0 && tdsrate > 0)
						$('#tdsamount' + obj.deliveryRunSheetLedgerId).val((amount * tdsrate) / 100);
					_this.calculateTotalTDSAmountOnChange();
				}, calculateTDSAmountForVehicleSearch : function(obj) {
					let table 	= $("#reportTable");
					let count 	= parseFloat(table[0].rows.length - 1);

					for (let row = count; row > 0; row--) {
						if(table[0].rows[row].cells[0].firstChild.checked) {
							let deliveryRunSheetLedgerId = table[0].rows[row].cells[0].firstChild.value;
							
							let amount		= $('#lorryHireAmount' + deliveryRunSheetLedgerId).val();
							let tdsrate		= $('#tdsrate_' + deliveryRunSheetLedgerId).val();
							
							if(amount > 0 && tdsrate > 0) {
								$('#tdsamount' + deliveryRunSheetLedgerId).val((amount * tdsrate) / 100);
							}
						}
					}
				}, validateDetails: function(obj){
					if(!validateInputTextFeild(1, 'amount' + obj.deliveryRunSheetLedgerId, 'amount' + obj.deliveryRunSheetLedgerId, 'error', amountEnterErrMsg))
						return false;
						
					if($('#paymentType' + obj.deliveryRunSheetLedgerId).val() == 0) {
						$("#paymentType" + obj.deliveryRunSheetLedgerId).focus();
						showMessage('error', ' Please Select Payment Type');
						return false
					}
					if($('#paymentMode' + deliveryRunSheetLedgerId).val() == 0) {
						$("#paymentMode" + deliveryRunSheetLedgerId).focus();
						showMessage('error', ' Please Select Payment Mode');
						return false
					}
						
					if(Number($('#paymentType' + obj.deliveryRunSheetLedgerId).val()) == PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID) {
						if(Number($('#amount' + obj.deliveryRunSheetLedgerId).val()) < Number($('#balanceAmount' + obj.deliveryRunSheetLedgerId).val())) {
							showMessage('error', 'You can not enter less value than ' + Number($('#lorryHireAmount' + obj.deliveryRunSheetLedgerId).val()));
							return false;
						}
					}
						
					if(Number($('#amount' + obj.deliveryRunSheetLedgerId).val()) > Number($('#lorryHireAmount' + obj.deliveryRunSheetLedgerId).val())){
						showMessage('error', 'You can not enter greater value than ' + Number($('#lorryHireAmount' + obj.deliveryRunSheetLedgerId).val()));
						return false;
					}
						
					if(!allowPartialPayment) {
						if(Number($('#amount' + obj.deliveryRunSheetLedgerId).val()) < balanceAmount1) {
							showMessage('error', iconForInfoMsg + ' You can not enter less value than ' + balanceAmount1);
							return false;
						}
					}
						
					if(Number($('#amount' + obj.deliveryRunSheetLedgerId).val()) > Number($('#lorryHireAmount' + obj.deliveryRunSheetLedgerId).val())) {
						$("#amount" + obj.deliveryRunSheetLedgerId).css("border-color", "red");
						$("#amount" + obj.deliveryRunSheetLedgerId).focus();
						showMessage('error', 'You can not enter greater value than ' + $('#lorryHireAmount' + obj.deliveryRunSheetLedgerId).val());
						return false;
					}
					
					if(ddmLorryHireTdsProperty.IsPANNumberRequired && ddmLorryHireTdsProperty.IsPANNumberMandetory) {
						if($('#tdsamount' + obj.deliveryRunSheetLedgerId).val() > 0 && !validateInputTextFeild(1, 'panNumber' + obj.deliveryRunSheetLedgerId, 'panNumber' + obj.deliveryRunSheetLedgerId, 'error', panNumberErrMsg)
						|| !validateInputTextFeild(8, 'panNumber' + obj.deliveryRunSheetLedgerId, 'panNumber' + obj.deliveryRunSheetLedgerId, 'info', validPanNumberErrMsg))
							return false;
					}
					
					if(ddmLorryHireTdsProperty.IsTANNumberRequired && ddmLorryHireTdsProperty.IsTANNumberMandetory) {
						if($('#tdsamount' + obj.deliveryRunSheetLedgerId).val() > 0 && !validateInputTextFeild(1, 'tanNumber' + obj.deliveryRunSheetLedgerId, 'tanNumber' + obj.deliveryRunSheetLedgerId, 'error', tanNumberErrMsg)
						|| !validateInputTextFeild(13, 'tanNumber' + obj.deliveryRunSheetLedgerId, 'tanNumber' + obj.deliveryRunSheetLedgerId, 'info', validTanNumberErrMsg))
							return false;
					}
					
					return !(!validateInputTextFeild(1, 'remark' + obj.deliveryRunSheetLedgerId, 'remark' + obj.deliveryRunSheetLedgerId, 'error', ramarkErrMsg));
				}, openPrint : function(exepenseVoucherDetailsId) {
					if(BranchExpenseConfiguration != null && BranchExpenseConfiguration.branchExpensePrintNewFlowAllow)
						window.open('BranchExpensePrint.do?pageId=25&eventId=43&voucherDetailsId=' + exepenseVoucherDetailsId, 'newwindow', 'config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
					else
						window.open('BranchExpensePrint.do?pageId=25&eventId=16&voucherDetailsId=' + exepenseVoucherDetailsId, 'newwindow', 'config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				}, setDDMDetailsDataSearchedByVehicle : function(response) {
					if(response.message != undefined) {
						hideLayer();
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('ddmlorryhireDetailsBtn', 'hide');
						refreshAndHidePartOfPage('ddmLoryyHireSummaryTableDivBtn', 'hide');

						return;
					}
					
					setTimeout(function() { 
						$("#ddmLoryyHireSummaryTableDivBtn").css('display','none');
					}, 500);
					
					showPartOfPage('middle-border-boxshadow');
					showPartOfPage('ddmlorryhireDetailsBtn');
					showPartOfPage('ddmLoryyHireSummaryTableDivBtn');
					$('#ddmDetails tbody').empty();
					$('#reportTable tbody').empty();
					$('#totalTable tbody').empty();
					$("#centralizeTds").val(0);

					hideLayer();
					let deliveryRunSheetLedgerlist		= response.DeliveryRunSheetLedger;
					let ddmLorryHireSummary				= response.expenseSettlementList;
					debitToBranch						= response.debitToBranch;
					debitTobranchArr 					= response.debitTobranchArr;
					allowPartialPayment					= response.allowPartialPayment;
					
					if(deliveryRunSheetLedgerlist.length > 0)
						showPartOfPage('bottom-border-boxshadow');
					
					minDate			= response.minDate;
					maxDate			= response.maxDate;

					if(!debitToBranch)
						$(".debitToBranchData").remove();
					
					$("*[data-attribute=manualDate]").removeClass("hide");
					
					let dateOption	= new Object();
					
					dateOption.minDate	= minDate;
					dateOption.maxDate	= maxDate;
					dateOption.startDate= maxDate;
					
					$("#manualDateEle").SingleDatePickerCus(dateOption);
					
					$(".paymentTypeSelection").removeClass("hide");
					
					$("#paymentMode").change(function(){
						 var val = parseInt($(this).val() || 0);

						 $('.selectAllPaymentMode').prop('selectedIndex', $(this).prop('selectedIndex'))
						 
						if(val > 0)
							$('.selectAllPaymentMode').prop('disabled', true);
						else if (!$('#isSingleVoucherCheckbox').prop('checked'))
							$('.selectAllPaymentMode').prop('disabled', false);
						
					});
						
					$("#cremark").on("input", function() {
						 $('.setAllRemark').val($(this).val());
					});
						
					_this.setDDMlorryhireDetails(deliveryRunSheetLedgerlist);
					
					let columnArray						= new Array();
					lorryhirecharges = 0;
					lorryhirechargesDDM = 0;
					count = 0;
					
					for (const element of deliveryRunSheetLedgerlist) {
						count++;
						var obj					= element;
						
						balanceAmount 			= obj.dueAmount;
						lorryhirecharges		+= obj.deliveryRunSheetLedgerLorryHireAmount;
	
						let deliveryRunSheetLedgerId 	= obj.deliveryRunSheetLedgerId;
						totalAmount += balanceAmount;
						columnArray.push("<td><input  type='checkbox' id='singleCheckBox" + obj.deliveryRunSheetLedgerId + "' name='singleCheckBox' class='form-control singleCheckBox' value='" + obj.deliveryRunSheetLedgerId + "'/></td>");
						columnArray.push("<td style='text-align: center; font-weight: bold;'>" + count + "</td>");
						columnArray.push("<td><input type='text' id='DDMNumber" + obj.deliveryRunSheetLedgerId + "' name='pickupNumber' class='form-control' value='"+obj.deliveryRunSheetLedgerDDMNumber+ "' style='width:  170px; text-align: right; background-color: #9bd6f2;text-align: center;font-weight:bold' onkeypress='return noNumbers(event);' readonly='readonly' /></td> ");
						columnArray.push("<td><input type='text' id='lorryHireAmount" + obj.deliveryRunSheetLedgerId+"' name='lorryHireAmount' value='"+ obj.deliveryRunSheetLedgerLorryHireAmount + "' class='form-control' maxlength='7'  style='width:  170px; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td class='paymentTypeSelection'><select style='' name='paymentType' id='paymentType" + obj.deliveryRunSheetLedgerId+"' class='form-control width-150px selectAllPaymentType' onchange='changeClearPayment(" + deliveryRunSheetLedgerId+",this,"+ obj.dueAmount +")'onfocus='' ></select></td>");
						columnArray.push("<td class=' paymentModeSelection'><select style='' name='paymentMode' id='paymentMode" + obj.deliveryRunSheetLedgerId+"' onchange='onPaymentModeSelect(" + obj.deliveryRunSheetLedgerId+",this);' class='form-control width-150px selectAllPaymentMode' onchange=''onfocus='' ></select></td>");
						columnArray.push("<td><input type='text' class=' inputAmount form-control' oninput='calculateTotal()' onfocus='if(this.value=='0')this.value=''; id='amount" + obj.deliveryRunSheetLedgerId+"' name='amount' placeholder='Amount' value='' maxlength='7' style='width: 170px; text-align: right;' onkeypress='return noNumbers(event);' onblur='clearIfNotNumeric(this,0);'/></td>");
						columnArray.push("<td class='tdsrateCol'><select name='tdsrate' id='tdsrate_" + obj.deliveryRunSheetLedgerId+"' class='form-control selectAllTDSRate'></select></td>");
						columnArray.push("<td class='hide'><input type='text' id='dueAmount_" + obj.deliveryRunSheetLedgerId+"' name='balanceAmount' value='" + obj.dueAmount + "' maxlength='7' class='form-control dueAmounts' style='display: none; width: 170px; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td class='datatd tdsamountCol' align='left' width=''><input type='text' id='tdsamount" + obj.deliveryRunSheetLedgerId+"'  name='tdsamount' class='form-control allCentralizeTDSAmount' value='0' maxlength='7'  style='width:  100px; text-align: right;' onkeypress='return noNumbers(event);' onblur='clearIfNotNumeric(this,0);' onkeyup=''onfocus='if(this.value=='0')this.value='';'/></td>");
						columnArray.push("<td><input type='text' id='balanceAmount" + obj.deliveryRunSheetLedgerId+"' name='balanceAmount' value='" + obj.dueAmount + "' maxlength='7' class='resetAmount form-control' style='width: 170px; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td class='hide'><input type='hidden' id='balanceAmount1" + obj.deliveryRunSheetLedgerId+"' name='balanceAmount1' value='" + obj.dueAmount + "' maxlength='7' class='form-control' style='width: 170px; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td class='panNumberCol'><input type='text'  id='panNumber" + obj.deliveryRunSheetLedgerId+"' name='panNumber' placeholder='PAN Number' class='form-control' style='width: 200px; text-transform: uppercase;' maxlength='10'></input></td>");
						columnArray.push("<td class='tanNumberCol'><input type='text'  id='tanNumber" + obj.deliveryRunSheetLedgerId+"' name='tanNumber' placeholder='TAN Number' class='form-control' style='width: 200px; text-transform: uppercase;' maxlength='10'></input></td>");
						columnArray.push("<td><input type='text' id='remark" + obj.deliveryRunSheetLedgerId+"' name='remark' placeholder='Remark' class='form-control setAllRemark' style='width: 200px; text-transform: uppercase;' maxlength='250'></input></td>");
						
						if(debitToBranch)
							columnArray.push("<td id='debitToBranch_" + obj.deliveryRunSheetLedgerId+"' class='tableFont ' style='text-align: center'><select class='form-control' id='debitToBranchSelection_" + obj.deliveryRunSheetLedgerId+"' ></select></td>");
						
						$('#reportTable tbody').append("<tr id=billDetails'" + obj.deliveryRunSheetLedgerId+"'>" + columnArray.join(' ') + '</tr>');
						
						if(debitToBranch)
							_this.setDebitToBranch(obj.deliveryRunSheetLedgerId);
				
						columnArray	= [];
						
						if(allowPartialPayment) {
							$(".paymentTypeSelection").removeClass("hide");
							$('#paymentType' + obj.deliveryRunSheetLedgerId+' option[value]').remove();
							$('#paymentType' + obj.deliveryRunSheetLedgerId).append($("<option>").attr('value', 0).text("-- Please Select-----"));
							$('#paymentMode' + obj.deliveryRunSheetLedgerId+' option[value]').remove();
							$('#paymentMode' + obj.deliveryRunSheetLedgerId).append($("<option>").attr('value', 0).text("-- Please Select-----"));

							$(paymentStatusArrForSelection).each(function() {
								$('#paymentType' + obj.deliveryRunSheetLedgerId).append($("<option>").attr('value', this.paymentStatusId).text(this.paymentStatusName));
							});
							
							$(paymentTypeArr).each(function() {
								$('#paymentMode' + obj.deliveryRunSheetLedgerId).append($("<option>").attr('value', this.paymentTypeId).text(this.paymentTypeName));
							});

							$("#paymentType").bind("change", function() {
								_this.calculateTDSAmount(this.value);
							});
						} else {
							$(".paymentTypeSelection").remove();
							$(".paymentModeSelection").remove();
							$(".allPaymentType").remove();	
						}
						
						if(ddmLorryHireTdsProperty.IsTdsAllow) {
							$("#tdsrate_" + obj.deliveryRunSheetLedgerId).empty();
							$('#tdsrate_' + obj.deliveryRunSheetLedgerId).append('<option value="0" selected="selected">--Select--</option>');

							if(tdsChargeList != undefined && typeof tdsChargeList != 'undefined' && tdsChargeList.length > 0) {
								for(const element of tdsChargeList) {
									$('#tdsrate_' + obj.deliveryRunSheetLedgerId).append('<option value="' + element + '" id="' + element + '">' + element + '</option>');
									$('#centralizeTds' + obj.deliveryRunSheetLedgerId).append('<option value="' + element + '" id="' + element + '">' + element + '</option>');
								}
							} else
								$('.tdsrateCol').remove();

							if(!ddmLorryHireTdsProperty.IsPANNumberRequired)
								$('.panNumberCol').remove();

							if(!ddmLorryHireTdsProperty.IsTANNumberRequired)
								$('.tanNumberCol').remove();
						} else {
							$('.tdsamountCol').remove();
							$('.tdsrateCol').remove();
							$('.panNumberCol').remove();
							$('.tanNumberCol').remove();
							$('#bottom-border-boxshadow').removeAttr('style')
						}
						
						$("#amount" + obj.deliveryRunSheetLedgerId).bind("blur", function() {
							_this.validateReceiveAmountForVehicleSearch(obj);
						});

						$("#amount" + obj.deliveryRunSheetLedgerId).bind("keyup", function() {
							//_this.validateReceiveAmountForVehicleSearch(obj);
							_this.validateReceiveAmount(obj);
						});
						
						$("#tdsamount" + obj.deliveryRunSheetLedgerId).bind("keyup", function() {
							_this.validateTDSAmountForVehicleSearch(obj);
						});

						$("#tdsrate_" + obj.deliveryRunSheetLedgerId).bind("change", function() {
							//_this.calculateTDSAmountForVehicleSearch(obj);
							_this.calculateTDSAmount(obj);
						});
					}
					
					if (ddmLorryHireTdsProperty.IsTdsAllow && ddmConfiguration.centralizedPaymentModeSelectionForAll) {
						$(".allPaymentType").removeClass("hide");
						columnArray.push("<td style='text-align: center; width:270px; vertical-align: inherit; font-size: 19px;'>Total</td>");
						columnArray.push("<td style='text-align: right; width:191px;'><input id='lorryhirchg' class='form-control' style='text-align: end;' readonly value='" + lorryhirecharges + "' /></td>");
						columnArray.push("<td style='text-align: right; width:198px;' ></td>");
						columnArray.push("<td style='text-align: right; width:187px;' >  <input id='sumtotal' class='form-control  ' style='text-align: end;' readonly value='0'/></td>");
						columnArray.push("<td class='tdsrateCol' style='text-align: right; width:68px;' ></td>");
						columnArray.push("<td class='tdsrateCol' style='text-align: right; width:123px;' > <input id='totalTdsAmountId' class='form-control' style='text-align: end;' readonly value='0'/> </td>");
						columnArray.push("<td style='text-align: right; width:188px;' > <input id='balancetotal' class='form-control resetAmount' style='text-align: end;' readonly value='" + totalAmount + "'/> </td>");		
						columnArray.push("<td style='text-align: right;' > <span><B>Total Pay</B> </span> <input id='totalPayAmount' class='form-control resetAmount' style='text-align: end; text-align: end; width: 130px; display: inline; margin-left: 8px;' readonly value='0'/> </td>");
						$('#totalTable tbody').append("<tr>" + columnArray.join(' ') + '</tr>');
					}else if (ddmConfiguration.centralizedPaymentModeSelectionForAll) {
						$(".allPaymentType").removeClass("hide");
						columnArray.push("<td style='text-align: center; width:298px; vertical-align: inherit; font-size: 19px;'>Total</td>");
						columnArray.push("<td style='text-align: right; width:15%;'><input id='lorryhirchg' class='form-control' style='text-align: end; width: 170px;' readonly value='" + lorryhirecharges + "' /></td>");
						columnArray.push("<td style='text-align: right; width:20%;' ></td>");
						columnArray.push("<td style='text-align: right; width:187px;' >  <input id='sumtotal' class='form-control  ' style='text-align: end; ' readonly value='0'/></td>");
						columnArray.push("<td style='text-align: right; width:16%;' > <input id='balancetotal' class='form-control resetAmount' style='text-align: end; width: 170px;' readonly value='" + totalAmount + "'/> </td>");		
						columnArray.push("<td style='text-align: center; width:%;'>&nbsp;</td>");
						$('#totalTable tbody').append("<tr>" + columnArray.join(' ') + '</tr>');
					}
					
					$('#paymentType').on('change', function() {
						let paymentTypeVal = $('#paymentType').val(); 
						
						$('.dueAmounts').each((el, index) => {
							let id	= index.id.split('_')[1];
							let dueAmt =index.value;
							
							if (paymentTypeVal == PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID) {
								$('#amount'+id).val(dueAmt);
								$('#balanceAmount'+id).val(0);	
								$('#sumtotal').val(totalAmount);	
								$('#balancetotal').val(0);
							} else {
								$('#balanceAmount'+id).val(dueAmt);
								$('#amount'+id).val(0);
								$('#balancetotal').val(totalAmount);
								$('#sumtotal').val(0);	
							}
						});
						_this.calculateTotalTDSAmount();
						_this.calculateTotalTDSAmountOnChange();
					});
						
					_this.setDDMHireSummary(ddmLorryHireSummary);
					_this.checkSingleVoucherByDefault(isSingleVoucherCheckedByDefault);

					$("#btSubmit").on("click" ,function() {
						if($('#reportTable :input[type="checkbox"]:checked').length > Number(ddmConfiguration.maxNoOfDDMForSettlement)) {
							showMessage('info','Can Settle More Than '+ ddmConfiguration.maxNoOfDDMForSettlement + ' DDM');
							return false;
						}
						
						_this.settleDDMLorryHireNew();
					});
				}, responseAfterSettle : function(response) {
					exepenseVoucherDetailsIdArr 	= response.exepenseVoucherDetailsIdArr;
					PaymentVoucherSequenceNumberArr = response.PaymentVoucherSequenceNumberArr;
					let deliveryRunSheetLedgerList	= response.deliveryRunSheetLedgerList;
					
					if(repayMentWindow == 'true' || repayMentWindow == true) {
						window.opener.setValueForParentWindow(deliveryRunSheetLedgerList, exepenseVoucherDetailsIdArr, PaymentVoucherSequenceNumberArr);
						window.close();
					}
					
					$("#ddmlorryhireDetailsBtn").addClass('hide');
					$("#dateDiv").addClass('hide');
					$("#middle-border-boxshadow").addClass('hide');
					$("#bottom-border-boxshadow").addClass('hide');
					$("#dateDivCheck").addClass('hide');
					$("#searchBy").addClass('hide');
					$("#ddmNumberAndBranchDiv").addClass('hide');
					$("#vehicleNumberDiv").addClass('hide');
					$("#vehicleAgentNameDiv").addClass('hide');
					$("#searchBtnDiv").addClass('hide');
					$("#ddmLoryyHireSummaryTableDivBtn").addClass('hide');
					$("#ddmLoryyHireSummaryTableDiv").addClass('hide');
					$("#viewAddedPaymentDetailsCreate").addClass('hide');
					
					if(response.message != undefined) {
						if(exepenseVoucherDetailsIdArr != null && exepenseVoucherDetailsIdArr.length > 0) {
							for(let m = 0 ; m < exepenseVoucherDetailsIdArr.length ; m++) {
								if(exepenseVoucherDetailsIdArr[m] > 0 && PaymentVoucherSequenceNumberArr != null) {
									let printBtn = $('<b>Voucher No :</b> ' + PaymentVoucherSequenceNumberArr[m] + '&emsp;<button type="button" onclick="openPrint('+exepenseVoucherDetailsIdArr[m]+')" value="'+exepenseVoucherDetailsIdArr[m]+'" name="reprintBtn'+exepenseVoucherDetailsIdArr[m]+'" id="reprintBtn'+exepenseVoucherDetailsIdArr[m]+'" class="btn btn-success" data-tooltip="Reprint">Reprint</button><div class="row">&nbsp;</div>')
									$('#reprintOption').append(printBtn);
								}
							}
						}
						
						if(deliveryRunSheetLedgerList != null && deliveryRunSheetLedgerList.length > 0) {
							for(const element of deliveryRunSheetLedgerList) {
								let deliveryRunSheetLedgerId	= element.deliveryRunSheetLedgerId;
								
								if(deliveryRunSheetLedgerId > 0 && element.dueAmount > 0) {
									let printBtn = $('<b>DDM No :</b> ' + element.deliveryRunSheetLedgerDDMNumber + '&emsp;<b class="" id="dueAmountRemaining'+element.deliveryRunSheetLedgerId+'">Due Amount : '+element.dueAmount+'</b>&emsp;<button type="button" id="repayOption'+element.deliveryRunSheetLedgerId+'" onclick="openChildWinForRePayment('+element.deliveryRunSheetLedgerDDMNumber+','+element.deliveryRunSheetLedgerBranchId+')" class="btn btn-primary" data-tooltip="Repay">Repay</button><div class="row">&nbsp;</div>')
									$('#repayOption').append(printBtn);
								}
							}
						}

						DDMNumberArrCount = new Array();
						hideLayer();
					}
				}, responseAfterSettleForMultiDDM : function(response) {
					exepenseVoucherDetailsId 	= response.exepenseVoucherDetailsId;
					paymentVoucherNumber		= response.paymentVoucherNumber;
					
					let deliveryRunSheetLedgerList	= response.deliveryRunSheetLedgerList;

					if(repayMentWindow == 'true' || repayMentWindow == true) {
						window.opener.setValueForParentWindow(deliveryRunSheetLedgerList, exepenseVoucherDetailsId, paymentVoucherNumber);
						window.close();
					}
					
					$("#ddmlorryhireDetailsBtn").addClass('hide');
					$("#dateDiv").addClass('hide');
					$("#middle-border-boxshadow").addClass('hide');
					$("#bottom-border-boxshadow").addClass('hide');
					$("#dateDivCheck").addClass('hide');
					$("#searchBy").addClass('hide');
					$("#ddmNumberAndBranchDiv").addClass('hide');
					$("#vehicleNumberDiv").addClass('hide');
					$("#vehicleAgentNameDiv").addClass('hide');
					$("#searchBtnDiv").addClass('hide');
					$("#ddmLoryyHireSummaryTableDivBtn").addClass('hide');
					$("#ddmLoryyHireSummaryTableDiv").addClass('hide');
					$("#viewAddedPaymentDetailsCreate").addClass('hide');
					
					if(response.message != undefined) {
						if(exepenseVoucherDetailsId != 0) {
							let printBtn = $('<b>Voucher No :</b> ' + paymentVoucherNumber + '&emsp;<button type="button" onclick="openPrint('+exepenseVoucherDetailsId+')" value="'+exepenseVoucherDetailsId+'" name="reprintBtn'+exepenseVoucherDetailsId+'" id="reprintBtn'+exepenseVoucherDetailsId+'" class="btn btn-success" data-tooltip="Reprint">Reprint</button><div class="row">&nbsp;</div>')
							$('#reprintOption').append(printBtn);
						}
						
						if(deliveryRunSheetLedgerList != null && deliveryRunSheetLedgerList.length > 0) {
							for(const element of deliveryRunSheetLedgerList) {
								let deliveryRunSheetLedgerId	= element.deliveryRunSheetLedgerId;
								
								if(deliveryRunSheetLedgerId > 0 && element.dueAmount > 0) {
									printBtn = $('<b>DDM No :</b> ' + element.deliveryRunSheetLedgerDDMNumber + '&emsp;<b class="" id="dueAmountRemaining'+element.deliveryRunSheetLedgerId+'">Due Amount : '+element.dueAmount+'</b>&emsp;<button type="button" id="repayOption'+element.deliveryRunSheetLedgerId+'" onclick="openChildWinForRePayment('+element.deliveryRunSheetLedgerDDMNumber+','+element.deliveryRunSheetLedgerBranchId+')" class="btn btn-primary" data-tooltip="Repay">Repay</button><div class="row">&nbsp;</div>')
									$('#repayOption').append(printBtn);
								}
							}
						}

						DDMNumberArrCount = new Array();
						hideLayer();
					}
				}, setDDMHireSummary : function(ddmLorryHireSummary) {
					if(ddmLorryHireSummary.length > 0 ) {
						setTimeout(function() { 
							$('#ddmLoryyHireSummaryTableDiv').removeClass('hide');
							$('#ddmLoryyHireSummaryTableDiv').removeAttr('style');
							$('#ddmLoryyHireSummaryTableDivBtn').removeClass('hide');
						}, 200);
						
						let columnArray			= new Array();

						let receivedAmount = 0;
						
						for (const element of ddmLorryHireSummary) {
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.paymentVoucherNumber + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.branchName + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.paymentModeName + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.receivedAmount + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.expenseDateTimeString + "</td>");
							$('#doorPickupLoryyHireSummaryTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');

							columnArray	= [];

							receivedAmount += element.receivedAmount;
						}

						columnArray.push("<td style='text-align: center; vertical-align: middle; font:bold;'>Total</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>"+receivedAmount+"</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
						$('#ddmLoryyHireSummaryTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					} else {
						refreshAndHidePartOfPage('ddmLoryyHireSummaryTableDiv', 'hide');
						refreshAndHidePartOfPage('ddmLoryyHireSummaryTableDivBtn', 'hide');
						removeTableRows('ddmLoryyHireSummaryTable', 'tbody');
					}
				}, setDDMlorryhireDetails : function(deliveryRunSheetLedgerlist) {
					let columnArray						= new Array();

					for (const element of deliveryRunSheetLedgerlist) {
						let obj					= element;

						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.deliveryRunSheetLedgerDDMNumber + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.creationDateTimeString + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.deliveryRunSheetLedgerSourceBranchName + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.deliveryRunSheetLedgerDestinationBranchName + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.deliveryRunSheetLedgerVehicleNumber + "</td>");
						$('#ddmlorryhireDetails tbody').append('<tr>' + columnArray.join(' ') + '</tr>');

						columnArray	= [];
					}
				}, checkDateSelection : function() {
					let isViewAllSelected	= $('#viewAllEle').is(':checked');

					if(isViewAllSelected)
						$("#dateDiv").removeClass("hide");
					else
						$("#dateDiv").addClass("hide");
				}, settleDDMLorryHireNew : function(){
					let ddmLorryHireObj		= new Object;

					let jsonObject		= new Object();
					let checkBoxArray	= new Array();

					$.each($("input[name=singleCheckBox]:checked"), function() {
						checkBoxArray.push($(this).val());
					});
					
					if(checkBoxArray.length == 0) {
						showAlertMessage('error', 'Please Select At least One DDM !');
						hideLayer();
						return;
					}

					for (const element of checkBoxArray) {
						let deliveryRunSheetLedgerId = element;
						
						let ddmNumber	= $('#DDMNumber' + deliveryRunSheetLedgerId).val();

						if(!validateInputTextFeild(1, 'amount' + deliveryRunSheetLedgerId, 'amount' + deliveryRunSheetLedgerId, 'error', amountEnterErrMsg))
							return false;
						
						let forDDM	= ' for DDM ' + ddmNumber;
							
						if(allowPartialPayment) {
							if($('#paymentType' + deliveryRunSheetLedgerId).val() == 0) {
								$("#paymentType" + deliveryRunSheetLedgerId).focus();
								showMessage('error', ' Please Select Payment Type' + forDDM);
								return false
							}
							
							if($('#paymentMode' + deliveryRunSheetLedgerId).val() == 0) {
								$("#paymentMode" + deliveryRunSheetLedgerId).focus();
								showMessage('error', ' Please Select Payment Mode' + forDDM);
								return false
							}
								
							if(Number($('#lorryHireAmount' + deliveryRunSheetLedgerId).val()) == Number($('#balanceAmount1' + deliveryRunSheetLedgerId).val())) {
								if(Number($('#amount' + deliveryRunSheetLedgerId).val()) > Number($('#lorryHireAmount' + deliveryRunSheetLedgerId).val())) {
									showMessage('info', 'You can not enter greater value than ' + Number($('#lorryHireAmount' + deliveryRunSheetLedgerId).val()) + forDDM);
									return false;
								}
								
								if(Number($('#amount' + deliveryRunSheetLedgerId).val()) > Number($('#lorryHireAmount' + deliveryRunSheetLedgerId).val())) {
									$("#amount" + deliveryRunSheetLedgerId).css("border-color", "red");
									$("#amount" + deliveryRunSheetLedgerId).focus();
									showMessage('info', 'You can not enter greater value than ' + $('#lorryHireAmount' + deliveryRunSheetLedgerId).val() + forDDM);
									return false;
								}
							} else if(Number($('#lorryHireAmount' + deliveryRunSheetLedgerId).val()) > Number($('#balanceAmount1' + deliveryRunSheetLedgerId).val())) {
								if(Number($('#amount' + deliveryRunSheetLedgerId).val()) > Number($('#balanceAmount1' + deliveryRunSheetLedgerId).val())) {
									showMessage('info', 'You can not enter greater value than ' + Number($('#balanceAmount1' + deliveryRunSheetLedgerId).val()) + forDDM);
									$("#amount" + deliveryRunSheetLedgerId).css("border-color", "red");
									$("#amount" + deliveryRunSheetLedgerId).focus();
									return false;
								}
							}
						}
							
						if(!allowPartialPayment) {
							if(Number($('#amount' + deliveryRunSheetLedgerId).val()) < Number($('#lorryHireAmount' + deliveryRunSheetLedgerId).val())) {
								$("#amount" + deliveryRunSheetLedgerId).css("border-color", "red");
								$("#amount" + deliveryRunSheetLedgerId).focus();
								showMessage('info', iconForInfoMsg + ' You can not enter less value than ' + $('#lorryHireAmount' + deliveryRunSheetLedgerId).val() + forDDM);
								return false;
							}
							
							if(Number($('#amount' + deliveryRunSheetLedgerId).val()) > Number($('#lorryHireAmount' + deliveryRunSheetLedgerId).val())) {
								$("#amount" + deliveryRunSheetLedgerId).css("border-color", "red");
								$("#amount" + deliveryRunSheetLedgerId).focus();
								showMessage('info', 'You can not enter greater value than ' + $('#lorryHireAmount' + deliveryRunSheetLedgerId).val() + forDDM);
								return false;
							}
						}

						if(Number($('#paymentType' + deliveryRunSheetLedgerId).val()) == PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID) {
							if(Number($('#lorryHireAmount' + deliveryRunSheetLedgerId).val()) == Number($('#balanceAmount1' + deliveryRunSheetLedgerId).val())) {
								if(Number($('#amount' + deliveryRunSheetLedgerId).val()) < Number($('#balanceAmount1' + deliveryRunSheetLedgerId).val())) {
									showMessage('info', 'You can not enter less value than ' + Number($('#lorryHireAmount' + deliveryRunSheetLedgerId).val()) + forDDM);
									return false;
								}
							} else if (Number($('#lorryHireAmount' + deliveryRunSheetLedgerId).val()) > Number($('#balanceAmount1' + deliveryRunSheetLedgerId).val())) {
								if(Number($('#amount' + deliveryRunSheetLedgerId).val()) < Number($('#balanceAmount1' + deliveryRunSheetLedgerId).val())) {
									showMessage('info', 'You can not enter less value than ' + Number($('#balanceAmount1' + deliveryRunSheetLedgerId).val()) + forDDM);
									return false;
								}
							}
						}

						if(ddmLorryHireTdsProperty.IsPANNumberRequired && ddmLorryHireTdsProperty.IsPANNumberMandetory) {
							if($('#tdsamount' + deliveryRunSheetLedgerId).val() > 0 && !validateInputTextFeild(1, 'panNumber' + deliveryRunSheetLedgerId, 'panNumber' + deliveryRunSheetLedgerId, 'error', panNumberErrMsg)
							|| !validateInputTextFeild(8, 'panNumber' + deliveryRunSheetLedgerId, 'panNumber' + deliveryRunSheetLedgerId, 'info', validPanNumberErrMsg))
								return false;
						}

						if(ddmLorryHireTdsProperty.IsTANNumberRequired && ddmLorryHireTdsProperty.IsTANNumberMandetory) {
							if($('#tdsamount' + deliveryRunSheetLedgerId).val() > 0 && !validateInputTextFeild(1, 'tanNumber' + deliveryRunSheetLedgerId, 'tanNumber' + deliveryRunSheetLedgerId, 'error', tanNumberErrMsg)
							|| !validateInputTextFeild(13, 'tanNumber' + deliveryRunSheetLedgerId, 'tanNumber' + deliveryRunSheetLedgerId, 'info', validTanNumberErrMsg))
								return false;
						}
							
						if(!validateInputTextFeild(1, 'remark' + deliveryRunSheetLedgerId, 'remark' + deliveryRunSheetLedgerId, 'error', ramarkErrMsg))
							return false;

						let ddmLorryDetailsObject = new Object();

						ddmLorryDetailsObject.deliveryRunSheetLedgerId		= deliveryRunSheetLedgerId;
						ddmLorryDetailsObject.DDMNumber						= $('#DDMNumber' + deliveryRunSheetLedgerId).val();
						ddmLorryDetailsObject.balanceAmount					= $('#balanceAmount' + deliveryRunSheetLedgerId).val();
						ddmLorryDetailsObject.amount						= $('#amount' + deliveryRunSheetLedgerId).val();
						ddmLorryDetailsObject.tdsOnAmount					= $('#amount' + deliveryRunSheetLedgerId).val();
						ddmLorryDetailsObject.tdsAmount						= $('#tdsamount' + deliveryRunSheetLedgerId).val();
						ddmLorryDetailsObject.tdsRate						= $('#tdsRate_' + deliveryRunSheetLedgerId).val();
						ddmLorryDetailsObject.PanNumber						= $('#panNumber' + deliveryRunSheetLedgerId).val();
						ddmLorryDetailsObject.TanNumber						= $('#tanNumber' + deliveryRunSheetLedgerId).val();
						ddmLorryDetailsObject.lorryHireAmount				= $('#lorryHireAmount' + deliveryRunSheetLedgerId).val();
						ddmLorryDetailsObject.remark						= $('#remark' + deliveryRunSheetLedgerId).val();
						ddmLorryDetailsObject.paymentType					= $('#paymentMode' + deliveryRunSheetLedgerId).val();
						ddmLorryDetailsObject.fromDate 						= $("#manualDateEle").val();
						ddmLorryDetailsObject.branchId 						= executive.branchId;
						ddmLorryDetailsObject.paymentStatus					= $("#paymentType" + deliveryRunSheetLedgerId).val();

						if($('#debitToBranchSelection_' + deliveryRunSheetLedgerId).exists() && $('#debitToBranchSelection_' + deliveryRunSheetLedgerId).is(":visible"))
							ddmLorryDetailsObject.debitToBranch				= $('#debitToBranchSelection_' + deliveryRunSheetLedgerId).val();
						else
							ddmLorryDetailsObject.debitToBranch				= 0;
						
						ddmLorryHireObj['deliveryRunSheetLedgerId_' + deliveryRunSheetLedgerId]	= ddmLorryDetailsObject;
					}
					
					jsonObject["ddmLorryHireData"]					= JSON.stringify(ddmLorryHireObj);
					jsonObject.fromDate 							= $("#manualDateEle").val();
					jsonObject["ledgerIds"]							= checkBoxArray.join(',');
					jsonObject.paymentType							= $('#paymentType').val();
					jsonObject["centralizedPaymentMode"]			= $('#paymentMode').val();
					
					let rowCount 		= $('#storedPaymentDetails tr').length;
					
					if(!$('#storedPaymentDetails').is(':empty') && rowCount > 0) {
						let paymentCheckBoxArr	= getAllCheckBoxSelectValue('paymentCheckBox');

						jsonObject.paymentValues	= paymentCheckBoxArr.join(',');
					}
					
					$.confirm({
					    content: 'Confirm!',
					    modalWidth 	: 	30,
					    confirmButtonClass	: 'btn-success',
						title		:	'Settle Lorry Hire',
					});
					
					$(".confirm").css({ 'width' : '5%', 'transform': 'translate(-0%, -0%)','position' : 'initial','min-width':'90px' });
					setTimeout(function() { 
						$('.confirm').focus();
					}, 600);
					
					$('.confirm').one('click',function() {
						if(!doneTheStuff) {
							$('.confirm').addClass('hide');
							doneTheStuff = true;
							
							if(isAllowToCreateSingleVoucher && $('#isSingleVoucherCheckbox').prop('checked'))
								getJSON(jsonObject, WEB_SERVICE_URL + '/multipleDdmLorryHireAmountSettlementWS/settleDDMLorryHireWithSingleVoucher.do', _this.responseAfterSettle, EXECUTE_WITH_NEW_ERROR);
							else
								getJSON(jsonObject, WEB_SERVICE_URL + '/multipleDdmLorryHireAmountSettlementWS/settleDDMLorryHire.do', _this.responseAfterSettle, EXECUTE_WITH_ERROR);
							
							showLayer();
						}
					});
				}, setDebitToBranch :function(headId) {
					createOption('debitToBranchSelection_' + headId, 0, '---Select Branch---');
					
					if(!jQuery.isEmptyObject(debitTobranchArr)) {	
						for(const element of debitTobranchArr) {
							createOption('debitToBranchSelection_'+ headId, element.branchId, element.branchName);
						}
					}
				}, calculateCentralizedTDSAmount : function() {
					let centralize	= Number($('#centralizeTds').val());
					totalTdsAmount = 0;
					if(centralize > 0){
						$('.selectAllTDSRate').attr('disabled', 'disabled');
						$('.allCentralizeTDSAmount').attr('disabled', 'disabled');
						
                        $('.selectAllTDSRate').each((el, index) => {
							let id	= index.id.split('_')[1];
							let receivedAmount = Number($('#lorryHireAmount' + id).val());
							$('#tdsrate_' + id).val(centralize);
							$('#tdsamount' + id).val(receivedAmount * centralize / 100);
							totalTdsAmount += receivedAmount * centralize / 100;
						});
						$("#totalTdsAmountId").val(totalTdsAmount);
						_this.calculateTotalTDSAmount();
					}else{
						$('.selectAllTDSRate').removeAttr('disabled');
						$('.allCentralizeTDSAmount').removeAttr('disabled');
						 $('.selectAllTDSRate').each((el, index) => {
							let id	= index.id.split('_')[1];
							$('#tdsrate_' + id).val(0);
							$('#tdsamount' + id).val(0);
							$("#totalTdsAmount").val(0);
							_this.calculateTotalTDSAmount();
						});
						$("#totalTdsAmountId").val(0);
					}
				}, calculateTotalTDSAmount : function() {
					if (Number($('#sumtotal').val()) > 0)
						$("#totalPayAmount").val(Number($('#sumtotal').val()) - totalTdsAmount);
					else if (Number($('#sumtotal1').val()) > 0)
						$("#totalPayAmount").val(Number($('#sumtotal1').val()) - totalTdsAmount);
					else
						$("#totalPayAmount").val(0);
				}, calculateTotalTDSAmountOnChange : function(obj) {
					totalTdsAmount = 0;
					 $('.selectAllTDSRate').each((el, index) => {
						let id	= index.id.split('_')[1];
						let tdsRate = Number($('#tdsrate_' + id).val());
						let receivedAmount = Number($('#lorryHireAmount' + id).val());
						$('#tdsamount' + id).val(receivedAmount * tdsRate / 100);
						totalTdsAmount += receivedAmount * tdsRate / 100;
					});
					$('#totalTdsAmountId').val(totalTdsAmount);
					_this.calculateTotalTDSAmount();
				},checkSingleVoucherByDefault : function(isSingleVoucherCheckedByDefault) { 
					if (isSingleVoucherCheckedByDefault) {
						$("#isSingleVoucherCheckbox").prop("checked", true);
						
						if(ddmConfiguration.isSingleVoucherNonEditable)
							$("#isSingleVoucherCheckbox").prop("disabled", true);

						if ($("#isSingleVoucherCheckbox").is(":checked")) {
							$('.selectAllPaymentMode').attr('disabled', 'disabled');
						}
					} else {
						$("#isSingleVoucherCheckbox").prop("checked", false);
						let paymentModeVal = parseInt($('#paymentMode').val() || 0);
						
						if (paymentModeVal <= 0)
							$('.selectAllPaymentMode').removeAttr('disabled');
						else
							$('.selectAllPaymentMode').attr('disabled', 'disabled');
					}

				}
		});
});

function calculateTotal() {
	let inputs = document.querySelectorAll('.inputAmount');
	let total = 0;
    
	inputs.forEach(function(input) {
		total += parseFloat(input.value) || 0; 
	});

	$('#sumtotal').val(total);
	$('#balancetotal').val(totalAmount - total);
	$('#sumtotal1').val(total);
	$('#balancetotal1').val(totalAmountDDM - total);
	if (Number($('#sumtotal').val()) > 0)
		$("#totalPayAmount").val(Number($('#sumtotal').val()) - totalTdsAmount);
	else if (Number($('#sumtotal1').val()) > 0)
		$("#totalPayAmount").val(Number($('#sumtotal1').val()) - totalTdsAmount);
	else
		$("#totalPayAmount").val(0);
 }
        
function selectAllDDM(param) {
	const $checkboxes = $(".singleCheckBox");
	const maxLimit = Number(ddmConfiguration.maxNoOfDDMForSettlement - 1);
	
	if (param) {
		if (maxLimit > 0) {
			$checkboxes.each(function(index) {
				$(this).prop('checked', index < maxLimit);
			});
		} else
			$(".singleCheckBox").prop('checked', true)
	} else
		$(".singleCheckBox").prop('checked', false)
}

function openPrint(exepenseVoucherDetailsId) {
	if(BranchExpenseConfiguration != null && BranchExpenseConfiguration.branchExpensePrintNewFlowAllow)
		window.open('BranchExpensePrint.do?pageId=25&eventId=43&voucherDetailsId=' + exepenseVoucherDetailsId, 'newwindow', 'config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	else
		window.open('BranchExpensePrint.do?pageId=25&eventId=16&voucherDetailsId=' + exepenseVoucherDetailsId, 'newwindow', 'config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function onPaymentModeSelect(billId, obj) {
	$('#uniqueWayBillId').val(billId);
	$('#uniqueWayBillNumber').val($('#DDMNumber' + billId).val());
	$('#uniquePaymentType').val($('#paymentMode' + billId).val());
	$('#uniquePaymentTypeName').val($("#paymentMode" + billId + " option:selected").text());
		
	hideShowBankPaymentTypeOptions(obj);
}

function changeClearPayment(id, obj, input2) {
	let options = obj.value
	totalTdsAmount = 0;
	
	if (options == 2) {
    	let input1 = $(`#amount${id}`);
     	input1.val(input2)
     	let input2Field = $(`#balanceAmount${id}`);
     	input2Field.val('0') 
     	$("#tdsamount"+id).val($("#tdsrate_"+id).val() * $("#lorryHireAmount"+id).val() / 100);
     	calculateTotal()
      } else {
      	let input1 = $(`#amount${id}`);
     	input1.val('0')
     	let input2Field = $(`#balanceAmount${id}`);
     	input2Field.val(input2)
     	$("#tdsamount"+id).val(0);
     	calculateTotal()
	}	
	
	$('.selectAllTDSRate').each((el, index) => {
		let id	= index.id.split('_')[1];
		let tdsRate = Number($('#tdsrate_' + id).val());
		let receivedAmount = Number($('#lorryHireAmount' + id).val());
		$('#tdsamount' + id).val(receivedAmount * tdsRate / 100);
		totalTdsAmount += receivedAmount * tdsRate / 100;
	});
	$('#totalTdsAmountId').val(totalTdsAmount);	
	if (Number($('#sumtotal').val()) > 0)
		$("#totalPayAmount").val(Number($('#sumtotal').val()) - totalTdsAmount);
	else if (Number($('#sumtotal1').val()) > 0)
		$("#totalPayAmount").val(Number($('#sumtotal1').val()) - totalTdsAmount);
	else
		$("#totalPayAmount").val(0);
}

function openChildWinForRePayment(deliveryRunSheetLedgerDDMNumber, deliveryRunSheetLedgerBranchId) {
	if(deliveryRunSheetLedgerDDMNumber != "" && deliveryRunSheetLedgerDDMNumber > 0)
		window.open('DDMLorryHireAmountSettlement.do?pageId=340&eventId=1&modulename=multipleDDMLorryHireAmountSettlement&DDMNumberForRepay=' + deliveryRunSheetLedgerDDMNumber + '&ddmBranchId='+deliveryRunSheetLedgerBranchId+'&repayMentWindow='+true, 'newwindow', 'height=1000,width=1500');
}

function setValueForParentWindow(deliveryRunSheetLedgerList, exepenseVoucherDetailsIdArr, paymentVoucherSequenceNumberArr) {
	for(const element of deliveryRunSheetLedgerList) {
		if(element.dueAmount == 0) {
			$('#repayOption' + element.deliveryRunSheetLedgerId).addClass('hide');
			$('#dueAmountRemaining' + element.deliveryRunSheetLedgerId).addClass('hide');
		} else
			$('#dueAmountRemaining' + element.deliveryRunSheetLedgerId).html('Due Amount : '+element.dueAmount);
	}
	
	if(exepenseVoucherDetailsIdArr != null && exepenseVoucherDetailsIdArr.length > 0) {
		for(let m = 0 ; m < exepenseVoucherDetailsIdArr.length ; m++){
			let exepenseVoucherDetailsId	= exepenseVoucherDetailsIdArr[m];
			
			if(exepenseVoucherDetailsId > 0 && paymentVoucherSequenceNumberArr != null) {
				let printBtn = $('<b>Voucher No :</b> ' + paymentVoucherSequenceNumberArr[m] + '&emsp;<button type="button" onclick="openPrint('+exepenseVoucherDetailsId+')" value="'+exepenseVoucherDetailsId+'" name="reprintBtn'+exepenseVoucherDetailsId+'" id="reprintBtn'+exepenseVoucherDetailsId+'" class="btn btn-success" data-tooltip="Reprint">Reprint</button><div class="row">&nbsp;</div>')
				$('#reprintOption').append(printBtn);
			}
		}
	}
}