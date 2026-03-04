define([  
	'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
	,'focusnavigation'//import in require.config
	],function(slickGridWrapper2, Selection) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject = new Object(),  _this;

	return Marionette.LayoutView.extend({
		initialize: function(){
			_this = this;
		}, render: function(){
			getJSON(jsonObject, WEB_SERVICE_URL+'/branchLocatorWS/getBranchDetailsGridData.do', _this.setElementData, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setElementData : function(response) {
			if(response.message != undefined)
				return;
			
			var loadelement					= new Array();
			var baseHtml					= new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/branchDetailsInSlickGrid/branchDetailsInSlickGrid.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}
				
				var elementConfiguration				= new Object();
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration			= elementConfiguration;
				response.sourceAreaSelection			= true;
				response.AllOptionsForRegion			= true;
				response.AllOptionsForSubRegion			= true;
				response.AllOptionsForBranch			= true;
				response.isPhysicalBranchesShow			= true;
				Selection.setSelectionToGetData(response);
				
				var autoTypeName 					= new Object();
				autoTypeName.primary_key 			= 'branchTypeOfLocation';
				autoTypeName.field 					= 'branchTypeOfLocationString';

				$("#typeEle").autocompleteCustom(autoTypeName);

				var autoType = $("#typeEle").getInstance();

				$(autoType).each(function() {
					this.option.source = response.BranchTypeOfLocationList;
				})
				
				_this.onLoadData();		
				
				$("#searchBtn").click(function(){
					_this.onSubmit();
				});						
			})
		},onLoadData : function(){
			showLayer();
			var jsonObject = new Object();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/branchLocatorWS/getBranchDetailsOnLoadGridData.do', _this.setReportData, EXECUTE_WITH_ERROR);
		},onSubmit : function(){
			showLayer();
			var jsonObject = Selection.getElementData();
			
			jsonObject["typeId"] 	= $('#typeEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/branchLocatorWS/getBranchDetailsSelectionWiseGridData.do', _this.setReportData, EXECUTE_WITH_ERROR);
		},setReportData : function(response) {
			$("#branchDetailsDiv").empty();

			if(response.message != undefined) {
				hideLayer();
				$('#bottom-border-boxshadow').hide();
				return;
			}
			
			if(response.CorporateAccount != undefined) {
				hideAllMessages();
				$('#bottom-border-boxshadow').show();
				slickGridWrapper2.setGrid(response);
			} else {
				$('#bottom-border-boxshadow').hide();
			}
			
			hideLayer();
		} 
	});
});
