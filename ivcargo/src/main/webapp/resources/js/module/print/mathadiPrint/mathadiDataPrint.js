define([ 
		  PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
		 'JsonUtility',
		 'messageUtility',
		 'jquerylingua',
		 'autocomplete',
		 'language',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation'
	], function(UrlParameter) {
		var  jsonObject = new Object(), creationDateTime;
		return Marionette.LayoutView.extend({
			initialize : function() {
			_this = this;
			creationDateTime = localStorage.getItem('creationDateTime');
			this.$el.html(this.template);
		}, render : function() {
			if(creationDateTime == null || creationDateTime == undefined) {
				alert('Sorry this is dead page !');
				window.close();
				return;
			}
				
			jsonObject.creationDateTime = creationDateTime;
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/mathadiPrintModuleWS/getMathadiDetailsByIds.do?', _this.renderAllDetailsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderAllDetailsElements : function(response) {
			hideLayer();
			$("#mainContent").load("/ivcargo/html/print/mathadiPrint/mathadiDataPrint.html", function() {
				_this.printHeaderDetails(response);
				_this.setData(response);

				localStorage.removeItem("vehicleConfigHamaliIdsString");
				
				setTimeout(function() { window.print();}, 500);
			});
		}, printHeaderDetails : function(response) {
			let printHeaderModel	= response.PrintHeaderModel;
			
			$("*[data-account='date']").html(response.currentDate);
			
			$("*[data-account='name']").html(printHeaderModel.accountGroupName);
		}, setData : function(response) {
			
			let amountParts = response.totalThappiAmt.toString().split('.');
			let integerPartForTotalThappiAmt = amountParts[0];  
			let decimalPartForTotalThappiAmt = amountParts[1] ? amountParts[1] : '0';
			
			let amountPartsLeavy = response.thappiLeavyamt.toString().split('.');
			let integerPartForTotalThappiLeavyAmt = amountPartsLeavy[0];  
			let decimalPartForTotalThappiLeavyAmt = amountPartsLeavy[1] ? amountPartsLeavy[1] : '0';
			
			let amountPartsThappiTotal = response.thappiTotal.toString().split('.');
			let integerPartForthappiTotal = amountPartsThappiTotal[0];  
			let decimalPartForthappiTotal = amountPartsThappiTotal[1] ? amountPartsThappiTotal[1] : '0';
			
			let amountPartsRateForThappi = response.rateForThappi.toString().split('.');
			let integerPartRateForThappi = amountPartsRateForThappi[0];  
			let decimalPartRateForThappi = amountPartsRateForThappi[1] ? amountPartsRateForThappi[1] : '0';
			
			let dataColumnArray		= new Array();
						
			dataColumnArray.push("<td style='border-right:2px solid;text-align:center;border-left:2px solid'  >1</td>");
			dataColumnArray.push("<td style='border-right:2px solid;text-align:center'>Thappi</td>");
			dataColumnArray.push("<td style='border-right:2px solid;text-align:center'>"+response.actualThappi+"</td>");
			dataColumnArray.push("<td style='border-right:2px solid;text-align:center' > <table class='width100per'>  <tr> <td class='borderRight2pxSolid' style='height: 36px' >"+integerPartRateForThappi+".</td> <td class='width35per'>"+decimalPartRateForThappi+"</td>  </tr> </table> </td>");
			dataColumnArray.push("<td style='border-right:2px solid;text-align:center;'> <table class='width100per'>  <tr> <td class='borderRight2pxSolid' style='height: 36px'>" + integerPartForTotalThappiAmt +".</td> <td class='width35per'>"+decimalPartForTotalThappiAmt+"</td>  </tr> </table> </td>");
			dataColumnArray.push("<td style='border-right:0px solid;text-align:center'  ><table class='width100per'>  <tr> <td class='borderRight2pxSolid' style='height: 36px'>" + integerPartForTotalThappiLeavyAmt +".</td> <td class='width35per'>"+decimalPartForTotalThappiLeavyAmt+"</td>  </tr> </table></td>");
			dataColumnArray.push("<td style='border-right:2px solid;text-align:center;border-left:2px solid'  ><table class='width100per'>  <tr> <td class='borderRight2pxSolid' style='height: 36px'>" + integerPartForthappiTotal +".</td> <td class='width35per'>"+decimalPartForthappiTotal+"</td>  </tr> </table></td>");


			$('#mathadiDataq').append('<tr>' + dataColumnArray.join(' ') + '</tr>');
			
			let amountPartsTotalLoading       = response.totalLoadingAmt.toString().split('.');
			let integerPartForTotalLoadingAmt = amountPartsTotalLoading[0];  
			let decimalPartForTotalLoadingAmt = amountPartsTotalLoading[1] ? amountPartsTotalLoading[1] : '0';
			
			let amountPartsTotalLoadingLeavy      = response.loadingLeavyamt.toString().split('.');
			let integerPartForLoadingLeavy = amountPartsTotalLoadingLeavy[0];  
			let decimalPartForLoadingLeavy = amountPartsTotalLoadingLeavy[1] ? amountPartsTotalLoadingLeavy[1] : '0';
			
			let amountPartsLoadingTotal    = response.loadingTotal.toString().split('.');
			let integerPartForLoadingTotal = amountPartsLoadingTotal[0];  
			let decimalPartForLoadingTotal = amountPartsLoadingTotal[1] ? amountPartsLoadingTotal[1] : '0';
				
			let amountPartsRateForLoading = response.rateForLoading.toString().split('.');
			let integerPartRateForLoading = amountPartsRateForLoading[0];  
			let decimalPartRateForLoading = amountPartsRateForLoading[1] ? amountPartsRateForLoading[1] : '0';
			
			let loadingArray		= new Array();
						
			loadingArray.push("<td style='border-right:2px solid ; border-right:2px solid;border-top:2px solid ;text-align:center;border-bottom:2px solid;border-left:2px solid'>2</td>");
			loadingArray.push("<td style='border-right:2px solid;text-align:center;border-top:2px solid;border-bottom:2px solid'>Loading</td>");
			loadingArray.push("<td style='border-right:2px solid;text-align:center;border-top:2px solid;border-bottom:2px solid'>"+response.actualLoading+"</td>");
			loadingArray.push("<td style='border-right:2px solid;text-align:center;border-top:2px solid;border-bottom:2px solid'><table class='width100per'>  <tr> <td class='borderRight2pxSolid' style='height: 36px'>"+integerPartRateForLoading+".</td> <td class='width35per'>"+decimalPartRateForLoading+"</td>  </tr> </table></td>");
			loadingArray.push("<td style='border-right:2px solid;text-align:center;border-top:2px solid;border-bottom:2px solid'><table class='width100per'>  <tr> <td class='borderRight2pxSolid' style='height: 36px'>" + integerPartForTotalLoadingAmt +".</td> <td class='width35per'>"+decimalPartForTotalLoadingAmt+"</td>  </tr> </table></td>");
			loadingArray.push("<td style='border-right:0px solid;text-align:center;border-top:2px solid;border-bottom:2px solid'><table class='width100per'>  <tr> <td class='borderRight2pxSolid' style='height: 36px'>" + integerPartForLoadingLeavy +".</td> <td class='width35per'>"+decimalPartForLoadingLeavy+"</td>  </tr> </table></td>");
			loadingArray.push("<td style='border-right:2px solid;text-align:center;border-top:2px solid;border-bottom:2px solid;border-left:2px solid'><table class='width100per'>  <tr> <td class='borderRight2pxSolid' style='height: 36px'>" + integerPartForLoadingTotal +".</td> <td class='width35per'>"+decimalPartForLoadingTotal+"</td>  </tr> </table></td>");

			$('#mathadiDataq').append('<tr>' + loadingArray.join(' ') + '</tr>');
			
			let amountPartsWarfareAmt       = response.warfareAmt.toString().split('.');
			let integerPartForwarfareAmt 	= amountPartsWarfareAmt[0];  
			let decimalPartForwarfareAmt 	= amountPartsWarfareAmt[1] ? amountPartsWarfareAmt[1] : '0';
			
			let amountPartsWarfareLeavyAmt    = response.warfareLeavyAmt.toString().split('.');
			let integerPartForWarfareLeavyAmt = amountPartsWarfareLeavyAmt[0];  
			let decimalPartForWarfareLeavyAmt = amountPartsWarfareLeavyAmt[1] ? amountPartsWarfareLeavyAmt[1] : '0';
			
			let amountPartsWarfareTotal    = (toFixedWhenDecimal(response.warfareAmt + response.warfareLeavyAmt)).toString().split('.');
			let integerPartForWarfareTotal = amountPartsWarfareTotal[0];  
			let decimalPartForWarfareTotal = amountPartsWarfareTotal[1] ? amountPartsWarfareTotal[1] : '0';
			
			let warfareArray		= new Array();
						
			warfareArray.push("<td style='border-right:2px solid ; border-right:2px solid;border-top:2px solid ;text-align:center;border-bottom:2px solid;border-left:2px solid'>3</td>");
			warfareArray.push("<td style='border-right:2px solid;text-align:center;border-top:2px solid;border-bottom:2px solid'>Warfare</td>");
			warfareArray.push("<td style='border-right:2px solid;text-align:center;border-top:2px solid;border-bottom:2px solid'></td>");
			warfareArray.push("<td style='border-right:2px solid;text-align:center;border-bottom:2px solid'><table class='width100per'> <table class='width100per'>  <tr> <td class='borderRight2pxSolid' style='height: 36px'> </td> <td class='width35per'>  </td>  </tr> </table></td>");
			warfareArray.push("<td style='border-right:2px solid;text-align:center;border-top:2px solid;border-bottom:2px solid'><table class='width100per'>  <tr> <td class='borderRight2pxSolid' style='height: 36px'>" + integerPartForwarfareAmt + ".</td> <td class='width35per'>"+decimalPartForwarfareAmt+"</td>  </tr> </table></td>");
			warfareArray.push("<td style='border-right:0px solid;text-align:center;border-top:2px solid;border-bottom:2px solid'> <table class='width100per'>  <tr> <td class='borderRight2pxSolid' style='height: 36px'>" + integerPartForWarfareLeavyAmt + ".</td> <td class='width35per'>"+decimalPartForWarfareLeavyAmt+"</td>  </tr> </table> </td>");
			warfareArray.push("<td style='border-right:2px solid;text-align:center;border-bottom:2px solid;border-left:2px solid'><table class='width100per'>  <tr> <td class='borderRight2pxSolid' style='height: 36px'>" + integerPartForWarfareTotal + ".</td> <td class='width35per'>"+decimalPartForWarfareTotal+"</td>  </tr> </table></td>");
 
			$('#mathadiDataq').append('<tr>' + warfareArray.join(' ') + '</tr>');
			
			let grossFixedTotal 			= response.totalThappiAmt + response.totalLoadingAmt + response.warfareAmt ;
			let  grossFinalTotal			= grossFixedTotal.toFixed(2);
			let amountPartsForGrossAmtTotal = grossFinalTotal.toString().split('.');
			let IntegerPartGrossAmtTotal    = amountPartsForGrossAmtTotal[0];  
		    //let decimalPartGrossAmtTotal    = amountPartsForGrossAmtTotal[1] ? amountPartsForGrossAmtTotal[1] : '0';
			let decimalPartGrossAmtTotal 	= amountPartsForGrossAmtTotal[1].replace(/0+$/, '');
			 decimalPartGrossAmtTotal		 = decimalPartGrossAmtTotal === '' ? '0' : decimalPartGrossAmtTotal;


			let fixedTotal 					= response.thappiLeavyamt + response.loadingLeavyamt + response.warfareLeavyAmt ;
			let finalTotalLeavy				= fixedTotal.toFixed(2);
			let amountPartsForTotalLeavy 	= finalTotalLeavy.toString().split('.');
			let IntegerLeavyAmtTotal    	= amountPartsForTotalLeavy[0];  
			//let decimalLeavyAmtTotal    	= amountPartsForTotalLeavy[1] ? amountPartsForTotalLeavy[1] : '0';
			let decimalLeavyAmtTotal		= amountPartsForTotalLeavy[1].replace(/0+$/, ''); // Removes trailing zeros
			 decimalLeavyAmtTotal    		= decimalLeavyAmtTotal === '' ? '0' : decimalLeavyAmtTotal;

			let warfareAndWarfareLeavy   = toFixedWhenDecimal(response.warfareAmt + response.warfareLeavyAmt);
			let finalTotal 				 = (response.thappiTotal + response.loadingTotal + warfareAndWarfareLeavy).toFixed(2);
			let amountPartsForFinalTotal = finalTotal.toString().split('.');
			let IntegerFinalTotal    	 = amountPartsForFinalTotal[0];  
			let decimalFinalTotal     	 = amountPartsForFinalTotal[1].replace(/0+$/, '');
			    decimalFinalTotal 		 = decimalFinalTotal ==='' ? '0' : decimalFinalTotal;
			
			//$("*[data-lr='netAmountInWord']").html(convertRupeesPaise((Number(finalTotal))+ 'only'));
			
			$("*[data-lr='netAmountInWord']").html((finalTotal < 0 ? 'Minus ' : "") + convertNumberToWords(Number(Math.abs(finalTotal))) + ' Only');

			let totalArray		= new Array();
			
			totalArray.push("<td style='border-right:2px solid ; border-right:2px solid;border-top:2px solid ;text-align:center;border-bottom:2px solid;border-left:2px solid'></td>");
			totalArray.push("<td style='border-right:2px solid;text-align:center;border-top:2px solid;border-bottom:2px solid'></td>");
			totalArray.push("<td style='border-right:2px solid;text-align:center;border-top:2px solid;border-bottom:2px solid;border-left:2px solid'></td>");
			totalArray.push("<td style='border-right:2px solid;text-align:center;border-top:2px solid;border-bottom:2px solid'><table class='width100per'>  <tr> <td class='borderRight2pxSolid' style='height: 76px'></td> <td class='width35per'>  </td>  </tr> </table></td>");
			totalArray.push("<td style='border-right:2px solid;text-align:center;border-top:2px solid;border-bottom:2px solid'><table class='width100per'>  <tr> <td class='borderRight2pxSolid verticalAlignTop'><span class='verticalAlignTop'>Total :</span> </tr><td>  <tr> <td class='borderRight2pxSolid ' style='height: 56px;vertical-align: bottom;'>"+ IntegerPartGrossAmtTotal + ".</td> <td class='width35per' style='vertical-align: bottom;'>"+decimalPartGrossAmtTotal+"</td>  </tr> </table></td>");
			totalArray.push("<td style='border-right:0px solid;text-align:center;border-top:2px solid;border-bottom:2px solid;'><table class='width100per'>  <tr> <td class='borderRight2pxSolid verticalAlignTop'><span class='verticalAlignTop' style='color:white'>Net Amt</span> </tr><td> <tr> <td class='borderRight2pxSolid' style='height: 56px;vertical-align: bottom;'>"+ IntegerLeavyAmtTotal + ".</td> <td class='width35per' style='vertical-align: bottom;'>"+decimalLeavyAmtTotal+"</td>  </tr> </table></td>");
			totalArray.push("<td style='border-right:2px solid;text-align:center;border-top:2px solid;border-bottom:2px solid;border-left:2px solid'> <table class='width100per'>  <tr> <td class='borderRight2pxSolid verticalAlignTop' style='white-space: nowrap;'><span class='verticalAlignTop'>Net Amt:</span> </tr><td>  <tr> <td class='borderRight2pxSolid ' style='height: 56px;vertical-align: bottom;'>"+ IntegerFinalTotal + ".</td> <td class='width35per' style='vertical-align: bottom;'>"+decimalFinalTotal+"</td>  </tr> </table></td>");

			$('#mathadiDataq').append('<tr>' + totalArray.join(' ') + '</tr>');
		}
	});
});
