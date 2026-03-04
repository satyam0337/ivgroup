define(
		[
			PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
			'JsonUtility',
			'messageUtility',
			'/ivcargo/resources/js/generic/urlparameter.js',
			'bootstrapSwitch',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
			],
			function(Selection) {
			'use strict';
			let jsonObject = new Object(), myNod, _this = '', crossingAgentBill = null, crsngAgentBillSummary = null, transactionType	= 0;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/crossingAgentBillWS/loadEditCrossingAgentInvoice.do?',	_this.renderElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderElements : function(response) {
					showLayer();

					let loadelement = new Array();
					let baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/crossingagentbill/editCrossingAgentInvoice.html", function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						hideLayer();
					
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
								_this.onFind();
						});
					});
				}, KeyCheck : function(event) {
					let KeyID = event.keyCode;
					
					if(KeyID == 8 || KeyID == 46) {
						$('#editLinks').empty();
						_this.unbindEvent();
						refreshAndHidePartOfPage('right-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('left-border-boxshadow', 'hide');
					}
				}, unbindEvent : function() {
					$( "#lrNumberEle" ).unbind( "keydown" );
					$( "#findBtnForAppendLR").unbind( "click" );
					$( "#appendBtn").unbind( "click" );
				}, onFind : function() {
					showLayer();
					let jsonObject = new Object();

					let billNumber				= $('#billNumberEle').val();

					jsonObject.billNumber		= billNumber.replace(/\s+/g, "");
					jsonObject.branchId			= $('#branchEle').val();

					getJSON(jsonObject, WEB_SERVICE_URL + '/crossingAgentBillWS/getBillDetailsForUpdate.do', _this.setBillDetailsData, EXECUTE_WITH_ERROR);
				}, setBillDetailsData : function(response) {
					refreshAndHidePartOfPage('right-border-boxshadow', 'hide');

					if(response.message != undefined) {
						hideLayer();
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('left-border-boxshadow', 'hide');
						return;
					}
					
					showPartOfPage('bottom-border-boxshadow');
					showPartOfPage('middle-border-boxshadow');
					showPartOfPage('left-border-boxshadow');
					$('#datasaved').remove();

					_this.unbindEvent();

					$( "#removeLRs").unbind( "click" );
					$( "#addLRs").unbind( "click" );
					$( "#updateLrNo").unbind( "click" );
					
					_this.setDataInTable(response);
					
					hideLayer();
				}, setDataInTable : function(data) {
					changeDisplayProperty('billdetailspannel', 'block');
					$('#right1-border-boxshadow').addClass('hide');
					
					crsngAgentBillSummary	= data.crsngAgentBillSummary;
					crossingAgentBill		= data.CrossingAgentBill;

					$('#editLinks').empty(); 
					$('#editLinks').append('<div class="btn-group containerForList"></div>');
					
					$('<span style="margin-left: 40px;"><button type="button" class="btn btn-info" id="addLRs" data-tooltip="Add LR Into Bill">Append LR Into Bill</button></span>').appendTo( ".containerForList" );
					$('<span style="margin-left: 40px;"><button type="button" class="btn btn-primary" id="removeLRs" data-tooltip="Remove LR from Bill">Remove LR from Bill</button></span>').appendTo( ".containerForList" );
					$('<span style="margin-left: 40px;"><button type="button" class="btn btn-info" id="crossingHirebtn" data-tooltip="Crossing Hire">Crossing Hire</button></span>').appendTo( ".containerForList" );
					$('<input class="form-control uneditable-input crossinghireAmount" type="text" name="crossingHireAmnt" data-tooltip="Crossing Hire Amount" style="text-transform: uppercase; height: 38px; width: auto; padding: 6px 12px; font-size: 14px; border-radius: 5px; margin-left: 40px; display: none;" placeholder="Enter Crossing Hire" id="crossingHireAmnt">').appendTo(".containerForList");

					$('#billDate').html(crossingAgentBill.creationDateTimeString);
					$('#crossingAgentName').html(crossingAgentBill.crossingAgentName);
					$('#paidAmount').html(crossingAgentBill.paidAmount);
					$('#topayAmount').html(crossingAgentBill.topayAmount);
					$('#crossingHire').html(crossingAgentBill.crossingHire);
					$('#billTotal').html(crossingAgentBill.netAmount);
					
					$("#addLRs").bind("click", function() {
						_this.addLRs();
					});
					
					$("#crossingHirebtn").bind("click", function() {
						$("#crossingHireAmnt").toggle();

					});
						
					$("#removeLRs").bind("click", function() {
						_this.removeLRs();
					});
						
					$("#updateLrNo").bind("click", function() {
						_this.updateDataInBill();
					});
					
					_this.createHeaderForLRDetails();
					_this.createAndSetLRWiseData();
				}, createHeaderForLRDetails : function() {
					$('#reportTable thead').empty();
					let columnArray							= new Array();
					
					columnArray.push('<th style="vertical-align: top; width: 6%;" id="checkBoxtoRemoveLR" class="hide">Remove LR</th>');
					columnArray.push('<th style="width: 6%;">Sr No.</th>');
					columnArray.push('<th style="width: 6%;">LR No.</th>');
					columnArray.push('<th style="width: 6%;">Booking Date</th>');
					columnArray.push('<th style="width: 8%;">From</th>');
					columnArray.push('<th style="width: 8%;">To</th>');
					columnArray.push('<th style="width: 8%;">Consignor</th>');
					columnArray.push('<th style="width: 8%;">Consignee</th>');
					columnArray.push('<th style="width: 8%;">Crossing LR No</th>');
					columnArray.push('<th style="width: 8%;">Paid Amount</th>');
					columnArray.push('<th style="width: 8%;">Topay Amount</th>');
					//columnArray.push('<th style="width: 8%;">Crossing Hire</th>');
					columnArray.push('<th style="width: 8%;">Amount</th>');
					
					$('#reportTable thead').append('<tr class="text-white text-center bg-primary">' + columnArray.join(' ') + '</tr>');
				}, createAndSetLRWiseData : function() {
					$('#reportTable tfoot').empty();
					$('#reportTable tbody').empty();
					
					let columnArray		= new Array();
					
					for (let i = 0; i < crsngAgentBillSummary.length; i++) {
						let summaryObj	= crsngAgentBillSummary[i];
						transactionType = summaryObj.txnTypeId;
						$('#checkBoxtoRemoveLR').removeClass('hide');
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='checkbox' name='lrToRemove' id='lrToRemove' value='"+ summaryObj.crossingAgentBillSummaryId +"'/></td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='wayBillNumber_" + summaryObj.wayBillId + "'><b>" + summaryObj.wayBillNumber + "<b></a></td>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + summaryObj.wayBillBookingDateTimeStr + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + summaryObj.wayBillSrcBranchName + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + summaryObj.wayBillDestBranchName + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + summaryObj.consignorName + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + summaryObj.consigneeName + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><input name='crossingWayBillNo' class='form-control crossingWayBillNo' type='text' value='" + summaryObj.crossingWayBillNo + "' maxlength='12'/></td>");
						columnArray.push("<td style='display: none; vertical-align: middle;'><input name='preCrossingWayBillNo' class='form-control' type='text' value='" + summaryObj.crossingWayBillNo + "'/></td>");
						columnArray.push("<td style='display: none; vertical-align: middle;'><input name='wayBillCrossingId' class='form-control' type='text' value='" + summaryObj.wayBillCrossingId + "' /></td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + summaryObj.paidAmount + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + summaryObj.topayAmount + "</td>");
						//columnArray.push("<td style='text-align: center; vertical-align: middle;'><input name='crossinghireAmount' class='form-control crossinghireAmount' type='text' value='" + summaryObj.crossingHire + "' maxlength='7'/></td>");
						columnArray.push("<td style='display: none; vertical-align: middle;'><input name='previousCrossingHire' class='form-control' type='text' value='" + summaryObj.crossingHire + "' /></td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;' id='netAmount_" + summaryObj.crossingAgentBillSummaryId + "'>" + summaryObj.netAmount + "</td>");
							
						$('#reportTable tbody').append('<tr id="editStbsTr_' + summaryObj.wayBillId + '">' + columnArray.join(' ') + '</tr>');
						
						$("#wayBillNumber_" + summaryObj.wayBillId).bind("click", function() {
							let elementId		= $(this).attr('id');
							let wayBillId		= elementId.split('_')[1];
							_this.viewWayBillDetails(wayBillId, summaryObj.wayBillNumber);
						});

						columnArray = [];
					}
					
					$('.crossingWayBillNo').bind("keypress", function(event) {
						if(event.altKey==1){return false;}
						return noNumbers(event);
					});

					$('.crossinghireAmount').bind("keypress", function(event) {
						if(!validateFloatKeyPress(event, this))
							return false;
					});
				}, viewWayBillDetails : function(wayBillId, wayBillNumber) {
					window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + wayBillId + '&NumberType=' + 1 + '&wayBillNumber=' + wayBillNumber);
				}, removeLRs : function() {
					let checkBoxArray	= getAllCheckBoxSelectValue('lrToRemove');

					if(checkBoxArray.length == 0) {
						showAlertMessage('error', 'Please, Select atleast 1 LR to Remove !');
						return false;
					}

					if(crsngAgentBillSummary.length == checkBoxArray.length) {
						showAlertMessage('error', 'Please, Cancel this Bill if you want to Remove all LR !');
						return false;
					}
					
					if(!confirm("Are you sure you want to remove selected LRs ?"))
						return;
					
					let jsonObject = new Object();

					jsonObject["wayBillIds"]	= checkBoxArray.join(',');
					jsonObject.billId			= crossingAgentBill.crossingAgentBillId;
					jsonObject.txnTypeId		= transactionType;

					getJSON(jsonObject, WEB_SERVICE_URL + '/crossingAgentBillWS/removeLRsFromCrossingAgentBill.do', _this.responseAfterRemoveLR, EXECUTE_WITH_ERROR);
					showLayer();
				},  responseAfterRemoveLR : function(response) {
					hideLayer();
					
					if(response.message != undefined) {
						refreshAndHidePartOfPage('right-border-boxshadow', 'hide');
						$('#lrDetailsTable tbody').empty();
						$('#lrDetails tbody').empty();
						
						_this.unbindEvent();
						
						//$('#addLrs').addClass('hide');
						$('#lrDetails').addClass('hide');
						
						$('#paidAmount').html(response.paidAmount);
						$('#topayAmount').html(response.topayAmount);
						$('#crossingHire').html(response.crossingHire);
						$('#billTotal').html(response.netAmount);
						
						if(response.crsngAgentBillSummary != undefined)	{					
							crsngAgentBillSummary	= response.crsngAgentBillSummary;
							_this.createAndSetLRWiseData();
						} else if(response.lrWiseAmountHM != undefined) {
							let lrWiseAmountHM	= response.lrWiseAmountHM;
							
							for(let crossingAgentBillSummaryId in lrWiseAmountHM) {
								$('#netAmount_' + crossingAgentBillSummaryId).html(lrWiseAmountHM[crossingAgentBillSummaryId]);
							}
						}
					}
				}, addLRs : function() {
					showPartOfPage('right-border-boxshadow');
					$('#lrNumberEle').focus();
					goToPosition('right-border-boxshadow', 'slow');

					$("#lrNumberEle").bind("keydown", function(e) {
						if(e.which == $.ui.keyCode.ENTER || e.keyCode == $.ui.keyCode.ENTER)
							_this.getWayBillDetailsToAppend();
					});

					$("#findBtnForAppendLR").bind("click", function() {
						_this.getWayBillDetailsToAppend();
					});

					$("#appendBtn").bind("click", function() {
						_this.appendLRInBill();
					});
				}, getWayBillDetailsToAppend : function() {
					let lrNumberEle		= $('#lrNumberEle').val();

					if(lrNumberEle == '') {
						showAlertMessage('info', 'Enter LR Number !');
						return false;
					}

					let jsonObject = new Object();
					jsonObject.wayBillNumber	= lrNumberEle.replace(/\s+/g, "");
					jsonObject.txnTypeId		= 1;
					jsonObject.crossingAgentId	= crossingAgentBill.crossingAgentId;

					showLayer();
					getJSON(jsonObject, WEB_SERVICE_URL + '/crossingAgentBillWS/getLRToAppendInCrossingAgentBill.do', _this.addLRToAppendInCrossingAgentBill, EXECUTE_WITH_ERROR);
				}, addLRToAppendInCrossingAgentBill : function(response) {
					hideLayer();
					
					if(response.message != undefined) {
						$('#lrNumberEle').val('');
						return;
					}
					
					$('#lrDetails').removeClass('hide');

					let bills			= response.crossingAgentInvoiceBills;
					let appendLRMessage	= response.appendLRMessage;

					if(typeof appendLRMessage != 'undefined' && !confirm(appendLRMessage)) {
						$('#lrNumberEle').val('');
						$('#lrNumberEle').focus();
						return;
					}
					
					let preLRNumber		= $('#wayBillNumber1_' + bills.wayBillId).html();
					
					if(typeof preLRNumber != 'undefined' && preLRNumber != '') {
						showAlertMessage('info', 'Already Added LR Number !');
						$('#lrNumberEle').val('');
						return;
					}
					
					_this.setLRDetailsToAppend(bills);
					
					$('#lrNumberEle').val('');
					$('#lrNumberEle').focus();
				}, setLRDetailsToAppend : function(bills) {
					let columnArray		= new Array();
					columnArray.push("<td style='text-align: center; vertical-align: middle; display: none;'><input type='checkbox' name='lrToAppend' id='lrToAppend' value='" + bills.wayBillId + "' checked='checked'/></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='wayBillNumber1_" + bills.wayBillId + "'>" + bills.wayBillNumber + "</a></td>");					
					columnArray.push("<td style='text-align: center; vertical-align: middle;display:none;'><input name = 'wayBillCrossingId' value='" + bills.wayBillCrossingId + "'></td>");					
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + bills.createDateTimeString + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + bills.sourceBranch + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + bills.destinationBranch + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + bills.consignorName + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + bills.consigneeName + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + bills.paidAmount + "</td>");					
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + bills.topayAmount + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + bills.grandTotal + "</td>");
					//columnArray.push("<td style='text-align: center; vertical-align: middle;'><input name='crossinghireAmount' class='form-control crossinghireAmount' type='text' value='" + bills.crossingHire + "' maxlength='7'/></td>");

					$('#lrDetailsTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');

					$("#wayBillNumber1_" + bills.wayBillId).bind("click", function() {
						let elementId		= $(this).attr('id');
						let wayBillId		= elementId.split('_')[1];
						_this.viewWayBillDetails(wayBillId, bills.wayBillNumber);
					});
					
					$('.crossinghireAmount').bind("keypress", function(event) {
						if(!validateFloatKeyPress(event, this))
							return false;
					});

					hideLayer();
				}, appendLRInBill : function() {
					let waybillIdCrossingHire = [];
					let wabillList = [];
					
					$("#lrDetailsTable tbody tr").each(function() {
						let wayBillCrossingId 	= $(this).find("input[name='wayBillCrossingId']").val();
						let wayBillId 			= $(this).find("input[name='lrToAppend']").val();
					//	let crossingHireAmount	= $(this).find("input[name='crossinghireAmount']").val();
						
						if (wayBillId  !== undefined) {
							waybillIdCrossingHire.push({
								wayBillId: wayBillId,
								wayBillCrossingId: wayBillCrossingId,
								crossingHire: 0
							});
						}

						wabillList.push(wayBillCrossingId);
					});
					
					let totalWaybills = waybillIdCrossingHire.length;
					let crossingHireAmnt = Math.round(Number($('#crossingHireAmnt').val()) || 0); 

					if (totalWaybills > 0) {
						let baseAmount = Math.floor(crossingHireAmnt / totalWaybills);
						let remainder = crossingHireAmnt - (baseAmount * totalWaybills);

						waybillIdCrossingHire.forEach((waybill, index) => {
							waybill.crossingHire = baseAmount + (index < remainder ? 1 : 0);
						});
					}
					
					if(!confirm("Are you sure you want to Add selected LRs ?"))
						return;

					let jsonObject 				= new Object();

					jsonObject["wayBillCrossingIds"]= wabillList.join(',');
					jsonObject.billId				= crossingAgentBill.crossingAgentBillId;
					jsonObject.billNumber			= $('#billNumberEle').val();
					jsonObject.txnTypeId			= transactionType;
					jsonObject.crossingAgentId		= crossingAgentBill.crossingAgentId;
					jsonObject["crossingHireList"]	= JSON.stringify(waybillIdCrossingHire);;
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/crossingAgentBillWS/appendLRInCrossingAgentBill.do', _this.responseAfterRemoveLR, EXECUTE_WITH_ERROR);
					showLayer();
				}, updateDataInBill: function() {
					let waybillCrossingData = [];
					let wabillIdList = [];
					
					if (!confirm("Are you sure you want to Update ?"))
						return;
					
					$("#reportTable tbody tr").each(function() {
						let wayBillId 					= this.id.split('_')[1]
						let crossingWayBillNo			= $(this).find("input[name='crossingWayBillNo']").val();
						//let crossinghireAmount			= $(this).find("input[name='crossinghireAmount']").val();
						let previousCrossingHire		= $(this).find("input[name='previousCrossingHire']").val();
						let crossingAgentBillSummaryId	= $(this).find("input[name='lrToRemove']").val();
						let wayBillCrossingId			= $(this).find("input[name='wayBillCrossingId']").val();
						let preCrossingWayBillNo		= $(this).find("input[name='preCrossingWayBillNo']").val();
						
						if (wayBillId  && crossingWayBillNo !== undefined) {
							waybillCrossingData.push({
								wayBillId : wayBillId,
								wayBillCrossingId : wayBillCrossingId,
								crossingHire : 0,
								previousCrossingHire : parseFloat(previousCrossingHire) || 0,
								crossingWayBillNo : crossingWayBillNo || "",
								previousCrossingWayBillNo : preCrossingWayBillNo || ""
							});
						}
						
						wabillIdList.push(crossingAgentBillSummaryId);
					});
					
					let totalWaybills = waybillCrossingData.length;
					let crossingHireAmnt = Math.round(Number($('#crossingHireAmnt').val()) || 0);

					if (totalWaybills > 0) {
						let baseAmount = Math.floor(crossingHireAmnt / totalWaybills);
						let remainder = crossingHireAmnt - (baseAmount * totalWaybills);

						waybillCrossingData.forEach((waybill, index) => {
							waybill.crossingHire = baseAmount + (index < remainder ? 1 : 0);
						});
					}

					
					let jsonObject = new Object();
					jsonObject["wayBillIds"] 				= wabillIdList.join(',');
					jsonObject.crossingAgentId 				= crossingAgentBill.crossingAgentId;
					jsonObject["crossingHireAmountList"] 	= JSON.stringify(waybillCrossingData);
					jsonObject.billId 						= crossingAgentBill.crossingAgentBillId;
					jsonObject.txnTypeId 					= transactionType;
					
					showLayer();
					getJSON(jsonObject, WEB_SERVICE_URL + '/crossingAgentBillWS/updateCrossingWaybillData.do', _this.responseAfterRemoveLR, EXECUTE_WITH_ERROR);
				}
			});
		});
		