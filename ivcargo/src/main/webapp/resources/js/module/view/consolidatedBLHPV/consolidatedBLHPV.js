var moduleId 					= 0;
var incomeExpenseModuleId 		= 0;
var ModuleIdentifierConstant	= null;
var PaymentTypeConstant			= null;
var dateArr						= null;
var GeneralConfiguration		= null;
define(
		[
			'JsonUtility',
			'messageUtility',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/consolidatedBLHPV/consolidatedBLHPVfilepath.js',
			'jquerylingua',
			'language',
			'autocomplete',
			'autocompleteWrapper',
			'bootstrapSwitch',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
			'/ivcargo/resources/js/generic/urlparameter.js',
			PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
			'selectizewrapper',
			'/ivcargo/resources/js/module/redirectAfterUpdate.js',
			,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
			,PROJECT_IVUIRESOURCES +'/resources/js/module/paymentTypeSelection/paymentTypeSelection.js'
			],
			function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper, BootstrapSwitch, NodValidation, FocusNavigation,
					BootstrapModal,UrlParameter,Selection,Selectizewrapper,datePickerUI,PaymentType) {
			'use strict';
			var myNod,  _this = '' ,searchOperation =0 ,LHPVConstant,
			searchVehicleNod,searchVehicleAgentNod,searchTypeNod,LHPVChargeTypeConstant,lhpvChargesForGroupList,lhpvChargeLHPVIdMap,lHPVModelArray,vehcileNumberArr=[],
			blhpvConfiguration, consolidatedBLHPVId,consolidatedblhpvNumber,lhpvIdArrayList =new Array() ,lhpvChargeTypeConstant,doneTheStuff=false,tdsConfiguration = null,
			TOKEN_KEY = null, TOKEN_VALUE = null,showManualDateOption = false;
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
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
					tdsConfiguration			= response.tdsConfiguration;
					
					$("#mainContent").load("/ivcargo/html/module/consolidatedBLHPV/consolidatedBLHPV.html",
							function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						hideLayer();
						loadLanguageWithParams(FilePath.loadLanguage());
						let options			= new Object();

						$("#dateEle").DatePickerCus(options);

						myNod 					= nod();
						searchVehicleNod 		= nod();
						searchVehicleAgentNod 	= nod();
						searchTypeNod 			= nod();
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

						searchTypeNod.configure({
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

						Selectizewrapper.setAutocomplete({
							url 				: WEB_SERVICE_URL+'/autoCompleteWS/getVehicleNumberAutocomplete.do?hideOwnVehicleNumbers=' + blhpvConfiguration.hideOwnVehicleNumbers,
							valueField			: 'vehicleNumberMasterId',
							labelField			: 'vehicleNumber',
							searchField			: 'vehicleNumber',
							elementId			: 'vehicleNumberEle',
							responseObjectKey 	: 'result'
						});

						Selectizewrapper.setAutocomplete({
							url 				: WEB_SERVICE_URL+'/autoCompleteWS/getVehicleAgentAutocomplete.do?',
							valueField			: 'vehicleAgentMasterId',
							labelField			: 'name',
							searchField			: 'name',
							elementId			: 'vehicleAgentEle',
							responseObjectKey 	: 'vehicleAgentAutoCompleteList'
						});

						$("#searchOperation").change (function(){
							initialiseFocus();
							refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
							removeTableRows('lhpvDetailsTable', 'tbody');
							searchOperation	= $("#searchOperation").val();

							if(searchOperation == LHPVConstant.LHPV_SEARCH_TYPE_VEHICLE) {
								$("#vehicleNumberDiv").removeClass("hide");
								$("#vehicleAgentDiv").addClass("hide");
								
								if(blhpvConfiguration.showDateSelectionInVehicleWiseSearch)
									$("#dateDiv").removeClass("hide");
								else
									$("#dateDiv").addClass("hide");
								
								$("#lhpvNumberDiv").addClass("hide");
								$("#agentVehicleDiv").addClass("hide");
							} else if(searchOperation == LHPVConstant.LHPV_SEARCH_TYPE_VEHICLE_AGENT) {
								$("#vehicleAgentDiv").removeClass("hide");
								$("#vehicleNumberDiv").addClass("hide");
								
								if(blhpvConfiguration.showDateSelectionInVehicleAgentWiseSearch) 
									$("#dateDiv").removeClass("hide");
								else
									$("#dateDiv").addClass("hide");
								
								$("#lhpvNumberDiv").addClass("hide");
							} else if(searchOperation == LHPVConstant.LHPV_SEARCH_TYPE_DATE) {
								$("#dateDiv").removeClass("hide");
								$("#vehicleAgentDiv").addClass("hide");
								$("#vehicleNumberDiv").addClass("hide");
								$("#lhpvNumberDiv").addClass("hide");
								$("#agentVehicleDiv").addClass("hide");
							} else if(searchOperation == LHPVConstant.LHPV_SEARCH_TYPE_LHPV_NUMBER) {
								$("#lhpvNumberDiv").removeClass("hide");
								$("#dateDiv").addClass("hide");
								$("#vehicleAgentDiv").addClass("hide");
								$("#vehicleNumberDiv").addClass("hide");
								$("#agentVehicleDiv").addClass("hide");
							} else {
								$("#dateDiv").addClass("hide");
								$("#vehicleAgentDiv").addClass("hide");
								$("#vehicleNumberDiv").addClass("hide");
								$("#lhpvNumberDiv").addClass("hide");
								$("#agentVehicleDiv").addClass("hide");
							}

							if(Number(searchOperation) == LHPVConstant.LHPV_SEARCH_TYPE_VEHICLE){
								searchVehicleNod.add({
									selector	: '#vehicleNumberEle_wrapper',
									validate	: 'validateAutocomplete:#vehicleNumberEle',
									errorMessage: 'Select Proper Vehicle !'
								});
							}

							if(Number(searchOperation) == LHPVConstant.LHPV_SEARCH_TYPE_VEHICLE_AGENT){
								searchVehicleAgentNod.add({
									selector		: '#vehicleAgentEle',
									validate		: 'validateAutocomplete:#vehicleAgentEle',
									errorMessage	: 'Select proper Vehicle Agent'
								});

								$("#vehicleAgentEle").change(function(){
									_this.getAgentVehicleAutoComplete();
								});
							}

							if(Number(searchOperation) == LHPVConstant.LHPV_SEARCH_TYPE_LHPV_NUMBER){
								myNod.add({
									selector		: '#LHVPNumberEle',
									validate		: 'presence',
									errorMessage	: 'Enter LHVP Number !'
								});															
							}

							if(Number(searchOperation) ==0){
								searchTypeNod.add({
									selector		: '#searchOperation',
									validate		: 'presence',
									errorMessage	: 'Select Serach Type !'
								});															
							}

							paymentType.add({
								selector	: "#paymentType_wrapper",
								validate	: "validateAutocomplete:#paymentType",
								errorMessage: "Please Select Payment Type"
							});
						});

						if(consolidatedBLHPVId > 0 && consolidatedblhpvNumber != null) {
							$("#previousConsolidatedBLHP").removeClass("hide");
							$('#previousNumber').html('<b>Consolidated BLHPV No :</b> ' + consolidatedblhpvNumber + '&emsp;<div class="row">&nbsp;</div>');
							$('#previousConsolidatedBLHP').append('<button type="button" name="reprintBtn" id="reprintBtn" class="btn btn-success" data-tooltip="Reprint">Reprint</button>');
							$("#reprintBtn").click(function() {
								_this.openPrint(consolidatedBLHPVId);
							});
						}

						$("#findBtn").click(function(){
							if(Number(searchOperation) == LHPVConstant.LHPV_SEARCH_TYPE_VEHICLE){
								searchVehicleNod.performCheck();
								if(searchVehicleNod.areAll('valid')) {
									_this.onFind(_this);
								}
							}
							if(Number(searchOperation) == LHPVConstant.LHPV_SEARCH_TYPE_VEHICLE_AGENT){
								searchVehicleAgentNod.performCheck();
								if(searchVehicleAgentNod.areAll('valid')) {
									_this.onFind(_this);
								}
							}
							if(Number(searchOperation) == LHPVConstant.LHPV_SEARCH_TYPE_LHPV_NUMBER){
								myNod.performCheck();
								if(myNod.areAll('valid')) {
									_this.onFind(_this);
								}
							}
							if(Number(searchOperation) ==LHPVConstant.LHPV_SEARCH_TYPE_DATE){
								//removeTableRows('lhpvDetailsTable', 'tbody');
								_this.onFind(_this);
							}

							if(Number(searchOperation) == 0){
								searchTypeNod.performCheck();
								if(searchTypeNod.areAll('valid')) {
									_this.onFind(_this);
								}

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
					jsonObject.lhpvNumber					= LHVPNumberEle.replace(/\s+/g, "");
					
					if(searchOperation == LHPVConstant.LHPV_SEARCH_TYPE_VEHICLE_AGENT) {
						jsonObject["vehicleAgentMasterId"]		= $('#vehicleAgentEle').val();
						jsonObject["vehicleNumberMasterId"]		= $('#agentVehicleNumberEle').val();
					} else {
						jsonObject["vehicleNumberMasterId"]		= Number($('#vehicleNumberEle').val());
					}
					
					jsonObject.serachType					= Number($('#searchOperation').val());
										
					if(blhpvConfiguration.showDateSelectionInVehicleWiseSearch && searchOperation == LHPVConstant.LHPV_SEARCH_TYPE_VEHICLE 
						|| blhpvConfiguration.showDateSelectionInVehicleAgentWiseSearch && searchOperation == LHPVConstant.LHPV_SEARCH_TYPE_VEHICLE_AGENT
						|| searchOperation == LHPVConstant.LHPV_SEARCH_TYPE_DATE) {
						if($("#dateEle").attr('data-startdate') != undefined)
							jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 

						if($("#dateEle").attr('data-enddate') != undefined)
							jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
					}
					
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
					let tdsChargeList				= response.tdsChargeList;

					
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
						$('#LHVPNumberEle').val('');
						
						if(Number(searchOperation) != LHPVConstant.LHPV_SEARCH_TYPE_LHPV_NUMBER) {
							//refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
							removeTableRows('lhpvDetailsTable', 'tbody');
						}
						
						hideLayer();
						return;
					}
					
					goToPosition('bottom-border-boxshadow', 'slow');
					$( ".saveBtn").unbind( "click" );

					if(Number(searchOperation) != LHPVConstant.LHPV_SEARCH_TYPE_LHPV_NUMBER) {
						//refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						//$("#viewAddedPaymentDetailsCreate").css("display", "block");
						removeTableRows('lhpvDetailsTable', 'tbody');
					}

					$("#bottom-border-boxshadow").css("display", "block");															
					$('#lhpvDetails').removeClass('hide');
					$('#bottom-border-boxshadow').removeClass('hide');
					$('#paymentMode').removeClass('hide');
					$('#lhpvSaveButton').removeClass('hide');
					$('#lhpvDownSaveButton').removeClass('hide');

					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'><input type='checkbox' name='selectAll' id='selectAll' value='reportTable' onclick='selectAllCheckBox(this.checked,this.value);'/></th>");
					
					if(blhpvConfiguration.showEditLHPVAmountColumn)
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>EDIT LHPV AMOUNT</th>");
					
					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>LHPV Number</th>");
					
					if(blhpvConfiguration.ShowWeightColumn)
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Weight</th>");
	
					if(blhpvConfiguration.ShowLHPVDateColumn)
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>LHPV Date</th>");
						
					if(blhpvConfiguration.ShowPyableAtBranchColumn)
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Payable at branch</th>");
					
					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Truck Number</th>");
					
					if(blhpvConfiguration.showBookingChargesColumn)
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>LMF Charges</th>");
					
					if(blhpvConfiguration.showClosingKMColumn)
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Closing KM</th>");
						
					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Lorry Hire</th>");
					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Advance Paid</th>");
					
					if(blhpvConfiguration.showOtherAddAmtOnCBlhpv)
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Additional Advance Amt</th>");
					
					for(var index = 0; index < lhpvChargesForGroupList.length; index++) {
						if(lhpvChargesForGroupList[index].lhpvChargeTypeMasterId == ACTUAL_BALANCE || lhpvChargesForGroupList[index].lhpvChargeTypeMasterId == ACTUAL_REFUND) {
							columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>" + lhpvChargesForGroupList[index].displayName + "</th>");
						} else {
							if(lhpvChargesForGroupList[index].operationType == lhpvChargeTypeConstant.OPERATION_TYPE_ADD) {
								columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>" + lhpvChargesForGroupList[index].displayName + '<br>' + "<span style='color:red'>(+)</span></th>");
							} else if(lhpvChargesForGroupList[index].operationType == OPERATION_TYPE_SUBTRACT) {
								columnHeadArray.push("<th style='text-align: center; vertical-align: middle; width : 90px;'>" + lhpvChargesForGroupList[index].displayName + '<br>'+"<span style='color:red'>(-)</span></th>");
							}
						}
					}
					
					if(tdsConfiguration.IsTdsAllow){
    					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;' class='tdsRateRow'>TDS %</th>");
						columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>TDS Amt</th>");
						
						if(tdsConfiguration.IsPANNumberRequired)
							columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>PAN No.</th>");
							
						if(tdsConfiguration.IsTANNumberRequired)	
							columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>TAN No.</th>");
					}
 
					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Remark</th>");
					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>PaymentMadeTo</th>");
			
					if(!$('#lhpvDetailsTableHeader').exists())
						$('#lhpvDetailsTable thead').append('<tr id="lhpvDetailsTableHeader" class="text-info text-center">' + columnHeadArray.join(' ') + '</tr>');
					
					lhpvIdArrayList = [];
					
					for(var i = 0; i < lHPVModelArray.length; i++) {
						lhpvIdArrayList.push(lHPVModelArray[i].lhpvId);

						columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='checkbox' name='lhpvToAdd' id='lhpvToAdd_" + lHPVModelArray[i].lhpvId + "' data-tooltip='" + lHPVModelArray[i].lhpvNumber + "' value='" + lHPVModelArray[i].lhpvId + "'/></td>");
					
						if(blhpvConfiguration.showEditLHPVAmountColumn)
							columnArray.push('<td style="text-align: center; vertical-align: middle;"><button type="button" class="btn btn-danger" id = "editLhpvAmount_' + lHPVModelArray[i].lhpvId + '">Edit LHPV Amount</button></td>');
						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='lhpvPrint_" + lHPVModelArray[i].lhpvId + '_' + lHPVModelArray[i].typeOfLHPV + "'><b>" + lHPVModelArray[i].lhpvNumber + "<b></a></td>");
						
						if(blhpvConfiguration.ShowWeightColumn)
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + lHPVModelArray[i].totalActualWeight + "</td>");
						
						if(blhpvConfiguration.ShowLHPVDateColumn)
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + lHPVModelArray[i].creationDateTimeString  + "</td>");
						
						columnArray.push("<td style='text-align: center; vertical-align: middle;display:none;' id='lhpvDate_" + lHPVModelArray[i].lhpvId + "' >" + lHPVModelArray[i].lhpvDate  + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;display:none;' id='typeOfLHPV_" + lHPVModelArray[i].lhpvId + "' >" + lHPVModelArray[i].typeOfLHPV  + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;display:none;' id='lhpvNo_" + lHPVModelArray[i].typeOfLHPV + '_' + lHPVModelArray[i].lhpvId + "' >" + lHPVModelArray[i].lhpvNumber  + "</td>");
							
						if(blhpvConfiguration.ShowPyableAtBranchColumn)
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + lHPVModelArray[i].balancePayableAtBranch + "</td>");
						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + lHPVModelArray[i].vehicleNumber + "</td>");
						
						if(blhpvConfiguration.showBookingChargesColumn)
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + lHPVModelArray[i].chargeAmount + "</td>");
						
						if(blhpvConfiguration.showClosingKMColumn)
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + lHPVModelArray[i].closingKM + "</td>");
			
						if(lhpvChargeLHPVIdMap != undefined)
							lhpvSettlementCharges 	= lhpvChargeLHPVIdMap[lHPVModelArray[i].lhpvId + "_" + LORRY_HIRE];

						if(lhpvSettlementCharges != undefined)
							columnArray.push("<td style='text-align: center; vertical-align: middle;' id='lorryHire_" + lHPVModelArray[i].lhpvId + "'>" + lhpvSettlementCharges.chargeAmount + "</td>");
						else
							columnArray.push("<td style='text-align: center; vertical-align: middle;' id='lorryHire_" + lHPVModelArray[i].lhpvId + "'>" +0 + "</td>");

						if(lhpvChargeLHPVIdMap != null)
							lhpvSettlementCharges 	= lhpvChargeLHPVIdMap[lHPVModelArray[i].lhpvId + "_" + ADVANCE_AMOUNT];

						if(lhpvSettlementCharges!= undefined)
							columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='text' data-tooltip='Advance Paid' id='advanceAmount_"+lHPVModelArray[i].lhpvId+"' value='"+ lhpvSettlementCharges.chargeAmount  +"' class='form-control' readonly='readonly'/></td>");
						else
							columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='text' data-tooltip='Advance Paid' id='advanceAmount_"+lHPVModelArray[i].lhpvId+"' value='"+ 0  +"' class='form-control' readonly='readonly'/></td>");
							
						if(blhpvConfiguration.showOtherAddAmtOnCBlhpv){
							if(lhpvChargeLHPVIdMap != undefined) {
								lhpvSettlementCharges 	= lhpvChargeLHPVIdMap[lHPVModelArray[i].lhpvId + "_" + LHPVChargeTypeConstant.ADDITIONAL_TRUCK_ADVANCE];
								
								if(lhpvSettlementCharges != undefined)
									columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='text' data-tooltip='Other Advance Amount' id='otherAddAmount_"+lHPVModelArray[i].lhpvId+"' value='"+ lhpvSettlementCharges.chargeAmount  +"' class='form-control' readonly='readonly'/></td>");
								else
									columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='text' data-tooltip='Other Advance Amount' id='otherAddAmount_"+lHPVModelArray[i].lhpvId+"' value='"+ 0  +"' class='form-control' readonly='readonly'/></td>");
							}
						}

						for(var index = 0 ;index < lhpvChargesForGroupList.length ;index++ ){
							if(lhpvChargesForGroupList[index].lhpvChargeTypeMasterId == ACTUAL_BALANCE){
								if(lhpvChargeLHPVIdMap != undefined){
									lhpvSettlementCharges 	= lhpvChargeLHPVIdMap[lHPVModelArray[i].lhpvId + "_" + BALANCE_AMOUNT];
								}

								if(lhpvSettlementCharges != undefined) {
									columnArray.push("<td style='text-align: center; vertical-align: middle;'>"
											+ "<input type='text' data-tooltip='" + lhpvChargesForGroupList[index].displayName + "' id='charge_" + lHPVModelArray[i].lhpvId + '_' + lhpvChargesForGroupList[index].lhpvChargeTypeMasterId+"' value='"+ lhpvSettlementCharges.chargeAmount +"' class='form-control' readonly='readonly'/>"
											+ "<input type='hidden' data-tooltip='" + lhpvChargesForGroupList[index].displayName + "' id='hidden_"  +lHPVModelArray[i].lhpvId + '_' + lhpvChargesForGroupList[index].lhpvChargeTypeMasterId+"' value='"+ lhpvSettlementCharges.chargeAmount +"' class='form-control' readonly='readonly'/>"
											+ "</td>");
								} else {
									columnArray.push("<td style='text-align: center; vertical-align: middle;'>"
											+ "<input type='text' data-tooltip='" + lhpvChargesForGroupList[index].displayName + "' id='charge_" + lHPVModelArray[i].lhpvId + '_' + lhpvChargesForGroupList[index].lhpvChargeTypeMasterId+"' value='"+ lhpvChargesForGroupList[index].amount +"' class='form-control' readonly='readonly'/>"
											+ "<input type='hidden' data-tooltip='" + lhpvChargesForGroupList[index].displayName + "' id='hidden_" + lHPVModelArray[i].lhpvId + '_' + lhpvChargesForGroupList[index].lhpvChargeTypeMasterId+"' value='"+ lhpvChargesForGroupList[index].amount +"' class='form-control' readonly='readonly'/>"
											+ "</td>");
								}
							} else if(lhpvChargesForGroupList[index].lhpvChargeTypeMasterId == ACTUAL_REFUND) {
								if(lhpvChargeLHPVIdMap != undefined) {
									lhpvSettlementCharges 	= lhpvChargeLHPVIdMap[lHPVModelArray[i].lhpvId + "_" + REFUND_AMOUNT];
								}

								if(lhpvSettlementCharges != undefined) {
									columnArray.push("<td style='text-align: center; vertical-align: middle;'>"
											+ "<input type='text' data-tooltip='" + lhpvChargesForGroupList[index].displayName + "' id='charge_" + lHPVModelArray[i].lhpvId + '_' + lhpvChargesForGroupList[index].lhpvChargeTypeMasterId + "' value='" + lhpvSettlementCharges.chargeAmount + "' class='form-control' readonly='readonly'/>"
											+ "<input type='hidden' data-tooltip='" + lhpvChargesForGroupList[index].displayName + "' id='hidden_" + lHPVModelArray[i].lhpvId + '_' + lhpvChargesForGroupList[index].lhpvChargeTypeMasterId + "' value='" + lhpvSettlementCharges.chargeAmount + "' class='form-control' readonly='readonly'/>"
											+ "</td>");
								} else {
									columnArray.push("<td style='text-align: center; vertical-align: middle;'>"
											+ "<input type='text' data-tooltip='" + lhpvChargesForGroupList[index].displayName + "' id='charge_" + lHPVModelArray[i].lhpvId + '_' + lhpvChargesForGroupList[index].lhpvChargeTypeMasterId + "' value='" + lhpvChargesForGroupList[index].amount + "' class='form-control' readonly='readonly'/>"
											+ "<input type='hidden' data-tooltip='" + lhpvChargesForGroupList[index].displayName + "' id='hidden_" + lHPVModelArray[i].lhpvId + '_' + lhpvChargesForGroupList[index].lhpvChargeTypeMasterId + "' value='" + lhpvChargesForGroupList[index].amount + "' class='form-control' readonly='readonly'/>"
											+ "</td>");
								}
							} else {
								columnArray.push("<td style='text-align: center; vertical-align: middle; width : 90px;'><input style = 'width : 60px' type='text' data-tooltip='" + lhpvChargesForGroupList[index].displayName + "' id='charge_" + lHPVModelArray[i].lhpvId + '_' + lhpvChargesForGroupList[index].lhpvChargeTypeMasterId + "' value='" + lhpvChargesForGroupList[index].amount + "' onkeypress='return noNumbers(event)' onfocus='return resetInputField(this)' onblur='return resetInputField(this);'  class='form-control' /></td>");
							}
						}
						
						if(tdsConfiguration.IsTdsAllow) {
							let tdsRateDropdown = "<select class='form-control tdsRateRow' id='tdsRate_" + lHPVModelArray[i].lhpvId + "'>";
							tdsRateDropdown += "<option value='0'>-- Select --</option>";

							if(tdsChargeList && tdsChargeList.length > 0) {
								for(const element of tdsChargeList) {
									if(element != null)
										tdsRateDropdown += "<option value='" + element + "'>" + element + "</option>";
								}
							}

							tdsRateDropdown += "</select>";

							columnArray.push("<td style='text-align: center; vertical-align: middle;' class='tdsRateRow'>" + tdsRateDropdown + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='text' name='tdsAmount' class = 'form-control tdsrow' id='tdsAmount_" + lHPVModelArray[i].lhpvId + "'  data-tooltip='Lorry Hire' value='" + 0 + "' style='text-align: right; width: 100px;' maxlength='7' onkeypress='return noNumbers(event);' /></td>");

							if(tdsConfiguration.IsPANNumberRequired)
								columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='text' maxlength='10' id='panNumber_" + lHPVModelArray[i].lhpvId + "' name='panNumber' placeholder='PAN Number' style='width:150px; text-transform:uppercase;' class='form-control' data-tooltip='PAN Number' onkeydown=\"removeError('panNumber_" + lHPVModelArray[i].lhpvId + "');\" /></td>");
							
							if(tdsConfiguration.IsTANNumberRequired)
								columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='text' maxlength='10' id='tanNumber_" + lHPVModelArray[i].lhpvId + "' name='tanNumber' placeholder='TAN Number' style='width:150px; text-transform:uppercase;' class='form-control' data-tooltip='TAN Number' onkeydown=\"removeError('tanNumber_" + lHPVModelArray[i].lhpvId + "');\" /></td>");
						}

						columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='text' data-tooltip='Reamark' id='remark_" + lHPVModelArray[i].lhpvId + "'  class='form-control' /></td>");	
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='text' data-tooltip='paymentmadeto' id='PaymentMadeTo_" + lHPVModelArray[i].lhpvId + "'  class='form-control' /></td>");	

						if(!$('#lhpvId_' + lHPVModelArray[i].lhpvId ).exists()) {
							$('#lhpvDetailsTable tbody').append('<tr id="lhpvId_' + lHPVModelArray[i].lhpvId +'">' + columnArray.join(' ') + '</tr>');
						} else {
							alreadyExistsLhvpNumber = lHPVModelArray[i].lhpvNumber + ',' + alreadyExistsLhvpNumber;
						}	

						$(lhpvChargesForGroupList).each(function() {
							if(this.operationType != LHPVChargeTypeConstant.OPERATION_TYPE_STATIC) {
								$('#charge_' + lHPVModelArray[i].lhpvId + '_' + this.lhpvChargeTypeMasterId).bind("keyup", function() {
									let elementId		= $(this).attr('id');
									let lhpvId			= elementId.split('_')[1];
									_this.calculateAmount(lhpvId);
								});
							}
						});
						
						$(document).on("click", "#lhpvPrint_" + lHPVModelArray[i].lhpvId + '_' + lHPVModelArray[i].typeOfLHPV, function() {
							let elementId		= $(this).attr('id');
							_this.viewLHPVPrint(elementId.split('_')[1], elementId.split('_')[2]);
						});
						
						if(blhpvConfiguration.showEditLHPVAmountColumn) {
							$(document).on("click", "#editLhpvAmount_" + lHPVModelArray[i].lhpvId, function() {
								let elementId		= $(this).attr('id');
								let lhpvId			= elementId.split('_')[1];
								_this.openEditLHPVAmount(lhpvId);
							});
						}
						
						columnArray = [];
						vehcileNumberArr.push(lHPVModelArray[i]);
					}

					if(tdsConfiguration.IsTdsAllow) {
						_this.handleCentralizedTDS(tdsChargeList);
						
						if(!tdsChargeList || tdsChargeList.length === 0)
							$('.tdsRateRow').remove();
					}
					
					
					if(alreadyExistsLhvpNumber != '')
						showMessage('error','LHPV Number Already Added :'+alreadyExistsLhvpNumber );

					$('#selectAll').bind("click", function() {
						_this.selectAllCheckBox(this.checked);
					});
					
					$(lhpvIdArrayList).each(function() {
						const lhpvId = this;
						$('#lhpvToAdd_' + this).bind("click", function() {
							_this.reCalculateAmount();
						});

						$('#tdsRate_' + lhpvId).bind("change", function() {
							const selectedRate = parseFloat($(this).val()) || 0;
							const tdsAmountField = $('#tdsAmount_' + lhpvId);

							tdsAmountField.val("0.00");

							if (selectedRate > 0)
								$('#tdsAmount_' + lhpvId).val("0.00").prop('readonly', true);
							else if (!$('#centralizedTDSCheckbox').is(':checked'))
								$('#tdsAmount_' + lhpvId).prop('readonly', false);


							_this.calculateTDSAmount(lhpvId);
						});
					});


					totalBalanceAmount	 = 	_this.calculateTotalAmount(ACTUAL_BALANCE);
					totalRefundAmount	 = 	_this.calculateTotalAmount(ACTUAL_REFUND);

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
						
						if(paymentType.areAll('valid')){
							_this.submitData();
						}
					});

					hideLayer();
				},submitData:function(){

					let checkBoxArray	= new Array();
					let jsonObject		= new Object();
					let newArrary		= [];
					let totalAmount		= 0;
					$.each($("input[name=lhpvToAdd]:checked"), function(){ 
						checkBoxArray.push($(this).val());
					});

					if(checkBoxArray.length == 0){
						showMessage('error', 'Please Select At least One LHPV!');
						hideLayer();
						return;
					}

					if(!_this.validatevehicleNumber(checkBoxArray,vehcileNumberArr)){
						hideLayer();
						return false;
					}
					
					if($('#paymentType').exists()) {
						if(isValidPaymentMode($('#paymentType').val())) { //Defined in paymentTypeSelection.js
							let trCount = $("#storedPaymentDetails  tr").length;
							
							if(trCount == 0) {
								showMessage('error','Please, Add Payment details for this BLHPV !');
								hideLayer();
								return false;
							}	
						}
					}
					
					if(!_this.validatePanTanOnTDS(checkBoxArray)) {
						hideLayer();
						return false;
					}

					jsonObject.paymentValues			= $('#paymentCheckBox').val();
					jsonObject.paymentType				= $('#paymentType').val();
					jsonObject.consolidatedBLHPVRemark 	= $('#consolidatedBLHPVRemark').val();
					jsonObject["lhpvIdWiseData"]		= JSON.stringify(_this.getLHPVIData());
					//jsonObject["lhpvIds"]				= checkBoxArray.join(',');
					jsonObject.TOKEN_KEY				= TOKEN_KEY;
					jsonObject.TOKEN_VALUE				= TOKEN_VALUE;
					jsonObject.manualBLHPVDate			= $('#manualConBLHPVDate').val();
					
					if(showManualDateOption && !validateManualDate())
						return false;
					
					let	ans = confirm("Are you sure you want to create Consolidated BLHPV ?");
					
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
				},handleCentralizedTDS: function(tdsChargeList) {
					const tdsContainer = $("#tdsContainer");
					const checkbox = $("#centralizedTDSCheckbox");
					const dropdown = $("#tdsDropdown");

					tdsContainer.hide();
					dropdown.hide();
					dropdown.empty().append("<option value='0' selected>Select TDS %</option>");

					if (tdsConfiguration.isAllowCentralizeTDS) {
						tdsContainer.show();

						let tdsRateDropdown = "<option value='0' selected>Select TDS %</option>";
						if (tdsChargeList && tdsChargeList.length > 0) {
							for (const element of tdsChargeList) {
								if (element != null)
									tdsRateDropdown += "<option value='" + element + "'>" + element + "</option>";
							}
						}
						dropdown.html(tdsRateDropdown).val("0");

						checkbox.off("change").on("change", function() {
							if (this.checked) {
								dropdown.show().val("0");


								$('.tdsRateRow select').each(function() {
									$(this).val("0").prop('disabled', true);
								});

								$('.tdsrow').each(function() {
									$(this).val(0).prop('readonly', true);
								});

							} else {
								dropdown.hide().val("0");

								$('.tdsRateRow select').each(function() {
									$(this).val("0").prop('disabled', false);
								});

								$('.tdsrow').each(function() {
									$(this).val(0).prop('readonly', false);
								});
							}
						});


						dropdown.off("change").on("change", function() {
							const selectedPercent = $(this).val();

							$('.tdsRateRow select').each(function() {
								$(this).val(selectedPercent).trigger('change');
							});

							$('.tdsrow').each(function() {
								if (selectedPercent === "0") {
									$(this).val(0);
								}
							});
						});
					}
				}, calculateAmount : function(lhpvId) {
					let balanceAmount = 0;
					let refundAmount  = 0;
					let chargeAmount  = 0;
					let totalBalanceAmount = 0;
					let totalRefundAmount  = 0;
					let totalAmount 	   = 0;

					if($("#hidden_" + lhpvId + '_' + ACTUAL_BALANCE).val())
						balanceAmount   =  Number($("#hidden_" + lhpvId + '_' + ACTUAL_BALANCE).val());

					if($("#hidden_" + lhpvId + '_' + ACTUAL_REFUND).val())
						refundAmount     =  Number($("#hidden_" + lhpvId + '_' + ACTUAL_REFUND).val());

					chargeAmount =	_this.calculateBalanceAmount(lhpvId);

					if(refundAmount > 0)
						chargeAmount = chargeAmount - parseInt(refundAmount,10);
					else
						chargeAmount = chargeAmount + parseInt(balanceAmount);

					if(chargeAmount >= 0) {
						$("#charge_" + lhpvId + '_' + ACTUAL_BALANCE).val(Math.abs(chargeAmount));
						$("#charge_" + lhpvId + '_' + ACTUAL_REFUND).val(0);
					} else {
						$("#charge_" + lhpvId + '_' + ACTUAL_BALANCE).val(0);
						$("#charge_" + lhpvId + '_' + ACTUAL_REFUND).val(Math.abs(chargeAmount));
					}

					totalBalanceAmount	 = 	_this.calculateTotalAmount(ACTUAL_BALANCE);
					totalRefundAmount	 = 	_this.calculateTotalAmount(ACTUAL_REFUND);

					totalAmount          = Math.abs(totalRefundAmount) - Math.abs(totalBalanceAmount);
					if(totalAmount > 0 ){
						$('#totalBalanceAmount').val(0);
						$('#totalRefundAmount').val(Math.abs(totalAmount));
						incomeExpenseModuleId	= ModuleIdentifierConstant.INCOME_TYPE_MODULE_ID;
					}else{
						$('#totalBalanceAmount').val(Math.abs(totalAmount));
						$('#totalRefundAmount').val(0);
						incomeExpenseModuleId	= ModuleIdentifierConstant.EXPENSE_TYPE_MODULE_ID;
					}

					_this.reCalculateAmount();
					
					if(tdsConfiguration.IsTdsAllow)
						_this.calculateTDSAmount(lhpvId);
				}, calculateBalanceAmount : function(lhpvId) {
					let chargesAmount = 0;
					
					if(lhpvChargesForGroupList.length > 0) {
						for(const element of lhpvChargesForGroupList){
							if (element.identifier == LHPVChargeTypeConstant.IDENTIFIER_TYPE_BLHPV
									&& element.lhpvChargeTypeMasterId != ACTUAL_BALANCE
									&& element.lhpvChargeTypeMasterId != ACTUAL_REFUND){
								if(element.operationType != OPERATION_TYPE_SUBTRACT) {
									if($('#charge_'+lhpvId+'_'+element.lhpvChargeTypeMasterId)){
										if(!isNaN(parseInt($('#charge_'+lhpvId+'_'+element.lhpvChargeTypeMasterId).val()))){
											chargesAmount += parseInt(parseInt($('#charge_'+lhpvId+'_'+element.lhpvChargeTypeMasterId).val()));
										}
									}
								}else if(!isNaN(parseInt($('#charge_'+lhpvId+'_'+element.lhpvChargeTypeMasterId).val()))){
									chargesAmount -= parseInt($('#charge_'+lhpvId+'_'+element.lhpvChargeTypeMasterId).val());
								}
							}
						}
					}

					if(!isNaN(chargesAmount)){
						return chargesAmount;
					}else{
						return 0;
					}
				},calculateTotalAmount :function(lhpvChargeTypeMasterId){
					let totalAmount = 0;

					for(const element of lhpvIdArrayList){
						if(ACTUAL_BALANCE == lhpvChargeTypeMasterId ){
							if(parseInt($('#charge_'+element+"_"+ACTUAL_BALANCE).val()) > 0 ){
								totalAmount +=parseInt($('#charge_'+element+'_'+ACTUAL_BALANCE).val());
							}
						}

						if(ACTUAL_REFUND == lhpvChargeTypeMasterId){
							if(parseInt($('#charge_'+element+"_"+ACTUAL_REFUND).val()) > 0 ){
								totalAmount -=parseInt($('#charge_'+element+'_'+ACTUAL_REFUND).val());
							}
						}
					}

					if(!isNaN(totalAmount)){
						return totalAmount;
					}else{
						return 0;
					}
				},reCalculateAmount : function(){
					let totalBalanceAmount = 0;
					let totalRefundAmount  = 0;
					let totalAmount  	   = 0;

					$('input[name=lhpvToAdd]:checked').each(function() {
						let lhpvId					= this.value;
						if(parseInt($('#charge_'+lhpvId+"_"+ACTUAL_BALANCE).val()) > 0 ){
							totalBalanceAmount +=parseInt($('#charge_'+lhpvId+'_'+ACTUAL_BALANCE).val());
						}

						if(parseInt($('#charge_'+lhpvId+"_"+ACTUAL_REFUND).val()) > 0 ){
							totalRefundAmount -=parseInt($('#charge_'+lhpvId+'_'+ACTUAL_REFUND).val());
						}
					});

					totalAmount = Math.abs(totalRefundAmount) - Math.abs(totalBalanceAmount) 
					if(totalAmount > 0 ){
						$('#totalRefundAmount').val(Math.abs(totalAmount));
						$('#totalBalanceAmount').val(0);
					}else if(totalAmount < 0 ){
						$('#totalBalanceAmount').val(Math.abs(totalAmount));
						$('#totalRefundAmount').val(0);
					}else if(totalAmount == 0 ){

						totalBalanceAmount	 = 	_this.calculateTotalAmount(ACTUAL_BALANCE);
						totalRefundAmount	 = 	_this.calculateTotalAmount(ACTUAL_REFUND);
						totalAmount          = Math.abs(totalRefundAmount) - Math.abs(totalBalanceAmount);
						if(totalAmount > 0 ){
							$('#totalBalanceAmount').val(0);
							$('#totalRefundAmount').val(Math.abs(totalAmount));

						}else{
							$('#totalBalanceAmount').val(Math.abs(totalAmount));
							$('#totalRefundAmount').val(0);
						}
					}

				}, calculateTDSAmount: function(lhpvId) {
					let amount = 0;
					let tdsamount = 0;

    				let lorryHire = _this.getLorryHireAmount(lhpvId);

					const actualRefund = '#charge_' + lhpvId + '_' + ACTUAL_REFUND;
					
					if($(actualRefund).length)
						amount = parseFloat($(actualRefund).val()) || 0;

					const actualBalance = '#hidden_' + lhpvId + '_' + ACTUAL_BALANCE;
					
					if($(actualBalance).length)
						amount = parseFloat($(actualBalance).val()) || 0;

					let tdsrate = parseFloat($('#tdsRate_' + lhpvId).val()) || 0;

					if(tdsConfiguration.calculateTdsOnLorryHire)
        				tdsamount = (lorryHire * tdsrate) / 100;
					else if(amount > 0 && tdsrate > 0)
						tdsamount = (amount * tdsrate) / 100;
					else
						tdsamount = parseFloat($('#tdsAmount_' + lhpvId).val()) || 0;

					$('#tdsAmount_' + lhpvId).val(tdsamount.toFixed(2));
				},getLorryHireAmount: function(lhpvId) {
				    if(lhpvChargeLHPVIdMap) {
				        const key = lhpvId + "_" + LORRY_HIRE;
				        const chargeObj = lhpvChargeLHPVIdMap[key];
				
				        if(chargeObj && chargeObj.chargeAmount)
				            return parseFloat(chargeObj.chargeAmount);
				    } 
				    return 0; 
				},getLHPVIData:function(){
					let lhphIdWiseObj		= [];
					dateArr					= new Array();
				
					$('input[name=lhpvToAdd]:checked').each(function() {
						let lhpvId				= this.value;
						let lhpvDetailsObj		= new Object();
						let	typeOfLHPV			= $('#typeOfLHPV_' + lhpvId).html();

						lhpvDetailsObj['lhpvId']					= lhpvId;
						lhpvDetailsObj['remark_' + lhpvId]			= $('#remark_' + lhpvId).val();
						lhpvDetailsObj['lhpvDate_' + lhpvId]		= $('#lhpvDate_' + lhpvId).html();
						lhpvDetailsObj['date'] 						= $('#lhpvDate_' + lhpvId).html();
						lhpvDetailsObj['lhpvNumber'] 				= $('#lhpvNo_' + typeOfLHPV +'_'+lhpvId).html();	
						lhpvDetailsObj['tdsAmount'] 				=  $('#tdsAmount_' + lhpvId).val();
						lhpvDetailsObj['tdsRate'] 					=  $('#tdsRate_' + lhpvId).val();
						lhpvDetailsObj['PanNumber'] 				=  $('#panNumber_' + lhpvId).val();			//do Not Change
						lhpvDetailsObj['TanNumber'] 				=  $('#tanNumber_' + lhpvId).val();

						for (let id in lhpvChargesForGroupList) {
							lhpvDetailsObj['charge_' + lhpvId + '_' + lhpvChargesForGroupList[id].lhpvChargeTypeMasterId] = $('#charge_' + lhpvId + '_' + lhpvChargesForGroupList[id].lhpvChargeTypeMasterId).val();
						}
						
						lhpvDetailsObj['paymentMadeTo_' + lhpvId]	= $('#PaymentMadeTo_' + lhpvId).val();
						
						lhphIdWiseObj.push(lhpvDetailsObj);
						dateArr.push(lhpvDetailsObj);
					});

					return lhphIdWiseObj;
				},getLHPVChargesData:function (lhpvId){
					let lhpvCharges		= new Object;
					for (let id in lhpvChargesForGroupList) {
						lhpvCharges['charge_' + lhpvId +'_'+ lhpvChargesForGroupList[id].lhpvChargeTypeMasterId] = $('#charge_' + lhpvId + '_' + lhpvChargesForGroupList[id].lhpvChargeTypeMasterId).val();
					}
					return lhpvCharges;

				},validatevehicleNumber :function(checkBoxArray,lHPVVehicleModelArray){
					let vehicleNumberMasterId 		= 0;
					let vehicleMasterArray			= new Array();
					$('input[name=lhpvToAdd]:checked').each(function(){
						let lhpvId		= this.value;
						$(lHPVVehicleModelArray).each(function(){
							if(this.lhpvId == Number(lhpvId)){
								vehicleMasterArray.push(this);
							}
						});

					});

					vehicleNumberMasterId	= vehicleMasterArray[0].vehicleNumberMasterId;
					/*for(var j = 0 ; j < vehicleMasterArray.length ; j++){
						if(vehicleNumberMasterId != vehicleMasterArray[j].vehicleNumberMasterId){
							showMessage('info', 'Please Select Same Vehicle Number!');
							return false;
						}

					}*/
					return true;
				}, validatePanTanOnTDS: function(checkBoxArray) {
					const centralizedCheckbox = $("#centralizedTDSCheckbox");

					if (centralizedCheckbox.length > 0 && centralizedCheckbox.is(":visible")) {
						const centralizedChecked = centralizedCheckbox.is(":checked");
						const centralizedTdsPercent = $("#tdsDropdown").val();

						if(centralizedChecked && (!centralizedTdsPercent || centralizedTdsPercent === "0")) {
							showMessage('error', 'Please Select TDS % before submitting!');
							return false;
						}
					}
					
					if(!(tdsConfiguration.IsPANNumberRequired || tdsConfiguration.IsTANNumberRequired))
						return true;
					
					for(const element of checkBoxArray) {
						let lhpvId = element;
						
						let tdsAmount = $("#tdsAmount_" + lhpvId).val();

						if (tdsAmount > 0) {
							if (tdsConfiguration.IsPANNumberRequired) {
								let panId = "panNumber_" + lhpvId;
								
								if (!validateInputTextFeild(1, panId, "PAN Number", "error", panNumberErrMsg) ||
									!validateInputTextFeild(8, panId, "PAN Number", "error", validPanNumberErrMsg)) {
									return false;
								}
							}

							if (tdsConfiguration.IsTANNumberRequired) {
								let tanId = "tanNumber_" + lhpvId;
								
								if (!validateInputTextFeild(1, tanId, "TAN Number", "error", tanNumberErrMsg) ||
									!validateInputTextFeild(13, tanId, "TAN Number", "error", validTanNumberErrMsg)) {
									return false;
								}
							}
						}
					}
					
					return true;
				}, responseAfter : function(response) {
					hideLayer();
					
					if(response.message != undefined) {
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

						let MyRouter = new Marionette.AppRouter({});
						MyRouter.navigate('&modulename=consolidatedBLHPV&consolidatedBLHPVId=' + response.consolidatedBLHPVId + '&consolidatedBLHPVNumber=' + response.consolidatedBLHPVNumber+'&print=true',{trigger: true});
						setTimeout(function(){ location.reload(); }, 1000);
						_this.openPrint(response.consolidatedBLHPVId);
					}
				}, getVehicleAgentAutoComplete : function() {
					let jsonObject = new Object();
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/autoCompleteWS/getVehicleAgentAutocomplete.do', _this.setVehicleAgentAutocomplete,EXECUTE_WITHOUT_ERROR);
				}, setVehicleAgentAutocomplete : function(response) {
					let autovehicleAgentName = $("#vehicleAgentEle").getInstance();
					$(autovehicleAgentName).each(function() {
						this.option.source = response.vehicleAgentAutoCompleteList;
					});
				}, getAgentVehicleAutoComplete:function(){
					let jsonObject = new Object();
					jsonObject.vehicleAgentMasterId = Number($('#vehicleAgentEle').val());
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/vehicleWS/getAgentVehicleNumberAutocomplete.do', _this.setAgentVehicleAutocomplete,EXECUTE_WITHOUT_ERROR);

				}, setAgentVehicleAutocomplete : function(response){
					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.vehicleNumberMaster,
						valueField		:	'vehicleNumberMasterId',
						labelField		:	'vehicleNumber',
						searchField		:	'vehicleNumber',
						elementId		:	'agentVehicleNumberEle',
						maxItems		: 	response.vehicleNumberMaster.length
					});
					
					$('#agentVehicleDiv').removeClass('hide');
				}, onPaymentTypeSelect: function(_this){
					let paymentType = document.getElementById("paymentType");
					hideShowBankPaymentTypeOptions(paymentType);
					
					if(tdsConfiguration.IsTdsAllow)
						isAllowToEnterTDS(paymentType);
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
					window.open('ConsolidatedBLHPVPrint.do?pageId=340&eventId=10&modulename=consolidatedBLHPVPrint&masterid=' + consolidatedBLHPVId+'&isReprint=true', 'newwindow', 'config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				}, openEditLHPVAmount : function(lhpvId) {
					window.open('viewDetails.do?pageId=340&eventId=2&modulename=editLhpvAmount&masterid=' + lhpvId + '&redirectTo=16','newwindow', 'config=height=500,width=800, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');					
				}, viewLHPVPrint : function(lhpvId, typeOfLHPV) {
					window.open('LHPVView.do?pageId=48&eventId=1&lhpvId='+lhpvId+'&isOriginal=false'+'&typeOfLHPV='+typeOfLHPV, 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				}
			});
		});

function resetInputField(param){
	if(param.value==''){
		return	param.value='0'
	}

	if(param.value=='0'){
		return param.value='';
	}
} 

function isAllowToEnterTDS(obj) {
	if(obj.value != PAYMENT_TYPE_CREDIT_ID) {
		$('.tdsrow').prop('disabled', false);
	} else {
		$('.tdsrow').each(function() {
			$(this).val(0).prop('disabled', true);
		});
	}
}

function validateManualDate() {
	let manualDateStr = $('#manualConBLHPVDate').val();
	
	const [day, month, year] = manualDateStr.split('-');
	const manualDate = new Date(+year, month - 1, +day);
	const maxDate = new Date(Math.max(...dateArr.map(e =>{return new Date(e.date);})));
	maxDate.setHours(0,0,0,0);
	
	let lhpvNo = dateArr.reduce((a, b)=>{return a.date > b.date ? a.lhpvNumber : b.lhpvNumber;});
		
	if(manualDate < maxDate){
		if(dateArr.length > 1)
			showMessage('error','You can not create Consolidated Blhpv Befor Lhpv Date, Lhpv No :'+lhpvNo);
		else
			showMessage('error','You can not create Consolidated Blhpv Befor Lhpv Date');
		
		return false;
	}

	return true;
}