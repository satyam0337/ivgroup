define([], function(){	
	return {
		setPopup : function(accountGroupId, data) {
			$('#popUpContent_' + accountGroupId).bPopup({
            }, function() {
				var _thisMod = this;
				
				$(this).html("<div class='confirm' style='font-size:18px;height:245px;width:350px;color:DodgerBlue;>"
						+"<b style='margin-top:15px;'>Print Option</b>"
						+"<b style='margin-top:15px;padding-left: 120px;'>Bank Details</b><br/><br/>"
						+"<input type='radio' id='withHeader' checked='checked' name='radio'/>&nbsp;<b style='font-size:14px;'>With Header</b>&emsp;&emsp;"
						+"<input  type='radio' id='withBankDetails' checked='checked' name='bankdet'/>&nbsp;<b style='font-size:14px;'>With Bank Details</b><br/><br/>"
						+"<input type='radio' id='withoutHeader' checked='checked' name='radio' />&nbsp;<b style='font-size:14px;'>Without Header</b>&emsp;&emsp;"
						+"<input  type='radio' id='whithoutBankDetails' name='bankdet' />&nbsp;<b style='font-size:14px;'>Without Bank Details</b><br/><br/>"
						+"<input type='radio' id='withSignature' checked='checked' name='signature' />&nbsp;<b style='font-size:14px;'>With Signature</b>&emsp;&emsp;"
						+"<input  type='radio' id='whithoutSignature' name='signature' />&nbsp;<b style='font-size:14px;'>Without Signature</b><br/><br/>"
						+"<input type='radio' id='ThisMonthBill' checked='checked' name='monthbill' />&nbsp;<b style='font-size:14px;'>This Month Bill</b>&emsp;&emsp;"
						+"<input  type='radio' id='PreviousPendingBill' name='monthbill' />&nbsp;<b style='font-size:14px;'>Previous Pending Bill</b><br/><br/>"
						+"&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;&nbsp;"
						+"<button class='' id='cancel'>Cancel</button>"
						+"<button class='' id='ok'>Ok</button></center></div>")
						
				$(document).ready(function() {
					$('#withoutHeader').prop("checked", true);
					$('#withHeader').prop("checked", true);
					$(".withBankDetails").show();
					$(".withoutHeaderDetails").show();
					$(".withHeaderDetails").hide();
					$(".ThisMonthBill").css('display', 'block');
						
					$('input[id="withHeader"]'). click(function() {
						$(".withHeaderPrint").css('visibility', 'visible');
						$(".withHeaderDetails").show();
						$(".withoutHeaderDetails").hide();
					});
							
					$('input[id="withoutHeader"]'). click(function() {
						$(".withHeaderPrint").css('visibility', 'hidden');
						$(".withoutHeaderDetails").show();
						$(".withHeaderDetails").hide();
					});
								
					$('input[id="withBankDetails"]'). click(function() {
						$(".withBankDetails").show();
					});
							
					$('input[id="whithoutBankDetails"]'). click(function() {
						$(".withBankDetails").hide();
					});
								
					$('input[id="withSignature"]'). click(function() {
						$(".withSignature").css('visibility', 'visible');
					});
							
					$('input[id="whithoutSignature"]'). click(function() {
						$(".withSignature").css('visibility', 'hidden');
					});
					
					$('input[id="ThisMonthBill"]'). click(function() {
						if($('#ThisMonthBill').prop("checked", true)){
							$(".PreviousPendingBill").css('display', 'none');
							$(".ThisMonthBill").css('display', 'block');
							$(".preBill").addClass('hide');
						}
					});
						
					$('input[id="PreviousPendingBill"]'). click(function() {
						if($('#PreviousPendingBill').prop("checked", true)){
							$(".ThisMonthBill").css('display', 'none');
							$(".PreviousPendingBill").css('display', 'block');
							$(".preBill").removeClass('hide');
						}
					});
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