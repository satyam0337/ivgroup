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

			$('#popUpContent418').bPopup({
					}, function() {
						var _thisMod = this;

						$(this).html("<div class='confirm' style='height:150px;width:250px; padding:5px'>"
							+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
							+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' id='check'	 />&nbsp;<b style='font-size:14px;'>Print Charges</b><div>"
							+ "<p style='color:red'>Shortcut Keys : Enter = Yes, Esc = No</p>"
							+ "<button id='cancel'>Cancel</button>"
							+ "<button autofocus id='printCharges'>Print</button></center></div>")

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
							_this.printWindow();
						})

						$("#cancel").click(function() {
							_thisMod.close();
							window.close();
						});
						$("#printCharges").click(function() {

							if ($("#check").is(":checked")) {

								$(".hideCharges").show();
								_thisMod.close();
								_this.printWindow();
							} else if ($("#check").not(":checked")) {
								$(".hideCharges").hide();

								_thisMod.close();
								_this.printWindow();
							}
						})
					});
		}
	});
});	
