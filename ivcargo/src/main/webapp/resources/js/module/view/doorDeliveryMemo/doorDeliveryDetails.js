define([
        'marionette'
        ,'text!'+PROJECT_IVUIRESOURCES+'/template/ddmqrcode/ddmqrcode.html'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/doorDeliveryMemo/doorDeliveryMemoFilePath.js'
        ,'jquerylingua'
        ,'language'
        ,'autocompleteWrapper'
        ,'focusnavigation'
        ,'nodvalidation'
        ,'validation'
        ], function(Marionette, Template, FilePath) {
	var myNod,
	chargeTypeModelList,
	_this;
	return {
		setLorryHireDetails:function(dataInObject){
			_this = this;
			var btModal = new Backbone.BootstrapModal({
				content		: Template,
				modalWidth 	: 80,
				title		:'Lorry Details',
				okText		:'Door Delivery',
				showFooter 	: true,
				focusOk		: false,
				okCloses	: false
			}).open();

			hideLayer();

			btModal.on('shown', function() {
				myNod = nod();
				setValidationInNod({},myNod);
				myNod.add({
					selector: '#vehicleNumberEle',
					validate: 'validateAutocomplete:#vehicleNumberEle_primary_key',
					errorMessage: 'Select proper Vehicle Number'
				});

				myNod.add({
					selector: '#vehicleDestinationEle',
					validate: 'validateAutocomplete:#vehicleDestinationEle_primary_key',
					errorMessage: 'Select proper Destination'
				});

				myNod.add({
					selector: '#driverNameEle',
					validate: 'presence',
					errorMessage: 'Cannot be left blank'
				});
				myNod.add({
					selector: '#driverNumberEle',
					validate: 'integer',
					errorMessage: 'Should be numeric'
				});
				myNod.add({
					selector: '#lorryHireEle',
					validate: 'presence',
					errorMessage: 'Cannot be left blank'
				});

				initialiseFocus('#modalBody');
				var langObj = FilePath.loadLanguage();
				LangKeySet = loadLanguageWithParams(langObj);
				_this.initialisevehicleAutocomplete();
				_this.getTruckDestinations(dataInObject.data);
				$('#modalBody:first *:input[type!=hidden]:first').focus();
			});

			btModal.on('ok',function(){
				myNod.performCheck();
				
				if(myNod.areAll('valid'))
					_this.ConfirmDialogue(dataInObject.data);
			})
		}, initialisevehicleAutocomplete : function() {
			let autoVehicleNumber = new Object();
			autoVehicleNumber.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getVehicleNumberAutocomplete.do';
			autoVehicleNumber.primary_key 	= 'vehicleNumberMasterId';
			autoVehicleNumber.field 		= 'vehicleNumber';

			$("#vehicleNumberEle").autocompleteCustom(autoVehicleNumber)
		}, getTruckDestinations : function(dataInObject) {
			let dispatchData = dataInObject.getItems();
			let destinationBranches = new Array();
			
			if(dispatchData != undefined && dispatchData.length > 0) {
				for(const element of dispatchData) {
					destinationBranches.push(element["wayBillInfoDestinationBranchId"]);
				}

				destinationBranches = getUniqueArr(destinationBranches);

				getJSON({destinationBranchIds : destinationBranches.join(",")}, WEB_SERVICE_URL+'/deliveryRunsheetWS/getDoorDeliveryDestination.do', _this.setDestination, EXECUTE_WITH_ERROR);
			}
		}, setDestination : function(response){
			let autoVehicleNumber 			= new Object();
			autoVehicleNumber.url 			= response.branchModel;
			autoVehicleNumber.primary_key 	= 'branchId';
			autoVehicleNumber.field 		= 'branchName';

			$("#vehicleDestinationEle").autocompleteCustom(autoVehicleNumber)
		}, onDispatch : function(response) {
			if(response.message != undefined) {
				hideLayer();
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
			
			setTimeout(function(){hideLayer();},10);
			let MyRouter = new Marionette.AppRouter({});
			MyRouter.navigate('&modulename=doorDeliveryMemo&DeliveryRunSheetLedgerId='+response.DeliveryRunSheetLedgerId+'&DDMNumber='+response.DDMNumber,{trigger: true});
			location.reload();
		}, ConfirmDialogue : function(dataInObject) {
			let jsonObject = new Object();
			let $inputs = $('#modalBody :input');
			$inputs.each(function (index){if($(this).val() != ""){jsonObject[$(this).attr('name')] = $.trim($(this).val());}});
			
			let btModalConfirm = new Backbone.BootstrapModal({
				content			: "Are you sure you want to Door Deliver ?",
				modalWidth 		: 30,
				title			:'Door Deliver',
				okText			:'YES',
				showFooter 		: true,
				okCloses		: true
			}).open();

			btModalConfirm.on('ok', function() {
				let finalJsonObj 	= new Object();
				let dispatchData 	= dataInObject.getItems();
				let wayBillArray 	= new Array();
				
				if(dispatchData != undefined && dispatchData.length > 0){
					for(const element of dispatchData){
						var shantabai =  {
							wayBillId : element["wayBillId"]
							, consignmentSummaryActualWeight : element["consignmentSummaryActualWeight"]
							, wayBillNumber : element["wayBillNumber"]
							, consignmentSummaryQuantity : element["consignmentSummaryQuantity"]
							, wayBillRemark : element["wayBillRemark"]
						}
						
						if (chargeTypeModelList != undefined) {
							for (var j = 0; j < chargeTypeModelList.length; j++) {
								if (element["charge_" + chargeTypeModelList[j].chargeTypeMasterId] != undefined)
									shantabai['charge_' + chargeTypeModelList[j].chargeTypeMasterId]	= element["charge_"+chargeTypeModelList[j].chargeTypeMasterId];
								else
									shantabai['charge_' + chargeTypeModelList[j].chargeTypeMasterId]	= 0;
							}
						}
						
						wayBillArray.push(shantabai);
					}
				}
				
				finalJsonObj.wayBillColl 	= JSON.stringify(wayBillArray);
				finalJsonObj.ddmDetails 	= JSON.stringify(jsonObject);
				getJSON(finalJsonObj, WEB_SERVICE_URL+'/deliveryRunsheetWS/submitDataForDoorDelivery.do', _this.onDispatch, EXECUTE_WITH_ERROR); //submit JSON
				showLayer();
			});
		}, setChargeTypeModelList : function(chargeTypeList) {
			chargeTypeModelList	= chargeTypeList;
		}
	}
});
