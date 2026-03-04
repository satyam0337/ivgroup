/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
var slickGridWrapper4 = null;
var wayBillId = 0 ;
var unloadDestinationBranch;
let tripSheetId = 0;
let tripSheetStatus = 0;
let tripSheetNumber = 0,
tripSheetRoute  = ''
define([
	'marionette'//Marionette
	//marionette JS framework
	//Elementmodel consist of default values which is passed when setting it in template
	,'elementmodel'//ElementModel
	//elementtemplate is javascript utility which consist of functions that operate on elements
	,'elementTemplateJs'//elementTemplateJs
	,'text!'+PROJECT_IVVIEWPAGES+'/template/elementtemplate.html'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/dispatchfilepath.js'//FilePath
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/vehicle/dispatch/createnewvehicle.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/vehicle/dispatch/createnewdriver.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/default/triphisablsdetails.js'
	, 'moment'
	,'datepickerWrapper'
	//text! is used to convert the html to plain text which helps to fetch HTML through require
	//template for element
	//filepath is defined to get the language path from where should the language file should be loaded for label
	,'jquerylingua'//import in require.config
	,'language'//import in require.config
	,'nodvalidation'//import in require.config
	,'validation'//import in require.config
	,'errorshow'//import in require.config
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/populatesubregionandbranch.js'//PopulateAutocomplete
	,'autocompleteWrapper'
	,'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES+'/js/element/elementoperation.js'
	,'/ivcargo/resources/js/validation/regexvalidation.js',
], function (Marionette, ElementModel, elementTemplateJs, ElementTemplate, FilePath, CreateNewVehicle, CreateNewDriver, TripHisabLSDetails) {
	var  dispatchData,
	myNod = null, myNode,
	myNodeDriver, languageKeyset, languageKeyset2, btVehicleModalConfirm, btDriverModalConfirm, newVehicle,
	lorryHireDetails, accountGroupId, tripHisabRequired, tripHisabLSInfo,
	_this,
	isAnyDDDVWBs = false, vehicleAgentMasterId = 0,
	transportationModeMap, transportModeIdArray, uniqueTransportModeIdArray, sourceBranch, tripSheet = false, doneTheStuff	= false,
	TOKEN_VALUE	= "",TOKEN_KEY="", totalLrCommission = 0,
	vehicleTypeId = 0, validateTripSheet = false, lsPropertyConfig, isValidRC = true;
		
	return Marionette.ItemView.extend({
		initialize: function(data) {
			//_this object is added because this object is not found in onRender function
			dispatchData 						= data.slickData;
			lsPropertyConfig					= data.lsPropertyConfig
			isAnyDDDVWBs						= data.isAnyDDDVWBs;
			totalLrCommission					= data.totalLrCommission;
			lorryHireDetails					= data.lorryHireData;
			_this = this;
		},
		render: function(){
			//this is the first method called when this function is called
			//triggerMethod onBeforeRender
			this.triggerMethod("before:render");
			//triggerMethod onRender
			this.triggerMethod("render");
			//triggerMethod onAfterRender
			this.triggerMethod("after:render");
		},

		onBeforeRender: function() {}, 
		onRender: function(){
			//jsonutility.js
			lsPropertyConfig.isAgentCrossing	= isCheckBoxChecked('isAgentCrossing');
			lsPropertyConfig.transportMode = dispatchData[0].transportModeId;
			getJSON(lsPropertyConfig, WEB_SERVICE_URL+'/loadingSheetWS/getDispatchDetailsElementData.do', _this.setElements, EXECUTE_WITH_ERROR);

			return _this;
		}, onAfterRender: function() {
			
		}, setElements : function(data) {
			lsPropertyConfig			= data;
			
			doneTheStuff	= false;
			
			//append value in template
			elementTemplateJs.appendElementInTemplate(data.ElementModelArray, ElementModel, ElementTemplate, _this);

			accountGroupId						= data.accountGroupId;
			TOKEN_KEY							= lsPropertyConfig.TOKEN_KEY;
			TOKEN_VALUE							= lsPropertyConfig.TOKEN_VALUE;
			tripHisabRequired					= lsPropertyConfig.tripHisabRequired;
			sourceBranch						= data.sourceBranch;

			setTimeout(_this.executeFunctions, 200);
			if(!lsPropertyConfig.showLsCommissionOnlyForCrossingAgent && lsPropertyConfig.allowLsCommission) {
				setTimeout(function() {
					$('#isCommissionPercentageEle').prop('checked', true);
					$('#isCommissionPercentageEle').hide();
					$('#isCommissionPercentage').hide();
				}, 300);
			}
		}, executeFunctions : function(){
			initialiseFocus('#modalBody');
			//load language is used to get the value of labels 
			var langObj 	= FilePath.loadLanguage();
			languageKeyset 	= loadLanguageWithParams(langObj);
			
			if(lsPropertyConfig.groupWiseLanguageFileLoad) {
				var langObj2 	= FilePath.loadLanguageGroupWise(accountGroupId);
				languageKeyset2 = loadLanguageWithParams(langObj2);
			} else{
				var langObj 	= FilePath.loadLanguage();
				languageKeyset 	= loadLanguageWithParams(langObj);
			}

			var vehicleNumberMasterId	= 0;
			
			if(lsPropertyConfig.TruckSource) {
				setTimeout(() => {
					_this.setTruckSources();
				}, 500);
			}
			
			if(lorryHireDetails != undefined)
				vehicleNumberMasterId	= lorryHireDetails.vehicleNumberMasterId;
			
			myNod = nod();
			
			if(lsPropertyConfig.TruckSource)
				addAutocompleteElementInNode(myNod, 'truckSourceEle', 'Select proper Vehicle Source');
			
			if(!lsPropertyConfig.TransportMode) {
				if(vehicleNumberMasterId == 0) {
					if(lsPropertyConfig.isVehicleNumberValidate)
						addAutocompleteElementInNode(myNod, 'vehicleNumberEle', 'Select proper Vehicle Number');
					else
						addElementToCheckEmptyInNode(myNod, 'vehicleNumberEle', cannotLeftBlankMsg)
				}
				
				if(lsPropertyConfig.isDriverNameValidate)
					addElementToCheckEmptyInNode(myNod, 'driverNameEle', cannotLeftBlankMsg)
				
				if(lsPropertyConfig.remarkValidate)
					addElementToCheckEmptyInNode(myNod, 'remarkEle', 'Please Enter Remark')
					
				if(lsPropertyConfig.isDriverNumberValidate) {
					addElementToCheckEmptyInNode(myNod, 'driverMobileNumberEle', cannotLeftBlankMsg)
					addElementToCheckLength10InNode(myNod, 'driverMobileNumberEle', 'Please provide valid Mob No.')
					addElementToCheckNumericInNode(myNod, 'driverMobileNumberEle', shouldBeNumericMsg)
					if(lsPropertyConfig.driverNoNotMoreThanFourDuplicates)
						addElementToCheckNoMoreThanFourDuplicateInNode(myNod, 'driverMobileNumberEle', 'Mobile number cannot contain more than 5 repeated digits')
				}
				
				if(lsPropertyConfig.allowLsCommission) {
					$('#commissionEle').val(lsPropertyConfig.defaultCommissionValue);
					addElementToCheckFloatInNode(myNod, 'commissionEle', shouldBeNumericMsg)

			   		if(Number(lsPropertyConfig.defaultCommissionValue) > 0)
						$("#commissionEle").attr("disabled", "disabled"); 
				}
				
				if(lsPropertyConfig.allowLsExpense) {
					$('#lsExpenseEle').val(0);
					addElementToCheckFloatInNode(myNod, 'lsExpenseEle', shouldBeNumericMsg)
				}
				
				if(lsPropertyConfig.isDriverNameValidate)
					addElementToCheckEmptyInNode(myNod, 'driverNameEle', cannotLeftBlankMsg)
				
				if(lsPropertyConfig.isPassengerNameValidate)
					addElementToCheckEmptyInNode(myNod, 'driverName2Ele', 'Please Enter Passenger Name')
				
				if(lsPropertyConfig.isPassengerMobileNumberValidate) {  
					addElementToCheckEmptyInNode(myNod, 'driver2MobileNumberEle', 'Please Enter Passenger Mob No')
					addElementToCheckLength10InNode(myNod, 'driver2MobileNumberEle', 'Please provide valid Mob No.')
					addElementToCheckNumericInNode(myNod, 'driver2MobileNumberEle', shouldBeNumericMsg)
				}
				
				if(lsPropertyConfig.loaderNumber)
					addElementToCheckNumericInNode(myNod, 'loaderNumberEle', shouldBeNumericMsg)
				
				if(lsPropertyConfig.openingKilometerValidate) {
					addElementToCheckEmptyInNode(myNod, 'openingKilometerEle', cannotLeftBlankMsg)
					addElementToCheckNumericInNode(myNod, 'openingKilometerEle', shouldBeNumericMsg)
				}
				
				if(lsPropertyConfig.isExecutiveValidate)
					addAutocompleteElementInNode(myNod, 'executiveSelectEle', 'Select Dispatch Executive');
			}
			
			if(lsPropertyConfig.TransportMode) {
				addAutocompleteElementInNode(myNod, 'transportModeEle', 'Please Select Transport Mode');

				var transportModeAutoComplete 			= new Object();
				transportModeAutoComplete.primary_key 	= 'transportModeId';
				transportModeAutoComplete.field 		= 'transportModeName';
				transportModeAutoComplete.callBack 		= _this.onTransportModeSelect;
				transportModeAutoComplete.keyupFunction = _this.onTransportModeSelect;
				
				$("#transportModeEle").autocompleteCustom(transportModeAutoComplete);

				_this.setTransportMode();
				$('#transportModeEle').focus();
			}

			if(lsPropertyConfig.DispatchRouteList != undefined) {
				addAutocompleteElementInNode(myNod, 'dispatchRouteEle', 'Please Select Route!');
				
				var dispatchRouteAutoComplete = new Object();
				dispatchRouteAutoComplete.primary_key 	= 'dispatchRouteId';
				dispatchRouteAutoComplete.field 		= 'dispatchRouteNameAndTime';
				$("#dispatchRouteEle").autocompleteCustom(dispatchRouteAutoComplete);

				var autoDispatchRoute = $("#dispatchRouteEle").getInstance();
				
				$(autoDispatchRoute).each(function() {
					this.option.source = lsPropertyConfig.DispatchRouteList;
				});
			}
			
			if(lsPropertyConfig.vehicleType && !lsPropertyConfig.autoSelectVehicleTypeOnVehicleNumber) {
				addAutocompleteElementInNode(myNod, 'vehicleTypeEle', 'Please Select Vehicle Type!');
				
				var vehicleTypeAutoComplete = new Object();
				vehicleTypeAutoComplete.primary_key 	= 'vehicleTypeId';
				vehicleTypeAutoComplete.field 			= 'name';
				$("#vehicleTypeEle").autocompleteCustom(vehicleTypeAutoComplete);

				var autoDispatchRoute = $("#vehicleTypeEle").getInstance();
				
				$(autoDispatchRoute).each(function() {
					this.option.source = lsPropertyConfig.vehicleTypeMasterList;
				});
			}
			
			$('#weighBridgeEle').keypress(function(event) {
				return allowOnlyNumeric(event);
			});
			
			if(lsPropertyConfig.isAllowOnlyNumeric && manualLsSequenceCounterPresent != undefined && manualLsSequenceCounterPresent
				&& lsPropertyConfig.isManualLSAllreadyChecked)
				$('#isManualDispatch').prop('checked','true');

			if(lsPropertyConfig.isAllowAlphnumericWithSpecialCharactersSeq) {
				$("#manualLSNumber").on('keyup', function(e) {
					_this.allowAlphaNumericAndSpecialCharacters(e, 'manualLSNumber');
				});
			}
			
			if(vehicleNumberMasterId == 0) {
				var show_fieldArray	= [];
				var sub_asObject	= {};
				
				show_fieldArray.push('vehicleTypeId');
				sub_asObject.vehicleTypeId			= languageKeyset['vehicleTypeId'];
				
				show_fieldArray.push('vehicleOwner');
				sub_asObject.vehicleOwner			= languageKeyset['vehicleOwner'];
				
				show_fieldArray.push('vehicleTypeName');
				sub_asObject.vehicleTypeName		= languageKeyset['vehicleType'];
				
				show_fieldArray.push('capacity');
				sub_asObject.capacity				= languageKeyset['capacity'];
				
				show_fieldArray.push('vehicleRegisterdOwner');
				sub_asObject.vehicleRegisterdOwner	= languageKeyset['RegisterdOwner'];
				
				show_fieldArray.push('panNumber');
				sub_asObject.panNumber				= languageKeyset['panNumber'];
				
				if(lsPropertyConfig.showRemarkOfVehicleNumber) {
					show_fieldArray.push('remark');
					sub_asObject.remark				= languageKeyset['remark'];
				}
					
				var autoVehicleNumber = new Object();
				autoVehicleNumber.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getVehicleNumberAutocomplete.do';
				autoVehicleNumber.primary_key 	= 'vehicleNumberMasterId';
				autoVehicleNumber.field 		= 'vehicleNumber';
				
				if(lsPropertyConfig.addVehicleWhileDispatch)
					autoVehicleNumber.blurFunction	= _this.checkForNewVehicle;
				
				autoVehicleNumber.show_field 	= show_fieldArray.join(', ');
				
				var groupForSubInfo = [466,335,554,544];
				
				if(!isValueExistInArray(groupForSubInfo, accountGroupId)) {
					autoVehicleNumber.sub_info 	= true;
					autoVehicleNumber.sub_as	= sub_asObject;
				}
				
				autoVehicleNumber.callBack		= _this.getValidateTripSheetByVehicleNumber;
				$("#vehicleNumberEle").autocompleteCustom(autoVehicleNumber);
				
				if(lsPropertyConfig.vehicleAgentSelection) {
					var vehicleAgentAutoComplete 			= new Object();
					vehicleAgentAutoComplete.url 			= WEB_SERVICE_URL + '/autoCompleteWS/getVehicleAgentAutocomplete.do';
					vehicleAgentAutoComplete.primary_key 	= 'vehicleAgentMasterId';
					vehicleAgentAutoComplete.field 			= 'name';
					$("#vehicleAgentListEle").autocompleteCustom(vehicleAgentAutoComplete);
				}
			} else
				$("#vehicleNumberEle").attr("disabled", "disabled"); 
			
			$("#manualLSDate").SingleDatePickerCus({
				minDate 	: lsPropertyConfig.minDate,
				maxDate		: lsPropertyConfig.maxDate,
				startDate 	: lsPropertyConfig.maxDate
			});
			
			var autoLicenceNumber = new Object();
			autoLicenceNumber.url 			= WEB_SERVICE_URL+'/dispatchWs/getLicenceNumberForDispatch.do';
			autoLicenceNumber.primary_key 	= 'driverMasterId';
			autoLicenceNumber.field 		= 'licenceNumberWithDriverName';
			autoLicenceNumber.callBack 		= _this.getDriverNameAndMobNum;
			autoLicenceNumber.show_field 	= 'driverMasterId, driverName, mobileNumber, licenceNumber'; //do not remove driverMasterId from here
			autoLicenceNumber.sub_info 		= true;
		
			if(lsPropertyConfig.groupWiseLanguageFileLoad)
				autoLicenceNumber.sub_as = {driverName : languageKeyset2['driverName'] ,mobileNumber : languageKeyset2['driverNumber']};
			else
				autoLicenceNumber.sub_as = {driverName : languageKeyset['driverName'], mobileNumber : languageKeyset['driverNumber']};
			
			$('#isDDDVDispatchEle').bootstrapSwitch({
				on 				: 'YES',
				off 			: 'NO',
				onLabel 		: 'YES',
				offLabel 		: 'NO',
				deactiveContent : 'Do you want to convert into DDDV ?',
				activeContent 	: 'Do Not want to convert into DDDV ?'
			});
			
			if(lsPropertyConfig.addDriverWhileDispatch)
				autoLicenceNumber.blurFunction	= _this.checkForNewDriver;
			
			$("#driverLicenceNumberEle").autocompleteCustom(autoLicenceNumber);
			
			if(lsPropertyConfig.TruckSource)
				_this.getTruckSources();

			_this.getTruckDestinations();
			_this.setManaulLSSequence();
			
			if($('#sourceSelectEle_primary_key').val() > 0)
				_this.getDispatchExecutive();
			
			if(lorryHireDetails != undefined)
				_this.setTruckInformation();
			
			$("#driverNameEle").on('keyup', function(e) {
				_this.checkForSpecialCharacter(e,'driverNameEle');
			});
			
			$("#driverNameEle").on('keydown', function(e) {
				_this.checkForSpecialCharacter(e,'driverNameEle');
			});
			
			$("#manualLSDate").bind('blur keyup focus', function() {
				//_this.validateManualLsDateForPartBGeneration();
				_this.validateManualLsDateWithAllLrs(dispatchData);
			});
			
			$("#manualLSDate").bind('click blur', function() {
				setTimeout(function() {
					_this.validateManualLsDateForPartBGeneration();
				}, 200);
			});
			
			if($("#crossingBranchEle_primary_key").val() == undefined || Number($("#crossingBranchEle_primary_key").val()) < 0)
				addAutocompleteElementInNode(myNod, 'truckDestinationEle', 'Select proper Vehicle Destination');
			
			$(".ok").on('click', function() {
				myNod.performCheck();
				
				if(lsPropertyConfig.loaderNumber && $("#loaderNumberEle").val().trim().length < 10) { 
					showMessage('error', "Loader number must be 10 digits");
					$("#loaderNumberEle").focus();
					return false; 
				}

				var unloadDestArr = [], destCityId = 0;
				
				if ($('#truckDestinationEle_primary_key').val() != undefined && $('#truckDestinationEle_primary_key').val() > 0) {
					unloadDestArr = unloadDestinationBranch.filter(function(e) {
						return e.branchId == $('#truckDestinationEle_primary_key').val();
					});
					
					if(unloadDestArr.length > 0)
						  destCityId	= unloadDestArr[0].branchCityId;
					
					if(lsPropertyConfig.sameSourceAndDestinationCityValidation && sourceBranch.branchCityId == destCityId){
						showMessage('info', 'You can not generate loading sheet for intercity dispatch, Please use branch transfer only!');
						return;
					}
				}

				if(myNod.areAll('valid')){
					var finalJsonObj = new Object();

					finalJsonObj.lrArray  			= JSON.stringify(dispatchData);
					
					if(!(_.isArray(excessEntryDetailsArray) && _.isEmpty(excessEntryDetailsArray)))
						finalJsonObj.excessEntryDetailsArray  			= JSON.stringify(excessEntryDetailsArray);
					
					if(lorryHireDetails != undefined)
						finalJsonObj.lorryHireDetails	= JSON.stringify(lorryHireDetails);
					
					var jsonObject = new Object();
					var $inputs = $('#modalBody :input');
					//this will iterate all elements and will set the name as key and value of Element as value in jsonObject
					$inputs.each(function () {
						if($(this).val() != "")
							jsonObject[$(this).attr('name')] = $.trim($(this).val());
					});
					
					if(lsPropertyConfig.TruckSource)
						jsonObject["sourceBranchId"] = $('#truckSourceEle_primary_key').val();
					else if($('#sourceSelectEle_primary_key').val() > 0)
						jsonObject["sourceBranchId"] = $('#sourceSelectEle_primary_key').val();

					if($('#crossingAgentSelectEle_primary_key').val() > 0)
						jsonObject["crossingAgentId"] = $('#crossingAgentSelectEle_primary_key').val();
					
					jsonObject["isAgentCrossing"]		= isCheckBoxChecked('isAgentCrossing');
					
					if ($('#isManualDispatch').is(':checked')) {
						jsonObject["isManualDispatch"]		= $('#isManualDispatch').is(':checked');
						jsonObject["manualLSNumber"]		= $('#manualLSNumber').val();
					}
					
					if ($('#isDDDVDispatchEle').is(':checked'))
						jsonObject["isConvertToDDDV"]		= $('#isDDDVDispatchEle').is(':checked');
					
					if($('#vehicleAgentListEle_primary_key').val() > 0)
						jsonObject["vehicleAgentMasterId"] 		= $('#vehicleAgentListEle_primary_key').val();
					else
						jsonObject["vehicleAgentMasterId"] 		= vehicleAgentMasterId;
					
					jsonObject.isShowTruckDestinationFieldifFTLAndDDV 	= lsPropertyConfig.isShowTruckDestinationFieldifFTLAndDDV;
					jsonObject.isAnyDDDVWBs								= isAnyDDDVWBs;
					
					if(lsPropertyConfig.showLsCommissionOnlyForCrossingAgent && isCheckBoxChecked('isAgentCrossing') && totalLrCommission <= 0 && Number( $('#commissionEle').val()) <= 0){
						showMessage('error',"Please Enter Commission");
						return false;
					}
					
					jsonObject.isCommissionPercentage 					= lsPropertyConfig.showCommissionInPercentage ? $('#commissionCheckEle').is(':checked') : $('#isCommissionPercentageEle').prop("checked");
					
					if (isAnyDDDVWBs && !lsPropertyConfig.isShowTruckDestinationFieldifFTLAndDDV){
						$("#truckDestinationEle_primary_key").val(dispatchData[0].wayBillDestinationBranchId);
						$("#VehicleDestinationBranchId").val(dispatchData[0].wayBillDestinationBranchId);
						$("#destinationBranchId").val(dispatchData[0].wayBillDestinationBranchId);
						jsonObject['truckDestinationEle_primary_key']	= dispatchData[0].wayBillDestinationBranchId;
					}
					
					if(!$('#truckDestinationEle').exists())
						jsonObject['truckDestinationEle_primary_key']	= dispatchData[0].wayBillDestinationBranchId;
					
					if(vehicleTypeId > 0)
						jsonObject['vehicleTypeEle_primary_key']	= vehicleTypeId;
					
					if(lsPropertyConfig.billSelection)
						jsonObject.billSelectionId		= dispatchData[0].billSelectionId;
					
					if(lsPropertyConfig.saveTripSheetNoAndRouteInRemark && Number(tripSheetNumber) > 0 )
						jsonObject.remarkEle =' TS number: ' + tripSheetNumber + ' , Route Name: ' + tripSheetRoute + ' ' + ((jsonObject.remarkEle == undefined) ? '' : ',' + jsonObject.remarkEle);
						
					if(Number(tripSheetNumber) > 0)
						jsonObject.tripSheetNumber	=  '' + tripSheetNumber;
						
					if(Number(tripSheetId) > 0)
						jsonObject.tripSheetId	=  tripSheetId;
						
					if(Number(tripSheetStatus) > 0)
						jsonObject.tripSheetStatus	=  tripSheetStatus;	

					if($('#driverIdEle').val() > 0)
						jsonObject["driverIdEle"] 		= $('#driverIdEle').val();	
					
					finalJsonObj.jsondata = JSON.stringify(jsonObject);

					var jsonObject = new Object();
					var $inputs = $('#lhpvChargeModal :input');
					//this will iterate all elements and will set the name as key and value of Element as value in jsonObject
					$inputs.each(function (index){
						if($(this).val() != ""){
							jsonObject[$(this).attr('id')] = $.trim($(this).val());
						}
					});
				
					if(lsPropertyConfig.openingKilometer && tripHisabLSInfo != null && tripHisabLSInfo != undefined && tripHisabLSInfo != 'undefined')
						tripHisabLSInfo.kilometerReadingEle  = $('#openingKilometerEle').val();
					
					finalJsonObj.lhpvChrgs 			= JSON.stringify(jsonObject);
					finalJsonObj.tripHisabLSInfo  	= JSON.stringify(tripHisabLSInfo);
					finalJsonObj.TOKEN_VALUE		= TOKEN_VALUE;
					finalJsonObj.TOKEN_KEY			= TOKEN_KEY;
					finalJsonObj.isGeneratePartB	= $('#partBCheckBoxEle').prop("checked");
					
					if(wayBillIdWiseChargeArr != null)
						finalJsonObj.wayBillIdWiseDelChargeArr		= JSON.stringify(wayBillIdWiseChargeArr);
					
					var isValidCrossingDest		= _this.checkValidCrossingDestination();
					var isManualLSInRange		= _this.checkManualLSInRange();
				
					if(isValidCrossingDest && isManualLSInRange) {
						if($('#manualLSNumber').exists() && $('#manualLSNumber').is(":visible") && $('#manualLSNumber').val() == '') {
							showMessage('error',"Please Enter Manual LS Number");
							changeTextFieldColor('manualLSNumber', '', '', 'red');
							$('#manualLSNumber').focus();
							return false;
						}
						
						if($('#manualLSDate').is(":visible") && !(_this.validateManualLsDateWithAllLrs(dispatchData)))
							return false;
							
						if(!tripSheet && validateTripSheet) {
							showMessage('error','Trip Sheet is not created for this Vehicle, First Create Trip sheet in FLEETOP');
							return false;
						}
						
						if (!isValidRC) {
							showMessage('error', validRCErorMsg);
							$('#vehicleNumberEle').focus();
							return false;
						}
						
						$(".ok").addClass('hide');
						
						if(!doneTheStuff) {
							var btModalConfirm = new Backbone.BootstrapModal({
								content		: 	"Do you sure you want to Dispatch ?",
								modalWidth 	: 	30,
								title		:	'Dispatch',
								okText		:	'YES',
								showFooter 	: 	true,
								okCloses	:	true
							}).open();
							
							btModalConfirm.on('ok', function() {
								$('#modalBody:first *:input[type!=hidden]:first').focus();
								
								if(!doneTheStuff) {
									getJSON(finalJsonObj, WEB_SERVICE_URL+'/dispatchWs/validateAnddispatchWayBills.do', _this.onDispatch, EXECUTE_WITH_ERROR); //submit JSON
									doneTheStuff	= true;
									showLayer();
								}
							});
							
							btModalConfirm.on('cancel', function() {
								$(".ok").removeClass('hide');
								doneTheStuff	= false;
								hideLayer();
							});
						}
					}
				}
			});
			$('#modalBody:first *:input[type!=hidden]:first').focus();
		},setTransportMode:function() {
			var transportModes = '{ "transportModeArr" : [' +
			'{ "transportModeId":"' + TRANSPORTATION_MODE_ROAD_ID + '" , "transportModeName":"' + TRANSPORTATION_MODE_ROAD_NAME + '" },' +
			'{ "transportModeId":"' + TRANSPORTATION_MODE_RAIL_ID + '" , "transportModeName":"' + TRANSPORTATION_MODE_RAIL_NAME + '" }, '+
			'{ "transportModeId":"' + TRANSPORTATION_MODE_AIR_ID + '" , "transportModeName":"' + TRANSPORTATION_MODE_AIR_NAME + '" }, '+
			'{ "transportModeId":"' + TRANSPORTATION_MODE_ROAD_EXPRESS_ID + '" , "transportModeName":"' + TRANSPORTATION_MODE_ROAD_EXPRESS_NAME + '" },'+
			'{ "transportModeId":"' + TRANSPORTATION_MODE_ROAD_QUICKER_ID + '" , "transportModeName":"' + TRANSPORTATION_MODE_ROAD_QUICKER_NAME + '" },'+
			'{ "transportModeId":"' + TRANSPORTATION_MODE_MIXED_ID + '" , "transportModeName":"' + TRANSPORTATION_MODE_MIXED_NAME  + '" } ]}';

			var obj = JSON.parse(transportModes);
			var autotransportModeName = $("#transportModeEle").getInstance();
			$(autotransportModeName).each(function() {
				this.option.source = obj.transportModeArr;
			});
			
			transportModeIdArray		= new Array();
			
			uniqueTransportModeIdArray	= new Array();
			
			for(var i = 0; i < dispatchData.length; i++) {
				if(dispatchData[i].transportModeId > 0)
					transportModeIdArray.push(dispatchData[i].transportModeId);
			}
			
			// To remove duplicate Transport Mode Ids
			
			$.each(transportModeIdArray, function(i, el){
				if($.inArray(el, uniqueTransportModeIdArray) === -1) uniqueTransportModeIdArray.push(el);
			});
			
			// Set Transport Mode Id Road Mixed If Different Road Transport Mode Are Selected Together
			
			if(uniqueTransportModeIdArray.length > 1) {
				$("#transportModeEle").val(transportationModeMap[TRANSPORTATION_MODE_ROAD_MIXED_ID]);
				$("#transportModeEle_primary_key").val(TRANSPORTATION_MODE_ROAD_MIXED_ID);
			} else {
				for(const element of transportationModeList) {
					let tm	= element;
					
					if(lsPropertyConfig.isRailwayBranch || tm.transportModeId == dispatchData[0].transportModeId)
						$("#transportModeEle").val(tm.transportModeName);
				}

				if(lsPropertyConfig.isRailwayBranch)
					$("#transportModeEle_primary_key").val(TRANSPORTATION_MODE_RAIL_ID);
				else
					$("#transportModeEle_primary_key").val(dispatchData[0].transportModeId);
			}
			
			$("#transportModeEle").attr("disabled", true);
			$($("#transportModeEle")[0].nextSibling).off().fadeTo('slow',.6);
			
			_this.onTransportModeSelect();
			
		},checkForSpecialCharacter:function(e,elementId) {
			var allowedChars 	= lsPropertyConfig.specialCharacterNotAllowed;
			var specialChars	= new Array();
			specialChars 		= allowedChars.split(",");

			var keynum 	= null;

			if(window.event){ // IE
				keynum = e.keyCode;
			} else if(e.which){ // Netscape/Firefox/Opera
				keynum = e.which;
			}

			for(var i = 0 ; specialChars.length > i ; i++){
				if(Number(keynum) == Number(specialChars[i])) {
					showMessage('warning', 'Special Character Not Allowed !');
					$('#' + elementId).val($('#' + elementId).val().substring(0, $('#' + elementId).val().length - 1));
					$('#' + elementId).focus();
				} else {
					hideAllMessages();
				}
			}	
		}, allowAlphaNumericAndSpecialCharacters : function(evt, elementId) {
			var allowedChars 	= lsPropertyConfig.AllowedSpecialCharacters;
			var returnType		= true;
			var specialChars	= new Array();
			specialChars 		= allowedChars.split(",");

			var keynum 	= null;

			if(window.event){ // IE
				keynum = evt.keyCode || evt.charCode;
			} else if(evt.which){ // Netscape/Firefox/Opera
				keynum = evt.which;
			}

			var charStr = String.fromCharCode(keynum);
			
			if(keynum != null) {
				if(keynum == 8 || keynum == 13 || keynum == 96) {
					hideAllMessages();
					return true;
				} else if (/[a-zA-Z]/i.test(charStr) || keynum < 48 || keynum > 57 ) {
					if(/[a-zA-Z]/i.test(charStr) || isValueExistInArray(specialChars, Number(keynum))) {//calling from genericfunctions.js
						hideAllMessages();
						return true;
					} else {
						showMessage('warning', 'No other Character Allowed !');
						$('#' + elementId).val($('#' + elementId).val().substring(0, $('#' + elementId).val().length - 1));
						$('#' + elementId).focus();
						returnType = false;
					}
				}
			}
			
			if(returnType == false)
				return false;
		}, onTransportModeSelect : function() {
			if($('#transportModeEle_primary_key').val() == TRANSPORTATION_MODE_RAIL_ID
					|| $('#transportModeEle_primary_key').val() == TRANSPORTATION_MODE_AIR_ID) {
				myNod = nod();
				
				if($("#crossingBranchEle_primary_key").val() == undefined || Number($("#crossingBranchEle_primary_key").val()) < 0)
					addAutocompleteElementInNode(myNod, 'truckDestinationEle', 'Select proper Truck Destination');
				
				addAutocompleteElementInNode(myNod, 'truckDestinationEle', 'Select proper Truck Destination');
				
				if(lsPropertyConfig.DocketNumber)
					addElementToCheckEmptyInNode(myNod, 'docketNumberEle', 'Please Enter Docket Number')
				
				$('div #vehicleRegion').removeClass('show').addClass('hide');
				
				if(lsPropertyConfig.DocketNumber && typeof $('#docketNumberEle')[0] !== 'undefined')
					$('#docketNumberEle')[0].parentElement.parentElement.parentElement.style.display= 'block';

				$('div #region').removeClass('show').addClass('hide');
			} else {
				_this.validateFeilds(myNod);
				
				if(lsPropertyConfig.DocketNumber) {
					$('#docketNumberEle').val('');
					myNod.remove('#docketNumberEle');
					
					if(typeof $('#docketNumberEle')[0] !== 'undefined')
						$('#docketNumberEle')[0].parentElement.parentElement.parentElement.style.display= 'none';
				}
				
				$('div #vehicleRegion').switchClass('hide', 'show');
				$('div #region').switchClass('hide', 'show');
			}
		}, validateFeilds : function(myNod) {
			if(lsPropertyConfig.isVehicleNumberValidate)
				addAutocompleteElementInNode(myNod, 'vehicleNumberEle', 'Select proper Vehicle Number');
			else
				addElementToCheckEmptyInNode(myNod, 'vehicleNumberEle', cannotLeftBlankMsg)

			if(lsPropertyConfig.isDriverNameValidate)
				addElementToCheckEmptyInNode(myNod, 'driverNameEle', cannotLeftBlankMsg)
			
			if(lsPropertyConfig.openingKilometerValidate) {
				addElementToCheckEmptyInNode(myNod, 'openingKilometerEle', cannotLeftBlankMsg)
				addElementToCheckNumericInNode(myNod, 'openingKilometerEle', shouldBeNumericMsg)
			}

			if(lsPropertyConfig.isDriverNumberValidate) {
				addElementToCheckEmptyInNode(myNod, 'driverMobileNumberEle', cannotLeftBlankMsg)
				addElementToCheckNumericInNode(myNod, 'driverMobileNumberEle', shouldBeNumericMsg)
				addElementToCheckLength10InNode(myNod, 'driverMobileNumberEle', 'Please provide valid Mob No.')
				if(lsPropertyConfig.driverNoNotMoreThanFourDuplicates)
					addElementToCheckNoMoreThanFourDuplicateInNode(myNod, 'driverMobileNumberEle', 'Please provide valid Mob No.')
			}

			if(lsPropertyConfig.isExecutiveValidate)
				addAutocompleteElementInNode(myNod, 'executiveSelectEle', 'Select Dispatch Executive');
		},getTruckDestinations:function(){
			var destinationBranches = new Array();
			if(dispatchData != undefined && dispatchData.length > 0) {
				for(var i = 0; i < dispatchData.length; i++) {
					destinationBranches.push(dispatchData[i]["wayBillDestinationBranchId"]);
				}

				destinationBranches = getUniqueArr(destinationBranches);

				var object = new Object();
				object.destinationBranchIds = destinationBranches.join(","); 
				getJSON(object, WEB_SERVICE_URL+'/dispatchWs/getDispatchDestination.do', _this.setDestination, EXECUTE_WITH_ERROR);
			}
		}, setTruckSources:function(){
			$('#truckSourceEle_primary_key').val(sourceBranch.branchId);
			$('#truckSourceEle').val(sourceBranch.branchName);
		}, getTruckSources:function(){
			var jsonObject 		= new Object();
			
			jsonObject.subRegionSelectEle_primary_key = sourceBranch.subRegionId;
			
			getJSON(jsonObject,	WEB_SERVICE_URL + '/selectOptionsWS/getBranchOption.do?AllOptionsForBranch=false&isDisplayDeActiveBranch=false', _this.setTruckSource,EXECUTE_WITHOUT_ERROR);
		}, setTruckInformation : function() {
			$("#vehicleNumberEle").val(lorryHireDetails.vehicleNumber);
			$("#vehicleNumberEle_primary_key").val(lorryHireDetails.vehicleNumberMasterId);
			$("#driverLicenceNumberEle").val(lorryHireDetails.licenceNumber);
			$("#driverLicenceNumberEle_primary_key").val(lorryHireDetails.licenceNumber);
			$("#driverNameEle").val(lorryHireDetails.driverName);
			$("#driverMobileNumberEle").val(lorryHireDetails.driverMobileNo);
		}, setDestination : function(responseDestination) {
			var autoDest = new Object();
			unloadDestinationBranch = responseDestination.destinationBranch;

			if($("#crossingBranchEle_primary_key").val() > 0) {
				var unloadingCrossingBranchObj	= new Object()
				unloadingCrossingBranchObj.branchId		= $("#crossingBranchEle_primary_key").val();
				unloadingCrossingBranchObj.branchName	= $("#crossingBranchEle").val();
				
				$("#truckDestinationEle").val(unloadingCrossingBranchObj.branchName);
				
				var unloadingCrossingBranchArr = new Array();
				unloadingCrossingBranchArr.push(unloadingCrossingBranchObj);
				
				autoDest.url 			= unloadingCrossingBranchArr;
				autoDest.primary_key 	= 'branchId';
				autoDest.field 			= 'branchName';
				
				$("#truckDestinationEle").autocompleteCustom(autoDest);
				
				$("#truckDestinationEle_primary_key").val(unloadingCrossingBranchObj.branchId);
				$("#truckDestinationEle").prop('disabled', true);
			} else {
				autoDest.url 			= responseDestination.destinationBranch;
				autoDest.primary_key 	= 'branchId';
				autoDest.field 			= 'branchName';
				
				if(lsPropertyConfig.srcDestWiseSeqCounter)
					autoDest.callBack 		= _this.getSourceDestinationWiseLSSequenceCounter;
				
				$("#truckDestinationEle").autocompleteCustom(autoDest);
			}
		}, setTruckSource : function(jsonObj) {
			var autoSource 				= new Object();
			
			autoSource.url 				= jsonObj.sourceBranch;
			autoSource.primary_key 		= 'branchId';
			autoSource.field 			= 'branchName';

			$("#truckSourceEle").autocompleteCustom(autoSource);
			
		}, getDispatchExecutive:function() {
			var object = new Object();
			object.sourceBranchId = $('#sourceSelectEle_primary_key').val();
			getJSON(object, WEB_SERVICE_URL+'/selectOptionsWS/getExecutiveListByBranch.do', _this.setExecutive, EXECUTE_WITH_ERROR);
		}, setExecutive:function(response){
			var autoExec = new Object();
			autoExec.url 			= response.executiveList;
			autoExec.primary_key 	= 'executiveId';
			autoExec.field 			= 'executiveName';
			$("#executiveSelectEle").autocompleteCustom(autoExec);
		}, setManaulLSSequence : function() {
			if(manualLsSequenceCounterPresent != undefined && manualLsSequenceCounterPresent && lsPropertyConfig.rangeCheckInManualLS) {
				var minRange			= manualLSSequenceCounter.minRange;
				var maxRange			= manualLSSequenceCounter.maxRange;
				
				$('#minRangeSequenceEle').val(minRange);
				$('#maxRangeSequenceEle').val(maxRange);
				$('#manualLSRange').html(minRange + ' - ' + maxRange);
			}
			
			if(lsPropertyConfig.disbleManualLsToggleButton) {
				$(".manualLSSequenceClass").switchClass("hide", "show");
				$("#isManualDispatch").css("display","none");
			} else {
				$('#isManualDispatch').bootstrapSwitch({
					on 				: 'YES',
					off 			: 'NO',
					onLabel 		: 'YES',
					offLabel 		: 'NO',
					deactiveContent : 'Do you want to dispatch with manual LS ?',
					activeContent 	: 'Do you want to dispatch without manual LS ?'
				});
				
				if ($('#isManualDispatch').is(':checked')) {
					if(!manualLsSequenceCounterPresent && lsPropertyConfig.rangeCheckInManualLS) {
						showMessage('info', manualLSRangeNotPrrsentInfoMsg);
						return;
					} else {
						$(".manualLSSequenceClass").switchClass("hide", "show");
						$(".manualLSDateClass").switchClass("hide", "show");
					}
				} else {
					$(".manualLSSequenceClass").switchClass("show", "hide");
					
					if(lsPropertyConfig.allowManualLsDateOnAutoLs)
						$(".manualLSDateClass").switchClass("hide", "show");
					else
						$(".manualLSDateClass").switchClass("show", "hide");
				}
				
				$("#isManualDispatch").change(function() {
					if ($('#isManualDispatch').is(':checked')) {
						if(!manualLsSequenceCounterPresent && lsPropertyConfig.rangeCheckInManualLS) {
							showMessage('info', manualLSRangeNotPrrsentInfoMsg);
							return;
						}
						
						$(".manualLSSequenceClass").switchClass("hide", "show");
						$(".manualLSDateClass").switchClass("hide", "show");
					} else {
						$(".manualLSSequenceClass").switchClass("show", "hide");
						
						if(lsPropertyConfig.allowManualLsDateOnAutoLs)
							$(".manualLSDateClass").switchClass("hide", "show");
						else
							$(".manualLSDateClass").switchClass("show", "hide");
					}
				});
			}
			
			if(!lsPropertyConfig.ManualLSSequence && lsPropertyConfig.ManualLSDate)
				$(".manualLSDateClass").switchClass("hide", "show");
				
			if(lsPropertyConfig.disbleManualLsToggleButton)
				$(".manualLSDateClass").switchClass("hide", "show");
			
			if(lsPropertyConfig.allowManualLsDateOnAutoLs)
				$(".manualLSDateClass").switchClass("hide", "show");
		}, checkDuplicateManualLS : function(response) {
			if(response.isManualLSNoExists) {
				showMessage('info', response.isManualLSNoExistsMsg);
				$('#manualLSNumber').val(0);
			}
		}, onDispatch : function(response) {
			if(response.message != undefined){
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				$(".ok").removeClass('hide');
				doneTheStuff	= false;
				TOKEN_KEY			= response.TOKEN_KEY;
				TOKEN_VALUE			= response.TOKEN_VALUE;
				return;
			}
			
			var MyRouter = new Marionette.AppRouter({});
			MyRouter.navigate('&modulename=loadingSheet&'+MASTERID+"="+response.dispatchLedgerId+'&'+MASTERID2+"="+response.lsNumber+'&isLhpvLockingAfterLsCreation='+response.isLhpvLockingAfterLsCreation+'&isNewModuleLhpvLockingAfterLsCreation='+response.isNewModuleLhpvLockingAfterLsCreation,{trigger: true});
			hideLayer();
			location.reload();
		}, getDriverNameAndMobNum : function() {
			var jsonValue 	= $('#'+$(this).attr('id')).attr('sub_info');
			var obj 		= eval( '(' + jsonValue + ')' );
			//$("#driverLicenceNumberEle").val(obj.licenceNumber);
			$("#driverNameEle").val(obj.driverName);
			$("#driverMobileNumberEle").val(obj.mobileNumber);
			$("#driverIdEle").val(obj.driverMasterId);
			$('#driverLicenceNumberEle_primary_key').val(obj.driverMasterId);
		}, checkForNewDriver : function() {
			var driverValue 		= $('#'+$(this).attr('id')+'_primary_key').val();
			var driverValueString	= $("#driverLicenceNumberEle").val();
			
			if (driverValue == "" && driverValueString.length > 0 ) {
				var btModalConfirm = new Backbone.BootstrapModal({
					content		: 	"Driver Not Present In Record. Do You Want To Create New?",
					modalWidth 	: 	30,
					title		:	'New Driver',
					okText		:	'YES',
					showFooter 	: 	true,
					okCloses	:	true
				}).open();
				
				btModalConfirm.on('ok', function() {
					var jsonObjectData	= new Object();
					myNodeDriver = nod();
					jsonObjectData.node	= myNodeDriver;
					btDriverModalConfirm = new Backbone.BootstrapModal({
						modalId		: 'newDriver',
						content		: new CreateNewDriver(jsonObjectData),
						modalWidth 	: 80,
						title		: 'New Driver',
						okText		: 'SAVE',
						showFooter 	: true,
						okCloses	: false,
						focusOk		: false
					}).open();
					
					btDriverModalConfirm.on('ok', function() {
						myNodeDriver.performCheck();
						if(myNodeDriver.areAll('valid')){
							var jsonDataObject	= new Object();
							var $inputs = $('#newDriver :input');
							//this will iterate all elements and will set the name as key and value of Element as value in jsonObject
							$inputs.each(function (index){if($(this).val() != ""){jsonDataObject[$(this).attr('name')] = $.trim($(this).val());}});
							getJSON(jsonDataObject, WEB_SERVICE_URL+'/driverWS/saveDriver.do', _this.onSaveDriver, EXECUTE_WITHOUT_ERROR); //submit JSON
						}
					});				
				});			
				$("#driverLicenceNumberEle").val("");
			}
		}, onSaveDriver : function(response) {
			$("#driverIdEle").val(response.driverMasterId);
			btDriverModalConfirm.close();
		}, getVehicleDataOnVehicleSelect : function() {
			var jsonObject = new Object();
			
			if($("#" + $(this).attr("id") + "_primary_key").val() == undefined )
				jsonObject.vehicleNumberMasterId = $("#vehicleNumberEle_primary_key").val();
			else
				jsonObject.vehicleNumberMasterId = $("#" + $(this).attr("id") + "_primary_key").val();
			
			jsonObject["vehicleNumberEle"]				= $('#vehicleNumberEle').val();
			jsonObject['validateTripSheet']				= lsPropertyConfig.validateTripSheet;
			jsonObject['vehicleDriverMappingAllowed']	= lsPropertyConfig.vehicleDriverMappingAllowed;
			
			if(tripHisabRequired)
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/tripHisabSettlementWS/getOwnVehicleNumberDetailsForTripHisab.do', _this.getVehicleNumberData, EXECUTE_WITHOUT_ERROR);
			else
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/dispatchWs/getVehicleNumberDetailsForDispatch.do', _this.setVehicleNumberData, EXECUTE_WITHOUT_ERROR);
		}, getVehicleNumberData : function(response) {
			if(response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
			
			var vehicleType					= response.vehicleType;
			var vehicleNumberMaster			= response.vehicleNumberMaster;
			var incomeExpenseChargeMaster	= response.IncomeExpenseChargeMaster;
		
			if(vehicleType.includes(vehicleNumberMaster.vehicleOwner)) {
				var jsonObjectData 			= new Object();
				var myNode 					= nod();
				
				jsonObjectData.vehicleOwner					= vehicleNumberMaster.vehicleOwner;
				jsonObjectData.node							= myNode;
				jsonObjectData.incomeExpenseChargeMaster	= incomeExpenseChargeMaster
				
				var btModalConfirm = new Backbone.BootstrapModal({
					content		: 	"Do You Want To Add Rawana Expense for Trip Hisab ?",
					modalWidth 	: 	30,
					title		:	'Add Rawana Expense',
					okText		:	'YES',
					showFooter 	: 	true,
					okCloses	:	true
				}).open();
				
				btModalConfirm.on('ok', function() {
					var btModal = new Backbone.BootstrapModal({
						content		: new TripHisabLSDetails(jsonObjectData),
						modalId		: 'tripLSDetails',
						modalWidth 	: 80,
						title		: 'Trip Details',
						okText		: 'Save',
						showFooter 	: true,
						okCloses	: false,
						focusOk		: false
					}).open();
					
					btModal.on('ok', function() {
						myNode.performCheck();
			
						if(myNode.areAll('valid')) {
							var jsonObject 	= new Object();
							var $inputs 	= $('#tripLSDetails :input');
							//this will iterate all elements and will set the name as key and value of Element as value in jsonObject
							$inputs.each(function (index){if($(this).val() != ""){jsonObject[$(this).attr('name')] = $.trim($(this).val());}});
							
							jsonObject["IncomeExpenseChargeMaster"] 	= incomeExpenseChargeMaster;
							
							tripHisabLSInfo		= jsonObject;
							btModal.close();
						}
					});		
				});
			}
		}, setVehicleNumberData  : function(response){
			var vehicleNumberMaster			= response.vehicleNumberMaster;
			isValidRC						= response.isValidRC;
			
			if (!isValidRC) {
				showMessage('error', validRCErorMsg);
				$('#vehicleNumberEle').focus();
				return false;
			}
			
			$("#vehicleAgentListEle").val(vehicleNumberMaster.vehicleAgentName);
			
			setTimeout(function() {
				$(".ac_result_area").css('display','none');
				$("#vehicleAgentListEle_primary_key").val(vehicleNumberMaster.vehicleAgentMasterId);
			}, 600);
			
			vehicleAgentMasterId = vehicleNumberMaster.vehicleAgentMasterId;
			
			if(lsPropertyConfig.vehicleInsuranceValidityCheck && response.isInsuranceValidityCheckRequired) {
				var temp = _.template('\
				    <div class="modal-dialog" style="width:30%;color:#0B0B3B;box-shadow: 0 15px 30px rgba(0,0,0,.9);"><div class="modal-content">\
				      <div class="modal-header">\
				        <a class="close">&times;</a>\
				        <h3><span data-selector="editModalHeader">Policy Renewal Reminder</span></h3>\
				      </div>\
				    <div class="modal-body" style="padding:10px;height:100px;"><h5>Vehicle Policy Validity has been expired. Please renew as soon as possible.</h5></div>\
				      <div class="modal-footer" style="text-align:center;">\
				        <a href="#" class="btn ok btn-primary">Ok</a>\
				      </div>\
				    </div></div>\
				  ');
				  
				var btModalConfirm = new Backbone.BootstrapModal({
					template	: temp
				}).open();
			}
			
			if(lsPropertyConfig.vehicleAgentSelection) {
				if(vehicleNumberMaster.vehicleOwner == HIRED_VEHICLE_ID) {
					myNod.add({
						selector		: '#vehicleAgentListEle',
						validate		: 'validateAutocomplete:#vehicleAgentListEle_primary_key',
						errorMessage	: 'Select proper Vehicle Agent'
					});
				} else {
					myNod.remove('vehicleAgentListEle');
				}
			}
			
			if(lsPropertyConfig.validateTripSheet)
				_this.getValidateTripSheetData(response);
			
			if(lsPropertyConfig.vehicleDriverMappingAllowed)
				_this.setDriverDetails(response);
		}, setDriverDetails : function(response) {
			if(response.driverMasterList == undefined)
				return;
			
			if(response.driverMasterList.length == 1) {
				var driverAutoComplete = new Object();
				driverAutoComplete.url 				= response.driverMasterList;
				driverAutoComplete.primary_key 		= 'driverMasterId';
				driverAutoComplete.field 			= 'driverName';
				$("#driverNameEle").autocompleteCustom(driverAutoComplete);
			
				var driverMaster = response.driverMasterList[0];
				$("#driverNameEle").val(driverMaster.driverName);
				$("#driverMobileNumberEle").val(driverMaster.mobileNumber);
				$("#driverIdEle").val(driverMaster.driverMasterId);
				$("#driverLicenceNumberEle").val(driverMaster.licenceNumber);
				$("#driverLicenceNumberEle_primary_key").val(driverMaster.licenceNumber);
			} else if(response.driverMasterList.length > 1) {
				var driverAutoComplete = new Object();
				driverAutoComplete.url 				= response.driverMasterList;
				driverAutoComplete.primary_key 		= 'driverMasterId';
				driverAutoComplete.field 			= 'driverName';
				driverAutoComplete.callBack 		= _this.setDriverDetailsFromSelection;
				driverAutoComplete.show_field 		= 'driverMasterId, driverName, licenceNumber, mobileNumber'; //do not remove driverMasterId from here
				driverAutoComplete.sub_info 		= true;
				driverAutoComplete.sub_as 			= {driverName : languageKeyset['driverName'],licenceNumber : languageKeyset['licenceNumber'], mobileNumber : languageKeyset['driverNumber']};
				$("#driverNameEle").autocompleteCustom(driverAutoComplete);
			} else if(response.driverMasterList.length == 0) {
				var driverAutoComplete = new Object();
				driverAutoComplete.url 				= response.driverMasterList;
				driverAutoComplete.primary_key 		= 'driverMasterId';
				driverAutoComplete.field 			= 'driverName';
				$("#driverNameEle").autocompleteCustom(driverAutoComplete);
				$("#driverNameEle").attr("autocomplete", "off");
			}
		}, setDriverDetailsFromSelection : function() {
			var jsonValue 	= $('#'+$(this).attr('id')).attr('sub_info');
			var obj 		= eval( '(' + jsonValue + ')' );
			$("#driverMobileNumberEle").val(obj.mobileNumber);
			$("#driverLicenceNumberEle").val(obj.licenceNumber);
			$("#driverLicenceNumberEle_primary_key").val(obj.licenceNumber);
			$("#driverIdEle").val(obj.driverMasterId);
			
		}, checkForNewVehicle : function() {
			var ele = $(this).attr('id');
			
			setTimeout(function(){
				var vehicleValue 		= $('#'+ele+'_primary_key').val();
				var vehicleValueString	= $("#vehicleNumberEle").val();
				newVehicle 				= $("#vehicleNumberEle").val();
				
				if (vehicleValue == "" && vehicleValueString.length > 0) {
					var btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Vehicle Not Present In Record. Do You Want To Create New?",
						modalWidth 	: 	30,
						title		:	'New Vehicle',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
					
					btModalConfirm.on('ok', function() {
						
						var jsonObjectData	= new Object();
						myNode = nod();
						jsonObjectData.node			= myNode;
						jsonObjectData.newVehicle 	= newVehicle;
						jsonObjectData.moduleId 	= DISPATCH;
						
						btVehicleModalConfirm = new Backbone.BootstrapModal({
							modalId		: 	'newVehicle',
							content		: 	new CreateNewVehicle(jsonObjectData),
							modalWidth 	: 	80,
							title		:	'New Vehicle',
							okText		:	'SAVE',
							showFooter 	: 	true,
							okCloses	: 	false,
							focusOk		:	false
						}).open();
						
						btVehicleModalConfirm.on('ok', function() {
							myNode.performCheck();
							if(myNode.areAll('valid')){
								var jsonDataObject	= new Object();
								jsonDataObject.moduleId		= DISPATCH;
								var $inputs = $('#newVehicle :input');
								//this will iterate all elements and will set the name as key and value of Element as value in jsonObject
								$inputs.each(function (index){if($(this).val() != ""){jsonDataObject[$(this).attr('name')] = $.trim($(this).val());}});
								getJSON(jsonDataObject, WEB_SERVICE_URL+'/vehicleWS/saveVehicle.do', _this.onSaveVehicle, EXECUTE_WITHOUT_ERROR); //submit JSON
							}
						});	
					});
					$("#vehicleNumberEle").val("");
				}
			},200)
		},onSaveVehicle : function(response) {
			//$('#vehicleNumberEle').focus();
			btVehicleModalConfirm.close();
			$('#vehicleNumberEle').val(response.vehicleNumber);

			var autocompleteSourceAndDest = $('#vehicleNumberEle').getInstance();

			$( autocompleteSourceAndDest ).each(function() {
			  
			  this.elem.combo_input.context.value = response.vehicleNumber;
			  document.getElementById(this.elem.combo_input.context.id+'_primary_key').value = response.vehicleNumberMasterId;
			  this._hideResults(this);
			  var _this = this;
			  $('#vehicleNumberEle').focus();
			  setTimeout(function(){_this._hideResults(_this);
			  	  _this.elem.combo_input.context.value = response.vehicleNumber; 
			  	  document.getElementById(_this.elem.combo_input.context.id+'_primary_key').value = response.vehicleNumberMasterId;
				 // myNod.performCheck(["'"+_this.elem.combo_input.context.id+'_primary_key'+"'"]);
				 $('#driverLicenceNumberEle').focus();         
			  },500);
			});
			
			setTimeout(function() {
				_this.getVehicleDataOnVehicleSelect();
			},1000);
		}, checkValidCrossingDestination : function() {
			var crossingAgentId		= $('#crossingAgentSelectEle_primary_key').val();
			var crossingBranchIds	= $('#agentDestinationAreaEle').val();
			var crossingBranchIdArr	= crossingBranchIds.split(',');
			var truckDestination	= $('#truckDestinationEle_primary_key').val();
		    
		    if(crossingAgentId > 0) {
		    	isValidCrossingDest		= isValueExistInArray(crossingBranchIdArr, truckDestination);
		    	
		    	if(!isValidCrossingDest) {
		    		showMessage('info', sameCrossingDestinationBranchInfoMsg);
		    		return false;
		    	}
		    }
		    
		    return true;
		},checkManualLSInRange : function() {
			if(manualLsSequenceCounterPresent != undefined && manualLsSequenceCounterPresent && lsPropertyConfig.rangeCheckInManualLS) {
				if ($('#isManualDispatch').is(':checked')) {
					if(isNaN($('#manualLSNumber').val())) {
						$('#manualLSNumber').val();
						showMessage('info', 'Enter Number !');
						return false;
					}
					
					var manualLSNumber	= parseInt($('#manualLSNumber').val());
					var minRange 		= parseInt($('#minRangeSequenceEle').val());
					var maxRange 		= parseInt($('#maxRangeSequenceEle').val());
					
					if(manualLSNumber >= minRange && manualLSNumber <= maxRange || lsPropertyConfig.AllowToDisptchWithoutChkManulLsSeque)
						return true;
					
					$('#manualLSNumber').val('');
					showMessage('info', manualLsNumberWithinRangeInfoMsg(minRange, maxRange));
					return false;
				}
			}
		    
		    return true;
		}, getSourceDestinationWiseLSSequenceCounter : function() {
			var jsonObject = new Object();
			jsonObject["truckDestinationId"]		= $('#truckDestinationEle_primary_key').val();
			
			if ($('#isManualDispatch').is(':checked')) {
				jsonObject["isManualDispatch"]		= $('#isManualDispatch').is(':checked');
				jsonObject["manualLSNumber"]		= $('#manualLSNumber').val();
			}
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/dispatchWs/getSourceDestinationWiseLSSequenceCounter.do', _this.onSequenceCheck, EXECUTE_WITH_ERROR); //submit JSON
		}, onSequenceCheck : function(response){
			if(response.message != undefined){
				hideLayer();
				var errorMessage = response.message;
				showMessage('error', errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
		}, validateManualLsDateWithAllLrs : function(dispatchData) {
			for(w = 0 ; w < dispatchData.length ; w++){
				var waybillDate  = dispatchData[w].incomingDateTimeStampString;
				
				waybillDate  = waybillDate.split("-");
				waybillDate = new Date(waybillDate[2], parseInt(waybillDate[1],10) - 1, waybillDate[0]);
				
				var manualLSDate = $('#manualLSDate').val().split("-");
				manualLSDate = new Date(manualLSDate[2], parseInt(manualLSDate[1],10) - 1, manualLSDate[0]);
				
				if(waybillDate > manualLSDate) {
					showMessage('error','Manual LS Date earlier then Booking Date of LR Number ' + dispatchData[w].wayBillNumber);
					return false;
				}
			}
			
			return true;
		}, validateManualLsDateForPartBGeneration : function() {
			let partBCheckBox = document.getElementById("partBCheckBoxEle");
			
			if(partBCheckBox != null) {
				if($('#manualLSDate').attr('data-date') == undefined || $('#manualLSDate').attr('data-date') == lsPropertyConfig.maxDate) {
					$(".checkBoxClass").switchClass("show", "hide");
					partBCheckBox.checked = true;
				} else {
					$(".checkBoxClass").switchClass("hide", "show");
					partBCheckBox.checked = false;
				}
			}
		}, getValidateTripSheetByVehicleNumber : function() {
			var jsonValue 	= $('#vehicleNumberEle').attr('sub_info');
			var obj 		= eval( '(' + jsonValue + ')' );
			
			_this.getVehicleDataOnVehicleSelect();
			
			if(lsPropertyConfig.autoSelectVehicleTypeOnVehicleNumber)
				_this.getVehicleTypeOnVehicleNumber(obj);
			
			if(lsPropertyConfig.showRemarkOfVehicleNumber)
				_this.showRemarkOfVehicleNumber(obj);
		}, getValidateTripSheetData : function(response){
			var tripSheetDetails	= response.tripSheet;
			validateTripSheet		= response.validateTripSheet;
			
			if(!validateTripSheet)
				return;
			
			if(tripSheetDetails == null || typeof tripSheetDetails == 'undefined' || tripSheetDetails == undefined) {
				tripSheetNumber=0;
				tripSheetRoute='';
				tripSheet = false;
				tripSheetId=0;
				tripSheetStatus=0;
				showMessage('error', 'Trip Sheet is not created for this Vehicle, First Create Trip sheet in FLEETOP');
				$('#vehicleNumberEle').focus();
				
				if(lsPropertyConfig.setDriverDetailsOnTripSheetNumber) {
					$('#driverNameEle').val("");
					$('#driverMobileNumberEle').val("");
					$('#cleanerNameEle').val("");
					$('#driverLicenceNumberEle').val("");
				}
				return false;
			} else {
				tripSheet 		= true;
				
				tripSheetNumber	= tripSheetDetails.tripSheetNumber;
				tripSheetRoute	= tripSheetDetails.routeName;
				tripSheetId		= tripSheetDetails.tripSheetID;
				tripSheetStatus = tripSheetDetails.tripStutesId;
				
				if(lsPropertyConfig.setDriverDetailsOnTripSheetNumber) {
				    if(tripSheetDetails.tripFristDriverName != null && tripSheetDetails.tripFristDriverName !== 'null')
						$('#driverNameEle').val(tripSheetDetails.tripFristDriverName);
					
					if(tripSheetDetails.tripFristDriverMobile != null && tripSheetDetails.tripFristDriverMobile !== 'null')
						$('#driverMobileNumberEle').val(tripSheetDetails.tripFristDriverMobile);
					
					if(tripSheetDetails.tripCleanerName != null && tripSheetDetails.tripCleanerName !== 'null')
						$('#cleanerNameEle').val(tripSheetDetails.tripCleanerName);
					
					if(tripSheetDetails.tripFristDriverDL != null && tripSheetDetails.tripFristDriverDL != 'null')
						$('#driverLicenceNumberEle').val(tripSheetDetails.tripFristDriverDL);
				}	
			}	
		}, getVehicleTypeOnVehicleNumber: function(obj) {
			$("#vehicleTypeEle").val(obj.vehicleTypeName);
			vehicleTypeId	= obj.vehicleTypeId;
			
			$("#vehicleTypeEle_primary_key").val(obj.vehicleTypeId);
			
			if(vehicleTypeId > 0)
				$('#vehicleTypeEle').attr('disabled', true);
		}, showRemarkOfVehicleNumber : function(obj) {
			let remark		= obj.remark;
			
			$('#vehicleRemark').remove();
			
			if(remark != '' && remark != undefined) {
				$('#truckDetination').append('<div id = "vehicleRemark" class = "col-xs-12"><br><b>Truck Remark :</b> ' + remark + '</div>');
				$("#vehicleRemark").css("color", "red");
				$("#vehicleRemark").css("padding-left", "15px");
				$("#vehicleRemark").css("padding-bottom", "5px");
			}
		}
	});	
});
	
function editDeliveryAt(grid, dataView, row) {
	var id 				= 'deliveryToName_' + row;
	slickGridWrapper4 	= dataView;

	if(dataView.getItem(row).wayBillId != undefined && dataView.getItem(row).deliveryToId != DELIVERY_TO_TRUCK_DELIVERY_ID
			&& dataView.getItem(row).deliveryToId != DIRECT_DELIVERY_DIRECT_VASULI_ID && editableDeliveryAt) {
		wayBillId = dataView.getItem(row).wayBillId;
		window.open ('updateWayBillDeliveryTo.do?pageId=294&eventId=11&wayBillId='+dataView.getItem(row).wayBillId+'&deliveryTo='+DELIVERY_TO_DOOR_ID+'&defaultDeliveryTo='+DELIVERY_TO_DOOR_ID+'&setDefaultDeliveryTo='+true+'&cellId='+id,'newwindow',config='left=300,top=100,height=380,width=800, toolbar=no, menubar=no, scrollbars=no, resizable=no,');
	}
}

//called from updateDeliveryType Module
function setValue(cellValue,selectedDeliveryTo,cellId) {
	var slickData 			= slickGridWrapper4.getItems();
	
	$(slickData).each(function() {
		if(this.wayBillId == wayBillId) {
			this.deliveryToName = cellValue;
			this.deliveryToId   = selectedDeliveryTo;
		}
	});
	
	$("#"+cellId).html(cellValue);
	$("#"+cellId).css('background-color','#449d44');
	$("#"+cellId).css('border-color','#398439');
}
