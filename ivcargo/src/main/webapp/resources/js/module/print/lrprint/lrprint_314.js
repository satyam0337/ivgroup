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

				$('#popUpContent314').bPopup({
					}, function() {
						var _thisMod = this;
						var printHeader = false;

						$(this).html("<div class='confirm' style='height:150px;width:250px; padding:5px'>"
							+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
							+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' id='printHeader'	 />&nbsp;<b style='font-size:14px;'>Print Header</b><div>"
							+ "<p style='color:red'>Shortcut Keys : Enter = Yes, Esc = No</p>"
							+ "<button id='cancelButton5'>NO</button>"
							+ "<button autofocus id='confirm5'>YES</button></center></div>")

						$("#confirm5").focus();

						$(document).ready(function() {
							$('input[id="printHeader"]').click(function() {
								printHeader = $(this).prop("checked");
							});
						});

						$("#confirm5").one('keydown', function(e) {
							if (e.which == 27) {  //escape
								_thisMod.close();
								_this.printWindow(isPdfExportAllow);
							}
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

						$("#confirm5").click(function() {
							if (printHeader == true) {
								$("#header1").attr('src', '/ivcargo/images/Logo/314_HEADER.png');
								$("#header1").css('width', '100%');
								$("#header1").css('height', '70px');
								$("#footer1").attr('src', '/ivcargo/images/Logo/314_FOOTER.png');
								$("#footer1").css('width', '100%');
								$("#footer1").css('height', '35px');
								$("#left1").attr('src', '/ivcargo/images/Logo/314_LEFT.png');
								$("#left1").css('width', '100%');
								$("#left1").css('height', '235px');
								$("#header2").attr('src', '/ivcargo/images/Logo/314_HEADER.png');
								$("#header2").css('width', '100%');
								$("#header2").css('height', '70px');
								$("#footer2").attr('src', '/ivcargo/images/Logo/314_FOOTER.png');
								$("#footer2").css('width', '100%');
								$("#footer2").css('height', '35px');
								$("#left2").attr('src', '/ivcargo/images/Logo/314_LEFT.png');
								$("#left2").css('width', '100%');
								$("#left2").css('height', '235px');
								$("#header3").attr('src', '/ivcargo/images/Logo/314_HEADER.png');
								$("#header3").css('width', '100%');
								$("#header3").css('height', '70px');
								$("#footer3").attr('src', '/ivcargo/images/Logo/314_FOOTER.png');
								$("#footer3").css('width', '100%');
								$("#footer3").css('height', '35px');
								$("#left3").attr('src', '/ivcargo/images/Logo/314_LEFT.png');
								$("#left3").css('width', '100%');
								$("#left3").css('height', '235px');

								$("#header1td").css('height', '76px');
								$("#header2td").css('height', '80px');
								$("#header3td").css('height', '80px');
							}
							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						});

						$("#cancelButton5").click(function() {
							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						});

					});
		}
	});
});	
