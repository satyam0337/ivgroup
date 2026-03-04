define([
	 'slickGridWrapper2',
	 PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
	'JsonUtility',
	 'messageUtility',
	 'bootstrapSwitch',
	 'nodvalidation',
	 'focusnavigation',
	 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	],function(slickGridWrapper2, Selection) {
	'use strict';
	var jsonObject = new Object(), myNod,  _this;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/hamaliStatementReportWS/getHamaliStatementReportElement.do?',	_this.setHamaliStatementReportsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setHamaliStatementReportsElements : function(response) {
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/hamalistatementreport/HamaliStatementReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				var keyObject = Object.keys(response);
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]]) {
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
					}
				}
				
				var elementConfiguration	= new Object();
				
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				
				response.elementConfiguration	= elementConfiguration;
				response.sourceAreaSelection	= true;
				response.isCalenderSelection	= true;
				response.isPhysicalBranchesShow	= true;
				
				Selection.setSelectionToGetData(response);
				
				myNod = Selection.setNodElementForValidation(response);
				
				hideLayer();
				
				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
		}, onSubmit : function() {
			showLayer();
			var jsonObject = Selection.getElementData();

			getJSON(jsonObject, WEB_SERVICE_URL+'/hamaliStatementReportWS/getLoadingUnloadingHamaliDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response){
			$("#loadingHamaliDetailsDiv").empty();
			$("#unloadingHamaliDetailsDiv").empty();
			
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}
			
			if(response.loadingHamali != undefined && response.loadingHamali.CorporateAccount != undefined) {
				$('#middle-border-boxshadow').removeClass('hide');
				slickGridWrapper2.setGrid(response.loadingHamali);
			} else {
				$('#middle-border-boxshadow').addClass('hide');
			}
			
			if(response.unloadingHamali != undefined && response.unloadingHamali.CorporateAccount != undefined) {
				$('#bottom-border-boxshadow').removeClass('hide');
				slickGridWrapper2.setGrid(response.unloadingHamali);
			} else {
				$('#bottom-border-boxshadow').addClass('hide');
			}
			
			hideLayer();
		}
	});
});