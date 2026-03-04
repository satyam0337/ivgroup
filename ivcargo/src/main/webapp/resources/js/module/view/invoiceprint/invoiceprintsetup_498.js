define([], function() {	
	return {
		pageWiseTotalAmount : function(data) {
			var newtr = $("<tr></tr>");
						var newtd1 = $("<td colspan='8' class ='bold centerAlign font12 borderBottom borderLeft'>Total</td>");
						var newtd2 = $("<td class ='bold rightAlign font12 borderBottom borderLeft'></td>");
						var newtd3 = $("<td class ='bold rightAlign font12 borderBottom borderLeft'></td>");
						var newtd4 = $("<td class ='bold rightAlign font12 borderBottom borderLeft'></td>");
						var newtd5 = $("<td class ='bold rightAlign font12 borderBottom borderLeft'></td>");
						var newtd6 = $("<td class ='bold rightAlign font12 borderBottom borderLeft '></td>");
						var newtd7 = $("<td class ='bold rightAlign font12 borderBottom borderLeft borderRight'></td>");
						
						$(newtd2).html(data.totalChargeWt)
						$(newtd3).html(data.totalArticle)
						$(newtd4).html(data.totalfreight)
						$(newtd5).html(data.totalStatisticalCharge)
						$(newtd6).html(data.TotalOtherCharge)
						$(newtd7).html(data.totalAmount)
						
						$(newtr).append($(newtd1));
						$(newtr).append($(newtd2));
						$(newtr).append($(newtd3));
						$(newtr).append($(newtd4));
						$(newtr).append($(newtd5));
						$(newtr).append($(newtd6));
						$(newtr).append($(newtd7));
						$(tbody).before(newtr);
						
						var newtr2 = $("<tr></tr>");
						var newtd1 = $("<td colspan='14' class ='bold leftAlign font12 borderBottom borderLeft borderRight'></td>");
						
						$(newtr2).append($(newtd1));
						$(tbody).before(newtr2);
		}
	}
});