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

			$('#popUpContent203').bPopup({//203
					}, function() {
						var _thisMod = this;
						var print1copy = false;

						$(this).html("<div class='confirm' style='height:150px;width:250px; padding:5px'>"
							+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
							+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' id='print1copy'/>&nbsp;<b style='font-size:14px;'>Print single copy</b><div>"
							+ "<p style='color:red'>Shortcut Keys : Enter = Yes, Esc = No</p>"
							+ "<button id='cancelButton4'>NO</button>"
							+ "<button autofocus id='confirm4'>YES</button></center></div>")

						$("#confirm4").focus();

						$(document).ready(function() {
							$('input[id="print1copy"]').click(function() {
								print1copy = $(this).prop("checked");
							});

						});
						$("#confirm4").click(function() {
							if (print1copy) {
								$('.mainTable').addClass('displayNone');
								$('.mainTable1').removeClass('displayNone');
							} else {
								$('.mainTable1').addClass('displayNone');
								$('.mainTable').removeClass('displayNone');
							}

							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						});

						$("#confirm4").on('keydown', function(e) {
							if (e.which == 27) {  //escape
								_thisMod.close();
								_this.printWindow(isPdfExportAllow);
							}
						});

						$("#cancelButton4").click(function() {
							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						})
					});
		}
	});
});	
