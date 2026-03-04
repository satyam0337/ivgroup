
let shortCreditCollectionSheetLedger	= null;
let	shortCreditCollectionSummary		= null;
let transactionType						= 0;
let allowToEditLrRateLink				= false;
define(
		[
			PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
			'JsonUtility',
			'messageUtility',
			'/ivcargo/resources/js/generic/urlparameter.js',
			'jquerylingua',
			'language',
			'autocomplete',
			'autocompleteWrapper',
			'bootstrapSwitch',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
			],
			function(Selection) {
			'use strict';
			let jsonObject = new Object(), myNod, _this = '', editStbsConfiguration,btModalConfirm, allowToEditConsignment;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/editStbsWS/loadEditSTBS.do?',	_this.renderEditStbsElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderEditStbsElements : function(response) {
					showLayer();

					let loadelement = new Array();
					let baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/stbs/EditSTBS.html", function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('left-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('right-border-boxshadow', 'hide');
						hideLayer();

						editStbsConfiguration						= response;
						$("#billNumberEle").focus();
						
						document.getElementById('billNumberEle').addEventListener("keydown", _this.KeyCheck);

						response.executiveTypeWiseBranch	= true;

						let elementConfiguration	= new Object();

						elementConfiguration.branchElement		= $('#branchEle');
						response.elementConfiguration			= elementConfiguration;
						Selection.setSelectionToGetData(response);

						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});

						myNod.add({
							selector: '#billNumberEle',
							validate: 'presence',
							errorMessage: 'Enter Bill Number !'
						});

						myNod.add({
							selector		: '#branchEle',
							validate		: 'presence',
							errorMessage	: 'Select Branch !'
						});

						$("#findBtn").click(function() {
							myNod.performCheck();

							if(myNod.areAll('valid'))
								_this.onFind(_this);
						});
					});
				}, KeyCheck : function(event) {
					let KeyID = event.keyCode;
					
					if(KeyID == 8 || KeyID == 46) {
						$('#editLinks').empty();
						$( "#lrNumberEle" ).unbind( "keydown" );
						$( "#findBtnForAppendLR").unbind( "click" );
						$( "#appendBtn").unbind( "click" );
						refreshAndHidePartOfPage('right-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('left-border-boxshadow', 'hide');
						$('#taxTypeDiv').addClass('hide');
					}
				}, onFind : function() {
					showLayer();
					let jsonObject = new Object();

					let BillNumber				= $('#billNumberEle').val();

					jsonObject.billNumber		= BillNumber.replace(/\s+/g, "");
					jsonObject.branchId			= $('#branchEle_primary_key').val();

					getJSON(jsonObject, WEB_SERVICE_URL + '/editStbsWS/getBillDetailsForUpdate.do', _this.setBillDetailsData, EXECUTE_WITH_ERROR);
				},setBillDetailsData : function(response) {
					refreshAndHidePartOfPage('right-border-boxshadow', 'hide');

					if(response.message != undefined) {
						hideLayer();
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('left-border-boxshadow', 'hide');
						$('#taxTypeDiv').addClass('hide');
						return;
					}
					
					showPartOfPage('bottom-border-boxshadow');
					showPartOfPage('middle-border-boxshadow');
					showPartOfPage('left-border-boxshadow');
					removeTableRows('billDetails', 'table');
					$('#reportTable tfoot').empty();
					$('#datasaved').remove();

					$( "#lrNumberEle" ).unbind( "keydown" );
					$( "#findBtnForAppendLR").unbind( "click" );
					$( "#appendBtn").unbind( "click" );
					
					_this.setDataInTable(response);
					
					hideLayer();
				}, setDataInTable : function(data) {
					
					changeDisplayProperty('billdetailspannel', 'block');
					$('#right1-border-boxshadow').addClass('hide');
					
					shortCreditCollectionSummary		= data.ShortCreditCollectionSheetSummary;
					shortCreditCollectionSheetLedger	= data.ShortCreditCollectionSheetLedger;
					allowToEditLrRateLink 				= data.allowToEditLrRateLink;
					allowToEditConsignment		 		= editStbsConfiguration.allowToEditConsignment;

					$('#editLinks').empty(); 
					$('#editLinks').append('<div class="btn-group containerForList"></div>');
					
					$('<span style="margin-left: 40px;"><button type="button" class="btn btn-info" id="addLRs" data-tooltip="Add LR Into Bill">Append LR Into Bill</button></span>').appendTo( ".containerForList" );

					$('<span style="margin-left: 40px;"><button type="button" class="btn btn-primary" id="removeLRs" data-tooltip="Remove LR from Bill">Remove LR from Bill</button></span>').appendTo( ".containerForList" );

					$('#BillDate').html(shortCreditCollectionSheetLedger.creationDateTimeStr);
					$('#CreditorName').html(shortCreditCollectionSheetLedger.partyName);
					$('#AdditionalCharge').html(shortCreditCollectionSheetLedger.billAmount);
					$('#BillTotal').html(shortCreditCollectionSheetLedger.billAmount);
					$('#remarkCol').html(shortCreditCollectionSheetLedger.remark);
					
					$("#addLRs").bind("click", function() {
						_this.addLRs(shortCreditCollectionSheetLedger, shortCreditCollectionSummary);
					});
					
					$("#removeLRs").bind("click", function() {
						_this.removeLRs(shortCreditCollectionSheetLedger, shortCreditCollectionSummary);
					});

					if(allowToEditLrRateLink)
						$('#editLrRateLink').removeClass('hide');
						
					if(allowToEditConsignment)
						$('#editConsignmentLink').removeClass('hide');
				
					let columnArray							= new Array();
					for (let i = 0; i < shortCreditCollectionSummary.length; i++) {
						let summaryObj	= shortCreditCollectionSummary[i];
						transactionType = summaryObj.transactionType
						
						$('#checkBoxtoRemoveLR').removeClass('hide');
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='checkbox' name='lrToRemove' id='lrToRemove' value='"+ summaryObj.waybillId +"'/></td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='wayBillNumber_" + summaryObj.waybillId + "'><b>" + summaryObj.waybillNumber + "<b></a></td>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + summaryObj.wayBillBookingDateTimeStr + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + summaryObj.wayBillSrcBranchName + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + summaryObj.wayBillDestBranchName + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + summaryObj.consignorName + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + summaryObj.consigneeName + "</td>");
						columnArray.push("<td style='text-align: right; vertical-align: middle; background-color: #E6E6FA;' id='stbsWayBillPaymentModuleGrandTotal_" + summaryObj.waybillId + "'>" + summaryObj.waybillAmount.toFixed(2)+ "</td>");
						
						if(allowToEditLrRateLink)
							columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='editLrRate_" + summaryObj.waybillId + "'><b style='font-size: 14px'>Edit LR Rate</b></a></td>");
						
						if(allowToEditConsignment)
							columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='editConsigmentRate_" + summaryObj.waybillId + "'><b style='font-size: 14px'>Edit Consignment</b></a></td>");	
							
						$('#reportTable tbody').append('<tr id="editStbsTr_' + summaryObj.waybillId + '">' + columnArray.join(' ') + '</tr>');
						
						$("#editLrRate_" + summaryObj.waybillId).bind("click", function() {
							let elementId		= $(this).attr('id');
							let wayBillId		= elementId.split('_')[1];
							_this.editWayBillCharges(shortCreditCollectionSheetLedger, wayBillId);
						});
						
						$("#editConsigmentRate_" + summaryObj.waybillId).bind("click", function() {
							let elementId		= $(this).attr('id');
							let wayBillId		= elementId.split('_')[1];
							_this.editConsignment(shortCreditCollectionSheetLedger, wayBillId);
						});
						
						$("#wayBillNumber_" + summaryObj.waybillId).bind("click", function() {
							let elementId		= $(this).attr('id');
							let wayBillId		= elementId.split('_')[1];
							_this.viewWayBillDetails(wayBillId, summaryObj.waybillNumber);
						});

						columnArray = [];
					}
					columnArray = [];
					
				},viewWayBillDetails : function(wayBillId, wayBillNumber) {
					window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + wayBillId + '&NumberType=' + 1 + '&wayBillNumber=' + wayBillNumber);
				}, removeLRs : function(bill, billSummaries) {
					
					let checkBoxArray	= new Array();

					$.each($("input[name=lrToRemove]:checked"), function() { 
						checkBoxArray.push($(this).val());
					});

					if(billSummaries.length == 1) {
						showMessage('error', iconForErrMsg + ' Please, Cancel this Bill if bill has only 1 LR !');
						return false;
					}

					if(checkBoxArray.length == 0) {
						showMessage('error', iconForErrMsg + ' Please, Select atleast 1 LR to Remove !');
						return false;
					}

					if(billSummaries.length == checkBoxArray.length) {
						showMessage('error', iconForErrMsg + ' Please, Cancel this Bill if you want to Remove all LR !');
						return false;
					}
					
					let jsonObject = new Object();

					 btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to remove selected LRs ?",
						modalWidth 	: 	30,
						title		:	'Remove Seleted LRs',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
					
					jsonObject["wayBills"]	= checkBoxArray.join(',');
					jsonObject.billId		= bill.shortCreditCollLedgerId;
					jsonObject.txnTypeId	= transactionType;

					btModalConfirm.on('ok', function() {
						getJSON(jsonObject, WEB_SERVICE_URL + '/editStbsWS/removeLRSFromSTBS.do', _this.responseAfterRemoveLR, EXECUTE_WITH_ERROR);
						showLayer();
					});
				},  responseAfterRemoveLR : function(response) {
					if(response.message != undefined) {
						let errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						refreshAndHidePartOfPage('right-border-boxshadow', 'hide');
						$('#lrDetails').addClass('hide');
						$('#lrDetailsTable tbody').empty();
						$( "#lrNumberEle").unbind( "keydown" );
						$( "#findBtnForAppendLR").unbind( "click" );
						$( "#appendBtn").unbind( "click" );
						$('#taxTypeDiv').addClass('hide');
						$('#addLrs').addClass('hide');
						$('#lrDetails').addClass('hide');
						
						if (typeof btModalConfirm !== 'undefined' && btModalConfirm != null)
							btModalConfirm.close();
						
						_this.onFind(_this);
						hideLayer();
					}
				}, addLRs : function(bill, billSummaries) {
					showPartOfPage('right-border-boxshadow');
					$('#lrNumberEle').focus();
					goToPosition('right-border-boxshadow', 'slow');

					$("#lrNumberEle").bind("keydown", function(event) {
						_this.getWayBillDetailsToAppend(event, bill);
					});

					$("#findBtnForAppendLR").bind("click", function() {
						_this.findWayBillDetailsToAppend(bill);
					});

					$("#appendBtn").bind("click", function() {
						_this.appendLRInBill(bill, billSummaries);
					});
				}, getWayBillDetailsToAppend : function(e, bill) {

					if(e.which == $.ui.keyCode.ENTER || e.keyCode == $.ui.keyCode.ENTER) {
						let lrNumberEle		= $('#lrNumberEle').val();

						if(lrNumberEle == '') {
							showMessage('info', iconForInfoMsg + ' Enter LR Number !');
							return false;
						}

						let jsonObject = new Object();

						jsonObject.wayBillNumber			= lrNumberEle.replace(/\s+/g, "");
						jsonObject.creationDateTimeStamp	= toDateTimeString(new Date(bill.creationTimestamp));
						jsonObject.txnTypeId	= transactionType;

						getJSON(jsonObject, WEB_SERVICE_URL + '/editStbsWS/getLRToAppendInSTBS.do', _this.addLRToAppendInSTBS, EXECUTE_WITH_ERROR);
						showLayer();
					}
				}, findWayBillDetailsToAppend : function(bill) {

					let lrNumberEle		= $('#lrNumberEle').val();

					if(lrNumberEle == '') {
						showMessage('info', iconForInfoMsg + ' Enter LR Number !');
						return false;
					}

					let jsonObject = new Object();

					jsonObject.wayBillNumber			= lrNumberEle.replace(/\s+/g, "");
					jsonObject.creationDateTimeStamp	= toDateTimeString(new Date(bill.creationTimestamp));
					jsonObject.txnTypeId	= transactionType;

					getJSON(jsonObject, WEB_SERVICE_URL + '/editStbsWS/getLRToAppendInSTBS.do', _this.addLRToAppendInSTBS, EXECUTE_WITH_ERROR);
					showLayer();
				}, addLRToAppendInSTBS : function(response) {
					if(response.message != undefined) {
						let errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						$('#lrNumberEle').val('');
						hideLayer();
						return;
					}
					
					$('#lrDetails').removeClass('hide');

					let bills			= response.stbsBills;
					let appendLRMessage	= response.appendLRMessage;

					if(typeof appendLRMessage != 'undefined' && !confirm(appendLRMessage)) {
						$('#lrNumberEle').val('');
						$('#lrNumberEle').focus();
						hideLayer();
						return;
					}
					
					let preLRNumber		= $('#wayBillNumber1_' + bills.wayBillId).html();
					
					console.log("preLRNumber",preLRNumber)

					if(typeof preLRNumber != 'undefined' && preLRNumber != '') {
						showMessage('info', iconForInfoMsg + ' Already Added LR Number !');
						$('#lrNumberEle').val('');
						hideLayer();
						return;
					}
					
					_this.setLRDetailsToAppend(bills);
					
					$('#lrNumberEle').val('');
					$('#lrNumberEle').focus();

					hideLayer();
				}, setLRDetailsToAppend : function(bills) {
					let columnArray		= new Array();

					columnArray.push("<td style='text-align: center; vertical-align: middle; display: none;'><input type='checkbox' name='lrToAppend' id='lrToAppend' value='" + bills.wayBillId + "' checked='checked'/></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='wayBillNumber1_" + bills.wayBillId + "'>" + bills.wayBillNumber + "</a></td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + bills.bookingDateTimeString + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + bills.sourceBranch + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + bills.destinationBranch + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + bills.consignor + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + bills.consignee + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;' id='stbsWayBillPaymentModuleGrandTotal1_" + bills.wayBillId + "'>" + bills.grandTotal + "</td>");
					$('#lrDetailsTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');

					$("#wayBillNumber1_" + bills.wayBillId).bind("click", function() {
						let elementId		= $(this).attr('id');
						let wayBillId		= elementId.split('_')[1];
						_this.viewWayBillDetails(wayBillId, bills.wayBillNumber);
					});

					hideLayer();
				}, appendLRInBill : function(bill, billSummaries) {
					
					let checkBoxArray			= new Array();

					$.each($("input[name=lrToAppend]:checked"), function() { 
						checkBoxArray.push($(this).val());
					});
					
					let jsonObject 				= new Object();

					jsonObject["wayBills"]	= checkBoxArray.join(',');
					jsonObject.billId		= bill.shortCreditCollLedgerId;
					jsonObject.billNumber	= $('#billNumberEle').val();
					jsonObject.txnTypeId	= transactionType;
					
					 btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to Add selected LRs ?",
						modalWidth 	: 	30,
						title		:	'Add Seleted LRs',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
					
					btModalConfirm.on('ok', function() {
						getJSON(jsonObject, WEB_SERVICE_URL + '/editStbsWS/appendLRInSTBS.do', _this.responseAfterRemoveLR, EXECUTE_WITH_ERROR);
						showLayer();
					});
					
				}, editWayBillCharges : function(bill, wayBillId) {
					let shortCreditLedgerId			= bill.shortCreditCollLedgerId;
					let txnTypeId	= transactionType;
					window.open('editWayBillCharges.do?pageId=340&eventId=2&modulename=editLRRate&wayBillId='+wayBillId+'&shortCreditCollLedgerId='+shortCreditLedgerId+'&txnTypeId='+txnTypeId+'&redirectFilter=15','mywin','left=100,top=70,width=1100,height=900,toolbar=no,resizable=no,scrollbars=yes');
					hideLayer();
				}, editConsignment : function(bill, wayBillId) {
					let shortCreditLedgerId			= bill.shortCreditCollLedgerId;
					let txnTypeId	= transactionType;
					window.open('updateConsignment.do?pageId=340&eventId=2&modulename=editConsignment&wayBillId='+wayBillId+'&shortCreditCollLedgerId='+shortCreditLedgerId+'&txnTypeId='+txnTypeId+'&redirectFilter=15','mywin','left=100,top=70,width=1100,height=900,toolbar=no,resizable=no,scrollbars=yes');
					hideLayer();
				}
			});
		});