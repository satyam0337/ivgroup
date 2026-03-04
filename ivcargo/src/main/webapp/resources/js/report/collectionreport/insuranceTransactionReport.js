define([  
        'slickGridWrapper2'
          ,PROJECT_IVUIRESOURCES +'/resources/js/populateautocomplete/selectoption.js'
		,'JsonUtility'
          ,'messageUtility'
          ,'nodvalidation'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ,'focusnavigation'//import in require.config
          ],function(SlickGridWrapper2, Selection) {
	'use strict';
	let jsonObject = new Object(), _this = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/insuranceTransactionReportWS/getInsuranceTransactionElement.do?', _this.renderTransactionElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderTransactionElements : function(response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/report/collectionreport/insuranceTransactionReport.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				$("*[data-selector=header]").html(response.reportName);
				
				let elementConfiguration	= new Object();
				
				elementConfiguration.dateElement		= $('#dateEle');
				
				response.isCalenderSelection	= true;
				response.elementConfiguration	= elementConfiguration;
				
				Selection.setSelectionToGetData(response);

				hideLayer();
				
				$("#saveBtn").click(function() {
					_this.onSubmit();								
				});
			});
		}, onSubmit : function() {
			showLayer();
			let jsonObject = Selection.getElementData();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/insuranceTransactionReportWS/getInsuranceTransactionData.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}
					
			$('#middle-border-boxshadow').removeClass('hide');
			$('#totalClossingBalance').text(response.totalClossingBalance)
			$('#totalCreditAmount').text(response.totalCreditAmount)
			$('#totalDebitAmount').text(response.totalDebitAmount)
     		
			SlickGridWrapper2.setGrid(response);
			hideLayer();
		}
	});
});