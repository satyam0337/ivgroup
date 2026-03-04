var agentBranchHisabModel	= null
	,topayBookingIdList
	,paidBookingIdList
	,bookingCommissionIdList
	,deliveryCommissionIdList
	,blhpvIdList
	,expenseVoucherDetailsIdList,
	moduleId = 0,
	ModuleIdentifierConstant = null,
	byAgentBranchHisabWaybillIdsList,
	forAgentBranchHisabWaybillIdsList,
	PaymentTypeConstant = null,
	lhpvIdList,
	dispatchIdList,
	lsWiseModelList = null,
	showLSWiseBookingCommission = false;

define([  
	
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	],function(UrlParameter, Selection) {
	'use strict';
	let jsonObject = new Object(), myNod,  _this = ''
	, agentBranchHisabLedgerId, agentBranchHisabNumber, totalBooking = 0, totalExpense = 0
	, tdsAmt = 0, totalCommission = 0, collection = 0, lastOutstanding = 0, totalAmount = 0, totalAmountWithMod = 0
	, btModalConfirm, paymentStatusArrForSelection, paymentTypeArr = new Array(), configuration,roundOffTotalBkgCommiByAgentBranch = 0;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			this.$el.html(this.template);

			agentBranchHisabLedgerId		= UrlParameter.getModuleNameFromParam(MASTERID);
			agentBranchHisabNumber			= UrlParameter.getModuleNameFromParam(MASTERID2);
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/agentBranchHisabWS/getAgentBranchHisabReportElement.do?',_this.setElementDetails,	EXECUTE_WITH_ERROR);
			return _this;
		}, setElementDetails : function(response){
			//focus navigation initiates through this function
			initialiseFocus();
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			let paymentHtml	 = new $.Deferred();
			paymentStatusArrForSelection		= response.paymentStatusArrForSelection;
			paymentTypeArr						= response.paymentTypeArr;
			moduleId							= response.moduleId;
			ModuleIdentifierConstant			= response.ModuleIdentifierConstant;
			PaymentTypeConstant					= response.PaymentTypeConstant;
			configuration						= response;
			showLSWiseBookingCommission			= configuration.showLSWiseBookingCommission;

			loadelement.push(baseHtml);
			
			let htmlToLoad = "/ivcargo/html/module/AgentBranchHisab/agentBranchHisab_" + response.accountGroupId + ".html"
			
			if (!urlExists(htmlToLoad))
				htmlToLoad = "/ivcargo/html/module/AgentBranchHisab/agentBranchHisab.html"

			$("#mainContent").load(htmlToLoad, function() {
				baseHtml.resolve();
			});
			
			$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelectionTce.html", function() {
				paymentHtml.resolve();
			});

			loadelement.push(paymentHtml);

			$.when.apply($, loadelement).done(function() {
				if(response.message != undefined) {
					hideLayer();
					let errorMessage = response.message;
					$('#selection-div').html(errorMessage.description);
					return;
				}
								
				let executiveType = response.executiveType;
				let loginBranchId = response.branch;
			
				if (executiveType == EXECUTIVE_TYPE_BRANCHADMIN || executiveType == EXECUTIVE_TYPE_EXECUTIVE) {
					$("*[data-attribute=branch").addClass("hide");
				
					if ($('#branchEle')[0].selectize)
						$('#branchEle')[0].selectize.setValue(loginBranchId, true);
					else
						$('#branchEle').val(loginBranchId);
				}

				if(agentBranchHisabLedgerId != null && agentBranchHisabNumber != null) {
					$("#previousAgentCommissionBillingNumber").html(agentBranchHisabNumber);
					$("#previousAgentCommissionBillingDetails").removeClass("hide");
					showMessage('success',' Agent Branch Hisab ' + agentBranchHisabNumber + ' created successfully !');
					_this.openPrint(agentBranchHisabLedgerId);
				}
								
				setIssueBankAutocomplete();
				setAccountNoAutocomplete();

				let elementConfiguration	= {};
				
				elementConfiguration.dateElement = $("#dateEle");
				
				response.agentBranchSelection	= true;
				response.isCalenderSelection	= true;
				response.elementConfiguration	= elementConfiguration;
				
				Selection.setSelectionToGetData(response);

				const urlParams = new URLSearchParams(window.location.search);
				
				let branchIdFromUrl = urlParams.get("branchId");
				let fromDateFromUrl = urlParams.get("fromDate");
				let toDateFromUrl	= urlParams.get("toDate");
				let isCheckBox		= urlParams.get("isCheckBox");

				if(isCheckBox) {
					$("#dateCheckEle").prop("checked", true);
					$("#dateSelection").removeClass("hide");
					$("#dateEle").attr("data-startdate", fromDateFromUrl);
					$("#dateEle").attr("data-enddate", toDateFromUrl);
					$("#dateEle").val(fromDateFromUrl + " - " + toDateFromUrl);
				}
	
				if (branchIdFromUrl) {
					setTimeout(() => {
						if ($('#branchEle')[0].selectize) {
							$('#branchEle')[0].selectize.setValue(branchIdFromUrl);
							setTimeout(() => {
								$("#findAllBtn").click();
							}, 200); 
						}
					}, 400);
				}

				myNod = nod();

				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector: '#branchEle',
					validate: 'validateAutocomplete:#branchEle',
					errorMessage: 'Select proper Branch !'
				});
				hideLayer(); 

				$("#reprintBtn").click(function() {
					_this.openPrint(agentBranchHisabLedgerId);
				});
				
				if(response.branchList.length == 0)
					$("#findAllBtn").attr("disabled", "disabled");
				
				$("#dateCheckEle").click(function() {
					if ($('#dateCheckEle').prop('checked')) {
						$("#dateSelection").removeClass('hide');
					} else {
						$("#dateSelection").addClass('hide');
					}
				});
				
				$("#findAllBtn").click(function() {
					$("#bottom-border-boxshadow").addClass('hide');

					myNod.performCheck();
					
					const branchVal = Number($("#branchEle").val());
					const isDateChecked = $("#dateCheckEle").prop("checked");
				
					if(branchVal < 0 ) {
						if(!isDateChecked) {
							showAlertMessage('error', 'Please Select Date Range!');
							return;
						}
						
						_this.searchLRByAccountGroupId();
					} else if(myNod.areAll('valid'))
						_this.searchLRByBranchId();
				});
				
				$("#settleBtn").click(function() {
					_this.setSettlementData();
				});
				
				$("#settleBtn1").click(function() {
					_this.setSettlementData();
				});
				
				$("#settleAmount").bind("blur", function() {
					_this.validateReceiveAmount(this);
				});
				
				$("#settleAmount").bind("keyup", function() {
					_this.validateReceiveAmount(this);
				});
				
				$("#btSubmit").bind("click", function() {
					if(_this.validateDetails()) {
						_this.settleAgentBranchHisab();
					}
				});
			});
		}, searchLRByAccountGroupId : function() {
			let jsonObject = new Object();
			
			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}
			
			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			}
			
			jsonObject["dateWise"]			= $('#dateCheckEle').prop('checked');
			jsonObject["sourceBranchId"]	= $('#branchEle').val();
						
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL+'/agentBranchHisabWS/getAgentBranchHisabDetailsByAccountGroupId.do?', _this.setDataForAll, EXECUTE_WITH_ERROR);
		}, setDataForAll : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				$("#right1-border-boxshadow").addClass('hide');
				return;
			}
			
			_this.createSummaryTableHeader(response.branchAmountSummaryList);
		}, createSummaryTableHeader : function(branchAmountSummaryList) {		
			$('#middle-border-boxshadow').addClass('hide');
			$("#right1-border-boxshadow").removeClass('hide');
			$('#headingDataForCounttr').empty();
			$('#summaryDataBody').empty();
			
			let createRow = createRowInTable('', 'danger', '');
		
			let headerCol	  = createColumnInRow(createRow, '', '', '', 'center', '', '');
			let freightCol	  = createColumnInRow(createRow, '', '', '', 'center', '', '');
			let commissionCol = createColumnInRow(createRow, '', '', '', 'center', '', '');
			let finalHisabCol = createColumnInRow(createRow, '', '', '', 'center', '', '');
		
			appendValueInTableCol(headerCol, '<b>Branch Name</b>');
			appendValueInTableCol(freightCol, '<b>Booking Freight</b>');
			appendValueInTableCol(commissionCol, '<b>Commission</b>');
			appendValueInTableCol(finalHisabCol, '<b>Final Hisab</b>');
		
			appendRowInTable('headingDataForCounttr', createRow);
										
			branchAmountSummaryList.forEach(item => {
				let bookingFreight = item.totalFreight ?? 0;
				let commission	   = item.totalCommission ?? 0;
				let finalHisab	   = item.branchTotalAmount ?? 0;
		
				let row = createRowInTable('', '', '');
		 
				let c1 = createColumnInRow(row, '', '', '', 'left', '', '');
				let c2 = createColumnInRow(row, '', '', '', 'right', '', '');
				let c3 = createColumnInRow(row, '', '', '', 'right', '', '');
				let c4 = createColumnInRow(row, '', '', '', 'right', '', '');
		
				let branchNameInHyperLink =	 `<a href="#" class="branchLink" id="branchId_${item.branchId}">${item.branchName}</a>`;
				
				appendValueInTableCol(c1, branchNameInHyperLink);
				appendValueInTableCol(c2, bookingFreight + ' ₹');
				appendValueInTableCol(c3, commission + ' ₹');
				appendValueInTableCol(c4, finalHisab + ' ₹');
		
				appendRowInTable('summaryDataBody', row);
				
				$("#branchId_" + item.branchId).bind("click", function() {
					let elementId		= $(this).attr('id');
					let branchId		= elementId.split('_')[1];
					
					let fromDate = $("#dateEle").attr("data-startdate") ;
					let toDate	 = $("#dateEle").attr("data-enddate")  ;
							
					window.open(`ivcargo/agentBranchHisab.do?pageId=340&eventId=1&modulename=agentBranchHisab&branchId=${branchId}&fromDate=${fromDate}&toDate=${toDate} &isCheckBox=true`, "_blank");
				});
			});
	  },setDataForTable : function(branchAmountSummaryList) {
			let totalFreight						= agentBranchHisabModel.totalOutwardFreight + agentBranchHisabModel.totalInwardfreight ;
			let totalInOutCommission				= roundOffTotalBkgCommiByAgentBranch + agentBranchHisabModel.totalDeliveryCommiForAgentBranch  ;
			let totalPaidFreightByBranch			= agentBranchHisabModel.totalPaidFreightByBranch ;
			let totalTopayServiceAndHamaliAmt		= agentBranchHisabModel.totalTopayServiceAndHamaliAmt ;
			let totalTopayBookingAmtForAgentBranch	= agentBranchHisabModel.totalTopayBookingAmtForAgentBranch ;
			let amountPaidBy;
			let colorForAmountPaidBy; 
		
			if (totalAmount > 0) {
				amountPaidBy = agentBranchHisabModel.agentBranchName
				colorForAmountPaidBy = 'green'
			} else if (totalAmount < 0) {
				amountPaidBy = agentBranchHisabModel.excutiveBranchName
				colorForAmountPaidBy = 'red'
			}

			removeTableRows('finalHisabDetailsDiv', 'tbody');
			
			let createRow							= createRowInTable('', '', '');
			
			let header3				= '<b>Booking</b>';
			let amount3				= totalBooking+'&nbsp;&#x20B9;&nbsp;';
			
			let headerCol3				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			let amountCol3				= createColumnInRow(createRow, '', '', '', 'right', '', '');
			
			appendValueInTableCol(headerCol3, header3);
			appendValueInTableCol(amountCol3, amount3);
			appendRowInTable('finalHisabDetailsDiv', createRow);
			
			createRow							= createRowInTable('', '', '');
			
			header3				= '<b>Expense</b>';
			amount3				= totalExpense +'&nbsp;&#x20B9;&nbsp;';
			
			headerCol3				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			amountCol3				= createColumnInRow(createRow, '', '', '', 'right', '', '');
			
			appendValueInTableCol(headerCol3, header3);
			appendValueInTableCol(amountCol3, amount3);
			appendRowInTable('finalHisabDetailsDiv', createRow);
			
			createRow							= createRowInTable('', '', '');
			
			header3				= '<b>Collection</b>';
			amount3				= collection +'&nbsp;&#x20B9;&nbsp;';
			
			headerCol3				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			amountCol3				= createColumnInRow(createRow, '', '', '', 'right', '', '');
			
			appendValueInTableCol(headerCol3, header3);
			appendValueInTableCol(amountCol3, amount3);
			appendRowInTable('finalHisabDetailsDiv', createRow);
			
			createRow							= createRowInTable('', '', '');
			
			header3				= '<b>Commission</b>';
			amount3				= totalCommission+'&nbsp;&#x20B9;&nbsp;';
			
			headerCol3				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			amountCol3				= createColumnInRow(createRow, '', '', '', 'right', '', '');
			
			appendValueInTableCol(headerCol3, header3);
			appendValueInTableCol(amountCol3, amount3);
			appendRowInTable('finalHisabDetailsDiv', createRow);
			
			createRow							= createRowInTable('', '', '');
			
			header3				= '<b>Outstanding</b>';
			amount3				= lastOutstanding;
			
			headerCol3				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			amountCol3				= createColumnInRow(createRow, 'lastOutStandingAmt', '', '', 'right', '', '');
			
			appendValueInTableCol(headerCol3, header3);
			appendValueInTableCol(amountCol3, amount3);
			appendRowInTable('finalHisabDetailsDiv', createRow);
			
			createRow			= createRowInTable('', '', '');
			
			header3				= '<b>Total</b>';
			amount3				= totalAmount +'&nbsp;&#x20B9;&nbsp;';
			
			headerCol3				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			amountCol3				= createColumnInRow(createRow, '', '', '', 'right', '', '');
			
			appendValueInTableCol(headerCol3, header3);
			appendValueInTableCol(amountCol3, amount3);
			appendRowInTable('finalHisabDetailsDiv', createRow);
			
			removeTableRows('agentBranchfinalHisabDetailsDiv', 'tbody');

			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', ''), '<b>Total Freight</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'totalFreight', '', '', 'right', 'font-size: 14px', ''), totalFreight );
			appendRowInTable('agentBranchfinalHisabDetailsDiv', createRow);

			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', ''), '<b>Total Commission</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'totalCommission', '', '', 'right', 'font-size: 14px', ''), totalInOutCommission );
			appendRowInTable('agentBranchfinalHisabDetailsDiv', createRow);

			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', ''), '<b>Paid Amount</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'FreightPaidAmount', '', '', 'right', 'font-size: 14px', ''), totalPaidFreightByBranch );
			appendRowInTable('agentBranchfinalHisabDetailsDiv', createRow);

			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', ''), '<b>Other Branch To Pay</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'otherBranchTopay', '', '', 'right', 'font-size: 14px', ''), totalTopayBookingAmtForAgentBranch );
			appendRowInTable('agentBranchfinalHisabDetailsDiv', createRow);

			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', ''), '<b>Service Charge</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'toPayServiceAndHamaliCharge', '', '', 'right', 'font-size: 14px', ''), totalTopayServiceAndHamaliAmt );
			appendRowInTable('agentBranchfinalHisabDetailsDiv', createRow);

			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 15px', ''), '<b>Outstanding</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'lastOutStandingAmt', '', '', 'right', 'font-size: 14px', ''), lastOutstanding );
			appendRowInTable('agentBranchfinalHisabDetailsDiv', createRow);

			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 15px', ''), '<b>TOTAL</b>');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'right', 'font-size: 15px', ''), totalAmount );
			appendRowInTable('agentBranchfinalHisabDetailsDiv', createRow);

			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', `font-size: 15px; color: ${colorForAmountPaidBy};`, ''),'Amount Paid By Branch');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', `font-size: 15px;color: ${colorForAmountPaidBy};`, ''),amountPaidBy );
			appendRowInTable('agentBranchfinalHisabDetailsDiv', createRow);
		}, searchLRByBranchId : function() {
			let jsonObject = new Object();

			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}
			
			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			}
			
			jsonObject["dateWise"]			= $('#dateCheckEle').prop('checked');
			jsonObject["sourceBranchId"]	= $('#branchEle').val();
			
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL+'/agentBranchHisabWS/getAgentBranchHisabDetailsByBranchId.do?', _this.setData, EXECUTE_WITH_ERROR);
		}, setData : function(response) {
			hideLayer();
			$('#right1-border-boxshadow').addClass('hide');
			$('#summaryDataBody').empty();
			
			if(response.message != undefined) {
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}
			
			if (configuration.showPaymentStatusSelection) {
				$(".paymentTypeSelection").removeClass("hide");
				$('#paymentStatus' + ' option[value]').remove();
				$('#paymentStatus').append($("<option>").attr('value', 0).text("-- Please Select-----"));

				$(paymentStatusArrForSelection).each(function() {
					$('#paymentStatus').append($("<option>").attr('value', this.paymentStatusId).text(this.paymentStatusName));
				});
			}
					
			$(".paymentModeSelection").removeClass("hide");

			$('#paymentType' + ' option[value]').remove();
			$('#paymentType').append($("<option>").attr('value', 0).text("-- Please Select-----"));

			$(paymentTypeArr).each(function() {
				$('#paymentType').append($("<option>").attr('value', this.paymentTypeId).text(this.paymentTypeName));
			});

			agentBranchHisabModel			= response.agentBranchHisabModel;
			topayBookingIdList				= response.topayBookingIdList;
			paidBookingIdList				= response.paidBookingIdList;
			bookingCommissionIdList			= response.bookingCommissionIdList;
			deliveryCommissionIdList		= response.deliveryCommissionIdList;
			blhpvIdList						= response.blhpvIdList;
			expenseVoucherDetailsIdList		= response.expenseVoucherDetailsIdList;
			totalBooking					= agentBranchHisabModel.totalTopayBookingForAgentBranch + agentBranchHisabModel.totalPaidBookingByAgentBranch;
			totalExpense					= agentBranchHisabModel.totalBlhpvBalanceByAgentBranch + agentBranchHisabModel.totalDoorDeliveryExpenseByAgentBranch;
			tdsAmt							= ((agentBranchHisabModel.totalBookingCommissionByAgentBranch + agentBranchHisabModel.totalDeliveryCommissionByAgentBranch)*5)/100;
			totalCommission					= (agentBranchHisabModel.totalBookingCommissionByAgentBranch + agentBranchHisabModel.totalDeliveryCommissionByAgentBranch) - tdsAmt;
			collection						= totalBooking - totalExpense;
			lastOutstanding					= agentBranchHisabModel.previousOutStandingBalance;
			roundOffTotalBkgCommiByAgentBranch = Math.round(agentBranchHisabModel.totalBookingCommissionByAgentBranch);

			if (response.byAgentBranchHisabWaybillIdsList != undefined)
				byAgentBranchHisabWaybillIdsList = response.byAgentBranchHisabWaybillIdsList;
				
			if (response.forAgentBranchHisabWaybillIdsList != undefined)
				forAgentBranchHisabWaybillIdsList = response.forAgentBranchHisabWaybillIdsList;

			if (response.dispatchDetailsIdList != undefined)
				dispatchIdList = response.dispatchDetailsIdList;

			if (response.lhpvIdList != undefined)
				lhpvIdList = response.lhpvIdList;
				
			if(response.lsWiseModelList != undefined)
				lsWiseModelList = response.lsWiseModelList;

			let totalInOutCommission				= roundOffTotalBkgCommiByAgentBranch + agentBranchHisabModel.totalDeliveryCommiForAgentBranch;
			let totalPaidFreightByBranch			= agentBranchHisabModel.totalPaidFreightByBranch;
			let totalTopayServiceAndHamaliAmt		= agentBranchHisabModel.totalTopayServiceAndHamaliAmt;
			let totalTopayBookingAmtForAgentBranch	= agentBranchHisabModel.totalTopayBookingAmtForAgentBranch;

			if (configuration.agentBranchHisabForMgllpAndMgts) {
				_this.seTotalAmountForMgllpAndMgts(agentBranchHisabModel);
			} else if (configuration.agentBranchHisabForSugama) {
				totalAmount = totalPaidFreightByBranch + totalTopayBookingAmtForAgentBranch - totalInOutCommission - totalTopayServiceAndHamaliAmt

				if (agentBranchHisabModel.agentCreditDebitIdentifier == 1)
					totalAmount = Math.round(totalAmount + lastOutstanding);
				else if (agentBranchHisabModel.agentCreditDebitIdentifier == 2)
					totalAmount = Math.round(totalAmount - lastOutstanding);
				else if (agentBranchHisabModel.agentCreditDebitIdentifier == 0)
					totalAmount = Math.round(totalAmount);
			} else if (agentBranchHisabModel.agentCreditDebitIdentifier == 1)
				totalAmount = Math.round(collection - totalCommission + lastOutstanding);
			else if (agentBranchHisabModel.agentCreditDebitIdentifier == 2)
				totalAmount = Math.round(collection - totalCommission - lastOutstanding);
			else if (agentBranchHisabModel.agentCreditDebitIdentifier == 0)
				totalAmount = Math.round(collection - totalCommission);

			 totalAmountWithMod = Math.abs(totalAmount);
			_this.createHeader();
			_this.setBookingDataResult(agentBranchHisabModel);
			_this.setCommissionDataResult(agentBranchHisabModel);
			_this.setExpenseDataResult(agentBranchHisabModel);
			_this.setFinalDataResult(agentBranchHisabModel);
			_this.setAgentBranchHisabBookingData(agentBranchHisabModel);
			_this.setAgentBranchHisabCommissionData(agentBranchHisabModel);
			_this.setAgentBranchHisabBookingCommissionDataForMgtsAndMgllp(agentBranchHisabModel);
			_this.setAgentBranchHisabDeliveryCommissionDataForMgtsAndMgllp(agentBranchHisabModel);
			_this.setFinalDataAgentBranchHisabForMgllpAndMgts(agentBranchHisabModel);

			$("#right1-border-boxshadow").addClass('hide');
			$('#middle-border-boxshadow').removeClass('hide');
			hideLayer();
		},createHeader : function(){
			$('#headingDatatr').empty();

			let createRow				= createRowInTable('', 'danger', '');
			
			let headerCol				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			let amountCol				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			let detailsCol				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			
			appendValueInTableCol(headerCol, '<b>Booking</b>');
			appendValueInTableCol(amountCol, '<b>Amount (&nbsp;&#x20B9;&nbsp;) </b>');
			appendValueInTableCol(detailsCol, '<b>View Details</b>');
			
			appendRowInTable('headingDatatr', createRow);
		
			$('#headingCommissiontr').empty();
			createRow					= createRowInTable('', 'danger', '');

			let headerCol1					= createColumnInRow(createRow, '', '', '', 'center', '', '');
			let amountCol1					= createColumnInRow(createRow, '', '', '', 'center', '', '');
			let detailsCol1					= createColumnInRow(createRow, '', '', '', 'center', '', '');
			
			appendValueInTableCol(headerCol1, '<b>Commission </b>');
			appendValueInTableCol(amountCol1, '<b>Amount (&nbsp;&#x20B9;&nbsp;) </b>');
			appendValueInTableCol(detailsCol1, '<b>View Details</b>');
			
			appendRowInTable('headingCommissiontr', createRow);

			$('#expenseheadingtr').empty();
			createRow					= createRowInTable('', 'danger', '');

			let headerCol2					= createColumnInRow(createRow, '', '', '', 'center', '', '');
			let amountCol2					= createColumnInRow(createRow, '', '', '', 'center', '', '');
			let detailsCol2					= createColumnInRow(createRow, '', '', '', 'center', '', '');
			
			appendValueInTableCol(headerCol2, '<b>Expense </b>');
			appendValueInTableCol(amountCol2, '<b>Amount (&nbsp;&#x20B9;&nbsp;) </b>');
			appendValueInTableCol(detailsCol2, '<b>View Details</b>');
			
			appendRowInTable('expenseheadingtr', createRow);
			
			$('#finalheadingDatatr').empty();
			createRow					= createRowInTable('', 'danger', '');

			let headerCol3					= createColumnInRow(createRow, '', '', '', 'center', '', '');
			let amountCol3					= createColumnInRow(createRow, '', '', '', 'center', '', '');
			
			appendValueInTableCol(headerCol3, '<b>Final Hisab </b>');
			appendValueInTableCol(amountCol3, '<b>Amount (&nbsp;&#x20B9;&nbsp;) </b>');
			appendRowInTable('finalheadingDatatr', createRow);
			
			$('#agentBranchHeadingDatatr').empty();
			createRow = createRowInTable('', 'danger', '');
			let agentBranchheaderCol = createColumnInRow(createRow, '', '', '', 'center', 'font-size: 16px', '');
			let agentBranchAmountCol = createColumnInRow(createRow, '', '', '', 'center', 'font-size: 16px', '');
			appendValueInTableCol(agentBranchheaderCol, '<b>Booking</b>');
			appendValueInTableCol(agentBranchAmountCol, '<b>Amount (&nbsp;&#x20B9;&nbsp;) </b>');
			
			appendRowInTable('agentBranchHeadingDatatr', createRow);
		
			$('#agentBranchHeadingCommissiontr').empty();
			createRow = createRowInTable('', 'danger', '');

			let commissionHeader = createColumnInRow(createRow, '', '', '', 'center', 'font-size: 16px', '');
			let commissionAmtHeader = createColumnInRow(createRow, '', '', '', 'center', 'font-size: 16px', '');
			appendValueInTableCol(commissionHeader, '<b>Commission </b>');
			appendValueInTableCol(commissionAmtHeader, '<b>Amount (&nbsp;&#x20B9;&nbsp;) </b>');
			
			appendRowInTable('agentBranchHeadingCommissiontr', createRow);
			
			$('#agentBranchHeadingDeliveryMgtsAndMgllptr').empty();
			createRow = createRowInTable('', 'danger', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 16px', ''),'<b>Delivery </b>');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 16px', ''),'<b>Amount (&nbsp;&#x20B9;&nbsp;) </b>');
			appendRowInTable('agentBranchHeadingDeliveryMgtsAndMgllptr', createRow);

			$('#agentBranchfinalheadingDatatr').empty();
			createRow							= createRowInTable('', 'danger', '');

			let finalHisabHeaderCol				= createColumnInRow(createRow, '', '', '', 'center', 'font-size: 15px', '');
			let finalHisabAmtCol				= createColumnInRow(createRow, '', '', '', 'center', 'font-size: 15px', '');
			
			appendValueInTableCol(finalHisabHeaderCol, '<b>Final Hisab </b>');
			appendValueInTableCol(finalHisabAmtCol, '<b>Amount (&nbsp;&#x20B9;&nbsp;) </b>');
			appendRowInTable('agentBranchfinalheadingDatatr', createRow);
			
		},setBookingDataResult : function(agentBranchHisabModel) {
			removeTableRows('bookingDetailsDiv', 'tbody');
			
			let createRow			= createRowInTable('', '', '');
			
			let header				= '<b>Topay</b>';
			let amount				= agentBranchHisabModel.totalTopayBookingForAgentBranch;
			let details			= '&nbsp;';	
			
			if(amount > 0)
				details			= '<button id="toPayBookingBtn" class="btn btn-primary" onclick="getTopayBookingData();">View Details</button>';
			
			let headerCol				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			let amountCol				= createColumnInRow(createRow, 'topayBooking', '', '', 'right', '', '');
			let detailsCol				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			
			appendValueInTableCol(headerCol, header);
			appendValueInTableCol(amountCol, amount);
			appendValueInTableCol(detailsCol, details);
			appendRowInTable('bookingDetailsDiv', createRow);
			
			createRow					= createRowInTable('', '', '');
			
			header				= '<b>Paid</b>';
			amount				= agentBranchHisabModel.totalPaidBookingByAgentBranch;
			
			details			   = '&nbsp;';
			
			if(amount > 0)
				details			= '<button id="paidBookingBtn" class="btn btn-primary" onclick="getPaidBookingData();">View Details</button>';
			
			headerCol				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			amountCol				= createColumnInRow(createRow, 'paidBooking', '', '', 'right', '', '');
			detailsCol				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			
			appendValueInTableCol(headerCol, header);
			appendValueInTableCol(amountCol, amount);
			appendValueInTableCol(detailsCol, details);
			appendRowInTable('bookingDetailsDiv', createRow);
		},setCommissionDataResult : function(agentBranchHisabModel){
			removeTableRows('commissionDetailsDiv', 'tbody');
			
			let createRow			= createRowInTable('', '', '');
			
			let header1				= '<b>Booking</b>';
			let amount1				= agentBranchHisabModel.totalBookingCommissionByAgentBranch;
			let details1		= '&nbsp;';
			
			if(amount1 > 0)
				details1			= '<button id="bookingCommissionBtn" class="btn btn-primary " onclick="getBookingCommissionData();">View Details</button>';
			
			let headerCol1				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			let amountCol1				= createColumnInRow(createRow, 'bookingCommission', '', '', 'right', '', '');
			let detailsCol1				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			
			appendValueInTableCol(headerCol1, header1);
			appendValueInTableCol(amountCol1, amount1);
			appendValueInTableCol(detailsCol1, details1);
			appendRowInTable('commissionDetailsDiv', createRow);
			
			createRow							= createRowInTable('', '', '');
			
			header1				= '<b>Delivery</b>';
			amount1				= agentBranchHisabModel.totalDeliveryCommissionByAgentBranch;
			details1		= '&nbsp;';
			
			if(amount1 > 0)
				details1			= '<button id="bookingCommissionBtn" class="btn btn-primary " onclick="getDeliveryCommissionData();">View Details</button>';
			
			headerCol1				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			amountCol1				= createColumnInRow(createRow, 'deliveryCommission', '', '', 'right', '', '');
			detailsCol1				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			
			appendValueInTableCol(headerCol1, header1);
			appendValueInTableCol(amountCol1, amount1);
			appendValueInTableCol(detailsCol1, details1);
			appendRowInTable('commissionDetailsDiv', createRow);
			
			createRow			= createRowInTable('', '', '');
			
			header1				= '<b>TDS</b>';
			amount1				= tdsAmt;
			details1			= '&nbsp;';
			
			headerCol1				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			amountCol1				= createColumnInRow(createRow, 'tds', '', '', 'right', '', '');
			detailsCol1				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			
			appendValueInTableCol(headerCol1, header1);
			appendValueInTableCol(amountCol1, amount1);
			appendValueInTableCol(detailsCol1, details1);
			appendRowInTable('commissionDetailsDiv', createRow);
			
			createRow			= createRowInTable('', '', '');
			
			header1				= '<b>Total Commission</b>';
			amount1				= totalCommission;
			
			headerCol1				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			amountCol1				= createColumnInRow(createRow, 'totalCommission', '', '', 'right', '', '');
			detailsCol1				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			
			appendValueInTableCol(headerCol1, header1);
			appendValueInTableCol(amountCol1, amount1);
			appendValueInTableCol(detailsCol1, details1);
			appendRowInTable('commissionDetailsDiv', createRow);
		}, setExpenseDataResult : function(agentBranchHisabModel) {
			removeTableRows('expenseDetailsDiv', 'tbody');
			
			let createRow			= createRowInTable('', '', '');
			
			let header2				= '<b>Blhpv</b>';
			let amount2				= agentBranchHisabModel.totalBlhpvBalanceByAgentBranch;
			let details2		= '&nbsp;';
			
			if(amount2 > 0)
				details2			= '<button id="blhpvBtn" class="btn btn-primary " onclick="getBlhpvData();">View Details</button>';
			
			let headerCol2				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			let amountCol2				= createColumnInRow(createRow, 'totalBlhpv', '', '', 'right', '', '');
			let detailsCol2				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			
			appendValueInTableCol(headerCol2, header2);
			appendValueInTableCol(amountCol2, amount2);
			appendValueInTableCol(detailsCol2, details2);
			appendRowInTable('expenseDetailsDiv', createRow);
			
			createRow				= createRowInTable('', '', '');
			
			header2				= '<b>DDM Lorry Hire</b>';
			amount2				= agentBranchHisabModel.totalDoorDeliveryExpenseByAgentBranch;
			details2		= '&nbsp;';
			
			if(amount2 > 0)
				details2			= '<button id="ddmLorryHireBtn" class="btn btn-primary " onclick="getDDMLorryHireData();">View Details</button>';
			
			headerCol2				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			amountCol2				= createColumnInRow(createRow, 'totalDDMAmt', '', '', 'right', '', '');
			detailsCol2				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			
			appendValueInTableCol(headerCol2, header2);
			appendValueInTableCol(amountCol2, amount2);
			appendValueInTableCol(detailsCol2, details2);
			appendRowInTable('expenseDetailsDiv', createRow);
			
		},setFinalDataResult : function(agentBranchHisabModel) {
			let totalFreight						= agentBranchHisabModel.totalOutwardFreight + agentBranchHisabModel.totalInwardfreight ;
			let totalInOutCommission				= roundOffTotalBkgCommiByAgentBranch + agentBranchHisabModel.totalDeliveryCommiForAgentBranch  ;
			let totalPaidFreightByBranch			= agentBranchHisabModel.totalPaidFreightByBranch ;
			let totalTopayServiceAndHamaliAmt		= agentBranchHisabModel.totalTopayServiceAndHamaliAmt ;
			let totalTopayBookingAmtForAgentBranch	= agentBranchHisabModel.totalTopayBookingAmtForAgentBranch ;
			let amountPaidBy;
			let colorForAmountPaidBy; 
			
			if (totalAmount > 0) {
				amountPaidBy = agentBranchHisabModel.agentBranchName
				colorForAmountPaidBy = 'green'
			} else if (totalAmount < 0) {
				amountPaidBy = agentBranchHisabModel.excutiveBranchName
				colorForAmountPaidBy = 'red'
			}

			removeTableRows('finalHisabDetailsDiv', 'tbody');
			
			let createRow							= createRowInTable('', '', '');
			
			let header3				= '<b>Booking</b>';
			let amount3				= totalBooking+'&nbsp;&#x20B9;&nbsp;';
			
			let headerCol3				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			let amountCol3				= createColumnInRow(createRow, '', '', '', 'right', '', '');
			
			appendValueInTableCol(headerCol3, header3);
			appendValueInTableCol(amountCol3, amount3);
			appendRowInTable('finalHisabDetailsDiv', createRow);
			
			createRow							= createRowInTable('', '', '');
			
			header3				= '<b>Expense</b>';
			amount3				= totalExpense +'&nbsp;&#x20B9;&nbsp;';
			
			headerCol3				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			amountCol3				= createColumnInRow(createRow, '', '', '', 'right', '', '');
			
			appendValueInTableCol(headerCol3, header3);
			appendValueInTableCol(amountCol3, amount3);
			appendRowInTable('finalHisabDetailsDiv', createRow);
			
			createRow							= createRowInTable('', '', '');
			
			header3				= '<b>Collection</b>';
			amount3				= collection +'&nbsp;&#x20B9;&nbsp;';
			
			headerCol3				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			amountCol3				= createColumnInRow(createRow, '', '', '', 'right', '', '');
			
			appendValueInTableCol(headerCol3, header3);
			appendValueInTableCol(amountCol3, amount3);
			appendRowInTable('finalHisabDetailsDiv', createRow);
			
			createRow							= createRowInTable('', '', '');
			
			header3				= '<b>Commission</b>';
			amount3				= totalCommission+'&nbsp;&#x20B9;&nbsp;';
			
			headerCol3				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			amountCol3				= createColumnInRow(createRow, '', '', '', 'right', '', '');
			
			appendValueInTableCol(headerCol3, header3);
			appendValueInTableCol(amountCol3, amount3);
			appendRowInTable('finalHisabDetailsDiv', createRow);
			
			createRow							= createRowInTable('', '', '');
			
			header3				= '<b>Outstanding</b>';
			amount3				= lastOutstanding;
			
			headerCol3				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			amountCol3				= createColumnInRow(createRow, 'lastOutStandingAmt', '', '', 'right', '', '');
			
			appendValueInTableCol(headerCol3, header3);
			appendValueInTableCol(amountCol3, amount3);
			appendRowInTable('finalHisabDetailsDiv', createRow);
			
			createRow			= createRowInTable('', '', '');
			
			header3				= '<b>Total</b>';
			amount3				= totalAmount +'&nbsp;&#x20B9;&nbsp;';
			
			headerCol3				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			amountCol3				= createColumnInRow(createRow, '', '', '', 'right', '', '');
			
			appendValueInTableCol(headerCol3, header3);
			appendValueInTableCol(amountCol3, amount3);
			appendRowInTable('finalHisabDetailsDiv', createRow);
			
			removeTableRows('agentBranchfinalHisabDetailsDiv', 'tbody');

			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', ''), '<b>Total Freight</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'totalFreight', '', '', 'right', 'font-size: 14px', ''), totalFreight );
			appendRowInTable('agentBranchfinalHisabDetailsDiv', createRow);

			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', ''), '<b>Total Commission</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'totalCommission', '', '', 'right', 'font-size: 14px', ''), totalInOutCommission );
			appendRowInTable('agentBranchfinalHisabDetailsDiv', createRow);

			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', ''), '<b>Paid Amount</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'FreightPaidAmount', '', '', 'right', 'font-size: 14px', ''), totalPaidFreightByBranch );
			appendRowInTable('agentBranchfinalHisabDetailsDiv', createRow);

			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', ''), '<b>Other Branch To Pay</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'otherBranchTopay', '', '', 'right', 'font-size: 14px', ''), totalTopayBookingAmtForAgentBranch );
			appendRowInTable('agentBranchfinalHisabDetailsDiv', createRow);

			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', ''), '<b>Service Charge</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'toPayServiceAndHamaliCharge', '', '', 'right', 'font-size: 14px', ''), totalTopayServiceAndHamaliAmt );
			appendRowInTable('agentBranchfinalHisabDetailsDiv', createRow);

			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 15px', ''), '<b>Outstanding</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'lastOutStandingAmt', '', '', 'right', 'font-size: 14px', ''), lastOutstanding );
			appendRowInTable('agentBranchfinalHisabDetailsDiv', createRow);

			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 15px', ''), '<b>TOTAL</b>');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'right', 'font-size: 15px', ''), totalAmount );
			appendRowInTable('agentBranchfinalHisabDetailsDiv', createRow);

			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', `font-size: 15px; color: ${colorForAmountPaidBy};`, ''),'Amount Paid By Branch');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', `font-size: 15px;color: ${colorForAmountPaidBy};`, ''),amountPaidBy );
			appendRowInTable('agentBranchfinalHisabDetailsDiv', createRow);

		}, setAgentBranchHisabBookingData: function(agentBranchHisabModel) {
			removeTableRows('agentBranchBookingHisabDetailsDiv', 'tbody');
			let createRow = createRowInTable('', '', '');
			let outwardFreightCol = createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', '');
			let outwardFreightAmtCol = createColumnInRow(createRow, 'outwardFreight', '', '', 'right', 'font-size: 14px', '');

			let outwardFreightHeader = '<b>Outward Freight</b>';
			let outwardFreightAmt = agentBranchHisabModel.totalOutwardFreight ;

			appendValueInTableCol(outwardFreightCol, outwardFreightHeader);
			appendValueInTableCol(outwardFreightAmtCol, outwardFreightAmt);
			appendRowInTable('agentBranchBookingHisabDetailsDiv', createRow);

			createRow = createRowInTable('', '', '');
			let inwardFreightCol = createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', '');
			let inwardFreightAmtCol = createColumnInRow(createRow, 'inwardFreight', '', '', 'right', 'font-size: 14px', '');

			let inwardFreightHeader = '<b>Inward Freight</b>';
			let inwardFreightAmt = agentBranchHisabModel.totalInwardfreight ;

			appendValueInTableCol(inwardFreightCol, inwardFreightHeader);
			appendValueInTableCol(inwardFreightAmtCol, inwardFreightAmt);
			appendRowInTable('agentBranchBookingHisabDetailsDiv', createRow);

			createRow = createRowInTable('', '', '');
			let totalFreighHeaderCol = createColumnInRow(createRow, '', '', '', 'center', 'font-size: 15px', '');
			let totalFreighAmtCol = createColumnInRow(createRow, 'totalFreight', '', '', 'right', 'font-size: 15px', '');

			let totalFreightHeader = '<b>Total Freight</b>';
			let totalFreightAmt = outwardFreightAmt + inwardFreightAmt;

			appendValueInTableCol(totalFreighHeaderCol, totalFreightHeader);
			appendValueInTableCol(totalFreighAmtCol, totalFreightAmt);
			appendRowInTable('agentBranchBookingHisabDetailsDiv', createRow);

		},setAgentBranchHisabCommissionData : function(agentBranchHisabModel){
			removeTableRows('agentBranchCommissionDetailsDiv', 'tbody');

			let createRow = createRowInTable('', '', '');
			let outwardCommissionCol = createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', '');
			let outwardCommissionAmtCol = createColumnInRow(createRow, 'outwardCommission', '', '', 'right', 'font-size: 14px', '');

			let outwardCommissionHeader = '<b>Outward Commission</b>';

			appendValueInTableCol(outwardCommissionCol, outwardCommissionHeader);
			appendValueInTableCol(outwardCommissionAmtCol, roundOffTotalBkgCommiByAgentBranch);
			appendRowInTable('agentBranchCommissionDetailsDiv', createRow);

			createRow = createRowInTable('', '', '');
			let inwardCommissionCol = createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', '');
			let inwardCommissionAmtCol = createColumnInRow(createRow, 'inwardCommission', '', '', 'right', 'font-size: 14px', '');

			let inwardCommissionHeader = '<b>Inward Commission</b>';
			let inwardCommissionAmt = agentBranchHisabModel.totalDeliveryCommiForAgentBranch
			
			appendValueInTableCol(inwardCommissionCol, inwardCommissionHeader);
			appendValueInTableCol(inwardCommissionAmtCol, inwardCommissionAmt);
			appendRowInTable('agentBranchCommissionDetailsDiv', createRow);

			createRow = createRowInTable('', '', '');
			let totalCommissionHeaderCol = createColumnInRow(createRow, '', '', '', 'center', 'font-size: 15px', '');
			let totalCommissionAmtCol = createColumnInRow(createRow, 'totalCommission', '', '', 'right', 'font-size: 15px', '');

			let totalCommissionHeader = '<b>Total Commission</b>';
			let totalCommissionAmt = roundOffTotalBkgCommiByAgentBranch + inwardCommissionAmt;

			appendValueInTableCol(totalCommissionHeaderCol, totalCommissionHeader);
			appendValueInTableCol(totalCommissionAmtCol, totalCommissionAmt);
			appendRowInTable('agentBranchCommissionDetailsDiv', createRow);
			
		}, setAgentBranchHisabBookingCommissionDataForMgtsAndMgllp: function(agentBranchHisabModel) {
			removeTableRows('agentBranchBookingCommissionHisabMgllpAndMgtsDetailsDiv', 'tbody');
			
			let bookingCommisisonAmt = toFixedWhenDecimal(agentBranchHisabModel.totalBookingCommissionByAgentBranch)
			let pfChargeAmt = toFixedWhenDecimal(agentBranchHisabModel.bookingPFCharge) ;
			let cartageChargeAmt = toFixedWhenDecimal(agentBranchHisabModel.bookingCartageCharge);
			let totalBookingCommissionAmt = toFixedWhenDecimal(bookingCommisisonAmt + pfChargeAmt+cartageChargeAmt);
			let createRow	= createRowInTable('', '', '');

			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', ''), '<b>Booking Commission</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'bookingCommission', '', '', 'right', 'font-size: 14px', ''), bookingCommisisonAmt);
			appendRowInTable('agentBranchBookingCommissionHisabMgllpAndMgtsDetailsDiv', createRow);
			
			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', ''),'<b>PF</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'pfBookingCharge', '', '', 'right', 'font-size: 14px', ''),pfChargeAmt);
			appendRowInTable('agentBranchBookingCommissionHisabMgllpAndMgtsDetailsDiv', createRow);
			
			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', ''),'<b>Cartage</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'bookingCartageChargeAmt', '', '', 'right', 'font-size: 14px', ''),cartageChargeAmt);
			appendRowInTable('agentBranchBookingCommissionHisabMgllpAndMgtsDetailsDiv', createRow);
			
			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 15px', ''),'<b>Total Booking Commission</b>');
			
			if(showLSWiseBookingCommission)		
				appendValueInTableCol(createColumnInRow(createRow, 'totalBookingCommissionAmt', '', '', 'right', 'font-size: 15px; cursor:pointer;', ''),'<span onclick="openBookingCommissionPopup()">' + totalBookingCommissionAmt + '</span>');
			else
				appendValueInTableCol(createColumnInRow(createRow, 'totalBookingCommissionAmt', '', '', 'right', 'font-size: 15px', ''),totalBookingCommissionAmt);

			
			appendRowInTable('agentBranchBookingCommissionHisabMgllpAndMgtsDetailsDiv', createRow);

		},setAgentBranchHisabDeliveryCommissionDataForMgtsAndMgllp: function(agentBranchHisabModel) {
			removeTableRows('agentBranchDeliveryCommissionDetailsDivForMgllpAndMgts', 'tbody');
			
			let deliveryCommisisonAmt = toFixedWhenDecimal(agentBranchHisabModel.totalDeliveryCommissionByAgentBranch);
			let unloadingChargeAmt = toFixedWhenDecimal(agentBranchHisabModel.crossingNetUnloading) ;
			let crossingHamaliChargeAmt = toFixedWhenDecimal(agentBranchHisabModel.crossingHamali);
			let doorDeliveryChargeAmt = toFixedWhenDecimal(agentBranchHisabModel.doorDeliveryAmt);
			let totalDeliveryCommissionAmt = toFixedWhenDecimal(deliveryCommisisonAmt + unloadingChargeAmt+crossingHamaliChargeAmt+doorDeliveryChargeAmt);
			let createRow	= createRowInTable('', '', '');
			
			createRow	= createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', ''), '<b>Dly Commission</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'deliveryCommission', '', '', 'right', 'font-size: 14px', ''), deliveryCommisisonAmt);
			appendRowInTable('agentBranchDeliveryCommissionDetailsDivForMgllpAndMgts', createRow);
			
			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', ''), '<b>Unloading</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'unloadingCharge', '', '', 'right', 'font-size: 14px', ''), unloadingChargeAmt);
			appendRowInTable('agentBranchDeliveryCommissionDetailsDivForMgllpAndMgts', createRow);
			
			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', ''), '<b>Crossing Hamali</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'crossingHamaliCharge', '', '', 'right', 'font-size: 14px', ''), crossingHamaliChargeAmt);
			appendRowInTable('agentBranchDeliveryCommissionDetailsDivForMgllpAndMgts', createRow);
			
			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', ''), '<b>Door Delivery Amt</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'doorDeliveryAmt', '', '', 'right', 'font-size: 14px', ''), doorDeliveryChargeAmt);
			appendRowInTable('agentBranchDeliveryCommissionDetailsDivForMgllpAndMgts', createRow);
			
			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 15px', ''), '<b>Total Delivery Commission</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'totalDeliveryCommissionAmt', '', '', 'right', 'font-size: 15px', ''), totalDeliveryCommissionAmt);
			appendRowInTable('agentBranchDeliveryCommissionDetailsDivForMgllpAndMgts', createRow);
			
		},setFinalDataAgentBranchHisabForMgllpAndMgts: function(agentBranchHisabModel) {
			let totalBkgCommission = agentBranchHisabModel.totalBookingCommissionByAgentBranch + agentBranchHisabModel.bookingPFCharge + agentBranchHisabModel.bookingCartageCharge;
			let totalDeliveryCommission = agentBranchHisabModel.totalDeliveryCommissionByAgentBranch + agentBranchHisabModel.crossingNetUnloading + agentBranchHisabModel.crossingHamali + agentBranchHisabModel.doorDeliveryAmt;
			let totalComissionPayable = toFixedWhenDecimal(totalBkgCommission + totalDeliveryCommission);
			let totalPaidBookingByAgentBranch = toFixedWhenDecimal(agentBranchHisabModel.totalPaidBookingByAgentBranch);
			let totalToPayDispatchBookingAmtForAgentBranch = toFixedWhenDecimal(agentBranchHisabModel.totalToPayDispatchBookingAmtForAgentBranch);
			let totalLhpvBalanceAmountForAgentBranch = toFixedWhenDecimal(agentBranchHisabModel.totalLhpvBalanceAmountForAgentBranch);
			let totalCollectedAmtByAgency = toFixedWhenDecimal(totalPaidBookingByAgentBranch + totalToPayDispatchBookingAmtForAgentBranch)
			let balanceAmtToAgency =  toFixedWhenDecimal(totalCollectedAmtByAgency - totalLhpvBalanceAmountForAgentBranch)
			let amountPaidBy;
			let colorForAmountPaidBy;
			let createRow = createRowInTable('', '', '');

			if (totalAmount > 0) {
				amountPaidBy = agentBranchHisabModel.agentBranchName
				colorForAmountPaidBy = 'green'
			} else if (totalAmount < 0) {
				amountPaidBy = agentBranchHisabModel.excutiveBranchName
				colorForAmountPaidBy = 'red'
			}
			removeTableRows('agentBranchHisabMgllpAndMgtsFinalDetailsDiv', 'tbody');
			
			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', ''), '<b>Total Comission Payable</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'totalComissionPayable', '', '', 'right', 'font-size: 14px', ''), totalComissionPayable );
			appendRowInTable('agentBranchHisabMgllpAndMgtsFinalDetailsDiv', createRow);

			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', ''), '<b>Total Paid Booking Amt</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'paidBooking', '', '', 'right', 'font-size: 14px', ''), totalPaidBookingByAgentBranch );
			appendRowInTable('agentBranchHisabMgllpAndMgtsFinalDetailsDiv', createRow);

			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', ''), '<b>Total To-Pay Delivery Amt</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'totalToPayDispatchBookingAmtForAgentBranch', '', '', 'right', 'font-size: 14px', ''), totalToPayDispatchBookingAmtForAgentBranch );
			appendRowInTable('agentBranchHisabMgllpAndMgtsFinalDetailsDiv', createRow);

			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', ''), '<b>Total Collected Amt. By Agency</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'totalCollectedAmtByAgency', '', '', 'right', 'font-size: 14px', ''), totalCollectedAmtByAgency );
			appendRowInTable('agentBranchHisabMgllpAndMgtsFinalDetailsDiv', createRow);

			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', ''), '<b>Total Lorry Hire Paid by Agency</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'totalLhpvBalanceAmountForAgentBranch', '', '', 'right', 'font-size: 14px', ''), totalLhpvBalanceAmountForAgentBranch );
			appendRowInTable('agentBranchHisabMgllpAndMgtsFinalDetailsDiv', createRow);

			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 14px', ''), '<b>Balance Amt. To Agency</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'balanceAmtToAgency', '', '', 'right', 'font-size: 14px', ''), balanceAmtToAgency );
			appendRowInTable('agentBranchHisabMgllpAndMgtsFinalDetailsDiv', createRow);

			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 15px', ''), '<b>Outstanding</b>');
			appendValueInTableCol(createColumnInRow(createRow, 'lastOutStandingAmt', '', '', 'right', 'font-size: 14px', ''), lastOutstanding );
			appendRowInTable('agentBranchHisabMgllpAndMgtsFinalDetailsDiv', createRow);

			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', 'font-size: 15px', ''), '<b>TOTAL</b>');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'right', 'font-size: 15px', ''), totalAmount );
			appendRowInTable('agentBranchHisabMgllpAndMgtsFinalDetailsDiv', createRow);

			createRow = createRowInTable('', '', '');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', `font-size: 15px; color: ${colorForAmountPaidBy};`, ''),'Amount Paid By Branch');
			appendValueInTableCol(createColumnInRow(createRow, '', '', '', 'center', `font-size: 15px;color: ${colorForAmountPaidBy};`, ''),amountPaidBy );
			appendRowInTable('agentBranchHisabMgllpAndMgtsFinalDetailsDiv', createRow);			
		}, seTotalAmountForMgllpAndMgts: function(agentBranchHisabModel) {
			let totalBkgCommission = agentBranchHisabModel.totalBookingCommissionByAgentBranch + agentBranchHisabModel.bookingPFCharge + agentBranchHisabModel.bookingCartageCharge;
			let totalDeliveryCommission = agentBranchHisabModel.totalDeliveryCommissionByAgentBranch + agentBranchHisabModel.crossingNetUnloading + agentBranchHisabModel.crossingHamali;
			let totalComissionPayable = toFixedWhenDecimal(totalBkgCommission + totalDeliveryCommission);
			let totalPaidBookingByAgentBranch = toFixedWhenDecimal(agentBranchHisabModel.totalPaidBookingByAgentBranch);
			let totalToPayDispatchBookingAmtForAgentBranch = toFixedWhenDecimal(agentBranchHisabModel.totalToPayDispatchBookingAmtForAgentBranch);
			let totalLhpvBalanceAmountForAgentBranch = toFixedWhenDecimal(agentBranchHisabModel.totalLhpvBalanceAmountForAgentBranch);
			let totalCollectedAmtByAgency = toFixedWhenDecimal(totalPaidBookingByAgentBranch + totalToPayDispatchBookingAmtForAgentBranch);
			let balanceAmtToAgency = toFixedWhenDecimal(totalCollectedAmtByAgency - totalLhpvBalanceAmountForAgentBranch);

			totalAmount = balanceAmtToAgency - totalComissionPayable

			if (agentBranchHisabModel.agentCreditDebitIdentifier == 1)
				totalAmount = Math.round(totalAmount + lastOutstanding);
			else if (agentBranchHisabModel.agentCreditDebitIdentifier == 2)
				totalAmount = Math.round(totalAmount - lastOutstanding);
			else if (agentBranchHisabModel.agentCreditDebitIdentifier == 0)
				totalAmount = Math.round(totalAmount);

		},setSettlementData : function(){
			$('#totalHisabAmount').val(totalAmountWithMod);
			$('#balanceAmount').val(totalAmountWithMod);
			$("#bottom-border-boxshadow").removeClass('hide');
			goToPosition('bottom-border-boxshadow', 500);
		},validateReceiveAmount : function(obj) {
			let objVal				= 0;
			let isObjValshldzero	= false;
			
			if(obj.value.length > 0)
				objVal = parseInt(obj.value);
			
			if(objVal > totalAmountWithMod) {
				showMessage('info', 'You can not enter greater value than ' + Number($('#totalHisabAmount').val()));
				isObjValshldzero = true;
			}
			
			if(Number($('#settleAmount').val()) > totalAmountWithMod) {
				showMessage('info', 'You can not enter greater value than ' + Number($('#totalHisabAmount').val()));
				return false;
			}
													
			if(isObjValshldzero) {
				obj.value	= 0;
				objVal		= 0;
			}
			
			$('#balanceAmount').val(totalAmountWithMod - Number(obj.value));
			
			if (configuration.showPaymentStatusSelection && objVal == totalAmountWithMod && $('#paymentStatus').val() == PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID) {
				showMessage('info', 'You have entered the full amount. Please choose "Clear Payment" instead of "Partial Payment" to proceed.');
				$('#settleAmount').val('0');
				return false;
			}
		}, validateDetails() {
			if(!validateInputTextFeild(1, 'settleAmount', 'settleAmount', 'error', amountEnterErrMsg))
				return false;
			
			if(Number($('#settleAmount').val()) > balanceAmount) {
				showMessage('info', 'You can not enter greater value than ' + totalAmountWithMod);
				return false;
			}
			
			if(Number($('#settleAmount').val()) > Number($('#totalHisabAmount').val())) {
				$("#settleAmount").css("border-color", "red");
				$("#settleAmount").focus();
				showMessage('info', 'You can not enter greater value than ' + $('#totalHisabAmount').val());
				return false;
			}
		
			if(!validateInputTextFeild(1, 'remark', 'remark', 'error', ramarkErrMsg))
				return false;
			
			if (!validateInputTextFeild(1, 'paymentType', 'paymentType', 'error', "select Payment Mode"))
				return false;
			
			if (configuration.showPaymentStatusSelection) {
				if (!validateInputTextFeild(1, 'paymentStatus', 'paymentStatus', 'error', "select Payment Type")) {
					return false;
				}
			}

			if (configuration.BankPaymentOperationRequired) {
				if ($('#paymentType').val() > 0 && $('#paymentType').val() != PAYMENT_TYPE_CASH_ID && $('#storedPaymentDetails').html().trim() == '') {
					showMessage('error', 'Please, Add Payment Details !');
					return false;
				}
			}
			
			
			return true;
		}, settleAgentBranchHisab : function() {

			let jsonObject				= new Object();
			
			jsonObject.topayBookingIdList		= topayBookingIdList.join(',');
			jsonObject.paidBookingIdList		= paidBookingIdList.join(',');
			jsonObject.bookingCommissionIdList	= bookingCommissionIdList.join(',');
			jsonObject.deliveryCommissionIdList = deliveryCommissionIdList.join(',');
			jsonObject.blhpvIdList				= blhpvIdList.join(',');
			jsonObject.expenseVoucherDetailsIdList = expenseVoucherDetailsIdList.join(',');
			jsonObject.agentBranchId			= $('#branchEle').val();
			jsonObject.balanceAmount			= $('#balanceAmount').val();
			jsonObject.settleAmount				= $('#settleAmount').val();
			jsonObject.totalAmount				= totalAmount;
			jsonObject.totalHisabAmount			= $('#totalHisabAmount').val();
			jsonObject.remark					= $('#remark').val();
			jsonObject.totalTopayBookingAmount			= $('#topayBooking').html();
			jsonObject.totalPaidBookingAmount			= $('#paidBooking').html();
			jsonObject.totalBookingCommissionAmount		= $('#bookingCommission').html();
			jsonObject.totalDeliveryCommissionAmount	= $('#deliveryCommission').html();
			jsonObject.totalTdsAmount					= $('#tds').html();
			jsonObject.totalBlhpvAmount					= $('#totalBlhpv').html();
			jsonObject.totalDDMLorryhireAmount			= $('#totalDDMAmt').html();
			jsonObject.lastOutStandingAmount			= $('#lastOutStandingAmt').html();
			jsonObject.prevAgentCreditDebitIdentifier	= agentBranchHisabModel.agentCreditDebitIdentifier;
			jsonObject.totalOutwardFreightAmount		= $('#outwardFreight').html();
			jsonObject.totalInwardfreightAmount			= $('#inwardFreight').html();
			jsonObject.totalPaidfreightBookingAmount	= $('#FreightPaidAmount').html();
			jsonObject.otherTopayAmountToAgentBranch	= $('#otherBranchTopay').html();
			jsonObject.toPayServiceAndHamaliCharge		= $('#toPayServiceAndHamaliCharge').html();
			jsonObject.paymentValues					= getAllCheckBoxSelectValue('paymentCheckBox').join(',');
			jsonObject.paymentType						= $('#paymentType').val();
			jsonObject.paymentStatus					= $('#paymentStatus').val();
			jsonObject.totalLhpvBalanceAmountForAgentBranch	= $('#totalLhpvBalanceAmountForAgentBranch').html();
			jsonObject.totalToPayDispatchBookingAmtForAgentBranch	= $('#totalToPayDispatchBookingAmtForAgentBranch').html();
			jsonObject.pfBookingCharge	= $('#pfBookingCharge').html();
			jsonObject.bookingCartageChargeAmt	= $('#bookingCartageChargeAmt').html();
			jsonObject.unloadingCharge	= $('#unloadingCharge').html();
			jsonObject.crossingHamaliCharge	= $('#crossingHamaliCharge').html();
			jsonObject.doorDeliveryAmt	= $('#doorDeliveryAmt').html();
			
			if(configuration.showPaymentStatusSelection && $('#paymentStatus').val() == PAYMENT_TYPE_STATUS_NEGOTIATED_ID){
				jsonObject.balanceAmount = 0;
			}

			if (byAgentBranchHisabWaybillIdsList != undefined)
				jsonObject.byAgentBranchHisabWaybillIdsList = byAgentBranchHisabWaybillIdsList.join(',');
			
			if (forAgentBranchHisabWaybillIdsList != undefined)
				jsonObject.forAgentBranchHisabWaybillIdsList = forAgentBranchHisabWaybillIdsList.join(',');


			if (lhpvIdList != undefined)
				jsonObject.lhpvIdList = lhpvIdList.join(',');
			
			if (dispatchIdList != undefined)
				jsonObject.dispatchDetailsIdList = dispatchIdList.join(',');

			if (configuration.agentBranchHisabForSugama) {
				jsonObject.totalBookingCommissionAmount = $('#outwardCommission').html();
				jsonObject.totalDeliveryCommissionAmount = $('#inwardCommission').html();
			}

			let ans = confirm("Are you sure you want to Settle this Hisab ?")

			if (!ans) {
			return false;
		}
		
		getJSON(jsonObject, WEB_SERVICE_URL + '/agentBranchHisabWS/settleAgentBranchHisab.do', _this.responseAfterSettle, EXECUTE_WITH_ERROR);

		}, goToPosition : function(elementId, slideSpeed) {
			$('html,body').animate({
				scrollTop: $("#" + elementId).offset().top},
				slideSpeed);
		}, responseAfterSettle : function(response){
			if(response.message != undefined) {
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
			
			hideLayer();
			
			if (response.agentBranchHisabLedgerId != undefined) {
				let MyRouter = new Marionette.AppRouter({});
				MyRouter.navigate('&modulename=agentBranchHisab&masterid=' + response.agentBranchHisabLedgerId + '&masterid2=' + response.agentBranchHisabNumber+'&print=true',{trigger: true});
				location.reload();
			}
		},openPrint:function(agentBranchHisabLedgerId) {
			let newwindow=window.open('InterBranch.do?pageId=340&eventId=10&modulename=agentBranchHisabPrint&masterid='+agentBranchHisabLedgerId+'&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}
	});
});

