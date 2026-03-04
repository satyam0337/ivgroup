var moduleId,
ModuleIdentifierConstant
,incomeExpenseModuleId
,PaymentTypeConstant
,minDate
,maxDate
,lsNumbersString
,dispatchLedgerIdS;
var generalConfiguration = null;
define([ 'marionette'
         ,'/ivcargo/resources/js/generic/urlparameter.js'
         ,'JsonUtility'
         ,'messageUtility'
         ,'jquerylingua'
         ,'language'
         ,'nodvalidation'
		 ,'focusnavigation'
		 ,'/ivcargo/resources/js/ajax/autocompleteutils.js'
		 ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'
         ],
         function(Marionette, UrlParameter) {
	'use strict';// this basically give strictness to this specific js
	let jsonObject	= new Object(),
	lhpvConfiguration, subRegionId = 0,
	searchTESNod,
	searchVehicleLHPVNod,
	newlhpvId,exepenseVoucherDetailsId,
	newlhpvNumber,paymentVoucherNumber,typeOfLhpvId,isLhpvAfterLS, lsNumber,
	newPrint,
	LHPVConstant,
	searchVehicleLSNod,
	paymentStatus,
	isAllowRedirectToLhpvAdvanceSettlement,
	lsNumberArrray	= new Array(),
	dispatchLedgerArray = new Array(),
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			//initialize is the first function called on call new view()
			_this = this;
			newlhpvId 						= UrlParameter.getModuleNameFromParam('lhpvId');
			newlhpvNumber  					= UrlParameter.getModuleNameFromParam('lhpvNumber');
			newPrint	  					= UrlParameter.getModuleNameFromParam('print');
			exepenseVoucherDetailsId 		= UrlParameter.getModuleNameFromParam('exepenseVoucherDetailsId');
			paymentVoucherNumber  			= UrlParameter.getModuleNameFromParam('paymentVoucherNumber');
			paymentStatus				  	= UrlParameter.getModuleNameFromParam('paymentStatus');
			typeOfLhpvId				  	= UrlParameter.getModuleNameFromParam('typeOfLhpvId');
			isLhpvAfterLS				  	= UrlParameter.getModuleNameFromParam('isLhpvAfterLS');
			lsNumber	  					= UrlParameter.getModuleNameFromParam('lsNumber');
		}, 	render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/LHPVWS/getLHPVConfigurations.do?', _this.renderLHPV, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderLHPV : function(response) {
			lhpvConfiguration		= response;
			LHPVConstant			= response.LHPVConstant;
			subRegionId				= response.subRegionId;
			PaymentTypeConstant		= response.PaymentTypeConstant;
			isAllowRedirectToLhpvAdvanceSettlement	= lhpvConfiguration.isAllowRedirectToLhpvAdvanceSettlement;
			response.LHPVWithoutLS	= lhpvConfiguration.LHPVWithoutLS;
			response.isLhpvAfterLS	= isLhpvAfterLS;
			generalConfiguration	= response.generalConfiguration;
			minDate					= response.minDate;
			maxDate					= response.maxDate;
			
			if(generalConfiguration.BankPaymentOperationRequired){
				let bankPaymentOperationModel		= new $.Deferred();	//
				
				$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html",function() {
					bankPaymentOperationModel.resolve();
				});
				
				let loadelement 	= new Array();

				loadelement.push(bankPaymentOperationModel);

				$.when.apply($, loadelement).done(function() {
					setIssueBankAutocomplete();
					setAccountNoAutocomplete();
				}).fail(function() {
					console.log("Some error occured");
				});
			}
			
			if(typeof createVideoLink != 'undefined') createVideoLink(response);
						
			if (lhpvConfiguration.LHPVWithoutLoadingSheet && lhpvConfiguration.ShowDropdownForLHPVType) {
				require(['/ivcargo/resources/js/module/view/lhpv/lhpvWithoutLoadingSheetSetup.js',
				         '/ivcargo/resources/js/module/view/lhpv/lhpvWithLoadingSheetSetup.js'], function(lhpvWithOutLoadingSheetSetup, lhpvWithLoadingSheetSetup){
					require(['text!'+lhpvWithOutLoadingSheetSetup.getLHPVTypeSelectionDropdown(),
					         lhpvWithOutLoadingSheetSetup.getFilePathForLabel(response),
					         'selectizewrapper'], function(View,FilePath,Selectizewrapper){
						_this.$el.html(_.template(View));
							
						if(newlhpvId != null && newlhpvNumber != null) {
							if((lhpvConfiguration.isAllowRedirectToLhpvAdvanceSettlement) && Number(paymentStatus) == 2)
								$('#linkToLhpvTruckAdvanceSettlement').html('<b>LHPV Advance Settlement :&emsp;<button type="button" name="linkToLhpvAdvanceSettlement" id="linkToLhpvAdvanceSettlement" class="btn btn-success" data-tooltip="Click">'+newlhpvNumber+'</button><div class="row">&nbsp;</div>',{trigger: true});

							if(newPrint == 'false' || lhpvConfiguration.hideLHPVPrintButton)
								$('#reprintOption').html('<b>Previous LHPV Number :</b> ' + newlhpvNumber + '<div class="row">&nbsp;</div>');
							else
								$('#reprintOption').html('<b>Previous LHPV Number :</b> ' + newlhpvNumber + '&emsp;<button type="button" name="reprintBtn" id="reprintBtn" class="btn btn-success" data-tooltip="Reprint">Reprint</button><div class="row">&nbsp;</div>');

							isLhpvAfterLS	= localStorage.getItem("isLhpvAfterLS");

							if(lhpvConfiguration.allowMultipleLsprintwithlhpv || isLhpvAfterLS != null && isLhpvAfterLS != 'null' && isLhpvAfterLS) {							
								lsNumbersString		= localStorage.getItem("lsNumbersString");
								dispatchLedgerIdS	= localStorage.getItem("dispatchLedgerIdS");
								
								if(lsNumbersString != null && lsNumbersString.length > 0)
									lsNumberArrray	= lsNumbersString.split(",");

								if(dispatchLedgerIdS != null && dispatchLedgerIdS.length > 0) {
									dispatchLedgerArray	= dispatchLedgerIdS.split(",");
									dispatchLedgerArray = dispatchLedgerArray.sort();
								}

								for(let i = 0 ; i < lsNumberArrray.length; i++) {
									$('#reprintOptionLs').append($('<b>LS Number :</b> ' + lsNumberArrray[i] + '&emsp;<button type="button" onclick="openPrintForLSBtn('+dispatchLedgerArray[i]+')" value="'+dispatchLedgerArray[i]+'" name="openPrintForLSBtn'+dispatchLedgerArray[i]+'" id="openPrintForLSBtn'+dispatchLedgerArray[i]+'" class="btn btn-success" data-tooltip="Reprint">Reprint</button>'));
								}
								
								localStorage.removeItem("lsNumbersString");
								localStorage.removeItem("dispatchLedgerIdS");
								localStorage.removeItem("isLhpvAfterLS");
							}
								
							if(exepenseVoucherDetailsId > 0)
								$('#voucherReprintOption').html('<b>Voucher Number :</b> ' + paymentVoucherNumber + '&emsp;<button type="button" name="reprintVoucherBtn" id="reprintVoucherBtn" class="btn btn-success" data-tooltip="Reprint">Print Voucher</button><div class="row">&nbsp;</div>');
							
							showMessage('success','LHPV ' + newlhpvNumber + ' created successfully !');

							if(newPrint == 'true')
								_this.openPrint(newlhpvId, typeOfLhpvId, false);
						}
						
						let isSingleLs	= isLhpvAfterLS != null && isLhpvAfterLS != 'null' && isLhpvAfterLS || response.lhpvNumberSameAsLsNumber;
						
						/*
						 Temporary disable
						*/
						if(isSingleLs) {
							response.isSingleLs = isSingleLs;
							
							$('#hideSelectionType').remove();

							require([ lhpvWithOutLoadingSheetSetup.loadLHPVTypeWiseHTML(LHPVConstant.LHPV_TYPE_ID_NORMAL, false)
										,'bootstrapSwitch'
										,'moment'
									], function(customView) {
										$("#inerData").html(_.template(customView));
										
										$('#lhpvOperationSelection').remove();
										$('#lorryHireModeSelection').remove();
										$('#searchTypeSelection').remove();
										$('#vehicleNumber').remove();
										$("#searchVehicleLSBtnDiv").css("display", "block");
										$("#lsNumber").css("display", "block");
										
										if(lsNumber != undefined && lsNumber != null && newlhpvId == null) {
											$("#lsNumber").val(lsNumber);
											lhpvWithLoadingSheetSetup.searchLS(0, null, lsNumber, response, LHPVConstant.LHPV_TYPE_ID_NORMAL, LHPVConstant.CREATE_ID, LHPVConstant.LHPV_SEARCH_TYPE_LS_NUMBER, 0);
										}
										
										searchVehicleLSNod = _this.setVehicleLSNod();
										
										$("#lsNumberEle").keyup(function(event) {
											if (event.which == 13) {
												$('#lhpvChargesDiv').empty();
												$('#loadingSheetTable tbody').empty();
												$("#createInterBranchLHPVElements").css("display", "none");
											    searchVehicleLSNod.performCheck();
																			    
												if(searchVehicleLSNod.areAll('valid'))
													lhpvWithLoadingSheetSetup.searchLS(0, null, $("#lsNumberEle").val(), response, LHPVConstant.LHPV_TYPE_ID_NORMAL, LHPVConstant.CREATE_ID, LHPVConstant.LHPV_SEARCH_TYPE_LS_NUMBER, 0);
											}
										});
										
										$("#searchVehicleLSBtn").bind("click", function() {
											$('#lhpvChargesDiv').empty();
											$('#loadingSheetTable tbody').empty();
											$("#createInterBranchLHPVElements").css("display", "none");
											searchVehicleLSNod.performCheck();
																													    
											if(searchVehicleLSNod.areAll('valid'))
												lhpvWithLoadingSheetSetup.searchLS(0, null, $("#lsNumberEle").val(), response, LHPVConstant.LHPV_TYPE_ID_NORMAL, LHPVConstant.CREATE_ID, LHPVConstant.LHPV_SEARCH_TYPE_LS_NUMBER, 0);
										});
										
										_this.loadCommonData(response);
										loadLanguageWithParams(FilePath.loadLanguage());
																		
										initialiseFocus();
									});
						} else {
							if (response.isSeqCounterPresent) {
								$("#manualRange").css("display", "block");
														
								if(response.lhpvSequenceCounter != null && typeof response.lhpvSequenceCounter != undefined)
									$("#availableRange").html(response.lhpvSequenceCounter.minRange + " <b>To</b> " + response.lhpvSequenceCounter.maxRange);
							}
							
							if (response.showDivisionSelection) {
								$("#divisionSelection").css("display", "block");
														
								Selectizewrapper.setAutocomplete({
									jsonResultList: response.divisionSelectionList,
									valueField: 'divisionMasterId',
									labelField: 'name',
									searchField: 'name',
									elementId: 'divisionSelectionEle',
									create: false,
									maxItems: 1
								});
							}
													
							Selectizewrapper.setAutocomplete({
								jsonResultList	: 	response.selectionArr,
								valueField		:	'lhpvTypeId',
								labelField		:	'lhpvTypeName',
								searchField		:	'lhpvTypeName',
								elementId		:	'lhpvType',
								create			: 	false,
								maxItems		: 	1
							});
													
						$('#lhpvType').change(function(){
							// write code for make html blank
							let lhpvType	= this.value;
							
							if (lhpvConfiguration.truckEngagementSleepAllowed && lhpvType == LHPVConstant.LHPV_TYPE_ID_NORMAL) {
								require([ lhpvWithOutLoadingSheetSetup.loadLHPVTypeWiseHTML(lhpvType, lhpvConfiguration.truckEngagementSleepAllowed)
										,'bootstrapSwitch'
										,'moment'
										], function(customView) {
									$("#inerData").html(_.template(customView));
									
									_this.loadCommonData(response);
								
									initialiseFocus();
								
									if (response.lhpvOperationSelection == 'true')
										$("#lhpvOperationSelection").css("display", "block");
									
									searchTESNod = _this.setSearchTESNod();
									
									if (response.isSeqCounterPresent || lhpvConfiguration.allowManualLHPVWithoutCounter || response.allowManualLHPVWithoutCounterPermission) {
										$("#isManualDiv").css("display", "block");
										$('#isManualEle').bootstrapSwitch({
											on 				: 'YES',
											off 			: 'NO',
											onLabel 		: 'YES',
											offLabel 		: 'NO',
											deactiveContent : 'Are You Sure For Manual LHPV?',
											activeContent 	: 'Are You Sure For Auto LHPV?'
										});
									}
									
									$("#isManualEle").change(function(){
										if ($('#isManualEle').is(':checked'))
											$("#manualLHPVDetailsDiv").css("display", "block");
										else
											$("#manualLHPVDetailsDiv").css("display", "none");
									});
									
									$( "#searchTESBtn" ).bind( "click", function() {
										searchTESNod.performCheck();
									
										if(searchTESNod.areAll('valid'))
											lhpvWithOutLoadingSheetSetup.searchTruckEngagementSlip(response);
									});

									loadLanguageWithParams(FilePath.loadLanguage());
								});
							}
							
							if ((!lhpvConfiguration.truckEngagementSleepAllowed && lhpvType == LHPVConstant.LHPV_TYPE_ID_NORMAL) || lhpvType == LHPVConstant.LHPV_TYPE_ID_BOTH || lhpvType == LHPVConstant.LHPV_TYPE_ID_DDDV || lhpvType == LHPVConstant.LHPV_TYPE_ID_DDM ) {
								require([ lhpvWithOutLoadingSheetSetup.loadLHPVTypeWiseHTML(lhpvType)
								         ,'bootstrapSwitch'
								         ,'moment'
								         ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'], function(customView){
									$("#inerData").html(_.template(customView));
									loadLanguageWithParams(FilePath.loadLanguage());

									_this.loadCommonData(response);
									
									$('#lhpvOperation').change(function(){
										let lhpvOperation	= $('#lhpvOperation').val();
										
										Selectizewrapper.setAutocomplete({
											url 				: WEB_SERVICE_URL+'/autoCompleteWS/getVehicleNumberAutocomplete.do?',
											valueField			: 'vehicleNumberMasterId',
											labelField			: 'vehicleNumber',
											searchField			: 'vehicleNumber',
											elementId			: 'vehicleNumberEle',
											responseObjectKey 	: 'result'
										});
										
										if(lhpvConfiguration.showLorryHireModeSelection) {
											Selectizewrapper.setAutocomplete({
												jsonResultList	: 	response.lorryHireModeList,
												valueField		:	'lorryHireModeId',
												labelField		:	'lorryHireModeName',
												searchField		:	'lorryHireModeName',
												elementId		:	'lorryHireModeEle',
												create			: 	false,
												maxItems		: 	1
											});
										}
										
										searchVehicleLHPVNod = nod();
										searchVehicleLHPVNod.configure({
											parentClass:'validation-message'
										});
										
										searchVehicleLSNod = _this.setVehicleLSNod();
										
										if (lhpvConfiguration.showDivisionSelection) {
											searchVehicleLHPVNod.add({
												selector: '#divisionSelectionEle_wrapper',
												validate: 'validateAutocomplete:#divisionSelectionEle',
												errorMessage: 'Select Proper Division !'
											});

											$("#vehicleNumber").css("display", "block");
										}
										
										if (lhpvOperation == LHPVConstant.CREATE_ID) {
											if(lhpvConfiguration.searchTypeSelection)
												$("#searchTypeSelection").removeClass("hide");
											
											if(lhpvConfiguration.searchByVehicleNumber) {
												searchVehicleLHPVNod.add({
													selector	: '#vehicleNumberEle_wrapper',
													validate	: 'validateAutocomplete:#vehicleNumberEle',
													errorMessage: 'Select Proper Vehicle !'
												});
												
												$("#vehicleNumber").css("display","block");
											}
											
											if(lhpvConfiguration.showLorryHireModeSelection) {
												searchVehicleLHPVNod.add({
													selector	: '#lorryHireModeEle',
													validate	: 'validateAutocomplete:#lorryHireModeEle',
													errorMessage: 'Select Lorry Hire Mode !'
												});
												
												$("#lorryHireMode").css("display","block");
											}
											
											if(lhpvConfiguration.searchByLSNumber)
												$("#lsNumber").css("display", "block");
											
											$("#lhpvNumber").css("display", "none");
											$("#searchVehicleLSBtnDiv").css("display", "block");
											
											$('#lorryHireModeEle').change(function() {
												if(Number($('#lorryHireModeEle').val()) == LHPVConstant.LORRY_HIRE_MODE_KM_WISE){
													$("#div_charge" + RATE_PER_KM).css("display", "block");
													$("#charge" + LORRY_HIRE).attr('readonly', true);
												} else {
													$("#div_charge" + RATE_PER_KM).css("display", "none");
													$("#charge" + LORRY_HIRE).attr('readonly', false);
												}
											});
											
											if (response.isSeqCounterPresent || lhpvConfiguration.allowManualLHPVWithoutCounter || response.allowManualLHPVWithoutCounterPermission) {
												$("#isManualDiv").css("display", "block");
												$('#isManualEle').bootstrapSwitch({
													on 				: 'YES',
													off 			: 'NO',
													onLabel 		: 'YES',
													offLabel 		: 'NO',
													deactiveContent : 'Are You Sure For Manual LHPV?',
													activeContent 	: 'Are You Sure For Auto LHPV?'
												});
											}
										}
										
										if (lhpvOperation == LHPVConstant.APPEND_ID) {
											searchVehicleLHPVNod.add({
												selector	: '#lhpvNumberEle',
												validate	: 'presence',
												errorMessage: 'Enter LHPV Number !'
											});
											
											$("#lhpvNumber").css("display", "block");
											$("#searchVehicleLSBtnDiv").css("display", "block");
											$("#vehicleNumber").css("display", "none");
											$("#lsNumber").css("display", "none");
											
											if(lhpvConfiguration.showVehicleAgentInLhpv)
												$("#vehicleAgentDiv").css("display", "none");
										}

										loadLanguageWithParams(FilePath.loadLanguage());
									});

									if(lhpvConfiguration.searchTypeSelection) {
										$("#searchOperation").change (function() {
											$('#lhpvChargesDiv').empty();
											$('#loadingSheetTable tbody').empty();
											$('#createInterBranchLHPVElements').css('display', "none");
											$('#lsNumberEle').val('');
											
											let searchOperation	= $("#searchOperation").val();
											
											$("#searchTypeSelection").removeClass("hide");
											$("#searchVehicleLSBtnDiv").css("display", "block");
											
											if(searchOperation == LHPVConstant.LHPV_SEARCH_TYPE_VEHICLE) {
												$("#vehicleNumber").css("display", "block");
												$("#lsNumber").css("display", "none");
												$("#lhpvNumber").css("display", "none");
											}

											if(searchOperation == LHPVConstant.LHPV_SEARCH_TYPE_LS_NUMBER) {
												$("#vehicleNumber").css("display", "none");
												$("#lsNumber").css("display", "block");
											}
										});
									}

									$("#lsNumberEle").keyup(function(event) {
										if (event.which == 13) {
										    searchVehicleLSNod.performCheck();
											    
											if(searchVehicleLSNod.areAll('valid'))
												lhpvWithLoadingSheetSetup.searchLS($("#vehicleNumberEle").val(), $("#lhpvNumberEle").val(), $("#lsNumberEle").val(), response, lhpvType, $('#lhpvOperation').val(), $("#searchOperation").val(),$("#divisionSelectionEle").val());
										}
									});
									
									$("#searchVehicleLSBtn").bind("click", async function() {
										if ($("#searchOperation").val() == LHPVConstant.LHPV_SEARCH_TYPE_VEHICLE) {
											let lhpvOperation = $('#lhpvOperation').val();

											if (lhpvConfiguration.lockLhpvCreationOnSameVehicleInSameDay && lhpvOperation == LHPVConstant.CREATE_ID) {
												const isValid = await new Promise((resolve, reject) => {
													_this.validateLhpvCreationOnVehicleNumber($("#vehicleNumberEle").val(), function(data) {
														let isValid	= data.isValid;
														
														if (!isValid) {
															let errorMessage	= data.message;
															showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);;
															$("#vehicleNumber").css("display","block");
															return;
														}

														resolve(isValid);
													});
												});
											}

											searchVehicleLHPVNod.performCheck();

											if (searchVehicleLHPVNod.areAll('valid'))
												lhpvWithLoadingSheetSetup.searchLS($("#vehicleNumberEle").val(), $("#lhpvNumberEle").val(), $("#lsNumberEle").val(), response, lhpvType, $('#lhpvOperation').val(), $("#searchOperation").val(), $("#divisionSelectionEle").val());
										} else if ($("#searchOperation").val() == LHPVConstant.LHPV_SEARCH_TYPE_LS_NUMBER) {
											searchVehicleLSNod.performCheck();

											if (searchVehicleLSNod.areAll('valid'))
												lhpvWithLoadingSheetSetup.searchLS($("#vehicleNumberEle").val(), $("#lhpvNumberEle").val(), $("#lsNumberEle").val(), response, lhpvType, $('#lhpvOperation').val(), $("#searchOperation").val(), $("#divisionSelectionEle").val());
										}
									});
								});
							}
						});
						}
						
						loadLanguageWithParams(FilePath.loadLanguage());
					});
				});
				
				hideLayer();
			}
			
			hideLayer();
		}, loadCommonData : function(response) {
			if(lhpvConfiguration.showSplitBranchWiseLhpv)
				$("#splitLhpvDataDetailPanel").load("/ivcargo/html/lhpv/splitLhpvDataDetail.html");
												
			if(lhpvConfiguration.showSplitDieselWiseLhpv)
				$("#splitDieselDataDetailPanel").load("/ivcargo/html/lhpv/splitDieselDataDetail.html");
			
			if(lhpvConfiguration.allowMultipleRemarks && isValueExistInArray((lhpvConfiguration.subRegionIdsForMultipleRemarks).split(','), subRegionId))
				$("#multipleLHPVRemarksModals").load("/ivcargo/html/lhpv/addMultipleRemarksInLHPV.html");
			
			let dateOption	= new Object();
												
			if(response.manualLHPVDatePermission) {
				dateOption.minDate		= minDate;
				dateOption.maxDate		= maxDate;
				dateOption.startDate	= maxDate;
													
				if(response.backDateInLateNightEntry)
					dateOption.startDate	= maxDate;

				dateOption.minDate		= minDate;
				$("#manualDate").css("display", "block");
			} else {
				dateOption.minDate	= minDate;
				dateOption.startDate= maxDate;
			}
												
			$("#manualDateEle").SingleDatePickerCus(dateOption);
			
			$("#isManualEle").change(function() {
				dateOption.minDate		= minDate;
				dateOption.maxDate		= maxDate;
				dateOption.startDate	= maxDate;
														
				if ($('#isManualEle').is(':checked')) {
					dateOption.minDate	= minDate;
					$("#manualNumber").css("display", "block");
					$("#manualDate").css("display", "block");
					$("#manualDateEle").SingleDatePickerCus(dateOption);
				} else if(response.manualLHPVDatePermission) {
					dateOption.minDate	= minDate;
					$("#manualDateEle").SingleDatePickerCus(dateOption);
				} else {
					$("#manualNumber").css("display", "none");
					$("#manualDate").css("display", "none");
				}
			});
		}, setSearchTESNod : function() {
			let searchTESNod = nod();
			searchTESNod.configure({
				parentClass		:'validation-message'
			});
											
			searchTESNod.add({
				selector		: '#truckEngagementSlipEle',
				validate		: 'presence',
				errorMessage	: 'Enter Slip Number !'
			});
			
			return searchTESNod;
		}, setVehicleLSNod : function() {
			let searchVehicleLSNod = nod();
			searchVehicleLSNod.configure({
				parentClass:'validation-message'
			});
													
			searchVehicleLSNod.add({
				selector	: '#lsNumberEle',
				validate	: 'presence',
				errorMessage: 'Enter LS Number !'
			});
			
			return searchVehicleLSNod;
		}, validateLhpvCreationOnVehicleNumber: function(vehicleId, callback) {
			let jsonObj = { vehicleNumberId: vehicleId };

			getJSON(jsonObj, WEB_SERVICE_URL + '/LHPVWS/lockLHPVCreationOnSameVehicleNumberInSameDay.do?', function(response) {
				callback(response);
			}, EXECUTE_WITHOUT_ERROR);
		}, events:{
			"click #reprintBtn" 					: 	"reprintBtnLs",
			"click #reprintVoucherBtn" 				: 	"reprintVoucherBtn",
			"click #linkToLhpvAdvanceSettlement" 	: 	"openLhpvTruckAdvanceSettlement"
		}, reprintBtnLs : function() {
			this.openPrint(newlhpvId,typeOfLhpvId,lhpvConfiguration.isPrintDuplicate);
		}, openLhpvTruckAdvanceSettlement : function() {
			window.open('LHPVView.do?pageId=52&eventId=10&isAllowRedirectToLhpvAdvanceSettlement='+isAllowRedirectToLhpvAdvanceSettlement+'&lhpvId='+newlhpvId+'&lhpvno='+newlhpvNumber);
		}, openPrint : function(lhpvId,typeOfLhpvId, isRePrint) {
			if (lhpvConfiguration.isWsLhpvPrint)
				window.open('BranchExpenseVoucherPrint.do?pageId=340&eventId=10&modulename=lhpvPrint&masterid=' + lhpvId+'&typeOfLhpvId='+typeOfLhpvId);
			else if(lhpvConfiguration.LhpvPrintFromNewFlow)
				window.open('LHPVView.do?pageId=48&eventId=9&lhpvId='+lhpvId+'&typeOfLhpvId='+typeOfLhpvId+'&isOriginal=false&isRePrint='+isRePrint, 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
			else if (lhpvConfiguration.hideLHPVPrintButton)
				openPrintForLSBtn(dispatchLedgerIdS);
			else if (lhpvConfiguration.printLhpvWithLsDetailsFromOldFlow)
				window.open('LHPVView.do?pageId=48&eventId=7&lhpvId='+lhpvId+'&typeOfLhpvId='+typeOfLhpvId+'&isOriginal=false&isRePrint='+isRePrint, 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
			else
				window.open('LHPVView.do?pageId=48&eventId=1&lhpvId='+lhpvId+'&typeOfLhpvId='+typeOfLhpvId+'&isOriginal=false&isRePrint='+isRePrint, 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}, reprintVoucherBtn : function() {
			window.open('viewBranchExpense.do?pageId=25&eventId=16&voucherDetailsId='+exepenseVoucherDetailsId, 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}
	});
});

function openPrintForLSBtn(dispatchLedgerIdS){
	window.open('InterBranch.do?pageId=340&eventId=10&modulename=loadingSheetPrintDestinationWise&masterid='+dispatchLedgerIdS+'&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}