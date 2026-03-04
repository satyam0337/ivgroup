var BranchExpenseConfiguration	 = null;
var moduleId=0;
var	ModuleIdentifierConstant 	= null;
var PaymentTypeConstant			= null;
var	incomeExpenseModuleId		= 0;
var GeneralConfiguration		= null;
var totalflag					= 0;
var totalAmount 				= 0;
var maxNoOfLSForSettlement		= false;

define(
		[
			'/ivcargo/resources/js/generic/urlparameter.js',
			PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
			'JsonUtility',
			'messageUtility',
			'autocomplete',
			'autocompleteWrapper',
			'bootstrapSwitch',
			'nodvalidation',
			'focusnavigation',
			'moment',
			'/ivcargo/resources/js/confirm/jquery.confirm.min.js'
			],
			function(UrlParameter, Selection) {
			'use strict';
			let jsonObject = new Object(), myNod, myNodVehicle, myNodVehicleAgent,  _this = '', PickupLorryHireTdsProperty,tdsChargeList,
			exepenseVoucherDetailsId = 0, paymentVoucherSequenceNumber = "", paymentStatusArrForSelection, paymentTypeStatus = new Object, 
			doorPickupLsNumber,doorPickupBranchId,PaymentVoucherSequenceNumberArr = new Array(),paymentTypeArr = new Array(),option_1=1,option_2=2,option_3=3,doneTheStuff=false,allowPartialPayment = false,
			repayMentWindow=false, pickupNumberArrCount= [], exepenseVoucherDetailsIdArr = null,centralizedPaymentModeSelectionForAll = false,isAllowSingleVoucherEntry=false,centralizedTdsRateSelectionAllow = false,isSingleVoucherCheckedByDefault=false,isSingleVoucherNonEditable=false;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
					exepenseVoucherDetailsId 		= UrlParameter.getModuleNameFromParam('voucherDetailsId');
					paymentVoucherSequenceNumber  	= UrlParameter.getModuleNameFromParam('paymentVoucherSequenceNumber');
					doorPickupLsNumber				= UrlParameter.getModuleNameFromParam("doorPickupLsNumber");
					doorPickupBranchId				= UrlParameter.getModuleNameFromParam("doorPickupBranchId");
					repayMentWindow					= UrlParameter.getModuleNameFromParam('repayMentWindow');
					hideLayer();
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/pickupLorryHireAmountSettlementWS/loadPickupLorryHireElement.do?', _this.renderPickupLorryHireAmountSettlementElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderPickupLorryHireAmountSettlementElements : function(response) {
					showLayer();
					let loadelement = new Array();
					let baseHtml 	= new $.Deferred();
					let paymentHtml	= new $.Deferred();
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/expense/pickupLorryHireAmountSettlement.html",
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
						$("#viewAddedPaymentDetailsCreate").css("display", "block");
						$('#bottom-border-boxshadow').addClass('hide');
						$('#middle-border-boxshadow').hide();
						$('#doorpickuplorryhireDetailsBtn').addClass('hide');
						$('#doorPickupLoryyHireSummaryTableDivBtn').addClass('hide');

						hideLayer();
						PickupLorryHireTdsProperty			= response.PickupLorryHireTdsProperty;
						tdsChargeList						= response.TDSChargeInPercent;
						BranchExpenseConfiguration			= response.BranchExpenseConfiguration;
						paymentStatusArrForSelection		= response.paymentStatusArrForSelection;
						paymentTypeStatus					= response.paymentTypeStatus;
						paymentTypeArr						= response.paymentTypeArr;
						moduleId							= response.moduleId;
						ModuleIdentifierConstant 			= response.ModuleIdentifierConstant;
						PaymentTypeConstant 				= response.PaymentTypeConstant;
						incomeExpenseModuleId				= response.incomeExpenseModuleId;
						GeneralConfiguration				= response.GeneralConfiguration;
						allowPartialPayment					= response.allowPartialPayment;
						centralizedPaymentModeSelectionForAll = response.centralizedPaymentModeSelectionForAll;
						maxNoOfLSForSettlement				= response.maxNoOfLSForSettlement;
						isAllowSingleVoucherEntry			= response.isAllowSingleVoucherEntry;
						centralizedTdsRateSelectionAllow	= response.centralizedTdsRateSelectionAllow;
						isSingleVoucherCheckedByDefault		= response.isSingleVoucherCheckedByDefault;
						isSingleVoucherNonEditable			= response.isSingleVoucherNonEditable;

						$("#pickupNumberEle").focus();
						response.executiveTypeWiseBranch	= true;

						$('#viewAllEle').click(function() {
							if(Number($('#searchByOption').val()) != option_1)
								_this.checkDateSelection();
						});

						$('#searchByOption').on('change', function() {
							$("#reportTable tbody").empty();
							$("#reportTable tfoot").empty();
							$("#doorPickupDetails tbody").empty();
							$("#doorPickupDetails tfoot").empty();
							$("#doorPickupLoryyHireSummaryTable tbody").empty();
							$('#bottom-border-boxshadow').addClass('hide');
							$('#doorpickuplorryhireDetailsBtn').addClass('hide');
							
							pickupNumberArrCount = [];

							if(Number($('#searchByOption').val()) == option_1){
								$('#pickupNumberAndBranchDiv').removeClass('hide');
								$('#searchBtnDiv').removeClass('hide');
								$('#vehicleNumberDiv').addClass('hide');
								$('#vehicleAgentNameDiv').addClass('hide');
								$('#dateDiv').addClass('hide');
								$('#viewAllEle').attr('checked',false);
							} else if (Number($('#searchByOption').val()) == option_2){
								$('#pickupNumberAndBranchDiv').addClass('hide');
								$('#vehicleNumberDiv').removeClass('hide');
								$('#searchBtnDiv').removeClass('hide');
								$('#vehicleAgentNameDiv').addClass('hide');
								$('#doorPickupLoryyHireSummaryTableDivBtn').addClass('hide');
							} else if (Number($('#searchByOption').val()) == option_3){
								$('#pickupNumberAndBranchDiv').addClass('hide');
								$('#vehicleNumberDiv').addClass('hide');
								$('#vehicleAgentNameDiv').removeClass('hide');
								$('#searchBtnDiv').removeClass('hide');
								$('#doorPickupLoryyHireSummaryTableDivBtn').addClass('hide');
							} else {
								$('#pickupNumberAndBranchDiv').addClass('hide');
								$('#vehicleNumberDiv').addClass('hide');
								$('#vehicleAgentNameDiv').addClass('hide');
								$('#searchBtnDiv').addClass('hide');
								$('#doorPickupLoryyHireSummaryTableDivBtn').addClass('hide');
							}
						})

						let vehicleAgent 			= new Object();
						vehicleAgent.url			= WEB_SERVICE_URL+'/vehicleAgentMasterWS/getVehicleAgentForDropDown.do?viewAll=true';
						vehicleAgent.field			= 'name'; // response variable from WS
						vehicleAgent.primary_key	= 'vehicleAgentMasterId';
						$('#vehicleAgentEle').autocompleteCustom(vehicleAgent);

						response.isCalenderSelection	= true;
						response.vehicleSelection		= true;
						response.viewAllVehicle			= true;

						let elementConfiguration	= new Object();
						elementConfiguration.branchElement		= $('#branchEle');
						elementConfiguration.dateElement		= $('#dateEle');
						elementConfiguration.vehicleElement		= $('#vehicleNumber');
						response.elementConfiguration			= elementConfiguration;
						
						Selection.setSelectionToGetData(response);
						
						let dateOption	= new Object();
					
						dateOption.minDate	= response.minDate;
						dateOption.maxDate	= response.maxDate;
						dateOption.startDate= response.maxDate;
	
						$("#manualDateEle").SingleDatePickerCus(dateOption);

						myNod = nod();
						
						myNod.configure({
							parentClass:'validation-message'
						});
						
						myNodVehicle = nod();
						
						myNodVehicle.configure({
							parentClass:'validation-message'
						});
						
						myNodVehicleAgent = nod();
						
						myNodVehicleAgent.configure({
							parentClass:'validation-message'
						});
						
						addElementToCheckEmptyInNode(myNod, 'pickupNumberEle', 'Enter Pickup Number !');
						addElementToCheckEmptyInNode(myNod, 'branchEle', 'Select Branch !');
						addAutocompleteElementInNode(myNod, 'branchEle', 'Please type proper branch !!');
						
						addElementToCheckEmptyInNode(myNodVehicle, 'vehicleNumber', 'Select Vehicle Number !');
						addAutocompleteElementInNode(myNodVehicle, 'vehicleNumber', 'Please type proper vehicle !!');
						
						addElementToCheckEmptyInNode(myNodVehicleAgent, 'vehicleAgentEle', 'Select Vehicle Agent !');
						addAutocompleteElementInNode(myNodVehicleAgent, 'vehicleAgentEle', 'Please type proper agent !!');

						$("#findBtn").click(function() {
							if(Number($('#searchByOption').val()) == option_1) {
								myNod.performCheck();
								
								if(myNod.areAll('valid'))
									_this.onFind(0);
							} else if (Number($('#searchByOption').val()) == option_2) {
								myNodVehicle.performCheck();
								
								if(myNodVehicle.areAll('valid'))
									_this.onFind(0);
							} else if (Number($('#searchByOption').val()) == option_3) {
								myNodVehicleAgent.performCheck();
								
								if(myNodVehicleAgent.areAll('valid'))
									_this.onFind(0);
							} else {
								showMessage('error','Please select from frop down for search !!');
								return false;
							}
						});
						
						$("#doorpickuplorryhireDetailsBtn").bind("click", function() {
							$('#middle-border-boxshadow').toggle(1000);
						});
						
						if(allowPartialPayment) {
							$('.paymentTypeSelection').removeClass('hide');
							$('.paymentModeSelection').removeClass('hide');
						}
						
						if(centralizedPaymentModeSelectionForAll)
							$('.allPaymentType').removeClass('hide');
						
						if(tdsChargeList == undefined || tdsChargeList.length == 0)
							$('.tdsrateCol').remove();
							
						if(!PickupLorryHireTdsProperty.IsTdsAllow)
							$('.tdsamountCol').remove();
							
						if(!PickupLorryHireTdsProperty.IsPANNumberRequired)
							$('.panNumberCol').remove();
								
						if(!PickupLorryHireTdsProperty.IsTANNumberRequired)
							$('.tanNumberCol').remove();
						
						$("#btSubmit").on("click" ,function() {
							if($('#reportTable :input[type="checkbox"]:checked').length >Number(maxNoOfLSForSettlement)){//>76
								showMessage('info','Can not Settle More Than '+(maxNoOfLSForSettlement-1)+'LS');
								return false;
							}
							
							_this.settleDoorPickupLorryHire();
						});
					
						if(exepenseVoucherDetailsId > 0 && paymentVoucherSequenceNumber != null) {
							let printBtn = $('<b>Voucher No :</b> ' + paymentVoucherSequenceNumber + '&emsp;<button type="button" name="reprintBtn" id="reprintBtn" class="btn btn-success" data-tooltip="Reprint">Reprint</button><div class="row">&nbsp;</div>')
							$('#reprintOption').append(printBtn);

							$("#reprintBtn").bind("click", function() {
								_this.openPrint(exepenseVoucherDetailsId);
							});
						}
						
						if(doorPickupLsNumber != null && doorPickupBranchId != null) {
							let jsonObject = new Object();
							jsonObject.doorPickupNumber		= doorPickupLsNumber;
							jsonObject.branchId				= doorPickupBranchId;
							jsonObject.searchBy				= 1;
							$('#top-border-boxshadow').addClass('hide');
							getJSON(jsonObject, WEB_SERVICE_URL + '/pickupLorryHireAmountSettlementWS/getDoorPickupLorryHireAmountSettlementData.do', _this.setDoorPickupDetailsData, EXECUTE_WITH_ERROR);
						}
					});
				}, onFind : function(doorPickupLedgerId) {
					 totalAmount 			= 0;

					showLayer();
					let jsonObject = new Object();

					let doorPickupNumber			= $('#pickupNumberEle').val();
					jsonObject.searchBy				= $('#searchByOption').val();
					
					if(doorPickupNumber != undefined && doorPickupNumber != '')
						jsonObject.doorPickupNumber	= doorPickupNumber.replace(/\s+/g, "");
					
					jsonObject.branchId				= $('#branchEle_primary_key').val();
					jsonObject.vehicleNumberId		= $('#vehicleNumber_primary_key').val();
					jsonObject.vehicleAgentId		= $('#vehicleAgentEle_primary_key').val();
					jsonObject.doorPickupLedgerId	= doorPickupLedgerId;

					if($('#dateDiv').is(":visible")) {
						if($("#dateEle").attr('data-startdate') != undefined)
							jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 

						if($("#dateEle").attr('data-enddate') != undefined)
							jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
							
						jsonObject.filter		= 1;
					} else
						jsonObject.filter		= 0;
					
					if(doorPickupNumber != "" && doorPickupNumber != null)
						getJSON(jsonObject, WEB_SERVICE_URL + '/pickupLorryHireAmountSettlementWS/getDoorPickupLorryHireAmountSettlementData.do', _this.setDoorPickupDetailsData, EXECUTE_WITH_ERROR);
					else
						getJSON(jsonObject, WEB_SERVICE_URL + '/pickupLorryHireAmountSettlementWS/getDoorPickupLorryHireAmountSettlementData.do', _this.setDoorPickupDetailsDataSearchedByVehicle, EXECUTE_WITH_ERROR);
				}, setDoorPickupDetailsData : function(response) {
					if(response.message != undefined) {
						hideLayer();
						$('#bottom-border-boxshadow').addClass('hide');
						$('#middle-border-boxshadow').hide();
						$('#doorpickuplorryhireDetailsBtn').addClass('hide');
						$('#doorPickupLoryyHireSummaryTableDivBtn').addClass('hide');
						return;
					}
					
					$('#doorpickuplorryhireDetailsBtn').removeClass('hide');
					
					if(Number($('#searchByOption').val()) == option_1)
						$('#doorPickupLoryyHireSummaryTableDivBtn').removeClass('hide');
					
					$('#isSingleVoucherEntry').on('change', function () {
				        if ($(this).is(':checked')) 
				         	$('.selectAllPaymentMode').attr('disabled', 'disabled');
						else
							$('.selectAllPaymentMode').removeAttr('disabled');
				    });
				    
					$('#doorPickupDetails tbody').empty();
					$('#doorPickupDetails tfoot').empty();
					$('#doorPickupLoryyHireSummaryTable tbody').empty();
						
					_this.setDataInTable(response);
					hideLayer();
				}, setDataInTable : function(data) {
					hideLayer();
					let columnArray						= new Array();
					let totalcolumnArray				= new Array();
					let doorPickupLedgerlist			= data.DoorPickupLedger;
					let doorPickupLorryHireSummary		= data.expenseSettlementList;
					
					if(doorPickupLedgerlist.length > 0)
						$('#bottom-border-boxshadow').removeClass('hide');
					
					$("*[data-attribute=manualDate]").removeClass("hide");
					
					if(isAllowSingleVoucherEntry)
						$("*[data-attribute=isSingleVoucherEntry]").removeClass("hide");
					
					if (centralizedTdsRateSelectionAllow) {
					    $("#tdsContainer").show();
					    _this.handleCentralizedTDS(tdsChargeList);
					
						$("#tdsDropdown").on("change", function() {
						    var selectedValue = $(this).val();
						    if (selectedValue == 0) {
						        $('.tdsrateCol select').val(selectedValue).prop('disabled', false); 
								$('.tdsamountCol input').val(selectedValue).prop('disabled', false); 
						    } else {
						         $('.tdsrateCol select').val(selectedValue).prop('disabled', true); 
							    $('.tdsamountCol input').val(selectedValue).prop('disabled', true); 
						    }
						});
				    
					    if (!tdsChargeList || tdsChargeList.length === 0) {
					        $('.tdsRateRow').remove();
					    }
					}
					
					if(centralizedPaymentModeSelectionForAll) {
						$(".paymentTypeSelection").removeClass("hide");
						$('#paymentType'+' option[value]').remove();
						$('#paymentType').append($("<option>").attr('value', 0).text("-- Please Select-----"));
						$('#paymentMode'+' option[value]').remove();
						$('#paymentMode').append($("<option>").attr('value', 0).text("-- Please Select-----"));

						$(paymentTypeArr).each(function() {
							$('#paymentMode').append($("<option>").attr('value', this.paymentTypeId).text(this.paymentTypeName));
						});
						
						$(paymentStatusArrForSelection).each(function() {
							$('#paymentType').append($("<option>").attr('value', this.paymentStatusId, ).text(this.paymentStatusString));
						});
						
						$("#paymentType").change(function(){
							 let selectindex = $(this).prop('selectedIndex')
							 $('.selectAllPaymentType').prop('selectedIndex', selectindex)
						});
						
						$("#paymentMode").change(function(){
							 let selectindex = $(this).prop('selectedIndex')
							 $('.selectAllPaymentMode').prop('selectedIndex', selectindex)
						});
						
						$("#cremark").on("input", function() {
							 let remarkValue = $(this).val();
							 $('.setAllRemark').val(remarkValue);
						});
					}
					
					_this.setDoorPickupDetails(doorPickupLedgerlist);
										
					for (const element of doorPickupLedgerlist) {
						let obj					= element;
						let doorPickupLedgerId	= obj.doorPickupLedgerId;
						totalAmount += obj.balanceAmount;

						
						if(isValueExistInArray(pickupNumberArrCount, doorPickupLedgerId)) {
							showMessage('info','Pick Up LS Already Added, Please Reload (F5) !');
							return false;
						}
						
						pickupNumberArrCount.push(doorPickupLedgerId);
						
						columnArray.push("<td><input type='checkbox' id='singleCheckBox" + doorPickupLedgerId + "' name='singleCheckBox' class='form-control singleCheckBox' value='" + doorPickupLedgerId + "'/></td>");
						columnArray.push("<td><input type='text' id='pickupNumber" + doorPickupLedgerId + "' name='pickupNumber' class='form-control' value='"+obj.doorPickupNumber + "' style='width:  170px; text-align: right; background-color: #9bd6f2;text-align: center;font-weight:bold' onkeypress='return noNumbers(event);' readonly='readonly' /></td> ");
						columnArray.push("<td><input type='text' id='lorryHireAmount" + doorPickupLedgerId + "' name='lorryHireAmount' value='"+ obj.doorPickupLedgerLorryHireAmount + "' class='form-control' maxlength='7'  style='width:  170px; text-align: center;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						
						if(allowPartialPayment) {
							columnArray.push("<td class='paymentTypeSelection'><select style='' name='paymentType' id='paymentType"+doorPickupLedgerId+"' class='form-control width-150px selectAllPaymentType' onchange='changeClearPayment("+doorPickupLedgerId+",this,"+ obj.balanceAmount +")'onfocus='' ></select></td>");
							columnArray.push("<td class='paymentModeSelection'><select style='' name='paymentMode' id='paymentMode" + doorPickupLedgerId + "' onchange='onPaymentModeSelect(" + doorPickupLedgerId + ",this);' class='form-control width-150px selectAllPaymentMode' onchange=''onfocus='' ></select></td>");
						}
						
						columnArray.push("<td><input type='text' id='amount" + doorPickupLedgerId + "' name='amount' placeholder='Amount' value='' maxlength='7' class='form-control inputAmount' style='width: 170px; text-align: right;' onkeypress='return noNumbers(event);' onblur='clearIfNotNumeric(this,0);' oninput='calculateTotal()' onfocus='if(this.value=='0')this.value='';'/></td>");
						
						if(PickupLorryHireTdsProperty.IsTdsAllow) {
							if(tdsChargeList != undefined && tdsChargeList.length > 0)
								columnArray.push("<td class='tdsrateCol'><select name='tdsrate' id='tdsrate" + doorPickupLedgerId + "' class='form-control'></select></td>");
							
							columnArray.push("<td class='datatd tdsamountCol' align='left'><input type='text' id='tdsamount" + doorPickupLedgerId + "' name='tdsamount' class='form-control' value='0' maxlength='7'  style='width:  100px; text-align: right;' onkeypress='return noNumbers(event);' onblur='clearIfNotNumeric(this,0);' onkeyup=''onfocus='if(this.value=='0')this.value='';'/></td>");
						}
						
						columnArray.push("<td><input type='text' id='balanceAmount" + doorPickupLedgerId + "' name='balanceAmount' value='" + obj.balanceAmount + "' maxlength='7' class='form-control' style='width: 100px; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td class='hide'><input type='hidden' id='balanceAmount1" + doorPickupLedgerId + "' name='balanceAmount1' value='" + obj.balanceAmount + "' maxlength='7' class='form-control' style='width: 170px; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td class='hide'><input type='text' id='dueAmount_"+doorPickupLedgerId+"' name='balanceAmount' value='" + obj.balanceAmount + "' maxlength='7' class='form-control dueAmounts' style='display: none; width: 170px; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");

						if(PickupLorryHireTdsProperty.IsPANNumberRequired)
							columnArray.push("<td class='panNumberCol'><input type='text'  id='panNumber" + doorPickupLedgerId + "' name='panNumber' placeholder='PAN Number' class='form-control' style='width: 200px; text-transform: uppercase;' maxlength='10'></input></td>");
						
						if(PickupLorryHireTdsProperty.IsTANNumberRequired)
							columnArray.push("<td class='tanNumberCol'><input type='text'  id='tanNumber" + doorPickupLedgerId + "' name='tanNumber' placeholder='TAN Number' class='form-control' style='width: 200px; text-transform: uppercase;' maxlength='10'></input></td>");
						
						columnArray.push("<td><input type='text' id='remark" + doorPickupLedgerId + "' name='remark' placeholder='Remark' class='form-control setAllRemark' style='width: 200px; text-transform: uppercase;' maxlength='250'></input></td>");
						
						$('#reportTable tbody').append("<tr id=billDetails'" + doorPickupLedgerId + "'>" + columnArray.join(' ') + '</tr>');

						columnArray	= [];
						
						if(allowPartialPayment) {
							$('#paymentType' + doorPickupLedgerId + ' option[value]').remove();
							$('#paymentType' + doorPickupLedgerId).append($("<option>").attr('value', 0).text("-- Please Select-----"));
							
							$('#paymentMode' + doorPickupLedgerId + ' option[value]').remove();
							$('#paymentMode' + doorPickupLedgerId).append($("<option>").attr('value', 0).text("-- Please Select-----"));
	
							$(paymentStatusArrForSelection).each(function() {
								$('#paymentType' + doorPickupLedgerId).append($("<option>").attr('value', this.paymentStatusId).text(this.paymentStatusString));
							});
							
							$(paymentTypeArr).each(function() {
								$('#paymentMode' + doorPickupLedgerId).append($("<option>").attr('value', this.paymentTypeId).text(this.paymentTypeName));
							});
						}
						
						$("#amount" + doorPickupLedgerId).bind("blur", function() {
							_this.validateReceiveAmount(doorPickupLedgerId);
						});

						$("#amount" + doorPickupLedgerId).bind("keyup", function() {
							_this.validateReceiveAmount(doorPickupLedgerId);
						});
						
						$("#tdsamount" + doorPickupLedgerId).bind("keyup", function() {
							_this.validateTDSAmount(this, doorPickupLedgerId);
							_this.setTotalAmount();
						});
						
						$("#paymentType" + doorPickupLedgerId).bind("change", function() {
							_this.validateTDSAmount(this, doorPickupLedgerId);
						});

						$("#tdsDropdown").on("change", function() {
							_this.calculateTDSAmount(doorPickupLedgerId);
							_this.setTotalAmount();
						});
						
						$("#tdsrate" + doorPickupLedgerId).bind("change", function() {
							_this.calculateTDSAmount(doorPickupLedgerId);
							_this.setTotalAmount();
						});
						
						if(PickupLorryHireTdsProperty.IsTdsAllow)
							_this.setTdsRateSelection(doorPickupLedgerId);
					}
					
					if(totalflag == 0){
					    totalcolumnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
						totalcolumnArray.push("<td style='text-align: center; vertical-align: middle;font:bold;'>Total</td>");
						totalcolumnArray.push("<td><input type='text' id='totalLorryHireAmount' value='0' class='form-control' style='width: 170px; text-align: center;' readonly='readonly'/></td>");

						if(allowPartialPayment) {
							totalcolumnArray.push("<td class='paymentTypeSelection' style='text-align: center; vertical-align: middle;'></td>");
							totalcolumnArray.push("<td class='paymentModeSelection' style='text-align: center; vertical-align: middle;'></td>");
						}
						
						totalcolumnArray.push("<td><input type='text' id='totalAmount' value='0' class='form-control' style='width: 170px; text-align: center;' readonly='readonly'/></td>");
						
						if(PickupLorryHireTdsProperty.IsTdsAllow) {
							if(tdsChargeList != undefined && tdsChargeList.length > 0)
								totalcolumnArray.push("<td class='tdsrateCol' style='text-align: center; vertical-align: middle;'></td>");
							
							totalcolumnArray.push("<td class='datatd tdsamountCol'><input type='text' id='totalTdsAmount' value='0' class='form-control' style='width: 100px; text-align: center;' readonly='readonly'/></td>");
						}
					
						totalcolumnArray.push("<td><input type='text' id='totalBalanceAmount' value='0' class='form-control' style='width: 100px; text-align: center;' readonly='readonly'/></td>");
						totalcolumnArray.push("<td style='text-align: center; vertical-align: middle;display:none;'></td>");
						
						if(PickupLorryHireTdsProperty.IsPANNumberRequired)
							totalcolumnArray.push("<td class='panNumberCol' style='text-align: center; vertical-align: middle;'></td>");
						
						if(PickupLorryHireTdsProperty.IsTANNumberRequired)
							totalcolumnArray.push("<td class='tanNumberCol' style='text-align: center; vertical-align: middle;'></td>");
						
						totalcolumnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					
						$('#reportTable tfoot').append('<tr>' + totalcolumnArray.join(' ') + '</tr>');
						
						totalflag ++;
					}
					
					_this.setTotalAmount();
					
					$('#paymentType').on('change', function() {
						let paymentTypeVal = $('#paymentType').val(); 
						
						$('.dueAmounts').each((el, index) => {
							let id	= index.id.split('_')[1];
							let dueAmt =index.value;
						
							if (paymentTypeVal == DOORPICKUP_LORRYHIREAMOUNT_SETTLEMENT_STATUS_CLEAR) {
								$('#amount'+id).val(dueAmt);
								$('#balanceAmount'+id).val(0);	
								$('#totalAmount').val(totalAmount);	
								$('#totalBalanceAmount').val(0);
							} else {
								$('#balanceAmount'+id).val(dueAmt);
								$('#amount'+id).val(0);
								$('#totalBalanceAmount').val(totalAmount);
								$('#totalAmount').val(0);	
							}
						});
					});
					
					if(allowPartialPayment) {
						$("#paymentType").bind("change", function() {
							_this.calculateTDSAmount(this.value);
							_this.setTotalAmount();
						});
					}
					
					if(doorPickupLorryHireSummary.length > 0 ){
						setTimeout(function() { 
							$('#doorPickupLoryyHireSummaryTableDiv').removeClass('hide');
							$('#doorPickupLoryyHireSummaryTableDiv').removeAttr('style');
							
							if(Number($('#searchByOption').val()) == option_1)
								$('#doorPickupLoryyHireSummaryTableDivBtn').removeClass('hide');
						}, 200);

						let receivedAmount = 0;
						
						for (const element of doorPickupLorryHireSummary) {
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
						$('#doorPickupLoryyHireSummaryTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					} else {
						$('#doorPickupLoryyHireSummaryTableDiv').addClass('hide');
						$('#doorPickupLoryyHireSummaryTableDivBtn').addClass('hide');
						removeTableRows('doorPickupLoryyHireSummaryTable', 'tbody');
					}
					_this.checkSingleVoucherByDefault(isSingleVoucherCheckedByDefault,isSingleVoucherNonEditable);

				}, validateReceiveAmount : function(doorPickupLedgerId) {
					if(Number($('#lorryHireAmount' + doorPickupLedgerId).val()) == Number($('#balanceAmount1' + doorPickupLedgerId).val())){
						if(parseInt($('#amount' + doorPickupLedgerId).val()) > parseInt($('#lorryHireAmount' + doorPickupLedgerId).val()))
							showMessage('info', 'You can not enter greater value than ' + Number($('#lorryHireAmount' + doorPickupLedgerId).val()));

						if(Number($('#amount' + doorPickupLedgerId).val()) > Number($('#lorryHireAmount' + doorPickupLedgerId).val())) {
							showMessage('info', 'You can not enter greater value than ' + Number($('#lorryHireAmount' + doorPickupLedgerId).val()));
							return false;
						}
						
						if(parseInt($('#amount' + doorPickupLedgerId).val()) == parseInt($('#balanceAmount1' + doorPickupLedgerId).val())){
							$('#paymentType' + doorPickupLedgerId).val(paymentTypeStatus.PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_NAME);
						}
						
						if(Number($('#amount' + doorPickupLedgerId).val()) == Number($('#balanceAmount1' + doorPickupLedgerId).val())){
							$('#paymentType' + doorPickupLedgerId).val(paymentTypeStatus.PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_NAME);
						}

						$('#balanceAmount' + doorPickupLedgerId).val(Number($('#lorryHireAmount' + doorPickupLedgerId).val()) - Number($('#amount' + doorPickupLedgerId).val()));
					} else if(Number($('#lorryHireAmount' + doorPickupLedgerId).val()) > Number($('#balanceAmount1' + doorPickupLedgerId).val())){
						if(parseInt($('#amount' + doorPickupLedgerId).val()) > parseInt($('#balanceAmount1' + doorPickupLedgerId).val())) {
							showMessage('info', 'You can not enter greater value than ' + Number($('#balanceAmount1' + doorPickupLedgerId).val()));
						}

						if(Number($('#amount' + doorPickupLedgerId).val()) > Number($('#balanceAmount1' + doorPickupLedgerId).val())) {
							showMessage('info', 'You can not enter greater value than ' + Number($('#balanceAmount1' + doorPickupLedgerId).val()));
							return false;
						}
						
						if(parseInt($('#amount' + doorPickupLedgerId).val()) == parseInt($('#balanceAmount1' + doorPickupLedgerId).val())){
							$('#paymentType' + doorPickupLedgerId).val(paymentTypeStatus.PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_NAME);
						}
						
						if(Number($('#amount' + doorPickupLedgerId).val()) == Number($('#balanceAmount1' + doorPickupLedgerId).val())){
							$('#paymentType' + doorPickupLedgerId).val(paymentTypeStatus.PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_NAME);
						}

						$('#balanceAmount' + doorPickupLedgerId).val(Number($('#balanceAmount1' + doorPickupLedgerId).val()) - Number($('#amount' + doorPickupLedgerId).val()));
					}
						
					_this.calculateTDSAmount(doorPickupLedgerId);
					_this.setTotalAmount();
				}, setTotalAmount : function() {
					let table 	= $("#reportTable");
					let count 	= +table[0].rows.length - 2;
					let totalAmount			= 0;
					let totalBalanceAmount	= 0;
					let totalTdsAmount		= 0;
					let totalLorryHireAmt	= 0;
					
					for (let row = count; row > 0; row--) {
						let doorPickupLedgerId = table[0].rows[row].cells[0].firstChild.value;
						totalAmount			+= Number($('#amount' + doorPickupLedgerId).val());	
						totalBalanceAmount	+= Number($('#balanceAmount' + doorPickupLedgerId).val());
						totalTdsAmount		+= Number($('#tdsamount' + doorPickupLedgerId).val());	
						totalLorryHireAmt	+= Number($('#lorryHireAmount' + doorPickupLedgerId).val());	
					}

					$("#totalAmount").val(totalAmount);
					$("#totalBalanceAmount").val(totalBalanceAmount);
					$("#totalTdsAmount").val(totalTdsAmount);
					$("#totalLorryHireAmount").val(totalLorryHireAmt);
				}, validateTDSAmount : function(obj, doorPickupLedgerId) {
					if(obj.value > Number($('#amount' + doorPickupLedgerId).val())) {
						showMessage('info', 'You can not enter greater value than ' + Number($('#amount' + doorPickupLedgerId).val()));
						obj.value = 0;
					}
				}, calculateTDSAmount : function(doorPickupLedgerId) {
					let amount		= $('#amount' + doorPickupLedgerId).val();
					let tdsrate		= $('#tdsrate' + doorPickupLedgerId).val();
					let lorryHireAmount = $('#lorryHireAmount' + doorPickupLedgerId).val();
					let tdsamount	= 0;

					if(centralizedTdsRateSelectionAllow && lorryHireAmount > 0){
						 tdsamount	= (lorryHireAmount * tdsrate) / 100;
					} else {
						if(amount > 0 && tdsrate > 0) {
						 tdsamount	= (amount * tdsrate) / 100;
						}
					}

					$('#tdsamount' + doorPickupLedgerId).val(tdsamount);
				}, openPrint : function(exepenseVoucherDetailsId) {
					if(BranchExpenseConfiguration != null && BranchExpenseConfiguration.branchExpensePrintNewFlowAllow)
						window.open('BranchExpensePrint.do?pageId=25&eventId=43&voucherDetailsId=' + exepenseVoucherDetailsId, 'newwindow', 'config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
					else
						window.open('BranchExpensePrint.do?pageId=25&eventId=16&voucherDetailsId=' + exepenseVoucherDetailsId, 'newwindow', 'config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				}, setDoorPickupDetailsDataSearchedByVehicle : function(response) {
					$("#doorPickupLoryyHireSummaryTableDivBtn").addClass('hide');

					if(response.message != undefined) {
						hideLayer();
						$('#bottom-border-boxshadow').addClass('hide');
						$('#middle-border-boxshadow').hide();
						$('#doorpickuplorryhireDetailsBtn').addClass('hide');

						return;
					}
					
					if(isAllowSingleVoucherEntry)
						$("*[data-attribute=isSingleVoucherEntry]").removeClass("hide");

					if (centralizedTdsRateSelectionAllow) {
					    $("#tdsContainer").show();
					    _this.handleCentralizedTDS(tdsChargeList);
					    
					    $("#tdsDropdown").on("change", function() {
						    var selectedValue = $(this).val();
						    if (selectedValue == 0) {
						        $('.tdsrateCol select').val(selectedValue).prop('disabled', false); 
								$('.tdsamountCol input').val(selectedValue).prop('disabled', false); 
						    } else {
						         $('.tdsrateCol select').val(selectedValue).prop('disabled', true); 
							    $('.tdsamountCol input').val(selectedValue).prop('disabled', true); 
						    }
						});
					    if (!tdsChargeList || tdsChargeList.length === 0) {
					        $('.tdsRateRow').remove();
					    }
					}
					
					$('#middle-border-boxshadow').show();
					$('#doorpickuplorryhireDetailsBtn').removeClass('hide');
					$('#doorPickupDetails tbody').empty();
					$('#doorPickupDetails tfoot').empty();
					$('#reportTable tbody').empty();
					$('#reportTable tfoot').empty();

					hideLayer();
					let doorPickupLedgerlist		= response.DoorPickupLedger;

					if(doorPickupLedgerlist.length > 0)
						$('#bottom-border-boxshadow').removeClass('hide');
					
					$("*[data-attribute=manualDate]").removeClass("hide");
					
					if(centralizedPaymentModeSelectionForAll){
						$(".paymentTypeSelection").removeClass("hide");
							$('#paymentType'+' option[value]').remove();
							$('#paymentType').append($("<option>").attr('value', 0).text("-- Please Select-----"));
							$('#paymentMode'+' option[value]').remove();
							$('#paymentMode').append($("<option>").attr('value', 0).text("-- Please Select-----"));

						$(paymentTypeArr).each(function() {
							$('#paymentMode').append($("<option>").attr('value', this.paymentTypeId).text(this.paymentTypeName));
						});

						$(paymentStatusArrForSelection).each(function() {
							$('#paymentType').append($("<option>").attr('value', this.paymentStatusId).text(this.paymentStatusString));
						});
						
						$("#paymentType").change(function() {
							 let selectindex = $(this).prop('selectedIndex')
							 $('.selectAllPaymentType').prop('selectedIndex', selectindex)
						});
						
						$("#paymentMode").change(function(){
							 let selectindex = $(this).prop('selectedIndex')
							 $('.selectAllPaymentMode').prop('selectedIndex', selectindex)
						});
						
						$("#cremark").on("input", function() {
							 let remarkValue = $(this).val();
							 $('.setAllRemark').val(remarkValue);
						});
					}	
					
					$('#isSingleVoucherEntry').on('change', function () {
				        if ($(this).is(':checked')) 
				         	$('.selectAllPaymentMode').attr('disabled', 'disabled');
						else
							$('.selectAllPaymentMode').removeAttr('disabled');
				    });

					_this.setDoorPickupDetails(doorPickupLedgerlist);
					
					let columnArray						= new Array();

					for (const element of doorPickupLedgerlist) {
						let obj					= element;
						
						let doorPickupLedgerId 	= obj.doorPickupLedgerId;
						totalAmount += obj.balanceAmount;
						
						columnArray.push("<td><input type='checkbox' id='singleCheckBox" + doorPickupLedgerId + "' name='singleCheckBox' class='form-control singleCheckBox' value='" + doorPickupLedgerId + "'/></td>");
						columnArray.push("<td><input type='text' id='pickupNumber"+doorPickupLedgerId + "' name='pickupNumber' class='form-control' value='"+obj.doorPickupNumber + "' style='width:  170px; text-align: right; background-color: #9bd6f2;text-align: center;font-weight:bold' onkeypress='return noNumbers(event);' readonly='readonly' /></td> ");
						columnArray.push("<td><input type='text' id='lorryHireAmount"+doorPickupLedgerId + "' name='lorryHireAmount' value='"+ obj.doorPickupLedgerLorryHireAmount + "' class='form-control' maxlength='7'  style='width:  170px; text-align: center;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						
						if(allowPartialPayment) {
							columnArray.push("<td class='paymentTypeSelection'><select style='' name='paymentType' id='paymentType"+doorPickupLedgerId+"' class='form-control width-150px selectAllPaymentType' onchange='changeClearPayment("+doorPickupLedgerId+",this,"+ obj.balanceAmount +")'onfocus='' ></select></td>");
							columnArray.push("<td class='paymentModeSelection'><select style='' name='paymentMode' id='paymentMode"+doorPickupLedgerId+"' onchange='onPaymentModeSelect("+doorPickupLedgerId+",this);' class='form-control width-150px selectAllPaymentMode'  onchange=''onfocus='' ></select></td>");
						}
						
						columnArray.push("<td><input type='text' id='amount" + doorPickupLedgerId + "' name='amount' placeholder='Amount' value='' maxlength='7' class='form-control inputAmount' style='width: 170px; text-align: right;' onkeypress='return noNumbers(event);' onblur='clearIfNotNumeric(this,0);' oninput='calculateTotal()' onfocus='if(this.value=='0')this.value='';/></td>");
						
						if(PickupLorryHireTdsProperty.IsTdsAllow) {
							if(tdsChargeList != undefined && tdsChargeList.length > 0)
								columnArray.push("<td class='tdsrateCol'><select name='tdsrate' id='tdsrate" + doorPickupLedgerId+"' class='form-control'></select></td>");
							
							columnArray.push("<td class='datatd tdsamountCol' align='left' ><input type='text' id='tdsamount"+doorPickupLedgerId+"' name='tdsamount' class='form-control' value='0' maxlength='7'  style='width:  100px; text-align: right;' onkeypress='return noNumbers(event);' onblur='clearIfNotNumeric(this,0);' onkeyup=''onfocus='if(this.value=='0')this.value='';'/></td>");
						}
						
						columnArray.push("<td><input type='text' id='balanceAmount" + doorPickupLedgerId + "' name='balanceAmount' value='" + obj.balanceAmount + "' maxlength='7' class='form-control' style='width: 170px; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td class='hide'><input type='hidden' id='balanceAmount1" + doorPickupLedgerId + "' name='balanceAmount1' value='" + obj.balanceAmount + "' maxlength='7' class='form-control' style='width: 100px; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td class='hide'><input type='text' id='dueAmount_"+doorPickupLedgerId+"' name='balanceAmount' value='" + obj.balanceAmount + "' maxlength='7' class='form-control dueAmounts' style='display: none; width: 170px; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");

						if(PickupLorryHireTdsProperty.IsPANNumberRequired)
							columnArray.push("<td class='panNumberCol'><input type='text'  id='panNumber" + doorPickupLedgerId + "' name='panNumber' placeholder='PAN Number' class='form-control' style='width: 200px; text-transform: uppercase;' maxlength='10'></input></td>");
						
						if(PickupLorryHireTdsProperty.IsTANNumberRequired)
							columnArray.push("<td class='tanNumberCol'><input type='text'  id='tanNumber" + doorPickupLedgerId + "' name='tanNumber' placeholder='TAN Number' class='form-control' style='width: 200px; text-transform: uppercase;' maxlength='10'></input></td>");
						
						columnArray.push("<td><input type='text' id='remark" + doorPickupLedgerId + "' name='remark' placeholder='Remark' class='form-control setAllRemark' style='width: 200px; text-transform: uppercase;' maxlength='250'></input></td>");
						
						$('#reportTable tbody').append("<tr id=billDetails'" + doorPickupLedgerId + "'>" + columnArray.join(' ') + '</tr>');

						columnArray	= [];
						
						$('#paymentType' + doorPickupLedgerId).append($("<option>").attr('value', 0).text("-- Please Select-----"));
						
						$(paymentStatusArrForSelection).each(function() {
							$('#paymentType' + doorPickupLedgerId).append($("<option>").attr('value', this.paymentStatusId).text(this.paymentStatusString));
						});
						
						$(paymentTypeArr).each(function() {
							$('#paymentMode' + doorPickupLedgerId).append($("<option>").attr('value', this.paymentTypeId).text(this.paymentTypeName));
						})
						
						if(allowPartialPayment) {
							$('#paymentType' + doorPickupLedgerId+' option[value]').remove();
							$('#paymentType' + doorPickupLedgerId).append($("<option>").attr('value', 0).text("-- Please Select-----"));
							$('#paymentMode' + doorPickupLedgerId+' option[value]').remove();
							$('#paymentMode' + doorPickupLedgerId).append($("<option>").attr('value', 0).text("-- Please Select-----"));

							$(paymentStatusArrForSelection).each(function() {
								$('#paymentType' + doorPickupLedgerId).append($("<option>").attr('value', this.paymentStatusId).text(this.paymentStatusString));
							});
							
							$(paymentTypeArr).each(function() {
								$('#paymentMode' + doorPickupLedgerId).append($("<option>").attr('value', this.paymentTypeId).text(this.paymentTypeName));
							});
                        }

						if(PickupLorryHireTdsProperty.IsTdsAllow)
							_this.setTdsRateSelection(doorPickupLedgerId);

						$("#amount" + doorPickupLedgerId).bind("blur", function() {
							_this.validateReceiveAmount(doorPickupLedgerId);
						});

						$("#amount" + doorPickupLedgerId).bind("keyup", function() {
							_this.validateReceiveAmount(doorPickupLedgerId);
						});
						
						$("#tdsamount" + doorPickupLedgerId).bind("keyup", function() {
							_this.validateTDSAmount(this, doorPickupLedgerId);
							_this.setTotalAmount();
						});
						
						$("#tdsDropdown").on("change", function() {
							_this.calculateTDSAmount(doorPickupLedgerId);
							_this.setTotalAmount();
						});

						$("#tdsrate" + doorPickupLedgerId).bind("change", function() {
							_this.calculateTDSAmount(doorPickupLedgerId);
							_this.setTotalAmount();
						});
					}
					
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;font:bold;'>Total</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;' ><input type='text' id='totalLorryHireAmount' value='0' class='form-control' style='width: 170px; text-align: center;' readonly='readonly'/></td>");
						
					if(allowPartialPayment) {
						columnArray.push("<td class='paymentTypeSelection' style='text-align: center; vertical-align: middle;'></td>");
						columnArray.push("<td class='paymentModeSelection' style='text-align: center; vertical-align: middle;'></td>");
					}
						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='text' id='totalAmount' value='0'  maxlength='7' class='form-control' style='text-align: center;width:170px;' readonly='readonly'/></td>");
						
					if(PickupLorryHireTdsProperty.IsTdsAllow) {
						if(tdsChargeList != undefined && tdsChargeList.length > 0)
							columnArray.push("<td class='tdsrateCol' style='text-align: center; vertical-align: middle;'></td>");
						
						columnArray.push("<td class='datatd tdsamountCol'><input type='text' id='totalTdsAmount' value='0' class='form-control' style='width: 100px; text-align: center;' readonly='readonly'/></td>");
					}
						
					columnArray.push("<td style='text-align: center; vertical-align: middle;' ><input type='text' id='totalBalanceAmount' value='0'  maxlength='7' class='form-control' style='text-align: center;width: 170px;' readonly='readonly'/></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;display:none;'></td>");
						
					if(PickupLorryHireTdsProperty.IsPANNumberRequired)
						columnArray.push("<td class='panNumberCol' style='text-align: center; vertical-align: middle;'></td>");
						
					if(PickupLorryHireTdsProperty.IsTANNumberRequired)
						columnArray.push("<td class='tanNumberCol' style='text-align: center; vertical-align: middle;'></td>");
						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					
					$('#reportTable tfoot').append('<tr>' + columnArray.join(' ') + '</tr>');
					
					$('#paymentType').on('change', function() {
						let paymentTypeVal = $('#paymentType').val(); 
						
						$('.dueAmounts').each((el, index) => {
							let id	= index.id.split('_')[1];
							let dueAmt =index.value;
								
							if (paymentTypeVal == DOORPICKUP_LORRYHIREAMOUNT_SETTLEMENT_STATUS_CLEAR) {
								$('#amount'+id).val(dueAmt);
								$('#balanceAmount'+id).val(0);	
								$('#totalAmount').val(totalAmount);	
								$('#totalBalanceAmount').val(0);
							} else {
								$('#balanceAmount'+id).val(dueAmt);
								$('#amount'+id).val(0);
								$('#totalBalanceAmount').val(totalAmount);
								$('#totalAmount').val(0);	
							}
						});
					});
	
					_this.checkSingleVoucherByDefault(isSingleVoucherCheckedByDefault,isSingleVoucherNonEditable);
					_this.setTotalAmount();
				}, handleCentralizedTDS : function(tdsChargeList) {
					const dropdown = $("#tdsDropdown");

					dropdown.empty().append("<option value='0'>Select TDS %</option>");

						let tdsRateDropdown = "<option value='0'>Select TDS %</option>";
						if (tdsChargeList && tdsChargeList.length > 0) {
							for (const element of tdsChargeList) {
								if (element != null)
									tdsRateDropdown += "<option value='" + element + "'>" + element + "</option>";
							}
						}
						dropdown.html(tdsRateDropdown);
				}, setTdsRateSelection : function(doorPickupLedgerId) {
					if(tdsChargeList != undefined && typeof tdsChargeList != 'undefined' && tdsChargeList.length > 0) {
						$('#tdsrate' + doorPickupLedgerId).append('<option value="0" selected="selected">--Select--</option>');
						
						for(const element of tdsChargeList) {
							$('#tdsrate' + doorPickupLedgerId).append('<option value="' + element + '" id="' + element + '">' + element + '</option>');
						}
					}
				}, setDoorPickupDetails: function(doorPickupLedgerlist) {
					let columnArray = new Array();
					let totalColumnArray = new Array();
					let totalLorryHireAmt = 0;
					
					for (const element of doorPickupLedgerlist) {
						let obj = element;
						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.doorPickupNumber + "</td>");
						columnArray.push("<td class='lorryHireAmount' style='text-align: center; vertical-align: middle;'>" + obj.doorPickupLedgerLorryHireAmount + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.creationDateTimeString + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.pickUpSource + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.pickUpDestination + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.doorPickupLedgerVehicleNumber + "</td>");
						$('#doorPickupDetails tbody').append('<tr>' + columnArray.join(' ') + '</tr>');

						totalLorryHireAmt += obj.doorPickupLedgerLorryHireAmount;

						columnArray = [];
					}

					totalColumnArray.push("<td style='text-align: center; vertical-align: middle;'>Total</td>");
					totalColumnArray.push("<td class='lorryHireAmount' style='text-align: center; vertical-align: middle;'>" + totalLorryHireAmt + "</td>");
					totalColumnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					totalColumnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					totalColumnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					totalColumnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");

					$('#doorPickupDetails tfoot').append('<tr class="danger">' + totalColumnArray.join(' ') + '</tr>');
				}, setDoorPickupLorryHireSummary : function(doorPickupLorryHireSummary) {
					if(doorPickupLorryHireSummary.length > 0 ) {
						setTimeout(function() { 
							$('#doorPickupLoryyHireSummaryTableDiv').removeClass('hide');
							$('#doorPickupLoryyHireSummaryTableDiv').removeAttr('style');
							
							if(Number($('#searchByOption').val()) == option_1){
								$('#doorPickupLoryyHireSummaryTableDivBtn').removeClass('hide');
							}
						}, 200);
						
						let columnArray						= new Array();

						let receivedAmount = 0;
					
						for (const element of doorPickupLorryHireSummary) {
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
						$('#doorPickupLoryyHireSummaryTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					} else {
						$('#doorPickupLoryyHireSummaryTableDiv').addClass('hide');
						$('#doorPickupLoryyHireSummaryTableDivBtn').addClass('hide');
						removeTableRows('doorPickupLoryyHireSummaryTable', 'tbody');
					}
				}, settleDoorPickupLorryHire : function() {
					let doorPickupLorryHireObj		= new Object;

					let jsonObject		= new Object();
					let checkBoxArray	= getAllCheckBoxSelectValue('singleCheckBox');
					
					if(checkBoxArray.length == 0) {
						showMessage('error', 'Please Select At least One PICKUP LS!');
						hideLayer();
						return;
					}
					
					for (const element of checkBoxArray) {
						let doorPickupLedgerId = element;

						if(!validateInputTextFeild(1, 'amount' + doorPickupLedgerId, 'amount' + doorPickupLedgerId, 'error', amountEnterErrMsg))
							return false;

						if(allowPartialPayment && $('#paymentType' + doorPickupLedgerId).val() == 0) {
							$("#paymentType" + doorPickupLedgerId).focus();
							showMessage('error', ' Please Select Payment Type');
							return false
						}
							
						if(allowPartialPayment && $('#paymentMode' + doorPickupLedgerId).val() == 0) {
							$("#paymentMode" + doorPickupLedgerId).focus();
							showMessage('error', ' Please Select Payment Mode');
							return false
						}

						if(allowPartialPayment && Number($('#paymentType' + doorPickupLedgerId).val()) == paymentTypeStatus.PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_NAME) {
							if(Number($('#lorryHireAmount' + doorPickupLedgerId).val()) == Number($('#balanceAmount1' + doorPickupLedgerId).val())) {
								if(Number($('#amount' + doorPickupLedgerId).val()) < Number($('#balanceAmount1' + doorPickupLedgerId).val())) {
									showMessage('info', 'You can not enter less value than ' + Number($('#lorryHireAmount' + doorPickupLedgerId).val()));
									return false;
								}
							} else if (Number($('#lorryHireAmount' + doorPickupLedgerId).val()) > Number($('#balanceAmount1' + doorPickupLedgerId).val())) {
								if(Number($('#amount' + doorPickupLedgerId).val()) < Number($('#balanceAmount1' + doorPickupLedgerId).val())) {
									showMessage('info', 'You can not enter less value than ' + Number($('#balanceAmount1' + doorPickupLedgerId).val()));
									return false;
								}
							}
						}

						if(Number($('#lorryHireAmount' + doorPickupLedgerId).val()) == Number($('#balanceAmount1' + doorPickupLedgerId).val())) {
							if(Number($('#amount' + doorPickupLedgerId).val()) > Number($('#lorryHireAmount' + doorPickupLedgerId).val())) {
								showMessage('info', 'You can not enter greater value than ' + Number($('#lorryHireAmount' + doorPickupLedgerId).val()));
								return false;
							}

							if(Number($('#amount' + doorPickupLedgerId).val()) > Number($('#lorryHireAmount' + doorPickupLedgerId).val())) {
								$("#amount" + doorPickupLedgerId).css("border-color", "red");
								$("#amount" + doorPickupLedgerId).focus();
								showMessage('info', 'You can not enter greater value than ' + $('#lorryHireAmount' + doorPickupLedgerId).val());
								return false;
							}
						} else if(Number($('#lorryHireAmount' + doorPickupLedgerId).val()) > Number($('#balanceAmount1' + doorPickupLedgerId).val())) {
							if(Number($('#amount' + doorPickupLedgerId).val()) > Number($('#balanceAmount1' + doorPickupLedgerId).val())){
								showMessage('info', 'You can not enter greater value than ' + Number($('#balanceAmount1' + doorPickupLedgerId).val()));
								$("#amount" + doorPickupLedgerId).css("border-color", "red");
								$("#amount" + doorPickupLedgerId).focus();
								return false;
							}
						}

						if(PickupLorryHireTdsProperty.IsPANNumberRequired && PickupLorryHireTdsProperty.IsPANNumberMandetory) {
							if($('#tdsamount' + doorPickupLedgerId).val() > 0 && !validateInputTextFeild(1, 'panNumber' + doorPickupLedgerId, 'panNumber' + doorPickupLedgerId, 'error', panNumberErrMsg)
							|| !validateInputTextFeild(8, 'panNumber' + doorPickupLedgerId, 'panNumber' + doorPickupLedgerId, 'info', validPanNumberErrMsg))
								return false;
						}

						if(PickupLorryHireTdsProperty.IsTANNumberRequired && PickupLorryHireTdsProperty.IsTANNumberMandetory) {
							if($('#tdsamount' + doorPickupLedgerId).val() > 0 && !validateInputTextFeild(1, 'tanNumber' + doorPickupLedgerId, 'tanNumber' + doorPickupLedgerId, 'error', tanNumberErrMsg)
							|| !validateInputTextFeild(13, 'tanNumber' + doorPickupLedgerId, 'tanNumber' + doorPickupLedgerId, 'info', validTanNumberErrMsg))
								return false;
						}
							
						if(!validateInputTextFeild(1, 'remark' + doorPickupLedgerId, 'remark' + doorPickupLedgerId, 'error', ramarkErrMsg))
							return false;

						let doorPickupLorryDetailsObject = new Object();

						doorPickupLorryDetailsObject.doorPickupLedgerId		= doorPickupLedgerId;
						doorPickupLorryDetailsObject.doorPickupNumber		= $('#pickupNumber' + doorPickupLedgerId).val();
						doorPickupLorryDetailsObject.branchId				= $('#branchEle_primary_key').val();
						doorPickupLorryDetailsObject.balanceAmount			= $('#balanceAmount' + doorPickupLedgerId).val();
						doorPickupLorryDetailsObject.Amount					= $('#amount' + doorPickupLedgerId).val();
						doorPickupLorryDetailsObject.tdsOnAmount			= $('#amount' + doorPickupLedgerId).val();
						doorPickupLorryDetailsObject.tdsAmount				= $('#tdsamount' + doorPickupLedgerId).val();
						doorPickupLorryDetailsObject.tdsRate				= $('#tdsRate' + doorPickupLedgerId).val();
						doorPickupLorryDetailsObject.PanNumber				= $('#panNumber' + doorPickupLedgerId).val();
						doorPickupLorryDetailsObject.TanNumber				= $('#tanNumber' + doorPickupLedgerId).val();
						doorPickupLorryDetailsObject.lorryHireAmount		= $('#lorryHireAmount' + doorPickupLedgerId).val();
						doorPickupLorryDetailsObject.remark					= $('#remark' + doorPickupLedgerId).val();
						doorPickupLorryDetailsObject.paymentType			= $('#paymentMode' + doorPickupLedgerId).val();
						doorPickupLorryDetailsObject.fromDate 				= $("#manualDateEle").val();
						doorPickupLorryDetailsObject.paymentStatus			= $("#paymentType" + doorPickupLedgerId).val();
						doorPickupLorryHireObj['doorPickupLedgerId_' + doorPickupLedgerId]	= doorPickupLorryDetailsObject;
					}

					jsonObject["doorPickupLorryHireData"]			= JSON.stringify(doorPickupLorryHireObj);
					jsonObject.fromDate 							= $("#manualDateEle").val();
					jsonObject["ledgerIds"]							= checkBoxArray.join(',');
					
					let paymentCheckBoxArr	= getAllCheckBoxSelectValue('paymentCheckBox');
					
					jsonObject["paymentValues"]					= paymentCheckBoxArr.join(',');
					jsonObject["centralizedPaymentMode"]		= $('#paymentMode').val();
					
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

							if($('#isSingleVoucherEntry').is(':checked'))
								getJSON(jsonObject, WEB_SERVICE_URL + '/pickupLorryHireAmountSettlementWS/settleDoorPickupLorryHireWithSingleVoucher.do', _this.responseAfterSettle, EXECUTE_WITH_ERROR);
							else
								getJSON(jsonObject, WEB_SERVICE_URL + '/pickupLorryHireAmountSettlementWS/settleDoorPickupLorryHire.do', _this.responseAfterSettle, EXECUTE_WITH_ERROR);
							
							showLayer();
						}
					});
				}, responseAfterSettle : function(response) {
					exepenseVoucherDetailsIdArr 	= response.exepenseVoucherDetailsIdArr;
					PaymentVoucherSequenceNumberArr = response.PaymentVoucherSequenceNumberArr;
					
					let doorPickupLedgerList		= response.doorPickupLedgerList;
					
					if(repayMentWindow == 'true' || repayMentWindow == true){
						window.opener.setValueForParentWindow(doorPickupLedgerList,exepenseVoucherDetailsIdArr,PaymentVoucherSequenceNumberArr);
						window.close();
					} else
						$('#top-border-boxshadow').removeClass('hide');
					
					$("#doorpickuplorryhireDetailsBtn").addClass('hide');
					$("#dateDiv").addClass('hide');
					$("#middle-border-boxshadow").hide();
					$("#bottom-border-boxshadow").addClass('hide');
					$("#dateDivCheck").addClass('hide');
					$("#searchBy").addClass('hide');
					$("#pickupNumberAndBranchDiv").addClass('hide');
					$("#vehicleNumberDiv").addClass('hide');
					$("#vehicleAgentNameDiv").addClass('hide');
					$("#searchBtnDiv").addClass('hide');
					$("#doorPickupLoryyHireSummaryTableDivBtn").addClass('hide');
					$("#doorPickupLoryyHireSummaryTableDiv").addClass('hide');
					$("#viewAddedPaymentDetailsCreate").addClass('hide');
					
					if(response.message != undefined) {
						let printBtn;
						
						if(exepenseVoucherDetailsIdArr != null && exepenseVoucherDetailsIdArr.length > 0){
							for(let m = 0 ; m < exepenseVoucherDetailsIdArr.length ; m++){
								exepenseVoucherDetailsId	= exepenseVoucherDetailsIdArr[m];
								
								if(exepenseVoucherDetailsIdArr[m] > 0 && PaymentVoucherSequenceNumberArr != null) {
									printBtn = $('<b>Voucher No :</b> ' + PaymentVoucherSequenceNumberArr[m] + '&emsp;<button onclick="openPrint('+exepenseVoucherDetailsIdArr[m]+')" type="button" value="'+exepenseVoucherDetailsIdArr[m]+'" name="reprintBtn'+exepenseVoucherDetailsIdArr[m]+'" id="reprintBtn'+exepenseVoucherDetailsIdArr[m]+'" class="btn btn-success" data-tooltip="Reprint">Reprint</button><div class="row">&nbsp;</div>')
									$('#reprintOption').append(printBtn);
								}
							}
						}
						
						if(doorPickupLedgerList != null && doorPickupLedgerList.length > 0) {
							for(const element of doorPickupLedgerList) {
								let	doorPickupLedgerId	= element.doorPickupLedgerId;
								
								if(doorPickupLedgerId > 0 && element.balanceAmount > 0) {
									printBtn = $('<b>Pick up No :</b> ' + element.doorPickupNumber + '&emsp;<b class="" id="dueAmountRemaining'+element.doorPickupLedgerId+'">Due Amount : '+element.balanceAmount+'</b>&emsp;<button type="button" id="repayOption'+element.doorPickupLedgerId+'" onclick="openChildWinForRePayment('+element.doorPickupNumber+','+element.doorPickupLedgerBranchId+')" class="btn btn-primary" data-tooltip="Repay">Repay</button><div class="row">&nbsp;</div>')
									$('#repayOption').append(printBtn);
								}
							}
						}

						pickupNumberArrCount = new Array();
						hideLayer();
					}
				}, checkDateSelection : function() {

					let isViewAllSelected	= $('#viewAllEle').is(':checked');

					if(isViewAllSelected) {
						$("#dateDiv").removeClass("hide");
					} else {
						$("#dateDiv").addClass("hide");
					}
				}, checkSingleVoucherByDefault : function(isSingleVoucherCheckedByDefault,isSingleVoucherNonEditable) { 
					if (isSingleVoucherCheckedByDefault) {
						$("#isSingleVoucherEntry").prop("checked", true);
						
						if (isSingleVoucherNonEditable) {
            				$("#isSingleVoucherEntry").prop("disabled", true);
      					  }
							if ($('#isSingleVoucherEntry').is(':checked')) 
							     $('.selectAllPaymentMode').attr('disabled', 'disabled');
							else
								$('.selectAllPaymentMode').removeAttr('disabled');
					}else
						$("#isSingleVoucherEntry").prop("checked", false);
									
				}
			});
		});

