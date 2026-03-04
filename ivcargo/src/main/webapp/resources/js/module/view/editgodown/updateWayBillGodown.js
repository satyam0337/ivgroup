define([ 'marionette'
         ,'JsonUtility'
         ,'messageUtility'
         ,'/ivcargo/resources/js/generic/urlparameter.js'
         ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/editgodown/updateWayBillGodownFilePath.js'
         ,'jquerylingua'
         ,'language'
         ,'nodvalidation'
		 ,'focusnavigation'
		 ,'selectizewrapper',
		 '/ivcargo/resources/js/module/redirectAfterUpdate.js',
         ],
         function(Marionette, JsonUtility, MessageUtility, UrlParameter, FilePath, jquerylingua, language, NodValidation, FocusNavigation, Selectizewrapper) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	wayBillId,
	godownId,
	ReceivedAtBranchId,
	myNod,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//initialize is the first function called on call new view()
			_this = this;
			wayBillId 				= UrlParameter.getModuleNameFromParam('wayBillId');
			godownId  				= UrlParameter.getModuleNameFromParam('godownId');
			ReceivedAtBranchId  	= UrlParameter.getModuleNameFromParam('ReceivedAtBranchId');
		},
		render: function() {
			jsonObject["waybillId"]				= wayBillId;
			jsonObject["ReceivedAtBranchId"]	= ReceivedAtBranchId;
			console.log(jsonObject);
			getJSON(jsonObject, WEB_SERVICE_URL + '/updateWayBillGodownWS/getDetailsToUpdate.do?', _this.renderUpdateWayBillGodown, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderUpdateWayBillGodown : function(response) {
			if(response.GODOWN_LIST == undefined) {
				showMessage('info', '<i class="fa fa-info-circle"></i> No records found, please try again. ');
				hideLayer();
				return;
			}
			
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/editgodown/updateWayBillGodown.html",
					function() {
						baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				loadLanguageWithParams(FilePath.loadLanguage());
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.GODOWN_LIST,
					valueField		:	'godownId',
					labelField		:	'name',
					searchField		:	'name',
					elementId		:	'godown',
					create			: 	false,
					maxItems		: 	1,
					items			:	[godownId]
				});
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector		: '#godown',
					validate		: 'validateAutocomplete:#godown',
					errorMessage	: 'Select Godown !'
				});

				hideLayer();
				
				$(".updateBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid')) {
						_this.updateGodown(_this);
					}
				});
			});
		},updateGodown : function() {
			
			var jsonObject			= new Object();

			jsonObject["godownId"]	= $('#godown').val();
			jsonObject["waybillId"]	= wayBillId;
			jsonObject["ReceivedAtBranchId"]	= ReceivedAtBranchId;
			
			console.log(jsonObject);
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/updateWayBillGodownWS/updateWayBillGodown.do?', _this.redirectToPage, EXECUTE_WITHOUT_ERROR);
		},redirectToPage : function(response) {
			redirectToAfterUpdate(response);
			
			hideLayer();
		}
	});
});