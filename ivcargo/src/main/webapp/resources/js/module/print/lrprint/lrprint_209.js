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

			$('#popUpContent209').bPopup({//netc
					}, function() {
						var _thisMod = this;
						$(this).html("<div class='confirm'><table align='center'><tr><td colspan='3' style='text-align:center'><h1>Select Company Name</h1></td></tr>" +
							"<tr><td><input type='radio' name='company' value='company' checked>Company</td><td><input type='radio' name='company' value='Agency'>Agency</td>" +
							"<td><input type='radio' name='company' value='Carrier'>Carrier</td></tr><tr><td colspan='3'><input type='radio' id='check1' >Print Single LR Copy</td></tr></table>" +
							"<button id='cancelButton'>NO</button><button autofocus id='confirm'>YES</button></div>");
						var selectedOption;

						$('#confirm').focus();

						$("#confirm").click(function() {
							selectedOption = $("input[name='company']:checked").val();

							if (selectedOption == 'company') {
								$('.company').html('');
								$('.gstn').append('Transporter Gst :');
								$('.companygstn').append('24AABPP5788K1Z7');

							} else if (selectedOption == 'Agency') {
								$('.company').html('AGENCY');
								$('.gstn').append('Transporter Gst :');
								$('.companygstn').append('24AGNPP7567J1ZO');

							} else if (selectedOption == 'Carrier') {
								$('.company').html('CARRIER');
								$('.gstn').append('Transporter Gst :');
								$('.companygstn').append('27AFYPP5490E1ZQ');
							}

							if ($('#check1').prop('checked') == true) {
								$("#table2").show();
								$("#table3").hide();
								$("#table4").hide();
							}

							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						});

						$("#confirm").on('keydown', function(e) {
							if (e.which == 27) {  //escape
								_thisMod.close();
								//window.close();
							}
						});

						$("#cancelButton").click(function() {
							_thisMod.close();
							_this.printWindow(isPdfExportAllow);
						})
					});
		}
	});
});	