function getTopayBookingData(){
	
	require([PROJECT_IVUIRESOURCES+'/resources/js/module/view/agentBranchHisab/agentBranchHisabTopayBooking.js'], function(TopayBookingDetails){
		let jsonObject		= new Object();
		jsonObject["topayBookingIdList"]								= topayBookingIdList.join(',');
		
		let object			= new Object();
		object.elementValue = jsonObject;
		
		let btModal = new Backbone.BootstrapModal({
			content		: new TopayBookingDetails(object),
			modalWidth	: 80,
			showFooter	: true,
			cancelText	: false,
			okText		: 'Close',
			title		: 'Topay Booking Details'
		});
		
		object.btModal = btModal;
		new TopayBookingDetails(object);
		btModal.open();
	});
}

function getPaidBookingData() {
	require([PROJECT_IVUIRESOURCES+'/resources/js/module/view/agentBranchHisab/agentBranchHisabPaidBooking.js'], function(PaidBookingDetails){
		let jsonObject		= new Object();
		jsonObject["paidBookingIdList"]									= paidBookingIdList.join(',');
		
		let object			= new Object();
		object.elementValue = jsonObject;
		
		let btModal = new Backbone.BootstrapModal({
			content		: new PaidBookingDetails(object),
			modalWidth	: 80,
			showFooter	: true,
			cancelText	: false,
			okText		: 'Close',
			title		: 'Paid Booking Details'
		});
		
		object.btModal = btModal;
		new PaidBookingDetails(object);
		btModal.open();
	});
}

