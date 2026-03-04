define([  
		'/ivcargo/resources/js/generic/urlparameter.js'
		,'JsonUtility'
		,'messageUtility'
		,'autocomplete'
		,'autocompleteWrapper'
		,'nodvalidation'
		,'focusnavigation'//import in require.config
		,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
          ],
          function(UrlParameter) {
	'use strict';
	let myNod,  _this = '', dispatchLedgerId, lsNo, redirectTo, vehicleDriverMappingAllowed, tripSheet = false,validateTripSheet = false, validateTripSheetFromFleetop = false,
	setDriverDetailsOnTripSheetNumber = false, vehicleNumberMasterId = 0, isValidRC = true;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			dispatchLedgerId 				= UrlParameter.getModuleNameFromParam('dispatchLedgerId');
			lsNo							= UrlParameter.getModuleNameFromParam('lsNo');
			redirectTo						= UrlParameter.getModuleNameFromParam('redirectTo');
		}, render : function() {
			let jsonObject = new Object();
			jsonObject["dispatchLedgerId"] 		= dispatchLedgerId;
			getJSON(jsonObject, WEB_SERVICE_URL+'/editLSWS/getUpdateVehicleNumberElement.do', _this.renderUpdateVehicleNumber, EXECUTE_WITH_ERROR);
			return _this;
		}, renderUpdateVehicleNumber : function (response){
			if(response.message != undefined){
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				setTimeout(function() {
					window.close();
				}, 2000);
				return;
			}
			
			let loadelement = new Array();
			let baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			validateTripSheetFromFleetop 		= response.validateTripSheet;
			setDriverDetailsOnTripSheetNumber 	= response.setDriverDetailsOnTripSheetNumber;
			vehicleNumberMasterId				= response.vehicleNumberMasterId;

			$("#mainContent").load("/ivcargo/html/module/updateLSVehicleNumber/updateLSVehicleNumber.html",function() {
				baseHtml.resolve();
			});
			
			vehicleDriverMappingAllowed = response.vehicleDriverMappingAllowed;
			
			$.when.apply($, loadelement).done(function() {
				let keyObject = Object.keys(response);

				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
					else
						$("*[data-attribute="+ element+ "]").remove();
				}
				
				let autoVehicleNumber 			= new Object();
				autoVehicleNumber.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getVehicleNumberAutocomplete.do';
				autoVehicleNumber.primary_key 	= 'vehicleNumberMasterId';
				autoVehicleNumber.field 		= 'vehicleNumber';
				autoVehicleNumber.callBack 		= _this.getVehicleDataOnVehicleSelect;
				$("#vehicleNumber").autocompleteCustom(autoVehicleNumber);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector	: '#vehicleNumber',
					validate	: 'validateAutocomplete:#vehicleNumber',
					errorMessage: 'Select Vehicle Number !'
				});

				hideLayer();

				$("#updateBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
			
			return _this;
		}, getVehicleDataOnVehicleSelect : function() {
			let jsonObject = new Object();
			jsonObject.vehicleNumberMasterId 			= $("#" + $(this).attr("id") + "_primary_key").val();
			jsonObject["vehicleNumberEle"]				= $('#vehicleNumber').val();
			jsonObject['validateTripSheet']				= validateTripSheetFromFleetop;
			jsonObject['vehicleDriverMappingAllowed']	= vehicleDriverMappingAllowed;
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/dispatchWs/getVehicleNumberDetailsForDispatch.do', _this.getVehicleNumberData, EXECUTE_WITHOUT_ERROR);
		}, getVehicleNumberData : function(response) {
			if(response.message != undefined) {
				hideLayer();
				$('#selectedVehicleNumberMasterId').val(0);
				$('#vehicleType').val(0);
				$('#vehicleAgent').val(0);
				$('#vehicleDetailsDiv').html('');
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
			
			let vehicleNumberMaster		= response.vehicleNumberMaster;
			isValidRC				 	= response.isValidRC;
			
			$('#selectedVehicleNumberMasterId').val(vehicleNumberMaster.vehicleNumberMasterId);
			$('#vehicleType').val(vehicleNumberMaster.vehicleOwner);
			$('#vehicleAgent').val(vehicleNumberMaster.vehicleAgentMasterId);
			
			if(vehicleNumberMaster.vehicleAgentName != undefined)
				$('#vehicleDetailsDiv').html('<b>' + vehicleNumberMaster.vehicleOwnerType + ' - ' + vehicleNumberMaster.vehicleTypeName + '(' + vehicleNumberMaster.vehicleTypeCapacity + ')' + ' - ' + vehicleNumberMaster.vehicleAgentName);
			else
				$('#vehicleDetailsDiv').html('<b>' + vehicleNumberMaster.vehicleOwnerType + ' - ' + vehicleNumberMaster.vehicleTypeName + '(' + vehicleNumberMaster.vehicleTypeCapacity + ')');
			
			_this.getValidateTripSheetData(response);
			
			if(vehicleDriverMappingAllowed)
				_this.setDriverDetails(response);
			else
				_this.setDriverDetailsNameAutocomplete();
		}, setDriverDetails : function(response) {
			if(response.driverMasterList == undefined)
				return;
				
			let driverAutoComplete = null;
			
			if(response.driverMasterList.length == 1) {
				driverAutoComplete = new Object();
				driverAutoComplete.url 				= response.driverMasterList;
				driverAutoComplete.primary_key 		= 'driverMasterId';
				driverAutoComplete.field 			= 'driverName';
				$("#driverNameEle").autocompleteCustom(driverAutoComplete);
				
				let driverMaster = response.driverMasterList[0];
				$("#driverNameEle").val(driverMaster.driverName);
				$("#driverMobileNumberEle").val(driverMaster.mobileNumber);
				$("#driverLicenseNumberEle").val(driverMaster.licenceNumber);
				$("#selectedDriverMasterId").val(driverMaster.driverMasterId);
			} else if(response.driverMasterList.length > 1) {
				driverAutoComplete = new Object();
				driverAutoComplete.url 				= response.driverMasterList;
				driverAutoComplete.primary_key 		= 'driverMasterId';
				driverAutoComplete.field 			= 'driverName';
				driverAutoComplete.callBack 		= _this.getDriverDataOnDriverSelect;
				driverAutoComplete.show_field 		= 'driverMasterId, driverName, mobileNumber, licenceNumber'; //do not remove driverMasterId from here
				driverAutoComplete.sub_info 		= true;
				driverAutoComplete.sub_as 			= {driverName : 'Driver Name', mobileNumber : 'Mobile Number', licenceNumber : 'License Number'};
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
		}, setDriverDetailsNameAutocomplete : function() {
			let autoDriverName 				= new Object();
			autoDriverName.url 				= WEB_SERVICE_URL+'/autoCompleteWS/getDriverAutocomplete.do';
			autoDriverName.primary_key 		= 'driverMasterId';
			autoDriverName.field 			= 'driverName';
			autoDriverName.callBack 		= _this.getDriverDataOnDriverSelect;
			autoDriverName.show_field 		= 'driverMasterId, driverName, mobileNumber, licenceNumber';
			autoDriverName.sub_info 		= true;
			autoDriverName.sub_as			= {driverName : 'Driver Name', mobileNumber : 'Mobile Number', licenceNumber : 'License Number'};
			$("#driverNameEle").autocompleteCustom(autoDriverName);
		}, getDriverDataOnDriverSelect : function() {
			let jsonValue 	= $('#' + $(this).attr('id')).attr('sub_info');
			let obj 		= eval( '(' + jsonValue + ')' );
			$("#driverMobileNumberEle").val(obj.mobileNumber);
			$("#driverLicenseNumberEle").val(obj.licenceNumber);
			$("#selectedDriverMasterId").val(obj.driverMasterId);
		}, onSubmit : function() {
			if(vehicleNumberMasterId > 0 && Number($('#selectedVehicleNumberMasterId').val()) > 0
				&& vehicleNumberMasterId == Number($('#selectedVehicleNumberMasterId').val())) {
				showMessage('error', 'You cannot update same vehicle number !');
				return;
			}
			
			if(!isValidRC) {
				showMessage('error', validRCErorMsg);
				return;
			}
			
			if(!tripSheet && validateTripSheet) {
				showMessage('error', 'No Trip Sheet is created for this Vehicle, First Create Trip sheet in FLEETOP');
				return false;
			} else {
				let answer = confirm ("Are you Sure to Update Vehicle Number ?");
				
				if (answer) {
					let jsonObject = new Object();
					
					jsonObject["lsNumber"] 				= lsNo;
					jsonObject["dispatchLedgerId"] 		= dispatchLedgerId;
					jsonObject["vehicleNumber"] 		= $('#vehicleNumber').val();
					jsonObject["redirectTo"]			= redirectTo;
					jsonObject["driverMasterId"]		= $('#selectedDriverMasterId').val();
					jsonObject["driverName"]			= $("#driverNameEle").val();
					jsonObject["driverMobileNumber"]	= $('#driverMobileNumberEle').val();
				
					showLayer();
					getJSON(jsonObject, WEB_SERVICE_URL+'/editLSWS/updateVehicleNumber.do', _this.setEditVehicleNumberResponse, EXECUTE_WITH_ERROR);
				} else {
					hideLayer();
				}
			}
		}, setEditVehicleNumberResponse : function(response) {
			if(response.message != undefined) {
				hideLayer();
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
			
			redirectToAfterUpdate(response);
			   
			hideLayer();
		}, getValidateTripSheetData : function(response) {
			let tripSheetDetails	= response.tripSheet;
			validateTripSheet	= response.validateTripSheet;
			
			if(!validateTripSheet)
				return;

			if(tripSheetDetails == null || typeof tripSheetDetails == 'undefined' || tripSheetDetails == undefined) {
				tripSheet = false;
				showMessage('error', 'No Trip Sheet is created for this Vehicle, First Create Trip sheet in FLEETOP');
				
				if(setDriverDetailsOnTripSheetNumber) {
					$('#driverNameEle').val("");
					$('#driverMobileNumberEle').val("");
					$('#cleanerNameEle').val("");
					$('#driverLicenceNumberEle').val("");
				}
				
				return;
			}
			
			if(setDriverDetailsOnTripSheetNumber) {
				if(tripSheetDetails.tripFristDriverName != null && tripSheetDetails.tripFristDriverName !== 'null')
					$('#driverNameEle').val(tripSheetDetails.tripFristDriverName);
					
				if(tripSheetDetails.tripFristDriverMobile != null && tripSheetDetails.tripFristDriverMobile !== 'null')
					$('#driverMobileNumberEle').val(tripSheetDetails.tripFristDriverMobile);
					
				if(tripSheetDetails.tripCleanerName != null && tripSheetDetails.tripCleanerName !== 'null')
					$('#cleanerNameEle').val(tripSheetDetails.tripCleanerName);
					
				if(tripSheetDetails.tripFristDriverDL != null && tripSheetDetails.tripFristDriverDL != 'null')
					$('#driverLicenceNumberEle').val(tripSheetDetails.tripFristDriverDL);
			}
				
			tripSheet = true;
		}
	});
});