function selectAllPickupLs(param){
	$(".singleCheckBox").prop('checked', param)
}

function openPrint(exepenseVoucherDetailsId){
	if(BranchExpenseConfiguration != null && BranchExpenseConfiguration.branchExpensePrintNewFlowAllow) {
		window.open('BranchExpensePrint.do?pageId=25&eventId=43&voucherDetailsId=' + exepenseVoucherDetailsId, 'newwindow', 'config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	} else {
		window.open('BranchExpensePrint.do?pageId=25&eventId=16&voucherDetailsId=' + exepenseVoucherDetailsId, 'newwindow', 'config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	}
}
function setValueForParentWindow(doorPickupLedgerList, exepenseVoucherDetailsIdArr, PaymentVoucherSequenceNumberArr){
	for(const element of doorPickupLedgerList) {
		if(element.balanceAmount == 0) {
			$('#repayOption' + element.doorPickupLedgerId).addClass('hide');
			$('#dueAmountRemaining' + element.doorPickupLedgerId).addClass('hide');
		} else
			$('#dueAmountRemaining' + element.doorPickupLedgerId).html('Due Amount : ' + element.balanceAmount);
	}

	let printBtn;
	
	if(exepenseVoucherDetailsIdArr != null && exepenseVoucherDetailsIdArr.length > 0) {
		for(let m = 0 ; m < exepenseVoucherDetailsIdArr.length ; m++) {
			let exepenseVoucherDetailsId	= exepenseVoucherDetailsIdArr[m];
			
			if(exepenseVoucherDetailsId > 0 && PaymentVoucherSequenceNumberArr != null) {
				printBtn = $('<b>Voucher No :</b> ' + PaymentVoucherSequenceNumberArr[m] + '&emsp;<button type="button" onclick="openPrint('+exepenseVoucherDetailsId+')" value="'+exepenseVoucherDetailsId+'" name="reprintBtn'+exepenseVoucherDetailsId+'" id="reprintBtn'+exepenseVoucherDetailsId+'" class="btn btn-success" data-tooltip="Reprint">Reprint</button><div class="row">&nbsp;</div>')
				$('#reprintOption').append(printBtn);
			}
		}
	}
}

function changeClearPayment(id,obj,input2){
	let options = obj.value;
	
	if (options == 3) {
		let input1 = $(`#amount${id}`);
		input1.val(input2)
		let input2Field = $(`#balanceAmount${id}`);
		input2Field.val('0') 
  		calculateTotal()
	} else {
		let input1 = $(`#amount${id}`);
		input1.val('0')
		let input2Field = $(`#balanceAmount${id}`);
		input2Field.val(input2)
		calculateTotal()
	}				
}
	
function calculateTotal() {
	let inputs = document.querySelectorAll('.inputAmount');
	let total = 0;

	inputs.forEach(function(input) {
		total += parseFloat(input.value) || 0; 
	});

	$('#totalAmount').val(total);
	$('#totalBalanceAmount').val(totalAmount - total)
}
		
function onPaymentModeSelect(billId, obj) {
	$('#uniqueWayBillId').val(billId);
	
	let paymentMode        = $('#paymentMode').val();
    $('.paymentMode').val(paymentType);
    
    if(paymentMode > 0)
        $('.paymentMode').attr('disabled' , 'disabled');
    else
        $('.paymentMode').removeAttr('disabled');
        
	if(billId > 0) {
		$('#uniqueWayBillNumber').val($('#pickupNumber' + billId).val());
		$('#uniquePaymentType').val($('#paymentMode' + billId).val());
		$('#uniquePaymentTypeName').val($("#paymentMode" + billId + " option:selected").text());
	} else {
		$('#uniqueWayBillNumber').val('');
		$('#uniquePaymentType').val(0);
		$('#uniquePaymentTypeName').val('');
	}
	
	hideShowBankPaymentTypeOptions(obj);
}

function openChildWinForRePayment(doorPickupLsNumber, doorPickupLedgerBranchId) {
	if(doorPickupLedgerBranchId != "" && doorPickupLsNumber > 0) {
		window.open('Dispatch.do?pageId=340&eventId=1&modulename=pickupLorryHireSettlement&doorPickupLsNumber=' + doorPickupLsNumber + '&doorPickupBranchId='+doorPickupLedgerBranchId+'&repayMentWindow='+true, 'newwindow', 'height=1000,width=1500');
	}
}
