define([ 
		'marionette'
		 ,'/ivcargo/resources/js/generic/urlparameter.js'
		 ,'slickGridWrapper2'
		 ,'JsonUtility'
		 ,'messageUtility'
		 ,'nodvalidation'
		 ,'focusnavigation'
		 ],
		function(Marionette, UrlParameter, slickGridWrapper2) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(), _this = '', fromDate, toDate;
	var dateComb = '';
	var branchName = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
		//initialize is the first function called on call new view()
		_this = this;
		}, render : function() {
			showLayer();
			fromDate				= UrlParameter.getModuleNameFromParam('fromDate');
			toDate					= UrlParameter.getModuleNameFromParam('toDate');
			branchName				= UrlParameter.getModuleNameFromParam('branchName');
			dateComb				= fromDate + ' - ' + toDate;
			jsonObject["sourceBranchId"]	= UrlParameter.getModuleNameFromParam('branch');
			jsonObject["fromDate"]			= fromDate;
			jsonObject["toDate"]			= toDate;
			getJSON(jsonObject, WEB_SERVICE_URL + '/ewayBillRequestModuleWiseCountReportWS/getEwaybillRequestCountSummaryDetails.do?', _this.setIntialData, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setIntialData: function(response) {
			var loadelement = new Array();
			var baseHtml	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/report/ewaybillReport/eWaybillRequestCountSummaryReport/eWaybillRequestCountSummaryReport.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				_this.setData(response);
				hideLayer();
			});
		}, setData : function(response) {
			hideLayer();
			
			$('#branchEle').val(branchName);
			$('#dateEle').val(dateComb);
			$('.infoDiv').remove();
					
			if (response.message != undefined) {
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}
				
			$('#middle-border-boxshadow').removeClass('hide');
				
			slickGridWrapper2.setGrid(response);
		}
	});
});