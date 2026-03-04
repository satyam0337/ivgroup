define([], function(){	
	return {
		setPopup : function(accountGroupId, data) {
			$('#popUpContent_' + accountGroupId).bPopup({
            }, function() {
				var _thisMod = this;
				$(this).html("<div class='confirm' style='font-size:18px;height:350px;text-align:center;width:450px;color:DodgerBlue;>"
					+ "<b style='font-size:18px;>Print Option</b><br></br>"
					+ "<input type='radio' id='withHeader'  checked='checked'  name='radio1'/>&nbsp;<b style='font-size:16px;'>With Header</b>&emsp;&emsp;"
					+ "<input type='radio' id='withoutHeader'  name='radio1'/>&nbsp;<b style='font-size:16px;'>Without Header</b><br>"
					+ "<input type='radio' id='yesBank' name='radio2'/>&nbsp;<b style='font-size:16px;'>YES BANK</b>"
					+ "<input type='radio' id='centralBank'  checked='checked'  name='radio2'/>&nbsp;<b style='font-size:16px;'>CENTRAL BANK OF INDIA</b><br>"
					+ "<input type='radio' id='formatter1' checked='checked' name='radio3'/>&nbsp;<b style='font-size:16px;'>FORMAT-1</b>&emsp;&emsp;"
					+ "<input type='radio' id='formatter2'  name='radio3' />&nbsp;<b style='font-size:16px;'>FORMAT-2</b><br>"
					+ "<input type='radio' id='formatter3'  name='radio3'/>&nbsp;<b style='font-size:16px;'>FORMAT-3</b>&emsp;&emsp;"
					+ "<input type='radio' id='formatter4'  name='radio3' />&nbsp;<b style='font-size:16px;'>FORMAT-4</b><br>"
					+ "<input type='radio' id='formatter5'  name='radio3' />&nbsp;<b style='font-size:16px;'>FORMAT-5</b>"
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

					
							$("[data-bankDeatils='name']").html("CENTRAL BANK OF INDIA");
							$("[data-bankDeatils='branchName']").html("KEWALE");
							$("[data-bankDeatils='accountNo']").html("3861388637");
							$("[data-bankDeatils='ifscCode']").html("CBIN0285066");
					
				$(document).ready(function() {
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
					$('input[id="formatter1"]').click(function() {
						removeClass2();
						if ($("#Formatter1").prop("checked", true)) {
							$(".blankTd").removeClass('hide');
							$(".actWght1").addClass('hide');
							$(".chargedwght1").addClass('hide');
							$(".hideColmnt5").addClass('hide');
							$(".rate1").addClass('hide');
							$(".type2").addClass('hide');
							$(".format5Freight").addClass('hide');
							$(".artTypeFormate5").addClass('hide');
							$(".articleRateForFromate5").addClass('hide');
							$(".articleRateForFromate4").addClass('hide');
							$(".fromate4Qty").addClass('hide');
							$(".fromate5Qty").addClass('hide');
							$(".noramlQty").addClass('hide');
							$(".catg3").addClass('hide');
							$(".formate4Cat").addClass('hide');
						}
					});

					$('input[id="formatter2"]').click(function() {
						removeClass2();
						if ($("#formatter2").prop("checked", true)) {
							$(".blankTd").addClass('hide');
							$(".vhNum2").addClass('hide');
							$(".invNum2").addClass('hide');
							$(".catg2").addClass('hide');
							$(".actWght2").addClass('hide');
							$(".chargedwght2").addClass('hide');
							$(".type2").addClass('hide');
							$(".format5Freight").addClass('hide');
							$(".artTypeFormate5").addClass('hide');
							$(".articleRateForFromate5").addClass('hide');
							$(".articleRateForFromate4").addClass('hide');
							$(".fromate4Qty").addClass('hide');
							$(".fromate5Qty").addClass('hide');
							$(".fromate1Qty").addClass('hide');
							$(".catg1").addClass('hide');
							$(".formate4Cat").addClass('hide');

						}
					});
					$('input[id="formatter3"]').click(function() {
						removeClass2();
						if ($("#formatter").prop("checked", true)) {
							$(".blankTd").addClass('hide');
							$(".vhNum3").addClass('hide');
							$(".invNum3").addClass('hide');
							$(".catg3").addClass('hide');
							$(".type2").addClass('hide');
							$(".format5Freight").addClass('hide');
							$(".artTypeFormate5").addClass('hide');
							$(".articleRateForFromate5").addClass('hide');
							$(".articleRateForFromate4").addClass('hide');
							$(".fromate4Qty").addClass('hide');
							$(".fromate5Qty").addClass('hide');
							$(".fromate1Qty").addClass('hide');
							$(".catg1").addClass('hide');
							$(".formate4Cat").addClass('hide');
						}
					});

					$('input[id="formatter4"]').click(function() {
						removeClass2();
						if ($("#formatter4").prop("checked", true)) {
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
							
						}
					});
					$('input[id="formatter5"]').click(function() {
						removeClass2();
						if ($("#formatter5").prop("checked", true)) {
							$(".actWght5").addClass('hide');
							$(".vhNum4").addClass('hide');
							$(".catg3").addClass('hide');
							$(".chargedwght4").addClass('hide');
							$(".normalFreight").addClass('hide');
							$(".artTypeNormal").addClass('hide');
							$(".normalRate").addClass('hide');
							$(".fromate4Qty").addClass('hide');
							$(".noramlQty").addClass('hide');
							$(".fromate1Qty").addClass('hide');
							$(".catg1").addClass('hide');
							$(".formate4Cat").addClass('hide');
							$(".articleRateForFromate4").addClass('hide');
							$(".hidet4").addClass('hide');

						}
					});
                    
                    $('input[id="yesBank"]').click(function() {
						if ($("#yesBank").prop("checked", true)) {
							//removeClass2();
							$("[data-bankDeatils='name']").html("YES BANK");
							$("[data-bankDeatils='branchName']").html("NERUL");
							$("[data-bankDeatils='accountNo']").html("020063300001512");
							$("[data-bankDeatils='ifscCode']").html("YESB0000200");
							//$(".showMSMINo1").removeClass('hide');
						}
					});
					$('input[id="centralBank"]').click(function() {
						if ($("#centralBank").prop("checked", true)) {
							$("[data-bankDeatils='name']").html("CENTRAL BANK OF INDIA");
							$("[data-bankDeatils='branchName']").html("KEWALE");
							$("[data-bankDeatils='accountNo']").html("3861388637");
							$("[data-bankDeatils='ifscCode']").html("CBIN0285066");
							//$(".showMSMINo1").addClass('hide');
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
		}, setCharges : function(element, tbody) {
			var bookingCharges	= element.bookingCharges;
			  		
			if(bookingCharges == undefined)
				bookingCharges	= [];

				for(var k = 0; k < bookingCharges.length; k++) {
						if(bookingCharges[k].chargeTypeMasterId != FREIGHT && 
							bookingCharges[k].chargeTypeMasterId != DOCKET_CHARGE) {
							var newtrCharge 	= $("<tr></tr>");
							var newtd 	= $("<td style='text-align: center;' class ='t1'	colspan=''></td>");
							var newtd1 	= $("<td style='text-align: center;' class ='docketChargeCol textRight t2'></td>");
							var newtd2 	= $("<td style='text-align: center;' class ='textRight t3'></td>");
							var newtd3 	= $("<td style='text-align: center;' class ='t4' colspan=''></td>");
							var newtd4 	= $("<td style='text-align: center;' class ='textRight  vhNum2 vhNum3 vhNum4 t5'></td>");
							var newtd5 	= $("<td style='text-align: center;' class ='textRight  invNum2 invNum3 invNum5 t6'></td>");
							var newtd6 	= $("<td style='text-align: center;' class ='textRight hidet4'></td>");
							var newtd7 	= $("<td style='text-align: center;' class ='textRight t8'></td>");
							var newtd8	= $("<td style='text-align: center;' class ='textRight  catg1 t9'></td>");
							var newtd9	= $("<td style='text-align: center;' class ='textRight  catg2 catg3 t10'></td>");
							var newtd10	= $("<td style='text-align: center;' class ='textRight formate4Cat t10'></td>");
							var newtd11	= $("<td style='text-align: center;' class ='textRight  type1 type2 t11'></td>");
							var newtd12	= $("<td style='text-align: center;' class ='textRight  actWght1 actWght2 actWght5 t12'></td>");
							var newtd13 = $("<td style='text-align: center;' class ='textRight  chargedwght1 chargedwght2 chargedwght4 t13'></td>");
							var newtd14 = $("<td style='text-align: center;' class ='textRight t7 articleRateForFromate4'></td>");
							var newtd15 = $("<td style='text-align: center;' class ='textRight t8 articleRateForFromate5'></td>");
							var newtd16	= $("<td colspan='2' style='text-align: center;' class ='textRight  '></td>");
							var newtd17	= $("<td style='text-align: center;' class ='textRight   t15'></td>");
							
							//count = k ;
							$(newtd16).html(bookingCharges[k].chargeTypeMasterName);	
							$(newtd17).html(Math.round(bookingCharges[k].wayBillBookingChargeChargeAmount).toFixed(2));	
							$(newtrCharge).append($(newtd));
							$(newtrCharge).append($(newtd1));
							$(newtrCharge).append($(newtd2));
							$(newtrCharge).append($(newtd3));
							$(newtrCharge).append($(newtd4));
							$(newtrCharge).append($(newtd5));
							$(newtrCharge).append($(newtd6));
							$(newtrCharge).append($(newtd7));
							$(newtrCharge).append($(newtd8));
							$(newtrCharge).append($(newtd9));
							$(newtrCharge).append($(newtd10));
							$(newtrCharge).append($(newtd11));
							$(newtrCharge).append($(newtd12));
							$(newtrCharge).append($(newtd13));
							$(newtrCharge).append($(newtd14));
							$(newtrCharge).append($(newtd15));
							$(newtrCharge).append($(newtd16));
							$(newtrCharge).append($(newtd17));
							$(tbody).before(newtrCharge);
						}
					}
						
					if(element.waybillAdditionalRemark != undefined ){
						var newtrCharge 	= $("<tr></tr>");
						var newtd 	= $("<td style='text-align: center;' class =''colspan=''></td>");
							var newtd1 	= $("<td style='text-align: center;' class ='docketChargeCol textRight '></td>");
							var newtd2 	= $("<td style='text-align: center;' class ='textRight '></td>");
							var newtd3 	= $("<td style='text-align: center;' class ='' colspan=''></td>");
							var newtd4 	= $("<td style='text-align: center;' class ='textRight  vhNum2 vhNum3 vhNum4'></td>");
							var newtd5 	= $("<td style='text-align: center;' class ='textRight  invNum2 invNum3 invNum5'></td>");
							var newtd6	= $("<td style='text-align: center;' class ='textRight  catg1'></td>");
							var newtd7	= $("<td style='text-align: center;' class ='textRight  catg2 catg3'></td>");
							var newtd8	= $("<td style='text-align: center;' class ='textRight formate4Cat'></td>");
							var newtd9	= $("<td style='text-align: center;' class ='textRight  type1 type2'></td>");
							var newtd10	= $("<td style='text-align: center;' class ='textRight  actWght1 actWght2 actWght5'></td>");
							var newtd11= $("<td style='text-align: center;' class ='textRight  chargedwght1 chargedwght2 chargedwght4'></td>");
							var newtd12	= $("<td style='text-align: center;' class ='textRight  ' colspan='6'></td>");
							var newtd13 	= $("<td style='text-align: center;' class ='1233231323' colspan=''></td>");
							
							$(newtd12).html(element.waybillAdditionalRemark);	
							$(newtrCharge).append($(newtd));
							$(newtrCharge).append($(newtd1));
							$(newtrCharge).append($(newtd2));
							$(newtrCharge).append($(newtd3));
							$(newtrCharge).append($(newtd4));
							$(newtrCharge).append($(newtd5));
							$(newtrCharge).append($(newtd6));
							$(newtrCharge).append($(newtd7));
							$(newtrCharge).append($(newtd8));
							$(newtrCharge).append($(newtd9));
							$(newtrCharge).append($(newtd10));
							$(newtrCharge).append($(newtd11));
							$(newtrCharge).append($(newtd12));
							$(newtrCharge).append($(newtd13));
							$(tbody).before(newtrCharge);
						}
		}
	}
});