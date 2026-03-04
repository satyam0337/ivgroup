define([  
	'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	],function(slickGridWrapper2, Selection) {
	'use strict';
	let jsonObject = new Object(), myNod, _this = '';
	
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/ddmSettelementVehicleWiseReportWS/getDDMSettelementVehicleWiseReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){
			let loadelement = new Array();
			let baseHtml = new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/ddmSettelementVehicleWiseReport/ddmSettelementVehicleWiseReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let keyObject = Object.keys(response);
				
				for (let i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}
				
				let elementConfiguration	= new Object();

				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				elementConfiguration.vehicleElement		= $('#vehicleNumberEle');
				elementConfiguration.paymentTypeElement	= $('#paymentTypeEle');

				response.elementConfiguration	= elementConfiguration;
				response.sourceAreaSelection	= true;
				response.isCalenderSelection	= true;
				response.vehicleSelection		= true;
				response.paymentTypeSelection	= true;
				response.viewAllVehicle		 	= true;

				Selection.setSelectionToGetData(response);

				myNod = Selection.setNodElementForValidation(response);

				$("#searchBtn").click(function() {
					myNod.performCheck();

					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});

				hideLayer();
			});
		},setReportData : function(response) {
			$("#ddmSettelementReportDiv").empty();
			$('#deliveryCashDetails').empty();

			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				$('#bottom-border-boxshadow').addClass('hide');
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			
			if(response.CorporateAccount != undefined && response.CorporateAccount.length > 0) {
				$('#middle-border-boxshadow').removeClass('hide');
				slickGridWrapper2.setGrid(response);
			}
			
			$('#bottom-border-boxshadow').removeClass('hide');
			
			$('#deliveryCashDetailsTable tbody').empty();

			let columnArray		= new Array();
			columnArray.push("<td style='text-align: center; vertical-align:font-weight: bold; middle;background-color: #FFE5CC;'>" + "Godown Cash " + "</td>");
			columnArray.push("<td style='text-align: center; vertical-align:font-weight: bold; middle;background-color: #FFE5CC;'>" + response.godownCash + "</td>");
			
			$('#deliveryCashDetailsTable tbody').append('<tr id="deliveryCashDetails">' + columnArray.join(' ') + '</tr>');
			columnArray	= [];
			
			hideLayer();
		},onSubmit : function() {
			showLayer();

			let jsonObject = Selection.getElementData();
			getJSON(jsonObject, WEB_SERVICE_URL+'/ddmSettelementVehicleWiseReportWS/getDDMSettelementVehicleWiseReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}
	});
});