define([ 'marionette'
		,'/ivcargo/resources/js/generic/urlparameter.js'
 		,'JsonUtility'
		,'messageUtility'
 		,'nodvalidation'
		,'focusnavigation',
		'/ivcargo/resources/js/module/redirectAfterUpdate.js',
 		],
		function(Marionette, UrlParameter) {
	'use strict';// this basically give strictness to this specific js
	let jsonObject	= new Object(),
	wayBillId,
	previousPrivateMarka,
	myNod,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function() {
			//initialize is the first function called on call new view()
			_this = this;
			wayBillId 				= UrlParameter.getModuleNameFromParam(MASTERID);

			jsonObject.waybillId	= wayBillId;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/updateWayBillPrivateMarkaWS/getDetailsToUpdate.do?', _this.renderUpdateWayBillPrivateMarka, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderUpdateWayBillPrivateMarka : function(response) {
			let loadelement = new Array();
			let baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/waybill/update/updateWayBillPrivateMarka.html",
					function() {
						baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector		: '#privateMarka',
					validate		: 'presence',
					errorMessage	: 'Insert Private Marka !'
				});
				
				previousPrivateMarka	= response.PrevoiusPrivateMarka;
				$('#privateMarka').val(previousPrivateMarka);
				
				hideLayer();
				
				$(".saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.updatePrivateMarka();
				});
			});
		}, updatePrivateMarka : function() {
			let jsonObject			= new Object();
			
			jsonObject.PrivateMarka			= $('#privateMarka').val();
			jsonObject.PrevoiusPrivateMarka	= previousPrivateMarka;
			jsonObject.waybillId			= wayBillId;
			
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/updateWayBillPrivateMarkaWS/updateWayBillPrivateMarka.do?', _this.redirectToPage, EXECUTE_WITHOUT_ERROR);
		}, redirectToPage : function(response) {
			redirectToAfterUpdate(response);
			
			hideLayer();
		}
	});
});