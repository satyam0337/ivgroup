define([],function(){
    return ({
        renderElements : function(){
            _this = this;
		},printWindow : function(isPdfExportAllow){
			if(!isPdfExportAllow){
				hideLayer();
				setTimeout(function(){ window.print();window.close();
				},500);
			}
			
		}, showPopUp : function(responseOut, isPdfExportAllow) {
			hideLayer();
			var conf = responseOut.configuration;
			var _this = this;

			$('#popUpContent670').bPopup({
					}, function() {
						var _thisMod = this;
						var header;
						$(this).html("<div class='confirm'><table align='center'><tr><td colspan='2' style='text-align:center'><h1>Lr Print Options</h1>Edit LR Details<br/><br/></td></tr>"
							+ "<tr><td><input type='radio' name='actualWeight' value='true' checked>Show Actual Weight</td>"
							+ "<td><input type='radio'	name='actualWeight' value='false'>Hide Actual Weight</td></tr>"
							+ "<tr><td><input type='radio' name='chargedWeight' value='true' checked>Show Charged Weight</td>"
							+ "<td><input type='radio' name='chargedWeight' value='false'>Hide Charged Weight</td></tr>"
							+ "<tr><td><input type='radio' name='rate' value='true' checked >Show Rate</td>"
							+ "<td><input type='radio' name='rate' value='false'>Hide Rate</td></tr>"
							+ "<tr ><td class='headerbato'	><input type='radio' name='header' value='true'	 >Show Header</td>"
							+ "<td class='headerbato'><input type='radio' name='header' value='false' checked>Hide Header</td></tr></table>"
							+ "<button id='cancelButton'>NO</button><button autofocus id='confirm'>YES</button></div></div>")
						var actualWeightVal;
						var chargedWeightVal;
						var rateVal;
						$('#confirm').focus();

						if (!responseOut.headerPopContentForLr)
							$('.headerbato').hide();

						$("#confirm").click(function() {
							$("#barlLRPrintTable_3").css({ 'margin-top': '850px' });
							$("#barlLRPrintTable_3").css({ 'position': 'absolute' });
							$("#barlLRPrintTable_2").css({ 'margin-top': '450px' });
							$("#barlLRPrintTable_2").css({ 'position': 'absolute' });
							$("#barlLRPrintTable_1").css({ 'margin-top': '60px' });
							$("#barlLRPrintTable_1").css({ 'position': 'absolute' });
							actualWeightVal = $("input[name='actualWeight']:checked").val();
							if (actualWeightVal == 'false') {
								$("*[data-selector='actualWeightConsignor']").remove();
								$("*[data-lr='actualWeightConsignor']").remove();
								$("*[data-selector='actualWeightConsignee']").remove();
								$("*[data-lr='actualWeightConsignee']").remove();

							}
							chargedWeightVal = $("input[name='chargedWeight']:checked").val();
							if (chargedWeightVal == 'false') {
								$("*[data-selector='chargedWeightConsignor']").remove();
								$("*[data-lr='chargedWeightConsignor']").remove();
								$("*[data-selector='chargedWeightConsignee']").remove();
								$("*[data-lr='chargedWeightConsignee']").remove();
							}
							rateVal = $("input[name='rate']:checked").val();
							if (rateVal == 'false') {
								$("*[data-selector='rateConsignor']").remove();
								$("*[data-lr='rateConsignor']").remove();
								$("*[data-selector='rateConsignee']").remove();
								$("*[data-lr='rateConsignee']").remove();
							}
							header = $("input[name='header']:checked").val();
							if (responseOut.headerPopContentForLr) {
								if (header == 'false') {
									$('.headerTable').hide();
								} else {
									$('.headerTable').show();
									$("#barlLRPrintTable_3").css({ 'margin-top': '850px' });
									$("#barlLRPrintTable_3").css({ 'position': 'absolute' });
									$("#barlLRPrintTable_2").css({ 'margin-top': '450px' });
									$("#barlLRPrintTable_2").css({ 'position': 'absolute' });
									$("#barlLRPrintTable_1").css({ 'margin-top': '60px' });
									$("#barlLRPrintTable_1").css({ 'position': 'absolute' });
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
							$("#barlLRPrintTable_3").css({ 'margin-top': '850px' });
							$("#barlLRPrintTable_3").css({ 'position': 'absolute' });
							$("#barlLRPrintTable_2").css({ 'margin-top': '450px' });
							$("#barlLRPrintTable_2").css({ 'position': 'absolute' });
							$("#barlLRPrintTable_1").css({ 'margin-top': '60px' });
							$("#barlLRPrintTable_1").css({ 'position': 'absolute' });
							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						})

					});
		}
	});
});	
