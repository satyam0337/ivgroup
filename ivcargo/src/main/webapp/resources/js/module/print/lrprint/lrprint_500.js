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
			
			$('#popUpContent500').bPopup({
					}, function() {
						var _thisMod = this;
						$(this).html("<div class='confirm' style='height:300px;width:350px; padding:5px'>"
							+ "<div style='font-size:18px; color:DodgerBlue;text-align:center;'><b>Print Options</b><div><br/>"
							+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' value='1' name='box'  id='consignorcopysrr' class='chb'  />&nbsp;<b style='font-size:14px;'> Consignee Copy Driver Copy</b><div>"
							+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox'	value='1' name='box'   id='consigneecopysrr' class='chb'  />&nbsp;<b style='font-size:14px;'>Consignor Copy</b><div>"
							+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' value='1' name='box'	id='freightsrr'	  />&nbsp;<b style='font-size:14px;'>Freight</b><div>"
							+ "<div style='text-align:left;color:black;font-size:17px;'><input type='checkbox' checked='checked' value='1' name='box'	id='weightsrr'	 />&nbsp;<b style='font-size:14px;'>Weight</b><div>"
							+ "<p style='color:red' id='shortcut'></p>"
							+ "<button id='cancelButton'>Cancel</button>"
							+ "<button autofocus id='confirm'>Print</button></center></div>")

						$("#cancelButton").click(function() {
							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						})
						$(".chb").change(function() {
							$(".chb").prop('checked', false);
							$(this).prop('checked', true);
						});

						$("#confirm").click(function() {

							if ($('input[id="consignorcopysrr"]').prop("checked") == true) {
								//$('.FirstCopySrr').css("display","block");
								//$('.SecondCopySrr').css("display","block");
								$('.FirstCopySrr').show();
								$('.SecondCopySrr').show();
							}
							if ($('input[id="consigneecopysrr"]').prop("checked") == true) {
								//$('.FirstCopySrr').css("display","block");
								$('.FirstCopySrr').show();
								//	$('.SecondCopySrr').css("display","none");
								$('.SecondCopySrr').hide();
								$("span, p").each(function() {
									var text = $(this).text();
									text = text.replace("CONSIGNEE COPY", "CONSIGNOR COPY");
									$(this).text(text);
								});
							}

							$('.freightcolumnsrr').css("display", $('input[id="freightsrr"]').prop("checked") ? "block" : "none");
							$('.chweightsrr').css("display", $('input[id="weightsrr"]').prop("checked") ? "block" : "none");

							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						})
					});
		}
	});
});	
