/**
 * 
 */
var mrNumberBillIdHm	= null;
var mrNumberBillClearanceIdHm	= null;
define([
	PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
],function(Selection, UrlParameter) {
	'use strict';
	let jsonObject = new Object(), myNod, _this = '', configuration, isCRMPage, isCRMPagePage;
	return Marionette.LayoutView.extend({
		initialize : function() {
			isCRMPage 		= UrlParameter.getModuleNameFromParam("isCRMPage");
			isCRMPagePage	= isCRMPage != null && isCRMPage != undefined && isCRMPage == 'true';
			_this = this;
		},render : function() {
			if(isCRMPagePage) {
				jsonObject.isCRMPage		= true;
				getJSON(jsonObject, CUSTOMER_ACCESS_URL_CONSTANT + '/partyWiseLedgerAccountReportWS/getCrmPartyWiseLedgerAccountReportElement.do?', _this.setPartyWiseLedgerAccountReportElements, EXECUTE_WITHOUT_ERROR);
			} else	
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/partyWiseLedgerAccountReportWS/getPartyWiseLedgerAccountReportElement.do?',	_this.setPartyWiseLedgerAccountReportElements, EXECUTE_WITHOUT_ERROR);
			
			return _this;
		},setPartyWiseLedgerAccountReportElements:function (response) {
			let loadelement				= new Array();
			let baseHtml				= new $.Deferred();
			
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/partywiseledgeraccount/partyWseLegerAccountReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				configuration	= response;
				
				let elementConfiguration	= new Object();
				
				elementConfiguration.dateElement		= $('#dateEle');
				response.elementConfiguration			= elementConfiguration;
				response.isCalenderSelection			= true;
				response.isOneYearCalenderSelection		= true;
				response.monthLimit						= 12;
				response.partySelection					= !(isCRMPagePage && response.corporateAccountArr == undefined);
				response.isSearchByAllParty				= false;
				response.AllOptionInPartyAutocomplete	= false;
				
				Selection.setSelectionToGetData(response);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod.add({
					selector: '#partyNameEle',
					validate: 'validateAutocomplete:#partyNameEle',
					errorMessage: 'Select Party !'
				});
				
				hideLayer();
				
				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit(_this);								
				});
			});
		}, onSubmit : function() {
			showLayer();
			let jsonObject = new Object();
			
			if($("#dateEle").attr('data-startdate') != undefined)
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			
			if($("#dateEle").attr('data-enddate') != undefined)
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			
			jsonObject["partyId"]		= $('#partyNameEle').val();

			if(isCRMPagePage) {
				jsonObject.isCRMPage		= true;
				getJSON(jsonObject, CUSTOMER_ACCESS_URL_CONSTANT + '/partyWiseLedgerAccountReportWS/getPartyWiseLedgerAccountReportData.do?', _this.setReportData, EXECUTE_WITHOUT_ERROR);
			} else
				getJSON(jsonObject, WEB_SERVICE_URL+'/partyWiseLedgerAccountReportWS/getPartyWiseLedgerAccountReportData.do', _this.setReportData, EXECUTE_WITH_ERROR);
		},setReportData : function(response){
			hideLayer();
			
			if(response.message != undefined) {
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}
			
			let partyWiseLedgerAccountsModel	= response.partyWiseLedgerAccountsModel;
			let reportData						= response.reportData;
			let branch							= response.branch;
			let accountGroup					= response.accountGroup;
			mrNumberBillIdHm			= response.mrNumberBillIdHm;
			mrNumberBillClearanceIdHm	= response.mrNumberBillClearanceIdHm;
			
			$("#printPartyWiseLedgerReport").empty();
			$("#selectedParty").html("Party : ");
			$("#selectedFromDate").html("From Date : ");
			$("#selectedToDate").html("To Date : ");
			$("#SelectedPartyValue").html(partyWiseLedgerAccountsModel.partyName);
			$("#selectedFromDateValue").html(partyWiseLedgerAccountsModel.fromDateStr);
			$("#selectedToDateValue").html(partyWiseLedgerAccountsModel.toDateStr);
			
			$('#reportDetailsTable thead').empty();
			$('#reportDetailsTable tbody').empty();
			$('#reportDetailsTable tfoot').empty();
			
			let columnHeadArray				= new Array();
			let columnArray					= new Array();
			let columnFooterArray			= new Array();
			
			let totalCredit = 0;
			let totalDebit	= 0;
			
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Sr.No</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Date</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Description</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Details</th>");
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Branch</th>");
			
			if(configuration.swapCreditDebitColumn) {
				columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Debit</th>");
				columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Credit</th>");
			} else {
				columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Credit</th>");
				columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Debit</th>");
			}
			
			columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Balance</th>");
			
			$('#reportDetailsTable thead').append('<tr id="reportDetailsTableHeader" class="text-info text-center">' + columnHeadArray.join(' ') + '</tr>');
			
			for(var i = 0;i < reportData.length;i++){
				if(reportData[i].details == 'undefined'|| reportData[i].details == undefined)
					reportData[i].details = '';

				var className = 'partialBillPaymentColor_' + reportData[i].partyWiseLedgerAccountsID + ' clearBillPaymentColor_' + reportData[i].partyWiseLedgerAccountsID;
				
				let narration ='';
				
				if(configuration.consolidatedEntryForBillPayment) {
					if(reportData[i].billClearanceDetailsList != undefined) {
						let clearanceList = reportData[i].billClearanceDetailsList;
						let firstRec = clearanceList[0];
						var remark;
						narration = null;

						if(typeof firstRec.billClearanceRemark !== 'undefined' && firstRec.billClearanceRemark != '') {
							remark	= firstRec.billClearanceRemark;
						} else {
							remark = '--';
						}

						let debtAmt	= 0
						let negoAmt	= 0
						let debtRemark = '';
						let negoRemark = '';
												
						let totalRecAmt = 0;
												
						if(configuration.showNarrationWithBankName) {
							let clearanceDataMap 	= new Map(clearanceList.map(obj => [obj.billClearanceId, obj]));  
							clearanceList			= Array.from(clearanceDataMap.values());
							let bankName = '';
													
							for(const element of clearanceList) {
								let billClearance	= element;
														
								if(bankName == '' && billClearance.billClearanceBankName != undefined && billClearance.billClearanceBankName != null)
									bankName	= billClearance.billClearanceBankName;
								
									if(billClearance.billClearanceStatus == PAYMENT_TYPE_STATUS_BAD_DEBT_ID) {
										debtAmt += billClearance.billClearanceDiscount;
										debtRemark	= 'Bad Debt Entry - Bill Payment amt : ' + debtAmt;
									}
									
									if(billClearance.billClearanceStatus == PAYMENT_TYPE_STATUS_NEGOTIATED_ID) {
										negoAmt +=  billClearance.billClearanceDiscount;
										totalRecAmt	+= billClearance.billClearanceTotalReceivedAmount;
										negoRemark	= 'Negotiated Entry - Bill Payment amt : ' + negoAmt;
									}
														
									if(billClearance.billClearanceStatus != PAYMENT_TYPE_STATUS_BAD_DEBT_ID && billClearance.billClearanceStatus != PAYMENT_TYPE_STATUS_NEGOTIATED_ID){
										totalRecAmt	+= billClearance.billClearanceTotalReceivedAmount;
								}
							}
													
							narration = 'Bill Payment Date :' + firstRec.billClearanceCreationDateTimeStampString + ',' + firstRec.customPaymentDetails + ',  '+ bankName +', Received Amount :' + totalRecAmt +' '+ debtRemark +' '+ negoRemark + ', Remark :' + remark;
						} else 
							narration = 'Bill Payment Date :' + firstRec.billClearanceCreationDateTimeStampString + ',' + firstRec.customPaymentDetails + ', Received Amount :' + reportData[i].debitAmount.toFixed(2) + ', Remark :' + remark;
					}
				}
				
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i+1) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + reportData[i].userDateTime + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + reportData[i].description + "</td>");
				
				let details = reportData[i].details;

				if (typeof narration !== 'undefined') {
					if (configuration.showSTBSBillPrint && details !== undefined && details.trim() !== '' && reportData[i].shortCreditCollnLedgerId > 0) {
						let billNoMatch = details.match(/STBS Bill No : (\d+)/);
						
						if (billNoMatch) {
							let billNo = billNoMatch[1];
							let billLinkHTML	= `<a href="#" onclick="event.preventDefault(); printBill('${reportData[i].partyMasterId}', '${reportData[i].shortCreditCollnLedgerId}');">${billNo}</a>`;
							details = details.replace(`STBS Bill No : ${billNo}`, `STBS Bill No : ${billLinkHTML}`);
						}
					}
					if (configuration.showStbsLrData && details !== undefined && details.trim() !== '') {
						const billNoMatch = details.match(/STBS Bill No : (.+?), Date/m);
						if (billNoMatch != null) {
							let billNo = billNoMatch[1].split(',')

							 for(let i=0; i<billNo.length; i++){
 								let billLinkHTML = `<a href="#" onclick="event.preventDefault(); printLR('${billNo[i]}');">${billNo[i]}</a>`;
								details = details.replace(`${billNo[i]}`, `${billLinkHTML}`);
							 }
						}

					}
					
					details += '<br/>' + narration;
				}
				
				
				columnArray.push(`<td style='text-align: center; vertical-align: middle;white-space: normal; word-wrap: break-word;overflow-wrap: break-word;word-break: break-word;max-width: 300px;'>${details}</td>`);
				
				if(reportData[i].identifier == 5 || reportData[i].identifier == 6) {
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
				} else if(reportData[i].billClearanceDetailsList != undefined) {
					if(reportData[i].billClearanceDetailsList.length > 0){
						var billClearanceListData = reportData[i].billClearanceDetailsList;
							
						if(billClearanceListData[0].billClearanceBranchName == undefined)
							billClearanceListData[0].billClearanceBranchName = '';
							
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + billClearanceListData[0].billClearanceBranchName + "</td>");
					}
				} else {
					if(reportData[i].branchName == undefined)
						reportData[i].branchName = '';
						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + reportData[i].branchName + "</td>");
				}
				
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + reportData[i].creditAmount.toFixed(2) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + reportData[i].debitAmount.toFixed(2) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + reportData[i].balance.toFixed(2) + "</td>");
				$('#reportDetailsTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
				columnArray = [];
				
				if(reportData[i].billClearanceDetailsList != undefined) {
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					columnArray.push('<td style="text-align: center; vertical-align: middle;"><table class="'+ className +' table table-bordered table-responsive" id="billClearanceDetails_'+ i +'"></table></td>');
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					$('#reportDetailsTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					columnArray = [];
				}
				
				if(reportData[i].creditWayBillPaymentDetails != undefined) {
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					columnArray.push('<td style="text-align: center; vertical-align: middle;"><table id="creditWayBillPaymentDetails_'+ i +'" class="table table-bordered table-responsive"></table></td>');
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					$('#reportDetailsTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					columnArray = [];
				}
				
				if(i != (reportData.length - 1)) {
					totalCredit += reportData[i].creditAmount;
					totalDebit 	+= reportData[i].debitAmount;
				}
				
				if(reportData[i].clearBillPayment) {
					$(document).ready(function() {
						$('.clearBillPaymentColor_'+ reportData[i].partyWiseLedgerAccountsID).css('background-color' , '#90EE90');
					});
				} else if(reportData[i].partialBillPayment) {
					$(document).ready(function() {
						$('.partialBillPaymentColor_'+ reportData[i].partyWiseLedgerAccountsID).css('background-color' , '#FFFF99');
					});
				}
			}
			
			columnFooterArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnFooterArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnFooterArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnFooterArray.push("<td style='text-align: center; vertical-align: middle;font-weight:bold;'>Total</td>");
			columnFooterArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			columnFooterArray.push("<td style='text-align: center; vertical-align: middle;font-weight:bold;'>" + totalCredit.toFixed(2) + "</td>");
			columnFooterArray.push("<td style='text-align: center; vertical-align: middle;font-weight:bold;'>" + totalDebit.toFixed(2) + "</td>");
			columnFooterArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
			$('#reportDetailsTable tfoot').append('<tr>' + columnFooterArray.join(' ') + '</tr>');
			
			let totalGrandTotal	= 0, totalTxnAmount	= 0, totalReceivedAmount = 0, totalBalanceAmount = 0, totalTdsAmount	= 0, totalClaimAmount = 0;
			
			for(var i = 0;i < reportData.length;i++) {
				if(reportData[i].billClearanceDetailsList != undefined) {
					if(reportData[i].billClearanceDetailsList.length > 0) {
						var billClearanceListData = reportData[i].billClearanceDetailsList;
						
						let billClearanceDataMap	= new Map(billClearanceListData.map(obj => [obj.billClearanceId, obj]));  
						
						billClearanceListData		= Array.from(billClearanceDataMap.values());
						
						var className = 'partialBillPaymentColor_' + reportData[i].partyWiseLedgerAccountsID + ' clearBillPaymentColor_' + reportData[i].partyWiseLedgerAccountsID;
						
						let columnHeadArrayInner				= new Array();
						let columnArrayInner					= new Array();
						let columnFooterArrayInner				= new Array();
						
						totalGrandTotal		= 0;
						totalTxnAmount		= 0;
						totalReceivedAmount = 0;
						totalBalanceAmount	= 0;
						totalTdsAmount		= 0;
						totalClaimAmount	= 0;
						let totalNegoAmount		= 0;
						
						columnHeadArrayInner.push("<th style='text-align: center; vertical-align: middle;'>BILL NO</th>");
						columnHeadArrayInner.push("<th style='text-align: center; vertical-align: middle;'>Payment DT</th>");
						columnHeadArrayInner.push("<th style='text-align: center; vertical-align: middle;'>BILL AMT</th>");
						columnHeadArrayInner.push("<th style='text-align: center; vertical-align: middle;'>Txn amt</th>");
						columnHeadArrayInner.push("<th style='text-align: center; vertical-align: middle;'>RECD AMT</th>");
						
						if(configuration.showNegotiateAndBadDebtAmtColumn)
							columnHeadArrayInner.push("<th style='text-align: center; vertical-align: middle;'>NEG / BAD DEBT AMT</th>");
												
						columnHeadArrayInner.push("<th style='text-align: center; vertical-align: middle;'>BAL</th>");
						columnHeadArrayInner.push("<th style='text-align: center; vertical-align: middle;'>TDS</th>");
						columnHeadArrayInner.push("<th class= 'paymentModeLabel hide' style='text-align: center; vertical-align: middle;'>Payment Mode</th>");
						columnHeadArrayInner.push("<th style='text-align: center; vertical-align: middle;'>CLAIM</th>");
						
						if(configuration.showMrNumberColumn)
							columnHeadArrayInner.push("<th style='text-align: center; vertical-align: middle;'>MR NO</th>");
						
						$("#billClearanceDetails_"+ i ).append('<tr id="" class="text-info text-center">' + columnHeadArrayInner.join(' ') + '</tr>');
						
						for(const element of billClearanceListData) {
							let badDebtAmt	= 0;
							let balAmt	= 0;
							let moneyReceiptNo = '';
																					
							if(element.moneyReceiptNumber != undefined && element.moneyReceiptNumber != 'undefined')
								moneyReceiptNo = element.moneyReceiptNumber;
														
							columnArrayInner.push("<td class='"+ className +"' style='text-align: center; vertical-align: middle;'>" + element.billClearanceBillNumber + "</td>");
							columnArrayInner.push("<td class='"+ className +"' style='text-align: center; vertical-align: middle;'>" + element.billClearanceCreationDateTimeStampString + "</td>");
							columnArrayInner.push("<td class='"+ className +"' style='text-align: center; vertical-align: middle;'>" + element.billClearanceGrandTotal + "</td>");
							columnArrayInner.push("<td class='"+ className +"' style='text-align: center; vertical-align: middle;'>" + element.billClearanceTotalReceivedAmount + "</td>");
							columnArrayInner.push("<td class='"+ className +"' style='text-align: center; vertical-align: middle;'>" + (element.billClearanceTotalReceivedAmount - element.tdsAmount - element.billClearanceClaimAmount) + "</td>");
							//columnArrayInner.push("<td class='"+ className +"' style='text-align: center; vertical-align: middle;'>" + (element.billClearanceGrandTotal - element.billClearanceTotalReceivedAmount) + "</td>");
							
							if(configuration.showNegotiateAndBadDebtAmtColumn) {
								if(element.billClearanceStatus == PAYMENT_TYPE_STATUS_NEGOTIATED_ID || element.billClearanceStatus == PAYMENT_TYPE_STATUS_BAD_DEBT_ID){
									badDebtAmt = element.billClearanceDiscount;
									totalNegoAmount += element.billClearanceDiscount;
								}
								
								columnArrayInner.push("<td class='"+ className +"' style='text-align: center; vertical-align: middle;'>" + badDebtAmt + "</td>");
							}
														
							if(element.billClearanceStatus != PAYMENT_TYPE_STATUS_NEGOTIATED_ID && element.billClearanceStatus != PAYMENT_TYPE_STATUS_BAD_DEBT_ID){
								balAmt	= element.billClearanceGrandTotal - element.billClearanceTotalReceivedAmount;
								totalBalanceAmount += (element.billClearanceGrandTotal - element.billClearanceTotalReceivedAmount);
							}
														
							columnArrayInner.push("<td class='"+ className +"' style='text-align: center; vertical-align: middle;'>" + balAmt + "</td>");
							columnArrayInner.push("<td class='"+ className +"' style='text-align: center; vertical-align: middle;'>" + element.tdsAmount + "</td>");
							columnArrayInner.push("<td class='paymentModeTd hide' style='text-align: center; vertical-align: middle;'>" + element.billClearancePaymentModeString + "</td>");
							columnArrayInner.push("<td class='"+ className +"' style='text-align: center; vertical-align: middle;'>" + element.billClearanceClaimAmount + "</td>");
							
							if(configuration.showMrNumberColumn)
								columnArrayInner.push("<td class='"+ className +"' style='text-align: center; vertical-align: middle;'> <a style = 'cursor: pointer;' onclick='printWindowForMultipleMoneyReceipt (" +element.billClearanceBranchId+","+ moneyReceiptNo +");'> " + moneyReceiptNo	 + "</td>");
																	
							$("#billClearanceDetails_"+ i).append('<tr>' + columnArrayInner.join(' ') + '</tr>');
							columnArrayInner = [];
							totalGrandTotal			+= element.billClearanceGrandTotal;
							totalTxnAmount			+= element.billClearanceTotalReceivedAmount;
							totalReceivedAmount		+= (element.billClearanceTotalReceivedAmount - element.tdsAmount - element.billClearanceClaimAmount);
							//totalBalanceAmount		+= (element.billClearanceGrandTotal - element.billClearanceTotalReceivedAmount);
							totalTdsAmount			+= element.tdsAmount;
							totalClaimAmount		+= element.billClearanceClaimAmount;
							
							if(configuration.showCustomPaymentModeColumn) {
								$('.paymentModeLabel').removeClass('hide');
								$('.paymentModeTd').removeClass('hide');
							}
							
							if(element.clearBillPayment) {
								$(document).ready(function() {
									$('.clearBillPaymentColor_'+ element.partyWiseLedgerAccountsID).css('background-color' , '#90EE90');
								});
							} else if(element.partialBillPayment) {
								$(document).ready(function() {
									$('.partialBillPaymentColor_'+ element.partyWiseLedgerAccountsID).css('background-color' , '#FFFF99');
								});
							}
						}
						
						columnFooterArrayInner.push("<th style='text-align: center; vertical-align: middle;font-weight:bold;'>Total</th>");
						columnFooterArrayInner.push("<th style='text-align: center; vertical-align: middle;font-weight:bold;'></th>");
						columnFooterArrayInner.push("<th style='text-align: center; vertical-align: middle;font-weight:bold;'>"+totalGrandTotal+"</th>");
						columnFooterArrayInner.push("<th style='text-align: center; vertical-align: middle;font-weight:bold;'>"+totalTxnAmount+"</th>");
						columnFooterArrayInner.push("<th style='text-align: center; vertical-align: middle;font-weight:bold;'>"+totalReceivedAmount+"</th>");
						
						if(configuration.showNegotiateAndBadDebtAmtColumn)
							columnFooterArrayInner.push("<th style='text-align: center; vertical-align: middle;font-weight:bold;'>"+totalNegoAmount+"</th>");
												
						columnFooterArrayInner.push("<th style='text-align: center; vertical-align: middle;font-weight:bold;'>"+totalBalanceAmount+"</th>");
						columnFooterArrayInner.push("<th style='text-align: center; vertical-align: middle;font-weight:bold;'>"+totalTdsAmount+"</th>");
						columnFooterArrayInner.push("<th class='paymentModeFooter hide' style='text-align: center; vertical-align: middle;font-weight:bold;'></th>");
						columnFooterArrayInner.push("<th style='text-align: center; vertical-align: middle;font-weight:bold;'>"+totalClaimAmount+"</th>");
						
						if(configuration.showMrNumberColumn)
							columnFooterArrayInner.push("<th style='text-align: center; vertical-align: middle;font-weight:bold;'></th>");
																	
						$("#billClearanceDetails_"+ i ).append('<tr id="" class="text-info text-center">' + columnFooterArrayInner.join(' ') + '</tr>');
						
						if(configuration.showCustomPaymentModeColumn)
							$('.paymentModeFooter').removeClass('hide');
					}
				}
				
				if(reportData[i].creditWayBillPaymentDetails != undefined) {
					let creditWayBillPaymentData = reportData[i].creditWayBillPaymentDetails;
					
					let columnHeadArrayInner1				= new Array();
					let columnArrayInner1					= new Array();
					let columnFooterArrayInner1				= new Array();
					
					totalTxnAmount		= 0;
					totalReceivedAmount = 0;
					totalTdsAmount		= 0;
					totalClaimAmount	= 0;
					
					columnHeadArrayInner1.push("<th style='text-align: center; vertical-align: middle;'>LR NO</th>");
					columnHeadArrayInner1.push("<th style='text-align: center; vertical-align: middle;'>Payment DT</th>");
					columnHeadArrayInner1.push("<th style='text-align: center; vertical-align: middle;'>Txn amt</th>");
					columnHeadArrayInner1.push("<th style='text-align: center; vertical-align: middle;'>RECD AMT</th>");
					columnHeadArrayInner1.push("<th style='text-align: center; vertical-align: middle;'>TDS</th>");
					columnHeadArrayInner1.push("<th class= 'paymentModeLabel hide' style='text-align: center; vertical-align: middle;'>Payment Mode</th>");
					columnHeadArrayInner1.push("<th style='text-align: center; vertical-align: middle;'>CLAIM</th>");
					
					if(configuration.showMrNumberColumn)
						columnHeadArrayInner1.push("<th style='text-align: center; vertical-align: middle;'>MR NO.</th>");
										
					$("#creditWayBillPaymentDetails_"+ i ).append('<tr id="" class="text-info text-center">' + columnHeadArrayInner1.join(' ') + '</tr>');
					
					for(const element of creditWayBillPaymentData) {
						columnArrayInner1.push("<td style='text-align: center; vertical-align: middle;'>" + element.wayBillNumber + "</td>");
						columnArrayInner1.push("<td style='text-align: center; vertical-align: middle;'>" + element.receivedDateTimeStr + "</td>");
						columnArrayInner1.push("<td style='text-align: center; vertical-align: middle;'>" + element.receivedAmount + "</td>");
						columnArrayInner1.push("<td style='text-align: center; vertical-align: middle;'>" + (element.receivedAmount - element.tdsAmount - element.claimAmount) + "</td>");
						columnArrayInner1.push("<td style='text-align: center; vertical-align: middle;'>" + element.tdsAmount + "</td>");
						columnArrayInner1.push("<td class='paymentModeTd hide' style='text-align: center; vertical-align: middle;'>" + element.paymentModeName + "</td>");
						columnArrayInner1.push("<td style='text-align: center; vertical-align: middle;'>" + element.claimAmount + "</td>");
						
						if (configuration.showMrNumberColumn) {
	                            if (element.creditWayBillTxnId && element.creditWayBillTxnClearanceSummaryId) {
	                                columnArrayInner1.push("<td style='text-align: center; vertical-align: middle;'>" +"<a style='cursor:pointer;' onclick='printWindowForMoneyReceipt(" +element.creditWayBillTxnId + "," +element.creditWayBillTxnClearanceSummaryId +");'>" +(element.moneyReceiptNumber || '-') +    "</a></td>");
	                            } else {
	                                columnArrayInner1.push("<td style='text-align: center; vertical-align: middle;'>-</td>");
	                            }
					  }
												
						$("#creditWayBillPaymentDetails_"+ i).append('<tr>' + columnArrayInner1.join(' ') + '</tr>');
						columnArrayInner1		= [];
						totalTxnAmount			+= element.receivedAmount;
						totalReceivedAmount		+= (element.receivedAmount - element.tdsAmount - element.claimAmount);
						totalTdsAmount			+= element.tdsAmount;
						totalClaimAmount		+= element.claimAmount;
						
						if(configuration.showCustomPaymentModeColumn) {
							$('.paymentModeLabel').removeClass('hide');
							$('.paymentModeTd').removeClass('hide');
						}
					}

					columnFooterArrayInner1.push("<th style='text-align: center; vertical-align: middle;font-weight:bold;'>Total</th>");
					columnFooterArrayInner1.push("<th style='text-align: center; vertical-align: middle;font-weight:bold;'></th>");
					columnFooterArrayInner1.push("<th style='text-align: center; vertical-align: middle;font-weight:bold;'>"+totalTxnAmount+"</th>");
					columnFooterArrayInner1.push("<th style='text-align: center; vertical-align: middle;font-weight:bold;'>"+totalReceivedAmount+"</th>");
					columnFooterArrayInner1.push("<th style='text-align: center; vertical-align: middle;font-weight:bold;'>"+totalTdsAmount+"</th>");
					columnFooterArrayInner1.push("<th class='paymentModeFooter hide' style='text-align: center; vertical-align: middle;font-weight:bold;'></th>");
					columnFooterArrayInner1.push("<th style='text-align: center; vertical-align: middle;font-weight:bold;'>"+totalClaimAmount+"</th>");
					
					if(configuration.showMrNumberColumn)
						columnFooterArrayInner1.push("<th style='text-align: center; vertical-align: middle;font-weight:bold;'></th>");
										
					$("#creditWayBillPaymentDetails_"+ i ).append('<tr id="" class="text-info text-center">' + columnFooterArrayInner1.join(' ') + '</tr>');
					
					if(configuration.showCustomPaymentModeColumn)
						$('.paymentModeFooter').removeClass('hide');
				}
			}
			
			$('#middle-border-boxshadow').removeClass('hide');
			
			let data = new Object();
			data.accountGroupNameForPrint	= accountGroup.accountGroupDescription;
			data.accountGroupId				= accountGroup.accountGroupId;
			data.branchAddress				= branch.branchAddress;
			data.branchPhoneNumber			= branch.branchContactDetailPhoneNumber;
			data.printLogoInLaserPrint		= configuration.printLogoInLaserPrint;
			data.isLaserPrintAllow			= 'true';
			data.isPlainPrintAllow			= 'true';
			data.isExcelButtonDisplay		= 'true';
			printTable(data, 'reportData', 'partyWiseLedgerAccountsReport', 'Party Wise Ledger Accounts', 'printPartyWiseLedgerReport');
			
			hideLayer();
		}
	});
});

