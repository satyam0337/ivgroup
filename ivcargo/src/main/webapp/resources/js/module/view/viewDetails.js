define(
		[
			'slickGridWrapper2',
			'/ivcargo/resources/js/generic/urlparameter.js',
			'JsonUtility',
			'messageUtility'
	], function(slickGridWrapper2, UrlParameter) {
			'use strict';
			let jsonObject = new Object(), _this = '', filter = 0;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
					filter				= UrlParameter.getModuleNameFromParam('filter');
					jsonObject.branchId 			= UrlParameter.getModuleNameFromParam('branchId');
					jsonObject.corporateAccountId	= UrlParameter.getModuleNameFromParam('corporateAccountId');
				}, getURL : function(filter) {
					if(filter == 1) return '/lrSequenceCounterWS/getLrSequenceDetails.do?';
					else if(filter == 2) return '/lsSequenceCounterWS/getLsSequenceDetails.do?';
					else if(filter == 3) return '/lhpvSequenceCounterWS/getLhpvSequenceDetails.do?';
					else if(filter == 4) return '/master/doorPickupSequenceCounterWS/getDoorPickupSequenceDetailsToDisplayForGroup.do?';
					else if(filter == 5) return '/truckArrivalSequenceCounterWS/getTruckArrivalSequenceCounterForDisplayToGroup.do?';
					else if(filter == 6) return '/master/mrSequenceCounterWS/getMRSequenceCounterForDisplayToGroup.do?';
					else if(filter == 7) return '/master/pendingLSPaymentSequenceCounterWS/getSequenceCounterForDisplayToGroup.do?';
					else if(filter == 8) return '/master/blhpvSequenceCounterWS/getConsolidatedBLhpvSequenceCounterForDisplayToGroup.do?';
					else if(filter == 9) return '/branchMasterWS/getBranchEditLogsDetails.do?';
					else if(filter == 10) return '/partyMasterWS/getPartyEditLogsDetails.do?';
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ _this.getURL(Number(filter)), _this.renderLrSequnceElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderLrSequnceElements : function(response) {
					showLayer();
					let loadelement = new Array();
					let baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/viewDetails/viewDetails.html", function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						$("*[data-selector=header]").html(response.reportName);
						_this.viewAllLrSequences(response);
					});
				}, viewAllLrSequences	: function(response) {
					hideLayer();
										
					if(response.message != undefined)
						return;
										
					if(response.CorporateAccount != undefined && response.CorporateAccount.length > 0)
						slickGridWrapper2.setGrid(response);
				}
			});
		});