define(['JsonUtility',
	//jsonutility consist of ajax calls to send json object as an ajax hit to the url specified and get call back as specified
	'messageUtility',
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
	// to get parameter from url to send it to ws
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/agentBranchHisabPrint/agentbranchhisabview.js',
	'jquerylingua',
	'language',
	],
	function(JsonUtility, MessageUtility, UrlParameter, agentBranchHisabview) {
	'use strict';// this basically give strictness to this specific js
	let masterId = "0",
	jsonObject	= new Object(),
	pageBreaker,
	pageCounter,
	showHeader,
	removeHeader = false,
	settlementHisabData,
	AgentBranchHisabSummaryConstant,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function() {
			//masterid is fetched and passed when the view is called and it is set to fetch it from webservice
			masterId = UrlParameter.getModuleNameFromParam(MASTERID)
			//initialize is the first function called on call new view()
			_this = this;
		}, render: function() {
			jsonObject.agentBranchHisabLedgerId = masterId;
			getJSON(jsonObject, WEB_SERVICE_URL + '/agentBranchHisabWS/getAgentBranchHisabPrintByAgentBranchHisabLedgerId.do?', _this.setBranchHisabDetails, EXECUTE_WITHOUT_ERROR);

			return _this;
		}, setBranchHisabDetails : function(response) {
			hideLayer();
			
			showHeader			= response.showHeader;
			removeHeader		= response.removeHeader;
			
			AgentBranchHisabSummaryConstant	= response.AgentBranchHisabSummaryConstant;
			let tableData			= _this.getSettlementDetails(response.AgentBranchHisabLedger);
			settlementHisabData		= _this.getArrayForHisabDetails(response.agentBranchHisabSummaryList, AgentBranchHisabSummaryConstant);
			let headerFooterData	= _this.getHeaderAndFooterObject(response.AgentBranchHisabHeader, response.AgentBranchHisabLedger);

			require([agentBranchHisabview.getConfiguration(response),
				agentBranchHisabview.getFilePathForLabel()], function(View, FilePath) {
				pageBreaker		= 42;

				pageCounter		= Math.round(tableData.length/pageBreaker);

				let lastItrObj	= new Object();
				lastItrObj.lastITR	= false;
				
				let pageNumber = 0;
				
				if (pageCounter <= 0) {
					lastItrObj.lastITR	= true;
					_this.$el.html(_.template(View));
					agentBranchHisabview.setHeadersForPrint(headerFooterData, pageNumber, showHeader, removeHeader);
					agentBranchHisabview.setInformationDivs(headerFooterData);
					tableData.push(lastItrObj);
					agentBranchHisabview.setDataTableDetails(tableData);
					agentBranchHisabview.setHisabSummaryDetails(settlementHisabData);
					pageNumber++;
					$("*[data-footerpage='pageNo']").last().html(pageNumber);
					$("[data-footerpage='pagecounter']").html(pageCounter+1);
					agentBranchHisabview.setFooterDiv(headerFooterData);
				} else {
					for (let j = 0; j < tableData.length; j += pageBreaker) {
						_this.$el.append(_.template(View));
						
						if (j + pageBreaker >= tableData.length)
							lastItrObj.lastITR = true;
						
						let chunkArray = tableData.slice(j,j+pageBreaker);
						agentBranchHisabview.setHeadersForPrint(headerFooterData,pageNumber,showHeader,removeHeader);
						agentBranchHisabview.setInformationDivs(headerFooterData);
						chunkArray.push(lastItrObj);
						agentBranchHisabview.setDataTableDetails(chunkArray);
						agentBranchHisabview.setPickupChargesDetails(settlementHisabData);
						pageNumber++;
						$("*[data-footerpage='pageNo']").last().html(pageNumber);
						$("[data-footerpage='pagecounter']").html(pageCounter);
					}
					
					agentBranchHisabview.setFooterDiv(headerFooterData);
				}
				
				loadLanguageWithParams(FilePath.loadLanguage(response.agentBranchHisabPrintFlavor));
			});
		}, getSettlementDetails : function(ledgerDetails) {
			let dataArray	= new Array();
			let hisabObject					= new Object();
			hisabObject.hisabNo				= ledgerDetails[0].agentBranchHisabNumber;
			hisabObject.totalAmount			= ledgerDetails[0].totalAmount;
			hisabObject.balanceAmount		= ledgerDetails[0].balanceAmount;
			hisabObject.settledAmount		= ledgerDetails[0].settleAmount;
			hisabObject.remark				= ledgerDetails[0].remark;
			
			if(ledgerDetails[0].agentCreditDebitIdentifier == 1)
				hisabObject.amtPaidBy		= ledgerDetails[0].agentBranchName;
			else if(ledgerDetails[0].agentCreditDebitIdentifier == 2)
				hisabObject.amtPaidBy		= ledgerDetails[0].branchName;
			
			dataArray.push(hisabObject)
			
			return dataArray;
		}, getHeaderAndFooterObject : function(AgentBranchHisabHeader, AgentBranchHisabLedger) {
			let headerObject					= new Object();
			
			headerObject.name					= AgentBranchHisabHeader.accountGroupName;
			headerObject.branchAddress			= AgentBranchHisabHeader.branchAddress;
			headerObject.branchPhoneNumber		= AgentBranchHisabHeader.branchPhoneNumber;
			headerObject.branchMobileNumber		= AgentBranchHisabHeader.branchMobileNumber;
			headerObject.agentBranchHisabNumber	= AgentBranchHisabHeader.agentBranchHisabNumber;
			headerObject.hisabDate				= AgentBranchHisabHeader.txnDateTimeStr;
			headerObject.accountGroupName		= AgentBranchHisabHeader.accountGroupName;
			headerObject.agentBranchName		= AgentBranchHisabLedger[0].agentBranchName;
			headerObject.hisabDoneByBranch		= AgentBranchHisabLedger[0].branchName;
			
			return headerObject;
		}, getArrayForHisabDetails : function(agentBranchHisabSummaryList, AgentBranchHisabSummaryConstant) {
			let dataObject	= new Object();
			let topayBookingTotal = 0;
			let paidBookingTotal = 0;
			let bookingCommissionTotal = 0;
			let deliveryCommissionTotal = 0;
			let tdsTotal = 0;
			let blhpvTotal = 0;
			let ddmLorryhireAmtTotal = 0;
			let lastOutStandingAmount = 0;
			let creditDebitIdentifier = 0;
			let outwardFreight = 0;
			let inwardFreight = 0;
			let outwardCommission = 0;
			let paidAmount = 0;
			let otherBranchToPay = 0;
			let serviceCharge = 0;
			let pfCharge = 0;
			let cartageCharge = 0;
			let unloadingCharge = 0;
			let crossingHamali = 0;
			let doorDeliveryAmt = 0;
			let lhpvAmt = 0;
			let toPayDispatchAmt = 0;

			if(agentBranchHisabSummaryList != undefined) {
				for (const element of agentBranchHisabSummaryList) {
					if(element.summaryidentifier == AgentBranchHisabSummaryConstant.AGENT_BRANCH_HISAB_TOPAY_BOOKING_ID)
						topayBookingTotal = element.amount;
					else if(element.summaryidentifier == AgentBranchHisabSummaryConstant.AGENT_BRANCH_HISAB_PAID_BOOKING_ID) 
						paidBookingTotal = element.amount;
					else if(element.summaryidentifier == AgentBranchHisabSummaryConstant.AGENT_BRANCH_HISAB_BOOKING_COMMISSION_ID)
						bookingCommissionTotal = element.amount;
					else if(element.summaryidentifier == AgentBranchHisabSummaryConstant.AGENT_BRANCH_HISAB_DELIVERY_COMMISSION_ID)
						deliveryCommissionTotal = element.amount;
					else if(element.summaryidentifier == AgentBranchHisabSummaryConstant.AGENT_BRANCH_HISAB_TDS_ID)
						tdsTotal = element.amount;
					else if(element.summaryidentifier == AgentBranchHisabSummaryConstant.AGENT_BRANCH_HISAB_BLHPV_ID)
						blhpvTotal = element.amount;
					else if(element.summaryidentifier == AgentBranchHisabSummaryConstant.AGENT_BRANCH_HISAB_DDM_LORRY_HIRE_SETTLEMENT_ID)
						ddmLorryhireAmtTotal = element.amount;
					else if(element.summaryidentifier == AgentBranchHisabSummaryConstant.AGENT_BRANCH_HISAB_LAST_OUTSTANDING_ID) {
						lastOutStandingAmount = element.amount;
						creditDebitIdentifier	= element.creditDebitIdentifier;
					} else if(element.summaryidentifier == AgentBranchHisabSummaryConstant.AGENT_BRANCH_HISAB_OUTWARD_FREIGHT_ID)
						outwardFreight = element.amount;
					else if(element.summaryidentifier == AgentBranchHisabSummaryConstant.AGENT_BRANCH_HISAB_INWARD_FREIGHT_ID)
						inwardFreight = element.amount;
					else if(element.summaryidentifier == AgentBranchHisabSummaryConstant.AGENT_BRANCH_HISAB_PAID_BOOKING_FREIGHT_ID)
						paidAmount = element.amount;
					else if(element.summaryidentifier == AgentBranchHisabSummaryConstant.AGENT_BRANCH_HISAB_TOTAL_TOPAY_BOOKING_TO_AGENT_BRANCH_ID)
						otherBranchToPay = element.amount;
					else if(element.summaryidentifier == AgentBranchHisabSummaryConstant.AGENT_BRANCH_HISAB_TOTAL_SERVICE_CHAREG_AND_HAMALI_TOPAY_BOOKING_ID)
						serviceCharge = element.amount;
					else if(element.summaryidentifier == AgentBranchHisabSummaryConstant.PF_BOOKING_CHARGE_ID)
						pfCharge = element.amount;
					else if(element.summaryidentifier == AgentBranchHisabSummaryConstant.BOOKING_CARTAGE_CHARGE_AMT_ID)
						cartageCharge = element.amount;
					else if(element.summaryidentifier == AgentBranchHisabSummaryConstant.UNLOADING_CHARGE_ID)
						unloadingCharge = element.amount;	
					else if(element.summaryidentifier == AgentBranchHisabSummaryConstant.CROSSING_HAMALI_CHARGE_ID)
						crossingHamali = element.amount;	
					else if(element.summaryidentifier == AgentBranchHisabSummaryConstant.DOOR_DELIVERY_AMT_ID)
						doorDeliveryAmt = element.amount;	
					else if(element.summaryidentifier == AgentBranchHisabSummaryConstant.TOTAL_LHPV_BALANCE_AMOUNT_FOR_AGENT_BRANCH_ID)
						lhpvAmt = element.amount;	
					else if(element.summaryidentifier == AgentBranchHisabSummaryConstant.TOTAL_TOPAY_DISPATCH_BOOKING_AMT_FOR_AGENT_BRANCH_ID)
						toPayDispatchAmt = element.amount;	

				}
			}
			
			dataObject.topayBookingTotal		= topayBookingTotal;
			dataObject.paidBookingTotal			= paidBookingTotal;
			dataObject.bookingCommissionTotal	= bookingCommissionTotal;
			dataObject.deliveryCommissionTotal	= deliveryCommissionTotal;
			dataObject.tdsTotal					= tdsTotal;
			dataObject.blhpvTotal				= blhpvTotal;
			dataObject.ddmLorryhireAmtTotal		= ddmLorryhireAmtTotal;
			
			dataObject.bookingTotal				= topayBookingTotal + paidBookingTotal;
			dataObject.expenseTotal				= blhpvTotal + ddmLorryhireAmtTotal;
			dataObject.collection				= (topayBookingTotal + paidBookingTotal) - (blhpvTotal + ddmLorryhireAmtTotal);
			dataObject.commissionTotal			= (bookingCommissionTotal + deliveryCommissionTotal) - tdsTotal;
			dataObject.lastOutStanding		 	= lastOutStandingAmount;
			dataObject.agentCreditDebitIdentifier	= creditDebitIdentifier;
			
			dataObject.outwardFreight		= outwardFreight;
			dataObject.inwardFreight		= inwardFreight;
			dataObject.totalFreight			= inwardFreight+outwardFreight;
			dataObject.inwardCommission		= deliveryCommissionTotal;
			dataObject.outwardCommission	= bookingCommissionTotal;
			dataObject.totalCommission		= bookingCommissionTotal+deliveryCommissionTotal;
			dataObject.paidAmount			= paidAmount;
			dataObject.otherBranchToPay		= otherBranchToPay;
			dataObject.serviceCharge		= serviceCharge;
			dataObject.pfCharge				= pfCharge;
			dataObject.cartageCharge		= cartageCharge;
			dataObject.unloadingCharge		= unloadingCharge;
			dataObject.crossingHamali		= crossingHamali;
			dataObject.doorDeliveryAmt		= doorDeliveryAmt;
			dataObject.lhpvAmt				= lhpvAmt;
			dataObject.toPayDispatchAmt		= toPayDispatchAmt;
			dataObject.totalBkgCommissionMgtsAndMgllp = toFixedWhenDecimal(dataObject.bookingCommissionTotal + dataObject.pfCharge + dataObject.cartageCharge);
			dataObject.totalDeliveryCommissionMgtsAndMgllp = toFixedWhenDecimal(dataObject.deliveryCommissionTotal + dataObject.unloadingCharge + dataObject.crossingHamali + dataObject.doorDeliveryAmt);
			
			let	totalAmountforSugama = 	dataObject.paidAmount + dataObject.otherBranchToPay - dataObject.totalCommission - dataObject.serviceCharge
			let	balanceAmtToAgency = (dataObject.paidBookingTotal + dataObject.toPayDispatchAmt) - dataObject.lhpvAmt;
           	let	totalCommissionforMgtsAndMgllp = dataObject.totalBkgCommissionMgtsAndMgllp + dataObject.totalDeliveryCommissionMgtsAndMgllp
            let totalAmountforMgtsAndMgllp = Math.round(balanceAmtToAgency-totalCommissionforMgtsAndMgllp);
            
			if (creditDebitIdentifier == 1)
				dataObject.sugamaFinalAmt = totalAmountforSugama + dataObject.lastOutStanding;
			else if (creditDebitIdentifier == 2)
				dataObject.sugamaFinalAmt = totalAmountforSugama - dataObject.lastOutStanding;
			else
				dataObject.sugamaFinalAmt = totalAmountforSugama;

			if(creditDebitIdentifier == 1)
				dataObject.finalAmt = dataObject.collection - dataObject.commissionTotal + dataObject.lastOutStanding;
			else if(creditDebitIdentifier == 2)
				dataObject.finalAmt = dataObject.collection - dataObject.commissionTotal - dataObject.lastOutStanding;
			else
				dataObject.finalAmt = dataObject.collection - dataObject.commissionTotal
				
			if (creditDebitIdentifier == 1)
				dataObject.totalAmountforMgtsAndMgllp = totalAmountforMgtsAndMgllp + dataObject.lastOutStanding;
			else if (creditDebitIdentifier == 2)
				dataObject.totalAmountforMgtsAndMgllp = totalAmountforMgtsAndMgllp - dataObject.lastOutStanding;
			else
				dataObject.totalAmountforMgtsAndMgllp = totalAmountforMgtsAndMgllp;

			
			return dataObject;
		}
	});
});