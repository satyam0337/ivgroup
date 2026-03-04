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
			var _this = this;
			var chargeTypeModelArr = responseOut.chargeTypeModelArr;
						
					$('#popUpContent846').bPopup({
					}, function() {

						var _thisMod = this;
						$(this).html("<div class='confirm' style='height:180px'><h1>Print option</h1><br>" +
							"<input type='checkbox' name='setAmount' id='setAmount' style='font-weight: bold;font-size: 20px;' unchecked />Print Charges<br> " +
							"<input type='checkbox' name='setHeader' id='setHeader' style='	font-weight: bold;font-size: 20px;' unchecked />Print Header" +
							"<br><br><button type='button' name='cancel' id='cancel' class='btn-primary'>Cancel</button>" +
							"<button type='button' name='printCharges' id='printCharges' class='btn-primary' style='margin-left: 50px;'>Print</button>");

						$('.confirm').focus();
						$('#printCharges').focus();

						$("#cancel").click(function() {
							_thisMod.close();
							_this.setZeroAmount(chargeTypeModelArr);
							_this.printWindow();
						})

						$("#printCharges").click(function() {
							 if($("#setAmount").is(":checked") && $("#setHeader").is(":checked")){
								$(".hideHeader").show();
								$(".showBlank").hide();
								_thisMod.close();
								_this.printWindow();
							}else if($("#setAmount").not(":checked") && $("#setHeader").is(":checked")){
								$(".hideHeader").show();
								$(".showBlank").hide();
								_this.setZeroAmount(chargeTypeModelArr);
								_thisMod.close();
								_this.printWindow();
							}else if ($("#setAmount").is(":checked") && $("#setHeader").not(":checked")) {
								$(".hideHeader").hide();
								$(".showBlank").show();
								_thisMod.close();
								_this.printWindow();
							}else if($("#setAmount").not(":checked") && $("#setHeader").not(":checked")){
								$(".hideHeader").hide();
								$(".showBlank").show();
								_this.setZeroAmount(chargeTypeModelArr);
								_thisMod.close();
								_this.printWindow();
							}
						});

					});
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
			}
	});
});	