function getBookingCommissionData() {
	require([PROJECT_IVUIRESOURCES+'/resources/js/module/view/agentBranchHisab/agentBranchHisabBookingCommission.js'], function(BookingCommissionDetails){
		let jsonObject		= new Object();
		jsonObject["bookingCommissionIdList"]			= bookingCommissionIdList.join(',');
		
		let object			= new Object();
		object.elementValue = jsonObject;
		
		let btModal = new Backbone.BootstrapModal({
			content		: new BookingCommissionDetails(object),
			modalWidth	: 80,
			showFooter	: true,
			cancelText	: false,
			okText		: 'Close',
			title		: 'Booking Commission Details'
		});
		
		object.btModal = btModal;
		new BookingCommissionDetails(object);
		btModal.open();
	});
}

function getDeliveryCommissionData() {
	require([PROJECT_IVUIRESOURCES+'/resources/js/module/view/agentBranchHisab/agentBranchHisabDeliveryCommission.js'], function(DeliveryCommissionDetails){
		let jsonObject		= new Object();
		jsonObject["deliveryCommissionIdList"]			= deliveryCommissionIdList.join(',');
		
		let object			= new Object();
		object.elementValue = jsonObject;
		
		let btModal = new Backbone.BootstrapModal({
			content		: new DeliveryCommissionDetails(object),
			modalWidth	: 80,
			showFooter	: true,
			cancelText	: false,
			okText		: 'Close',
			title		: 'Delivery Commission Details'
		});
		
		object.btModal = btModal;
		new DeliveryCommissionDetails(object);
		btModal.open();
	});
}

