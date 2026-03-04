define([
	'slickGridWrapper2',
	PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
	'JsonUtility',
	'messageUtility',
	'autocomplete',
	'focusnavigation',
	'nodvalidation'
	],
	function(slickGridWrapper2, Selection) {
	'use strict';
	let myNod,  _this = '';
			
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(null, WEB_SERVICE_URL+'/lSBalanceReportWS/getLSBalanceReportReportElement.do', _this.renderElements, EXECUTE_WITH_ERROR);
			return _this;
		}, renderElements :function(response) {
			showLayer();
			let loadelement			= new Array();
			let baseHtml 			= new $.Deferred();
			
			loadelement.push(baseHtml);
					
			$("#mainContent").load("/ivcargo/html/report/dispatchreport/lSBalanceReport/lSBalanceReport.html",
					function() {
				baseHtml.resolve();
			});
					
			$.when.apply($, loadelement).done(function() {
				hideLayer();
				initialiseFocus();
				
				let keyObject 		= Object.keys(response);
			
				for (let i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}
				
				
				let elementConfiguration	= new Object();
						
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
		
						
				response.elementConfiguration	= elementConfiguration;
				response.sourceAreaSelection	= true;
				response.isCalenderSelection	= true;
		
				response.vehicleSelection			= true;
				elementConfiguration.vehicleElement		= $('#vehicleNumberEle');
		
				Selection.setSelectionToGetData(response);
				myNod 					= nod();

				myNod.configure({
					parentClass:'validation-message'
				});
				
				let vehicleAutoComplete = new Object();
				vehicleAutoComplete.primary_key = 'vehicleNumberMasterId';
				vehicleAutoComplete.field 		= 'vehicleNumber';
				$("#vehicleElement").autocompleteCustom(vehicleAutoComplete);

				if($('#regionEle').exists() && $('#regionEle').is(":visible"))
					addAutocompleteElementInNode(myNod, 'regionEle', 'Select proper Region !');
				
				if($('#subRegionEle').exists() && $('#subRegionEle').is(":visible"))
					addAutocompleteElementInNode(myNod, 'subRegionEle', 'Select proper Area !');
				
				if($('#branchEle').exists() && $('#branchEle').is(":visible"))
					addAutocompleteElementInNode(myNod, 'branchEle', 'Select proper Branch !');
				
				if(response.showDownloadExcelButton) {
					$('#downloadToExcel').css('display', 'inline');
					$("#downloadToExcel").click(function() {
						myNod.performCheck();
						
						if(myNod.areAll('valid'))
							_this.setExcelData();								
					});
				}else
					$('#downloadToExcel').remove();
				
				
				$("#findBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onFind();								
				});
			});
		},setExcelData : function() {
			showLayer();
			let jsonObject = Selection.getElementData();
			
				jsonObject["isDownloadForExcel"] 	= 'true';
						
			getJSON(jsonObject, WEB_SERVICE_URL+'/lSBalanceReportWS/getLsBalanceDetails.do', _this.setData, EXECUTE_WITH_ERROR);
		}, onFind : function() {
			showLayer();
			let jsonObject = Selection.getElementData();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/lSBalanceReportWS/getLsBalanceDetails.do', _this.setData, EXECUTE_WITH_ERROR);
		}, setData : function(response) {
			hideLayer();
			
			if (response.message != undefined) {
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				$('#bottom-border-boxshadow').addClass('hide');
				
				if(response.FilePath != undefined)
							generateFileToDownload(response);
				
				return;
			}
			if(response.CorporateAccount != undefined) {
				$('#bottom-border-boxshadow').removeClass('hide');
				hideAllMessages();
				slickGridWrapper2.setGrid(response);
			}
		}
	});
});