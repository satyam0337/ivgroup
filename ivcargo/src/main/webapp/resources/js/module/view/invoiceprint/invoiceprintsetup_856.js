define([], function(){	
	return {
		setPopup : function(accountGroupId, data) {
			$('#invoicePopUpContent_' + accountGroupId).bPopup({
            }, function() {
				var _thisMod = this;
				
				$(this).html("<div class='confirm' style='font-size:18px;height:300px;width:350px;text-align: center;color:DodgerBlue;>"
						+"<b style='margin-top:10px;'>Print Option</b><br/><br/>"	
						+"<input type='radio' id='lrPrint514' checked='checked' name='radio'/>&nbsp;<b style='font-size:14px;'> Print with LR Charges </b><br/><br/>"
						+"<input type='radio' id='totalAmount514' name='radio' />&nbsp;<b style='font-size:14px;'>Print with total Amt</b><br/><br/>"
						+"<button id='cancel'>Cancel</button>"
						+"<button  id='ok'>OK</button></center></div>")

					$("#ok").click(function() {
							_thisMod.close();
							setTimeout(function(){window.print();},200);
						});
				
				$("#cancel").click(function() {
					_thisMod.close();
                
			});
			$("#lrPrint514").click(function() {
				if($('#lrPrint514').prop('checked')){
					$(".invoiceNum514").show();
						$(".articleRate514").show();
						$(".otherCharges514").show();
                        $(".totalnewOtherChargeTH").show();
						$(".totalgrandtotalkpsTH").show();
				}
					});
				$("#totalAmount514").click(function() {
					if($('#totalAmount514').prop('checked')){
						$(".invoiceNum514").hide();
						$(".articleRate514").hide();
						$(".otherCharges514").hide();
                        $(".totalnewOtherChargeTH").hide();
						$(".totalgrandtotalkpsTH").hide();
					}
				});
			});
		}
	}
});