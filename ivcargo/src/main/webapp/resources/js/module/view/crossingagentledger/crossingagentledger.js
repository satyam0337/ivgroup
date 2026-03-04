var doneTheStuff				= false;
define(
		[
			'slickGridWrapper2',
			PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
			'JsonUtility',
			'messageUtility',
			'autocomplete',
			'autocompleteWrapper',
			'nodvalidation',
			'focusnavigation',
			],
			
			function(slickGridWrapper2, Selection) {
			'use strict';
			var myNod, _this = '';
			
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
				}, render : function() {
					getJSON(null, WEB_SERVICE_URL	+ '/crossingAgentLedgerWS/getCrossingAgentLedgerElementConfiguration.do?',_this.crossingAgentLedgerElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, crossingAgentLedgerElements : function(response) {
					showLayer();
					var loadelement			= new Array();
					var baseHtml 			= new $.Deferred();
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/crossingagentledger/crossingAgentLedgerReport.html",
							function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						
						var keyObject = Object.keys(response);
						
						for (const element of keyObject) {
							if (response[element])
								$("*[data-attribute="+ element+ "]").removeClass("hide");
						}
						
						let elementConfiguration				= new Object();
						
						elementConfiguration.dateElement		= $("#dateEle");
						
						response.elementConfiguration			= elementConfiguration;
						response.isCalenderSelection			= true;
						response.crossingAgentSelectionWithSelectize			= true;
						
						Selection.setSelectionToGetData(response);
						
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});
						
						hideLayer();
						
						$("#findBtn").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid'))
								_this.onSubmit();
						});
					});
				},onSubmit : function(){
					showLayer();
					var jsonObject = Selection.getElementData();

					getJSON(jsonObject, WEB_SERVICE_URL+'/crossingAgentLedgerWS/getCrossingAgentLedgerDetails.do?', _this.crossingAgentLedgerDetails, EXECUTE_WITH_ERROR);
				},crossingAgentLedgerDetails : function(response){
					hideLayer();
					
					if(response.message != undefined){
						$('#middle-border-boxshadow').addClass('hide');
						
						showMessage(response.message.typeName, response.message.description);
						hideLayer();
						return;
					} 
					
					$('#middle-border-boxshadow').removeClass('hide');
					hideAllMessages();
					slickGridWrapper2.setGrid(response);
					
					hideLayer();
				}
			});
		});