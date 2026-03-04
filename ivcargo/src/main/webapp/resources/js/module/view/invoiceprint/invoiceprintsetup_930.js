define([], function(){	
	return {
		setPopup : function(accountGroupId, data, isExcel) {
			$('#popUpContent_' + accountGroupId).bPopup({
            }, function() {
				var _thisMod = this;
				$(this).html(
					  "<div class='confirm' style='padding-top: 10px;font-size:18px;text-align:center;height:120px;color:DodgerBlue;>"
					+ "<b style='font-size:18px;>Print Option</b><br></br>"
					+ "<label><input type='checkbox' checked='checked' id='chargesToPrint'/>&nbsp;<b style='font-size:16px;'>All Booking Charges To Print</b><br></label>"
					+ "<button class='' id='cancel'>Cancel</button>"
					+ "<button class='' id='ok'>Ok</button></center></div>"
				)
				
				$("#chargesToPrint").on("change", function() {
					if ($(this).prop("checked")) {
						$(".chargesTd").show()
					} else {
						$(".chargesTd").hide()
					}
				})
				
				$("#ok").click(function() {
					if ($("#chargesToPrint").is(":checked")) {
						$(".chargesTd").show()
						_thisMod.close();
						setTimeout(function(){window.print();},200);
					}else{
						_thisMod.close();
						setTimeout(function(){window.print();},200);	
					}
					
				});
	
				$("#cancel").click(function() {
					if ($("#chargesToPrint").is(":checked")) {
						$(".chargesTd").hide()
						_thisMod.close();
						setTimeout(function(){window.print();},200);
					}else{
						_thisMod.close();
						setTimeout(function(){window.print();},200);	
					}
				});

			});
		}
	}
});