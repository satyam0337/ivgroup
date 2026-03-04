define([], function(){	
	return {
		setPopup : function(accountGroupId, data) {
			$('#invoicePopUpContent_' + accountGroupId).bPopup({
            }, function() {
				var _thisMod = this;
				var  dotMatrix		   	 = false;
				
				$(this).html("<div class='confirm' style='font-size:18px;height:350px;width:350px;color:DodgerBlue;>"
						+"<b style='margin-top:15px;'>Print Option</b>"
						+"<b style='margin-top:15px;padding-left: 120px;'>Bank Details</b><br/><br/>"
						+"<input type='radio' id='consigneeName' checked='checked' name='radio'/>&nbsp;<b style='font-size:14px;'>Print ConsigneeName</b>&emsp;&emsp;"
						+"<input  type='radio' id='saraswat' checked='checked' name='bankdet'/>&nbsp;<b style='font-size:14px;'>SARASWAT</b><br/><br/>"
						+"<input type='radio' id='consignorName' name='radio' />&nbsp;<b style='font-size:14px;'>Print ConsignorName</b>&emsp;&emsp;"
						+"<input  type='radio' id='axis' name='bankdet' />&nbsp;<b style='font-size:14px;'>AXIS</b><br/><br/>"
						+"<input type='checkbox' id='check' checked='checked'  />&nbsp;<b style='font-size:14px;'>Print Charges</b>&emsp;&emsp;&emsp;&emsp;&emsp;"
						+"<input  type='radio' id='baroda' name='bankdet' />&nbsp;<b style='font-size:14px;'>BARODA</b><br/><br/>"
						+"&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;&nbsp;"
						
						+"<input  type='radio' id='tjsb' name='bankdet' />&nbsp;<b style='font-size:14px;'>TJSB</b><br/><br/>"
						+"&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;&nbsp;"
						+"<input  type='radio' id='sahakari' name='bankdet' />&nbsp;<b style='font-size:14px;'>Satara Sahakari</b><br/><br/>"
						+"&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;&nbsp;"
						+"<input  type='radio' id='icici' name='bankdet' />&nbsp;<b style='font-size:14px;'>ICICI BANK</b><br/><br/>"
						+"<button class='printCharges' id='Laser'>Laser Print</button>"
						+"<button class='printCharges' id='dotmatrix'>DotMatrix Print</button></center></div>")

					$("#Laser").click(function() {
							_thisMod.close();
							setTimeout(function(){window.print();},200);
						});
				
				$("#dotmatrix").click(function() {
					if(dotMatrix	 == true) {
					}  else {
						$(".borderTop").each(function(){
							$(this).removeClass("borderTop");
							$(this).addClass("borderTopDot");
						})
						$(".borderBottom").each(function(){
							$(this).removeClass("borderBottom");
							$(this).addClass("borderBottomDot");
						})
						$(".borderLeft").each(function(){
							$(this).removeClass("borderLeft");
							$(this).addClass("borderLeftDot");
						})
						$(".borderRight").each(function(){
							$(this).removeClass("borderRight");
							$(this).addClass("borderRightDot");
						})
						$(".letterSpacing").each(function(){
							$(this).removeClass("letterSpacing");
							$(this).addClass("letterSpacingDot");
						})
					}
					_thisMod.close();
					setTimeout(function(){window.print();},200);

				});

				$(document).ready(function() {
					$(".consignorName").hide();
					$(".consigneeName").show();
					$(".saraswatBank").show();
					$(".axisBank").hide();				
					$(".barodaBank").hide();				
					$(".tjsbBank").hide();
					$(".sahakariBank").hide();
					$(".icici").hide();
					$('input[id="consignorName"]'). click(function() {
						$(".consignorName").show();
						$(".consigneeName").hide();
					});
					$('input[id="consigneeName"]'). click(function() {
						$(".consignorName").hide();
						$(".consigneeName").show();				
					});
					$('input[id="saraswat"]'). click(function() {
						$(".saraswatBank").show();
						$(".axisBank").hide();				
						$(".barodaBank").hide();				
						$(".tjsbBank").hide();
						$(".sahakariBank").hide();
						$(".icici").hide();
					});
					$('input[id="axis"]'). click(function() {
						$(".saraswatBank").hide();
						$(".axisBank").show();				
						$(".barodaBank").hide();				
						$(".tjsbBank").hide();
						$(".sahakariBank").hide();
						$(".icici").hide();
					});
					
					$('input[id="baroda"]'). click(function() {
						$(".saraswatBank").hide();
						$(".axisBank").hide();				
						$(".barodaBank").show();				
						$(".tjsbBank").hide();	
						$(".sahakariBank").hide();
						$(".icici").hide();
					});
					
					$('input[id="tjsb"]'). click(function() {
						$(".saraswatBank").hide();
						$(".axisBank").hide();				
						$(".barodaBank").hide();				
						$(".tjsbBank").show();
						$(".sahakariBank").hide();
						$(".icici").hide();
					});
					
					$('input[id="sahakari"]'). click(function() {
						$(".saraswatBank").hide();
						$(".axisBank").hide();				
						$(".barodaBank").hide();				
						$(".tjsbBank").hide();	
						$(".sahakariBank").show();
						$(".icici").hide();	
					});
					
					$('input[id="icici"]'). click(function() {
						$(".saraswatBank").hide();
						$(".axisBank").hide();				
						$(".barodaBank").hide();				
						$(".tjsbBank").hide();	
						$(".sahakariBank").hide();
						$(".icici").show();	
					});
					
					$(".printCharges").click(function(){
						if ( $("#check").is(":checked") ) {
							$(".lrchargeColunm").hide();
							$(".handlingColunm").hide();
							$(".longLengthColunm").hide();
							$(".collectionColunm").hide();
							
							if(data.totalCollection > 0) $(".collectionColunm").show();
							if(data.totalBookingDelivery > 0) $(".doorDeliveryColunm").show();
							if(data.totalLongLength > 0) $(".longLengthColunm").show();
							if(data.totalHandling > 0) $(".handlingColunm").show();
							if(data.totallrCharge > 0) $(".lrchargeColunm").show();
							
							_thisMod.close();
						}else if ( $("#check").not(":checked") ) {
							$(".lrchargeColunm").hide();
							$(".handlingColunm").hide();
							$(".longLengthColunm").hide();
							$(".doorDeliveryColunm").hide();
							$(".collectionColunm").hide();
							_thisMod.close();
						}})
				});
			});
		}
	}
});