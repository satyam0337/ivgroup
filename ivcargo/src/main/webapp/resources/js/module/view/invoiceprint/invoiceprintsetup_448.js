define([], function(){	
	return {
		setPopup : function(accountGroupId, data) {
			$('#popUpContent_' + accountGroupId).bPopup({
            }, function() {
				var _thisMod = this;
				
				$(this).html("<div class='confirm' style='height:350px;width:370px; text-align: left; padding:5px'>"
						+"<b style='font-size:18px; color:DodgerBlue;'>Print Charges</b><br/><br/>"		
						+"<input type='radio' id='allCharges' name='radio'/>&nbsp;<b style='font-size:14px;'>Print All Charges</b><br/><br/>"
						+"<input type='radio' id='grandTotal' name='radio' />&nbsp;<b style='font-size:14px;'>Print Booking Total</b><br/><br/>"
						+"<b style='font-size:18px; color:DodgerBlue;'>Print Option</b><br/><br/>"	
						+"<input type='radio' id='extra' name='print'/>&nbsp;<b style='font-size:14px;'>Extra Copy</b><br/><br/>"
						+"<input type='radio' id='original' name='print' />&nbsp;<b style='font-size:14px;'>Original For Buyers</b><br/><br/>"
						+"<input type='radio' id='duplicate' name='print' />&nbsp;<b style='font-size:14px;'>Duplicate For Transpoters</b><br/><br/>"
						+"<input id='pdf_bcm' style='font-size:25px;width: 80pt;margin-left: 10px;' type='button' value='Pdf'/>"
						+"<input id='excel_bcm' style='font-size:25px;width: 80pt;margin-left: 15px;' type='button' value='Excel'/>"
						+"<button id='cancelButton'>NO</button>"
						+"<button autofocus id='confirm'>YES</button></center></div><br/>")
					
					$('input[id="allCharges"]'). click(function() {
						if ($("#allCharges").prop("checked")) {
							$(".totaldlycharge").show();
							$(".extracol").hide();
							$(".grandTotalbookingcharwithoutDly").show();
						}
					});
				
					$('input[id="grandTotal"]'). click(function() {
						if ($("#grandTotal").prop("checked")) {
							$(".totaldlycharge").hide();
							$(".grandTotalbookingcharwithoutDly").show();
						}
					});
					
					$('input[id="extra"]').click(function() {
						if ($("#extra").prop("checked"))
							$("#popuptest").html("Extra Copy");
					});
					
					$('input[id="duplicate"]').click(function() {
						if ($("#duplicate").prop("checked"))
							$("#popuptest").html("Duplicate For Transpoters");
					});
					
					$('input[id="original"]').click(function() {
						if ($("#original").prop("checked"))
							$("#popuptest").html("Original For Buyers");
					});

				$("#cancelButton").click(function() {1
					$('.mainTable').css('height','1125px');
					_thisMod.close();
					setTimeout(function(){window.print();},200);
				});
					
				$("#confirm").click(function() {
					_thisMod.close();
					setTimeout(function(){window.print();},200);
				});
					
				$('input[id="excel_bcm"]').click(function(e) {
					_thisMod.close();
					var htmlTable = document.getElementById('exceldataofbcm');
					var html 	  = htmlTable.outerHTML;						
					var path = 'data:application/vnd.ms-excel,' + encodeURIComponent(html);
					window.open(path);
					e.preventDefault();
				});
				
				(function () { 
					$('input[id="pdf_bcm"]').on('click', function () {
			           _thisMod.close();
				       setTimeout(function(){exportPDF(document,'InvoicePrint.pdf');},200);
				       _thisMod.close();
			        });  
			    }()); 
			});
		}
	}
});