function getBlhpvData(){
	require([PROJECT_IVUIRESOURCES+'/resources/js/module/view/agentBranchHisab/agentBranchHisabBlhpv.js'], function(BlhpvDetails){
		let jsonObject		= new Object();
		jsonObject["blhpvIdList"]			= blhpvIdList.join(',');
		
		let object			= new Object();
		object.elementValue = jsonObject;
		
		let btModal = new Backbone.BootstrapModal({
			content		: new BlhpvDetails(object),
			modalWidth	: 80,
			showFooter	: true,
			cancelText	: false,
			okText		: 'Close',
			title		: 'BLHPV Details'
		});
		
		object.btModal = btModal;
		new BlhpvDetails(object);
		btModal.open();
	});
}

function getDDMLorryHireData(){
	require([PROJECT_IVUIRESOURCES+'/resources/js/module/view/agentBranchHisab/agentBranchHisabExpenseDetails.js'], function(ExpenseDetails){
		let jsonObject		= new Object();
		jsonObject["expenseVoucherDetailsIdList"]			= expenseVoucherDetailsIdList.join(',');
		
		let object			= new Object();
		object.elementValue = jsonObject;
		
		let btModal = new Backbone.BootstrapModal({
			content		: new ExpenseDetails(object),
			modalWidth	: 80,
			showFooter	: true,
			cancelText	: false,
			okText		: 'Close',
			title		: 'Expense Details'
		});
		
		object.btModal = btModal;
		new ExpenseDetails(object);
		btModal.open();
	});
}

