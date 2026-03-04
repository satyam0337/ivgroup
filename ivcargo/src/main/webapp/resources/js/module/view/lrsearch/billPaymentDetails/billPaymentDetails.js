define(['marionette'
	,'JsonUtility'
	 ,'messageUtility'
	 ,'/ivcargo/resources/js/generic/urlparameter.js'
	 ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/lrsearch/billPaymentDetails/billpaymentdetailsfilepath.js'
	 ,'jquerylingua'
	 ,'language'
	 ,'slickGridWrapper3'],
	 function(Marionette, JsonUtility, MessageUtility, UrlParameter,FilePath, Lingua, Language,SlickGridWrapper3){
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	billId,
	masterLangKeySet,
	gridObject,
	_this = '';
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			_this = this;
			billId = UrlParameter.getModuleNameFromParam('billId');
			jsonObject.billId			= billId;
		},
		render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/searchWayBillDetails/getBillPaymentStatusDetails.do?', _this.getResponseForView, EXECUTE_WITHOUT_ERROR);
			return _this;
		},
		getResponseForView : function(response){
			hideLayer();
			var responseOut = response;
			
			var loadelement = [];
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/lrsearch/billPaymentDetails.html",
							function() {
						baseHtml.resolve();
					});
			
			$.when.apply($, loadelement).done(function(){
				if(response.billSummaryList != undefined && response.billSummaryList.CorporateAccount != undefined){
					var keyObject = Object.keys(response);
					
					for (var i = 0; i < keyObject.length; i++) {
					    const obj = response[keyObject[i]];

					    if (obj && obj.show === false) { 
					        $("[data-attribute=" + keyObject[i] + "]").addClass("hide");
					    }
					}

					
					masterLangKeySet 	= loadLanguageWithParams(FilePath.loadLanguage());
					
					var ColumnConfig 			= response.billSummaryList.columnConfiguration;
					var columnKeys				= _.keys(ColumnConfig);

					var bcolConfig				= new Object();

					for (var i = 0; i < columnKeys.length; i++) {
						var bObj	= ColumnConfig[columnKeys[i]];

						if (bObj.show == true) {
							bcolConfig[columnKeys[i]] = bObj;
						}
					}
					
					
					response.billSummaryList.columnConfiguration	= _.values(bcolConfig);
					response.billSummaryList.Language				= masterLangKeySet;
					gridObject = SlickGridWrapper3.applyGrid(
							{
								ColumnHead					: response.billSummaryList.columnConfiguration, // *compulsory // for table headers
								ColumnData					: _.values(response.billSummaryList.CorporateAccount), 	// *compulsory // for table's data
								
								Language					: response.billSummaryList.Language, 			// *compulsory for table's header row language
								ShowPrintButton				: false,
								ShowCheckBox				: false,
								removeSelectAllCheckBox		: 'false',
								fullTableHeight				: true,
								rowHeight 					: 	30,
								DivId						: 'BillPaymentStatusDiv',				// *compulsary field // division id where slickgrid table has to be created
								SerialNo:[{						// optional field // for showing Row number
									showSerialNo	: false,
									searchFilter	: false,          // for search filter on serial no
									ListFilter		: false				// for list filter on serial no
								}],
								InnerSlickId				: 'BillPaymentStatusDivInner', // Div Id
								InnerSlickHeight			: '250px',
								NoVerticalScrollBar			: false //optional for no vertical scrolling & if set true remove height attribute to Grid Div
							});
					
					var billData			= response.billData;
					var	billNumber			= billData.billNumber;
					var	billAmount			= billData.grandTotal;
					var dueAmount			= billData.dueAmount;
					
					//$('#BillStatusDiv').html('<br/><b>Bill No : </b> ' + billNumber + 'nbsp; <b>Bill Amount :</b> ' + billAmount + '<emsp><emsp><b>Due Amount :</b>' +dueAmount );
					$('#BillStatusDiv').html("<table style='width:100%;'><tr><td style='width:33%;'><b>Bill No : </b>"+billNumber+"</td><td style='width:33%;'><b>Bill Amount : </b>"+billAmount+"</td><td style='width:33%;'><b>Due Amount : </b>"+dueAmount+"</td></tr></table>");
				   
				}
			});
		}
	});
	
});