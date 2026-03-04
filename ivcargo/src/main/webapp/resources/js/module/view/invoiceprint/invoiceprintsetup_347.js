define([], function(){	
	return {
		setPopup : function(accountGroupId, data) {
			$('#invoicePopUpContent_' + accountGroupId).bPopup({
            }, function() {
				var _thisMod = this;
				
				$(this).html("<div class='confirm' style='font-size:18px;height:300px;width:350px;text-align: center;color:DodgerBlue;>"
						+"<b style='margin-top:10px;'>Print Option</b><br/><br/>"	
						+"<input type='radio' id='consignorName' checked='checked' name='radio'/>&nbsp;<b style='font-size:14px;'>Print ConsigneeName</b><br/><br/>"
						+"<input type='radio' id='consigneeName' name='radio' />&nbsp;<b style='font-size:14px;'>Print ConsignorName</b><br/><br/>"
						+"<button id='cancel'>Cancel</button>"
						+"<button  id='ok'>OK</button></center></div>")

					$("#ok").click(function() {
							_thisMod.close();
							setTimeout(function(){window.print();},200);
						});
				
				$("#cancel").click(function() {
					_thisMod.close();
                
			});
				
				$(document).ready(function() {
					if($("#consignorName").prop("checked")) {
						$(".consignor").addClass('hideCustome');
						$(".lrConsignorName").addClass('hideCustome');
						$(".consignorTH").addClass('hideCustome');
						
						$(".consignee").removeClass('hideCustome');
						$(".lrConsigneeName").removeClass('hideCustome');
						$(".consigneeTH").removeClass('hideCustome');
					}
					
					$('input[id="consignorName"]'). click(function() {
						$(".consignor").addClass('hideCustome');
						$(".lrConsignorName").addClass('hideCustome');
						$(".consignorTH").addClass('hideCustome');
						
						$(".consignee").removeClass('hideCustome');
						$(".lrConsigneeName").removeClass('hideCustome');
						$(".consigneeTH").removeClass('hideCustome');
					});
				
					$('input[id="consigneeName"]'). click(function() {
						$(".consignee").addClass('hideCustome');
						$(".lrConsigneeName").addClass('hideCustome');
						$(".consigneeTH").addClass('hideCustome');
						
						$(".consignor").removeClass('hideCustome');
						$(".lrConsignorName").removeClass('hideCustome');
						$(".consignorTH").removeClass('hideCustome');
					});
				});
			});
		}
	}
});