function setReceiveAmountOnPaymentStatus(obj) {
	$('#settleAmount').val(0);
	let totalAmount = $('#totalHisabAmount').val();
	let receivedAmount = $('#settleAmount').val();
	let receiveAmount = 0;
	let balanceAmount = 0;

	if (obj.value == PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID) {
		$('#settleAmount').prop('disabled', true);
		
		receiveAmount = totalAmount - receivedAmount;
		balanceAmount = totalAmount - receivedAmount - receiveAmount;

		$('#settleAmount').val(receiveAmount);
		$('#balanceAmount').val(balanceAmount);
	} else {
		$('#settleAmount').val(0);
		$('#balanceAmount').val(totalAmount);
		$('#settleAmount').prop('disabled', false);
	}
}

function openBookingCommissionPopup() {
	if (!lsWiseModelList || lsWiseModelList.length === 0) {
		alert("No LS-wise Agent Branch Booking Commission data available.");
		return;
	}

	let rows 			= "";
	let srNo 			= 1;
	let totalCommission = 0;
	let totalPF 		= 0;
	let totalCartage 	= 0;

	lsWiseModelList.forEach(obj => {
		const commission = parseFloat(obj.totalBookingCommissionByAgentBranch || 0);
		const pf		= parseFloat(obj.bookingPFCharge || 0);
		const cartage 	= parseFloat(obj.bookingCartageCharge || 0);

		totalCommission += commission;
		totalPF 		+= pf;
		totalCartage 	+= cartage;

		rows += `<tr>
                    <td>${srNo++}</td>
                    <td>${obj.lsNumber || ''}</td>
                    <td>${obj.wayBillNumberStr || ''}</td>
                    <td>${commission.toFixed(2)}</td>
                    <td>${pf.toFixed(2)}</td>
                    <td>${cartage.toFixed(2)}</td>
                </tr>`;
	});

	$('#bodySelection').html(rows);
	
	const table = $('#bookingCommissionPopupDiv table');

	table.find('tfoot').remove();

    const footerHtml = `
        <tfoot>
            <tr style="font-weight:bold; background-color:#e9ecef;">
                <td colspan="3" class="textAlignCenter">Total</td>
                <td>${totalCommission.toFixed(2)}</td>
                <td>${totalPF.toFixed(2)}</td>
                <td>${totalCartage.toFixed(2)}</td>
            </tr>
        </tfoot>
    `;
    table.append(footerHtml);
	$('#bookingCommissionPopupDiv').modal('show');

	$('#modalClose').on('click', function() {
		$('#bookingCommissionPopupDiv').modal('hide');
	});
}