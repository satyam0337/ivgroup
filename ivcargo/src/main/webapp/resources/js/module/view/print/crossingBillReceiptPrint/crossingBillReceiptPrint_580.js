/**
 * 
 */
define([],
	function(){
	let _this;
	return({
		renderElements : function(response) {
			_this = this;
			let loadelement				= new Array();
			let baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/print/crossingBillReceiptPrint/" + response.printFlavor + ".html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				hideLayer();
				
				$('#bottom-border-boxshadow').removeClass('hide');
				$('#dataTable tbody').empty();
				$('#ownerWiseCollectionReport').empty();
				let crossingBillReceiptList = response.CrossingBillReceiptPrint;

				_this.setHeaderData(response.PrintHeaderModel);
				_this.setCrossingBillData(crossingBillReceiptList);	
	
				let columnArray				= new Array();
				let count					= 0;
		
				if(crossingBillReceiptList != undefined && crossingBillReceiptList.length > 0) {
					let totalBillAmount		= 0;
					let totalReceivedAmount	= 0;
					let totalBalanceAmount	= 0;
					let balanceAmount		= 0;
					let totalTDSAmount		= 0;
					let deductionAmount		= 0;
					let totalDeductionAmount= 0;
				
					for (let i = 0; i < crossingBillReceiptList.length; i++) {
						let obj = crossingBillReceiptList[i];
						count 			= count + 1;
						
						totalBillAmount		+= obj.billAmount;
						
						let receivedAmount		= 0;
						
						if(obj.billAmount < 0)
							receivedAmount = obj.totalBillReceivedAmount + obj.tdsAmount;
						else
							receivedAmount = obj.totalBillReceivedAmount - obj.tdsAmount;
					
						totalReceivedAmount	+= receivedAmount;
						totalTDSAmount 		+= obj.tdsAmount;
						
						if(obj.paymentStatusId == PAYMENT_TYPE_STATUS_NEGOTIATED_ID)
							balanceAmount = 0;
						else
							balanceAmount  = (obj.billAmount - obj.totalBillReceivedAmount);
		
						if(obj.paymentStatusId == PAYMENT_TYPE_STATUS_NEGOTIATED_ID)
							deductionAmount  = (obj.billAmount - obj.totalBillReceivedAmount);
						else
							deductionAmount = 0;
			
						totalBalanceAmount 		+= balanceAmount;
						totalDeductionAmount 	+= deductionAmount;
						
						columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;''>" + (i + 1) + "</td>");
						columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;''>"+obj.receiptDateStr+"</td>");
						columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;''>"+obj.billNumber+"</td>");
						columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;''>"+obj.supplierBillNo+"</td>");
						columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;''>"+obj.supplierBillDateStr+"</td>");
						columnArray.push("<td class='datatd' style='text-align: right; vertical-align: middle; font-size:15px;''>"+Math.round(obj.billAmount)+"</td>");
						columnArray.push("<td class='datatd' style='text-align: right; vertical-align: middle; font-size:15px;''>"+Math.round(receivedAmount)+"</td>");
						columnArray.push("<td class='datatd' style='text-align: right; vertical-align: middle; font-size:15px;''>"+Math.round(obj.tdsAmount)+"</td>");
						columnArray.push("<td class='datatd' style='text-align: right; vertical-align: middle; font-size:15px;''>"+Math.round(balanceAmount)+"</td>");
						columnArray.push("<td class='datatd' style='text-align: right; vertical-align: middle; font-size:15px;''>"+Math.round(deductionAmount)+"</td>");
	
						$('#dataTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					
						if(crossingBillReceiptList.length == count) {
							let totalColumnArray = new Array();
							totalColumnArray.push("<td class='datatd' id='' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;' colspan='2'>TOTAL</td>");
							totalColumnArray.push("<td class='datatd' id='' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'></td>");
							totalColumnArray.push("<td class='datatd' id='' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'></td>");
							totalColumnArray.push("<td class='datatd' id='' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'></td>");		
							totalColumnArray.push("<td class='datatd' id='' style='font-weight: bold;text-align: right; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(totalBillAmount)+"</td>");		
							totalColumnArray.push("<td class='datatd' id='' style='font-weight: bold;text-align: right; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(totalReceivedAmount)+"</td>");
							totalColumnArray.push("<td class='datatd' id='' style='font-weight: bold;text-align: right; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(totalTDSAmount)+"</td>");
							totalColumnArray.push("<td class='datatd' id='' style='font-weight: bold;text-align: right; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(totalBalanceAmount)+"</td>");		
							totalColumnArray.push("<td class='datatd' id='' style='font-weight: bold;text-align: right; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(totalDeductionAmount)+"</td>");		
	
							$('#dataTable tbody').append('<tr>' + totalColumnArray.join(' ') + '</tr>');
							totalColumnArray=[];
						}
						
						columnArray	= [];
					}
				}
			});
		}, setCrossingBillData : function(crossingBillReceiptList) {
			$('#crossingAgentName').html(crossingBillReceiptList[0].crossingAgentName);
			$('#receiptDate').html(crossingBillReceiptList[0].receiptDateStr);
			$('#receiptNumber').html(crossingBillReceiptList[0].receiptNumber);
			$('#remark').html(crossingBillReceiptList[0].remark);
			$('#bankName').html(crossingBillReceiptList[0].bankName);
			let receivedAmountTotal = crossingBillReceiptList.reduce((a, b) => a + (b['totalBillReceivedAmount'] || 0), 0);
			let tdsAmountTotal  	= crossingBillReceiptList.reduce((a, b) => a + (b['tdsAmount'] || 0), 0);
			$('#receivedAmountInWord').html(convertNumberToWord(Math.abs(receivedAmountTotal) - tdsAmountTotal));
			$('#receivedAmountTotal').html(receivedAmountTotal);
			$('#receivedAmountTotall').html(receivedAmountTotal);
			$('#totalReceivedAmountTotal').html(receivedAmountTotal);
			$('#totalReceivedAmountTotall').html(receivedAmountTotal);
		}, setHeaderData : function(response){ 
			$('#accountGroupName').html(response.accountGroupName);
			$('#branchAddress').html(response.branchAddress);
			$('#branchContactDetailMobileNumber').html(response.branchContactDetailMobileNumber);
			$('#executiveName').html(response.executiveName);
		}
	});
});
Object.defineProperty(Array.prototype, 'splitArray', {
	value: function(chunkSize) {
		let array=this;
		return [].concat.apply([],
				array.map(function(elem,i) {
					return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
				})
		);
	}
});