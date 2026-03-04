define([], function(){	
	return {
		setDataTableDetails : function(tableData, BookingChargeConstant, configuration , dynamicCharges) {
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
				
				totalChargeWt 			+=element.chargeWeight;
				totalArticle 			+=element.totalArticle;
				totalfreight 			+=element.lrFreight;
				totalStatisticalCharge 	+=element.StatisticalCharge;
				totalAmount 			+=element.lrGrandTotal;
				TotalOtherCharge 		+=element.otherChargeForCustom;
				
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
		}, setPopup : function(accountGroupId, data) {
			var $popup = $('#popUpContent_' + accountGroupId);

			  $popup.bPopup({}, function () {
			    var _thisMod = this;
			
			    // Build popup content
			    $(this).html(
			      "<div class='confirm' style='font-size:18px;height:330px;width:350px;color:DodgerBlue;'>" +
			        "<b style='margin-top:15px;'>Print Option</b>" +
			        "<b style='margin-top:15px;padding-left: 120px;'>Bank Details</b><br/><br/>" +
			        "<input type='radio' id='oldHeader' class='oldHeaderInput' checked='checked'  name='header' />&nbsp;<b style='font-size:14px;'>Old Header</b>&emsp;&emsp;"+
					"<input type='radio'id='newHeader' class='newHeaderInput' name='header' />&nbsp;<b style='font-size:14px;'>New Header</b><br/><br/>"+
			        "<input type='radio' id='withHeader' name='headerMode'/>&nbsp;<b style='font-size:14px;'>With Header</b>&emsp;&emsp;" +
			        "<input type='radio' id='withoutHeader' name='headerMode'/>&nbsp;<b style='font-size:14px;'>Without Header</b><br/><br/>" +
			        "<input type='radio' id='withBankDetails' name='bankdet'/>&nbsp;<b style='font-size:14px;'>With Bank Details</b>&emsp;&emsp;" +
			        "<input type='radio' id='withoutBankDetails' name='bankdet'/>&nbsp;<b style='font-size:14px;'>Without Bank Details</b><br/><br/>" +
			        "<input type='radio' id='withSignature' name='signature'/>&nbsp;<b style='font-size:14px;'>With Signature</b>&emsp;&emsp;" +
			        "<input type='radio' id='withoutSignature' name='signature'/>&nbsp;<b style='font-size:14px;'>Without Signature</b><br/><br/>" +
			        "<input type='radio' id='ThisMonthBill' name='monthbill'/>&nbsp;<b style='font-size:14px;'>This Month Bill</b>&emsp;&emsp;" +
			        "<input type='radio' id='PreviousPendingBill' name='monthbill'/>&nbsp;<b style='font-size:14px;'>Previous Pending Bill</b><br/><br/>" +
			        "&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;&nbsp;" +
			        "<button class='' id='cancel'>Cancel</button>" +
			        "<button class='' id='ok'>Ok</button></div>"
			    );
					
			    var state = {
			      headerVisible: true,
			      activeHeader: (function () {
			        var oldVisible = $('.withHeaderPrint.oldHeader').is(':visible') || $('.withHeaderPrint.oldHeader').css('visibility') === 'visible';
			        var newVisible = $('.withHeaderPrint.newHeader').is(':visible') || $('.withHeaderPrint.newHeader').css('visibility') === 'visible';
			        if (oldVisible) return 'old';
			        if (newVisible) return 'new';
			        return 'old';
			      })(),
			      bankDetails: true,
			      signature: true,
			      billMode: 'thisMonth' 
			    };
			

			    function applyHeader() {
			      if (state.headerVisible) {

			        $('.withHeaderPrint').css('visibility', 'visible');
			        $('.withHeaderPrint.oldHeader').hide();
			        $('.withHeaderPrint.newHeader').hide();
			        if (state.activeHeader === 'old') {
			          $('.withHeaderPrint.oldHeader').show();
			        } else {
			          $('.withHeaderPrint.newHeader').show();
			        }
			        $('.withHeaderDetails').show();
			        $('.withoutHeaderDetails').hide();
			        
			      } else {

			        if ($('.withHeaderPrint.oldHeader').is(':visible')) state.activeHeader = 'old';
			        if ($('.withHeaderPrint.newHeader').is(':visible')) state.activeHeader = 'new';
				        $('.withHeaderPrint').css('visibility', 'hidden');
				        $('.withoutHeaderDetails').show();
				        $('.withHeaderDetails').hide();
			      }
			    }
			
			    function applyBankDetails() {
			      if (state.bankDetails) {
			        $('.withBankDetails').show();
			      } else {
			        $('.withBankDetails').hide();
			      }
			    }
			    
				function applyBankAccounts() {
					  if (!state.bankDetails) {
						  $('.bankAccountNo1, .bankAccountNo2').css('visibility', 'hidden');
						  return;
					  }
					  if (state.activeHeader === 'old') {
						  $('.bankAccountNo1').css('visibility', 'visible');
						  $('.bankAccountNo2').css('visibility', 'hidden');
						  $('.bankNumber2').addClass('hideImportant');
						  $('.bankNumber1').removeClass('hideImportant');
					  } else {
						  $('.bankAccountNo1').css('visibility', 'hidden');
						  $('.bankAccountNo2').css('visibility', 'visible');
						  $('.bankNumber1').addClass('hideImportant');
						  $('.bankNumber2').removeClass('hideImportant');
					  }
				  }
			
			    function applySignature() {
			      $('.withSignature').css('visibility', state.signature ? 'visible' : 'hidden');
			    }
			
			    function applyBillMode() {
			      if (state.billMode === 'thisMonth') {
			        $('.PreviousPendingBill').css('display', 'none');
			        $('.ThisMonthBill').css('display', 'block');
			        $('.preBill').addClass('hide');
			      } else {
			        $('.ThisMonthBill').css('display', 'none');
			        $('.PreviousPendingBill').css('display', 'block');
			        $('.preBill').removeClass('hide');
			      }
			    }
			
			    function applyAll() {
			      applyHeader();
			      applyBankDetails();
			      applySignature();
			      applyBillMode();
			      applyBankAccounts();
			    }

			    state.headerVisible = ($('.withHeaderPrint').css('visibility') !== 'hidden');
			    state.bankDetails   = $('.withBankDetails').is(':visible');
			    state.signature     = ($('.withSignature').css('visibility') !== 'hidden');
			    state.billMode      = 'thisMonth';
			
			   function syncRadiosFromState() {
					$('#oldHeader').prop('checked', state.activeHeader === 'old');
					$('#newHeader').prop('checked', state.activeHeader === 'new');
					$('#withHeader').prop('checked', state.headerVisible);
					$('#withoutHeader').prop('checked', !state.headerVisible);
					$('#withBankDetails').prop('checked', state.bankDetails);
					$('#withoutBankDetails').prop('checked', !state.bankDetails);
					$('#withSignature').prop('checked', state.signature);
					$('#withoutSignature').prop('checked', !state.signature);
					$('#ThisMonthBill').prop('checked', state.billMode === 'thisMonth');
					$('#PreviousPendingBill').prop('checked', state.billMode === 'previous');
				}
				
				
				syncRadiosFromState();
				applyAll();
			
				$('#oldHeader').on('click', function () {
				state.activeHeader = 'old';
				state.headerVisible = true; 
				syncRadiosFromState();
				applyHeader();
				applyBankAccounts();
				});
				
				
				$('#newHeader').on('click', function () {
				state.activeHeader = 'new';
				state.headerVisible = true;
				syncRadiosFromState();
				applyHeader();
				applyBankAccounts();
				});
				
			    $('#withHeader').on('click', function () {
			      state.headerVisible = true;
			      applyHeader();
				  applyBankAccounts();
				  //$('.newHeaderInput, .oldHeaderInput').prop('disabled', false);
			    });
			
			    $('#withoutHeader').on('click', function () {
			      state.headerVisible = false;
			      applyHeader();
				  applyBankAccounts();
				  //$('.newHeaderInput, .oldHeaderInput').prop('disabled', true);
			    });
			
			    $('#withBankDetails').on('click', function () {
			      state.bankDetails = true;
			      applyBankDetails();
				  applyBankAccounts()
			    });
			
			    $('#withoutBankDetails').on('click', function () {
			      state.bankDetails = false;
			      applyBankDetails();
				  applyBankAccounts();
			    });
			
			    $('#withSignature').on('click', function () {
			      state.signature = true;
			      applySignature();
			    });
			
			    $('#withoutSignature').on('click', function () {
			      state.signature = false;
			      applySignature();
			    });
			
			    $('#ThisMonthBill').on('click', function () {
			      state.billMode = 'thisMonth';
			      applyBillMode();
			    });
			
			    $('#PreviousPendingBill').on('click', function () {
			      state.billMode = 'previous';
			      applyBillMode();
			    });
			
			    $("#excelDownLoad").hide();
			
			    function doPrintFlow() {
			      _thisMod.close();
			      setTimeout(function () {
			        window.print();
			        $("#excelDownLoad").show();
			      }, 200);
			      setTimeout(function () { $(".pdfDownLoadEmail").show(); }, 500);
			    }
			
			    $("#ok").on('click', doPrintFlow);
			    $("#cancel").on('click', doPrintFlow);
			  });
		 }
	 }
});

