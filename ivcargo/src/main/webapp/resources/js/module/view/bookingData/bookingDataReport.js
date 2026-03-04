define([  
	PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	],function(Selection) {
	'use strict';
	var jsonObject = new Object(), myNod, _this = '';

	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/bookingDataReportWS/getBookingDataReportElementConfiguration.do?',_this.getElementConfigDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){

			var loadelement = new Array();
			var baseHtml = new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/bookingData/BookingDataReport.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				let keyObject = Object.keys(response);
			
				for (var i = 0; i < keyObject.length; i++) {
					$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}

				let elementConfiguration	= new Object();

				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration		= elementConfiguration;
				response.sourceAreaSelection		= true;
				response.isCalenderSelection		= true;

				Selection.setSelectionToGetData(response);

				myNod = Selection.setNodElementForValidation(response);

				hideLayer();

				$("#downloadExcel").click(function() {
					myNod.performCheck();

					if(myNod.areAll('valid'))
						_this.setExcelData();								
				});
			});
		}, setExcelData : function() {
			showLayer();
			let jsonObject = Selection.getElementData();

			getJSON(jsonObject, WEB_SERVICE_URL+'/bookingDataReportWS/setExcelData.do', _this.responseForExcel, EXECUTE_WITH_NEW_ERROR);
		}, responseForExcel : function(data) {
			if(data.message.messageId == 21){
				hideLayer();
				return false;
			}
			
			generateFileToDownload(data);
		}
	});
});