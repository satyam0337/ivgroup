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
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/vehicleDispatchLRwiseReportWS/getVcehicleDispatchLRwiseReportElement.do?',	_this.setVehicleElementsData,	EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setVehicleElementsData : function(response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/vehicleDispatchLRwiseReport/vehicleDispatchLRwiseReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
				}
				
				let elementConfiguration	= new Object();
				
				elementConfiguration.dateElement	= $('#dateEle');
				elementConfiguration.vehicleElement	= 'vehicleNumberEle';
				
				response.elementConfiguration			= elementConfiguration;
				response.isCalenderSelection			= true;
				response.groupMergingVehicleSelection	= true;

				Selection.setSelectionToGetData(response);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod.add({
					selector: '#vehicleNumberEle',
					validate: 'validateAutocomplete:#vehicleNumberEle',
					errorMessage: 'Select proper Vehicle !'
				});

				hideLayer();
				
				$("#findBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
		}, onSubmit : function() {
			showLayer();
			let jsonObject = Selection.getElementData();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/vehicleDispatchLRwiseReportWS/getVcehicleDispatchLRwiseReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			if(response.message != undefined) {
				hideLayer();
				$('#bottom-border-boxshadow').addClass('hide');
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
			
			if(response.CorporateAccount != undefined && response.CorporateAccount.length > 0) {
				$('#bottom-border-boxshadow').removeClass('hide');
				let gridObject = slickGridWrapper2.setGrid(response);
				slickGridWrapper2.setAggregateFunction(gridObject, 'groupingType');
			}
			
			hideLayer();
		}
	});
});