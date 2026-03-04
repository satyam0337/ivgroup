define([], function() {	
	return {
		setPopup : function(accountGroupId, data) {
			$('#popUpContent_' + accountGroupId).bPopup({
			}, function() {
				var _thisMod = this;
				$(this).html("<div class='confirm' style='font-size:18px;height:150px;text-align:center;width:300px;color:DodgerBlue;>"
					+ "<b style='font-size:18px;>Print Option</b><br></br>"
					+ "<input type='radio' id='normalFormat' checked='checked' name='radio3'/>&nbsp;<b style='font-size:16px;'>Normal</b>&emsp;&emsp;"
					+ "<input type='radio' id='adaniFormat'  name='radio3' />&nbsp;<b style='font-size:16px;'>ADANI</b><br>"
					+ "<button class='' id='cancel'>Cancel</button>"
					+ "<button class='' id='ok'>Ok</button></center></div>")

				$('input[id="normalFormat"]').click(function() {
					if ($("#normalFormat").prop("checked", true)) {
						$(".Adani").removeClass('hide');
						$(".Normal").addClass('hide');
					}
				});

				$('input[id="adaniFormat"]').click(function() {
					if ($("#adaniFormat").prop("checked", true)) {
						$(".Adani").addClass('hide');
						$(".Normal").removeClass('hide');
					}
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
		}, setCharges : function(element) {
			var bookingCharges				= element.bookingCharges;
			
			if(bookingCharges != undefined){
				for(var k = 0; k < bookingCharges.length; k++) {
						if(bookingCharges[k].chargeTypeMasterId != FREIGHT && 
							bookingCharges[k].chargeTypeMasterId != DOCKET_CHARGE) {
							var newtrCharge 	= $("<tr></tr>");
							var newtd8 	= $("<td style='text-align: left;'></td>");
							var newtd5 	= $("<td style='text-align: left;'></td>");
							var newtd9 	= $("<td style='text-align: left;'></td>");
							var newtd6 	= $("<td style='text-align: left;border-right: 1px solid black;'></td>");
							var newtd7 	= $("<td style='text-align: left;border-right: 1px solid black;'></td>");
							var newtd 	= $("<td style='text-align: left;border-left:1px solid black; border-right: 1px solid black;'></td>");
							var newtd3 	= $("<td style='text-align: left; ' class ='docketChargeCol textRight '></td>");
							var newtd1 	= $("<td style='text-align: left; border-right: 1px solid black;border-left:1px solid black; text-indent: 20px;' class =' ' colspan='2'></td>");
							var newtd15 	= $("<td style='text-align: center; border-right: 1px solid black;' class ='textRight bold'></td>");
							var newtd2 	= $("<td style='text-align: center; border-right: 1px solid black;' class ='textRight bold'></td>");
							var newtd10 	= $("<td style='text-align: left; border-right: 1px solid black;border-left:1px solid black; text-indent: 20px;' class =' '></td>");
							var newtd11 	= $("<td style='text-align: left; border-right: 1px solid black;border-left:1px solid black; text-indent: 20px;' class =' '></td>");
							var newtd12 	= $("<td style='text-align: left; border-right: 1px solid black;border-left:1px solid black; text-indent: 20px;' class =' '></td>");
							var newtd13 	= $("<td style='text-align: left; border-right: 1px solid black;border-left:1px solid black; text-indent: 20px;' class =' '></td>");
							var newtd14 	= $("<td style='text-align: left; border-right: 1px solid black;border-left:1px solid black; text-indent: 20px;' class =' '></td>");

							//count = k ;
							$(newtd1).html(bookingCharges[k].chargeTypeMasterName);	
							$(newtd2).html(bookingCharges[k].wayBillBookingChargeChargeAmount.toFixed(2));	
							$(newtrCharge).append($(newtd));
							$(newtrCharge).append($(newtd8));
							$(newtrCharge).append($(newtd9));
							$(newtrCharge).append($(newtd6));
							$(newtrCharge).append($(newtd7));
							$(newtrCharge).append($(newtd5));
							$(newtrCharge).append($(newtd3));
							$(newtrCharge).append($(newtd1));
							$(newtrCharge).append($(newtd15));
							$(newtrCharge).append($(newtd4));
							$(newtrCharge).append($(newtd2));
							$(newtrCharge).append($(newtd10));
							$(newtrCharge).append($(newtd11));
							$(newtrCharge).append($(newtd12));
							$(newtrCharge).append($(newtd13));
							$(newtrCharge).append($(newtd14));
							$(tbody).before(newtrCharge);
					}
				}
			}
		}
	}
});