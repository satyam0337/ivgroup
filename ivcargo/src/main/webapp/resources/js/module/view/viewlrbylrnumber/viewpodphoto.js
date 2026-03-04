define([ 'marionette'
         ,'JsonUtility'
         ,'messageUtility'
         ,'/ivcargo/resources/js/generic/urlparameter.js'
         ,'/ivcargo/resources/js/module/view/photoservice/displayphotowithslider.js'
         ],
         function(Marionette, JsonUtility, MessageUtility, UrlParameter, PhotoWithSlider) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	wayBillId,
	moduleId,
	myNod,
	accountGroupId,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//initialize is the first function called on call new view()
			_this = this;
			wayBillId 					= $("#wayBillId").val().trim();
			moduleId					= 2;//POD_WAYBILL
			accountGroupId				= $("#accountGroupId").val().trim();
			jsonObject.masterid			= wayBillId;
			jsonObject.moduleId			= moduleId;
			jsonObject.accountGroupId	= accountGroupId;
		},
		render: function() {
			jsonObject.isCRMPage = true;
			getJSON(jsonObject, CUSTOMER_ACCESS_URL_CONSTANT + '/photoTransactionWS/getModuleWisePhotoDetail.do?', _this.renderPODPhotoService, EXECUTE_WITH_ERROR);
			return _this;
		},
		renderPODPhotoService : function(response) {
			if(response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				setTimeout(function(){ window.close(); }, 1000);
				return;
			}
			
			var loadelement 	= new Array();
			var baseHtml 		= new $.Deferred();
			loadelement.push(baseHtml);
		
			$("#modalBody").load("/ivcargo/jsp/services/podPhotoCustomerAccess.html",
					function() {
						baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				hideLayer();
				
				$('#savePhotoMessage').html('Click to view or save Photo !');
				
				var photoModelList		= response.photoModelList;
				
				PhotoWithSlider.displayPhotoWithSlider(response);
			});
			
			hideLayer();
		}
	});
});