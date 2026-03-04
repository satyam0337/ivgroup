
define([  
	'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	],function(slickGridWrapper2, Selection) {
	'use strict';
	let jsonObject = new Object(), 
	myNod,gridObject,  
	_this = '';
	
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/bankAccountStatementReportWS/getBankAccountStatementReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails : function(response){
			let loadelement = new Array();
			let baseHtml 	= new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/bankaccountstatementreport/BankAccountStatementReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
				}
				
				let issueBankAuto = Object();

				issueBankAuto.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getBankAccountAutocomplete.do?AllOptionForAccountNo=' + response.AllOptionForAccountNo;
				issueBankAuto.primary_key 	= 'bankAccountId';
				issueBankAuto.field 		= 'bankNameAccountNumber';
				$("#bankEle").autocompleteCustom(issueBankAuto);
				
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
		
				myNod.add({
					selector: '#bankEle',
					validate: 'validateAutocomplete:#bankEle_primary_key',
					errorMessage: 'Select proper Bank !'
				});
				
				hideLayer();

				$("#searchBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
		}, setReportData : function(response) {
			hideLayer();
			
			$("#bankAccountStatementReportDiv").empty();

			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}
			
			if(response.CorporateAccount != undefined && response.CorporateAccount.length > 0) {
				$('#bottom-border-boxshadow').removeClass('hide');
				gridObject = slickGridWrapper2.setGrid(response);
			} else
				$('#bottom-border-boxshadow').addClass('hide');
			_this.cancelLRColour(gridObject);
			hideLayer();
		}, onSubmit : function() {
			showLayer();
			let jsonObject = Selection.getElementData();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/bankAccountStatementReportWS/getBankAccountStatementReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		},cancelLRColour : function(gridObject){
			slickGridWrapper2.updateRowColor(gridObject, 'statusId', 5, 'highlight-row-onchange');
		}
	});
});