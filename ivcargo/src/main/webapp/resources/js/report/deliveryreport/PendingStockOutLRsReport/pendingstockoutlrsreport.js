define(
		[
			'slickGridWrapper2',
			PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',//PopulateAutocomplete
			'JsonUtility',
			'messageUtility',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
			],
			function(slickGridWrapper2, Selection) {
			'use strict';
			var jsonObject = new Object(), myNod, _this = '';
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/pendingStockOutLRsReportWS/getPendingStockOutLRsElementConfiguration.do?',	_this.renderReportElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderReportElements : function(response) {
					showLayer();

					var loadelement = new Array();
					var baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/report/deliveryreport/pendingStockOutLRsReport/pendingStockOutLRsReport.html",
							function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						
						var keyObject = Object.keys(response);
					
						for (var i = 0; i < keyObject.length; i++) {
							if (response[keyObject[i]])
								$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
						}
						
						var elementConfiguration				= new Object();
						elementConfiguration.dateElement		= $('#dateEle');
						elementConfiguration.regionElement		= $('#regionEle');
						elementConfiguration.subregionElement	= $('#subRegionEle');
						elementConfiguration.branchElement		= $('#branchEle');

						response.elementConfiguration		= elementConfiguration;
						response.sourceAreaSelection		= true;
						response.isCalenderSelection		= true;

						Selection.setSelectionToGetData(response);

						myNod = Selection.setNodElementForValidation(response);
						
						hideLayer();

						$("#saveBtn").click(function() {
							myNod.performCheck();

							if(myNod.areAll('valid'))
								_this.onSubmit();								
						});
					});
				}, onSubmit : function() {
					showLayer();
					var jsonObject	= Selection.getElementData();

					getJSON(jsonObject, WEB_SERVICE_URL + '/pendingStockOutLRsReportWS/getPendingStockOutLRsDetailsForReport.do', _this.setReportData, EXECUTE_WITH_ERROR);
				}, setReportData : function(response) {
					hideLayer();

					if(response.message != undefined) {
						$('#middle-border-boxshadow').addClass('hide');

						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
						return;
					}

					$('#middle-border-boxshadow').removeClass('hide');
					hideAllMessages();
					slickGridWrapper2.setGrid(response);
				}
			});
		});