define(
		[
		 PROJECT_IVUIRESOURCES + '/resources/js/module/view/creditorInvoice/cancelinvoicefilepath.js',
		'slickGridWrapper3',
		 PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
		 'JsonUtility',
		 'messageUtility',
		 'jquerylingua',
		 'language',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		 ],
		 function(FilePath, SlickGridWrapper3, Selection) {
			'use strict';
			let jsonObject = new Object(), masterLangKeySet, myNod,  _this = '', BillTypeConstant, TOKEN_KEY = null, TOKEN_VALUE = null,tokenWiseCheckingForDuplicateTransaction = true ;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/creditorInvoiceWS/loadCancelCreditorInvoice.do?',	_this.renderCreditorInvoiceElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderCreditorInvoiceElements : function(response) {
					showLayer();

					let loadelement = new Array();
					let baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);
					
					TOKEN_KEY 	= response.TOKEN_KEY;
					TOKEN_VALUE = response.TOKEN_VALUE;
					
					$("#mainContent").load("/ivcargo/html/module/creditorInvoice/cancelinvoice.html",
							function() {
								baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						hideLayer();

						loadLanguageWithParams(FilePath.loadLanguage());
						
						BillTypeConstant	= response.BillTypeConstant;
						
						$("#partyNameEle").focus();
						
						response.partySelection	= response.corporateAccountArr != undefined;

						Selection.setSelectionToGetData(response);
						
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});
						
						myNod.add({
							selector		: '#partyNameEle',
							validate		: 'validateAutocomplete:#partyNameEle',
							errorMessage	: 'Select Party !'
						});
						
						$("#findBtn").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid')) {
								_this.onFind(_this);
							}
						});
					});
				}, onFind : function() {
					showLayer();
					
					$("#UpCancelBill").unbind( "click" );
					$("#DownCancelBill").unbind( "click" );
					
					let jsonObject = new Object();
					
					jsonObject.corporateAccountId	= $('#partyNameEle').val();
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/creditorInvoiceWS/getBillDetailsForCancel.do', _this.setBillDetailsData, EXECUTE_WITH_ERROR);
				}, setBillDetailsData : function(response) {
					if(response.message != undefined) {
						hideLayer();
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						return;
					}

					if(response.BillDetailsList != undefined && response.BillDetailsList.CorporateAccount != undefined) {
						hideAllMessages();
						showPartOfPage('bottom-border-boxshadow');
						
						masterLangKeySet 	= loadLanguageWithParams(FilePath.loadLanguage());
						
						let ColumnConfig 	= response.BillDetailsList.columnConfiguration;
						let columnKeys		= _.keys(ColumnConfig);

						let bcolConfig		= new Object();

						for (let i = 0; i < columnKeys.length; i++) {
							let bObj	= ColumnConfig[columnKeys[i]];

							if (bObj.show == true) {
								bcolConfig[columnKeys[i]] = bObj;
							}
						}

						response.BillDetailsList.columnConfiguration	= _.values(bcolConfig);
						response.BillDetailsList.Language				= masterLangKeySet;

						SlickGridWrapper3.applyGrid(
								{
									ColumnHead					: response.BillDetailsList.columnConfiguration, // *compulsory // for table headers
									ColumnData					: _.values(response.BillDetailsList.CorporateAccount), 	// *compulsory // for table's data
									Language					: response.BillDetailsList.Language, 			// *compulsory for table's header row language
									ShowPrintButton				: false,
									ShowCheckBox				: true,
									removeSelectAllCheckBox		: 'false',
									fullTableHeight				: false,
									rowHeight 					: 	30,
									DivId						: 'lsDetailsDiv',				// *compulsary field // division id where slickgrid table has to be created
									SerialNo:[{						// optional field // for showing Row number
										showSerialNo	: false,
										searchFilter	: false,          // for search filter on serial no
										ListFilter		: false				// for list filter on serial no
									}],
									InnerSlickId				: 'editReportDivInner', // Div Id
									InnerSlickHeight			: '450px',
									NoVerticalScrollBar			: false //optional for no vertical scrolling & if set true remove height attribute to Grid Div
								});
						
						_this.setDataInTable(response.BillDetailsList.CorporateAccount);
					}
					
					hideLayer();
				},setDataInTable : function(billDetailsList) {
					$("#UpCancelBill").bind("click", function() {
					    _this.cancelBill(billDetailsList);
					});
					
					$("#DownCancelBill").bind("click", function() {
					    _this.cancelBill(billDetailsList);
					});
				}, cancelBill : function(billDetailsList) {
					let selectionMsg 			= ' Please, Select Bill for Cancel !';
					let selectedBillDetails 	= SlickGridWrapper3.getValueForSelectedData({InnerSlickId : 'editReportDivInner'}, selectionMsg);
					
					if(typeof selectedBillDetails == 'undefined') {
						return;
					}
					
					let selectedBillIds			= [];
					
					for(let i = 0; i < selectedBillDetails.length; i++) {
						selectedBillIds.push(selectedBillDetails[i].billId);
					}
					
					let billDetailsArr			= [];
					
					for(let i = 0; i < selectedBillDetails.length; i++) {
						if(billDetailsList.length != selectedBillDetails.length) {
							for(let j = 0; j < billDetailsList.length; j++) {
								if(billDetailsList[j].billTypeId == BillTypeConstant.SUPPLEMENTARY_BILL_TYPE_ID 
										&& (selectedBillDetails[i].billId == billDetailsList[j].referenceBillId)
										&& !isValueExistInArray(selectedBillIds, billDetailsList[j].billId)) {
									showMessage('info', iconForInfoMsg + ' Please, Cancel Supplementary Bill ' + openFontTag + billDetailsList[j].billNumber + closeFontTag + ' for this bill ' + openFontTag + selectedBillDetails[i].billNumber + closeFontTag + ' also !');
									return;
								}
							}
						}
						
						let billObject			= new Object();
						
						billObject['billId']					= selectedBillDetails[i].billId;
						billObject['billNumber']				= selectedBillDetails[i].billNumber;
						billObject['preExecutiveId']			= selectedBillDetails[i].executiveId;
						billObject['billTypeId']				= selectedBillDetails[i].billTypeId;
						billObject['referenceBillId']			= selectedBillDetails[i].referenceBillId;
						billObject['referenceBillNumber']		= selectedBillDetails[i].referenceBillNumber;
						
						billDetailsArr.push(billObject);
					}
					
					let doneTheStuff = false;
					
					let jsonObject					= new Object();
					
					jsonObject.billDetailsArr		= JSON.stringify(billDetailsArr);
					jsonObject.tokenWiseCheckingForDuplicateTransaction = tokenWiseCheckingForDuplicateTransaction;
					jsonObject.TOKEN_KEY 			= TOKEN_KEY;
					jsonObject.TOKEN_VALUE 			= TOKEN_VALUE;
					jsonObject.billCreditorId		= $('#partyNameEle').val();
					
					if(!doneTheStuff){
						let btModalConfirm = new Backbone.BootstrapModal({
							content		: 	"Are you sure you want to cancel selected Bills ?",
							modalWidth 	: 	30,
							title		:	'Cancel selected Bills',
							okText		:	'YES',
							showFooter 	: 	true,
							okCloses	:	true,
							modalBodyId	: 'photoModal'
						}).open();

						btModalConfirm.on('ok', function() {
							if(!doneTheStuff){
								getJSON(jsonObject, WEB_SERVICE_URL + '/creditorInvoiceWS/cancelBill.do', _this.responseAfterCancelBill, EXECUTE_WITH_ERROR);
								doneTheStuff = true;
								showLayer();
							}
						});
						
						btModalConfirm.on('cancel', function() {
							doneTheStuff = false;
							hideLayer();
						});
					}
					
				}, responseAfterCancelBill : function(response) {
					TOKEN_KEY 	= response.TOKEN_KEY;
					TOKEN_VALUE	= response.TOKEN_VALUE;
					
					if(response.message != undefined) {
						let errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						setTimeout(function(){ location.reload(); }, 1000);
						hideLayer();
						return;
					}
				}
			});
		});