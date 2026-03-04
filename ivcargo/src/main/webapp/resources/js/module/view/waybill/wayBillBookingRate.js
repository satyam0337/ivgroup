var wayBillBookingRateList = null;
var wayBillBookingRateObj;
define([ 'marionette'
         ,'/ivcargo/resources/js/generic/urlparameter.js'
         ,'JsonUtility'
         ,'messageUtility'
         ,'nodvalidation'
         ,'autocompleteWrapper'
		 ,'focusnavigation'
		 ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		 ,PROJECT_IVUIRESOURCES + '/resources/js/module/redirectAfterUpdate.js'
         ],
         function(Marionette, UrlParameter) {
	'use strict';// this basically give strictness to this specific js
	let jsonObject	= new Object(),
	wayBillId,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function() {
			//initialize is the first function called on call new view()
			_this = this;
			wayBillId 				= UrlParameter.getModuleNameFromParam('wayBillId');
			
			jsonObject.waybillId	= wayBillId;
		}, render: function() {
			jsonObject	= new Object();
			jsonObject.waybillId	= wayBillId;
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/wayBillBookingRateWS/getWayBillBookingRateData.do?', _this.setResponseDetails, EXECUTE_WITHOUT_ERROR);
		}, setResponseDetails : function(response) {
			
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/waybill/wayBillBookingRate.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				if(response.message != undefined) {
					let errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					hideLayer();
					setTimeout(() => {
						window.close();
					}, 2000);
					return;
				}
				
				wayBillBookingRateList	= response.wayBillBookingRateList;
				wayBillBookingRateObj = wayBillBookingRateList[wayBillBookingRateList.length - 1];
				
				let myNod = nod();
				_this.setSelectType();
				
				$('#previousRateEle').val(wayBillBookingRateObj.rate);
				$('#actualRateEle').val(wayBillBookingRateObj.actualRate);
				addAutocompleteElementInNode(myNod, 'typeEle', 'Select Type !')
				
				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
				
				hideLayer();
			});
		}, setSelectType : function() {
			_this.setSelectTypeAutocompleteInstance();
			
			let autoSelectType = $("#typeEle").getInstance();
			
			let selectTYPE = [
				{ "selectTypeId":1, "selectTypeName": "Add Commission" },
				{ "selectTypeId":2, "selectTypeName": "Minus Commission" },
			]
			
			$( autoSelectType ).each(function() {
				this.option.source = selectTYPE;
			})
		}, setSelectTypeAutocompleteInstance : function() {
			let autoSelectTypeName 			= new Object();
			autoSelectTypeName.primary_key 	= 'selectTypeId';
			autoSelectTypeName.field 		= 'selectTypeName';

			$("#typeEle").autocompleteCustom(autoSelectTypeName)
		}, onSubmit : function() {
			var currRate =  wayBillBookingRateObj.rate - Number($('#currentRateEle').val());
			if(Number($('#typeEle_primary_key').val()) == 2 && currRate < wayBillBookingRateObj.actualRate) {
				showMessage("error","You can not minus rate less than "+wayBillBookingRateObj.actualRate);
				return false;
			}
			
			if(confirm("Are you sure?")) {
				showLayer();
				let jsonObject = new Object();
	
				jsonObject["waybillId"] 		= wayBillBookingRateObj.wayBillId;
				jsonObject["chargedWeight"] 	= wayBillBookingRateObj.chargedWeight;
				jsonObject["typeId"] 			= $('#typeEle_primary_key').val();
				jsonObject["previousRate"] 		= $('#previousRateEle').val();
				jsonObject["currentRate"] 		= $('#currentRateEle').val();
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/wayBillBookingRateWS/updateWayBillBookingData.do', _this.onUpdate, EXECUTE_WITH_ERROR);
			}
		}, onUpdate : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				let successMessage = response.message;
				showMessage(successMessage.typeName, successMessage.typeSymble + '' + successMessage.description);
			}
			
			setTimeout(function() { 
				window.close();
			}, 200);
		}
	});
});