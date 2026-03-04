define([ 'JsonUtility'
		,'messageUtility'
		,'/ivcargo/resources/js/generic/urlparameter.js'
		,PROJECT_IVUIRESOURCES + '/resources/js/module/view/editlrsource/editlrsourcefilepath.js'
		,'jquerylingua'
		,'language'
        ,'autocomplete'
        ,'autocompleteWrapper'
        ,'nodvalidation'
        ,'focusnavigation'//import in require.config
        ,'selectizewrapper'
        ,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
],function(JsonUtility, MessageUtility, UrlParameter, FilePath,Lingua, Language, AutoComplete, AutoCompleteWrapper,
		 NodValidation,ElementFocusNavigation,Selectizewrapper){
	'use strict';
	var jsonObject = new Object(), myNod,  _this = '', masterLangObj, masterLangKeySet,sourceBranchIdCurr,waybillId,bookingBranchId;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj){
			_this = this;
			waybillId					= UrlParameter.getModuleNameFromParam('waybillId');
			bookingBranchId				= UrlParameter.getModuleNameFromParam('bookingBranchId');
			sourceBranchIdCurr			= UrlParameter.getModuleNameFromParam('sourceBranchId');
			
		},render : function(){
			var jsonObject = new Object();
			jsonObject["bookingBranchId"] 			= bookingBranchId;
			getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getBranchAutocompleteBySourceBranchId.do?', _this.renderUpdateLRDestination, EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderUpdateLRDestination : function (response){
			console.log(response);
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/editlrsource/editLRSource.html",function() {
				baseHtml.resolve();
			});
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.branchList,
					valueField		:	'locationsMappingAssignedLocationId',
					labelField		:	'locationsMappingName',
					searchField		:	'locationsMappingName',
					elementId		:	'branchEle',
					create			: 	false,
					maxItems		: 	1
				});
				
				masterLangObj = FilePath.loadLanguage();
				masterLangKeySet = loadLanguageWithParams(masterLangObj);
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod.add({
					selector: '#branchEle',
					validate: 'validateAutocomplete:#branchEle',
					errorMessage: 'Select proper Branch !'
				});

				hideLayer();
				$("#saveBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onSubmit(_this);								
					}
				});
			});
			return _this;
		},onSubmit : function() {
			if(sourceBranchIdCurr == Number($('#branchEle').val())) {
				showMessage('info', 'Please Select other than current Source branch');
				return;
			}
			
			showLayer();
			var answer = confirm ("Are you Sure to Update LR Source ?");
			
			if (answer) {
				var jsonObject = new Object();
				
				jsonObject["waybillId"] 			= waybillId;
				jsonObject["sourceBranchId"] 		= $('#branchEle').val();
				jsonObject["prevSourceBranchId"] 	= sourceBranchIdCurr;
				jsonObject["sourceBranchName"] 		= $('.item').html();
				jsonObject["redirectFilter"] 		= UrlParameter.getModuleNameFromParam('redirectFilter');
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/editLrSourceWS/editLRSource.do', _this.setEditSourceResponse, EXECUTE_WITH_ERROR);
			} else {
				hideLayer();
			}
		}, setEditSourceResponse : function(response) {
			redirectToAfterUpdate(response);
		}
	});
});