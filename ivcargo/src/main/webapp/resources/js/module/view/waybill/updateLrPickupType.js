define([  
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,'JsonUtility'
	,'messageUtility'
	,'focusnavigation'//import in require.config
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	], function(UrlParameter) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(), wayBillId, myNod, _this = '';
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
			this.$el.html(this.template);
	
			wayBillId				= UrlParameter.getModuleNameFromParam(MASTERID);
		}, render: function() {
			jsonObject				= new Object();
			jsonObject.waybillId	= wayBillId;
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/updateLrPickupTypeWS/getLrPickupTypeData.do', _this.loadElements, EXECUTE_WITH_ERROR); //submit JSON
			
			hideLayer();
		}, loadElements : function(response) {
			if(response.message != undefined) {
				let successMessage = response.message;
				showMessage(successMessage.typeName, successMessage.typeSymble + '' + successMessage.description);
					
				setTimeout(function(){
					window.close();
				},1500);
			}
			
			let loadelement = new Array();
			let baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/waybill/update/updateLrPickupType.html", function() {
						baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {

				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector		: '#remark',
					validate		: 'presence',
					errorMessage	: 'Insert Remark !'
				});
				
				hideLayer();

				$("#updateLrPickupTypeBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.updateLrPickupType();
				});
				
				$("<option/>").val(0).text("Select Pickup Type").appendTo($("#pickupType"))
				$("<option/>").val(1).text("Godown").appendTo($("#pickupType"))
				$("<option/>").val(2).text("Door").appendTo($("#pickupType"))
			});
		}, updateLrPickupType : function() {
			let jsonObjectNew 	= new Object();

			jsonObjectNew["waybillId"] 			= wayBillId;
			jsonObjectNew["remark"] 			= $("#remark").val();
			jsonObjectNew["pickupTypeId"]		= $("#pickupType").val();
				
			$("#updateBtn").addClass('hide');
					
			if(!confirm('Are you sure you want Update Pickup Type ?'))
				return;
				
			showLayer();
			getJSON(jsonObjectNew, WEB_SERVICE_URL+'/updateLrPickupTypeWS/updateLrPickupType.do', _this.redirectToPage, EXECUTE_WITH_ERROR); //submit JSON
		}, redirectToPage : function(response) {
			redirectToAfterUpdate(response);
			hideLayer();
		}
	});
});
