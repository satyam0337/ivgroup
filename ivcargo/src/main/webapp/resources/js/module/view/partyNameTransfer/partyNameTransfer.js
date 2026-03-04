/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([ 'marionette'
         ,'JsonUtility'
         ,'messageUtility'
         ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/partyNameTransfer/partyNameTransferFilePath.js'
         ,'jquerylingua'
         ,'language'
         ,'nodvalidation'
		 ,'focusnavigation'
		 ,'selectizewrapper'
		 ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'//PopulateAutocomplete
        ], function(Marionette, JsonUtility, MessageUtility, FilePath, jquerylingua, language, NodValidation, FocusNavigation, Selectizewrapper, Selection) {

	'use strict';// this basically give strictness to this specific js 
	var jsonObject	= new Object(),
	masterLangObj, 
	masterLangKeySet,
	myNod,
	_this = '';
	// to know about layout refer url:http://marionettejs.com/docs/v1.8.7/marionette.layout.html
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/partyNameTransferWS/getPartyNameTransferElement.do', _this.renderElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderElements : function(response) {
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/template/partyNameTransfer/pagetemplateforpartynametransfer.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				loadLanguageWithParams(FilePath.loadLanguage());
				
				response.accountGroupSelection	= true;
				
				Selection.setSelectionToGetData(response);
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.partyArrayList,
					valueField		:	'partyNameIdentifier',
					labelField		:	'partyNameIdentifierLevel',
					searchField		:	'partyNameIdentifierLevel',
					elementId		:	'partyIdentifier',
					create			: 	false,
					maxItems		: 	1
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.tbbPartyArrayList,
					valueField		:	'partyNameIdentifier',
					labelField		:	'partyNameIdentifierLevel',
					searchField		:	'partyNameIdentifierLevel',
					elementId		:	'tbbPartyIdentifier',
					create			: 	false,
					maxItems		: 	1
				});
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector		: '#accountGroupEle',
					validate		: 'presence',
					errorMessage	: 'Select Group !'
				});
				
				hideLayer();
				
				$(".transferPartyNameBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid')) {
						_this.onTransferPartyNameDetails(_this);
					}
				});
				
				$(".transferTBBPartyNameBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid')) {
						_this.onTransferTBBPartyNameDetails(_this);
					}
				});
			});
		}, onTransferPartyNameDetails : function() {
			_this = this;
			
			showLayer();
			var jsonObject = new Object();
			
			jsonObject["accountGroupEle"] 		= $('#accountGroupEle').val();
			jsonObject["partyIdentifier"] 		= $('#partyIdentifier').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/partyNameTransferWS/updatePartyNameWithIdentifier.do', _this.setData, EXECUTE_WITHOUT_ERROR);
		}, onTransferTBBPartyNameDetails : function() {
			_this = this;
			
			showLayer();
			var jsonObject = new Object();
			
			jsonObject["accountGroupEle"] 		= $('#accountGroupEle').val();
			jsonObject["tbbPartyIdentifier"] 	= $('#tbbPartyIdentifier').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/partyNameTransferWS/updateTBBPartyNameWithIdentifier.do', _this.setData, EXECUTE_WITHOUT_ERROR);
		}, setData : function(response) {
			if(response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
			
			hideLayer();
		}
	});
});