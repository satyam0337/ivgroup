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
		}, showPopUp : function(responseOut, isPdfExportAllow) {
			hideLayer();
			let _this = this;
			
			$('#popUpContent669').bPopup({
			}, function() {
				let chargeTypeModelArr = responseOut.chargeTypeModelArr;

				_this.hideCharges(chargeTypeModelArr);
				$(".hideTotal").hide();
						
						let _thisMod = this;
						$(this).html("<div class='confirm' style='height:180px'><h1>Print option</h1><br><center>" +
							"<input type='checkbox' name='setAmount' id='setAmount' style='font-weight: bold;font-size: 20px;' unchecked />Print Charges</center> " +
							"<br><br><button type='button' name='cancel' id='cancel' class='btn-primary'>Cancel</button>" +
							"<button type='button' name='printCharges' id='printCharges' class='btn-primary' style='margin-left: 50px;'>Print</button>");

						$('.confirm').focus();
						$('#printCharges').click(function() {
							_thisMod.close();
							_this.printWindow();
						})
						$("#cancel").click(function() {
							_thisMod.close();
						})

						$("#setAmount").click(function() {
							if ($("#setAmount").is(":checked")) {
								_this.showCharges(chargeTypeModelArr);
								$(".hideTotal").show();
							} else if ($("#setAmount").not(":checked")) {
								_this.hideCharges(chargeTypeModelArr);
								$(".hideTotal").hide();
							}
						});

					});
						
			},	hideCharges: function(chargeTypeModelArr) {
				for (let index in chargeTypeModelArr) {
					$("*[data-selector='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").css("display", "none");
				}
			}, showCharges: function(chargeTypeModelArr) {
				for (let index in chargeTypeModelArr) {
					$("*[data-selector='chargeValue" + chargeTypeModelArr[index].chargeTypeMasterId + "']").css("display", "block");
				}
			}
	});
});	