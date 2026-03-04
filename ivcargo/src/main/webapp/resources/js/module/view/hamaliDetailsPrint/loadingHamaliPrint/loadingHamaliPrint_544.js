/**
 * 
 */
define(['elementTemplateJs'],
       function(elementTemplateJs){
	var rowsPerPage	=84;
	var _this;
	var headerCollection
	,lsHeaderDetail
	,currentDateTime
	,lsSrcBranch
	,lsDestBranch
	;
	return({
		renderElements : function(response){
			_this = this;
			var loadelement				= new Array();
			var baseHtml 				= new $.Deferred();
			var executive				= response.executive;
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/hamaliDetails/loadingHamaliPrint/loadingHamaliPrint.html",function() {
				baseHtml.resolve();
			});
			$.when.apply($, loadelement).done(function() {
				//initialiseFocus();
				hideLayer();
			$('#bottom-border-boxshadow').removeClass('hide');
			$('#reportData1 tbody').empty();
			$('#ownerWiseCollectionReport').empty();
			_this.setHeaderData(response.printHeaderModel);
			var hamaliDetailsList 	= response.dispatchDetailsListFinal;
			var hamaliDetails	 	= response.hamaliDetails;
			var columnArray				= new Array();
			var count					= 0;
		
			
			if(hamaliDetailsList != undefined && hamaliDetailsList.length > 0) {
			 var totalQty 		= 0;
			 var totalAmount	= 0;
			 
				for (var i = 0; i < hamaliDetailsList.length; i++) {
					var obj = hamaliDetailsList[i];
					$('#lsNumber').html(obj.lsNumber);
				var amount = (Number(hamaliDetails.loadingPerArticle)*Number(obj.dispatchQuantity));
				count =count + 1;
				totalQty+=obj.dispatchQuantity;
				totalAmount	+= amount;
			
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;''>" + (i + 1) + "</td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;''>"+obj.wayBillNumber+"</td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;''>"+obj.dispatchQuantity+"</td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;''>"+obj.weight+"</td>");
					//columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;''>"+hamaliDetails.loadingPerArticle+"</td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;''>"+(Number(hamaliDetails.loadingPerArticle)*Number(obj.dispatchQuantity))+"</td>");
					$('#reportData1 tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					
						if(hamaliDetailsList.length == count ) {
						var totalColumnArray = new Array();
						totalColumnArray.push("<td class='datatd' id='tbbGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;' colspan='2'>TOTAL</td>");
					//	totalColumnArray.push("<td class='datatd' id='tbbGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'></td>");
						totalColumnArray.push("<td class='datatd' id='tbbGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(totalQty)+"</td>");
						totalColumnArray.push("<td class='datatd' id='topayGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'></td>");
			
						totalColumnArray.push("<td class='datatd' id='grandTotalAmount' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(totalAmount)+"</td>");		
						$('#reportData1 tbody').append('<tr>' + totalColumnArray.join(' ') + '</tr>');
						totalColumnArray=[];
					}
					columnArray	= [];
					}
				}
			});
		},setHeaderData:function(response){
			$('#accountGroupName').html(response.accountGroupName);
			$('#branchAddress').html(response.branchAddress);
		}
	});
});
Object.defineProperty(Array.prototype, 'splitArray', {
	value: function(chunkSize) {
		var array=this;
		return [].concat.apply([],
				array.map(function(elem,i) {
					return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
				})
		);
	}
});