define([], function(){	
	return {
		setDataTableDetails : function(tableData, BookingChargeConstant, configuration, dynamicCharges) {
			var  purchaseOrder;
			var  sourceSubRegion;
			var branchAddressPincode;
			var emailAddress;
			
			for(const element of tableData) {
				purchaseOrder = element.purchaseOrderNumber;
				sourceSubRegion = element.sourceSubRegion;
				branchAddressPincode = element.branchAddressPincode;
				emailAddress = element.emailAddress;
				break;
			}

			$("[data-dataTableDetail='poNumberEdisafe']").html(purchaseOrder);
			$("[data-dataTableDetail='lrSourceSubRegionEdisafe']").html(sourceSubRegion);
			$("[data-dataTableDetail='branchAddressPincodeEdisafe']").html(branchAddressPincode);
			$("[data-dataTableDetail='emailAddress']").html(emailAddress);

			tableData.pop();
			var tbody	= $("[data-dataTableDetail='srNumber']").parent().parent();
			var tbody1	= $("[data-dataTableDetail2='srNumber1']").parent().parent();
		
			tbody		= (tbody[tbody.length-1]);
			tbody1		= (tbody1[tbody1.length-1]);
			columnObjectForDetails		= $("[data-row='dataTableDetails']").children();
			columnObjectForDetails2		= $("[data-row='dataTableDetails2']").children();
			var TableDataHtml	= $("#TableDataHtml")
			var TableDataHtml2	= $("#TableDataHtml2")
			$(tbody).before(TableDataHtml);
			$(tbody1).before(TableDataHtml2);
			
			if(!configuration.autoPageBreak && !configuration.removeAutoPageBreak) {
				var dataTable	= $("#dataTable").clone();
				$("#dataTable").remove();
				$(dataTable).removeClass('hide');
				$(tbody).before(dataTable);
				$(tbody1).before(dataTable);
			}
			
			var totalChargeWt =0;
			var totalArticle =0;
			var totalfreight =0;
			var totalStatisticalCharge =0;
			var TotalOtherCharge =0;
			var totalAmount =0;

			for(const element of tableData) {
				var page =  tableData.length;
				
				totalChargeWt +=element.chargeWeight;
				totalArticle +=element.totalArticle;
				totalfreight +=element.lrFreight;
				totalStatisticalCharge +=element.StatisticalCharge;
				totalAmount +=element.lrGrandTotal;
				TotalOtherCharge +=element.otherChargeForCustom;
				
				$("[data-bill='pageCount']").html(page);
				
				var newtr = $("<tr></tr>");
				var newtr1 = $("<tr></tr>");
				
				for(var j = 0; j < columnObjectForDetails.length; j++) {
					var newtd = $("<td></td>");
					var dataPicker = $(columnObjectForDetails[j]).attr("data-dataTableDetail");
					
					if( dataPicker =="lrBookingDateTimeStrFormatYY"){
						var datetetete = element.lrBookingDateTimeStr;
						var arr = datetetete.split("-");
						var finalDate = arr[0]+"-"+arr[1]+"-"+arr[2].substring(2, 4);
						$(newtd).html(finalDate);
					}
				
					if( dataPicker =="lrNumberWithDate"){
						var datetetete = element.lrBookingDateTimeStr;
						var arr = datetetete.split("-");
						var finalDate = arr[0]+"-"+arr[1]+"-"+arr[2].substring(2, 4);
						$(newtd).html( element.lrNumber +" /   "+finalDate);
					}
					
					$(newtd).attr("class",$(columnObjectForDetails[j]).attr("class"));
					$(newtd).attr("data-dataTableDetail",$(columnObjectForDetails[j]).attr("data-dataTableDetail"));
					
					$("*[data-dataTableDetail='saccode']").html('996511');
			
					$(newtd).html(element[dataPicker]);
					$(newtr).append($(newtd));
					$(tbody).before(newtr);
				}
				
				for(var j = 0; j < columnObjectForDetails2.length; j++) {
					var newtd1 = $("<td></td>");
					var dataPicker = $(columnObjectForDetails2[j]).attr("data-dataTableDetail2");
					$(newtd1).attr("class",$(columnObjectForDetails2[j]).attr("class"));
					$(newtd1).attr("data-dataTableDetail2",$(columnObjectForDetails2[j]).attr("data-dataTableDetail2"));
					
					$("*[data-dataTableDetail='saccode']").html('996511');
			
					$(newtd1).html(element[dataPicker]);
					$(newtr1).append($(newtd1));
					$(tbody1).before(newtr1);
				}
				
				if(configuration != undefined && configuration.showAllCharges != undefined && configuration.showAllCharges) {
					var bookingCharges		= element.bookingCharges;
			
					for(var k = 0; k < bookingCharges.length; k++){
						if(bookingCharges[k].chargeTypeMasterId != BookingChargeConstant.FREIGHT && 
							bookingCharges[k].chargeTypeMasterId != BookingChargeConstant.DOCKET_CHARGE) {
							var newtrCharge = $("<tr></tr>");
							var newtd 	= $("<td  class =''colspan='4'></td>");
							var newtd3 	= $("<td class ='docketChargeCol textRight '></td>");
							var newtd1 	= $("<td class =' ' colspan='5'></td>");
							var newtd2 	= $("<td class ='textRight bold'></td>");
							count = k ;
							$(newtd1).html(bookingCharges[k].chargeTypeMasterName);	
							$(newtd2).html(bookingCharges[k].wayBillBookingChargeChargeAmount.toFixed(2));	
							$(newtrCharge).append($(newtd));
							$(newtrCharge).append($(newtd3));
							$(newtrCharge).append($(newtd1));
							$(newtrCharge).append($(newtd2));
							$(tbody).before(newtrCharge);
						}
					}
			 	}
			
				$("[data-table='poNumber']").html(element.purchaseOrderNumber);
				$("[data-table='poDate']").html(element.purchaseOrderDatestr);
			}
           
		   if(configuration != undefined && configuration.showPageWiseTotal != undefined && configuration.showPageWiseTotal) {
						var newtr = $("<tr></tr>");
						var newtd1 = $("<td colspan='8' class ='bold centerAlign font12 borderBottom borderLeft'>Total</td>");
						var newtd2 = $("<td class ='bold rightAlign font12 borderBottom borderLeft'></td>");
						var newtd3 = $("<td class ='bold rightAlign font12 borderBottom borderLeft'></td>");
						var newtd4 = $("<td class ='bold rightAlign font12 borderBottom borderLeft'></td>");
						var newtd5 = $("<td class ='bold rightAlign font12 borderBottom borderLeft'></td>");
						var newtd6 = $("<td class ='bold rightAlign font12 borderBottom borderLeft '></td>");
						var newtd7 = $("<td class ='bold rightAlign font12 borderBottom borderLeft borderRight'></td>");
						
						$(newtd2).html(totalChargeWt)
						$(newtd3).html(totalArticle)
						$(newtd4).html(totalfreight)
						$(newtd5).html(totalStatisticalCharge)
						$(newtd6).html(TotalOtherCharge)
						$(newtd7).html(totalAmount)
						
						
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
           
			$("[data-row='dataTableDetails']").remove();
			$("[data-row='dataTableDetails2']").remove();
		},
		setPopup : function(accountGroupId, data) {
			$('#popUpContent_' + accountGroupId).bPopup({
            }, function() {
				var _thisMod = this;
				
				$(this).html("<div class='confirm' style='font-size:18px;height:300px;width:350px;padding-left:15px;'>"
						+"<b style='text-align:center'>Print Option</b><br/><br/>"	
						+"<input type='radio' id='headerTypeOne' checked='checked' name='radio'/>&nbsp;<b style='font-size:14px;text-align:left;color:DodgerBlue;'>New Era Transport Carrier</b><br/><br/>"
						+"<input type='radio' id='headerTypeTwo' name='radio' />&nbsp;<b style='font-size:14px;text-align:left;color:DodgerBlue;'>New Era Transport Agency</b><br/><br/>"
						+"<input type='radio' id='headerTypeThree' name='radio' />&nbsp;<b style='font-size:14px;text-align:left;color:DodgerBlue;'>New Era Transport 			</b><br/><br/>"
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

					$('#headerTypeOne').prop("checked", true);
					$(".groupNameOne").show();
					$(".groupNameTwo").hide();
					$(".groupNameThree").hide();

					$('input[id="headerTypeOne"]'). click(function() {
						$(".groupNameOne").show();
						$(".groupNameTwo").hide();
						$(".groupNameThree").hide();
					});
					$('input[id="headerTypeTwo"]'). click(function() {
						$(".groupNameOne").hide();
						$(".groupNameTwo").show();
						$(".groupNameThree").hide();
					});
					$('input[id="headerTypeThree"]'). click(function() {
						$(".groupNameOne").hide();
						$(".groupNameTwo").hide();
						$(".groupNameThree").show();

					});
				});
			});
		}
	}
});