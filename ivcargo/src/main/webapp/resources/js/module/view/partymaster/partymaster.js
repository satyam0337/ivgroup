var partyMasterProperties = new Object();

define(
		[
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/partymaster/languagefilepath.js',
			'slickGridWrapper2',
			PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/partymaster/smsService.js',
			'selectizewrapper',
			'JsonUtility',
			'messageUtility',
			'jquerylingua',
			'language',
			'autocomplete',
			'autocompleteWrapper',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
			'nodvalidation',
			'focusnavigation',
			'/ivcargo/resources/js/validation/regexvalidation.js'
		],
			function(FilePath, slickGridWrapper2, Selection, SmsService, SelectizeWrapper) {
			'use strict';
			
			var jsonObject = new Object(), corporateAccountId = 0, tab = "createTab", _this = '', corporateAccountId = 0, masterLangObj, masterLangKeySet, myNod, curName = null,
			data,myNod2,allowToSave = true,isTbb, smsEventList,  smsServiceInfo, partySms,corporateAccountMarkForDelete = false ,myNod3,myNod4, isAllowShortCreditTxnType = false
		  , doNotCheckDuplicateGstNumberForTbbParty = false,cityList,branchList, exemptPartyWithoutPANNumber = false,gstnum = null, isGstnAutoComple = false,previousClaimAmount = 0, doneTheStuffAdd = false,doneTheStuffDelete = false,isMobileNoAutoComple = false,mobileNum = null,
		  dontAllowSameGstnForNewParty = true, accountPerson = false, billingBranchesMap = false,physicalbranchList, isInvoiceDueDays = false, executiveType= 0, emailAddress = false, tinNumber = false;
		
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL + '/partyMasterWS/getPartyMasterTabs.do?', _this.renderPartyMasterTabs, EXECUTE_WITH_ERROR);
					return _this;
				}, renderPartyMasterTabs : function(response) {
					let loadelement = new Array();
					let baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/partyMaster/PartyMaster.html", function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						
						let keyObject = Object.keys(response);
						
						for (const element of keyObject) {
							if (response[element])
								$("*[data-attribute="+ element+ "]").removeClass("hide");
							else
								$("*[data-attribute="+ element+ "]").remove();
						}
						
						executiveType	= response.executiveType;
						
						getJSON(jsonObject, WEB_SERVICE_URL + '/partyMasterWS/getPartyMasterAddNewTabElements.do?',	_this.renderPartyMasterElements, EXECUTE_WITH_ERROR);
					});
				},renderPartyMasterElements : function(response) {
					if(response.allowTBBParty != undefined && response.allowTBBParty == true)
						response.isTBB.show = true;
					
					isAllowShortCreditTxnType 	= response.isAllowShortCreditTxnType != undefined && response.isAllowShortCreditTxnType == true;
					exemptPartyWithoutPANNumber = response.exemptPartyWithoutPANNumber != undefined && response.exemptPartyWithoutPANNumber == true;
					emailAddress				= response.emailAddress.show;
					tinNumber					= response.tinNumber.show;
					
					initialiseFocus();
					data						= response;
					
					partyMasterProperties		= response.partyMasterProperties;
					
					partyMasterProperties.isAllowSpecialCharacter =  'true';
					partyMasterProperties.AllowedSpecialCharacters= "46";
					
					_this.renderPartyMasterAddTabElements();
					
					cityList 	= data.cityList;
					branchList 	= data.branchList;
					
					if (branchList) {
						physicalbranchList = branchList.filter(function(el) {
							return el.branchTypeOfLocation === TYPE_OF_LOCATION_PHYSICAL
						});
					}

					$('#edit').on('click',function() {
						$("#addNewTab").empty();
						$("#customerAccessTab").empty();
						_this.renderPartyMasterAddEditTabElements(response);
					});

					$('#add').on('click',function() {
						$("#editTab").empty();
						$("#customerAccessTab").empty();
						_this.renderPartyMasterAddTabElements();
					});

					$('#customerAccess').on('click',function() {
						$("#addNewTab").empty();
						$("#editTab").empty();
						_this.setTabForCustomerAccess(jsonObject);
					});

					$('#viewAll').on('click',function() {
						$("#addNewTab").empty();
						$("#editTab").empty();
						getJSON(jsonObject, WEB_SERVICE_URL + '/partyMasterWS/getPartyMasterViewAllTabElements.do?',_this.renderPartyMasterViewAllTabElements, EXECUTE_WITH_ERROR);
					});
					
					$('#partyConfig').on('click',function() {
						$("#addNewTab").empty();
						$("#editTab").empty();
						getJSON(jsonObject, WEB_SERVICE_URL + '/partyMasterWS/PartyConfiguration.do?',_this.renderPartyConfigurantion, EXECUTE_WITH_ERROR);
					});
					
					$('#partyClaim').on('click',function() {
						$("#addNewTab").empty();
						$("#editTab").empty();
						getJSON(jsonObject, WEB_SERVICE_URL + '/partyClaimWS/getPartyClaimElements.do?',_this.renderPartyClaimElements, EXECUTE_WITH_ERROR);
					});
					
					if(partyMasterProperties.showPartyToPartyConfiguration)							
						$('li[data-attribute="partyToPartyConfigTab"]').removeClass('hide');
					
					$('#partyToParty').on('click', function() {
						window.open('partyMaster.do?pageId=340&eventId=1&modulename=partyToPartyConfig');
					});
					
					if(partyMasterProperties.allowToUploadDocument) {							
						$('li[data-attribute="quatationTab"]').removeClass('hide');
						
						$('#quatation').on('click',function() {
							$("#addNewTab").empty();
							$("#editTab").empty();
							jsonObject.corporateAccountId = 0;
							_this.renderQuatationTabElements(response);
						});
					}

					hideLayer();
				}, renderPartyMasterAddTabElements : function() {
					let loadelement				= new Array();
					let addNewEditHtml			= new $.Deferred();

					loadelement.push(addNewEditHtml);

					$("#addNewTab").load("/ivcargo/html/module/partyMaster/partyMasterTabElements/addNew-EditTabElements.html", function() {
						addNewEditHtml.resolve();
					});
					
					tab	= "addNewTab";
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						_this.setDataForAddAndUpdate();
						_this.validateField();
						
						let dateOption			= new Object();
						$("#issueDateEle").SingleDatePickerCus(dateOption);
						
						if($('#gstNumSelect').is(":visible"))
							$('#gstNumSelect').addClass('hide');
						
						if($('#mobileNumSelect').is(":visible"))
							$('#mobileNumSelect').addClass('hide');
						
						hideLayer();
						
						if(dontAllowSameGstnForNewParty) {
							$("#gstnEle").keypress(function(){
								_this.validateLengthOfGSTNumber(true);
							});
						}
						
						$("#saveBtn").click(function() {
							if(allowToSave) {
								myNod.performCheck();
								
								if(myNod.areAll('valid')) {
									if(partyMasterProperties.allowCustomMobileValidation) {
										if ($("#mobileNumber1Ele").val() != undefined && $("#mobileNumber1Ele").val() != "")
											if (!validateMobileNumberBeforeSave(document.getElementById('mobileNumber1Ele')))
												return false;

										if ($("#mobileNumber2Ele").val() != undefined && $("#mobileNumber2Ele").val() != "")
											if (!validateMobileNumberBeforeSave(document.getElementById('mobileNumber2Ele')))
												return false;
									}
									
									if($('#isParentPartyEle').is(":visible")) {
										if(Number($('#isParentPartyEle_primary_key').val()) == 1 && ($('#partyNameSelectorForParentPartyEle_primary_key').val() == "" || Number($('#partyNameSelectorForParentPartyEle_primary_key').val()) == 0)){
											showMessage('error','Please Select Parent Party !')
											$('#partyNameSelectorForParentPartyEle').focus();
											return false;
										}
									}
									
									if($('#isExemptedEle').is(":visible") && $('#isExemptedEle').is(':checked')) {
										if(!exemptPartyWithoutPANNumber) {
											if($('#panNumberEle').val() == "") {
												showMessage('error','Please enter PAN number !')
												$('#panNumberEle').focus();
												return false;
											} else {
												let panNumber 	= $('#panNumberEle').val();
												let char		= panNumber.charAt(3);
												char 			= char.toUpperCase();
												let fourthChar	= partyMasterProperties.fourthCharacterOfPAN;
											
												if(!fourthChar.includes(char)) {
													showMessage('info','Please enter valid PAN number !')
													$('#panNumberEle').focus();
													return false;
												}
											}
										}
										
										if($('#gstnEle').val() != "") {
											showMessage('info','Cannot exempt party with GSTN !')
											$('#gstnEle').focus();
											return false;
										}
									}
									
									_this.onSubmit();
								}
							}
						});					
					  $('#partyCodeEle').attr('maxlength', partyMasterProperties.PartyCodeMaxLength);
				   });
				},renderPartyMasterAddEditTabElements : function() {
					var loadelement 			= new Array();
					var addNewEditHtml 			= new $.Deferred();
					loadelement.push(addNewEditHtml);

					$("#editTab").load("/ivcargo/html/module/partyMaster/partyMasterTabElements/addNew-EditTabElements.html", function() {
						addNewEditHtml.resolve();
					});
					
					 tab	= "editTab";

					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						_this.setDataForAddAndUpdate();
						_this.validateField();

						$("*[data-selector='header1']").html("Update Party");
						$("#editBtn").removeClass("hide");
						$("#saveBtn").addClass("hide");
						$("#partyNameSelector").removeClass("hide");
						
						/*$("#gstNumSelect").removeClass("hide");*/
						$("#bottons").removeClass("hide");
						
						$("#editBtn").click(function() {
							myNod2 = nod();
							myNod2.configure({
								parentClass:'validation-message'
							});
							myNod2.add({
								selector		: '#partyNameSelectorEle',
								validate		: 'validateAutocomplete:#partyNameSelectorEle_primary_key',
								errorMessage	: 'Please Select Party Name'
							});
							myNod2.performCheck();
							if(myNod2.areAll('valid')) {
								_this.onEdit();
							}
						});
						
						var partyNameAutoComplete 					= new Object();
						partyNameAutoComplete.primary_key 			= 'corporateAccountId';
						partyNameAutoComplete.field 				= 'corporateAccountDisplayName';
						
						if(partyMasterProperties.showExecutiveTypeWisePartyDetails) {
							partyNameAutoComplete.url 					= WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocompleteByExecutiveType.do';
							partyNameAutoComplete.callBack 				= _this.getCorporateAccountForEdit1(false);
						} else {
							partyNameAutoComplete.url 					= WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocomplete.do?isSearchByAllParty='+partyMasterProperties.isSearchByAllParty+'&isShowDeactivateParty='+partyMasterProperties.isShowDeactivateParty;
							partyNameAutoComplete.callBack 				= _this.getCorporateAccountForEdit1;
						}
						
						$("#partyNameSelectorEle").autocompleteCustom(partyNameAutoComplete);
					
						if(dontAllowSameGstnForNewParty) {
							$("#gstnEle").keypress(function(){
								_this.validateLengthOfGSTNumber(true);
							});
						}
						
						$("#updateBtn").click(function() {
							if(partyMasterProperties.allowCustomMobileValidation){
								if($("#mobileNumber1Ele").val() != undefined && $("#mobileNumber1Ele").val() != "")
									if(!validateMobileNumberBeforeSave(document.getElementById('mobileNumber1Ele')))
										return false;

								if($("#mobileNumber2Ele").val() != undefined && $("#mobileNumber2Ele").val() != "")
									if(!validateMobileNumberBeforeSave(document.getElementById('mobileNumber2Ele')))
										return false;
							}
							
						if(partyMasterProperties.gstNumberMandatoryOnupdate) {
							if($('#isTBBEle').is(":checked")) {
								if($('#gstnEle').val() == ''){
									showMessage('error','GST Number Required!');
									$('#gstnEle').focus();
									$('#gstnEle').css('border-color','red');
									return false;
								}
							}
							
							if(doNotCheckDuplicateGstNumberForTbbParty) {
								if(!$('#isTBBEle').is(":checked") && (typeof isTbb != 'undefined' && isTbb != undefined && isTbb == false)) 
									_this.validateLengthOfGSTNumber(partyMasterProperties.checkGSTNumberForUnique);
							} else if($('#isTBBEle').is(":checked"))
								_this.validateLengthOfGSTNumber(partyMasterProperties.checkGSTNumberForUnique);
						}
						
						if($('#isParentPartyEle').is(":visible")){
							if(Number($('#isParentPartyEle_primary_key').val()) == 1 && ($('#partyNameSelectorForParentPartyEle_primary_key').val() == "" || Number($('#partyNameSelectorForParentPartyEle_primary_key').val()) == 0)){
								showMessage('error','Please Select Parent Party !')
								$('#partyNameSelectorForParentPartyEle').focus();
								return false;
							
							}
						}
						if($('#isExemptedEle').is(":visible") && $('#isExemptedEle').is(':checked')){
							if(!exemptPartyWithoutPANNumber){
								if($('#panNumberEle').val() == ""){
									showMessage('error','Please enter PAN number !')
									$('#panNumberEle').focus();
									return false;
								} else {
									let panNumber 	= $('#panNumberEle').val();
									let char		= panNumber.charAt(3);
									char 			= char.toUpperCase();
									let fourthChar	= partyMasterProperties.fourthCharacterOfPAN;
									
									if(!fourthChar.includes(char)){
										showMessage('error','Please enter valid PAN number !')
										$('#panNumberEle').focus();
										return false;
									}
								}
							}
							
							if($('#gstnEle').val() != ""){
								showMessage('info','Cannot exempt party with GSTN !')
								$('#gstnEle').focus();
								return false;
							}
						}
						
							if(allowToSave){
								myNod.performCheck();
								if(myNod.areAll('valid')) {
									_this.onUpdate();
								}
							}
						});
						
						$("#deactivateBtn").click(function() {
							myNod2 = nod();
							myNod2.configure({
								parentClass:'validation-message'
							});
							myNod2.add({
								selector		: '#partyNameSelectorEle',
								validate		: 'validateAutocomplete:#partyNameSelectorEle_primary_key',
								errorMessage	: 'Please Select Party Name'
							});
							myNod2.performCheck();
							if(myNod2.areAll('valid')) {
								_this.onDelete($('#corporateAccountId').val(),null,null,null,null);
							}
						});
						
						$("#activateBtn").click(function(){
							var jsonObject 		= new Object();
							
							jsonObject.corporateAccountId 					= $('#partyNameSelectorEle_primary_key').val();
							
							if($("#partyNameSelectorEle_primary_key").val() > 0){
								$("#partyNameSelectorEle").css('border-color','green');
								getJSON(jsonObject, WEB_SERVICE_URL + '/partyMasterWS/activateSingleParty.do?',_this.afterActivate, EXECUTE_WITH_ERROR);
							} else{
								showMessage("error",'Please Select Valid Party !');
								$("#partyNameSelectorEle").focus();
								$("#partyNameSelectorEle").css('border-color','red');
							}
						})
						$('#partyCodeEle').attr('maxlength', partyMasterProperties.PartyCodeMaxLength);
					});
				}, setDataForAddAndUpdate : function() {
					let keyObject 				= Object.keys(data);
					smsEventList				= data.smsEventList;
					
					for (let i = 0; i < keyObject.length; i++) {
						if(keyObject[i] == 'shortCreditTxnType') {
							var showTxn = data[keyObject[i]].show; 
							
							if(!showTxn)
								data[keyObject[i]].show = isAllowShortCreditTxnType;
						}
						
						if (!data[keyObject[i]].show)
							$("*[data-attribute="+ keyObject[i]+ "]").addClass("hide");
						
						if (data[keyObject[i]].show)
							$("#"+ keyObject[i]+ "").attr("data-selector", keyObject[i]);
							
						if(data['accountPerson'].show)
							accountPerson	= true;
					}
					
					data.gstNumberMandatoryOnupdate		= partyMasterProperties.gstNumberMandatoryOnupdate;
					
					let partyNameForParentPartyAutoComplete 					= new Object();
					partyNameForParentPartyAutoComplete.primary_key 			= 'corporateAccountId';
					partyNameForParentPartyAutoComplete.field 					= 'corporateAccountDisplayName';
					
					if(partyMasterProperties.showExecutiveTypeWisePartyDetails)
						partyNameForParentPartyAutoComplete.url 	= WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocompleteByExecutiveType.do';
					else
						partyNameForParentPartyAutoComplete.url 	= WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocomplete.do?isSearchByAllParty='+true;
					
					$("#partyNameSelectorForParentPartyEle").autocompleteCustom(partyNameForParentPartyAutoComplete);

					if(typeof data.cftUnitList !== 'undefined')
						Selection.setUnitTypeSelection(data);
								
					//Selection.setSelectionToGetData(data);
					let billingPartyNameAutoComplete 		 	 = new Object();
					billingPartyNameAutoComplete.url 		 	 = WEB_SERVICE_URL + '/autoCompleteWS/getPartyDetailsAutocomplete.do?billing=4';
					billingPartyNameAutoComplete.primary_key 	 = 'corporateAccountId';
					billingPartyNameAutoComplete.field			 = 'corporateAccountDisplayName';
					$("#billingPartyNameEle").autocompleteCustom(billingPartyNameAutoComplete);
					
					let cityeAutoComplete		 	= new Object();
					cityeAutoComplete.primary_key 	= 'cityId';
					cityeAutoComplete.url 			=  cityList;
					cityeAutoComplete.field 		= 'name';
					$("#cityEle").autocompleteCustom(cityeAutoComplete);
					
					let branchAutoComplete		 	= new Object();
					branchAutoComplete.primary_key 	= 'branchId';
					branchAutoComplete.url 			=  branchList;
					branchAutoComplete.field 		= 'branchName';
					$("#branchEle").autocompleteCustom(branchAutoComplete).html();
						
					let billingBranchAutoComplete		 	= new Object();
					billingBranchAutoComplete.primary_key 	= 'branchId';
					billingBranchAutoComplete.url 			=  physicalbranchList;
					billingBranchAutoComplete.field 		= 'branchName';
					$("#billingBranchEle").autocompleteCustom(billingBranchAutoComplete).html();
					
					let sourceBranchAutoComplete		 	= new Object();
					sourceBranchAutoComplete.primary_key 	= 'branchId';
					sourceBranchAutoComplete.url 			=  branchList;
					sourceBranchAutoComplete.field 			= 'branchName';
					$("#sourceBranchEle").autocompleteCustom(sourceBranchAutoComplete).html();
					
					 $('#cityEle').change(function() {
						 let cityId = Number( $('#cityEle_primary_key').val());
						
						 for(const element of cityList) {
							 var cityListData = element;
							 
							 if(Number(cityId) == Number(cityListData.cityId)) {
								 $("#stateEle").val(cityListData.stateName);
								 $("#stateEle_primary_key").val(cityListData.stateId);
								 $("#countryEle").val(cityListData.countryName);
								 $("#countryEle_primary_key").val(cityListData.countryId);
							 }
						 }
                     });
                     
					myNod = nod();
					myNod.configure({
						parentClass:'validation-message'
					});

					if (executiveType == EXECUTIVE_TYPE_GROUPADMIN || executiveType == EXECUTIVE_TYPE_REGIONADMIN || executiveType == EXECUTIVE_TYPE_SUBREGIONADMIN) {
						myNod.add({
							selector		: '#branchEle',
							validate		: 'validateAutocomplete:#branchEle_primary_key',
							errorMessage	: 'Select proper Branch !'
						});
						myNod.add({
							selector		: '#cityEle',
							validate		: 'validateAutocomplete:#cityEle_primary_key',
							errorMessage	: 'Select proper City !'
						});
					}
					
					if (executiveType == EXECUTIVE_TYPE_GROUPADMIN) {
						myNod.add({
							selector		: '#partNameEle',
							validate		: 'validateAutocomplete:#partyNameEle',
							errorMessage	: 'Enter Party name !'
						});
					}

					$("*[data-attribute='region']").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
					$("*[data-attribute='subRegion']").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
					$("*[data-attribute='partyNameSelector']").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
					$("*[data-attribute='isTBB']").find('label').first().append("<span style='color:red;font-size:20px;'>*</span>");
					
					let partyTypeAutoComplete 			= new Object();
					partyTypeAutoComplete.url 			= data.PartyTypeObject;
					partyTypeAutoComplete.primary_key 	= 'partyTypeId';
					partyTypeAutoComplete.field 		= 'partyTypeName';
					$("#partyTypeEle").autocompleteCustom(partyTypeAutoComplete);
					
					let deliveryAtAutoComplete 			= new Object();
					deliveryAtAutoComplete.url 			= data.DeliveryAtObject;
					deliveryAtAutoComplete.primary_key 	= 'deliveryAtId';
					deliveryAtAutoComplete.field 		= 'deliveryAtName';
					$("#deliveryAtEle").autocompleteCustom(deliveryAtAutoComplete);

					let discAllowedAutoComplete 		= new Object();
					discAllowedAutoComplete.url 		= data.discAllowedList;
					discAllowedAutoComplete.primary_key = 'discountallowed';
					discAllowedAutoComplete.field 		= 'discountallowedName';
					$("#isDiscountAllowedEle").autocompleteCustom(discAllowedAutoComplete);

					let blackListAutoComplete 			= new Object();
					blackListAutoComplete.url 			= data.blackListList;
					blackListAutoComplete.primary_key 	= 'blackList';
					blackListAutoComplete.field 		= 'blackListName';
					$("#isBlackListedEle").autocompleteCustom(blackListAutoComplete);
					
					let taxTypeAutoComplete 			= new Object();
					taxTypeAutoComplete.url 			= data.taxType;
					taxTypeAutoComplete.primary_key 	= 'taxTypeId';
					taxTypeAutoComplete.field 			= 'taxTypeName';
					$("#isTaxTypeEle").autocompleteCustom(taxTypeAutoComplete);
					
					let partyBusinessTypeAutoComplete 			= new Object();
					partyBusinessTypeAutoComplete.url 			= data.partyBusinessTypeList;
					partyBusinessTypeAutoComplete.primary_key 	= 'businessTypeId';
					partyBusinessTypeAutoComplete.field 		= 'businessTypeName';
					$("#partyBusinessTypeEle").autocompleteCustom(partyBusinessTypeAutoComplete);
					
					let isParentPartyList 	= new Array();
					 
					isParentPartyList[0] 	= {'isParentPartyId':0,'isParentParty':'YES'};
					isParentPartyList[1] 	= {'isParentPartyId':1,'isParentParty':'NO'};
					
					let isParentPartyListAutoComplete 			= new Object();
					isParentPartyListAutoComplete.url 			= isParentPartyList;
					isParentPartyListAutoComplete.primary_key 	= 'isParentPartyId';
					isParentPartyListAutoComplete.field 		= 'isParentParty';
					isParentPartyListAutoComplete.callBack		= _this.setParentPartyDiv;
					$("#isParentPartyEle").autocompleteCustom(isParentPartyListAutoComplete);
					
					let shortCreditTxnTypeAutoComplete 			= new Object();
					shortCreditTxnTypeAutoComplete.url 			= data.shortCreditTxnTypeList;
					shortCreditTxnTypeAutoComplete.primary_key 	= 'shortCreditTxnType';
					shortCreditTxnTypeAutoComplete.field 		= 'shortCreditTxnTypeName';
					$("#shortCreditTxnTypeEle").autocompleteCustom(shortCreditTxnTypeAutoComplete);

					let rateAllowedOnWeightTypeAutoComplete 		= new Object();
					rateAllowedOnWeightTypeAutoComplete.url 		= data.rateAllowedOnWeightTypeList;
					rateAllowedOnWeightTypeAutoComplete.primary_key = 'rateAllowedOnWeightType';
					rateAllowedOnWeightTypeAutoComplete.field 		= 'rateAllowedOnWeightTypeName';
					$("#rateAllowedOnWeightTypeEle").autocompleteCustom(rateAllowedOnWeightTypeAutoComplete);

					let insuredByListAutoComplete 			= new Object();
					insuredByListAutoComplete.url 			= data.insuredByList;
					insuredByListAutoComplete.primary_key 	= 'insuredByid';
					insuredByListAutoComplete.field 		= 'insuredByName';
					$("#insuredByEle").autocompleteCustom(insuredByListAutoComplete);

					let stPaidByListListAutoComplete 			= new Object();
					stPaidByListListAutoComplete.url 			= data.stPaidByList;
					stPaidByListListAutoComplete.primary_key 	= 'stPaidByid';
					stPaidByListListAutoComplete.field 			= 'stPaidByName';
					$("#stPaidByEle").autocompleteCustom(stPaidByListListAutoComplete);
					
					let smsRequiredAutoComplete 			= new Object();
					smsRequiredAutoComplete.url 			= data.smsRequiredList;
					smsRequiredAutoComplete.primary_key 	= 'smsRequiredId';
					smsRequiredAutoComplete.field 			= 'smsRequiredName';
					$("#smsRequiredEle").autocompleteCustom(smsRequiredAutoComplete);

					let chargedWeightRoundOffValueList				= (partyMasterProperties.ChargedWeightRoundOffValueList).split(",");
					let autoCompleteForMarketingPerson				= partyMasterProperties.autoCompleteForMarketingPerson;
					doNotCheckDuplicateGstNumberForTbbParty			= partyMasterProperties.doNotCheckDuplicateGstNumberForTbbParty;
					dontAllowSameGstnForNewParty					= partyMasterProperties.dontAllowSameGstnForNewParty;
					
					if(autoCompleteForMarketingPerson) {
						let marketingPersonNameAutoComplete 			= new Object();
						marketingPersonNameAutoComplete.primary_key 	= 'marketingPersonId';
						marketingPersonNameAutoComplete.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getMarketingPersonsList.do';
						marketingPersonNameAutoComplete.callBack 		= _this.getMarketingPersonData;
						marketingPersonNameAutoComplete.field 			= 'marketingPersonName';
						$("#marketingPersonEle").autocompleteCustom(marketingPersonNameAutoComplete);
						$("*[data-attribute='marketingPerson']").first('div').children().addClass("col-xs-7");
					}
					
					let gstNoAutoComplete 						= new Object();
					gstNoAutoComplete.primary_key 				= 'corporateAccountId';
					gstNoAutoComplete.url 						= WEB_SERVICE_URL+'/autoCompleteWS/getPartyGstnAutocomplete.do';
					gstNoAutoComplete.callBack 					= _this.getCorporateAccountForEdit1;
					gstNoAutoComplete.field 					= 'gstn';
					$("#gstNoSelectorEle").autocompleteCustom(gstNoAutoComplete);
					
					let mobileNoAutoComplete 					= new Object();
					mobileNoAutoComplete.primary_key 			= 'corporateAccountId';
					mobileNoAutoComplete.url 					= WEB_SERVICE_URL+'/autoCompleteWS/getPartyMobileNoAutocomplete.do';
					mobileNoAutoComplete.callBack 				= _this.getCorporateAccountForEdit1;
					mobileNoAutoComplete.field 					= 'corporateAccountMobileNumber';
					$("#mobileNoSelectorEle").autocompleteCustom(mobileNoAutoComplete);
					
					if(data.PartyNameIdentifiers == 4 || partyMasterProperties.destinationBranchWisePartyMapping) {
						$("*[data-attribute=branchMap]").addClass("show");
						
						for(const element of data.branchList) {
							$('#mappingBranchEle').append('<option value="'+element.branchId+'">'+element.branchName+'</option>');
						}
					}
					
					if(!partyMasterProperties.checkGSTNumberForUnique)
						allowToSave	= true;
					
					$("#gstNoSelectorEle").keyup(function(event){
						isGstnAutoComple = true;
						
						if(event.which == 13){
							_this.validateGSTAutocomplete();
							
							gstnum 				= $("#gstNoSelectorEle").val().trim();
							corporateAccountId	= $('#gstNoSelectorEle_primary_key').val().trim();
							
							if(corporateAccountId == 0 && gstnum != null && gstnum.length == 15) {
								setTimeout(() => {
									$("#add").trigger("click");
									
								}, 200);
								
								setTimeout(() => {
									$('#gstnEle').val(gstnum);
								}, 1000);
								
								return false;
							}
							
							if(corporateAccountId > 0 && gstnum != null) {
								isGstnAutoComple = true;
								_this.getCorporateAccountForEdit1();
							} else {
								isGstnAutoComple = false;
							}
						}
					});
					
					$("#mobileNoSelectorEle").keyup(function(event){
						isMobileNoAutoComple = true;

						if(event.which == 13){
							_this.validateMobileNoAutocomplete();

							mobileNum 			= $("#mobileNoSelectorEle").val().trim();
							corporateAccountId	= $('#mobileNoSelectorEle_primary_key').val().trim();
							
							if(corporateAccountId == 0 && mobileNum != null && mobileNum.length == 10) {
								setTimeout(() => {
									$("#add").trigger("click");
								}, 200);
								
								setTimeout(() => {
									$('#mobileNumber1Ele').val(mobileNum);
								}, 1000);
								
								return false;
							}
							
							if(corporateAccountId > 0 && mobileNum != null) {
								isMobileNoAutoComple = true;
								_this.getCorporateAccountForEdit1();
							} else {
								isMobileNoAutoComple = false;
							}
						}
					});
					
					
					$("#isTBBEle").click(function(){
						_this.validateLengthOfGSTNumber(partyMasterProperties.checkGSTNumberForUnique);
					});
					
					$("#panNumberEle").blur(function(){
						if($("#panNumberEle").val() != undefined && $("#panNumberEle").val() != ""){
							myNod.add({
								selector		: '#panNumberEle',
								validate		: 'panNum',
								errorMessage	: "Invalid Pan Number!"
							});
						} else {
							myNod.remove('#panNumberEle');
						}
					});
					
					$("#tanNumberEle").blur(function(){
						if($("#tanNumberEle").val() != undefined && $("#tanNumberEle").val() != ""){
							myNod.add({
								selector		: '#tanNumberEle',
								validate		: 'tanNum',
								errorMessage	: "Invalid Tan Number!"
							});
						} else {
							myNod.remove('#tanNumberEle');
						}
					});
					
					$("#emailAddressEle").blur(function() {
						let emailAddressString = $("#emailAddressEle").val();
						
						if(emailAddressString == "" && partyMasterProperties.emailValidation) {
							myNod.add({
								selector		: '#emailAddressEle',
								validate		: ['presence'],
								errorMessage	: ["Email is required"]
							});
						} else if(emailAddressString != "") {
							myNod.add({
								selector		: '#emailAddressEle',
								validate		: ['multipleEmail'],
								errorMessage	: ["Invalid Email Address!"]
							});
						} else {
							myNod.remove('#emailAddressEle');
						}
					});
					
					$("#pincodeEle").blur(function(){
						if($("#pincodeEle").val() != undefined && $("#pincodeEle").val() != ""){
							myNod.add({
								selector		: '#pincodeEle',
								validate		: 'checkForValidNumber:#pincodeEle',
								errorMessage	: "Invalid Number!"
							});
						} else
							myNod.remove('#pincodeEle');
					});
					
					$("#mobileNumber1Ele").blur(function(){
						if($("#mobileNumber1Ele").val() != undefined && $("#mobileNumber1Ele").val() != ""){
							myNod.add({
								selector		: '#mobileNumber1Ele',
								validate		: 'checkForValidNumber:#mobileNumber1Ele',
								errorMessage	: "Invalid Number!"
							});
						} else
							myNod.remove('#mobileNumber1Ele');
					});
					
					$("#phoneNumber1Ele").blur(function(){
						if($("#phoneNumber1Ele").val() != undefined && $("#phoneNumber1Ele").val() != ""){
							myNod.add({
								selector		: '#phoneNumber1Ele',
								validate		: 'checkForValidNumber:#phoneNumber1Ele',
								errorMessage	: "Invalid Number!"
							});
						} else
							myNod.remove('#phoneNumber1Ele');
					});
					
					$("#mobileNumber2Ele").blur(function(){
						if($("#mobileNumber2Ele").val() != undefined && $("#mobileNumber2Ele").val() != ""){
							myNod.add({
								selector		: '#mobileNumber2Ele',
								validate		: 'checkForValidNumber:#mobileNumber2Ele',
								errorMessage	: "Invalid Number!"
							});
						} else
							myNod.remove('#mobileNumber2Ele');
					});
					
					$("#phoneNumber2Ele").blur(function(){
						if($("#phoneNumber2Ele").val() != undefined && $("#phoneNumber2Ele").val() != ""){
							myNod.add({
								selector		: '#phoneNumber2Ele',
								validate		: 'checkForValidNumber:#phoneNumber2Ele',
								errorMessage	: "Invalid Number!"
							});
						} else
							myNod.remove('#phoneNumber2Ele');
					});
					
					$("#billingPersonPhnEle").blur(function(){
						if($("#billingPersonPhnEle").val() != undefined && $("#billingPersonPhnEle").val() != ""){
							myNod.add({
								selector		: '#billingPersonPhnEle',
								validate		: 'checkForValidNumber:#billingPersonPhnEle',
								errorMessage	: "Invalid Number!"
							});
						} else
							myNod.remove('#billingPersonPhnEle');
					});
					
					$("#accountPersonNoEle").blur(function(){
						if($("#accountPersonNoEle").val() != undefined && $("#accountPersonNoEle").val() != ""){
							myNod.add({
								selector		: '#accountPersonNoEle',
								validate		: 'checkForValidNumber:#accountPersonNoEle',
								errorMessage	: "Invalid Number!"
							});
						} else
							myNod.remove('#accountPersonNoEle');
					});
					
					$("#smsRequiredEle").bind("change", function() {
						_this.smsService();
					});
					
					$('#ChargedWeightRoundOffValueEle').append('<option value="0" id="0">--Select RoundOff Value--</option>');

					for(var i = 0; i < chargedWeightRoundOffValueList.length; i++) {
						$('#ChargedWeightRoundOffValueEle').append('<option value="'+chargedWeightRoundOffValueList[i]+'" id="'+chargedWeightRoundOffValueList[i]+'" >'+chargedWeightRoundOffValueList[i]+'</option>');
					}

					masterLangObj 		= FilePath.loadLanguage();
					masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
					
					if(accountPerson) {
						$('#contactPerson').html('Account Person');
						$('#contactPersonEle').attr('placeholder', 'Enter Account Person');
					}
				},uniqueGstNumberValidationMsg : function(response){
					let CorporateAccount 	= response.CorporateAccount;
					
					if(response.isDuplicateGSTN){
						if(data.PartyNameIdentifiers == 4){
							let btModalConfirm = new Backbone.BootstrapModal({
								content		: 	"Party "+CorporateAccount.corporateAccountDisplayName+"("+CorporateAccount.branchName+" Branch ) has been created with the same gst no. plz update the party or configure the same branch for that party.",
								modalWidth 	: 	30,
								title		:	'Duplicate GST Info',
								okText		:	'Ok',
								showFooter 	: 	true,
								okCloses	:	true
							}).open();

							btModalConfirm.on('ok', function() {
								$("#modalDialog").hide();
							});
						} else{
							showMessage('error',response.error);
							$("#gstnEle").focus();
							if(dontAllowSameGstnForNewParty)
								$("#gstnEle").val('');
						}
						allowToSave	= false;
					} else {
						allowToSave	= true;
					}
				},getCorporateAccountForEdit1 : function(){
					_this.getCorporateAccountForEdit(0);
				} ,getCorporateAccountForEdit : function(corporateAccountId) {
					showLayer();
					
					if(corporateAccountId == 0 || corporateAccountId == "" )
						corporateAccountId 	= $("#partyNameSelectorEle_primary_key").val();
					
					if(isGstnAutoComple || corporateAccountId == "")
						corporateAccountId 	= $("#gstNoSelectorEle_primary_key").val();
					
					if(isMobileNoAutoComple && (corporateAccountId == 0 || corporateAccountId == ""))
						corporateAccountId 	= $("#mobileNoSelectorEle_primary_key").val();
					
					var jsonObject 		= new Object();
					jsonObject.corporateAccountId 			= corporateAccountId;
					jsonObject.isSmsRequiredBasedOnParty 	= partyMasterProperties.smsRequired;
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/partyMasterWS/getPartyByCorporateAccountId.do?', _this.setDataInEditTab, EXECUTE_WITH_ERROR);
				
				},setDataInEditTab : function(response) {
					showLayer();
					
					if(response.CorporateAccount == undefined || response.CorporateAccount == null){
						showMessage("error",response.message.description);
						hideLayer();
						
						return false;
					}
					
					var object 		= response.CorporateAccount;
					partySms 		= response.partySmsDetailList;
					
					_this.resetElement();
					$("#editBtn").removeClass("hide");
					corporateAccountId   			= object.corporateAccountId;
					curName   						= object.corporateAccountName;
					isTbb   			 			= object.corporateAccountTBBParty;
					corporateAccountMarkForDelete	= object.corporateAccountMarkForDelete
					
					if(corporateAccountMarkForDelete){
						showMessage("info",'This Party is Deactivated !');
					}
					
					setTimeout(function(){
						//$('#partyNameSelectorEle_primary_key').val(object.corporateAccountId);
						//$('#partyNameSelectorEle').val(object.corporateAccountDisplayName);
						$('#corporateAccountId').val(corporateAccountId);
						$("#regionEle_primary_key").val(object.regionId);
						$("#regionEle").val(object.regionName);
						$("#subRegionEle_primary_key").val(object.subRegionId);
						$("#subRegionEle").val(object.subRegionName);
						$("#branchEle_primary_key").val(object.branchId);
						$("#branch").html('Branch');
						$("#branchEle").val(object.branchName);
						$("#billingBranch").html('Branch');
						$("#billingBranchEle").val(object.billingBranchName);
						$("#billingBranchEle_primary_key").val(object.billingBranchId);
						$("#stateEle_primary_key").val(object.stateId);
						$("#stateEle").val(object.corporateAccountStateName);
						$("#cityEle_primary_key").val(object.cityId);
						$("#cityEle").val(object.corporateAccountCityName);
						$("#partyNameEle").val(object.corporateAccountName);
						$("#partyTypeEle_primary_key").val(object.corporateAccountType);
						$("#partyTypeEle").val(object.corporateAccountTypeName);
						$("#contactPersonEle").val(object.corporateAccountContactPerson);
						$("#departmentEle").val(object.corporateAccountDepartment);
						$("#addressEle").val(object.corporateAccountAddress);
						$("#billingPartyAddressEle").val(object.billingPartyAddress);
						$("#pincodeEle").val(object.corporateAccountPincode);
						$("#phoneNumber1Ele").val(object.corporateAccountPhoneNumber);
						$("#mobileNumber1Ele").val(object.corporateAccountMobileNumber);
						$("#phoneNumber2Ele").val(object.corporateAccountPhoneNumber2);
						$("#mobileNumber2Ele").val(object.corporateAccountMobileNumber2);
						$("#faxNumberEle").val(object.corporateAccountFaxNumber);
						$("#emailAddressEle").val(object.corporateAccountEmailAddress);
						$("#serviceTaxNumberEle").val(object.corporateAccountServiceTaxNumber);
						$("#billingPersonEle").val(object.billingPerson);
						$("#billingPersonPhnEle").val(object.billingPersonNo);
						$("#accountPersonNoEle").val(object.accountPersonNo);
						$("#sourceBranchEle").val(object.sourceBranchName);
						$("#sourceBranchEle_primary_key").val(object.sourceBranchId);
					
						if(object.isParentParty > 0) {
							$("#isParentPartyEle").val('YES');
							$('#partyNameSelectorForParentParty').addClass('hide');
						} else {
							$("#isParentPartyEle").val('NO');
							$('#partyNameSelectorForParentParty').removeClass('hide');
						}
					
						$("#isParentPartyEle_primary_key").val(object.isParentParty);
						$("#partyNameSelectorForParentPartyEle_primary_key").val(object.parentPartyId);
						$("#partyNameSelectorForParentPartyEle").val(object.parentPartyName);
						
						$("#partyBusinessTypeEle_primary_key").val(object.businessTypeId);
						$("#partyBusinessTypeEle").val(object.businessTyepName);
						
						$("#tinNumberEle").val(object.corporateAccountTinNumber);
						$("#panNumberEle").val(object.corporateAccountPanNumber);
						$("#locationEle").val(object.location);
						$("#marketingPersonEle_primary_key").val(object.marketingPersonId);
						$("#marketingPersonEle").val(object.corporateAccountMarketingPersonName);
						$("#remarkEle").val(object.corporateAccountRemark);
						$("#displayNameEle").val(object.corporateAccountDisplayName);
						$("#gstnEle").val(object.gstn);
						$("#partyCodeEle").val(object.partyCode);
						$("#deliveryAtEle_primary_key").val(object.deliveryAt);
						$("#deliveryAtEle").val(object.corporateAccountDeliveryAt);
						$("#isDiscountAllowedEle_primary_key").val(object.discountOnTxnType);
						$("#isDiscountAllowedEle").val(object.discountOnTxnTypeName);
						$("#isBlackListedEle").val(object.blackListedName);
						$("#isBlackListedEle_primary_key").val(object.corporateAccountBlackListed);
						$("#ChargedWeightRoundOffValueEle").val(object.chargedWeightRoundOffValue);
						$("#shortCreditTxnTypeEle_primary_key").val(object.shortCreditAllowOnTxnType);
						$("#shortCreditTxnTypeEle").val(object.shortCreditTxnTypeName);
						$("#rateAllowedOnWeightTypeEle_primary_key").val(object.weightType);
						$("#rateAllowedOnWeightTypeEle").val(object.rateAllowedOnWeightTypeName);
						$("#insuredByEle_primary_key").val(object.corporateAccountInsuredBy);
						$("#insuredByEle").val(object.corporateAccountInsuredByName);
						$("#stPaidByEle_primary_key").val(object.corporateAccountServiceTaxPaidBy);
						$("#tanNumberEle").val(object.corporateAccountTanNumber);
						$("#smsRequiredEle_primary_key").val(object.smsRequiredId);
						$("#smsRequiredEle").val(object.smsRequiredName);
						$("#IsChargedWeightLessEle").val(object.chgwgtLessThanActwgtAllow);
						$("#cftValueEle").val(object.cftValue);
						$("#cftUnitEle").val(object.cftUnitName);
						$("#isTaxTypeEle").val(object.taxTypeName);
						$("#billingPartyNameEle_primary_key").val(object.billingPartyId);
						$("#billingPartyNameEle").val(object.billingPartyName);
						$("#noOfDaysEle").val(object.noOfDays);
						$("#invoiceDueDaysEle").val(object.invoiceDueDays);
						$("#billingPartyAddressEle").val(object.billingPartyAddress);
						$('#lmtStaffEle').val(object.lmtStaffName);
						let dateOption			= new Object();
						$("#issueDateEle").SingleDatePickerCus(dateOption);
						$('#issueDateEle').val(object.issueDateStr);
						$('#letterNoEle').val(object.letterNo);
						
						if(isGstnAutoComple) {
							setTimeout(() => {
								$('#gstNoSelectorEle_primary_key').val(object.corporateAccountId);
								$('#gstNoSelectorEle').val(object.gstn);
								$('#partyNameSelectorEle_primary_key').val(0);
								$("#partyNameSelectorEle").val("");
							}, 200);
						} 

						if(isMobileNoAutoComple && !isGstnAutoComple) {
							setTimeout(() => {
								$('#mobileNoSelectorEle_primary_key').val(object.corporateAccountId);
								$('#mobileNoSelectorEle').val(object.corporateAccountMobileNumber);
								$('#gstNoSelectorEle_primary_key').val(0);
								$('#gstNoSelectorEle').val("");
								$('#partyNameSelectorEle_primary_key').val(0);
								$("#partyNameSelectorEle").val("");
							}, 200);
						}
						
						isGstnAutoComple 	 = false;
						isMobileNoAutoComple = false;
						
						if($('#mappingBranchEle').exists() && $('#mappingBranchEle').is(":visible")){
							var partyBranchMapIds	= response.partyBranchMapIds;
							if(partyBranchMapIds != undefined && typeof partyBranchMapIds != 'undefined'){
								var temp = new Array();
								temp = partyBranchMapIds.split(",");
								$("#mappingBranchEle").val(temp);
							}
						}
						
						$('#isTBBEle').prop('checked', object.corporateAccountTBBParty);
						$('#serviceTaxRequiredEle').prop('checked', object.corporateAccountServiceTaxRequired);
						$('#IsChargedWeightLessEle').prop('checked', object.chgwgtLessThanActwgtAllow);
						$('#isPodRequiredEle').prop('checked', object.podRequired);
						$('#isPodRequiredForInvoiceCreationEle').prop('checked', object.podRequiredForInvoiceCreation);
						$('#chargedWeightRoundOffEle').prop('checked', object.isChargedWeightRound);
						$('#taxPaidByTransporterEle').prop('checked', object.corporateAccountServiceTaxPaidBy);
						$('#isTransporterEle').prop('checked', object.transporter);
						$('#matadiChargesApplicableEle').prop('checked', object.matadiChargesApplicable);
						$('#isExemptedEle').prop('checked', object.exempted);
						
						_this.desabledElement();
						
						if(partyMasterProperties.showEditHistoryButton) {
							_this.showEditHistoryButton();
							
							$("#showHistoryBtn").off("click").on("click", function() {
								_this.getPartyEditHistoryData();
							});
						}
						hideLayer();
					},100);

				},onEdit : function(){
					_this.enabledElement();
					$("#editBtn").addClass("hide");
					$("#updateBtn").removeClass("hide");
					$("#deactivateBtn").removeClass("hide");
					$("#activateBtn").removeClass("hide");
					
					if(corporateAccountMarkForDelete) {
						$('#deactivateBtn').attr('disabled','disabled');
						$('#activateBtn').removeAttr('disabled');
					} else {
						$('#activateBtn').attr('disabled','disabled');
						$('#deactivateBtn').removeAttr('disabled');
					}
				},desabledElement : function() {
					var $inputs = $('#editTab :input');
					var $botton = $('#editTab :button');

					$inputs.each(function() {
						$(this).attr('readOnly', true);
						$(this).attr('autocomplete', 'off');
						$("#partyNameSelectorEle").removeAttr('readOnly');
						$("#gstNoSelectorEle").removeAttr('readOnly');
						$("#mobileNoSelectorEle").removeAttr('readOnly');
					});

					$botton.each(function() {
						$(this).attr("disabled","disabled");
						$("#editBtn").removeAttr('disabled');
					});
					hideLayer();
				},enabledElement : function() {
					var $inputs = $('#editTab :input');
					var $botton = $('#editTab :button');

					$inputs.each(function() {
						$(this).attr('readOnly', false);
						$("#countryEle").attr('readOnly', true);
						$(this).attr('autocomplete', 'on');
					});

					$botton.each(function() {
						$(this).removeAttr("disabled");
						$("#editBtn").removeAttr('disabled');
						$("#updateBtn").removeAttr('disabled');
					});
				},resetElement  : function() {
					var $inputs 	= $('#editTab :input');
					var $botton 	= $('#editTab :button');
					var $checkBox 	= $('#editTab :checkbox');

					$inputs.each(function() {
						if($(this).attr("id") != 'countryEle' &&  $(this).attr("id") != 'countryEle_primary_key' 
							&&  $(this).attr("id") != 'partyNameSelectorEle' &&  $(this).attr("id") != 'partyNameSelectorEle_primary_key'
								&& (!isGstnAutoComple || $(this).attr("id") != 'gstNoSelectorEle' &&  $(this).attr("id") != 'gstNoSelectorEle_primary_key')
								&& (!isMobileNoAutoComple || $(this).attr("id") != 'mobileNoSelectorEle' &&  $(this).attr("id") != 'mobileNoSelectorEle_primary_key')){
							$(this).val('');
						}
					});
					
					$botton.each(function() {
						$(this).removeAttr("disabled");
						$("#editBtn").removeAttr('disabled');
						$("#editBtn").removeClass('hide');
						$("#updateBtn").attr("disabled", "disabled");
						$("#deactivateBtn").attr("disabled", "disabled");
						$("#activateBtn").attr("disabled", "disabled");
					});
					
					$checkBox.each(function() {
						$(this).prop('checked', false);
					});

					hideLayer();
				}, renderPartyMasterViewAllTabElements : function(response) {
					var loadelement 			= new Array();
					var viewAllHtml 			= new $.Deferred();

					loadelement.push(viewAllHtml);
					
					$("#viewAllTab").load("/ivcargo/html/module/partyMaster/partyMasterTabElements/ViewAllTabElements.html", function() {
						viewAllHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						let keyObject 		= Object.keys(response);

						for (const element of keyObject) {
							if (response[element])
								$("*[data-attribute="+ element+ "]").removeClass("hide");
						}

						let elementConfiguration	= new Object();
							
						elementConfiguration.regionElement		= $('#regionEle');
						elementConfiguration.subregionElement	= $('#subRegionEle');
						elementConfiguration.branchElement		= $('#branchEle');
						elementConfiguration.dateElement		= $('#dateEle');

						response.elementConfiguration		= elementConfiguration;
						response.isCalenderSelection		= response.showDateSelectionForViewAllParty;
						
						Selection.setSelectionToGetData(response);
						
						if($("#branchEle_primary_key").val() == undefined && response.branchList != undefined) {
							
							for(const element of response.branchList) {
								if(element.branchId == response.executive.branchId)
									branchName = element.branchName;
							}
							
							$('*[data-attribute=branch').append("<label class='control-label' style='width:50%;font-size:15px;'><span id='branch'>Branch : "+branchName+"</span></label>");
						}
						
						myNod = Selection.setNodElementForValidation(response);
						
						if (response.showDownloadToExcelForViewAllParty)
							$('#generateExcel').removeClass('hide');
						else
							$('#generateExcel').remove();
						
						$("*[data-attribute='region']").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						$("*[data-attribute='subRegion']").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						$("*[data-attribute='branch']").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						
						$("#searchBtn").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid'))
								_this.onSearchSubmit(response);							
						});
						
						if(response.showDownloadToExcelForViewAllParty){
							$("#generateExcel").click(function() {
								myNod.performCheck();
								
								if (myNod.areAll('valid'))
									_this.generateExcelNew();	
							});
						}
					});
				},onSearchSubmit() {
					showLayer();
					let jsonObject = Selection.getElementData();
					jsonObject.isExcel	= false;
					jsonObject.fromDate = '';
					jsonObject.toDate 	= '';

					getJSON(jsonObject, WEB_SERVICE_URL + '/partyMasterWS/getPartyMasterViewAllPartyDetails.do?',_this.setPartyDetails, EXECUTE_WITH_ERROR);
				},setPartyDetails : function(response) {
					$("#partyDetailsDiv").empty();

					if(response.message != undefined) {
						hideLayer();
						$('#middle-border-boxshadow').addClass('hide');

						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
						return;
					}

					if(response.PartyDetails != undefined) {
						let corporateAccountColumnConfig 	 = response.PartyDetails.columnConfiguration;
						let corporateAccountColumnKeys		 = _.keys(corporateAccountColumnConfig);
						
						let corporateAccountConfig			 = new Object();
						
						response.PartyDetails.tableProperties.showDeleteButton = response.allowToDeleteParty;
						
						for (const element of corporateAccountColumnKeys) {
							let bObj	= corporateAccountColumnConfig[element];

							if(bObj != null && bObj.show)
								corporateAccountConfig[element] = bObj;
						}

						response.PartyDetails.columnConfiguration	= corporateAccountConfig;
						response.PartyDetails.Language				= masterLangKeySet;
						response.PartyDetails.tableProperties.callBackFunctionForDelete 	= _this.deleteParty;
					}

					if(response.PartyDetails != undefined && response.PartyDetails.CorporateAccount != undefined) {
						$('#middle-border-boxshadow').removeClass('hide');
						hideAllMessages();
						slickGridWrapper2.setGrid(response.PartyDetails);
					} else
						$('#middle-border-boxshadow').addClass('hide');

					hideLayer();
				},generateExcelNew() {
					showLayer();
					let jsonObject = Selection.getElementData();
					jsonObject.isExcel	= true;

					getJSON(jsonObject, WEB_SERVICE_URL + '/partyMasterWS/getPartyMasterViewAllPartyDetails.do?',_this.responseForExcel, EXECUTE_WITH_ERROR);
				}, responseForExcel : function(data) {
					let errorMessage = data.message;
					
					if(errorMessage.messageId == 21 || errorMessage.messageId == 491) {
						hideLayer();
						return false;
					}
					
					hideLayer();
						
					generateFileToDownload(data);
				}, deleteParty : function(grid, dataView, args,e) {
					hideLayer();
					var row = args.row;
					
					if(dataView.getItem(row).corporateAccountId != undefined) {
						var corporateAccountId = dataView.getItem(row).corporateAccountId;
						_this.onDelete(corporateAccountId,dataView,grid,args,e);
					}
				},renderPartyMasterCustomerAccessTab : function(response) {
					let loadelement = new Array();
					let baseHtml = new $.Deferred();
					loadelement.push(baseHtml);
					
					$("#customerAccessTab").load("/ivcargo/html/module/partyMaster/partyMasterTabElements/customerAccess.html",
							function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						let keyObject = Object.keys(response);
						
						for (const element of keyObject) {
							if (!response[element].show)
								$("*[data-attribute="+ element+ "]").addClass("hide");
						}
						
						_this.setTabForCustomerAccessCreate(jsonObject);
					});
				}, setTabForCustomerAccessCreate : function(jsonObject) {
					getJSON(jsonObject, WEB_SERVICE_URL + '/partyMasterWS/getPartyMasterCustomerAccessCreateTabElements.do?',	_this.renderCustomerAccessTabElement, EXECUTE_WITHOUT_ERROR);
				}, renderCustomerAccessTabElement : function(response) {
					let loadelement = new Array();
					let addNewEditHtml = new $.Deferred();
					loadelement.push(addNewEditHtml);
					
					if (tab == "createTab") {
						$("#addNewAccess").load("/ivcargo/html/module/partyMaster/partyMasterTabElements/addNew-EditCustomerAccess.html",
								function() {
							addNewEditHtml.resolve();
						});
					}
					if (tab == "editTab") {
						$("#editAccess").load("/ivcargo/html/module/partyMaster/partyMasterTabElements/addNew-EditCustomerAccess.html",
								function() {
							addNewEditHtml.resolve();
						});
					}
					
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
					
						let keyObject = Object.keys(response);
					
						for (const element of keyObject) {
							if (response[element].show)
								$("#"+ element+ "").attr("data-selector",element);
						}
					
						loadLanguageWithParams(FilePath.loadLanguage());
					
						let partyNameAutoComplete = new Object();
						partyNameAutoComplete.primary_key = 'corporateAccountId';
						partyNameAutoComplete.field = 'corporateAccountDisplayName';
						
						if (tab == "createTab") {
							partyNameAutoComplete.url = WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocomplete.do';
							partyNameAutoComplete.callBack = onPartySelectSelect;
						}
						
						if (tab == "editTab") {
							partyNameAutoComplete.url = response.CustomerAccess;
							partyNameAutoComplete.callBack = getDataForEdit;
						}
						
						$("#partyNameEle").autocompleteCustom(partyNameAutoComplete);

						if (tab == "editTab") {
							$("#editBtnCA").removeClass("hide");
							$("#saveBtnCA").addClass("hide");
							$("#editBtnCA").click(function() {onEditCA();});
						}

						$('#editCA').on('click',function() {
							tab = "editTab";
							$("#addNewAccess").empty();
							_this.setTabForCustomerAccessEdit(jsonObject);
						});

						$('#addCA').on('click',function() {
							tab = "createTab";
							$("#editAccess").empty();
							_this.setTabForCustomerAccessCreate(jsonObject);
						});
						
						$("#saveBtnCA").click(function() {
							onSubmitCA();
						});
						
						$("#updateBtnCA").click(function() {
							onUpdateCA();
						});
					});
				}, setTabForCustomerAccessEdit : function(jsonObject) {
					getJSON(jsonObject, WEB_SERVICE_URL + '/partyMasterWS/getPartyMasterCustomerAccessEditTabElements.do?',	_this.renderCustomerAccessTabElement, EXECUTE_WITHOUT_ERROR);
				}, setTabForCustomerAccess : function(jsonObject) {
					getJSON(jsonObject, WEB_SERVICE_URL + '/partyMasterWS/getPartyMasterCustomerAccessTab.do?',	_this.renderPartyMasterCustomerAccessTab, EXECUTE_WITHOUT_ERROR);
				}, setDataForInsertUpdate : function(jsonObject, inputs) {
					inputs.each(function() {
						if ($(this).val() != "") {
							if($(this).attr('name') == 'partyNameEle' || $(this).attr('name') == 'displayNameEle')
								jsonObject[$(this).attr('name')] = $.trim($(this).val().toUpperCase());
							else
								jsonObject[$(this).attr('name')] = $.trim($(this).val());
						}
					});
					
					jsonObject["regionId"] 							= $('#regionEle_primary_key').val();
					jsonObject["subRegionId"] 						= $('#subRegionEle_primary_key').val();
					jsonObject["branchEle"] 						= $('#branchEle_primary_key').val();
					jsonObject["stateEle"] 							= $('#stateEle_primary_key').val();
					jsonObject["cityEle"] 							= $('#cityEle_primary_key').val();
					jsonObject["countryEle"] 						= $('#countryEle').val();
					jsonObject["countryId"] 						= $('#countryEle_primary_key').val();
					jsonObject["smsRequiredId"] 					= $('#smsRequiredEle_primary_key').val();
					jsonObject["BillingPartyId"]					= $('#billingPartyNameEle_primary_key').val();
					jsonObject["billingPartyName"]					= $('#billingPartyNameEle').val();
				
					if($("#marketingPersonEle_primary_key") != undefined)
						jsonObject["marketingPersonId"] 			= $('#marketingPersonEle_primary_key').val();
					else
						jsonObject["marketingPersonId"] 			= 0;
				
					if($('#mappingBranchEle').exists() && $('#mappingBranchEle').is(":visible")){
						var selO = document.getElementsByName('mappingBranchEle')[0];
					   
						var selValues = [];
					    
					    for(var i=0; i < selO.length; i++){
					        if(selO.options[i].selected)
					            selValues.push(selO.options[i].value);
					    }
					    
						jsonObject["mappingBranchIds"]					= selValues.join();
					
					}

					jsonObject.isTBBEle								= $('#isTBBEle').is(':checked');
					jsonObject.serviceTaxRequiredEle				= $('#serviceTaxRequiredEle').is(':checked');
					jsonObject.IsChargedWeightLessEle				= $('#IsChargedWeightLessEle').is(':checked');
					jsonObject.isPodRequiredEle						= $('#isPodRequiredEle').is(':checked');
					jsonObject.isPodRequiredForInvoiceCreationEle	= $('#isPodRequiredForInvoiceCreationEle').is(':checked');
					jsonObject.chargedWeightRoundOffEle				= $('#chargedWeightRoundOffEle').is(':checked');
					jsonObject.taxPaidByTransporterEle				= $('#taxPaidByTransporterEle').is(':checked');
					jsonObject.smsConfiguredInfo					= smsServiceInfo;
					jsonObject.isParentPartyEle						= $('#isParentPartyEle_primary_key').val();
					jsonObject.parentPartyId						= $('#partyNameSelectorForParentPartyEle_primary_key').val();
					jsonObject.businessTypeId						= $('#partyBusinessTypeEle_primary_key').val();
					jsonObject.matadiChargesApplicableEle			= $('#matadiChargesApplicableEle').is(':checked');
					jsonObject.isTransporterEle						= $('#isTransporterEle').is(':checked');
					jsonObject.isExemptedEle						= $('#isExemptedEle').is(':checked');
					jsonObject.cftUnit								= $('#cftUnitEle').val();
					jsonObject.isTaxTypeEle							= $('#isTaxTypeEle_primary_key').val();
					jsonObject.billingBranchEle						= $('#billingBranchEle_primary_key').val();
					jsonObject.sourceBranchEle   					= $("#sourceBranchEle_primary_key").val();
					jsonObject.lmtStaffName							= $('#lmtStaffEle').val();
					jsonObject.letterNo								= $('#letterNoEle').val();
					jsonObject.issueDate							= $('#issueDateEle').val();
					
					let email = $('#emailAddressEle').val();
					
					if(email != undefined && email != '') {
						if(email.charAt(email.length - 1) == ',')
							email = email.slice(0, email.length - 1);
						
						let emailString = email.replace(/\s/g, "");
						jsonObject.emailAddressEle	= emailString;
					}
				}, onSubmit	 : function() {

					if($('#partyNameEle').val() == '' || $('#partyNameEle').val() == ' ') {
						showMessage('error', 'Please Enter Valid Party Name !');
						return false;
					}
					
					if($('#displayNameEle').val() == '' || $('#displayNameEle').val() == ' ') {
						showMessage('error', 'Please Enter Valid Display Name !');
						return false;
					}

					jsonObject = new Object();
					var inputs = $('#addNewTab :input');

					_this.setDataForInsertUpdate(jsonObject, inputs);
					
					var btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure, you want to save the Party ?",
						modalWidth 	: 	30,
						title		:	'Save Party',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();

					btModalConfirm.on('ok', function() {
						showLayer();
						getJSON(jsonObject, WEB_SERVICE_URL + '/partyMasterWS/addNewParty.do?',_this.afterSave, EXECUTE_WITH_ERROR);
						_this.resetElement();
						hideLayer();
					});
				}, afterSave  : function(response) {
					if(response.CorporateAccountId == undefined || response.CorporateAccountId <= 0){
						showMessage("error",response.message.description)
						return false;
					}
					
					corporateAccountId = response.CorporateAccountId;
					if(response.redirectOnAddPartyPanel){
						setTimeout(() => {
							$("#add").trigger("click");
						}, 700);
					}else{
						$("#edit").trigger("click");	
					}
					
					$("#updateBtn").removeClass("hide");
					$("#partyNameSelectorEle_primary_key").val(corporateAccountId);
					$("#corporateAccountId").val(corporateAccountId);
					_this.getCorporateAccountForEdit(corporateAccountId);

				}, onUpdate : function() {
						myNod.add({
						selector		: '#partyNameSelectorEle',
						validate		: 'validateAutocomplete:#partyNameSelectorEle_primary_key',
						errorMessage	: 'Please Select Party Name'
					});
						
					if($('#partyNameEle').val() == '' || $('#partyNameEle').val() == ' ') {
						showMessage('error', 'Please Enter Valid Party Name !');
						return false;
					}
					
					if($('#displayNameEle').val() == '' || $('#displayNameEle').val() == ' ') {
						showMessage('error', 'Please Enter Valid Display Name !');
						return false;
					}
					
					jsonObject = new Object();

					var inputs = $('#editTab :input');
					
					if($('#corporateAccountId').val() != 0)
						jsonObject.corporateAccountId 			= $('#corporateAccountId').val();
					else
						jsonObject.corporateAccountId 			= $('#partyNameSelectorEle_primary_key').val();
						
					_this.setDataForInsertUpdate(jsonObject, inputs);
					
					jsonObject.currrentName							= curName;
					jsonObject.isTbbNew								= isTbb;
					
					var btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure, you want to update the Party ?",
						modalWidth 	: 	30,
						title		:	'Update Party',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();

					btModalConfirm.on('ok', function() {
						getJSON(jsonObject, WEB_SERVICE_URL + '/partyMasterWS/updatePartyMaster.do?',_this.afterUpdate, EXECUTE_WITH_ERROR);
						showLayer();
					});

				},afterUpdate : function(response) {
					if(response.message != undefined && response.message.type == 2){
						showMessage("error",response.message.description);
						hideLayer();
						return false;
					}
					$("#viewAll").trigger("click");
					_this.resetElement();
					hideLayer();
				},onDelete  : function(corporateAccountId, dataView, grid, args, e){
					jsonObject = new Object();
					
					if(corporateAccountId == null || corporateAccountId == 0 || corporateAccountId == '')
						corporateAccountId 		= $('#partyNameSelectorEle_primary_key').val();
					
					if(corporateAccountId == null || corporateAccountId == 0 || corporateAccountId == '')
						corporateAccountId 		= $('#corporateAccountId').val();
					
					jsonObject.corporateAccountId 		= corporateAccountId
					
					var btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure, you want to Delete the Party ?",
						modalWidth 	: 	30,
						title		:	'Delete Party',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();

					btModalConfirm.on('ok', function() {
						showLayer();
						if(grid != null){
							_this.afterDeleteParty(dataView,grid,args,e);
						}
						getJSON(jsonObject, WEB_SERVICE_URL + '/partyMasterWS/deleteSingleParty.do?',_this.afterDelete, EXECUTE_WITH_ERROR);
						
					});
					
				},afterDelete  :  function(){
					$("#partyNameSelectorEle").val('');
					$("#partyNameSelectorEle_primary_key").val('0');
					$("#corporateAccountId").val(0);
					_this.resetElement();
					hideLayer();
				},afterDeleteParty  :  function(dataView,grid,args,e){
					var cell = grid.getCellFromEvent(e);
					if (grid.getColumns()[cell.cell].id == "DeleteButton") {
						dataView.deleteItem(dataView.getItem(args.row).id);
						grid.invalidate();

					}
					hideLayer();
				},validateField : function() {
						if (partyMasterProperties.branchValidation){
							myNod.add({
								selector		: '#branchEle',
								validate		: 'validateAutocomplete:#branchEle_primary_key',
								errorMessage	: "Please Select Branch"
							});
							$("*[data-attribute=branch]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						}
						
							myNod.add({
								selector		: '#partyNameEle',
								validate		: 'presence',
								errorMessage	: "Please Enter Name"
							});
							$("*[data-attribute=partyName]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
							myNod.add({
								selector		: '#partyTypeEle',
								validate		: 'validateAutocomplete:#partyTypeEle_primary_key',
								errorMessage	: "Please Select Party Type"
							});
							$("*[data-attribute=partyType]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						 
							myNod.add({
								selector		: '#addressEle',
								validate		: 'presence',
								errorMessage	: "Please Enter Address"
							});
							$("*[data-attribute=address]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						
						 if (partyMasterProperties.contactPersonValidation){
							myNod.add({
								selector		: '#contactPersonEle',
								validate		: 'presence',
								errorMessage	: "Enter Contact Person"
							});
							$("*[data-attribute=contactPerson]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						} 
						 if (partyMasterProperties.stateValidation){
							myNod.add({
								selector		: '#stateEle',
								validate		: 'validateAutocomplete:#stateEle_primary_key',
								errorMessage	: "Please Select State "
							});
							$("*[data-attribute=state]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						} 
						// if (partyMasterProperties.cityValidation){
							myNod.add({
								selector		: '#cityEle',
								validate		: 'validateAutocomplete:#cityEle_primary_key',
								errorMessage	: "Please Select City "
							});
							$("*[data-attribute=city]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						//}
						 if (partyMasterProperties.pincodeValidation){
							myNod.add({
								selector		: '#pincodeEle',
								validate		: ['presence','min-length:6'],
								errorMessage	: ["Please Enter Pincode Properly",'minimum  6 numbers']
							});
							$("*[data-attribute=pincode]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						}
						
						if (partyMasterProperties.phoneValidation) {
							myNod.add({
								selector		: '#phoneNumber1Ele',
								validate		: ['presence','min-length:10'],
								errorMessage	: ["Enter Phone Number Properly",'Min Length should be 10']
							});
							$("*[data-attribute=phoneNumber1]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						}
						
						if (partyMasterProperties.mobileValidation) {
							myNod.add({
								selector		: '#mobileNumber1Ele',
								validate		: ['presence','min-length:10','max-length:10'],
								errorMessage	: ['Can Not Be blank',"Enter Mobile Number Properly",'Max Length should be 10']
							});
							$("*[data-attribute=mobileNumber1]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						}
						
						if (emailAddress && partyMasterProperties.emailValidation) {
							myNod.add({
								selector		: '#emailAddressEle',								
								validate		: ['presence'],
								errorMessage	: ["Email is required"]
							});
														
							$("*[data-attribute=emailAddress]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						}
						
						if(emailAddress) {
							myNod.add({
								selector		: '#emailAddressEle',								
								validate		: 'multipleEmail',
								errorMessage	: "Enter Email Address Properly"
							});
						}
													
						 if (tinNumber && partyMasterProperties.tinNumberValidation) {
							myNod.add({
								selector		: '#tinNumberEle',
								validate		: 'presence',
								errorMessage	: "Please Enter Tin Number Properly"
							});
							$("*[data-attribute=tinNumber]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						}
						
						if (partyMasterProperties.panNumberValidation) {
							myNod.add({
								selector		: '#panNumberEle',
								validate		: 'panNum',
								errorMessage	: "Please Enter Pan Number Properly"
							});
							$("*[data-attribute=panNumber]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						}
						
						if (partyMasterProperties.departmentValidation) {
							myNod.add({
								selector		: '#departmentEle',
								validate		: 'presence',
								errorMessage	: "Enter department"
							});
							$("*[data-attribute=department]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						}
						
						if (partyMasterProperties.phoneNumber2Validation) {
							myNod.add({
								selector		: '#phoneNumber2Ele',
								validate		: ['presence','min-length:10','max-length:11'],
								errorMessage	: ['Can Not Be blank',"Enter Phone Number2 Properly",'Max Length should be 11']
							});
							$("*[data-attribute=phoneNumber2]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						}
						 if (partyMasterProperties.mobileNumber2Validation) {
							myNod.add({
								selector		: '#mobileNumber2Ele',
								validate		: ['presence','min-length:10','max-length:10'],
								errorMessage	: ['Can Not Be blank',"Enter Mobile Number2 Properly",'Max Length should be 10']
							});
							$("*[data-attribute=mobileNumber2]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						}
						 if (partyMasterProperties.faxNumberValidation) {
							myNod.add({
								selector		: '#faxNumberEle',
								validate		: 'presence',
								errorMessage	: "Enter Fax Number"
							});
							$("*[data-attribute=faxNumber]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						}
						 if (partyMasterProperties.locationValidation) {
							myNod.add({
								selector		: '#locationEle',
								validate		: 'presence',
								errorMessage	: "Enter Location Person"
							});
							$("*[data-attribute=location]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						}
						 if (partyMasterProperties.marketingPersonValidation) {
							myNod.add({
								selector		: '#marketingPersonEle',
								validate		: 'presence',
								errorMessage	: "Enter Marketing Person"
							});
							$("*[data-attribute=marketingPerson]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						}
						 if (partyMasterProperties.serviceTaxNumberValidation) {
							myNod.add({
								selector		: '#serviceTaxNumberEle',
								validate		: 'presence',
								errorMessage	: "Enter Service Tax"
							});
							$("*[data-attribute=serviceTaxNumber]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						}
						 if (partyMasterProperties.remarkValidation) {
							myNod.add({
								selector		: '#remarkEle',
								validate		: 'presence',
								errorMessage	: "Enter Remark"
							});
							$("*[data-attribute=remark]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						}
						 if (partyMasterProperties.blackListedValidation) {
							myNod.add({
								selector		: '#isBlackListedEle',
								validate		: 'validateAutocomplete:#isBlackListedEle_primary_key',
								errorMessage	: "Select Black List On"
							});
							$("*[data-attribute=isBlackListed]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						}
						 if (partyMasterProperties.isDiscountAllowedValidation) {
							myNod.add({
								selector		: '#isDiscountAllowedEle',
								validate		: 'validateAutocomplete:#isDiscountAllowedEle_primary_key',
								errorMessage	: "Select Dicount On"
							});
							$("*[data-attribute=isDiscountAllowed]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						}
						 if (partyMasterProperties.deliveryAtValidation) {
							myNod.add({
								selector		: '#deliveryAtEle',
								validate		: 'validateAutocomplete:#deliveryAtEle_primary_key',
								errorMessage	: "Select Delivery At"
							});
							$("*[data-attribute=deliveryAt]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						}
						
						myNod.add({
							selector		: '#displayNameEle',
							validate		: 'presence',
							errorMessage	: "Enter Display Name"
						});
						$("*[data-attribute=displayName]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						
						 if (partyMasterProperties.partyCodeValidation) {
							myNod.add({
								selector		: '#partyCodeEle',
								validate		: 'presence',
								errorMessage	: "Enter Party code"
							});
							$("*[data-attribute=partyCode]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						}
						 if (partyMasterProperties.gstnValidation) {
							 myNod.add({
								selector		: '#gstnEle',
								validate		: 'presence',
								errorMessage	: "Enter GST Number"
							});
							
							myNod.add({
								selector		: '#gstnEle',
								validate		: 'gstNum',
								errorMessage	: "Enter Proper GSTN"
							});
							$("*[data-attribute=gstn]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						}
						 if (partyMasterProperties.insuredByValidation) {
							myNod.add({
								selector		: '#insuredByEle',
								validate		: 'validateAutocomplete:#insuredByEle_primary_key',
								errorMessage	: "Select Insured By"
							});
							$("*[data-attribute=insuredBy]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						}
						 if (partyMasterProperties.stPaidByValidation) {
							myNod.add({
								selector		: '#stPaidByEle',
								validate		: 'validateAutocomplete:#stPaidByEle_primary_key',
								errorMessage	: "Select ST Paid By"
							});
							$("*[data-attribute=stPaidBy]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						}
						 if (partyMasterProperties.rateAllowedOnWeightTypeValidation) {
							myNod.add({
								selector		: '#rateAllowedOnWeightTypeEle',
								validate		: 'validateAutocomplete:#rateAllowedOnWeightTypeEle_primary_key',
								errorMessage	: "Select Rate On Weight Type"
							});
							$("*[data-attribute=rateAllowedOnWeightType]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						} if (partyMasterProperties.shortCreditTxnTypeValidation) {
							myNod.add({
								selector		: '#shortCreditTxnTypeEle',
								validate		: 'validateAutocomplete:#shortCreditTxnTypeEle_primary_key',
								errorMessage	: "Select Short Credit Txn Type"
							});
							$("*[data-attribute=shortCreditTxnType]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						} if (partyMasterProperties.ChargedWeightRoundOffValueValidation) {
							myNod.add({
								selector		: '#ChargedWeightRoundOffValueEle',
								validate		: 'presenceIfNotDisable',
								errorMessage	: "Enter ChargeWeight RoundOff Value"
							});
						} if (partyMasterProperties.tanNumberValidation){
							myNod.add({
								selector		: '#tanNumberEle',
								validate		: 'tanNum',
								errorMessage	: "Please Enter Tan Number Properly"
							});
							$("*[data-attribute=tanNumber]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						} if (partyMasterProperties.cftValueValidation){
							myNod.add({
								selector		: '#cftValueEle',
								validate		: 'presence',
								errorMessage	: "Enter Cft Value"
							});
							$("*[data-attribute=cftValue]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						} 
						if (partyMasterProperties.taxTypeValidation){
							myNod.add({
								selector		: '#isTaxTypeEle',
								validate		: 'validateAutocomplete:#isTaxTypeEle_primary_key',
								errorMessage	: "Please Select Tax Type"
							});
							$("*[data-attribute=isTaxType]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
						}
					
					if (partyMasterProperties.billingPersonValidation ){
						myNod.add({
							selector		: '#billingPersonEle',
							validate		: 'presence',
							errorMessage	: "Please Enter Billing Person"
						});
						$("*[data-attribute=billingPerson]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
					} 
					
					if (partyMasterProperties.billingPersonPhnValidation) {
						myNod.add({
							selector		: '#billingPersonPhnEle',
							validate		: ['presence','min-length:10','max-length:11'],
							errorMessage	: ['Can Not Be blank','Max Length should be 11']
						});
						$("*[data-attribute=billingPersonPhn]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
					}
					
					if (partyMasterProperties.accountPersonNoValidation) {
						myNod.add({
							selector		: '#accountPersonNoEle',
							validate		: ['presence','min-length:10','max-length:11'],
							errorMessage	: ['Can Not Be blank','Max Length should be 11']
						});
						$("*[data-attribute=accountPersonNo]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
					}
				}, validateGSTAutocomplete : function(){
					if(!validateInputTextFeild(9, 'gstNoSelectorEle', 'gstNoSelectorEle', 'info', gstnErrMsg)) {
						myNod.add({
							selector		: '#gstNoSelectorEle',
							validate		: 'gstNum',
							errorMessage	: "Invalid GST Number!"
						});
						$("#gstNoSelectorEle").focus();
						allowToSave	= false;
						return false;
					}
				}, validateMobileNoAutocomplete : function(){
					if(!validateInputTextFeild(2, 'mobileNoSelectorEle', 'mobileNoSelectorEle', 'info', 'Can Not Be blank Mobile No, Max Length should be 10 !')) {
						myNod.add({
							selector		: '#mobileNoSelectorEle',
							validate		: 'presence',
							errorMessage	: "Invalid Mobile Number!"
						});
						$("#mobileNoSelectorEle").focus();
						allowToSave	= false;
						return false;
					}
				}, validateLengthOfGSTNumber : function(checkGSTNumberForUnique){
					if(!validateInputTextFeild(9, 'gstnEle', 'gstnEle', 'info', gstnErrMsg)) {
						myNod.add({
							selector		: '#gstnEle',
							validate		: 'gstNum',
							errorMessage	: "Invalid GST Number!"
						});
						$("#gstnEle").focus();
						allowToSave	= false;
						return false;
					} else {
						if(!partyMasterProperties.gstnValidation)
							myNod.remove('#gstnEle');
						
						if($('#gstnEle').val() != undefined && $('#gstnEle').val() != ''){
							if(dontAllowSameGstnForNewParty)
								_this.checkGSTNumberForUniqueCheck();
							else if($('#isTBBEle').is(":checked") || (typeof isTbb != 'undefined' && isTBB != undefined && isTBB == true)) {
								if(doNotCheckDuplicateGstNumberForTbbParty)
									allowToSave	= true;
								else if(checkGSTNumberForUnique)
									_this.checkGSTNumberForUniqueCheck();
								else
									allowToSave	= true;
							} else if(checkGSTNumberForUnique)
								_this.checkGSTNumberForUniqueCheck();
							else
								allowToSave	= true;
						} else
							allowToSave	= true;
					}
				},checkGSTNumberForUniqueCheck : function(){
					
					var GSTN 			= $("#gstnEle").val();
					var jsonObject 		= new Object();
					jsonObject.gstNumber 			= GSTN;
					jsonObject.corporateAccountId 	= $('#partyNameSelectorEle_primary_key').val();
					jsonObject.filter				= 1;
					getJSON(jsonObject, WEB_SERVICE_URL + '/partyMasterWS/checkUniqueGstNumber.do?', _this.uniqueGstNumberValidationMsg, EXECUTE_WITH_ERROR);
				},smsService : function(){
					var object 				= new Object();
					var smsService = new Array()
					object.smsEventList 	= smsEventList;
					object.partySms			= partySms;
					var smservice	= $('#smsRequiredEle_primary_key').val();
					if(smservice > 0) {
						var btModalConfirm = new Backbone.BootstrapModal({
							content		: 	new SmsService(object),
							modalWidth 	: 	70,
							title		:	'SMS Service',
							okText		:	'YES',
							showFooter 	: 	true,
							okCloses	:	true
						}).open();
						
						btModalConfirm.on('ok', function() {
							jsonObject 	= new Object();
							
							for(const element of smsEventList) {
								let smsEvent		= new Object();
								smsEvent.waybillStastus	= element.smsEventId;

								if($('#smsEvent_' + element.smsEventId).is(":checked"))
									smsEvent.sentTo			= $('#sentTo_' + element.smsEventId).val();
								else
									smsEvent.sentTo			= 0;
								
								smsService.push(smsEvent);
							}
							
							smsServiceInfo	= JSON.stringify(smsService);
							
						});
					}
				}, afterActivate : function(){
					$("#deactivateBtn").removeAttr('disabled');
					$("#activateBtn").attr("disabled", "disabled");
				},setParentPartyDiv : function(){
					if(Number($('#isParentPartyEle_primary_key').val()) == 0){
						$('#partyNameSelectorForParentParty').addClass('hide');
						$('#partyNameSelectorForParentPartyEle_primary_key').val(0);
						$('#partyNameSelectorForParentPartyEle').val('');
					}else{
						$('#partyNameSelectorForParentParty').removeClass('hide');
					}
				},renderPartyConfigurantion : function(response) {
					var loadelement 			= new Array();
					var viewAllHtml 			= new $.Deferred();
					loadelement.push(viewAllHtml);
					
					$("#partyConfigTab").load("/ivcargo/html/module/partyMaster/partyMasterTabElements/PartyConfigrationTabElements.html", function() {
						viewAllHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						masterLangObj 		= FilePath.loadLanguage();
						masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
						let keyObject 		= Object.keys(response);

						for (const element of keyObject) {
							if (!response[element].show)
								$("*[data-attribute="+ element+ "]").addClass("hide");
							
							if (response[element].show)
								$("#"+ element+ "").attr("data-selector", element);
						}
						
						billingBranchesMap			= response.billingBranchesMap.show;
						isInvoiceDueDays			= response.invoiceDueDays.show;
							
						if (response.riskCoverage.show)
							$('.riskCoverageDiv').removeClass('hide');
						else
							$('.riskCoverageDiv').remove();

						let partyNameAutoComplete 				= new Object();
						partyNameAutoComplete.primary_key 		= 'corporateAccountId';
						partyNameAutoComplete.url 				= WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocomplete.do?';
						partyNameAutoComplete.field 			= 'corporateAccountDisplayName';
						partyNameAutoComplete.callBack 			= _this.getPartyConfigData;
						$("#searchpartyNameSelectorEle").autocompleteCustom(partyNameAutoComplete);
						
						$("#isAllowLimitAmountEle").click(function() {
							if($('#isAllowLimitAmountEle').is(':checked'))
								$('.limitAmountDiv').removeClass('hide');
							else {
								$('#limitAmountEle').val(0);
								$('.limitAmountDiv').addClass('hide');
							}
						});
						
						if(billingBranchesMap) {
							SelectizeWrapper.setAutocomplete({
								jsonResultList	: 	physicalbranchList,
								valueField		:	'branchId',
								labelField		:	'branchName',
								searchField		:	'branchName',
								elementId		:	'multipleBillingBranchesEle',
								create			: 	false,
								maxItems: partyMasterProperties.selectSingleBillingBranch ? 1 : physicalbranchList.length // Dynamically set maxItems
							});
						}
						
						myNod3 = nod();
					
						myNod3.configure({
							parentClass:'validation-message'
						});
					
						myNod3.add({
							selector		: '#searchpartyNameSelectorEle',
							validate		: 'validateAutocomplete:#searchpartyNameSelectorEle_primary_key',
							errorMessage	: 'Please Select Party Name'
						});
						
						myNod3.add({
							selector		: '#commissionEle',
							validate		: 'checkForValidNumber:#commissionEle',
							errorMessage	: 'Please Enter Valid Amount'
						});
						
						myNod3.add({
							selector		: '#limitAmountEle',
							validate		: 'checkForValidNumber:#limitAmountEle',
							errorMessage	: 'Please Enter Valid Amount'
						});
						
						$("#saveBtn").click(function(){
							myNod3.performCheck();
							
							if(myNod3.areAll('valid'))
								_this.onSave();
						});
					});
				}, resetPartyConfig : function() {
					$('#isShowZeroAmountInLRPrint').prop('checked', false);
					$('#searchpartyNameSelectorEle_primary_key').val(0);
					$('#searchpartyNameSelectorEle').val('');
					$('#ischargedWtEle').attr('checked', false);
					$('#isAllowPartyWiseExcelEle').attr('checked', false);
					$('#isAllowLrPdfMailEle').attr('checked', false);
					$('#isAllowCrPdfMailEle').attr('checked', false);
					$('#isAllowLimitAmountEle').attr('checked', false);
					$('#chargeInclusiveEle').attr('checked', false);
					$('#commissionEle').val(0);
					$('#isValidPartyGstn').attr('checked', false);
					$('#invoiceDueDaysEle').val(0);
					$('#deviationEle').val(0);
					$('#deductionEle').val(0);
					$('#isValidateInvoiceNo').attr('checked', false);
					$('#isValidatePartNumber').attr('checked', false);
					$('#multipleBillingBranchesEle')[0].selectize.clear();
					
					_this.showHideLimitAmount(false);
				}, onSave : function() {
					if($('#isAllowLimitAmountEle').is(':checked') && $('#limitAmountEle').val() == 0) {
						changeTextFieldColor('limitAmountEle', '', '', 'red');
						showMessage('error', 'Please Enter Limit Amount!');
						return;
					}
					
					if(!confirm('Are you sure ?'))
						return;
					
					let jsonObject 		= new Object();
					
					jsonObject.corporateAccountId 		= $('#searchpartyNameSelectorEle_primary_key').val();
					jsonObject.isChargedWtAllowOnCR		= $('#ischargedWtEle').is(':checked');
					jsonObject.isAllowOnAccountPayment	= $('#isAllowOnAccountPaymentEle').is(':checked');
					jsonObject.isAllowPartyWiseExcel	= $('#isAllowPartyWiseExcelEle').is(':checked');
					jsonObject.isAllowLrPdfMail			= $('#isAllowLrPdfMailEle').is(':checked');
					jsonObject.isAllowCrPdfMail			= $('#isAllowCrPdfMailEle').is(':checked');
					jsonObject.isAllowPartyLimit		= $('#isAllowLimitAmountEle').is(':checked');
					jsonObject.isChargeInclusive		= $('#chargeInclusiveEle').is(':checked');
					jsonObject.commission 				= $('#commissionEle').val();
					jsonObject.partyLimit 				= $('#limitAmountEle').val();
					jsonObject.isValidPartyGstn			= $('#isValidPartyGstn').is(':checked');
					jsonObject.isValidatePartNumber		= $('#isValidatePartNumber').is(':checked');
					jsonObject.isValidateInvoiceNo		= $('#isValidateInvoiceNo').is(':checked');
					jsonObject.isShowZeroAmountInLRPrint = $('#isShowZeroAmountInLRPrint').is(':checked');

					jsonObject.billingBranchesMap		= billingBranchesMap;
					
					if(billingBranchesMap && $('#multipleBillingBranchesEle').val() != null)
						jsonObject.multipleBillingBranchIds	= $('#multipleBillingBranchesEle').val().join(',');
					
					jsonObject.noOfDays					= $('#noOfDaysEle').val();
					jsonObject.invoiceDueDays			= $('#invoiceDueDaysEle').val();
					jsonObject.deviation 				= $('#deviationEle').val();
					jsonObject.deduction 				= $('#deductionEle').val();
					
					if($('#riskCoverageEle').val() != '' && $('#riskCoverageEle').val() != null) {
						jsonObject.riskCoverage 				= $('#riskCoverageEle').val();
						jsonObject.isRiskCoveragePercentage		= $('#isRiskAllocationPercentage').is(':checked');
					}
					
					showLayer();
					getJSON(jsonObject, WEB_SERVICE_URL + '/partyMasterWS/insertPartyConfiguration.do?', _this.setSuccess, EXECUTE_WITH_ERROR);
				}, setSuccess : function () {
					_this.resetPartyConfig();
					hideLayer();
				}, getPartyConfigData : function () {
					let jsonObject 		= new Object();
					jsonObject.corporateAccountId 		= $("#" + $(this).attr("id") + "_primary_key").val();
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/partyMasterWS/getPartyConfigurationData.do?', _this.partyConfigurationData, EXECUTE_WITH_ERROR);
				}, partyConfigurationData : function(response) {
					
					let corpAcc		= response.corpAcc;
					let isTBBEle	= response.isTBBEle;
					$('#riskCoverageEle').val(0);
					$('#isRiskAllocationPercentage').prop('checked', false);

					if(corpAcc) {
						$('#ischargedWtEle').prop('checked', corpAcc.chargedWtAllowOnCR);
						$('#isAllowOnAccountPaymentEle').prop('checked', corpAcc.allowOnAccountPayment);
						$('#isAllowPartyWiseExcelEle').prop('checked', corpAcc.allowPartyWiseExcel);
						$('#isAllowLrPdfMailEle').prop('checked', corpAcc.allowLrPdfMail);
						$('#isAllowCrPdfMailEle').prop('checked', corpAcc.allowCrPdfMail);
						$('#isAllowLimitAmountEle').prop('checked', corpAcc.allowPartyLimit);
						$('#chargeInclusiveEle').prop('checked', corpAcc.chargeInclusive);
						$('#commissionEle').val(corpAcc.commission);
						$('#limitAmountEle').val(corpAcc.partyLimitAmount);
						$('#isValidPartyGstn').prop('checked',corpAcc.validPartyGstn);
						$('#noOfDaysEle').val(corpAcc.noOfDays);
						$('#invoiceDueDaysEle').val(corpAcc.invoiceDueDays);
						$('#deviationEle').val(corpAcc.deviation);
						$('#deductionEle').val(corpAcc.deduction);
						$('#riskCoverageEle').val(corpAcc.riskCoverage);
						$('#isRiskAllocationPercentage').prop('checked', corpAcc.isRiskCoveragePercentage);						
						$('#isValidateInvoiceNo').prop('checked', corpAcc.isValidateInvoiceNo);
						$('#isValidatePartNumber').prop('checked', corpAcc.isValidatePartNumber);
						$('#isShowZeroAmountInLRPrint').prop('checked', corpAcc.isShowZeroAmountInLRPrint);

						if(corpAcc.allowPartyLimit)
							$('.limitAmountDiv').removeClass('hide');
						else {
							$('#limitAmountEle').val(0);
							$('.limitAmountDiv').addClass('hide');
						}
					} else {
						$('#invoiceDueDaysEle').val(0);
						$('#deviationEle').val(0);
						$('#deductionEle').val(0);
						$('#isShowZeroAmountInLRPrint').prop('checked', false);
					}
					
					if(partyMasterProperties.allowToEnterPartyLimit)
						_this.showHideLimitAmount(isTBBEle);
					
					if(billingBranchesMap) {
						if(isTBBEle) {
							$("*[data-attribute='billingBranchesMap']").removeClass("hide");
							$('#multipleBillingBranchesEle').val(response.billingBartyBranchMapIds);
						} else
							$("*[data-attribute='billingBranchesMap']").addClass("hide");
					}
					
					if(isInvoiceDueDays) {
						if(isTBBEle) {
							$("*[data-attribute='invoiceDueDays']").removeClass("hide");
						} else
							$("*[data-attribute='invoiceDueDays']").addClass("hide");
					}
				}, showHideLimitAmount : function(isShow) {
					if(isShow)
						$("*[data-attribute='limitAmount']").removeClass("hide");
					else {
						$('#limitAmountEle').val(0);
						$('.limitAmountDiv').addClass('hide');
						$("*[data-attribute='limitAmount']").addClass("hide");
					}
				} ,renderPartyClaimElements : function(response) {
					
					var loadelement 			= new Array();
					var partyClaimHtml 			= new $.Deferred();
					
					loadelement.push(partyClaimHtml);
					$("#partyClaimTab").load("/ivcargo/html/module/partyMaster/partyMasterTabElements/partyClaimTabElements.html", function() {
						partyClaimHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						masterLangObj 		= FilePath.loadLanguage();
						masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
						let keyObject 		= Object.keys(response);
						
						for (const element of keyObject) {
							if (!response[element].show)
								$("*[data-attribute="+ element+ "]").addClass("hide");

							if (response[element].show)
								$("#"+ element+ "").attr("data-selector",element);
						}
						
						let partyNameForClaimComplete 				= new Object();
						partyNameForClaimComplete.primary_key 		= 'corporateAccountId';
						partyNameForClaimComplete.url 				= WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocomplete.do?';
						partyNameForClaimComplete.field 			= 'corporateAccountDisplayName';
						$("#partyNameForClaimEle").autocompleteCustom(partyNameForClaimComplete);
						
						myNod4 = nod();
						myNod4.configure({
							parentClass:'validation-message'
						});
						
						myNod4.add({
							selector		: '#partyNameForClaimEle',
							validate		: 'validateAutocomplete:#partyNameForClaimEle_primary_key',
							errorMessage	: 'Please Select Party Name'
						});
						
						myNod4.add({
							selector		: '#claimAmountEle',
							validate		: 'float',
							errorMessage	: 'Please Enter Claim Amount'
						});
						
						$("#partyNameForClaimEle").change(function() {
							_this.getPartyClaimDetails();
						});
						
						$("#addPartyClaimBtn").click(function(){
							myNod4.performCheck();
							if(myNod4.areAll('valid')) {
								_this.savePartyClaim(1);
							}
						});
						
						$("#updatePartyClaimBtn").click(function(){
							myNod4.performCheck();
							if(myNod4.areAll('valid')) {
								_this.savePartyClaim(2);
							}
						});
						
						$("#deletePartyClaimBtn").click(function(){
							myNod4.performCheck();
							if(myNod4.areAll('valid')) {
								_this.deletePartyClaim(3);
							}
						});
						
					});
				},getPartyClaimDetails : function() {
					var partyMasterId 	= Number($("#partyNameForClaimEle_primary_key").val());
					
					if(partyMasterId > 0) {
						showLayer();
						
						jsonObject 	= new Object();
						jsonObject.corporateAccountId 	= partyMasterId;
						
						getJSON(jsonObject, WEB_SERVICE_URL + '/partyClaimWS/getPartyClaimDetails.do?', _this.setDataPartyClaimTab, EXECUTE_WITH_ERROR);
					}
					
				},setDataPartyClaimTab : function(response){
					hideLayer();
					
					var partyClaim 		= response.partyClaim;
					
					if(typeof partyClaim !== 'undefined') {
						previousClaimAmount	= partyClaim.claimAmount;
						
						$('#claimAmountEle').val(partyClaim.claimAmount);
						
						if(Number(partyClaim.claimAmount) > 0) {
							$('#updatePartyClaimBtn').removeClass('hide');
							$('#deletePartyClaimBtn').removeClass('hide');
						} else {
							$('#updatePartyClaimBtn').addClass('hide');
							$('#deletePartyClaimBtn').addClass('hide');
						}
					} else {
						$('#claimAmountEle').val('');
						$('#updatePartyClaimBtn').addClass('hide');
						$('#deletePartyClaimBtn').addClass('hide');
					}
				},savePartyClaim : function(operationType){
					jsonObject 		= new Object();
					
					if(Number($('#claimAmountEle').val()) <= 0) {
						showMessage('error', 'Claim Amount Should Be Greater Than 0 !');
						changeTextFieldColor('claimAmountEle', '', '', 'red');
						return;
					}
					
					jsonObject.corporateAccountId 		= $('#partyNameForClaimEle_primary_key').val();
					jsonObject.operationType			= operationType;
					jsonObject.claimAmount				= Number($('#claimAmountEle').val());
					
					if(operationType == 2) {
						if(previousClaimAmount > Number($('#claimAmountEle').val()))
							jsonObject.partyClaimDetailsClaimAmount	= - (Number(previousClaimAmount - $('#claimAmountEle').val()));
						else
							jsonObject.partyClaimDetailsClaimAmount	= Number($('#claimAmountEle').val() - previousClaimAmount);
					} else
						jsonObject.partyClaimDetailsClaimAmount		= Number($('#claimAmountEle').val());
					
					if(!doneTheStuffAdd) {
						doneTheStuffAdd = true;
						
						if(operationType == 1) {
							var btModalConfirm = new Backbone.BootstrapModal({
								content		: 	" <h5 style='color:red;'> <b> Note : Entered Claim Amount Will Be Added To Existing Claim Amount </h5><h5> Are you sure you want to continue ? </h5></b>",
								modalWidth 	: 	30,
								title		:	'Party Claim',
								okText		:	'YES',
								showFooter 	: 	true,
								okCloses	:	true
							}).open();
							
							btModalConfirm.on('ok', function() {
								getJSON(jsonObject, WEB_SERVICE_URL + '/partyClaimWS/insertPartyClaim.do?', _this.setSuccessForPartyClaim, EXECUTE_WITH_ERROR);
								doneTheStuffAdd = true;
								showLayer();
							});

							btModalConfirm.on('cancel', function() {
								$("#saveBtn").removeClass('hide');
								$("#saveBtn").attr("disabled", false);
								doneTheStuffAdd = false;
								hideLayer();
							});
						} else if(operationType == 2) {
							var btModalConfirm = new Backbone.BootstrapModal({
								content		: 	" <h5 style='color:red;'> <b> Note : Existing Claim Amount Will Replaced With Entered Claim Amount </h5><h5> Are you sure you want to continue ? </h5></b>",
								modalWidth 	: 	30,
								title		:	'Party Claim',
								okText		:	'YES',
								showFooter 	: 	true,
								okCloses	:	true
							}).open();
							
							btModalConfirm.on('ok', function() {
								getJSON(jsonObject, WEB_SERVICE_URL + '/partyClaimWS/insertPartyClaim.do?', _this.setSuccessForPartyClaim, EXECUTE_WITH_ERROR);
								doneTheStuffAdd = true;
								showLayer();
							});

							btModalConfirm.on('cancel', function() {
								$("#saveBtn").removeClass('hide');
								$("#saveBtn").attr("disabled", false);
								doneTheStuffAdd = false;
								hideLayer();
							});
						}
					}
					
				},deletePartyClaim : function(operationType){
					jsonObject 		= new Object();
					
					jsonObject.corporateAccountId 			= $('#partyNameForClaimEle_primary_key').val();
					jsonObject.operationType				= operationType;
					jsonObject.claimAmount					= Number($('#claimAmountEle').val());
					jsonObject.partyClaimDetailsClaimAmount	= Number($('#claimAmountEle').val());
					
					if(!doneTheStuffDelete) {
						doneTheStuffDelete = true;
						
						let btModalConfirm = new Backbone.BootstrapModal({
							content		: 	"<h5><b> Are you sure you want to Delete ? <h5></b>",
							modalWidth 	: 	30,
							title		:	'Party Claim',
							okText		:	'YES',
							showFooter 	: 	true,
							okCloses	:	true
						}).open();
						
						btModalConfirm.on('ok', function() {
							getJSON(jsonObject, WEB_SERVICE_URL + '/partyClaimWS/deletePartyClaim.do?', _this.setSuccessForPartyClaim, EXECUTE_WITH_ERROR);
							doneTheStuffDelete = true;
							showLayer();
						});

						btModalConfirm.on('cancel', function() {
							$("#saveBtn").removeClass('hide');
							$("#saveBtn").attr("disabled", false);
							doneTheStuffDelete = false;
							hideLayer();
						});
					}
				}, setSuccessForPartyClaim : function() {
					location.reload();
					hideLayer();
				},renderQuatationTabElements : function(response) {
					let loadelement				= new Array();
					let addNewQuatationHtml		= new $.Deferred();

					loadelement.push(addNewQuatationHtml);

					$("#quatationTab").load("/ivcargo/html/module/partyMaster/partyMasterTabElements/UploadPartyDocument.html", function() {
						addNewQuatationHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						Selection.setPartyAutocompleteWithCallback($("#partyQuatationEle"), response, _this.getUploadedPartyDocuments);
					});
				}, getUploadedPartyDocuments : function() {
					if(Number($('#partyQuatationEle_primary_key').val()) > 0) {
						showLayer();
						$("#pdfDocumentDetails").empty();
						$('#documentDetailsDiv').addClass('hide');
						
						let jsonObject = {};
						jsonObject.id = $('#partyQuatationEle_primary_key').val();
						getJSON(jsonObject, WEB_SERVICE_URL + '/uploadPdfDetailsWS/getPartyDocumentsByCorporateId.do?', _this.renderToUploadDocuments, EXECUTE_WITH_ERROR);
					}
				}, renderToUploadDocuments : function(response) {
					hideLayer();
					let isDocumentForView		= response.isDocumentForView;
					let uploadPdfDetailsList	= response.uploadPdfDetailsList;
					let maxSizeOfFileToUpload	= response.maxSizeOfFileToUpload;
					let pdfWaybillsModel		= response.pdfWaybillsModel;
					let noOfFileToUpload		= pdfWaybillsModel.uploadedPdfCount;
					
					$("#addPhotoModal").modal({
						backdrop: 'static',
						keyboard: false
					});
					
					_this.uploadDocuments(noOfFileToUpload);
					validateDifferentFileTypeAndSize(noOfFileToUpload, maxSizeOfFileToUpload, uploadPdfDetailsList);
					
					if(isDocumentForView)
						$('#viewBtn').removeClass('hide');
					else
						$('#viewBtn').addClass('hide');
					
					$('#uploadBtn').off('click').click(function() {
						_this.onUploadDocuments(pdfWaybillsModel);
					});
						
					$('#viewBtn').click(function() {
						showLayer();
						jsonObject = new Object();
						jsonObject.id = $('#partyQuatationEle_primary_key').val();
						jsonObject.moduleId = PARTY_MASTER;
						getJSON(jsonObject, WEB_SERVICE_URL+'/uploadPdfDetailsWS/getDownloadPdfDataDetails.do', _this.showDetailsOfUploadedDocuments, EXECUTE_WITH_ERROR);
					});
				}, onUploadDocuments : function(response) {
					let jsonObjectNew 	= new Object();
					let totalFile 		= 0;
					let $inputs = $('#photoContainer :input');
					//this will iterate all elements and will set the name as key and value of Element as value in jsonObject
					$inputs.each(function (index) {
						if($(this).val() != "") {
							let fileName	= $(this).attr('name');
							let nameArr		= fileName.split('_');
							let pdfFileName	= "pdfFileName_" + nameArr[1];
	
							if (this.files && this.files[0]) {
								let FR	= new FileReader();
								jsonObjectNew[pdfFileName] = this.files[0]['name']
								
								FR.addEventListener("load", function(e) {
									jsonObjectNew[fileName] = e.target.result;
								}); 
	
								FR.readAsDataURL(this.files[0]);
							}
							
							totalFile++;
						}
					});
					
					if(totalFile == 0) {
						showMessage('error', selectFileToUploadErrMsg);
						return false;
					}
					
					jsonObjectNew["id"] = $('#partyQuatationEle_primary_key').val();
					jsonObjectNew["noOfFileToUpload"] 	= response.uploadedPdfCount;
					jsonObjectNew["moduleId"] = PARTY_MASTER
	
					let btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to Upload Documents?",
						modalWidth 	: 	30,
						title		:	'Upload Documents',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
		
					btModalConfirm.on('ok', function() {
						showLayer();
						getJSON(jsonObjectNew, WEB_SERVICE_URL+'/uploadPdfDetailsWS/uploadPdfWayBills.do', _this.getUpdatedDocumentCount, EXECUTE_WITH_ERROR); //submit JSON
					});
				}, getUpdatedDocumentCount : function(response) {
					console.log("response >>> " , response);
					if(response.message != undefined){
						jsonObject.id = $('#partyQuatationEle_primary_key').val();
						getJSON(jsonObject, WEB_SERVICE_URL + '/uploadPdfDetailsWS/getPartyDocumentsByCorporateId.do?', _this.resetDocumentElement, EXECUTE_WITH_ERROR);
					} else
						return;
				}, resetDocumentElement : function(response) {
					$('#bottom-border-boxshadow').addClass('hide');
					$('#viewBtn').removeClass('hide');
					_this.uploadDocuments(response.pdfWaybillsModel.uploadedPdfCount);
					hideLayer();
				}, uploadDocuments : function(noOfFileToUpload) {
					$('#photoContainer').empty();
					
					if(noOfFileToUpload > 0) {
						for(let i = 1; i <= noOfFileToUpload; i++) {
							let fileInputId = 'document_' + i;
							let fileInputHTML	  = '<input type="file" name="'+fileInputId+'" id="' + fileInputId + '" class="form-control photo-upload" style="margin-top: 10px; width: 310px;" />';
					
							$('#photoContainer').append(fileInputHTML);
						}
						
						$('#uploadBtn').removeClass('hide');
						$('#hidePhotoLabel').removeClass('hide');
					} else {
						$('#uploadBtn').addClass('hide');
						$('#hidePhotoLabel').addClass('hide');
					}
					
				}, showDetailsOfUploadedDocuments : function(response) {
					let pdfDocumentList 	= response.pdfDocumentList;
					_this.setModelToViewDetails(pdfDocumentList);
					hideLayer();
				}, setModelToViewDetails : function(pdfDocList) {
					$("#pdfDocumentDetails").empty();
					let tablebody 	= $("#pdfDocumentDetails");
					
					if(pdfDocList != undefined) {
						$('#documentDetailsDiv').removeClass('hide');
						
						for(let i = 0; i < pdfDocList.length; i++) {
							let checkCell	= $("<td style='text-align : center'>").text(i + 1);
							let branchCell = $("<td>");
				            let pdfLink = $("<a href='#'>").text(pdfDocList[i].pdfName).click(function(e) {
				                e.preventDefault();
				                // Open the PDF in the modal
				                _this.openDocumentInModal(pdfDocList[i].pdfFile , pdfDocList[i].pdfName);
				            });
				            
				            branchCell.append(pdfLink);
							//view button
							let actionsCell = $("<td>");
							
							let viewButton = $("<button>").text("Download").addClass("btn btn-primary me-2").click(function() {
								$("#images-container").empty();
								downloadDocument(pdfDocList[i].pdfFile, pdfDocList[i].pdfName);
							});
							
							viewButton.css("margin-right", "10px");
					
							let deleteButton = $("<button>").text("Delete").addClass("btn btn-danger deleteId").click(function() {
								_this.deletePdfFile(pdfDocList[i].pdfDetailsId + "", pdfDocList[i].pdfSummaryId);
							});
					
							actionsCell.append(viewButton, deleteButton);
							//creating new row
							let row = $("<tr id = 'tr_" + pdfDocList[i].pdfDetailsId + "'>");
							row.append(checkCell, branchCell, actionsCell);
							//inserting the row in the table body
							tablebody.append(row);
						}
					} 
				}, deletePdfFile : function(ids, pdfSummaryId) {
					showLayer();
					let jsonObj = new Object();
					jsonObj.pdfDetailsIds 	= ids;
					jsonObj.pdfSummaryId	= pdfSummaryId;
					getJSON(jsonObj, WEB_SERVICE_URL+'/uploadPdfDetailsWS/deleteUploadedPdfFile.do?', _this.onDeleteDocument, EXECUTE_WITHOUT_ERROR);
					$('#tr_' + ids).remove();
				}, onDeleteDocument : function(response){
					hideLayer();
					setTimeout(() => {
						$('#quatation').trigger('click');
					}, 700);
				}, openDocumentInModal: function(fileData, fileName) {
					const extention = fileName.split('.').pop().toLowerCase();
					const modalBody = document.getElementById('modalBody');
					modalBody.innerHTML = ''; // Clear previous content
				
					let element;
				
					// For image types (JPEG, PNG, GIF, etc.)
					if (['png', 'jpeg', 'jpg', 'gif'].includes(extention)) {
						element = document.createElement('img');
						element.src = `data:image/${extention};base64,` + fileData;
						element.style.width = '100%';
						element.style.height = 'auto';
					} else if (extention === 'pdf') {// For PDF files
						const blobUrl = readUploadedPdf(fileData);
						
						element = document.createElement('iframe');
						element.src = blobUrl;
						element.width = '100%';
						element.height = '500px';
						element.style.border = 'none';
					} else {
						modalBody.innerHTML = 'Unsupported file type';
						$('#pdfModal').modal('show');
						return;
					}
				
					modalBody.appendChild(element); // Append the created element
					$('#pdfModal').modal('show');
				}, showEditHistoryButton : function() {
					$("*[data-selector='showHistory']").html("Edit History");
					$('#showHistoryBtn').removeClass('hide').prop('disabled', false);
				}, getPartyEditHistoryData : function() {
					if($('#corporateAccountId').val() != 0)
						var corporateAccountId	= $('#corporateAccountId').val();
					else
						var corporateAccountId	= $('#partyNameSelectorEle_primary_key').val();
					
					var childwin = window.open ('masters.do?pageId=340&eventId=1&modulename=viewDetails&corporateAccountId='+corporateAccountId+'&filter=10');
				}
			});
		});

function validatePhoneNumber(ele){
	if(partyMasterProperties.allowCustomPhoneValidation){
		
		if(!(/^0/g).test(ele.value)){
			showMessage('error','Please enter Valid Phone Number !')
			$('#'+ele.id).val('');
			$('#'+ele.id).focus();
			return false;
		}
	}
}

function validateMobileNumberBeforeSave(ele) {
	const mobile = ele.value.trim();
	
	if(mobile.length !== 10 ||!(/^[6-9]\d{9}$/).test(mobile) || (/(\d)\1{9}/).test(mobile)) {
		showMessage('error', 'Please Enter Valid Mobile Number!');
		$('#' + ele.id).val('');
		$('#' + ele.id).focus();
		$('#' + ele.id).css('border-color', 'red');
		return false;
	} else {
		$('#' + ele.id).css('border-color', '');
	}

	return true;
}

function validateMobileNumber(ele){
	if(partyMasterProperties.allowCustomMobileValidation){
		
		if(!(/^[6-9]/g).test(ele.value)){
			showMessage('error','Please enter Valid Mobile  Number !')
			$('#'+ele.id).val('');
			$('#'+ele.id).focus();
			return false;
		}
	}
}

function phonenumber1(inputtxt) {
	if(inputtxt.value.length > 0){
		var phoneno = /^\(?([0-9]{3})\)?[-., ]?([0-9]{8})$/;
		if((inputtxt.value.match(phoneno)))
			return true;
		else {
			showMessage('error', 'Please Enter Valid Phone Number Like 022 99999999!');
			changeTextFieldColor(inputtxt.id, '', '', 'red');
		
			setTimeout(() => {
				$('#'+inputtxt.id).focus();
			}, 100);

			return false;
		}
	} else {
		return true;
	}
}

function onClickHandler() {
	$("#ChargedWeightRoundOffValueEle").prop("disabled", !$("#chargedWeightRoundOffEle").prop('checked'));
}

function  openPopupToConfirm(){
	$('#popUpContentForConfirm').bPopup({
	}, function() {
		var _thisMod = this;
		
		$(this).html("<div class='confirm'><h1>Are you sure you want to update the Party ?</h1><p id='shortcut'></p><button id='cancelButton'>NO</button><button id='confirm'>YES</button></div>")
		$("#shortcut").html("Shortcut Keys : Enter = Yes, Esc = No")
		$("#confirm").focus();

		$("#confirm").click(function(){
			_thisMod.close();
			return true;
		})

		$("#confirm").on('keydown', function(e) {
			if (e.which == 27) {  //escape
				_thisMod.close();
				return true;
			}
		});

		$("#cancelButton").click(function(){
			_thisMod.close();
			return false;
		})
	});
}