function printBill(partyId, billId) {
		window.open('ShortCreditLegderBillPrint.do?pageId=286&eventId=4&flag=true&billId=' + billId + '&partyId=' + partyId, 'newwindow', config = 'height=425,width=615, toolbar=no, menubar=no, scrollbars=yes, resizable=yes,location=no, directories=no, status=no')
}	
function printLR(shortCreditCollLedgerNumber) {
		window.open('ShortCreditLegderBill.do?pageId=340&eventId=2&modulename=stbsLrDetails&shortCreditCollLedgerNumber=' + shortCreditCollLedgerNumber);
}	
	

function printWindowForMultipleMoneyReceipt(branchId,number){
	let billIds = '';
	let clearanceIds = '';
	
	if(mrNumberBillIdHm != null && mrNumberBillIdHm != undefined && mrNumberBillIdHm != 'undefined')
		billIds =	mrNumberBillIdHm[number];
	
	if(mrNumberBillClearanceIdHm != null && mrNumberBillClearanceIdHm != undefined && mrNumberBillClearanceIdHm != 'undefined')
		clearanceIds =	mrNumberBillClearanceIdHm[number];
	
	if(billIds != '' && billIds != null && clearanceIds != '' && clearanceIds != null)
		childwin = window.open("printMoneyReceipt.do?pageId=3&eventId=16&billIds="+billIds+"&moduleIdentifier="+BILL_PAYMENT+"&billClearanceIds="+clearanceIds+"&differentMrPrintForParitalPayment=true&billClearanceBranchId="+branchId+"&mrPrintFromInvoiceSearch=false",'_blank',"newwindow",config="height=500,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no");
}

function printWindowForMoneyReceipt(billId,clearanceId){
	childwin = window.open("printMoneyReceipt.do?pageId=3&eventId=16&wayBillId="+billId+"&moduleIdentifier="+SHORT_CREDIT_PAYMENT+"&clearanceId="+clearanceId,"newwindow",config="height=500,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no"); 
}
