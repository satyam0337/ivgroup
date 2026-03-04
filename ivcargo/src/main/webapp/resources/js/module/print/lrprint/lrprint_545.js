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
			var bookingCharges = responseOut.waybillBookingChargesList;
			var wayBillTypeId = responseOut.wayBillTypeId;
			var _this = this;

			$('#popUpContent545').bPopup({
					}, function() {
						var _thisMod = this;
						if (wayBillTypeId == WAYBILL_TYPE_CREDIT) {
							$(this).html("<div class='confirm' style='height:150px;width:250px; padding:5px'>"
								+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
								+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox'	id='check'	/>&nbsp;<b style='font-size:14px;'>Print Charges</b><div>"
								+ "<p style='color:red'>Shortcut Keys : Enter = Yes, Esc = No</p>"
								+ "<button id='cancel'>Cancel</button>"
								+ "<button autofocus id='printCharges'>Print</button></center></div>")

							$("#confirm").click(function() {
								_thisMod.close();
							});

							for (var index in bookingCharges) {
								if (bookingCharges[index].wayBillBookingChargeChargeAmount != 0)
									$("*[data-selector='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html("TBB");
							}

							$("*[data-lr='advanceAmount']").html("TBB");
							$("*[data-lr='calculateTotal']").html("TBB");
							$("*[data-lr='sssgrandtotal']").html("TBB");

							$("#cancel").click(function() {
								_thisMod.close();
								_this.printWindow(isPdfExportAllow);
							});

							$("#printCharges").click(function() {
								if ($("#check").is(":checked")) {
									for (var index in bookingCharges) {
										if (bookingCharges[index].wayBillBookingChargeChargeAmount != 0)
											$("*[data-selector='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html(bookingCharges[index].wayBillBookingChargeChargeAmount);
									}

									$("*[data-lr='advanceAmount']").html(responseOut.advanceAmount);;
									$("*[data-lr='calculateTotal']").html(responseOut.bookingTotal);
									$("*[data-lr='sssgrandtotal']").html(responseOut.bookingTotal);
								}

								_thisMod.close();
								_this.printWindow(isPdfExportAllow);
							});
						} else {
							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						}
					});
		}
	});
});	
