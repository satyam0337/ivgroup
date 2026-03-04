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

			$('#popUpContent725').bPopup({
					}, function() {
						var _thisMod = this;
						var print1copy = false;
						var printAmount = true;
						$(this).html("<div class='confirm' style='height:175px; width:250px; padding:5px'>"
							+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b></div><br/>"
							+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' id='print1copy1'/>&nbsp;<b style='font-size:14px;'>Print Single Copy</b></div>"
							+ "<p style='color:red'>Shortcut Keys : Enter = Yes, Esc = No</p>"
							+ "<button id='cancelButton4'>NO</button>"
							+ "<button	id='confirm6' autofocus>YES</button></center></div>")

						$("#confirm6").focus();

						$(document).ready(function() {
							$('input[id="print1copy1"]').click(function() {
								print1copy = $(this).prop("checked");
							});
						});
						

						$("#confirm6").click(function() {
							if (print1copy) {
								$('.mainTable').addClass('hide');
							} else {
								$('.mainTable').removeClass('hide');
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
