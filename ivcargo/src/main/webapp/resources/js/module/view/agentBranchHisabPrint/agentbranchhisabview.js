define([], function(){	
	var
	summeryObject				= new Object();
	pageCounter	= 1
	return {
		getConfiguration : function(response) {
			return 'text!' + '/ivcargo/html/print/agentBranchHisab/' + response.agentBranchHisabPrintFlavor + '.html';
		}, getFilePathForLabel: function() {
			return '/ivcargo/resources/js/module/view/agentBranchHisabPrint/agentBranchHisabPrintFilePath.js';
		}, setHeadersForPrint : function(headerData,pageNumber,showHeader,removeHeader) {
			var pageNo = Number(pageNumber)+Number(1);
			
			$("[data-group]").html(headerData[$("[data-group]").attr("data-group")]);
			var headerbreak	= $("[data-group='name']");
			if (pageCounter > 1) {
				var indexToRemove = 0;
				var numberToRemove = 1;
				headerbreak.splice(indexToRemove, numberToRemove);
				headerbreak.each(function(){					
					$(this).attr("class","page-break");
				});
			}
			$("[data-selector='branchAddressLabel']").html($("[data-selector='branchAddressLabel']").attr("data-addressLabel")+":");
			$("[data-address]").html(headerData[$("[data-address]").attr("data-address")]);
			$("[data-selector='branchPhoneNumberLabel']").html($("[data-phoneNumberLabel='branchPhoneNumberLabel']").attr("data-phoneNumberLabel")+":");

			if(headerData[$("[data-phoneNumber]").attr("data-phoneNumber")] != undefined) {
				var replacedString =  (headerData[$("[data-phoneNumber]").attr("data-phoneNumber")]).replace('-','');
				var zerosReg = /[1-9]/g;
				if(zerosReg.test(replacedString)){
					$("[data-phoneNumber]").html(headerData[$("[data-phoneNumber]").attr("data-phoneNumber")]);
				} else if(zerosReg.test(headerData[$("[data-mobileNumber]").attr("data-mobileNumber")])){
					$("[data-phoneNumber]").html(headerData[$("[data-mobileNumber]").attr("data-mobileNumber")]);
				} else {
					$("[data-phoneNumber]").html('');
				}
			}
			
			if(removeHeader == true){
				$('#header').remove();
			}

			pageCounter++;

		},setInformationDivs:function(infoData) {
			$("[data-info='agentBranchHisabNumber']").html(infoData[$("[data-info='agentBranchHisabNumber']").attr("data-info")]);
			$("[data-info='hisabDate']").html(infoData[$("[data-info='hisabDate']").attr("data-info")]);
			$("[data-info='agentBranchName']").html(infoData[$("[data-info='agentBranchName']").attr("data-info")]);
			$("[data-info='hisabDoneByBranch']").html(infoData[$("[data-info='hisabDoneByBranch']").attr("data-info")]);

		},setDataTableDetails:function(tableData) {
			var lastItrObj	= tableData[tableData.length - 1];
			tableData.pop();
			var tbody	= $("[data-dataTableDetail='srNumber']").parent().parent();
			tbody		= (tbody[tbody.length-1]);
			columnObjectForDetails		= $("[data-row='dataTableDetails']").children();

			for(var i=0;i<tableData.length;i++){
				var newtr = $("<tr></tr>");
				for(var j=0;j<columnObjectForDetails.length;j++){
					var newtd = $("<td></td>");
					var dataPicker = $(columnObjectForDetails[j]).attr("data-dataTableDetail");
					$(newtd).attr("class",$(columnObjectForDetails[j]).attr("class"));
					$(newtd).attr("data-dataTableDetail",$(columnObjectForDetails[j]).attr("data-dataTableDetail"));						
					$(newtd).html(tableData[i][dataPicker]);
					$(newtr).append($(newtd));
				}

				$(tbody).before(newtr);
			}

			$("[data-row='dataTableDetails']").remove();
		},setFooterDiv:function(footerData) {
			$("[data-info='lsRemark']").html(footerData[$("[data-info='lsRemark']").attr("data-info")]);

			setTimeout(function(){window.print();},200);
		},setHisabSummaryDetails:function(settlementHisabData){
			
			$("[data-summary='topayBookingTotal']").html(settlementHisabData.topayBookingTotal);
			$("[data-summary='paidBookingTotal']").html(settlementHisabData.paidBookingTotal);
			$("[data-summary='bookingTotal']").html(settlementHisabData.bookingTotal);
			$("[data-summary='blhpvTotal']").html(settlementHisabData.blhpvTotal);
			$("[data-summary='ddmLorryhireAmtTotal']").html(settlementHisabData.ddmLorryhireAmtTotal);
			$("[data-summary='expenseTotal']").html(settlementHisabData.expenseTotal);
			$("[data-summary='collection']").html(settlementHisabData.collection);
			$("[data-summary='bookingCommissionTotal']").html(settlementHisabData.bookingCommissionTotal);
			$("[data-summary='deliveryCommissionTotal']").html(settlementHisabData.deliveryCommissionTotal);
			$("[data-summary='tdsTotal']").html(settlementHisabData.tdsTotal);
			$("[data-summary='commissionTotal']").html(settlementHisabData.commissionTotal);
			$("[data-summary='lastOutStanding']").html(settlementHisabData.lastOutStanding);
			$("[data-summary='finalAmt']").html(settlementHisabData.finalAmt.toFixed(2));
			
			$("[data-summary='outwardFreight']").html(settlementHisabData.outwardFreight);
			$("[data-summary='inwardFreight']").html(settlementHisabData.inwardFreight);
			$("[data-summary='totalFreight']").html(settlementHisabData.totalFreight);
			$("[data-summary='inwardCommission']").html(settlementHisabData.inwardCommission);
			$("[data-summary='outwardCommission']").html(settlementHisabData.outwardCommission);
			$("[data-summary='totalCommission']").html(settlementHisabData.totalCommission);
			$("[data-summary='paidAmount']").html(settlementHisabData.paidAmount);
			$("[data-summary='otherBranchToPay']").html(settlementHisabData.otherBranchToPay);
			$("[data-summary='serviceCharge']").html(settlementHisabData.serviceCharge);
			$("[data-summary='sugamaFinalAmt']").html(settlementHisabData.sugamaFinalAmt.toFixed(2));
			$("[data-summary='pfCharge']").html(settlementHisabData.pfCharge);
			$("[data-summary='cartageCharge']").html(settlementHisabData.cartageCharge);
			$("[data-summary='unloadingCharge']").html(settlementHisabData.unloadingCharge);
			$("[data-summary='crossingHamali']").html(settlementHisabData.crossingHamali);
			$("[data-summary='doorDeliveryAmt']").html(settlementHisabData.doorDeliveryAmt);
			$("[data-summary='lhpvAmt']").html(settlementHisabData.lhpvAmt);
			$("[data-summary='toPayDispatchAmt']").html(settlementHisabData.toPayDispatchAmt);
			$("[data-summary='pfCharge']").html(settlementHisabData.pfCharge);
			$("[data-summary='cartageCharge']").html(settlementHisabData.cartageCharge);
			$("[data-summary='unloadingCharge']").html(settlementHisabData.unloadingCharge);
			$("[data-summary='crossingHamali']").html(settlementHisabData.crossingHamali);
			$("[data-summary='doorDeliveryAmt']").html(settlementHisabData.doorDeliveryAmt);
			$("[data-summary='lhpvAmt']").html(settlementHisabData.lhpvAmt);
			$("[data-summary='totalBkgCommissionMgtsAndMgllp']").html(settlementHisabData.totalBkgCommissionMgtsAndMgllp);
			$("[data-summary='totalDeliveryCommissionMgtsAndMgllp']").html(settlementHisabData.totalDeliveryCommissionMgtsAndMgllp);
			$("[data-summary='totalCommissionMgtsAndMgllp']").html(toFixedWhenDecimal(settlementHisabData.totalBkgCommissionMgtsAndMgllp + settlementHisabData.totalDeliveryCommissionMgtsAndMgllp));
			$("[data-summary='totalCollectedAmtByAgency']").html(settlementHisabData.paidBookingTotal + settlementHisabData.toPayDispatchAmt);
			$("[data-summary='totalAmountforMgtsAndMgllp']").html(settlementHisabData.totalAmountforMgtsAndMgllp);

			if(settlementHisabData.agentCreditDebitIdentifier == 1){
				$("*[data-selector='finalAmtIdentifierLabel']").html('');
				$("*[data-selector='finalAmtIdentifierLabel']").html('L-G+H -- > M');
			} else if(settlementHisabData.agentCreditDebitIdentifier == 2){
				$("*[data-selector='finalAmtIdentifierLabel']").html('');
				$("*[data-selector='finalAmtIdentifierLabel']").html('L-G-H -- > M');
			} else{
				$("*[data-selector='finalAmtIdentifierLabel']").html('');
				$("*[data-selector='finalAmtIdentifierLabel']").html('L-G -- > M');
			}
		}
	}
});