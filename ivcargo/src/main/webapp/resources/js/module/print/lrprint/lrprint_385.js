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
		}, setZeroAmount: function(chargeTypeModelArr) {
				for (var index in chargeTypeModelArr) {
					$("*[data-consignor-selector='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").html('0');
					$("*[data-selector='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").html('0');
					$("*[data-consignorLrCharges='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").html('0');
				}

				$("*[data-lr='grandTotal']").html('0');
				$("*[data-lr='bookingServicetax']").html('0');
				$("*[data-lr='bookingReceived']").html('0');
				$("*[data-lr='bookingBalance']").html('0');
				$("*[data-lr='chargeSum']").html('0');
				$("*[data-lr='advanceAmount']").html('0');
				$("*[data-consignorLrCharges='chargeSum']").html('0');
				$("*[data-consignorLrCharges='grandTotal']").html('0');
				$("*[data-lr='grandTotalInWord']").html("Zero");
				$("*[data-gst='sgst']").html('0');
				$("*[data-gst='cgst']").html('0');
				$("*[data-gst='igst']").html('0');
				$("*[data-gst='consignorsgst']").html('0');
				$("*[data-gst='consignorcgst']").html('0');
				$("*[data-gst='consignorigst']").html('0');
				$("*[data-gst='consigneeigst']").html('0');
				$("*[data-gst='transporterigst']").html('0');
			}, showPopUp : function(responseOut) {
			hideLayer();
			//var conf = responseOut.configuration;
			var isPdfExportAllow = responseOut.isPdfExportAllow;
			var _this = this;
			var wayBillTypeId = responseOut.wayBillTypeId;
			var bookingCharges = responseOut.waybillBookingChargesList;
							var chargeTypeModelArr = responseOut.chargeTypeModelArr;

				var _this	= this;

		if (responseOut.chargedWeight >= 3000) {
                    $('#popupForTbbAmount385').bPopup({}, function() {
                        var _thisMod = this;

                            $(this).html("<div class='confirm' style='height:150px;width:250px; padding:5px'>"
                                + "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
                                + "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' id='check'  /> <b style='font-size:14px;'>Print Charges</b><div>"
                                + "<p style='color:red'>Shortcut Keys : Enter = Yes, Esc = No</p>"
                                + "<button id='cancel'>NO</button>"
                                + "<button autofocus id='printCharges'>YES</button></center></div>")

                            $("#shortcut").html("Shortcut Keys : Enter = Yes, Esc = No")

                            $('#printCharges').focus();

                            $(document).on('keydown', function(event) {
                                if (event.keyCode == 27) {
                                    window.close();
                                }
                            });

                            $("#cancel").click(function() {
                                _thisMod.close();
                                _this.printWindow();
                            });

                            $("*[data-lr='advanceAmount']").html('0');

                            $("#printCharges").click(function() {
                                var chekced = $("#check").is(":checked");

                                if (chekced) {
                                    for (var index in bookingCharges) {
                                        $("*[data-consignorLrCharges='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html(bookingCharges[index].wayBillBookingChargeChargeAmount);
                                    }

                                    $("*[data-consignorLrCharges='chargeSum']").html(responseOut.bookingChargesSum);
                                    $("*[data-consignorLrCharges='grandTotal']").html(Math.round(responseOut.bookingTotal));

                                    _thisMod.close();
                                    _this.printWindow();
                                } else {
                                    _this.setZeroAmount(chargeTypeModelArr);
                                    $("*[data-lr='advanceAmount']").html('0');
                                    _thisMod.close();
                                    _this.printWindow();
                                }
                            });
                        });    
                    }else{
                        var _thisMod = this;

                        for (var index in bookingCharges) {
                                $("*[data-consignorLrCharges='chargeValue" + bookingCharges[index].chargeTypeMasterId + "']").html(bookingCharges[index].wayBillBookingChargeChargeAmount);
                            }

                            $("*[data-consignorLrCharges='chargeSum']").html(responseOut.bookingChargesSum);
                            $("*[data-consignorLrCharges='grandTotal']").html(Math.round(responseOut.bookingTotal));
                            
                            _this.printWindow(isPdfExportAllow);
                    }	
			
		}
	});
});	