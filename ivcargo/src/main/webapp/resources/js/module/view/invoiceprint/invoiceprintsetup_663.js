define([], function(){	
	return {
		setPopup : function(accountGroupId, data) {
			console.log("accountGroupId==>> ",accountGroupId);
			
			$('#invoicePopUpContent_' + accountGroupId).bPopup({
            }, function() {
				var _thisMod = this;
				
				$(this).html("<div class='confirm' style='font-size:18px;height:300px;width:350px;text-align: center;color:DodgerBlue;>"
						+"<b style='margin-top:10px;'>Print Option</b><br/><br/>"	
						+"<input type='radio' id='lrPrint663' checked='checked' name='radio'/>&nbsp;<b style='font-size:14px;'> Print with LR Charges </b><br/><br/>"
						+"<input type='radio' id='totalAmount663' name='radio' />&nbsp;<b style='font-size:14px;'>Print with total Amt</b><br/><br/>"
						+"<button id='cancel'>Cancel</button>"
						+"<button  id='ok'>OK</button></center></div>")

					$("#ok").click(function() {
							_thisMod.close();
							setTimeout(function(){window.print();},200);
						});
				
				$("#cancel").click(function() {
					_thisMod.close();
                
			});
			$("#lrPrint663").click(function() {
				if($('#lrPrint663').prop('checked')){
					$(".invoiceNum663").show();
						$(".articleRate663").show();
						$(".otherCharges663").show();
                        $(".totalnewOtherChargeTH").show();
						$(".totalgrandtotalkpsTH").show();
				}
					});
				$("#totalAmount663").click(function() {
					if($('#totalAmount663').prop('checked')){
						$(".invoiceNum663").hide();
						$(".articleRate663").hide();
						$(".otherCharges663").hide();
                        $(".totalnewOtherChargeTH").hide();
						$(".totalgrandtotalkpsTH").hide();
					}
				});
			});
		}
	}
});