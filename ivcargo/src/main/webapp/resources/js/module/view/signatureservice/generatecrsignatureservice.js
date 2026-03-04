define([ 'marionette'
         ,'JsonUtility'
         ,'messageUtility'
         ,'/ivcargo/resources/js/generic/urlparameter.js'
         ],
         function(Marionette, JsonUtility, MessageUtility, UrlParameter) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	crid,
	myNod,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//initialize is the first function called on call new view()
			_this = this;
			crid 			= UrlParameter.getModuleNameFromParam('crid');
			
			jsonObject.crId	= crid;
		},
		render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/generateCashReceiptServiceInfoWS/getGenerateCRSignatureService.do?', _this.renderSignatureService, EXECUTE_WITHOUT_ERROR);
			return _this;
		},
		renderSignatureService : function(response) {
			if(response.signatureModel == undefined) {
				showMessage('info', '<i class="fa fa-info-circle"></i> No records found, please try again. ');
				hideLayer();
				return;
			}
			
			var loadelement 	= new Array();
			var baseHtml 		= new $.Deferred();
			loadelement.push(baseHtml);
		
			$("#mainContent").load("/ivcargo/jsp/services/signatureservice.html",
					function() {
						baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				hideLayer();
				
				var signatureModel		= response.signatureModel;
				
				var signatureTransactionSignature	= signatureModel.signatureTransactionSignature;
				
				var img = $('<img id="img">');
				img.attr('src', signatureTransactionSignature);
				img.attr('height', '400');
				img.attr('width', '400');
				img.appendTo('#signatureService');
			});
			
			hideLayer();
		}
	});
});