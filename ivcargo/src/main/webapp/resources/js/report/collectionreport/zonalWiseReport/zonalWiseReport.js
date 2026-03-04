define([  
	PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
	'slickGridWrapper2',
	'JsonUtility',
	'messageUtility',
	'nodvalidation',
	PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
	'focusnavigation'
],function(Selection, slickGridWrapper2) {
	'use strict';
	let jsonObject = new Object(), myNod,	_this = '';
	
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
		}, render: function() {
		  	getJSON(jsonObject, WEB_SERVICE_URL + '/report/zonalWiseReportWS/loadZonalWiseReportElement.do?', _this.getElementConfigDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails: function(response) {
			hideLayer();
			let loadelement = new Array();
			let baseHtml = new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/report/collectionreport/zonalWiseReport.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				const keyObject = Object.keys(response);

				keyObject.forEach(key => {
					if (response[key])
						$(`*[data-attribute=${key}]`).removeClass("hide");
				});
		
				let elementConfiguration = new Object();
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration = elementConfiguration;
								
				response.sourceAreaSelection	= true;
				response.isCalenderSelection	= true;
				
				Selection.setSelectionToGetData(response);

				myNod = Selection.setNodElementForValidation(response);

				hideLayer();

				$("#searchBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								 
				});
			});
		}, onSubmit: function() {
			showLayer();
			let jsonObject = Selection.getElementData();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/report/zonalWiseReportWS/getZonalWiseReportData.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData: function(response) {
			hideLayer();
			$("#zonalWiseReportDiv").empty();
			
			if(response.CorporateAccount == undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}

			$('#bottom-border-boxshadow').removeClass('hide');
			slickGridWrapper2.setGrid(response);
	   
			hideLayer();
		}
	});
});