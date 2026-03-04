define([], function(){	
	return {
		setPopup : function(accountGroupId, data) {
			$('#popUpContent_' + accountGroupId).bPopup({
            }, function() {
				var _thisMod = this;
				$(this).html("<div class='confirm' style='font-size:18px;height:170px;text-align:center;width:450px;color:DodgerBlue;>"
					+ "<b style='font-size:18px;>Print Option</b><br></br>"
					+ "<input type='radio' id='withHeader'  checked='checked'  name='radio1'/>&nbsp;<b style='font-size:16px;'>With Header</b>&emsp;&emsp;"
					+ "<input type='radio' id='withoutHeader'  name='radio1'/>&nbsp;<b style='font-size:16px;'>Without Header</b><br>"
					+ "<button class='' id='cancel'>Cancel</button>"
					+ "<button class='' id='ok'>Ok</button></center></div>")

				function removeClass2() {
						$(".actWght1").removeClass('hide');
						$(".chargedwght1").removeClass('hide');
						$(".rate1").removeClass('hide');
						$(".vhNum2").removeClass('hide');
						$(".invNum2").removeClass('hide');
						$(".catg2").removeClass('hide');
						$(".type2").removeClass('hide');
						$(".actWght2").removeClass('hide');
						$(".chargedwght2").removeClass('hide');
						$(".vhNum3").removeClass('hide');
						$(".vhNum8").removeClass('hide');
						$(".invNum3").removeClass('hide');
						$(".catg3").removeClass('hide');
						$(".vhNum4").removeClass('hide');
						$(".chargedwght4").removeClass('hide');
						$(".actWght5").removeClass('hide');
						$(".invNum5").removeClass('hide');
						$(".showMSMINo1").removeClass('hide');
						$(".normalFreight").removeClass('hide');
						$(".format5Freight").removeClass('hide');
						$(".noramlQty").removeClass('hide');
						$(".format5Freight").removeClass('hide');
						$(".fromate4Qty").removeClass('hide');
						$(".fromate5Qty").removeClass('hide');
						$(".articleRateForFromate5").removeClass('hide');
						$(".articleRateForFromate4").removeClass('hide');
						$(".normalRate").removeClass('hide');
						$(".artTypeNormal").removeClass('hide');
						$(".artTypeFormate5").removeClass('hide');
						$(".fromate1Qty").removeClass('hide');
						$(".catg1").removeClass('hide');
						$(".formate4Cat").removeClass('hide');
						$(".formate5Cat").removeClass('hide');
						$(".hidet4").removeClass('hide');
						
					}
					
					$(".blankTd").removeClass('hide');
					$(".actWght1").addClass('hide');
					$(".chargedwght1").addClass('hide');
					$(".hideColmnt5").addClass('hide');
					$(".rate1").addClass('hide');
					$(".type2").addClass('hide');
					$(".format5Freight").addClass('hide');
					$(".artTypeFormate5").addClass('hide');
					$(".fromate4Qty").addClass('hide');
					$(".fromate5Qty").addClass('hide');
					$(".articleRateForFromate5").addClass('hide');
					$(".articleRateForFromate4").addClass('hide');
					$(".catg3").addClass('hide');
					$(".noramlQty").addClass('hide');
					$(".catg2").addClass('hide');
					$(".formate4Cat").addClass('hide');
					$(".formater2").addClass('hide');

					$('input[id="withHeader"]').click(function() {
						if ($("#withHeader").is(":checked")) {
							$(".withHeaderPrint").show();
							$(".withHeaderDetails").show();
							$(".withoutHeaderDetails").css("display", "none");
						}
					});
					$('input[id="withoutHeader"]').click(function() {
						if ($("#withoutHeader").is(":checked")) {
							$(".withHeaderPrint").css("display", "none");
							$(".withoutHeaderDetails").show();
							$(".withHeaderDetails").css("display", "none");
						}
					});
					

					removeClass2();
					$(".blankTd").addClass('hide');
					$(".vhNum4").addClass('hide');
					$(".type2").addClass('hide');
					$(".format5Freight").addClass('hide');
					$(".artTypeFormate5").addClass('hide');
					$(".articleRateForFromate5").addClass('hide');
					$(".noramlQty").addClass('hide');
					$(".fromate5Qty").addClass('hide');
					$(".fromate1Qty").addClass('hide');
					$(".catg1").addClass('hide');
					$(".catg3").addClass('hide');
					$(".normalRate").addClass('hide');
					$(".hidet4").addClass('hide');
					$(".formater2").addClass('hide');
					$('.extraFor2and5').addClass('hide');

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