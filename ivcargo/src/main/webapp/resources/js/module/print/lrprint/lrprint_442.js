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

			$('#popUpContent442').bPopup({
					}, function() {
						var _thisMod = this;
						var print1copy = false;
						var printAmount = true;
						$(this).html("<div class='confirm' style='height:175px; width:250px; padding:5px'>"
							+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b></div><br/>"
							+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' id='print1copy1'/>&nbsp;<b style='font-size:14px;'>Print single copy</b></div>"
							+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked id='printAmount'/>&nbsp;<b style='font-size:14px;'>Print Charges</b></div>"
							+ "<p style='color:red'>Shortcut Keys : Enter = Yes, Esc = No</p>"
							+ "<button id='cancelButton4'>NO</button>"
							+ "<button	id='confirm6' autofocus>YES</button></center></div>")

						$("#confirm6").focus();

						$(document).ready(function() {
							$('input[id="print1copy1"]').click(function() {
								print1copy = $(this).prop("checked");
							});
							$('input[id="printAmount"]').click(function() {
								printAmount = $(this).prop("checked");
							});
						});
						

						$("#confirm6").click(function() {
							
							if(printAmount){
								$("*[data-lr='grandTotalForBatco']").html(responseOut.bookingTotal);
							}
							
							if (print1copy) {
								$('.mainTable').addClass('displayNone');
								$('.mainTable1').removeClass('displayNone');
								$('.consignorCopy').html("Duplicate Copy")
								var text = $(this).text();
								text = text.replace("Consignor Copy", "Duplicate Copy");
							} else {
								$('.mainTable1').addClass('displayNone');
								$('.mainTable').removeClass('displayNone');
								$('.consignorCopy').html("Consignor Copy")
							}

							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						});

						$("#cancelButton4").click(function() {
							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						});
					});
		}
	});
});	
