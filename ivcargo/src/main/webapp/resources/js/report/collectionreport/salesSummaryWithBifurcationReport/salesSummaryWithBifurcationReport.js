define([  
		PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		,'slickGridWrapper2'
		,'JsonUtility'
		,'messageUtility'
		,'nodvalidation'
		,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		,'focusnavigation'//import in require.config
          ],function(Selection, slickGridWrapper2) {
	'use strict';
	let jsonObject = new Object(), myNod, _this = '';
	
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/salesSummaryWithBifurcationReportWS/getSalesSummaryWithBifurcationReportElement.do?',	_this.setBookingRegisterReportsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setBookingRegisterReportsElements : function(response) {
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
		
			$("#mainContent").load("/ivcargo/html/report/collectionreport/salesSummaryWithBifurcationReport/salesSummaryWithBifurcationReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
				}
				
				let elementConfiguration				= new Object();
				
				elementConfiguration.dateElement			= $('#dateEle');
				elementConfiguration.regionElement			= $('#regionEle');
				elementConfiguration.subregionElement		= $('#subRegionEle');
				elementConfiguration.branchElement			= $('#branchEle');

				response.elementConfiguration				= elementConfiguration;
				response.sourceAreaSelection				= true;

				if(response.type)
					_this.setType();
					
				Selection.setSelectionToGetData(response);
				
				myNod = Selection.setNodElementForValidation(response);
				
				hideLayer();
				
				$("#searchBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
		}, onSubmit : function() {
			showLayer();
			let jsonObject = Selection.getElementData();
			
			jsonObject["searchType"] 	= $('#typeEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/salesSummaryWithBifurcationReportWS/getSalesSummaryWithBifurcationReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			hideLayer();

			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				return;
			}
			
			$('#bottom-border-boxshadow').removeClass('hide');
			slickGridWrapper2.setGrid(response);
			
			hideLayer();
		}, setType : function(){
			_this.setTypeAutocompleteInstance();
			
			let autoSelectType = $("#typeEle").getInstance();
			
			let SelectTYPE = [
			        { "typeId":1, "typeName": "BOOKING" },
			        { "typeId":2, "typeName": "DELIVERY" },
			    ]
			
			$( autoSelectType ).each(function() {
				this.option.source = SelectTYPE;
			})
		}, setTypeAutocompleteInstance : function() {
			let autoTypeName 			= new Object();
			autoTypeName.primary_key 	= 'typeId';
			autoTypeName.field 			= 'typeName';

			$("#typeEle").autocompleteCustom(autoTypeName);
		}
	});
});