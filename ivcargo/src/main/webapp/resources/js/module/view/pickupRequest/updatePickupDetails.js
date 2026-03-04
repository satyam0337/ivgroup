var wayBillId;
define([ 'marionette'
         ,'/ivcargo/resources/js/generic/urlparameter.js'
		 ,'slickGridWrapper2'
		 ,'nodvalidation'
		 	,'autocomplete'
	,'autocompleteWrapper'
		 ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
		 ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		 ,'/ivcargo/resources/js/validation/regexvalidation.js'
         ,'JsonUtility'
         ,'messageUtility'
		 ,'focusnavigation'
         ],
         function(Marionette, UrlParameter, AutoComplete, AutoCompleteWrapper) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(), myNod,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			//initialize is the first function called on call new view()
			_this = this;
			wayBillId 				= UrlParameter.getModuleNameFromParam('wayBillId');
			jsonObject.waybillId	= wayBillId;
		}, render: function() {
			jsonObject				= new Object();
			jsonObject.waybillId	= wayBillId;

			getJSON(jsonObject, WEB_SERVICE_URL + '/updatePickupDetailsWS/getPreviousPickupDetailsToUpdate.do?', _this.setPickupDetails, EXECUTE_WITHOUT_ERROR);
		}, setPickupDetails : function(response) {
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
						
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/waybill/editPickupDetails/updatePickupDetails.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				if(response.message != undefined) {
					var errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					hideLayer();
						
					$(".btAddNew").click(function() {
						 _this.addNewRows();
					});
					
					$(".saveBtn").click(function() {
						 _this.submitPickupDetailsData();
					});
	
				}
					let autoVehicleNumber = new Object();
				autoVehicleNumber.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getVehicleNumberAutocomplete.do';
				autoVehicleNumber.primary_key 	= 'vehicleNumberMasterId';
				autoVehicleNumber.field 		= 'vehicleNumber';
				$("#vehicleNumberEle").autocompleteCustom(autoVehicleNumber);
	
				let executiveNameAutoComplete = new Object();
				executiveNameAutoComplete.primary_key = 'executiveId';
				executiveNameAutoComplete.url = response.executiveList;
				executiveNameAutoComplete.field = 'executiveName';
				$("#executiveNameEle").autocompleteCustom(executiveNameAutoComplete);
				
				
				hideLayer();
				
				$('#bottom-border-boxshadow').removeClass('hide');
				$('#reportData1 tbody').empty();
				$('#editPickupDetails').empty();
				
				 _this.setPickupTableDetails(response);				
			});
		}, setPickupTableDetails: function(response) {

			var pickupDetailsArrList = response.pickupDetailsArr;

			if(pickupDetailsArrList != undefined){
      			$('.pickup').removeClass('hide');
      		}else{
				setTimeout(function(){window.close();},1000);
			}
					
			var obj = pickupDetailsArrList[0];

			$('#executiveNameEle').val(obj.assignExecutiveName);
			$('#vehicleNumberEle').val(obj.vehicleNumber)


			$(".saveBtn").click(function() {
				var vehicleNumberId = $('#vehicleNumberEle_primary_key').val().trim();
				var assignExecutiveId = $('#executiveNameEle_primary_key').val().trim();

				if (vehicleNumberId !== "" && assignExecutiveId !== "") {
					_this.submitPickupDetailsData(obj);
				} else {
					showMessage('error', 'Please Select Vehicle And User');
				}
			});

		}, submitPickupDetailsData: function(obj) {
			var jsonObject = new Object();
			let pickupDetailsArray  = new Array();
			
			let pickupDetails = new Object();
				
			pickupDetails.vehicleNumberId 					= $('#vehicleNumberEle_primary_key').val();
			pickupDetails.assignExecutiveId  				= $('#executiveNameEle_primary_key').val();
			pickupDetails.previousAssignExecutiveId 		= obj.assignExecutiveId;
			pickupDetails.previousVehicleNumberId 			= obj.vehicleNumberId;
			pickupDetails.wayBillId 						= wayBillId;
			pickupDetails.pickupRequestId 					= obj.pickupRequestId;

			pickupDetailsArray.push(pickupDetails);

			jsonObject.pickupDetails = JSON.stringify(pickupDetailsArray);;

			showLayer();				
			getJSON(jsonObject, WEB_SERVICE_URL + '/updatePickupDetailsWS/updatePickupDetails.do?', _this.redirectToPage, EXECUTE_WITHOUT_ERROR);
		},redirectToPage : function(response) {

			if(response.message != undefined){
			setTimeout(() => {
						window.close();
					}, 1000);
			}
			hideLayer();
		}
	});
})
