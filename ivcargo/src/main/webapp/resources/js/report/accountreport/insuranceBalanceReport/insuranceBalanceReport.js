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
	var jsonObject = new Object(),  _this = '';
	
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/insuranceBalanceReportWS/getInusranceReportElementConfig.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails : function(response) {
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/report/accountreport/insuranceBalanceReport/insuranceBalanceReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				var elementConfiguration		= new Object();
				elementConfiguration.dateElement	= $('#dateEle');

				response.elementConfiguration		= elementConfiguration;
				response.isCalenderSelection		= true;
				response.monthLimit					= response.monthLimit;
				response.accountGroupSelection		= response.accountGroupList != undefined;
				
				Selection.setSelectionToGetData(response);
				
				let myNod = nod();
						
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector		: '#accountGroupEle',
					validate		: 'validateAutocomplete:#accountGroupEle',
					errorMessage	: 'Select Proper Account Group!'
				});

				hideLayer();
				
				$("#searchBtn").click(function() {
					myNod.performCheck();
				
					if(myNod.areAll('valid'))
						_this.onSubmit(_this);	
				});

			});
		}, onSubmit : function() {
			showLayer();
			var jsonObject = new Object();
			
			jsonObject["configAccountGroupId"] 		= $('#accountGroupEle').val();		
			getJSON(jsonObject, WEB_SERVICE_URL+'/insuranceBalanceReportWS/getInsuranceBalanceDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}
					
			$('#bottom-border-boxshadow').removeClass('hide');
			slickGridWrapper2.setGrid(response);
		}
	});
});