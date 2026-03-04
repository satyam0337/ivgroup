var moduleId 					= 0;
var incomeExpenseModuleId 		= 0;
var ModuleIdentifierConstant	= null;
var PaymentTypeConstant			= null;
var dateArr						= null;
var GeneralConfiguration		= null;
define(
		[
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/consolidatedBLHPV/consolidatedBLHPVfilepath.js',
			'/ivcargo/resources/js/generic/urlparameter.js',
			PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
			'selectizewrapper',
			PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js',
			'JsonUtility',
			'messageUtility',
			'jquerylingua',
			'language',
			'autocomplete',
			'autocompleteWrapper',
			'bootstrapSwitch',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
			'/ivcargo/resources/js/module/redirectAfterUpdate.js'
			],
			function(FilePath, UrlParameter, Selection, Selectizewrapper) {
			'use strict';
			var myNod,  _this = '' ,LHPVConstant,
			searchVehicleNod,searchVehicleAgentNod,LHPVChargeTypeConstant,lhpvChargesForGroupList,lhpvChargeLHPVIdMap,lHPVModelArray,vehcileNumberArr=[],
			blhpvConfiguration, consolidatedBLHPVId,consolidatedblhpvNumber,lhpvIdArrayList =new Array() ,lhpvChargeTypeConstant,doneTheStuff=false,
			TOKEN_KEY = null, TOKEN_VALUE = null,showManualDateOption = false;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
					consolidatedBLHPVId 		= UrlParameter.getModuleNameFromParam('consolidatedBLHPVId');
					consolidatedblhpvNumber  	= UrlParameter.getModuleNameFromParam('consolidatedBLHPVNumber');
				}, render : function() {
					getJSON(null, WEB_SERVICE_URL	+ '/consolidatedBlhpvWS/getConsolidatedBLHPVConfig.do?',_this.renderConsolidatedBLHPVElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderConsolidatedBLHPVElements : function(response) {
					showLayer();
					var loadelement			= new Array();
					var baseHtml 			= new $.Deferred();
					LHPVConstant			= response.LHPVConstant;
					loadelement.push(baseHtml);

					ModuleIdentifierConstant	= response.ModuleIdentifierConstant;
					moduleId					= response.moduleId;
					incomeExpenseModuleId		= response.incomeExpenseModuleId;
					PaymentTypeConstant			= response.PaymentTypeConstant;
					LHPVChargeTypeConstant		= response.LHPVChargeTypeConstant;
					TOKEN_KEY					= response.TOKEN_KEY;
					TOKEN_VALUE					= response.TOKEN_VALUE;
					blhpvConfiguration			= response;
					GeneralConfiguration		= response.GeneralConfiguration;

					$("#mainContent").load("/ivcargo/html/module/consolidatedBLHPV/consolidatedBLHPV.html", function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						hideLayer();
						loadLanguageWithParams(FilePath.loadLanguage());

						var options			= new Object();

						$("#dateEle").DatePickerCus(options);

						myNod 					= nod();
						searchVehicleNod 		= nod();
						searchVehicleAgentNod 	= nod();
						paymentType 			= nod();


						myNod.configure({
							parentClass:'validation-message'
						});

						searchVehicleNod.configure({
							parentClass:'validation-message'
						});

						searchVehicleAgentNod.configure({
							parentClass:'validation-message'
						});

						paymentType.configure({
							parentClass:'validation-message'
						});

						Selectizewrapper.setAutocomplete({
							jsonResultList	: 	response.paymentTypeArr,
							valueField		:	'paymentTypeId',
							labelField		:	'paymentTypeName',
							searchField		:	'paymentTypeName',
							elementId		:	'paymentType',
							onChange		:	_this.onPaymentTypeSelect
						});

						searchVehicleNod.add({
							selector	: '#vehicleNumberEle_wrapper',
							validate	: 'validateAutocomplete:#vehicleNumberEle',
							errorMessage: 'Select Proper Vehicle !'
						});

						searchVehicleAgentNod.add({
							selector		: '#vehicleAgentEle',
							validate		: 'validateAutocomplete:#vehicleAgentEle',
							errorMessage	: 'Select proper Vehicle Agent'
						});

						myNod.add({
							selector		: '#LHVPNumberEle',
							validate		: 'presence',
							errorMessage	: 'Enter LHVP Number !'
						});

						paymentType.add({
							selector	: "#paymentType_wrapper",
							validate	: "validateAutocomplete:#paymentType",
							errorMessage: "Please Select Payment Type"
						});
						
						$("#vehicleAgentEle").change (function() {
							$("#vehicleNumberDiv").removeClass("hide");
						});

						$("#searchOperation").change (function() {
							initialiseFocus();
							refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
							removeTableRows('lhpvDetailsTable', 'tbody');

							if($("#searchOperation").val() == LHPVConstant.LHPV_SEARCH_TYPE_VEHICLE) {
								$("#vehicleNumberDiv").removeClass("hide");
								$("#vehicleAgentDiv").addClass("hide");
								$("#dateDiv").addClass("hide");
								$("#lhpvNumberDiv").addClass("hide");
								
								Selection.setVehicleAutocompleteWithSelectize(response);
							} else if($("#searchOperation").val() == LHPVConstant.LHPV_SEARCH_TYPE_VEHICLE_AGENT) {
								$("#vehicleAgentDiv").removeClass("hide");
								$("#vehicleNumberDiv").addClass("hide");
								$("#dateDiv").addClass("hide");
								$("#lhpvNumberDiv").addClass("hide");
								
								Selection.setVehicleAgent();
							} else if($("#searchOperation").val() == LHPVConstant.LHPV_SEARCH_TYPE_DATE) {
								$("#dateDiv").removeClass("hide");
								$("#vehicleAgentDiv").addClass("hide");
								$("#vehicleNumberDiv").addClass("hide");
								$("#lhpvNumberDiv").addClass("hide");
							} else if($("#searchOperation").val() == LHPVConstant.LHPV_SEARCH_TYPE_LHPV_NUMBER) {
								$("#lhpvNumberDiv").removeClass("hide");
								$("#dateDiv").addClass("hide");
								$("#vehicleAgentDiv").addClass("hide");
								$("#vehicleNumberDiv").addClass("hide");
							}
						});

						if(consolidatedBLHPVId > 0 && consolidatedblhpvNumber != null) {
							$("#previousConsolidatedBLHP").removeClass("hide");
							$('#previousNumber').html('<b>Consolidated BLHPV No :</b> ' + consolidatedblhpvNumber + '&emsp;<div class="row">&nbsp;</div>');
							$('#previousConsolidatedBLHP').append('<button type="button" name="reprintBtn" id="reprintBtn" class="btn btn-success" data-tooltip="Reprint">Reprint</button>');
							$("#reprintBtn").click(function() {
								_this.openPrint(consolidatedBLHPVId);
							});
						}

						$("#findBtn").click(function() {
							if(Number($("#searchOperation").val()) == LHPVConstant.LHPV_SEARCH_TYPE_VEHICLE) {
								searchVehicleNod.performCheck();
								
								if(searchVehicleNod.areAll('valid'))
									_this.onFind();
							}

							if(Number($("#searchOperation").val()) == LHPVConstant.LHPV_SEARCH_TYPE_VEHICLE_AGENT) {
								searchVehicleAgentNod.performCheck();

								if(searchVehicleAgentNod.areAll('valid'))
									_this.onFind();
							}

							if(Number($("#searchOperation").val()) == LHPVConstant.LHPV_SEARCH_TYPE_LHPV_NUMBER) {
								myNod.performCheck();

								if(myNod.areAll('valid'))
									_this.onFind();
							}

							if(Number($("#searchOperation").val()) == LHPVConstant.LHPV_SEARCH_TYPE_DATE)
								_this.onFind();

							if(Number($("#searchOperation").val()) == 0) {
								showMessage('error', "Please Select");
								return false;
							}
						});

					});

					var bankPaymentOperationModel		= new $.Deferred();	//
					
					if(GeneralConfiguration.BankPaymentOperationRequired){
						$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html",function() {
							bankPaymentOperationModel.resolve();
						});

						loadelement.push(bankPaymentOperationModel);

						$.when.apply($, loadelement).done(function(){
							setIssueBankAutocomplete();
							setAccountNoAutocomplete();
						}).fail(function() {
							console.log("Some error occured");
						});
						$("#viewAddedPaymentDetailsCreate").css("display", "block");
					}

				}, onFind : function() {
					showLayer();
					
					var jsonObject = new Object();
					var LHVPNumberEle						= $('#LHVPNumberEle').val();

					jsonObject.serachType					= $("#searchOperation").val();
					jsonObject.lhpvNumber					= LHVPNumberEle.replace(/\s+/g, "");
					
					jsonObject["vehicleNumberMasterId"]		= Number($('#vehicleNumberEle').val());
					jsonObject["vehicleAgentMasterId"]		= Number($('#vehicleAgentEle').val());
					
					if($("#dateEle").attr('data-startdate') != undefined)
						jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 

					if($("#dateEle").attr('data-enddate') != undefined)
						jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 

					getJSON(jsonObject, WEB_SERVICE_URL + '/consolidatedBlhpvWS/getLHPVDetailsForBLHPV.do', _this.setLHPVDetails, EXECUTE_WITH_ERROR);
				},setLHPVDetails : function(response) {
					hideLayer();
					lHPVModelArray   				= response.LHPVModel;
					var columnHeadArray				= new Array();
					var columnArray					= new Array();
					lhpvChargeLHPVIdMap				= response.lhpvChargeLHPVIdMap;
					lhpvChargesForGroupList			= response.lhpvChargesForGroupList;
					lhpvChargeTypeConstant          = response.LHPVChargeTypeConstant;
					var currentDate					= response.currentDate;
					var minDate						= response.minDate;
					var maxDate						= response.maxDate;
					showManualDateOption			= response.showManualDateOption;
					
					var	lhpvSettlementCharges		= null;
					var alreadyExistsLhvpNumber     = '';
					var totalBalanceAmount	 		= 0;
					var totalRefundAmount	 		= 0;
					var totalAmount					= 0;
					
					if(showManualDateOption){
						$('#consolidatedBLHPVManualDateDiv').removeClass('hide');
						$( function() {
							$('#manualConBLHPVDate').val(currentDate);
							$('#manualConBLHPVDate').datepicker({
								maxDate		: maxDate,
								minDate		: minDate,
								showAnim	: "fold",
								dateFormat	: 'dd-mm-yy'
							});
						} );
					}

					if(response.message != undefined) {
						$("#bottom-border-boxshadow").addClass('hide');
						var errorMessage = response.message;
						$('#LHVPNumberEle').val('');
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);;
						
						if(Number($("#searchOperation").val()) != LHPVConstant.LHPV_SEARCH_TYPE_LHPV_NUMBER)
							removeTableRows('lhpvDetailsTable', 'tbody');
						
						hideLayer();
						return;
					}
					
					goToPosition('bottom-border-boxshadow', 'slow');
					$( ".saveBtn").unbind( "click" );

					if(Number($("#searchOperation").val()) != LHPVConstant.LHPV_SEARCH_TYPE_LHPV_NUMBER)
						removeTableRows('lhpvDetailsTable', 'tbody');

					$("#bottom-border-boxshadow").css("display", "block");															
					$('#lhpvDetails').removeClass('hide');
					$('#bottom-border-boxshadow').removeClass('hide');
					$('#paymentMode').removeClass('hide');
					$('#lhpvSaveButton').removeClass('hide');
					$('#lhpvDownSaveButton').removeClass('hide');

					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'><input type='checkbox' name='selectAll' id='selectAll' value='reportTable' onclick='selectAllCheckBox(this.checked,this.value);'/></th>");
					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>LHPV Number</th>");
					
					if(blhpvConfiguration.ShowWeightColumn)
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Weight</th>");
	
					if(blhpvConfiguration.ShowLHPVDateColumn)
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>LHPV Date</th>");
						
					if(blhpvConfiguration.ShowPyableAtBranchColumn)
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Payable at branch</th>");
					
					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Truck Number</th>");
					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Lorry Hire</th>");
					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Advance Paid</th>");
					
					if(blhpvConfiguration.showOtherAddAmtOnCBlhpv)
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Additional Advance Amt</th>");
					
					for(var index = 0; index < lhpvChargesForGroupList.length; index++) {
						if(lhpvChargesForGroupList[index].lhpvChargeTypeMasterId == lhpvChargeTypeConstant.ACTUAL_BALANCE || lhpvChargesForGroupList[index].lhpvChargeTypeMasterId == lhpvChargeTypeConstant.ACTUAL_REFUND)
							columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>" + lhpvChargesForGroupList[index].displayName + "</th>");
						else if(lhpvChargesForGroupList[index].operationType == lhpvChargeTypeConstant.OPERATION_TYPE_ADD)
							columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>" + lhpvChargesForGroupList[index].displayName + '<br>' + "<span style='color:red'>(+)</span></th>");
						else if(lhpvChargesForGroupList[index].operationType == lhpvChargeTypeConstant.OPERATION_TYPE_SUBTRACT)
							columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>" + lhpvChargesForGroupList[index].displayName + '<br>'+"<span style='color:red'>(-)</span></th>");
					}
					
					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Remark</th>");
					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>PaymentMadeTo</th>");
			
					if(!$('#lhpvDetailsTableHeader').exists()) {	
						$('#lhpvDetailsTable thead').append('<tr id="lhpvDetailsTableHeader" class="text-info text-center">' + columnHeadArray.join(' ') + '</tr>');
					}

					for(const element of lHPVModelArray) {
						lhpvIdArrayList.push(element.lhpvId);
						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='checkbox' name='lhpvToAdd' id='lhpvToAdd_" + element.lhpvId + "' data-tooltip='" + element.lhpvNumber + "' value='" + element.lhpvId + "'/></td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><a onClick='viewLHPVPrint(" + element.lhpvId + "," + element.typeOfLHPV + ")' style='cursor:pointer;' id='lhpvNumber_" + element.lhpvId + '_' + element.typeOfLHPV + "'><b>" + element.lhpvNumber + "<b></a></td>");
						
						if(blhpvConfiguration.ShowWeightColumn)
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.totalActualWeight + "</td>");
						
						if(blhpvConfiguration.ShowLHPVDateColumn)
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.creationDateTimeString  + "</td>");
						
						columnArray.push("<td style='text-align: center; vertical-align: middle;display:none;' id='lhpvDate_" + element.lhpvId + "' >" + element.lhpvDate  + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;display:none;' id='typeOfLHPV_" + element.lhpvId + "' >" + element.typeOfLHPV  + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;display:none;' id='lhpvNo_" + element.typeOfLHPV + '_' + element.lhpvId + "' >" + element.lhpvNumber  + "</td>");
							
						if(blhpvConfiguration.ShowPyableAtBranchColumn)
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.balancePayableAtBranch + "</td>");
						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.vehicleNumber + "</td>");
						
						if(lhpvChargeLHPVIdMap != undefined)
							lhpvSettlementCharges 	= lhpvChargeLHPVIdMap[element.lhpvId + "_" + LHPVChargeTypeConstant.LORRY_HIRE];

						if(lhpvSettlementCharges != undefined)
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + lhpvSettlementCharges.chargeAmount + "</td>");
						else
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + 0 + "</td>");

						if(lhpvChargeLHPVIdMap != null)
							lhpvSettlementCharges 	= lhpvChargeLHPVIdMap[element.lhpvId + "_" + LHPVChargeTypeConstant.ADVANCE_AMOUNT];

						if(lhpvSettlementCharges!= undefined)
							columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='text' data-tooltip='Advance Paid' id='advanceAmount_"+element.lhpvId+"' value='"+ lhpvSettlementCharges.chargeAmount  +"' class='form-control' readonly='readonly'/></td>");
						else
							columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='text' data-tooltip='Advance Paid' id='advanceAmount_"+element.lhpvId+"' value='"+ 0  +"' class='form-control' readonly='readonly'/></td>");
							
						if(blhpvConfiguration.showOtherAddAmtOnCBlhpv){
							if(lhpvChargeLHPVIdMap != undefined) {
								lhpvSettlementCharges 	= lhpvChargeLHPVIdMap[element.lhpvId + "_" + LHPVChargeTypeConstant.ADDITIONAL_TRUCK_ADVANCE];
								
								if(lhpvSettlementCharges != undefined)
									columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='text' data-tooltip='Other Advance Amount' id='otherAddAmount_"+element.lhpvId+"' value='"+ lhpvSettlementCharges.chargeAmount  +"' class='form-control' readonly='readonly'/></td>");
								else
									columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='text' data-tooltip='Other Advance Amount' id='otherAddAmount_"+element.lhpvId+"' value='"+ 0  +"' class='form-control' readonly='readonly'/></td>");
							}
						}

						for(var index = 0 ;index < lhpvChargesForGroupList.length ;index++ ){
							if(lhpvChargesForGroupList[index].lhpvChargeTypeMasterId == LHPVChargeTypeConstant.ACTUAL_BALANCE){
								if(lhpvChargeLHPVIdMap != undefined)
									lhpvSettlementCharges 	= lhpvChargeLHPVIdMap[element.lhpvId + "_" + LHPVChargeTypeConstant.BALANCE_AMOUNT];

								if(lhpvSettlementCharges != undefined) {
									columnArray.push("<td style='text-align: center; vertical-align: middle;'>"
											+ "<input type='text' data-tooltip='" + lhpvChargesForGroupList[index].displayName + "' id='charge_" + element.lhpvId + '_' + lhpvChargesForGroupList[index].lhpvChargeTypeMasterId+"' value='"+ lhpvSettlementCharges.chargeAmount +"' class='form-control' readonly='readonly'/>"
											+ "<input type='hidden' data-tooltip='" + lhpvChargesForGroupList[index].displayName + "' id='hidden_"  +element.lhpvId + '_' + lhpvChargesForGroupList[index].lhpvChargeTypeMasterId+"' value='"+ lhpvSettlementCharges.chargeAmount +"' class='form-control' readonly='readonly'/>"
											+ "</td>");
								} else {
									columnArray.push("<td style='text-align: center; vertical-align: middle;'>"
											+ "<input type='text' data-tooltip='" + lhpvChargesForGroupList[index].displayName + "' id='charge_" + element.lhpvId + '_' + lhpvChargesForGroupList[index].lhpvChargeTypeMasterId+"' value='"+ lhpvChargesForGroupList[index].amount +"' class='form-control' readonly='readonly'/>"
											+ "<input type='hidden' data-tooltip='" + lhpvChargesForGroupList[index].displayName + "' id='hidden_" + element.lhpvId + '_' + lhpvChargesForGroupList[index].lhpvChargeTypeMasterId+"' value='"+ lhpvChargesForGroupList[index].amount +"' class='form-control' readonly='readonly'/>"
											+ "</td>");
								}
							} else if(lhpvChargesForGroupList[index].lhpvChargeTypeMasterId == LHPVChargeTypeConstant.ACTUAL_REFUND) {
								if(lhpvChargeLHPVIdMap != undefined)
									lhpvSettlementCharges 	= lhpvChargeLHPVIdMap[element.lhpvId + "_" + LHPVChargeTypeConstant.REFUND_AMOUNT];

								if(lhpvSettlementCharges != undefined) {
									columnArray.push("<td style='text-align: center; vertical-align: middle;'>"
											+ "<input type='text' data-tooltip='" + lhpvChargesForGroupList[index].displayName + "' id='charge_" + element.lhpvId + '_' + lhpvChargesForGroupList[index].lhpvChargeTypeMasterId + "' value='" + lhpvSettlementCharges.chargeAmount + "' class='form-control' readonly='readonly'/>"
											+ "<input type='hidden' data-tooltip='" + lhpvChargesForGroupList[index].displayName + "' id='hidden_" + element.lhpvId + '_' + lhpvChargesForGroupList[index].lhpvChargeTypeMasterId + "' value='" + lhpvSettlementCharges.chargeAmount + "' class='form-control' readonly='readonly'/>"
											+ "</td>");
								} else {
									columnArray.push("<td style='text-align: center; vertical-align: middle;'>"
											+ "<input type='text' data-tooltip='" + lhpvChargesForGroupList[index].displayName + "' id='charge_" + element.lhpvId + '_' + lhpvChargesForGroupList[index].lhpvChargeTypeMasterId + "' value='" + lhpvChargesForGroupList[index].amount + "' class='form-control' readonly='readonly'/>"
											+ "<input type='hidden' data-tooltip='" + lhpvChargesForGroupList[index].displayName + "' id='hidden_" + element.lhpvId + '_' + lhpvChargesForGroupList[index].lhpvChargeTypeMasterId + "' value='" + lhpvChargesForGroupList[index].amount + "' class='form-control' readonly='readonly'/>"
											+ "</td>");
								}
							} else
								columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='text' data-tooltip='" + lhpvChargesForGroupList[index].displayName + "' id='charge_" + element.lhpvId + '_' + lhpvChargesForGroupList[index].lhpvChargeTypeMasterId + "' value='" + lhpvChargesForGroupList[index].amount + "' onkeypress='return noNumbers(event)' onfocus='return resetInputField(this)' onblur='return resetInputField(this);'  class='form-control' /></td>");
						}

						columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='text' data-tooltip='Reamark' id='remark_" + element.lhpvId + "'  class='form-control' /></td>");	
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='text' data-tooltip='paymentmadeto' id='PaymentMadeTo_" + element.lhpvId + "'  class='form-control' /></td>");	

						if(!$('#lhpvId_' + element.lhpvId ).exists())
							$('#lhpvDetailsTable tbody').append('<tr id="lhpvId_' + element.lhpvId +'">' + columnArray.join(' ') + '</tr>');
						else
							alreadyExistsLhvpNumber = element.lhpvNumber + ',' + alreadyExistsLhvpNumber;

						$(lhpvChargesForGroupList).each(function() {
							if(this.operationType != LHPVChargeTypeConstant.OPERATION_TYPE_STATIC) {
								$('#charge_' + element.lhpvId + '_' + this.lhpvChargeTypeMasterId).bind("keyup", function() {
									var elementId		= $(this).attr('id');
									var lhpvId			= elementId.split('_')[1];
									_this.calculateAmount(lhpvId);
								});
							}
						});
						
						columnArray = [];
						vehcileNumberArr.push(element);
					}

					if(alreadyExistsLhvpNumber != '')
						showMessage('error','LHPV Number Already Added :'+alreadyExistsLhvpNumber );

					$('#selectAll').bind("click", function() {
						_this.selectAllCheckBox(this.checked);
					});
					
					$(lhpvIdArrayList).each(function() {
						$('#lhpvToAdd_' + this).bind("click", function() {
							_this.reCalculateAmount();
						});
					});

					totalBalanceAmount	 = 	_this.calculateTotalAmount(LHPVChargeTypeConstant.ACTUAL_BALANCE);
					totalRefundAmount	 = 	_this.calculateTotalAmount(LHPVChargeTypeConstant.ACTUAL_REFUND);

					totalAmount          = Math.abs(totalRefundAmount) - Math.abs(totalBalanceAmount);
					
					if(totalAmount > 0 ){
						$('#totalBalanceAmount').val(0);
						$('#totalRefundAmount').val(Math.abs(totalAmount));
						incomeExpenseModuleId	= ModuleIdentifierConstant.INCOME_TYPE_MODULE_ID;
					} else {
						$('#totalBalanceAmount').val(Math.abs(totalAmount));
						$('#totalRefundAmount').val(0);
						incomeExpenseModuleId	= ModuleIdentifierConstant.EXPENSE_TYPE_MODULE_ID;
					}

					$(".saveBtn").bind("click", function() {
						paymentType.performCheck();
						
						if(paymentType.areAll('valid'))
							_this.submitData();
					});

					hideLayer();
				}, submitData : function() {
					var checkBoxArray	= getAllCheckBoxSelectValue('lhpvToAdd');

					if(checkBoxArray.length == 0){
						showMessage('error', 'Please Select At least One LHPV!');
						hideLayer();
						return;
					}

					if($('#paymentType').exists() && isValidPaymentMode($('#paymentType').val())) { //Defined in paymentTypeSelection.js
						var trCount = $("#storedPaymentDetails  tr").length;
							
						if(trCount == 0) {
							showMessage('error','Please, Add Payment details for this BLHPV !');
							hideLayer();
							return false;
						}	
					}

					var jsonObject		= new Object();
					
					jsonObject.paymentValues			= $('#paymentCheckBox').val();
					jsonObject.paymentType				= $('#paymentType').val();
					jsonObject.consolidatedBLHPVRemark 	= $('#consolidatedBLHPVRemark').val();
					jsonObject["lhpvIdWiseData"]		= JSON.stringify(_this.getLHPVIData());
					jsonObject.TOKEN_KEY				= TOKEN_KEY;
					jsonObject.TOKEN_VALUE				= TOKEN_VALUE;
					jsonObject.manualBLHPVDate			= $('#manualConBLHPVDate').val();
					
					if(showManualDateOption)
						if(!validateManualDate()) return false;
					
					var	ans = confirm("Are you sure you want to create Consolidated BLHPV ?");
					
					if(!doneTheStuff) {
						if(ans) {
							showLayer();
							getJSON(jsonObject, WEB_SERVICE_URL + '/consolidatedBlhpvWS/createConsolidatedBLHPV.do', _this.responseAfter, EXECUTE_WITH_ERROR);
							hideLayer();
							doneTheStuff	= true;
						} else {
							doneTheStuff	= false;
							hideLayer();
							return false;
						} 
					}
					
				}, calculateAmount : function(lhpvId) {
					var balanceAmount = 0;
					var refundAmount  = 0;
					var chargeAmount  = 0;
					var totalBalanceAmount = 0;
					var totalRefundAmount  = 0;
					var totalAmount 	   = 0;

					if($("#hidden_" + lhpvId + '_' + LHPVChargeTypeConstant.ACTUAL_BALANCE).val())
						balanceAmount   =  Number($("#hidden_" + lhpvId + '_' + LHPVChargeTypeConstant.ACTUAL_BALANCE).val());

					if($("#hidden_" + lhpvId + '_' + LHPVChargeTypeConstant.ACTUAL_REFUND).val())
						refundAmount     =  Number($("#hidden_" + lhpvId + '_' + LHPVChargeTypeConstant.ACTUAL_REFUND).val());

					chargeAmount =	_this.calculateBalanceAmount(lhpvId);

					if(refundAmount > 0)
						chargeAmount = chargeAmount - parseInt(refundAmount,10);
					else
						chargeAmount = chargeAmount + parseInt(balanceAmount);

					if(chargeAmount >= 0) {
						$("#charge_" + lhpvId + '_' + LHPVChargeTypeConstant.ACTUAL_BALANCE).val(Math.abs(chargeAmount));
						$("#charge_" + lhpvId + '_' + LHPVChargeTypeConstant.ACTUAL_REFUND).val(0);
					} else {
						$("#charge_" + lhpvId + '_' + LHPVChargeTypeConstant.ACTUAL_BALANCE).val(0);
						$("#charge_" + lhpvId + '_' + LHPVChargeTypeConstant.ACTUAL_REFUND).val(Math.abs(chargeAmount));
					}

					totalBalanceAmount	 = 	_this.calculateTotalAmount(LHPVChargeTypeConstant.ACTUAL_BALANCE);
					totalRefundAmount	 = 	_this.calculateTotalAmount(LHPVChargeTypeConstant.ACTUAL_REFUND);

					totalAmount          = Math.abs(totalRefundAmount) - Math.abs(totalBalanceAmount);
					
					if(totalAmount > 0) {
						$('#totalBalanceAmount').val(0);
						$('#totalRefundAmount').val(Math.abs(totalAmount));
						incomeExpenseModuleId	= ModuleIdentifierConstant.INCOME_TYPE_MODULE_ID;
					} else {
						$('#totalBalanceAmount').val(Math.abs(totalAmount));
						$('#totalRefundAmount').val(0);
						incomeExpenseModuleId	= ModuleIdentifierConstant.EXPENSE_TYPE_MODULE_ID;
					}

					_this.reCalculateAmount();

				}, calculateBalanceAmount : function(lhpvId) {
					var chargesAmount = 0;
					
					if(lhpvChargesForGroupList.length > 0) {
						for(var i = 0; i < lhpvChargesForGroupList.length; i++) {

							if (lhpvChargesForGroupList[i].identifier == LHPVChargeTypeConstant.IDENTIFIER_TYPE_BLHPV
									&& lhpvChargesForGroupList[i].lhpvChargeTypeMasterId != LHPVChargeTypeConstant.ACTUAL_BALANCE
									&& lhpvChargesForGroupList[i].lhpvChargeTypeMasterId != LHPVChargeTypeConstant.ACTUAL_REFUND){
								if(lhpvChargesForGroupList[i].operationType != LHPVChargeTypeConstant.OPERATION_TYPE_SUBTRACT) {
									if($('#charge_' + lhpvId + '_' + lhpvChargesForGroupList[i].lhpvChargeTypeMasterId)){
										if(!isNaN(parseInt($('#charge_' + lhpvId + '_' + lhpvChargesForGroupList[i].lhpvChargeTypeMasterId).val())))
											chargesAmount += parseInt(parseInt($('#charge_' + lhpvId + '_' + lhpvChargesForGroupList[i].lhpvChargeTypeMasterId).val()));
									}
								} else if(!isNaN(parseInt($('#charge_'+lhpvId+'_'+lhpvChargesForGroupList[i].lhpvChargeTypeMasterId).val())))
									chargesAmount -= parseInt($('#charge_'+lhpvId+'_'+lhpvChargesForGroupList[i].lhpvChargeTypeMasterId).val());
							}
						}
					}

					if(!isNaN(chargesAmount))
						return chargesAmount;
					
					return 0;
				}, calculateTotalAmount :function(lhpvChargeTypeMasterId){
					var totalAmount = 0;

					for(var i = 0 ; i< lhpvIdArrayList.length; i++) {
						if(LHPVChargeTypeConstant.ACTUAL_BALANCE == lhpvChargeTypeMasterId 
							&& parseInt($('#charge_' + lhpvIdArrayList[i] + "_" + LHPVChargeTypeConstant.ACTUAL_BALANCE).val()) > 0) {
								totalAmount +=parseInt($('#charge_' + lhpvIdArrayList[i] + '_' + LHPVChargeTypeConstant.ACTUAL_BALANCE).val());
						}

						if(LHPVChargeTypeConstant.ACTUAL_REFUND == lhpvChargeTypeMasterId
							&& parseInt($('#charge_' + lhpvIdArrayList[i] + "_" + LHPVChargeTypeConstant.ACTUAL_REFUND).val()) > 0)
								totalAmount -=parseInt($('#charge_' + lhpvIdArrayList[i] + '_' + LHPVChargeTypeConstant.ACTUAL_REFUND).val());
					}

					if(!isNaN(totalAmount))
						return totalAmount;
					
					return 0;
				},reCalculateAmount : function(){
					var totalBalanceAmount = 0;
					var totalRefundAmount  = 0;
					var totalAmount  	   = 0;

					$('input[name=lhpvToAdd]:checked').each(function() {
						var lhpvId					= this.value;
						
						if(parseInt($('#charge_'+lhpvId+"_"+LHPVChargeTypeConstant.ACTUAL_BALANCE).val()) > 0 ){
							totalBalanceAmount +=parseInt($('#charge_'+lhpvId+'_'+LHPVChargeTypeConstant.ACTUAL_BALANCE).val());
						}

						if(parseInt($('#charge_'+lhpvId+"_"+LHPVChargeTypeConstant.ACTUAL_REFUND).val()) > 0 ){
							totalRefundAmount -=parseInt($('#charge_'+lhpvId+'_'+LHPVChargeTypeConstant.ACTUAL_REFUND).val());
						}
					});

					totalAmount = Math.abs(totalRefundAmount) - Math.abs(totalBalanceAmount) 
					
					if(totalAmount > 0 ){
						$('#totalRefundAmount').val(Math.abs(totalAmount));
						$('#totalBalanceAmount').val(0);
					} else if(totalAmount < 0 ) {
						$('#totalBalanceAmount').val(Math.abs(totalAmount));
						$('#totalRefundAmount').val(0);
					} else if(totalAmount == 0 ) {
						totalBalanceAmount	 = 	_this.calculateTotalAmount(LHPVChargeTypeConstant.ACTUAL_BALANCE);
						totalRefundAmount	 = 	_this.calculateTotalAmount(LHPVChargeTypeConstant.ACTUAL_REFUND);
						totalAmount          = Math.abs(totalRefundAmount) - Math.abs(totalBalanceAmount);
					
						if(totalAmount > 0) {
							$('#totalBalanceAmount').val(0);
							$('#totalRefundAmount').val(Math.abs(totalAmount));
						} else {
							$('#totalBalanceAmount').val(Math.abs(totalAmount));
							$('#totalRefundAmount').val(0);
						}
					}

				},getLHPVIData:function(){
					var lhphIdWiseObj		= [];
					dateArr					= new Array();
				
					$('input[name=lhpvToAdd]:checked').each(function() {
						var lhpvId				= this.value;
						var lhpvDetailsObj		= new Object();
						var	typeOfLHPV			= $('#typeOfLHPV_' + lhpvId).html();

						lhpvDetailsObj['lhpvId']					= lhpvId;
						lhpvDetailsObj['remark_' + lhpvId]			= $('#remark_' + lhpvId).val();
						lhpvDetailsObj['lhpvDate_' + lhpvId]		= $('#lhpvDate_' + lhpvId).html();
						lhpvDetailsObj['date'] 						= $('#lhpvDate_' + lhpvId).html();
						lhpvDetailsObj['lhpvNumber'] 				= $('#lhpvNo_' + typeOfLHPV +'_'+lhpvId).html();	
						
						for (var id in lhpvChargesForGroupList) {
							lhpvDetailsObj['charge_' + lhpvId + '_' + lhpvChargesForGroupList[id].lhpvChargeTypeMasterId] = $('#charge_' + lhpvId + '_' + lhpvChargesForGroupList[id].lhpvChargeTypeMasterId).val();
						}
						
						lhpvDetailsObj['paymentMadeTo_' + lhpvId]	= $('#PaymentMadeTo_' + lhpvId).val();
						
						lhphIdWiseObj.push(lhpvDetailsObj);
						dateArr.push(lhpvDetailsObj);
					});

					return lhphIdWiseObj;
				},getLHPVChargesData:function (lhpvId){
					var lhpvCharges		= new Object;
					for (var id in lhpvChargesForGroupList) {
						lhpvCharges['charge_' + lhpvId +'_'+ lhpvChargesForGroupList[id].lhpvChargeTypeMasterId] = $('#charge_' + lhpvId + '_' + lhpvChargesForGroupList[id].lhpvChargeTypeMasterId).val();
					}
					return lhpvCharges;
				},responseAfter : function(response) {
					hideLayer();
					if(response.message != undefined) {
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						TOKEN_KEY	= response.TOKEN_KEY;
						TOKEN_VALUE	= response.TOKEN_VALUE;
					}

					if (response.consolidatedBLHPVId != undefined) {
						$('#paymentMode').addClass('hide');
						$('#lhpvSaveButton').removeClass('hide');
						$('#lhpvDownSaveButton').removeClass('hide');
						$('#lhpvDetailsTable tbody').empty();

						vehcileNumberArr = [];
						lHPVModelArray	 = [];
						lhpvIdArrayList	 = [];

						var MyRouter = new Marionette.AppRouter({});
						MyRouter.navigate('&modulename=consolidatedBLHPV&consolidatedBLHPVId=' + response.consolidatedBLHPVId + '&consolidatedBLHPVNumber=' + response.consolidatedBLHPVNumber+'&print=true',{trigger: true});
						setTimeout(function(){ location.reload(); }, 1000);
						_this.openPrint(response.consolidatedBLHPVId);
					}
				}, onPaymentTypeSelect: function(_this){
					hideShowBankPaymentTypeOptions(document.getElementById("paymentType"));
				}, selectAllCheckBox : function(param) {
					let tab 	= document.getElementById('lhpvDetailsTable');
					
					for(let row = 1 ; row < tab.rows.length; row++) {
						if(tab.rows[row].cells[0].firstChild != null)
							tab.rows[row].cells[0].firstChild.checked = param;
					}
					
					if(param)
						_this.reCalculateAmount();
					else
						$('#totalAmount').val(_this.calculateTotalAmount());
				}, openPrint : function(consolidatedBLHPVId){
					var 	newwindow=window.open('ConsolidatedBLHPVPrint.do?pageId=340&eventId=10&modulename=consolidatedBLHPVPrint&masterid=' + consolidatedBLHPVId+'&isReprint=true', 'newwindow', 'config="height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no"');
				}
			});
		});
function viewLHPVPrint(lhpvId,typeOfLHPV){
	window.open('LHPVView.do?pageId=48&eventId=1&lhpvId='+lhpvId+'&isOriginal=false'+'&typeOfLHPV='+typeOfLHPV, 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function resetInputField(param){
	if(param.value==''){
		return	param.value='0'
	}

	if(param.value=='0'){
		return param.value='';
	}
} 

function validateManualDate() {
	var manualDateStr = $('#manualConBLHPVDate').val();
	
	const [day, month, year] = manualDateStr.split('-');
	const manualDate = new Date(+year, month - 1, +day);
	const maxDate = new Date(Math.max(...dateArr.map(e =>{return new Date(e.date);})));
	maxDate.setHours(0,0,0,0);
	
	var lhpvNo = dateArr.reduce((a, b)=>{return a.date > b.date ? a.lhpvNumber : b.lhpvNumber;});
		
	if(manualDate < maxDate){
		if(dateArr.length > 1)
			showMessage('error','You can not create Consolidated Blhpv Befor Lhpv Date, Lhpv No :'+lhpvNo);
		else
			showMessage('error','You can not create Consolidated Blhpv Befor Lhpv Date');
		
		return false;
	}

	return true;
}