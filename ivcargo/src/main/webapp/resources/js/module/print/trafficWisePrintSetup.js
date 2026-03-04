define([], function(){	
	var summeryObject				= new Object();
	return {
		setHeaderDetails : function(PrintHeaderModel){
			setTimeout(() => {
				
				$("#accountGroupName").html(PrintHeaderModel.accountGroupName);
				$("#branchAddress").html(PrintHeaderModel.branchAddress);

			}, 500);
		}, setTrafficWisePrintData(response){
			setTimeout(() => {
				
				var	srcBranchIdAndName			= null;
				var	destBranchIdAndName			= null;
				var pendTotalWght				= 0;
				var pendTotalQty				= 0;
				var arrTotalWght				= 0;
				var arrTotalQty					= 0;
				var totalWght					= 0;
				var totalQty					= 0;
				var grandTotalLr				= 0;
				var grandTotalAmt				= 0;
				var TruckArrivalDetailsDisplay	= response.TruckArrivalDetailsDisplay;
				var sourceBranchWiseHM			= response.sourceBranchWiseHM;
				
				for(srcBranchIdAndName in sourceBranchWiseHM) {
					var destBranchWiseHM 	= sourceBranchWiseHM[srcBranchIdAndName];
					var srcBranchName		= srcBranchIdAndName.split("_")[0];
					
					var srcBranchRow		= createRowInTable('', '', '');
					
					var srcBranchNameCol	= createColumnInRow(srcBranchRow, '', 'textCenter BorderBottom height20px bold', '', '', '', '7');
					
					appendValueInTableCol(srcBranchNameCol, srcBranchName);
					appendRowInTable('printTable', srcBranchRow);
					
					for(destBranchIdAndName in destBranchWiseHM){
						
						var trafficWiseSearch 	= destBranchWiseHM[destBranchIdAndName];
						var destBranchName		= destBranchIdAndName.split("_")[0];
						var	rightWghtTot		= 0;
						var	rightQtyTot			= 0;
						
						rightWghtTot			= trafficWiseSearch.totalPendingWeight + trafficWiseSearch.totalArrivalWeight;
						rightQtyTot				= trafficWiseSearch.totalPendingQuantity + trafficWiseSearch.totalArrivalQuantity;
						pendTotalWght			+= trafficWiseSearch.totalPendingWeight;
						pendTotalQty			+= trafficWiseSearch.totalPendingQuantity;
						arrTotalWght			+= trafficWiseSearch.totalArrivalWeight;
						arrTotalQty				+= trafficWiseSearch.totalArrivalQuantity;
						totalWght				+= rightWghtTot;
						totalQty				+= rightQtyTot;
						grandTotalLr			+= trafficWiseSearch.totalPendingLR;
						grandTotalAmt			+= trafficWiseSearch.totalPendingAmount;
						
						var destBranchRow		= createRowInTable('', '', '');
						
						var destBranchNameCol	= createColumnInRow(destBranchRow, '', 'textLeft paddingLeft BorderRight BorderBottom', '', '', '', '');
						
						appendValueInTableCol(destBranchNameCol, destBranchName);
						
						if(TruckArrivalDetailsDisplay) {
							var gdActWghtCol		= createColumnInRow(destBranchRow, '', 'textRight paddingRight BorderRight BorderBottom', '', '', '', '');
							var gdQtyCol			= createColumnInRow(destBranchRow, '', 'textRight paddingRight BorderRight BorderBottom', '', '', '', '');
							var arrActWghtCol		= createColumnInRow(destBranchRow, '', 'textRight paddingRight BorderRight BorderBottom', '', '', '', '');
							var arrQtyCol			= createColumnInRow(destBranchRow, '', 'textRight paddingRight BorderRight BorderBottom', '', '', '', '');
							var rightWghtTotCol		= createColumnInRow(destBranchRow, '', 'textRight paddingRight BorderRight BorderBottom', '', '', '', '');
							var rightQtyTotCol		= createColumnInRow(destBranchRow, '', 'textRight paddingRight BorderBottom', '', '', '', '');
							
							appendValueInTableCol(gdActWghtCol, trafficWiseSearch.totalPendingWeight);
							appendValueInTableCol(gdQtyCol, trafficWiseSearch.totalPendingQuantity);
							appendValueInTableCol(arrActWghtCol, trafficWiseSearch.totalArrivalWeight);
							appendValueInTableCol(arrQtyCol, trafficWiseSearch.totalArrivalQuantity);
							appendValueInTableCol(rightWghtTotCol, rightWghtTot);
							appendValueInTableCol(rightQtyTotCol, rightQtyTot);
						} else {
							var noOfLRCol			= createColumnInRow(destBranchRow, '', 'textRight paddingRight BorderRight BorderBottom', '', '', '', '');
							var actWghtCol			= createColumnInRow(destBranchRow, '', 'textRight paddingRight BorderRight BorderBottom', '', '', '', '');
							var amountCol			= createColumnInRow(destBranchRow, '', 'textRight paddingRight BorderRight BorderBottom', '', '', '', '');
							var noOfArtCol			= createColumnInRow(destBranchRow, '', 'textRight paddingRight BorderRight BorderBottom', '', '', '', '');
							
							appendValueInTableCol(noOfLRCol, trafficWiseSearch.totalPendingLR);
							appendValueInTableCol(actWghtCol, trafficWiseSearch.totalPendingWeight);
							appendValueInTableCol(amountCol, trafficWiseSearch.totalPendingAmount);
							appendValueInTableCol(noOfArtCol, trafficWiseSearch.totalPendingQuantity);
						}
						appendRowInTable('printTable', destBranchRow);
					}
				}
				var grandTotalRow		= createRowInTable('', '', '');
				
				var totalNameCol		= createColumnInRow(grandTotalRow, '', 'textLeft paddingLeft BorderRight BorderBottom bold', '', '', '', '');
				appendValueInTableCol(totalNameCol, "TOTAL");
				
				if(TruckArrivalDetailsDisplay){
					var pendTotalWghtCol	= createColumnInRow(grandTotalRow, '', 'textRight paddingRight BorderRight BorderBottom bold', '', '', '', '');
					var pendTotalQtyCol		= createColumnInRow(grandTotalRow, '', 'textRight paddingRight BorderRight BorderBottom bold', '', '', '', '');
					var arrTotalWghtCol		= createColumnInRow(grandTotalRow, '', 'textRight paddingRight BorderRight BorderBottom bold', '', '', '', '');
					var arrTotalQtyCol		= createColumnInRow(grandTotalRow, '', 'textRight paddingRight BorderRight BorderBottom bold', '', '', '', '');
					var righttotalWghtCol	= createColumnInRow(grandTotalRow, '', 'textRight paddingRight BorderRight BorderBottom bold', '', '', '', '');
					var righttotalQtyCol	= createColumnInRow(grandTotalRow, '', 'textRight paddingRight BorderBottom bold', '', '', '', '');
					
					appendValueInTableCol(pendTotalWghtCol, pendTotalWght);
					appendValueInTableCol(pendTotalQtyCol, pendTotalQty);
					appendValueInTableCol(arrTotalWghtCol, arrTotalWght);
					appendValueInTableCol(arrTotalQtyCol, arrTotalQty);
					appendValueInTableCol(righttotalWghtCol, totalWght);
					appendValueInTableCol(righttotalQtyCol, totalQty);
				} else {
					var totalLRCol			= createColumnInRow(grandTotalRow, '', 'textRight paddingRight BorderRight BorderBottom bold', '', '', '', '');
					var totalWghtCol		= createColumnInRow(grandTotalRow, '', 'textRight paddingRight BorderRight BorderBottom bold', '', '', '', '');
					var totalAmtCol			= createColumnInRow(grandTotalRow, '', 'textRight paddingRight BorderRight BorderBottom bold', '', '', '', '');
					var totalQtyCol			= createColumnInRow(grandTotalRow, '', 'textRight paddingRight BorderRight BorderBottom bold', '', '', '', '');
					
					appendValueInTableCol(totalLRCol, grandTotalLr);
					appendValueInTableCol(totalWghtCol, pendTotalWght);
					appendValueInTableCol(totalAmtCol, grandTotalAmt);
					appendValueInTableCol(totalQtyCol, pendTotalQty);
				}
				appendRowInTable('printTable', grandTotalRow);
				
			}, 500); 
			hideLayer();
		} 
	}
});