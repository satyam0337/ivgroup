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
			var _this = this;
			
			$('#popUpDataTBBLrprint').bPopup({
				}, function() {
					$(".removeChargest").hide();
					var _thisMod = this;
					$(this).html("<div class='confirm' style='height:180px'><h1>Print option</h1><br><center>" +
						"<input type='checkbox' name='setAmount' id='setAmount' style='font-weight: bold;font-size: 20px;' unchecked />Print Amount</center> " +
						"<br><br><button type='button' name='cancel' id='cancel' class='btn-primary'>Cancel</button>" +
						"<button type='button' name='printCharges' id='printCharges' class='btn-primary' style='margin-left: 50px;'>Print</button>");

					$('.confirm').focus();
					$('#printCharges').focus();

					$("#cancel").click(function() {
						_thisMod.close();
						$(".removeChargest").hide();
						_this.printWindow(isPdfExportAllow);
					})

					$("#printCharges").click(function() {
						if ($("#setAmount").is(":checked"))
							$(".removeChargest").show();
						else
							$(".removeChargest").hide();

						_thisMod.close();
						_this.printWindow(isPdfExportAllow);
					});

				});
		}
	});
});	