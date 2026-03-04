define([
	'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	],
	function(slickGridWrapper2, Selection) {
	'use strict';
	let jsonObject = new Object(), myNod, _this = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/truckLoadingReportWS/getTruckLoadingElement.do?', _this.setTruckLoadingReportsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setTruckLoadingReportsElements : function(response) {
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/truckLoadingReport/truckLoadingReport.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
				}

				response.sourceAreaSelection	= true;
				response.isCalenderSelection	= true;
				
				let elementConfiguration	= new Object();

				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				elementConfiguration.dateElement		= $('#dateEle');

				response.elementConfiguration	= elementConfiguration;

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
			
			let jsonObject = Selection.getElementData();

			getJSON(jsonObject, WEB_SERVICE_URL+'/truckLoadingReportWS/getTruckLoadingDetails.do',_this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}

			if(response.CorporateAccount != undefined) {
				$('#bottom-border-boxshadow').removeClass('hide');
				hideAllMessages();
				slickGridWrapper2.setGrid(response);
				hideLayer();
			}
		}
	});
});