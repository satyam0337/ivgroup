define([  
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,'JsonUtility'
	,'messageUtility'
	,'focusnavigation'//import in require.config
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	], function(UrlParameter) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(), wayBillId, _this = '';
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
			this.$el.html(this.template);
	
			wayBillId				= UrlParameter.getModuleNameFromParam(MASTERID);
		}, render: function() {
			jsonObject				= new Object();
			jsonObject.waybillId	= wayBillId;
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/updateApprovalTypeWS/getApprovalTypeData.do', _this.loadElements, EXECUTE_WITH_ERROR); //submit JSON
			
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

			$("#mainContent").load("/ivcargo/html/module/waybill/update/updateApprovalType.html", function() {
						baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				
				hideLayer();

				$("<option/>").val(0).text("Select Approval Type").appendTo($("#approvalType"))
				$("<option/>").val(1).text(APPROVAL_TYPE_SHORT_QUANTITY_NAME).appendTo($("#approvalType"))
				$("<option/>").val(2).text(APPROVAL_TYPE_DEDUCTION_NAME).appendTo($("#approvalType"))
				$("<option/>").val(3).text(APPROVAL_TYPE_NOT_APPLICABLE_NAME).appendTo($("#approvalType"))
				
				$("#updateApprovalTypeBtn").click(function() {					
						_this.updateApproveType();
				});
			});
		}, updateApproveType : function() {
			let jsonObjectNew 	= new Object();

			jsonObjectNew["waybillId"] 			= wayBillId;
			jsonObjectNew["approvalTypeId"]		= $("#approvalType").val();

			$("#updateBtn").addClass('hide');
					
			if(!confirm('Are you sure you want Update Approval Type ?'))
				return;

			showLayer();
			getJSON(jsonObjectNew, WEB_SERVICE_URL+'/updateApprovalTypeWS/updateApprovalType.do', _this.redirectToPage, EXECUTE_WITH_ERROR); //submit JSON
		}, redirectToPage : function(response) {
			redirectToAfterUpdate(response);
			hideLayer();
		}
	});
});
