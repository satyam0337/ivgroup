var prepaidAmountId = 0;
var currentAmount = 0;
var doNotShowVehicleTypeOnFtlBooking = false;
let allowToAddBranchCommision = true;
let allowToViewAllCommision = true;
define([
	
	'/ivcargo/resources/js/generic/urlparameter.js'
	, PROJECT_IVUIRESOURCES + '/resources/js/module/view/branchCommissionMaster/branchCommissionMasterFilepath.js'
	, 'slickGridWrapper2'
	, 'selectizewrapper'
	, PROJECT_IVUIRESOURCES + '/resources/js/module/view/branchCommissionMaster/updateBranchCommDetails.js'
	, 'JsonUtility'
	, 'messageUtility'
	, 'jquerylingua'
	, 'language'
	, 'autocomplete'
	, 'autocompleteWrapper'
	, 'nodvalidation'
	, 'focusnavigation'//import in require.config
	, 'bootstrapSwitch'
	, PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
],
	function(UrlParameter, FilePath, SlickGridWrapper, Selectizewrapper, UpdateBranchCommDetails) {
		'use strict';
		let jsonObject = new Object(), myNod, myNod1, myNod2, myNod3, _this = '', savedSuccess, masterLangObj, masterLangKeySet, wayBillChargesToSelect = 0,
			commisionTypeList, commissionTypeArr;
		return Marionette.LayoutView.extend({
			initialize: function() {
				_this = this;
			}, render: function() {
				getJSON(jsonObject, WEB_SERVICE_URL + '/branchCommissionMasterWS/getBranchCommissionMasterElements.do?', _this.renderLRSearch, EXECUTE_WITHOUT_ERROR);
				return _this;
			}, renderLRSearch: function(response) {
				let loadelement = new Array();
				let baseHtml = new $.Deferred();
				loadelement.push(baseHtml);
				
				$("#mainContent").load("/ivcargo/html/module/branchCommissionMaster/branchCommissionMaster.html", function() {
					baseHtml.resolve();
				});
				
				$.when.apply($, loadelement).done(function() {
					initialiseFocus();
					let keyObject = Object.keys(response);
					
					for (const element of keyObject) {
						if (response[element])
							$("*[data-attribute=" + element + "]").addClass("show");
					}

					if (response.isLabourCharge)
						$('#addLabourCharge').show();

					if(response.isCalculateMultipleCommissionOnChargeIds)
						wayBillChargesToSelect = 1;
					else
						wayBillChargesToSelect = response.chargeTypeModelArr.length;
					
					commisionTypeList = response.commisionTypeList;
					commissionTypeArr = response.commissionTypeArr;
					doNotShowVehicleTypeOnFtlBooking = response.doNotShowVehicleTypeOnFtlBooking;

					let addOrViewBranchCommsion = response.addOrViewBranchCommsion;
				
					if(addOrViewBranchCommsion) {
						allowToViewAllCommision		= response.allowToViewAllCommision;
						allowToAddBranchCommision	= response.allowToAddBranchCommision;    
					}

					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.branchList,
						valueField		:	'branchId',
						labelField		:	'branchName',
						searchField		:	'branchName',
						elementId		:	'branchEle',
						create			: 	false,
						maxItems		: 	1
					});
					
					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.destinationBranchList,
						valueField		:	'branchId',
						labelField		:	'branchName',
						searchField		:	'branchName',
						elementId		:	'destinationBranchEle',
						create			: 	false,
						maxItems		: 	response.destinationBranchList.length
					});

					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.TxnTypeArr,
						valueField		:	'txnTypeId',
						labelField		:	'txnTypeName',
						searchField		:	'txnTypeName',
						elementId		:	'txnTypeEle',
						create			: 	false,
						maxItems		: 	1,
						onChange		:	_this.onTxnTypeSelect
					});

					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.wayBillTypeArr,
						valueField		:	'wayBillTypeId',
						labelField		:	'wayBillType',
						searchField		:	'wayBillType',
						elementId		:	'wayBillTypeEle',
						create			: 	false,
						maxItems		: 	response.wayBillTypeArr.length
					});

					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.chargeTypeModelArr,
						valueField		:	'chargeTypeMasterId',
						labelField		:	'chargeTypeMasterName',
						searchField		:	'chargeTypeMasterName',
						elementId		:	'chargeTypeMasterEle',
						create			: 	false,
						maxItems		: 	wayBillChargesToSelect
					});
					
					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.bookingTypeArr,
						valueField		:	'bookingTypeId',
						labelField		:	'bookingTypeName',
						searchField		:	'bookingTypeName',
						elementId		:	'bookingTypeEle',
						create			: 	false,
						maxItems		: 	1,
						onChange		: _this.onBookingTypeSelect
					});

					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.commissionTypeArr,
						valueField		:	'commissionTypeId',
						labelField		:	'commissionTypeName',
						searchField		:	'commissionTypeName',
						elementId		:	'commissionTypeEle',
						create			: 	false,
						maxItems		: 	1,
						onChange		: _this.onCommissionTypeSelect
					});

					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.vehicleTypeList,
						valueField		:	'vehicleTypeId',
						labelField		:	'name',
						searchField		:	'name',
						elementId		:	'vehicleTypeEle',
						create			: 	false,
						maxItems		: 	response.vehicleTypeList.length
					});

					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.weightConfigList,
						valueField		:	'commissionTypeId',
						labelField		:	'commissionTypeName',
						searchField		:	'commissionTypeName',
						elementId		:	'weightConfigEle',
						create			: 	false,
						maxItems		: 	1
					});

					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.packingTypeForGroupList,
						valueField		:	'typeOfPackingMasterId',
						labelField		:	'packingTypeName',
						searchField		:	'packingTypeName',
						elementId		:	'packingTypeEle',
						create			: 	false,
						maxItems		: 	response.packingTypeForGroupList.length
					});

					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.transportationModeList,
						valueField		:	'transportModeId',
						labelField		:	'transportModeName',
						searchField		:	'transportModeName',
						elementId		:	'transportationModeEle',
						create			: 	false,
						maxItems		: 	1
					});
					
					if(response.businessTypeSelection){
						$('#businessTypeSelectionId').show();
						Selectizewrapper.setAutocomplete({
							jsonResultList	: 	response.businessTypeList,
							valueField		:	'businessTypeId',
							labelField		:	'businessTypeName',
							searchField		:	'businessTypeName',
							elementId		:	'businessTypeEle',
							create			: 	false,
							maxItems		: 	1,
						});
					}


					var branchAutoComplete 			= new Object();
					branchAutoComplete.primary_key 	= 'branchId';
					branchAutoComplete.field 		= 'branchName';
					$("#branchEle").autocompleteCustom(branchAutoComplete);

					let autoBranchName = $("#branchEle").getInstance();
					$(autoBranchName).each(function() {
						this.option.source = response.sourceBranchCollection;
					});
					masterLangObj = FilePath.loadLanguage();
					masterLangKeySet = loadLanguageWithParams(masterLangObj);
					myNod = nod();
					myNod1 = nod();
					myNod2 = nod();
					myNod3 = nod();
					myNod.configure({
						parentClass: 'validation-message'
					});

					myNod.add({
						selector: '#branchEle',
						validate: 'validateAutocomplete:#branchEle',
						errorMessage: 'Select proper Source Branch !'
					});

					myNod.add({
						selector: '#destinationBranchEle',
						validate: 'validateAutocomplete:#destinationBranchEle',
						errorMessage: 'Select proper Destination Branch !'
					});
					myNod.add({
						selector: '#txnTypeEle',
						validate: 'validateAutocomplete:#txnTypeEle',
						errorMessage: 'Select proper Txn Type !'
					});

					myNod.add({
						selector: '#wayBillTypeEle',
						validate: 'validateAutocomplete:#wayBillTypeEle',
						errorMessage: 'Select LR Type !'
					});
					myNod.add({
						selector: '#bookingTypeEle',
						validate: 'validateAutocomplete:#bookingTypeEle',
						errorMessage: 'Select Proper Booking Type !'
					});
					myNod.add({
						selector: '#commissionTypeEle',
						validate: 'validateAutocomplete:#commissionTypeEle',
						errorMessage: 'Select Proper Commission Type !'
					});
					myNod.add({
						selector: '#commissionValueEle',
						validate: 'presence',
						errorMessage: 'Please Enter Amount'
					});
					myNod.add({
						selector: '#commissionValueEle',
						validate: 'float',
						errorMessage: 'value should be decimal number'
					});
					
					if(response.businessTypeSelection) {
						myNod.add({
							selector: '#businessTypeEle',
							validate: 'validateAutocomplete:#businessTypeEle',
							errorMessage: 'Select Business Type !'
						});
					}

					myNod1.add({
						selector: '#saveLabourEle',
						validate: 'presence',
						errorMessage: 'Please Enter Amount'
					});

					myNod1.add({
						selector: '#saveLabourEle',
						validate: 'float',
						errorMessage: 'value should be decimal number'
					});

					myNod1.add({
						selector: '#agentBranchesEle',
						validate: 'validateAutocomplete:#agentBranchesEle',
						errorMessage: 'Select proper Source Branch !'
					});

					myNod2.add({
						selector: '#rechargeAmountEle',
						validate: 'presence',
						errorMessage: 'Please Enter Amount'
					});

					myNod2.add({
						selector: '#agentBranchPrepaidEle',
						validate: 'validateAutocomplete:#agentBranchPrepaidEle',
						errorMessage: 'Select proper Source Branch !'
					});
					myNod3.add({
						selector: '#agentBranchPrepaidEle',
						validate: 'validateAutocomplete:#agentBranchPrepaidEle',
						errorMessage: 'Select proper Source Branch !'
					});

					_this.onCommissionTypeSelect();

					hideLayer();
					
					if (!allowToAddBranchCommision) {
						$('#add').hide();
						$('#addNewTab').hide();
					}
					
					if (!allowToViewAllCommision)
						$("#viewAllBranchComm").hide();

					$("#saveBtn").click(function() {
						myNod.performCheck();
						
						if (myNod.areAll('valid'))
							_this.onSubmit();
					});

					$('#add').on('click', function() {
						_this.addBranchCommission();
					});

					if (response.allowPrepaidAmount) {
						$('#prePaidAmountli').css('display', 'inline');
						$('#prePaidAmount').on('click', function() {
							_this.viewAddBranchWisePrepaidAmount();
						});
					} else {
						$('#prePaidAmountli').css('display', 'none');
					}

					$("#viewAllBranchComm").click(function() {
						_this.viewBranchCommission();
					});
					$("#updateBtn").click(function() {
						_this.onView(_this);
					});
					$("#addLabourCharge").click(function() {
						_this.addLabourCharge();
					});
					$("#saveLabour").click(function() {
						myNod1.performCheck();
						if (myNod1.areAll('valid')) {
							_this.saveLabour(_this);
						}
					});

					$("#saveBtnCA").click(function() {
						myNod2.performCheck();
						if (myNod2.areAll('valid')) {
							_this.saveBranchWisePrepaidAmount(_this);
						}
					});

					$("#imageAdd").click(function() {
						myNod2.performCheck();
						if (myNod2.areAll('valid')) {
							_this.addPrepaidAmount(_this);
						}
					});
					$("#imageSub").click(function() {
						myNod2.performCheck();
						if (myNod2.areAll('valid')) {
							if ($("#rechargeAmountEle").val() <= currentAmount) {
								_this.subPrepaidAmount(_this);
							} else {
								showMessage('error', "Cannot deduct recharge Amount!!!!");
							}
						}
					});
					$("#deleteBtnCA").click(function() {
						myNod3.performCheck();
						if (myNod3.areAll('valid')) {
							_this.deleteBranchWisePrepaidAmount(_this);
						}
					});

					$('#isPercentageEle').bootstrapSwitch({
						on: 'YES',
						off: 'NO',
						onLabel: 'YES',
						offLabel: 'NO',
						deactiveContent: 'Are You Sure To Switch To Percentage?',
						activeContent: 'Are You Sure To Switch To Normal Value?'

					});
					$('#isPercentageId').hide();

				});
				return _this;

			}, setBranch: function(jsonObj) {
				let autoBranchName = $("#branchEle").getInstance();

				$(autoBranchName).each(function() {
					this.option.source = jsonObj.sourceBranch;
				})
			}, resetAutcomplete: function(jsonArray) {
				for (let eleId in jsonArray) {
					let elem = $(jsonArray[eleId]).getInstance();
					
					$(elem).each(function() {
						let elemObj = this.elem.combo_input;
					
						$(elemObj).each(function() {
							$("#" + $(this).attr("id")).val('');
							$("#" + $(this).attr("id") + '_primary_key').val("");
						})
					})
				}
			}, onSubmit: function() {
				showLayer();
				let jsonObject = new Object();

				jsonObject["sourceBranchId"] 			= $('#branchEle').val();
				jsonObject["applicableOnBranchId"] 		= $('#destinationBranchEle').val();
				jsonObject["txnType"] 					= $('#txnTypeEle').val();
				jsonObject["wayBillType"] 				= $('#wayBillTypeEle').val();
				jsonObject["chargeTypeMaster"] 			= $('#chargeTypeMasterEle').val();
				jsonObject["bookingTypeId"] 			= $('#bookingTypeEle').val();
				jsonObject["commissionTypeId"] 			= $('#commissionTypeEle').val();
				jsonObject["vehileTypeIds"] 			= $('#vehicleTypeEle').val();
				jsonObject["weightConfig"] 				= $('#weightConfigEle').val();
				jsonObject["packingTypeMaster"] 		= $('#packingTypeEle').val();
				jsonObject["commissionValue"] 			= $('#commissionValueEle').val();
				jsonObject["isPercentage"] 				= $('#isPercentageEle').prop('checked');
				jsonObject["transportationModeId"] 		= $('#transportationModeEle').val();
				jsonObject["businessTypeId"] 			= $('#businessTypeEle').val();

				getJSON(jsonObject, WEB_SERVICE_URL + '/branchCommissionMasterWS/saveBranchCommissionDetails.do', _this.setSavingResponse, EXECUTE_WITH_ERROR);
			}, setSavingResponse: function(response) {
				if (response.message != undefined) {
					let MyRouter = new Marionette.AppRouter({});
					MyRouter.navigate('&modulename=branchCommisionMaster&savedSuccess=true', { trigger: true });
					location.reload();
					hideLayer();
					return;
				}

				hideLayer();
			}, onTxnTypeSelect: function() {
				let control = $('#commissionTypeEle')[0].selectize;

				control.clearOptions();
				control.clear();

				if ($('#txnTypeEle').val() == 1)
					control.addOption(commisionTypeList);
				else
					control.addOption(commissionTypeArr);
			}, onBookingTypeSelect: function() {
				if ($('#bookingTypeEle').val() == BOOKING_TYPE_FTL_ID && doNotShowVehicleTypeOnFtlBooking) {
					$('#vehicleTypeId').show();
					$("#vehicleTypeEle").prop('disabled', false);
					myNod.add({
						selector: '#vehicleTypeEle',
						validate: 'presenceIfNotDisable:#vehicleTypeEle',
						errorMessage: 'Select Vehicle Type !'
					});
				} else {
					$('#vehicleTypeId').hide();
					$("#vehicleTypeEle").prop('disabled', true);
				}
			}, onCommissionTypeSelect: function() {
				if ($('#commissionTypeEle').val() == 5) {
					$('#weightConfigId').show();
					$("#weightConfigEle").prop('disabled', false);
					myNod.add({
						selector: '#weightConfigEle',
						validate: 'presenceIfNotDisable:#weightConfigEle',
						errorMessage: 'Select Proper Weight Config !'
					});
				} else {
					$('#weightConfigId').hide();
					$("#weightConfigEle").prop('disabled', true);
				}
				if ($('#commissionTypeEle').val() == 4) {
					$('#packingTypeId').show();
					$("#packingTypeEle").prop('disabled', false);
					myNod.add({
						selector: '#packingTypeEle',
						validate: 'presenceIfNotDisable:#packingTypeEle',
						errorMessage: 'Select Proper Packing Type !'
					});
				} else {
					$('#packingTypeId').hide();
					$("#packingTypeEle").prop('disabled', true);
				}
				if ($('#commissionTypeEle').val() == 1 || $('#commissionTypeEle').val() == 8 || $('#commissionTypeEle').val() == 9) {
					$('#isPercentageId').show();
				} else {
					$('#isPercentageId').hide();
				}

				if ($('#commissionTypeEle').val() == 2) {
					$('#isPercentageId').show();
					$('#chargeTypeMasterId').addClass('show');
					$("#chargeTypeMasterId").prop('disabled', false);
					myNod.add({
						selector: '#chargeTypeMasterEle',
						validate: 'presenceIfNotDisable:#chargeTypeMasterEle',
						errorMessage: 'Select Booking Charge Type !'
					});
				} else {
					if ($('#commissionTypeEle').val() != 1 && $('#commissionTypeEle').val() != 8 && $('#commissionTypeEle').val() != 9) {
						$('#isPercentageId').hide();
					}
					$('#chargeTypeMasterId').removeClass('show');
					$("#chargeTypeMasterId").prop('disabled', true);
				}

			}, onShow: function() {
				savedSuccess = UrlParameter.getModuleNameFromParam('savedSuccess');
				if (savedSuccess == 'true') {
					showMessage('success', 'Data Saved Successfully !');
				}
			}, addBranchCommission: function() {

				$('#branchEle').val('');
				$('#destinationBranchEle_wrapper').val('');
				$('#txnTypeEle').val('');
				$('#commissionType').val('');
				$('#wayBillTypeEle_wrapper').val('');
				$('#commissionValueEle').val('');

				let selectize = $('#branchEle').get(0).selectize;
				selectize.setValue(0);
				
				let selectize1 = $('#destinationBranchEle').get(0).selectize;
				selectize1.setValue(0);
				
				let selectize2 = $('#txnTypeEle').get(0).selectize;
				selectize2.setValue(0);
				
				let selectize3 = $('#commissionType').get(0).selectize;
				selectize3.setValue(0);
				
				let selectize4 = $('#wayBillTypeEle').get(0).selectize;
				selectize4.setValue(0);
				
				let selectize5 = $('#bookingTypeEle').get(0).selectize;
				selectize5.setValue(0);
			}, viewBranchCommission: function() {
				getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getAgentBranchAutoComplete.do?', _this.renderView, EXECUTE_WITHOUT_ERROR);

			}, renderView: function(response) {
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.branchList,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'agentBranchEle',
					create			: 	false,
					maxItems		: 	1
				});

				$("#updateBtn").show();
				$('#branchCommissionDetailsDiv').empty();

			}, addLabourCharge: function() {
				getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getBranchAutocomplete.do?', _this.setLabourCharge, EXECUTE_WITHOUT_ERROR);

			}, setLabourCharge: function(response) {
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.branchList,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'agentBranchesEle',
					create			: 	false,
					maxItems		: 	1
				});
				if ($("#middle-border-boxshadow").css('display') != 'none') {
					$("#middle-border-boxshadow").toggle(900);
				}
				if ($("#bottom-border-boxshadow").css('display') != 'none') {
					$("#bottom-border-boxshadow").toggle(900);
				}
				if ($("#right-border-boxshadow").css('display') != 'none') {
					$("#right-border-boxshadow").toggle(900);
				}
				$("#left-border-boxshadow").toggle(900);
				$("#saveLabour").show();
			}, saveLabour: function() {
				showLayer();
				let jsonObject = new Object();
				jsonObject["branchId"] 				= $('#agentBranchesEle').val();
				jsonObject["labourCharge"] 			= $('#saveLabourEle').val();
				jsonObject["isPercent"] 			= $('#isPercentEle').prop('checked');

				if (confirm('Are you sure you want to Save?')) {
					getJSON(jsonObject, WEB_SERVICE_URL + '/branchCommissionMasterWS/saveLabourCharge.do', _this.labourResposne, EXECUTE_WITH_ERROR);
				} else {
					hideLayer();
				}
			}, onView: function() {
				showLayer();
				let jsonObject = new Object();
				jsonObject["txnBranchId"] = $('#agentBranchEle').val();
				getJSON(jsonObject, WEB_SERVICE_URL + '/branchCommissionMasterWS/viewBranchCommissionDetails.do', _this.setViewResponse, EXECUTE_WITH_ERROR);
			}, labourResposne: function(response) {
				if (response.message != undefined) {
					$('#saveLabourEle').val('');
					let selectize = $('#agentBranchesEle').get(0).selectize;
					selectize.setValue(0);
					hideLayer();
				}
			}, setViewResponse: function(response) {
				//setViewResponse
				if (response.message != undefined) {
					refreshAndHidePartOfPage('branchCommissionDetailsDiv', 'hide');
					hideLayer();
					return;
				}

				var ColumnConfig = response.tableConfig.columnConfiguration;
				var columnKeys = _.keys(ColumnConfig);
				var bcolConfig = new Object();
				for (var i = 0; i < columnKeys.length; i++) {

					var bObj = ColumnConfig[columnKeys[i]];
					if (bObj.show == true) {
						bcolConfig[columnKeys[i]] = bObj;
					}
				}
				response.tableConfig.columnConfiguration = bcolConfig;

				response.tableConfig.Language = masterLangKeySet;

				if (response.tableConfig.CorporateAccount != undefined) {
					$('#branchCommissionDetailsDiv').show();
					hideAllMessages();
					response.tableConfig.tableProperties.callBackFunctionForPartial = _this.viewBranchCommissionforUpdate;
					 
					if (!allowToAddBranchCommision) {
						response.tableConfig.tableProperties.showPartialButton 					= false;
						response.tableConfig.columnConfiguration.DeleteButton.show 				= false;
						response.tableConfig.columnConfiguration.DeleteButton.buttonCallback 	= "";
						response.tableConfig.columnConfiguration.DeleteButton.columnHidden 		= true;
					}
					
					SlickGridWrapper.setGrid(response.tableConfig);
				}
				
				hideLayer();
			}, viewBranchCommissionforUpdate: function(grid, dataView, row) {
				if (allowToAddBranchCommision) {
					let jsonObject = new Object();
					jsonObject.dataView = dataView.getItem(row);
					let object = new Object();
					object.elementValue = jsonObject;

					let btModal = new Backbone.BootstrapModal({
						content: new UpdateBranchCommDetails(object),
						modalWidth: 100,
						title: 'Update Branch Commission Details'
					}).open();
					object.btModal = btModal;
					new UpdateBranchCommDetails(object)
				} else {
					showMessage("error", "you don't have permissions")
					hideLayer();
				}
			}, viewAddBranchWisePrepaidAmount: function() {
				getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getAgentBranchAutoComplete.do?', _this.addBranchWisePrepaidAmount, EXECUTE_WITHOUT_ERROR);

			}, addBranchWisePrepaidAmount: function(response) {
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.branchList,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'agentBranchPrepaidEle',
					create			: 	false,
					maxItems		: 	1,
					onChange		: _this.getPrepaidAmountIdValue
				});
				$("#right-border-boxshadow").toggle(900);

				if ($("#middle-border-boxshadow").css('display') != 'none') {
					$("#middle-border-boxshadow").toggle(900);
				}
				if ($("#bottom-border-boxshadow").css('display') != 'none') {
					$("#bottom-border-boxshadow").toggle(900);
				}
				if ($("#left-border-boxshadow").css('display') != 'none') {
					$("#left-border-boxshadow").toggle(900);
				}
			}, getPrepaidAmountIdValue: function() {
				let jsonObject = new Object();
				jsonObject.branchId = $('#agentBranchPrepaidEle').val();
				getJSON(jsonObject, WEB_SERVICE_URL + '/BranchWisePrepaidAmountWS/getBranchWisePrepaidAmountByBranchId.do', _this.getPrepaidAmountResposne, EXECUTE_WITH_ERROR);

			}, getPrepaidAmountResposne: function(response) {
				prepaidAmountId	= response.prepaidAmountId;
				currentAmount	= response.rechargeAmount;

				if (prepaidAmountId > 0 && prepaidAmountId != undefined) {
					$("#imageAdd").css('display', 'inline');
					$("#imageSub").css('display', 'inline');
					$("#currentAmountEle").html(currentAmount);
					//$("#saveBtnCA").html("Update");
					$("#saveBtnCA").css('display', 'none');

				} else if (response.message != undefined) {
					$("#currentAmountEle").html(0);
					$("#saveBtnCA").css('display', 'inline');
					$("#imageAdd").css('display', 'none');
					$("#imageSub").css('display', 'none');
					let errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				}
			}, saveBranchWisePrepaidAmount: function() {
				showLayer();
				let jsonObject = new Object();
				jsonObject.agentBranchPrepaid		 = $('#agentBranchPrepaidEle').val();
				jsonObject.rechargeAmount 			 = $('#rechargeAmountEle').val();
				jsonObject.operationType 			 = 1;

				if (confirm('Are you sure you want to Save?')) {
					getJSON(jsonObject, WEB_SERVICE_URL + '/BranchWisePrepaidAmountWS/insertBranchWisePrepaidAmount.do', _this.branchWisePrepaidAmountResposne, EXECUTE_WITH_ERROR);
				} else {
					hideLayer();
				}

			}, branchWisePrepaidAmountResposne: function(response) {

				if (response.message != undefined) {
					$('#agentBranchPrepaidEle').val('');
					$('#rechargeAmountEle').val('');
					let selectize 		= $('#agentBranchPrepaidEle').get(0).selectize;
					selectize.setValue(0); 
					hideLayer();
					let errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
					$('#currentAmountEle').html(" ");
				}

			}, addPrepaidAmount: function() {
				showLayer();
				let jsonObject = new Object();
				jsonObject.filter					 = 2;
				jsonObject.prepaidAmountId			 = prepaidAmountId;
				jsonObject.rechargeAmount 			 = $('#rechargeAmountEle').val();
				jsonObject.operationType 			 = 2;
				jsonObject.agentBranchPrepaid		 = $('#agentBranchPrepaidEle').val();

				if (confirm('Are you sure you want to Add ?')) {
					getJSON(jsonObject, WEB_SERVICE_URL + '/BranchWisePrepaidAmountWS/updatePrepaidAmountByPrepaidAmountIdFromMaster.do', _this.addBranchWisePrepaidAmountResposne, EXECUTE_WITH_ERROR);
				} else {
					hideLayer();
				}

			}, addBranchWisePrepaidAmountResposne: function(response) {
				if (response.message != undefined) {
					$('#agentBranchPrepaidEle').val('');
					$('#rechargeAmountEle').val('');
					let selectize 		= $('#agentBranchPrepaidEle').get(0).selectize;
					selectize.setValue(0); 
					hideLayer();
					let errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
					$('#currentAmountEle').html(" ");
				}
			}, subPrepaidAmount: function() {
				showLayer();
				let jsonObject = new Object();
				jsonObject.filter					 = 1;
				jsonObject.prepaidAmountId			 = prepaidAmountId;
				jsonObject.rechargeAmount 			 = $('#rechargeAmountEle').val();
				jsonObject.agentBranchPrepaid		 = $('#agentBranchPrepaidEle').val();
				jsonObject.operationType 			 = 3;

				if (confirm('Are you sure you want to reduce ?')) {
					getJSON(jsonObject, WEB_SERVICE_URL + '/BranchWisePrepaidAmountWS/updatePrepaidAmountByPrepaidAmountIdFromMaster.do', _this.subBranchWisePrepaidAmountResposne, EXECUTE_WITH_ERROR);
				} else {
					hideLayer();
				}

			}, subBranchWisePrepaidAmountResposne: function(response) {
				if (response.message != undefined) {
					$('#agentBranchPrepaidEle').val('');
					$('#rechargeAmountEle').val('');
					let selectize 		= $('#agentBranchPrepaidEle').get(0).selectize;
					selectize.setValue(0); 
					hideLayer();
					let errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
					$('#currentAmountEle').html(" ");
				}
			}, overRidePrepaidAmount: function() {
				showLayer();
				let jsonObject = new Object();
				jsonObject.filter					 = 3;
				jsonObject.prepaidAmountId			 = prepaidAmountId;
				jsonObject.rechargeAmount 			 = $('#rechargeAmountEle').val();
				jsonObject.agentBranchPrepaid		 = $('#agentBranchPrepaidEle').val();
				jsonObject.operationType 			 = 4;

				if (confirm('Are you sure you want to Update ?')) {
					getJSON(jsonObject, WEB_SERVICE_URL + '/BranchWisePrepaidAmountWS/updatePrepaidAmountByPrepaidAmountIdFromMaster.do', _this.overRideBranchWisePrepaidAmountResposne, EXECUTE_WITH_ERROR);
				} else {
					hideLayer();
				}

			}, overRideBranchWisePrepaidAmountResposne: function(response) {
				if (response.message != undefined) {
					$('#agentBranchPrepaidEle').val('');
					$('#rechargeAmountEle').val('');
					let selectize 		= $('#agentBranchPrepaidEle').get(0).selectize;
					selectize.setValue(0); 
					hideLayer();
					let errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
					$('#currentAmountEle').html(" ");
				}
			}, deleteBranchWisePrepaidAmount: function() {
				showLayer();
				let jsonObject = new Object();
				jsonObject.prepaidAmountId			 = prepaidAmountId;
				jsonObject.agentBranchPrepaid		 = $('#agentBranchPrepaidEle').val();
				jsonObject.rechargeAmount 			 = currentAmount;
				jsonObject.operationType 			 = 5;

				if (confirm('Are you sure you want to Delete ?')) {
					getJSON(jsonObject, WEB_SERVICE_URL + '/BranchWisePrepaidAmountWS/deletePrepaidAmount.do', _this.deleteBranchWisePrepaidAmountResposne, EXECUTE_WITH_ERROR);
				} else {
					hideLayer();
				}

			}, deleteBranchWisePrepaidAmountResposne: function(response) {
				if (response.message != undefined) {
					$('#agentBranchPrepaidEle').val('');
					$('#rechargeAmountEle').val('');
					let selectize 		= $('#agentBranchPrepaidEle').get(0).selectize;
					selectize.setValue(0); 
					hideLayer();
					let errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
					$('#currentAmountEle').html(" ");
				}
			}
		});
	
	});

function transportSearch(grid, dataView, row) {
	if (!allowToAddBranchCommision) {
		showMessage("error", "you don't have permssions");
		return;
	}
	
	if (confirm('Are you sure you want to Delete?')) {
		showLayer();
		let jsonObject = new Object();
		jsonObject["branchCommissionId"] = dataView.getItem(row).branchCommissionId;
		getJSON(jsonObject, WEB_SERVICE_URL + '/branchCommissionMasterWS/deleteCommissionDetails.do', responseAfterDelete, EXECUTE_WITH_ERROR);
	} else {
		hideLayer();
	}
}
		
function responseAfterDelete() {
	$('#updateBtn').click();
}