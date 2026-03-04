define(['marionette'
	,'JsonUtility'
	 ,'messageUtility'
	 ,'/ivcargo/resources/js/generic/urlparameter.js'
	 ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/lrsearch/shortCreditPaymentDetail/shortcreditpaymentdetailsfilepath.js'
	 ,'jquerylingua'
	 ,'language'
	 ,'slickGridWrapper3'],
	 function(Marionette, JsonUtility, MessageUtility, UrlParameter,FilePath, Lingua, Language,SlickGridWrapper3){
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	creditWayBillTxnId,
	masterLangKeySet,
	gridObject,
	_this = '';
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			_this = this;
			creditWayBillTxnId = UrlParameter.getModuleNameFromParam('creditWayBillTxnId');
			jsonObject.creditWayBillTxnId			= creditWayBillTxnId;
		},
		render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/searchWayBillDetails/getShortCreditPaymentDetail.do?', _this.getResponseForView, EXECUTE_WITHOUT_ERROR);
			return _this;
		},
		getResponseForView : function(response){
			hideLayer();
			var responseOut = response;
			console.log('responseOut ',responseOut)
			
			var loadelement = [];
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/lrsearch/shortCreditPaymentDetail.html",
							function() {
						baseHtml.resolve();
					});
			
			$.when.apply($, loadelement).done(function(){
				if(response.shortCreditPaymentDetailList != undefined && response.shortCreditPaymentDetailList.CorporateAccount != undefined){
					var keyObject = Object.keys(response);
					
					for (var i = 0; i < keyObject.length; i++) {
						if (response[keyObject[i]].show == false) {
							$("*[data-attribute="+ keyObject[i]+ "]").addClass("hide");
						}
					}
					
					masterLangKeySet 	= loadLanguageWithParams(FilePath.loadLanguage());
					
					var ColumnConfig 			= response.shortCreditPaymentDetailList.columnConfiguration;
					var columnKeys				= _.keys(ColumnConfig);

					var bcolConfig				= new Object();

					for (var i = 0; i < columnKeys.length; i++) {
						var bObj	= ColumnConfig[columnKeys[i]];

						if (bObj.show == true) {
							bcolConfig[columnKeys[i]] = bObj;
						}
					}
					
					
					response.shortCreditPaymentDetailList.columnConfiguration	= _.values(bcolConfig);
					response.shortCreditPaymentDetailList.Language				= masterLangKeySet;
					gridObject = SlickGridWrapper3.applyGrid(
							{
								ColumnHead					: response.shortCreditPaymentDetailList.columnConfiguration, // *compulsory // for table headers
								ColumnData					: _.values(response.shortCreditPaymentDetailList.CorporateAccount), 	// *compulsory // for table's data
								
								Language					: response.shortCreditPaymentDetailList.Language, 			// *compulsory for table's header row language
								ShowPrintButton				: false,
								ShowCheckBox				: false,
								removeSelectAllCheckBox		: 'false',
								fullTableHeight				: true,
								rowHeight 					: 	30,
								DivId						: 'ShortCreditPaymentDetailDiv',				// *compulsary field // division id where slickgrid table has to be created
								SerialNo:[{						// optional field // for showing Row number
									showSerialNo	: false,
									searchFilter	: false,          // for search filter on serial no
									ListFilter		: false				// for list filter on serial no
								}],
								InnerSlickId				: 'editReportDivInner', // Div Id
								InnerSlickHeight			: '250px',
								NoVerticalScrollBar			: false //optional for no vertical scrolling & if set true remove height attribute to Grid Div
							});
					
					var creditWayBillTxnCleranceSummary	= response.CreditWayBillTxnCleranceSummary;
					
					var	totalAmount						= creditWayBillTxnCleranceSummary.grandTotal;
					var	totalReceived					= creditWayBillTxnCleranceSummary.receivedAmount;
					var	totalBalance					= creditWayBillTxnCleranceSummary.balanceAmount;
					var	tdsAmount						= creditWayBillTxnCleranceSummary.tdsAmount;
					
					$('#ShortCreditPaymentSummaryDiv').html('<br/><b>Total Amount : Rs. </b>' + totalAmount + ',<b>Total Received : Rs.</b> ' + totalReceived + ', <b>Total Balance : Rs. </b> ' + totalBalance +', <b>TDS Amount : Rs. </b> ' + tdsAmount  );
				   
				}
			});
		}
	});
	
});

function openMrPrint(grid,dataView,row){
	
	var creditWayBillTxnId	= dataView.getItem(row).creditWayBillTxnId;
	var creditWayBillTxnSummaryId	= dataView.getItem(row).creditWayBillTxnSummaryId;
	
	if(creditWayBillTxnSummaryId != undefined && creditWayBillTxnSummaryId > 0) {
		newwindow = window.open ("printMoneyReceipt.do?pageId=3&eventId=16&wayBillId="+creditWayBillTxnId+"&clearanceId="+creditWayBillTxnSummaryId+"&moduleIdentifier=11","newwindow",config="height=500,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no");
	}
}
function openSingleMrPrint(grid,dataView,row){
	
	var creditWayBillTxnId	= dataView.getItem(row).creditWayBillTxnId;
	var creditWayBillTxnSummaryId	= dataView.getItem(row).creditWayBillTxnSummaryId;
	var creditWayBillTxnClearanceId	= dataView.getItem(row).creditWayBillTxnClearanceId;

	if(creditWayBillTxnSummaryId != undefined && creditWayBillTxnSummaryId > 0) {
			newwindow = window.open ("printMoneyReceipt.do?pageId=3&eventId=16&billIds="+creditWayBillTxnId+"&billClearanceIds="+creditWayBillTxnSummaryId+"&creditWayBillTxnClearanceId="+creditWayBillTxnClearanceId+"&moduleIdentifier=11&differentMrPrintForParitalPayment=true&isMRPrintFromLrView=true","newwindow",config="height=500,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no");
		}
}