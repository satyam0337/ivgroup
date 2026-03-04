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
			var isPdfExportAllow = responseOut.isPdfExportAllow;
			var bookingCharges = responseOut.waybillBookingChargesList;
			var _this = this;
				
			$('#popUpContent804').bPopup({
					}, function() {

						var _thisMod = this;
							$(this).html("<div class='confirm' style='height:200px;width:250px; padding:5px'>"
								+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
								+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' id='print1copy1'/>&nbsp;<b style='font-size:14px;'>Print single copy</b></div>"
								+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox'	id='check1'	 />&nbsp;<b style='font-size:14px;'>Print Charges</b><div>"
								+ "<p style='color:red'>Shortcut Keys : Enter = Yes, Esc = No</p>"
								+ "<button id='cancel'>Cancel</button>"
								+ "<button autofocus id='printCharges2'>Print</button></center></div>")

							$("#shortcut").html("Shortcut Keys : Enter = Print, Esc = Cancel")
							$("#confirm").focus();
							$('#printCharges').focus();

							$(document).on('keydown', function(event) {
								if (event.keyCode == 27) {
									window.close();
								}
							});
							
							$("#confirm").click(function() {
								_thisMod.close();
								_this.printWindow(isPdfExportAllow);
							})

							$("#cancel").click(function() {
								_thisMod.close();
								window.close();
							});

							$("#printCharges2").click(function() {
								if ($("#check1").is(":checked")) {
									_thisMod.close();
								} else {
									for (var index in bookingCharges) {
										if (bookingCharges[index].wayBillBookingChargeChargeAmount != 0) {
										   $("*[data-selector='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html('0');
										   $("*[data-lr='advanceAmount']").html('0');
										   $("*[data-lr='calculateTotal']").html('0');
										   $("*[data-gst='igst']").html('0');
										   $("*[data-gst='cgst']").html('0');
										   $("*[data-gst='sgst']").html('0');
										   $("*[data-lr='grandTotal']").html('0');
										}
									}
								}
								
								if ($("#print1copy1").is(":checked")) {
									$('.mainTable').hide();
									_thisMod.close();
								}
								
								_thisMod.close();
								_this.printWindow(isPdfExportAllow);
							});
					});
		}
	});
});	
