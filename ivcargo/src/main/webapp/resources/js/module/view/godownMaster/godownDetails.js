define([
	'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/godownMaster/godownMaterFilePath.js'
	 ,'jquerylingua'
	 ,'language'
	 ,'slickGridWrapper2'
	 ,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	 ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
], function(JsonUtility, MessageUtility, FilePath, Lingua, Language, slickGridWrapper2, UrlParameter, Selection) {
	'use strict';
	var jsonObject = new Object(), masterLangKeySet,_this = '',godownMasterConfiguration;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/godownMasterWS/viewAllGodownElement.do?', _this.setGodownDetailsData, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setGodownDetailsData : function(response) {
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				
				setTimeout(function() {
					window.close();
				}, 200);
				
				return;
			}
			
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/master/godownMasterDetails.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show)
						$("*[data-attribute=" + keyObject[i] + "]").removeClass("hide");
				}
				
				godownMasterConfiguration	= response.godownMasterConfiguration;
				
				var elementConfiguration				= new Object();
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration			= elementConfiguration;
				response.sourceAreaSelection			= true;
				response.AllOptionsForRegion			= godownMasterConfiguration.AllOptionsForRegion;
				response.AllOptionsForSubRegion			= godownMasterConfiguration.AllOptionsForSubRegion;
				response.AllOptionsForBranch			= godownMasterConfiguration.AllOptionsForBranch;

				Selection.setSelectionToGetData(response);
				
				masterLangKeySet 	= loadLanguageWithParams(FilePath.loadLanguage());
				
				$("#searchBtn").click(function() {
					_this.onSubmit();
				});	

				hideLayer();
			});
		}, onSubmit : function() {
			showLayer();
			var jsonObject = new Object();
			
			jsonObject["regionId"] 					= $('#regionEle_primary_key').val();
			jsonObject["subRegionId"] 				= $('#subRegionEle_primary_key').val();
			jsonObject["sourceBranchId"] 			= $('#branchEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/godownMasterWS/viewAllGodown.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			$("#godownmasterDiv").empty();

			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				return;
			}
			
			var godownMasterColumnConfig  	= response.GODOWN_LIST.columnConfiguration;
			var godownMasterColumnKeys		= _.keys(godownMasterColumnConfig);
			var godownMasterDetailConfig	= new Object();
					
			for (var i = 0; i < godownMasterColumnKeys.length; i++) {
				var bObj	= godownMasterColumnConfig[godownMasterColumnKeys[i]];
						
				if (bObj.show)
					godownMasterDetailConfig[godownMasterColumnKeys[i]] = bObj;
			}

			response.GODOWN_LIST.columnConfiguration	= godownMasterDetailConfig;
			response.GODOWN_LIST.Language				= masterLangKeySet;
				
			$('#middle-border-boxshadow').removeClass('hide');
			hideAllMessages();
			slickGridWrapper2.setGrid(response.GODOWN_LIST);
				
			hideLayer();
		}
	});
});