define([], function(){	
	return {
		setPopup : function(accountGroupId, data, isExcel) {
			$('#popUpContent_' + accountGroupId).bPopup({
            }, function() {
				var _thisMod = this;
				$(this).html(
					  "<div class='confirm' style='padding-top: 10px;font-size:18px;text-align:center;height:150px;color:DodgerBlue;>"
					+ "<b style='font-size:18px;>Print Option</b><br></br>"
					+ "<label><input type='checkbox' id='chargesToPrint'/>&nbsp;<b style='font-size:16px;'>Show Charges</b><br></label>"
					+ "<button class='' id='cancel'>Cancel</button>"
					+ "<button class='' id='ok'>Ok</button></center></div>"
				)
				
				$("#ok").click(function() {
					if ($("#chargesToPrint").is(":checked")) {
						var tbody	= $("[data-dataTableDetail3='srNumber']").parent().parent();
						tbody		= (tbody[tbody.length-1]);
						columnObjectForDetails3		= $("[data-row='dataTableDetails3']").children();
						
					for(const element of data.tableData) {
						var newtr = $("<tr></tr>");
											
						for(var j = 0; j < columnObjectForDetails3.length; j++) {
							var newtd = $("<td></td>");
							var dataPicker = $(columnObjectForDetails3[j]).attr("data-dataTableDetail3");
						
							$(newtd).attr("class",$(columnObjectForDetails3[j]).attr("class"));
							$(newtd).attr("data-dataTableDetail3",$(columnObjectForDetails3[j]).attr("data-dataTableDetail3"));
							
							$(newtd).html(element[dataPicker]);
							
							$(newtr).append($(newtd));
							$(tbody).before(newtr);
						}
									
						var bookingCharges				= element.bookingCharges;
										
						for(var k = 0; k < bookingCharges.length; k++) {
								var newtrCharge		= $("<tr></tr>");
								var newtd	= $("<td style='text-align: left;'colspan='8'></td>");
								var newtd1	= $("<td style='text-align: left; border-left: 1px solid black; padding-left: 6px; border-bottom: 1px solid black;' class =' ' ></td>");
								var newtd2	= $("<td style='text-align: right; border-left: 1px solid black;border-bottom: 1px solid black;border-right: 1px solid black;' class ='textRight' ></td>");
								count = k ;
								$(newtd1).html(bookingCharges[k].chargeTypeMasterName);	
								$(newtd2).html(bookingCharges[k].wayBillBookingChargeChargeAmount.toFixed(2));	
								$(newtrCharge).append($(newtd));
								$(newtrCharge).append($(newtd1));
								$(newtrCharge).append($(newtd2));
								$(tbody).before(newtrCharge);
						}
						}
						$("[data-row='dataTableDetails3']").remove();
									
						_thisMod.close();
						setTimeout(function(){window.print();},200);
					}else{
						var tbody	= $("[data-dataTableDetail3='srNumber']").parent().parent();
							tbody		= (tbody[tbody.length-1]);
							columnObjectForDetails3		= $("[data-row='dataTableDetails3']").children();
							
						for(const element of data.tableData) {
							var newtr = $("<tr></tr>");
												
							for(var j = 0; j < columnObjectForDetails3.length; j++) {
								var newtd = $("<td></td>");
								var dataPicker = $(columnObjectForDetails3[j]).attr("data-dataTableDetail3");
							
								$(newtd).attr("class",$(columnObjectForDetails3[j]).attr("class"));
								$(newtd).attr("data-dataTableDetail3",$(columnObjectForDetails3[j]).attr("data-dataTableDetail3"));
								
								$(newtd).html(element[dataPicker]);
								
								$(newtr).append($(newtd));
								$(tbody).before(newtr);
							}
							}
							$("[data-row='dataTableDetails3']").remove();
						_thisMod.close();
						setTimeout(function(){window.print();},200);	
					}
					
				});
	
				$("#cancel").click(function() {
					if ($("#chargesToPrint").is(":checked")) {
						$(".chargesTd").hide()
						_thisMod.close();
						setTimeout(function(){window.print();},200);
					}else{
						_thisMod.close();
						setTimeout(function(){window.print();},200);	
					}
				});

			});
		}
	}
});