define([],function() {
    return ({
        renderElements : function(){
            _this = this;
		},printWindow : function(isPdfExportAllow){
			if(!isPdfExportAllow){
				hideLayer();
				setTimeout(function(){ window.print();window.close();
				},500);
			}
		}, showPopUp : function(responseOut) {
			hideLayer();
			//var conf = responseOut.configuration;
			var isPdfExportAllow = responseOut.isPdfExportAllow;
			var _this = this;
			
			$('#popUpContent772').bPopup({
			}, function() {
				var _thisMod = this;
				var header;
			
				$(this).html("<div class='confirm'><table align='center'><tr><td colspan='2' style='text-align:center'><h1>Lr Print Options</h1>Edit LR Details<br/><br/></td></tr>"
					+ "<tr><td><input type='radio' name='actualWeight' value='true' checked>Show Actual Weight</td>"
					+ "<td><input type='radio'  name='actualWeight' value='false'>Hide Actual Weight</td></tr>"
					+ "<tr><td><input type='radio' name='chargedWeight' value='true' checked>Show Charged Weight</td>"
					+ "<td><input type='radio' name='chargedWeight' value='false'>Hide Charged Weight</td></tr>"
					+ "<tr><td><input type='radio' name='rate' value='true' checked >Show Rate</td>"
					+ "<td><input type='radio' name='rate' value='false'>Hide Rate</td></tr>"
					+ "<tr><td><input type='radio' name='charge' value='true' checked >Show Charge Amount</td>"
					+ "<td><input type='radio' name='charge' value='false'>Hide Charge Amount</td></tr>"
					+ "<tr ><td class='headerbato'  ><input type='radio' name='header' value='true'  >Show Header</td>"
					+ "<td class='headerbato'><input type='radio' name='header' value='false' checked>Hide Header</td></tr></table>"
					+ "<button id='cancelButton'>NO</button><button autofocus id='confirm'>YES</button></div></div>")
					$('#confirm').focus();

					if (!responseOut.headerPopContentForLr)
						$('.headerbato').hide();

					$("#confirm").click(function() {
						$("#batoLRPrintTable_3").css({ 'margin-top': '912px' });
						$("#batoLRPrintTable_3").css({ 'position': 'absolute' });
						$("#batoLRPrintTable_2").css({ 'margin-top': '500px' });
						$("#batoLRPrintTable_2").css({ 'position': 'absolute' });
						$("#batoLRPrintTable_1").css({ 'margin-top': '100px' });
						$("#batoLRPrintTable_1").css({ 'position': 'absolute' });
							
						var	actualWeightVal = $("input[name='actualWeight']:checked").val();
						
						if (actualWeightVal == 'false') {
							$("*[data-selector='actualWeightConsignor']").remove();
							$("*[data-lr='actualWeightConsignor']").remove();
							$("*[data-selector='actualWeightConsignee']").remove();
							$("*[data-lr='actualWeightConsignee']").remove();
						}
						
						var chargedWeightVal = $("input[name='chargedWeight']:checked").val();
						
						if (chargedWeightVal == 'false') {
							$("*[data-selector='chargedWeightConsignor']").remove();
							$("*[data-lr='chargedWeightConsignor']").remove();
							$("*[data-selector='chargedWeightConsignee']").remove();
							$("*[data-lr='chargedWeightConsignee']").remove();
						}
							
						var rateVal = $("input[name='rate']:checked").val();
							
						if (rateVal == 'false') {
							$("*[data-selector='rateConsignor']").remove();
							$("*[data-lr='rateConsignor']").remove();
							$("*[data-selector='rateConsignee']").remove();
							$("*[data-lr='rateConsignee']").remove();
						}
							
						var chargeVal = $("input[name='charge']:checked").val();
							
						if (chargeVal == 'false') {
							$("*[data-lr='grandTotal']").remove();
						}
							
						var header = $("input[name='header']:checked").val();
							
						if (responseOut.headerPopContentForLr) {
							if (header == 'false') {
								$('.headerTable').hide();
							} else {
								$('.headerTable').show();
								$("#batoLRPrintTable_3").css({ 'margin-top': '912px' });
								$("#batoLRPrintTable_3").css({ 'position': 'absolute' });
								$("#batoLRPrintTable_2").css({ 'margin-top': '500px' });
								$("#batoLRPrintTable_2").css({ 'position': 'absolute' });
								$("#batoLRPrintTable_1").css({ 'margin-top': '100px' });
								$("#batoLRPrintTable_1").css({ 'position': 'absolute' });
							}
						}
						_thisMod.close();
						_this.printWindow(isPdfExportAllow);
					})

					$("#confirm").on('keydown', function(e) {
						if (e.which == 27) {  //escape
							_thisMod.close();
							window.close();
						}
					});

					$("#cancelButton").click(function() {
						$("#batoLRPrintTable_3").css({ 'margin-top': '912px' });
						$("#batoLRPrintTable_3").css({ 'position': 'absolute' });
						$("#batoLRPrintTable_2").css({ 'margin-top': '500px' });
						$("#batoLRPrintTable_2").css({ 'position': 'absolute' });
						$("#batoLRPrintTable_1").css({ 'margin-top': '100px' });
						$("#batoLRPrintTable_1").css({ 'position': 'absolute' });
						_thisMod.close();
						_this.printWindow(isPdfExportAllow);
					})
				});
				let wayBillDestinationBranchId = responseOut.wayBillDestinationBranchId;
				let deliveryToString							= responseOut.deliveryToString;

			
			if (deliveryToString == "select"){
					$("*[data-lr='deliveryToCustom']").html("");
				}else{
					if(wayBillDestinationBranchId == BANGLORE_BRANCH_ID_68044){
						$("*[data-lr='deliveryToCustom']").html(deliveryToString + ' ( ARL PARCEL SERVICE )' );
					}else{
				 		 $("*[data-lr='deliveryToCustom']").html(deliveryToString);
				  	}
				}
		}
	});
});	