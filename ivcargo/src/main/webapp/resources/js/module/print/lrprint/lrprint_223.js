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
				$('#popUpContent223').bPopup({
				}, function() {
					var _thisMod = this;

					$(this).html("<div class='confirm' style='height:150px;width:250px; padding:5px'>"
							+"<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Option</b><div><br/>"
							+"<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox'  id='check' checked />&nbsp;<b style='font-size:14px;'>New Print</b><div>"
							+"<button id='cancel'>Cancel</button>"
							+"<button autofocus id='newPrint'>Print</button></center></div>")

					$("#shortcut").html("Shortcut Keys : Enter = Print, Esc = Cancel")
					$("#confirm").focus();
					$('#printCharges').focus();

					$(document).on('keydown', function(event) {
						if (event.keyCode == 27) {
							window.close();
						}
					});
				
					$("#confirm").click(function(){
						_thisMod.close();
						_this.printWindow();
					})

					$("#cancel").click(function(){
						_thisMod.close();
						window.close();
						_this.printWindow();
					});
				
					$("#newPrint").click(function(){

					if ( $("#check").is(":checked") ) {
						$(".newPrint").show();
						$(".oldPrint").hide();
						_thisMod.close();
						_this.printWindow();
					}else if ( $("#check").not(":checked") ) {
						$(".newPrint").hide();
						$(".oldPrint").show();
						_thisMod.close();
						_this.printWindow();
					}})

				});
		}
	});
});	