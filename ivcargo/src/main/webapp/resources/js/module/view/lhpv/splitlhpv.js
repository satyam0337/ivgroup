let chargemasterIds,
branchWiseSplitAmtList,
isSplitLHPV = false;
define(function() {
	let _this = '';
	return {
		openSplitLhpv : function(response) {
			$("#splitLhpvDataDetailPanel").modal({
				backdrop : 'static',
				keyboard : false
			});
			
			_this	= this;
			
			$(".close").click(function() {
				_this.resetTable();
			});
			
			chargemasterIds			= response.chargemasterIds;
			branchWiseSplitAmtList	= localStorage.getItem("branchWiseSplitAmountStr");
			isSplitLHPV				= response.isSplitLHPV;
			
			let lhpvTotalAmount = $('#charge' + LORRY_HIRE).val();

			$('#lhpvTotalAmount').val(lhpvTotalAmount);
			
			if(branchWiseSplitAmtList == undefined || branchWiseSplitAmtList == null || branchWiseSplitAmtList.length == 0)
				$('#payableBalanceAmt').val(lhpvTotalAmount);
			
			$("#deductPayment").click(function() {
				_this.splitAmount();
			});
			
			$("#saveAllLHPVpaymentData").click(function() {
				if(Number($("#payableBalanceAmt").val()) > 0) {
					showMessage('error', 'Please Split Full Lorry Hire Amount !');
					changeTextFieldColor('payableBalanceAmt', '', '', 'red');
					return false;
				}

				_this.onSaveLHPVPaymentDetails();
			});
		}, resetTable : function() {
			$('#tableElements tbody').empty();
			localStorage.removeItem("branchWiseSplitAmountStr");
			localStorage.removeItem("totalSplitAmount");
			$('#payableBalanceAmt').val(0);
			changeTextFieldColor('payableBalanceAmt', '', '', 'black');
			$( "#deductPayment").unbind( "click" );
			$( "#saveAllLHPVpaymentData").unbind( "click" );
			$("#branchEle").val('');
			$("#amounts").val('');
			$('#branchEle_primary_key').val(0);
			
			if(!isSplitLHPV && chargemasterIds)
				_this.resetCharges(chargemasterIds, false);
		}, resetCharges : function(chargemasterIds, isReadOnly) {
			for(const element of chargemasterIds) {
				if(element != LORRY_HIRE && element != BALANCE_AMOUNT && element != KANTA_RATE) {
					$('#charge' + element).attr('readonly', isReadOnly);
					$('#charge' + element).val('0');
				}
			}
			
			$('#charge' + BALANCE_AMOUNT).val(Number($('#charge' + LORRY_HIRE).val()));
		}, splitAmount : function() {
			let branchId 	= $('#branchEle_primary_key').val();
			let branchName 	= $('#branchEle').val();
			
			if($("#row_" + branchId).length > 0) {
				showMessage('error','Please enter a new branch');
				return;
			}
			
			let amount	= $("#amounts").val();
			
			if(amount == '' || amount == 0) {
				showMessage('error',iconForErrMsg + ' Please Enter Amount');
				changeTextFieldColor('', '', '', 'red');
				return false;
			}

			if($('#payableBalanceAmt').val() == 0) {
				showMessage('info','Balance Amount is Zero');
				return;
			}
			
			if(Number($('#amounts').val()) > Number($('#payableBalanceAmt').val())) {
				showMessage('info', 'Amount can not be greater than ' + $('#payableBalanceAmt').val());
				return;
			}
			
			_this.createPayableAmountTable(branchId, branchName, amount);

			$("#branchEle").val('');
			$("#amounts").val('');
			$('#branchEle_primary_key').val(0);
		}, createPayableAmountTable : function(branchId, branchName, amount) {
			let columnArray		= new Array();
			
			columnArray.push("<td style='text-align: center;'>" + branchName + "</td>");
			
			if(isSplitLHPV)
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><input  class='form-control' id='amount_" + branchId + "' type='text' name='amount_" + branchId + "' value='" + amount + "' disabled/></td>");
			else
				columnArray.push("<td style='text-align: center;' id = 'amount_" + branchId + "'>" + amount + "</td>");
			
			columnArray.push("<td><button type='button' class='btn btn-danger' data-tooltip = 'remove' id='removeRowElement_" + branchId + "'>Remove</button></td>");
			
			$('#tableElements tbody').append("<tr id='row_" + branchId + "'>" + columnArray.join(' ') + "</tr>");
			
			$('#payableBalanceAmt').val(Number($('#payableBalanceAmt').val()) - Number(amount));

			$("#removeRowElement_" + branchId).bind("click", function() {
				let elementId		= $(this).attr('id');
				let branchId		= elementId.split('_')[1];
				
				_this.deleteBranchWiseRow(branchId);
			});
			
			if(isSplitLHPV) {
				$("#amount_" + branchId).bind("keyup", function() {
				    _this.recheckAmount();
				});
			}
		}, deleteBranchWiseRow : function(branchId) {
			if(confirm("Are you sure to delete?")) {
				if(isSplitLHPV)
					$('#payableBalanceAmt').val(Number($("#payableBalanceAmt").val()) + Number($("#amount_" + branchId).val()));
				else
					$('#payableBalanceAmt').val(Number($("#payableBalanceAmt").val()) + Number($("#amount_" + branchId).html()));

				$("#row_" + branchId).remove();
			}

			$("#branchEle").val('');
			$("#amounts").val('');
			$('#branchEle_primary_key').val(0);
			
			if($('#tableElements tbody tr').length <= 0) {
				if(chargemasterIds) {
					for(const element of chargemasterIds) {
						if(element != BALANCE_AMOUNT && element != KANTA_RATE)
							$('#charge' + element).attr('readonly', false);
					}
				}
			}
		}, onSaveLHPVPaymentDetails : function() {
			$('#balPayableAmount').val('');
			
			if(chargemasterIds)
				_this.resetCharges(chargemasterIds, true);
			
			branchWiseSplitAmtList	= [];
			let totalSplitAmount	= 0;
			
			$("#tableElements tbody tr").each(function () {
				let elementId		= $(this).attr('id');
				let branchId		= elementId.split('_')[1];
				let payableAmount	= 0;
				
				if($("#amount_" + branchId).html() > 0)
					payableAmount	= Number($("#amount_" + branchId).html());
				else
					payableAmount	= Number($("#amount_" + branchId).val());
				
				totalSplitAmount 	+= payableAmount;
				
				branchWiseSplitAmtList.push(Number(branchId) + "_" + payableAmount);
			})
			
			$( "#deductPayment").unbind( "click" );
			$( "#saveAllLHPVpaymentData").unbind( "click" );
			$("#splitLhpvDataDetailPanel").modal('hide');
			localStorage.setItem("branchWiseSplitAmountStr", branchWiseSplitAmtList.join(','));
			localStorage.setItem("totalSplitAmount", totalSplitAmount);
		}, splitBranchWiseLhpvTable : function(splitLhpvArrList) {
			$('#tableElements tbody').empty();
			
			let totalSplitAmount	= 0;
			
			if(splitLhpvArrList != null && splitLhpvArrList.length > 0) { 
				for(const element of splitLhpvArrList) {
					let branchWiseLhpvAmount = element;
				
					let branchName 			= branchWiseLhpvAmount.branchName;
					let payableAmount 		= branchWiseLhpvAmount.payableAmount;
					let branchId			= branchWiseLhpvAmount.branchId;
					totalSplitAmount		+= payableAmount;
					
					let columnArray		= new Array();
					
					columnArray.push("<td style='text-align: center;'>" + branchName + "</td>");
					columnArray.push("<td style='text-align: center;'><input class='form-control' id='amount_" + branchId + "' type='text' name='amount_" + branchId + "' value='"+payableAmount+"'/></td>");
					columnArray.push("<td><button type='button' class='btn btn-danger' data-tooltip = 'Remove' id='removeRowElement_" + branchId + "'>Remove</button></td>");
					
					$('#tableElements tbody').append("<tr id='row_" + branchId + "'>" + columnArray.join(' ') + "</tr>");
					
					$("#removeRowElement_" + branchId).bind("click", function() {
						let elementId			= $(this).attr('id');
						_this.deleteBranchWiseRow(elementId.split('_')[1]);
					});
					
					$("#amount_" + branchId).bind("keyup", function() {
						 _this.recheckAmount();
					});

					columnArray	= [];
				}
			}
			
			let lhpvTotalAmount = $('#charge' + LORRY_HIRE).val();
			
			$('#payableBalanceAmt').val(lhpvTotalAmount - totalSplitAmount);
			
			localStorage.setItem("totalSplitAmount", totalSplitAmount);
		}, recheckAmount : function() {
			let totalAmount	= 0;
			let payableBalanceAmt	= 0;
			
			$("#tableElements tbody tr").each(function () {
				let elementId		= $(this).attr('id');
				let branchId		= elementId.split('_')[1];
				
				totalAmount += Number($("#amount_" + branchId).val());
			})
			
			payableBalanceAmt	= $('#lhpvTotalAmount').val() - totalAmount;
			
			if(payableBalanceAmt < 0) {
				showMessage('info', 'Amount can not be greater than ' + $('#payableBalanceAmt').val());
				$('#payableBalanceAmt').val(payableBalanceAmt);
				return false;
			}
			
			$('#payableBalanceAmt').val(payableBalanceAmt);
		}, displaySplitBranchWiseLhpvAmount : function(splitLhpvArrList) {
			$('#splittedAmountDetails tbody').empty();
			
			let columnArray		= new Array();
			
			if(splitLhpvArrList != null && splitLhpvArrList.length > 0) {
				$('#splittedAmountDetails').removeClass('hide');
				
				for(let i = 0; i < splitLhpvArrList.length; i++) {
					let branchWiseLhpvAmount = splitLhpvArrList[i];
				
					let branchName 			= branchWiseLhpvAmount.branchName;
					let payableAmount 		= branchWiseLhpvAmount.payableAmount;

					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
					columnArray.push("<td style='text-align: left; vertical-align: middle; text-transform: uppercase' >" + branchName + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + payableAmount + "</td>");
					$('#splittedAmountDetails tbody').append('<tr>' + columnArray.join(' ') + '</tr>');

					columnArray	= [];
				}
			}
		}
	}
});