define([], function(){	
	return {
		setPopup : function(accountGroupId, data) {
			$('#popUpContent_' + accountGroupId).bPopup({
            }, function() {
				var _thisMod = this;
				$(this).html("<div class='confirm' style='font-size:18px;height:245px;text-align:center;width:350px;color:DodgerBlue;>"
				+"<b style='font-size:18px;>Print Option</b><br></br>"
				+"<input type='radio' id='withHeader'   name='radio1'/>&nbsp;<b style='font-size:16px;'>With Header</b>&emsp;&emsp;"
				+"<input type='radio' id='withoutHeader' checked='checked' name='radio1' />&nbsp;<b style='font-size:16px;'>Without Header</b><br></br>"
				+"<input type='radio' id='dailyInvoice' checked='checked' name='radio' />&nbsp;<b style='font-size:16px;'>Daily Invoice</b>"
				+"<input type='radio' id='monthlyInvoice'  name='radio' />&nbsp;<b style='font-size:16px;padding-right:10px;'>Monthly Invoice</b>"
				+"<button class='' id='cancel'>Cancel</button>"
			    +"<button class='' id='ok'>Ok</button></center></div>")
				
				$(document).ready(function() {
			    	$('#dailyInvoice').prop("checked", true);
					$(".monthlyInvoice").css('visibility', 'hidden');
			        $(".monthlyInvoiceDetails").hide();
			        $(".withHeaderPrint").css("display", "none");
			        $(".nvtTable2").show();
			                
					$(".dailyInvoiceDetails").show();
			        
			        $('input[id="withHeader"]'). click(function() {
						$(".withHeaderPrint").show();
						$(".withHeaderDetails").show();
						$(".withoutHeaderDetails").css("display", "none");
					});
			        
			        $('input[id="withoutHeader"]'). click(function() {
						$(".withHeaderPrint").css("display", "none");
						$(".withoutHeaderDetails").show();
						$(".withHeaderDetails").css("display", "none");
						
					});
					
					$('input[id="dailyInvoice"]'). click(function() {
						$(".dailyInvoicePrint").css('visibility', 'hidden');
						$(".dailyInvoiceDetails").show();
						$(".monthlyInvoiceDetails").css("display", "none");
						$(".nvtTable2").show();
					});	           	
					
					$('input[id="monthlyInvoice"]'). click(function() {
						$(".dailyInvoicePrint").css('visibility', 'visible');
						$(".monthlyInvoiceDetails").show();
						$(".dailyInvoiceDetails").css("display", "none");
						$(".nvtTable2").css("display", "none");
						
					});
					
					if(setFooterToNextPage) 
					  $(".footerOnNextPage").show();
					else			
					  $(".footerOnNextPage").css("display", "none");
						
			   });

				$("#ok").click(function() {
					_thisMod.close();
					setTimeout(function(){window.print();},200);
				});
	
				$("#cancel").click(function() {
					_thisMod.close();
					setTimeout(function(){window.print();},200);
				});

			});
		}
	}
});