define([], function(){	
	return {
		setCharges : function(element) {
			var bookingCharges				= element.bookingCharges;
				
					for(var k = 0; k < bookingCharges.length; k++) {
						if(bookingCharges[k].chargeTypeMasterId != FREIGHT && 
							bookingCharges[k].chargeTypeMasterId != DOCKET_CHARGE) {
							var newtrCharge 	= $("<tr></tr>");
							var newtd6 	= $("<td style='text-align: left;border-right: 1px solid black;'></td>");
							var newtd7 	= $("<td style='text-align: left;border-right: 1px solid black;'></td>");
							var newtd 	= $("<td style='text-align: left;border-right: 1px solid black;'></td>");
							var newtd3 	= $("<td style='text-align: left; border:1px solid black;' class ='docketChargeCol textRight '></td>");
							var newtd1 	= $("<td style='text-align: left; border-right: 1px solid black;' class =' ' colspan=''></td>");
							var newtd5 	= $("<td style='text-align: left;border-right: 1px solid black; ' class ='' colspan=''></td>");
							var newtd4 	= $("<td style='text-align: left;border-right: 1px solid black; ' class ='' colspan=''></td>");
							var newtd2 	= $("<td style='text-align: center; border-right: 1px solid black;' class ='textRight bold'></td>");
							//count = k ;
							$(newtd1).html(bookingCharges[k].chargeTypeMasterName);	
							$(newtd2).html(bookingCharges[k].wayBillBookingChargeChargeAmount.toFixed(2));	
							$(newtrCharge).append($(newtd));
							$(newtrCharge).append($(newtd6));
							$(newtrCharge).append($(newtd7));
							$(newtrCharge).append($(newtd3));
							$(newtrCharge).append($(newtd1));
							$(newtrCharge).append($(newtd5));
							$(newtrCharge).append($(newtd4));
							$(newtrCharge).append($(newtd2));
							$(tbody).before(newtrCharge);
						}
					}
		}
	}
});