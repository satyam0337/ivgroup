define([
        //the file which has only name they are are already  been loaded
        'marionette'//Marionette
        //marionette JS framework
        ,'constant' //Constant
        //constant for project name and domain urls
        ,'text!'+PROJECT_IVUIRESOURCES+'/template/ddmqrcode/ddmqrcode.html'//Elements
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dmmwithqrcodescan/ddmqrcodebehavior.js'
        ,'jquerylingua'
        ,'language'//import in require.config
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dmmwithqrcodescan/ddmscanqrcodefilepath.js'
        ,'autocompleteWrapper'//
        ,'focusnavigation'//import in require.config
        ,'nodvalidation'
        ,'validation'
        ], function(Marionette,Constant,Template,QRCodeBehavior,jquerylingua,language,FilePath,AutocompleteWrapper,focusnavigation,nodvalidation,validation){
	var myNod,
	_this;
	// to know about layout refer url:http://marionettejs.com/docs/v1.8.7/marionette.layout.html
	return {
		setLorryHireDetails:function(dataInObject,showPartyIsBlackListedParty,allowDDMForBlackListedParty){
			_this = this;
						
			if((showPartyIsBlackListedParty == 'true' || showPartyIsBlackListedParty == true)){
				var dataObject 	= dataInObject.data.getItems();
				var showMessageFlag = false;
				
				for(var i = 0 ; i< dataObject.length ; i++){
					if(dataObject[i].consignorBlackListed > 0){
						showMessageFlag = true;
					}else if(dataObject[i].consigneeBlackListed > 0){
						showMessageFlag = true;
					}else if(dataObject[i].tbbPartyBlackListed > 0){
						showMessageFlag = true;
					}
				}
				if(showMessageFlag && (!allowDDMForBlackListedParty)){
					showMessage('error',"Door Delivery is not Allowed For Black Listed Lr");
					return false;
				}
			}
			
			var btModal = new Backbone.BootstrapModal({
				content			: Template,
				modalWidth 		: 80,
				title			:'Lorry Details',
				okText			:'Door Delivery',
				showFooter		: true,
				focusOk			:false,
				okCloses		:false
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
			})
			btModal.on('ok',function(){
				myNod.performCheck();
				if(myNod.areAll('valid')){
					_this.ConfirmDialogue(dataInObject.data);
				}
			})
			btModal.on('cancel',function(){
				$('#play').trigger( "click" );
			})
		},initialisevehicleAutocomplete:function(){
			var autoVehicleNumber = new Object();
			autoVehicleNumber.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getVehicleNumberAutocomplete.do';
			autoVehicleNumber.primary_key 	= 'vehicleNumberMasterId';
			autoVehicleNumber.field 		= 'vehicleNumber';

			$("#vehicleNumberEle").autocompleteCustom(autoVehicleNumber);
		},getTruckDestinations:function(dataInObject){
			var dispatchData 		= dataInObject.getItems();
			var destinationBranches = new Array();
			
			if(dispatchData != undefined && dispatchData.length > 0){
				for(var i = 0; i < dispatchData.length; i++) {
					destinationBranches.push(dispatchData[i]["wayBillInfoDestinationBranchId"]);
				}

				destinationBranches = getUniqueArr(destinationBranches);

				getJSON({destinationBranchIds:destinationBranches.join(",")}, WEB_SERVICE_URL+'/deliveryRunsheetWS/getDoorDeliveryDestination.do', _this.setDestination, EXECUTE_WITH_ERROR);
			}
		},setDestination:function(response){
			var autoVehicleNumber 			= new Object();
			autoVehicleNumber.url 			= response.branchModel;
			autoVehicleNumber.primary_key 	= 'branchId';
			autoVehicleNumber.field 		= 'branchName';

			$("#vehicleDestinationEle").autocompleteCustom(autoVehicleNumber)
		},onDispatch:function(response){
			if(response.message != undefined){
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
			setTimeout(function(){hideLayer();},10);
			var MyRouter = new Marionette.AppRouter({});
			MyRouter.navigate('&modulename=ddmWithQRCode&DeliveryRunSheetLedgerId='+response.DeliveryRunSheetLedgerId+'&DDMNumber='+response.DDMNumber,{trigger: true});
			location.reload();
		},ConfirmDialogue:function(dataInObject){
			var jsonObject = new Object();
			var $inputs = $('#modalBody :input');
			//this will iterate all elements and will set the name as key and value of Element as value in jsonObject
			$inputs.each(function (index){if($(this).val() != ""){jsonObject[$(this).attr('name')] = $.trim($(this).val());}});
			var btModalConfirm = new Backbone.BootstrapModal({
				content			: "Are you sure you want to Door Deliver ?",
				modalWidth 		: 30,
				title			: 'Door Deliver',
				okText			: 'YES',
				showFooter		: true,
				okCloses		: true
			}).open();

			btModalConfirm.on('ok', function() {
				var finalJsonObj 	= new Object();
				var dispatchData 	= dataInObject.getItems();
				var wayBillArray 	= new Array();
				var wayBillData		= new Object();
				
				if(dispatchData != undefined && dispatchData.length > 0){
					for(var i=0;i<dispatchData.length;i++){
						var wayBillCollData =  {
						 wayBillId:dispatchData[i]["wayBillId"]
						,consignmentSummaryActualWeight:dispatchData[i]["consignmentSummaryActualWeight"]
						,wayBillNumber:dispatchData[i]["wayBillNumber"]
						,consignmentSummaryQuantity:dispatchData[i]["consignmentSummaryQuantity"]
						,wayBillTypeId:dispatchData[i]["wayBillInfoWayBillTypeId"]
						,wayBillRemark:dispatchData[i]["wayBillRemark"]
						}
						if (chargeTypeModelList != undefined) {
							for (var j=0; j<chargeTypeModelList.length; j++) {
								if (dispatchData[i]["charge_"+chargeTypeModelList[j].chargeTypeMasterId] != undefined) {
									wayBillCollData['charge_'+chargeTypeModelList[j].chargeTypeMasterId]	= dispatchData[i]["charge_"+chargeTypeModelList[j].chargeTypeMasterId];
								} else {
									wayBillCollData['charge_'+chargeTypeModelList[j].chargeTypeMasterId]	= 0;
								}
							}
						}
						wayBillArray.push(wayBillCollData);
					}
				}
				
				finalJsonObj.wayBillColl = JSON.stringify(wayBillArray);
				finalJsonObj.ddmDetails = JSON.stringify(jsonObject);
				
				getJSON(finalJsonObj, WEB_SERVICE_URL+'/deliveryRunsheetWS/submitDataForDoorDelivery.do', _this.onDispatch, EXECUTE_WITH_ERROR); //submit JSON
				showLayer();
			});
		},setChargeTypeModelList:function(chargeTypeList) {
			chargeTypeModelList	= chargeTypeList;
		}
	}
});
