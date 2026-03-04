define(
		[
		 'slickGridWrapper2',
		 PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
		 '/ivcargo/resources/js/generic/urlparameter.js',
		 'JsonUtility',
		 'messageUtility',
		 'nodvalidation',
		 'focusnavigation',
		 ],//PopulateAutocomplete
		 function(slickGridWrapper2, Selection) {
			'use strict';
		let jsonObject = new Object(), myNod, _this; 
		return Marionette.LayoutView.extend({
			initialize : function() {
				_this = this;
				this.$el.html(this.template);
			}, render : function() {
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/mathadiReportWs/getMathadiReportElement.do?', _this.renderMathadiReportElements, EXECUTE_WITHOUT_ERROR);
				return _this;
			}, renderMathadiReportElements : function(response) {
				showLayer();
				let loadelement 			= new Array();
				let baseHtml 				= new $.Deferred();
				let showDownLoadExcelButton = response.showDownLoadExcelButton;
				loadelement.push(baseHtml);
				
				$("#mainContent").load("/ivcargo/html/report/dispatchreport/mathadiReport/mathadiReport.html", function() {
					baseHtml.resolve();
				});
					
				$.when.apply($, loadelement).done(function() {
					initialiseFocus();
					
					$("*[data-selector=header]").html(response.reportName);
						
					let keyObject 		= Object.keys(response);
						
					for (let i = 0; i < keyObject.length; i++) {
						if (response[keyObject[i]]) {
							$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
						}
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
						
					if(showDownLoadExcelButton)
				    	$('#downloadExcel').removeClass('hide');
				
					myNod = Selection.setNodElementForValidation(response);
						
					hideLayer();
					
					$("#findBtn").click(function() {
						myNod.performCheck();
							
						if(myNod.areAll('valid'))
							_this.onFind(false);
					});
						
					$("#downloadExcel").click(function() {
						myNod.performCheck();
					
						if(myNod.areAll('valid'))
							_this.onFind(true);								
					});
				});
			}, onFind : function(isExcel) {
				showLayer();
					
				let json = Selection.getElementData();
			
				json["isExcel"] 			= isExcel;
			
				if(isExcel)
					getJSON(json, WEB_SERVICE_URL + '/mathadiReportWs/getMathadiReportData.do', _this.responseForExcel, EXECUTE_WITH_NEW_ERROR);
				else
					getJSON(json, WEB_SERVICE_URL + '/mathadiReportWs/getMathadiReportData.do', _this.setData, EXECUTE_WITH_NEW_ERROR);
			}, responseForExcel : function(data) {
				hideLayer();
				let errorMessage = data.message;
			
				if(errorMessage.messageId == EXCEL_GENERATED_SUCCESSFULLY)
					generateFileToDownload(data);
			}, setData : function(response) {
				hideLayer();

				if (response.message != undefined) {
					$('#bottom-border-boxshadow').addClass('hide');
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