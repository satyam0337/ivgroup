define(['marionette'
	 ,'/ivcargo/resources/js/generic/urlparameter.js'
	 ,'slickGridWrapper3'
	,'JsonUtility'
	 ,'messageUtility'
	 ],
	 function(Marionette, UrlParameter, SlickGridWrapper3){
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	agentCommisionBillingSummaryId,
	_this = '';
	return Marionette.LayoutView.extend({
		initialize: function(){
			_this = this;
			agentCommisionBillingSummaryId 				= UrlParameter.getModuleNameFromParam('agentCommisionBillingSummaryId');
			jsonObject.agentCommisionBillingSummaryId	= agentCommisionBillingSummaryId;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/agentCommissionBillingSettlementWS/getAgentCommissionBillPaymentDetails.do?', _this.getResponseForView, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getResponseForView : function(response){
			hideLayer();
			var loadelement = [];
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/lrsearch/agentCommisionBillPaymentDetails.html", function() {
						baseHtml.resolve();
					});
			
			$.when.apply($, loadelement).done(function(){
				if(response.CorporateAccount != undefined){
					SlickGridWrapper3.applyGrid(
							{
								ColumnHead					: response.columnConfigurationList, // *compulsory // for table headers
								ColumnData					: _.values(response.CorporateAccount), 	// *compulsory // for table's data
								ShowPrintButton				: false,
								ShowCheckBox				: false,
								removeSelectAllCheckBox		: 'false',
								fullTableHeight				: true,
								rowHeight 					: 	30,
								DivId						: 'AgentCommissionBillPaymentDetailDiv',				// *compulsary field // division id where slickgrid table has to be created
								SerialNo:[{						// optional field // for showing Row number
									showSerialNo	: false,
									searchFilter	: false,          // for search filter on serial no
									ListFilter		: false				// for list filter on serial no
								}],
								InnerSlickId				: 'editReportDivInner', // Div Id
								NoVerticalScrollBar			: false //optional for no vertical scrolling & if set true remove height attribute to Grid Div
							});
				}
			});
		}
	});
	
});