/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
var PaymentTypeConstant = null;
var moduleId;
var incomeExpenseModuleId;
var ModuleIdentifierConstant = null;
define([
	'marionette'//Marionette
	//marionette JS framework
    ,PROJECT_IVUIRESOURCES +'/resources/js/module/view/vehicle/dispatch/createnewvehicle.js'
    ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/default/triphisablsdetails.js'
    ,'selectizewrapper'
	, 'moment'
	,'elementmodel'//ElementModel
	//Elementmodel consist of default values which is passed when setting it in template
	,'elementTemplateJs'//elementTemplateJs
	//elementtemplate is javascript utility which consist of functions that operate on elements
	//text! is used to convert the html to plain text which helps to fetch HTML through require
	//template for element
	//filepath is defined to get the language path from where should the language file should be loaded for label
	,'jquerylingua'//import in require.config
	,'language'//import in require.config
	,'nodvalidation'//import in require.config
	,'validation'//import in require.config
	,'errorshow'//import in require.config
	,'focusnavigation'//import in require.config
	,'autocompleteWrapper'//
	,'JsonUtility'
	,'messageUtility'
    ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'
	], function (Marionette, CreateNewVehicle, TripHisabPickUpLSDetails, Selectizewrapper) {
	let 
	podDispatchData,
	myNod,
	pickupChargesForGrp,
	doorPickupDispatchConfiguration,
	vehicleDriverMappingAllowed,
	isAllowAddVehicleWhileDispatch	= false,
	isAllowToAddVehicleWhilePickupDispatch	= false,
	isAllowManualSequencePickupLsNumber	= false,
	lrWiseLorryHire	= false,
	tripHisabProperties		= null,
	tripHisabPickUpLSInfo	= null,
	_this,
	minDate,
	maxDate,
	selectDefaultVehicleAgentName = false;
	return Marionette.ItemView.extend({
		initialize: function(data) {
			//_this object is added because this object is not found in onRender function
			podDispatchData 			= data.slickData;
			_this = this;	
		}, render: function(){
			//this is the first method called when this function is called
			//triggerMethod onBeforeRender
			this.triggerMethod("before:render");
			//triggerMethod onRender
			this.triggerMethod("render");
			//triggerMethod onAfterRender
			this.triggerMethod("after:render");
		}, onRender : function() {
			getJSON(null, WEB_SERVICE_URL+'/doorPickupDispatchWS/getDoorPickupDispatchDetailsElement.do', _this.setElements, EXECUTE_WITH_ERROR);
			return _this;
		}, setElements : function(response){
			if(response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}
			
			initialiseFocus();
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);

			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/doorpickupls/doorPickupDispatchDetails.html",function() {
					baseHtml.resolve();
				});
			},200);
			
			doorPickupDispatchConfiguration			= response;
			vehicleDriverMappingAllowed 			= doorPickupDispatchConfiguration.vehicleDriverMappingAllowed;
			isAllowAddVehicleWhileDispatch			= response.isAllowAddVehicleWhileDispatch;
			isAllowToAddVehicleWhilePickupDispatch	= doorPickupDispatchConfiguration.isAllowToAddVehicleWhilePickupDispatch;
			isAllowManualSequencePickupLsNumber		= doorPickupDispatchConfiguration.isAllowManualSequencePickupLsNumber;
			lrWiseLorryHire							= doorPickupDispatchConfiguration.lrWiseLorryHire;
			tripHisabProperties						= response.tripHisabProperties;
			minDate									= response.minDate;
			maxDate									= response.maxDate;
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);
			
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}

				myNod 				= nod();

				myNod.configure({
					parentClass:'validation-message'
				});

				if(doorPickupDispatchConfiguration.vehicleAgentAutoCompleteNeeded){
					selectDefaultVehicleAgentName = true;
					$("#vehicleAgentDiv").removeClass("hide");
					let vehicleAgentAutoComplete = new Object();
					vehicleAgentAutoComplete.url 			= WEB_SERVICE_URL + '/autoCompleteWS/getVehicleAgentAutocomplete.do';
					vehicleAgentAutoComplete.primary_key 	= 'vehicleAgentMasterId';
					vehicleAgentAutoComplete.field 			= 'name';
					$("#vehicleAgentEle").autocompleteCustom(vehicleAgentAutoComplete);			
				}
				
				if(doorPickupDispatchConfiguration.vehicleAutoCompleteNeeded) {
					var autoVehicleNumber 			= new Object();
					autoVehicleNumber.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getVehicleNumberAutocomplete.do';
					
					if(isAllowAddVehicleWhileDispatch && isAllowToAddVehicleWhilePickupDispatch)
						autoVehicleNumber.blurFunction	= _this.checkForNewVehicle;
					
					autoVehicleNumber.primary_key 	= 'vehicleNumberMasterId';
					autoVehicleNumber.field 		= 'vehicleNumber';
					autoVehicleNumber.callBack 		= _this.getVehicleDataOnVehicleSelect;
					
					autoVehicleNumber.show_field 	= 'vehicleOwnerType,vehicleTypeName,capicity,vehicleRegisterdOwner,panNumber';
					autoVehicleNumber.sub_info 		= true;
					autoVehicleNumber.sub_as		= {vehicleOwner : 'Vehicle Owner', vehicleTypeName : 'Vehicle Type', capicity : 'Capacity', vehicleRegisterdOwner : 'Registerd Owner', panNumber : 'PAN Number'};
					$("#vehicleNumber").autocompleteCustom(autoVehicleNumber);
				}
				
				if(doorPickupDispatchConfiguration.showHamalLeaderSelection) {
					var hamalLeaderAutoComplete 			= new Object();
					hamalLeaderAutoComplete.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getHamalTeamLeaderAutocomplete.do?';
					hamalLeaderAutoComplete.primary_key 	= 'hamalMasterId';
					hamalLeaderAutoComplete.field 			= 'displayName';
					$("#hamalLeaderNameEle").autocompleteCustom(hamalLeaderAutoComplete);
				} else 
					$('#hamalTeamLeaderDiv').remove();
					
				var dateOption	= new Object();
				/*dateOption.minDate	= moment().subtract(doorPickupDispatchConfiguration.backDaysAllowedForPickupDispatch, 'day').startOf('day');*/
				
				dateOption.minDate	= minDate;
				dateOption.maxDate	= maxDate;
				dateOption.startDate= maxDate;
				
				$("#manualDateEle").SingleDatePickerCus(dateOption);
				
				pickupChargesForGrp			= response.pickupChargesForGrpArrList;
				PaymentTypeConstant			= response.PaymentTypeConstant;
				moduleId					= response.moduleId;
				ModuleIdentifierConstant	= response.ModuleIdentifierConstant;
				incomeExpenseModuleId		= response.incomeExpenseModuleId;
			
				if(isAllowManualSequencePickupLsNumber) {
					$('#manualPickupLsNum').bootstrapSwitch({
						on 				: 'YES',
						off 			: 'NO',
						onLabel 		: 'YES',
						offLabel 		: 'NO',
						deactiveContent : 'Do you want to dispatch with manual Pickup LS?',
					});
					
					$("#manualLsNo").css("display", "none");
					$("#manualPickupLsNum").change(function(){
						if (!$('#manualPickupLsNum').is(':checked'))
							$("#manualLsNo").css("display", "block");
					});
				} else {
					$(".pickupLsDivLable").remove();
				}
				
				var container = $('#charges');
				
				pickupChargesForGrp.forEach(function(charges) {
					var tr = $('<tr>');
					tr.append('<td><b>' + charges['displayName'] + '</b></td>');
					
					if(charges['pickupChargeTypeMasterId'] == DOOR_PICKUP_TOTAL_LORRY_HIRE)
						tr.append('<td><input type="text" name="charge' + charges['pickupChargeTypeMasterId'] + '" id="charge' + charges['pickupChargeTypeMasterId'] + '" value="0" class="form-control text-right" data-tooltip = "' + charges['displayName'] + '" readonly="readonly" /></td>');
					else
						tr.append('<td><input type="text" name="charge' + charges['pickupChargeTypeMasterId'] + '" id="charge' + charges['pickupChargeTypeMasterId'] + '" value="0" class="form-control text-right" data-tooltip = "' + charges['displayName'] + '"/></td>');
					
					container.append(tr);
				});
				
				if(lrWiseLorryHire)
					$('#charges').hide();
				
				$("#charge1").blur(function() { 
					_this.setTotalLorryHire();
					_this.setBalance();
	            }); 
				
				$("#charge1").keyup(function(){
					_this.setTotalLorryHire();
					_this.setBalance();
				});
				
				$("#charge2").blur(function() { 
					_this.setTotalLorryHire();
	            }); 
				
				$("#charge2").keyup(function(){
					_this.setTotalLorryHire();
				});
				
				$("#charge4").blur(function() { 
					_this.setBalance();
	            }); 
				
				$("#charge4").keyup(function(){
					_this.setBalance();
				});
				
				if(doorPickupDispatchConfiguration.autoExpenseVoucherCreationAllowedWithAdvance) {
					var bankPaymentOperationModel		= new $.Deferred();	//
					
					$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html",function() {
						bankPaymentOperationModel.resolve();
					});
					
					var loadelement 	= new Array();

					loadelement.push(bankPaymentOperationModel);

					$.when.apply($, loadelement).done(function() {
						$("#viewPaymentDetails").click(function() {
							openAddedPaymentTypeModel();
						});

						$("#addedPayment").click(function() {
							$("#addedPaymentTypeModal").modal('hide');
						});

						setIssueBankAutocomplete();
						setAccountNoAutocomplete();
					}).fail(function() {
						console.log("Some error occured");
					});
					
					if(!jQuery.isEmptyObject(response.paymentTypeArr)) {
						Selectizewrapper.setAutocomplete({
							jsonResultList	: 	response.paymentTypeArr,
							valueField		:	'paymentTypeId',
							labelField		:	'paymentTypeName',
							searchField		:	'paymentTypeName',
							elementId		:	'paymentType',
							onChange		:	_this.onPaymentTypeSelect
						});
					}
				}
				
				myNod.add({
					selector		: '#manualDateEle',
					validate		: 'presence',
					errorMessage	: 'Please Enter Date !'
				});
				
				if(doorPickupDispatchConfiguration.vehicleAutoCompleteNeeded) {
					myNod.add({
						selector	: '#vehicleNumber',
						validate	: 'validateAutocomplete:#vehicleNumber',
						errorMessage: 'Select Vehicle Number !'
					});
				}
				
				$(".ok").on('click', function() {
					myNod.performCheck();

					if(myNod.areAll('valid')) {
						
					if(!lrWiseLorryHire)	
						if($("#charge3").val() == 0) {
							showMessage('error', '<i class="fa fa-times-circle"></i>' + ' ' + 'Please Enter Charges');
							$("#charge1").focus();
							return false;
						}
						
						if(doorPickupDispatchConfiguration.autoExpenseVoucherCreationAllowedWithAdvance) {
							if($("#charge4").val() > 0) {
								if(Number($("#charge4").val()) > Number($("#charge1").val())){
									showMessage('error', '<i class="fa fa-times-circle"></i>' + ' ' + ' Advance Amount Can not be more Than '+$("#charge1").val()+ ' !');
									$("#charge4").val(0);
									$("#charge4").focus();
									return false;
								}
								
								var paymentType		= $('#paymentType').val();
								
								if(paymentType <= 0) {
									showMessage('error', '<i class="fa fa-times-circle"></i>' + ' ' + ' Please Select PaymentType ! ');
									$("#paymentType").focus();
									return false;
								}
							}
						}
						
						var finalJsonObj = new Object();
						
						finalJsonObj.lrArray  			= JSON.stringify(podDispatchData);

						var jsonObject = new Object();
						var $inputs = $('#modalBody :input');
						//this will iterate all elements and will set the name as key and value of Element as value in jsonObject
						$inputs.each(function (){
							if($(this).val() != ""){
								jsonObject[$(this).attr('name')] = $.trim($(this).val());
							}
						});
						
						jsonObject.hamalMasterId	= $('#hamalLeaderNameEle_primary_key').val();
						
						finalJsonObj.jsondata = JSON.stringify(jsonObject);
						
						var jsonObject1 = new Object();
						var $inputs = $('#charges :input');
					
						//this will iterate all elements and will set the name as key and value of Element as value in jsonObject
						$inputs.each(function (){
							if($(this).val() != ""){
								jsonObject1[$(this).attr('id')] = $.trim($(this).val());
							}
						});
					
						finalJsonObj.lhpvChrgs 						= JSON.stringify(jsonObject1);
						finalJsonObj.tripHisabPickUpLSInfo 			= JSON.stringify(tripHisabPickUpLSInfo);
						finalJsonObj.paymentValues		= $('#paymentCheckBox').val();
						$(".ok").addClass('hide');
						
						if(selectDefaultVehicleAgentName) {
							var jsonDataObject = JSON.parse(finalJsonObj.jsondata);
								
							var vehicleAgentElePrimaryKeyValue = jsonDataObject.vehicleAgentEle_primary_key;
								
							if(vehicleAgentElePrimaryKeyValue != undefined)
								jsonDataObject.vehicleAgentEle_primary_key = vehicleAgentElePrimaryKeyValue;
							else
								jsonDataObject.vehicleAgentEle_primary_key = $('#selectedVehicleAgentMasterId').val();
							
							finalJsonObj.jsondata = JSON.stringify(jsonDataObject);
						}
						
						var btModalConfirm = new Backbone.BootstrapModal({
							content		: 	"Are you sure you want to Dispatch ?",
							modalWidth 	: 	30,
							title		:	'Dispatch',
							okText		:	'YES',
							showFooter 	: 	true,
							okCloses	:	true
						}).open();

					 	btModalConfirm.on('ok', function() {		
							getJSON(finalJsonObj, WEB_SERVICE_URL+'/doorPickupDispatchWS/validateAnddispatchwayBills.do', _this.onDispatch, EXECUTE_WITH_ERROR); //submit JSON
							showLayer();
						});
						
						btModalConfirm.on('cancel', function() {
							$(".ok").removeClass('hide');
							hideLayer();
						});
					}
				});
			});
		},onPaymentTypeSelect	: function(_this){
			hideShowBankPaymentTypeOptions(document.getElementById("paymentType"));
			
		}, checkForNewVehicle : function() {
			var ele = $(this).attr('id');
			setTimeout(function(){
				var vehicleValue 		= $('#'+ele+'_primary_key').val();
				var vehicleValueString	= $("#vehicleNumber").val();
				newVehicle 				= $("#vehicleNumber").val();
				
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
						jsonObjectData.moduleId 	= DOOR_PICKUP_DISPATCH;
						
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
							
							if(myNode.areAll('valid')) {
								var jsonDataObject	= new Object();
								
								jsonDataObject.moduleId		= DOOR_PICKUP_DISPATCH;
								
								var $inputs = $('#newVehicle :input');
								//this will iterate all elements and will set the name as key and value of Element as value in jsonObject
								$inputs.each(function (){if($(this).val() != ""){jsonDataObject[$(this).attr('name')] = $.trim($(this).val());}});
								getJSON(jsonDataObject, WEB_SERVICE_URL+'/vehicleWS/saveVehicle.do', _this.onSaveVehicle, EXECUTE_WITHOUT_ERROR); //submit JSON
							}
						});				
					});
					$("#vehicleNumber").val("");
				}
			},200)
		}, onSaveVehicle : function(response) {
			btVehicleModalConfirm.close();
			$('#vehicleNumber').val(response.vehicleNumber);

			var autocompleteSourceAndDest = $('#vehicleNumber').getInstance();

			$( autocompleteSourceAndDest ).each(function() {
			  
			  this.elem.combo_input.context.value = response.vehicleNumber;
			  document.getElementById(this.elem.combo_input.context.id+'_primary_key').value = response.vehicleNumberMasterId;
			  this._hideResults(this)
			  var _this = this;
			  $('#vehicleNumber').focus();
			  setTimeout(function(){_this._hideResults(_this);
				  document.getElementById(_this.elem.combo_input.context.id+'_primary_key').value = response.vehicleNumberMasterId;
				  $('#pickUpSourceEle').focus();         
				  myNod.performCheck(["'"+_this.elem.combo_input.context.id+'_primary_key'+"'"]);
			  },500);
			});
		}, getVehicleDataOnVehicleSelect : function() {
			var jsonObject = new Object();
			jsonObject.vehicleNumberMasterId = $("#" + $(this).attr("id") + "_primary_key").val();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/vehicleNumberMasterWS/getVehicleNumberDetailsData.do', _this.getVehicleNumberData, EXECUTE_WITHOUT_ERROR);
		}, getVehicleNumberData : function(response) {
			if(response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}

			var vehicleNumberMaster		= response.vehicleNumberMaster;
			
			document.getElementById("vehicleDetails").innerHTML = '<B>'+response.vehicleNumberMaster.vehicleOwnerType+' - '+response.vehicleNumberMaster.vehicleTypeName+' ( '+response.vehicleNumberMaster.vehicleTypeCapacity+' ) - '+response.vehicleNumberMaster.vehicleAgentName+'</B>';
			$('#selectedVehicleNumberMasterId').val(vehicleNumberMaster.vehicleNumberMasterId);

			if(selectDefaultVehicleAgentName){
				$("#vehicleAgentEle").val(response.vehicleNumberMaster.vehicleAgentName);
				$("#selectedVehicleAgentMasterId").val(response.vehicleNumberMaster.vehicleAgentMasterId);
			}
			
			var jsonObject = new Object();
			jsonObject.vehicleNumberMasterId = vehicleNumberMaster.vehicleNumberMasterId;
			
			if(vehicleDriverMappingAllowed)
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/dispatchWs/getAssignedDriverDetailsForDispatch.do', _this.setDriverDetails, EXECUTE_WITHOUT_ERROR);
			
			if(tripHisabProperties.tripHisabPickUpLSRequired && tripHisabProperties.vehicleOwnerTypeIds.includes(vehicleNumberMaster.vehicleOwner)){
				doneTheStuff = false;
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/tripHisabSettlementWS/getOwnVehicleNumberDetailsForTripHisab.do', _this.setTripHisab, EXECUTE_WITHOUT_ERROR);
			}
		}, setTripHisab : function(response) {
			if(!doneTheStuff) {
				doneTheStuff 				= true;

				var jsonObjectData 			= new Object();
				var myNode 					= nod();

				var vehicleNumberMaster			= response.vehicleNumberMaster;
				var incomeExpenseChargeMaster	= response.IncomeExpenseChargeMaster;

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
						content		: new TripHisabPickUpLSDetails(jsonObjectData),
						modalId		: 'tripPickUpLSDetails',
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
							var $inputs 	= $('#tripPickUpLSDetails :input');
							//this will iterate all elements and will set the name as key and value of Element as value in jsonObject
							$inputs.each(function (){if($(this).val() != ""){jsonObject[$(this).attr('name')] = $.trim($(this).val());}});

							jsonObject["IncomeExpenseChargeMaster"] 	= incomeExpenseChargeMaster;

							tripHisabPickUpLSInfo		= jsonObject;
							btModal.close();
						}
					});		
				});
			}
		}, setDriverDetails : function(response) {
			var driverAutoComplete = null;
			
			if(response.driverMasterList.length == 1) {
				driverAutoComplete = new Object();
				driverAutoComplete.url 				= response.driverMasterList;
				driverAutoComplete.primary_key 		= 'driverMasterId';
				driverAutoComplete.field 			= 'driverName';
				$("#driverNameEle").autocompleteCustom(driverAutoComplete);
				
				var driverMaster = response.driverMasterList[0];
				$("#driverNameEle").val(driverMaster.driverName);
				$("#driverMobileNumberEle").val(driverMaster.mobileNumber);
				$("#driverLicenseNumberEle").val(driverMaster.licenceNumber);
				$("#selectedDriverMasterId").val(driverMaster.driverMasterId);
			} else if(response.driverMasterList.length > 1) {
				driverAutoComplete = new Object();
				driverAutoComplete.url 				= response.driverMasterList;
				driverAutoComplete.primary_key 		= 'driverMasterId';
				driverAutoComplete.field 			= 'driverName';
				driverAutoComplete.callBack 		= _this.setDriverDetailsFromSelection;
				driverAutoComplete.show_field 		= 'driverMasterId, driverName, mobileNumber, licenceNumber'; //do not remove driverMasterId from here
				driverAutoComplete.sub_info 		= true;
				driverAutoComplete.sub_as 			= {driverName : 'Driver Name', mobileNumber : 'Driver Number', licenceNumber : 'Licence Number'};
				$("#driverNameEle").autocompleteCustom(driverAutoComplete);
			} else if(response.driverMasterList.length == 0) {
				$("#driverNameEle").val("");
				$("#driverMobileNumberEle").val("");
				driverAutoComplete = new Object();
				driverAutoComplete.url 				= response.driverMasterList;
				driverAutoComplete.primary_key 		= 'driverMasterId';
				driverAutoComplete.field 			= 'driverName';
				$("#driverNameEle").autocompleteCustom(driverAutoComplete);
			}
		}, setDriverDetailsFromSelection : function() {
			var jsonValue 	= $('#'+$(this).attr('id')).attr('sub_info');
			var obj 		= eval( '(' + jsonValue + ')' );
			$("#driverMobileNumberEle").val(obj.mobileNumber);
			$("#driverLicenseNumberEle").val(obj.licenceNumber);
			$("#selectedDriverMasterId").val(obj.driverMasterId);
		}, onDispatch : function(response) {
			if(response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				
				if(errorMessage.typeName == 'info')
					$(".ok").removeClass('hide');
				
				return;
			}

			hideLayer();
			var MyRouter = new Marionette.AppRouter({});
			MyRouter.navigate('&modulename=pickupLoadingSheet&masterid='+response.doorPickupLedgerId+'&masterid2='+response.doorPickupNumber+'&branchId='+response.doorPickupLedgerBranchId+'&PaymentVoucherSequenceNumber='+response.PaymentVoucherSequenceNumber);
			location.reload();
		}, setTotalLorryHire : function(){
			if($('#charge1').val() > 0 && $('#charge2').val() > 0)
				$('#charge3').val(Number($('#charge1').val()) + Number($('#charge2').val()));
			else if($('#charge1').val() > 0)
				$('#charge3').val(Number($('#charge1').val()));
			else if($('#charge2').val() > 0)
				$('#charge3').val(Number($('#charge2').val()));
			else if($('#charge1').val() == '' && $('#charge2').val() == '') {
				$('#charge1').val(0);
				$('#charge2').val(0);
				$('#charge3').val(0);
			}
		}, setBalance() {
			if($('#charge1').val() > 0 && $('#charge4').val() > 0) {
				$('#charge5').val(Number($('#charge1').val()) - Number($('#charge4').val()));
				$('#charge5').prop('disabled', true);
			} else if($('#charge1').val() > 0) {
				$('#charge5').val(0);
				$('#charge5').val(Number($('#charge1').val()));
				$('#charge5').prop('disabled', true);
			} else if($('#charge4').val() > 0) {
				$('#charge5').val(0);
				$('#charge5').val(-Number($('#charge4').val()));
				$('#charge5').prop('disabled', true);
			} else if($('#charge1').val() == '' && $('#charge4').val() == '') {
				$('#charge1').val(0);
				$('#charge4').val(0);
				$('#charge5').val(0);
				$('#charge5').prop('disabled', true);
			}
		}
	});	
});

function moveFocustoPickUpSourceField(){
	if($("#vehicleNumber").val() != null)
		$("#pickUpSourceEle").focus();
}