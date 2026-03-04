define(
		[
		 PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
		 PROJECT_IVUIRESOURCES + '/resources/js/module/view/creditorInvoice/supplementarybillinvoicefilepath.js',
		 'JsonUtility',
		 'messageUtility',
		 'jquerylingua',
		 'language',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'],
		 function(UrlParameter, FilePath) {
			'use strict';
			var jsonObject = new Object(), masterId = 0,  _this = '',
			pageCounter, customGroupLogoAllowed			= false,
			pageNumber = 0;
			return Marionette.LayoutView.extend({
				initialize : function() {
					masterId 	= UrlParameter.getModuleNameFromParam(MASTERID);
					_this = this;
				}, render : function() {
					jsonObject.billId = masterId;
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/billPrintWS/getSupplementaryBillPrint.do?', _this.getResponseForPrint, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, getResponseForPrint : function(response) {
					showLayer();
					var loadelement = new Array();
					var baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);
					$.ajax({
						url: '/ivcargo/html/module/creditorInvoice/'+response.accountGroupId+'_SuppleMentryBillInvoice.html', //or your url
						success: function(data){
							$("#mainContent").load("/ivcargo/html/module/creditorInvoice/"+response.accountGroupId+"_SuppleMentryBillInvoice.html",
								function() {
									baseHtml.resolve();
						});
						}, error: function(data){
							$("#mainContent").load("/ivcargo/html/module/creditorInvoice/default_SuppleMentryBillInvoice.html",
								function() {
									baseHtml.resolve();
						});
						},
					});
						
					$.when.apply($, loadelement).done(function() {
						hideLayer();
						loadLanguageWithParams(FilePath.loadLanguage());
					});
					
					setTimeout(function(){
						_this.setInvoiceBillData(response);
						_this.setSuppleMentryBillInvoiceData(response);
						_this.setSuppleMentryBillInvoiceData2(response);
						
						_this.getHeaderAndFooterObject(response.printHeaderModel, response.customGroupLogoAllowed);
						
						window.print();window.close();
					}, 1000);
				}, setInvoiceBillData : function(response) {
					var billDetails					= response.bill;
					var totalSupplementaryAmount	= response.totalSupplementaryAmount;
					
					for(var i = 0; i < billDetails.length; i++) {
						var billObj		= billDetails[i];
						$("*[data-bill='billNumber']").html(billObj.billBillNumber);
						$("*[data-bill='billDate']").html((billObj.billCreationDateString));
						$("*[data-bill='billCreditorName']").html((billObj.billCreditorName));
						$("*[data-bill='creditorGSTN']").html((billObj.creditorGstn));
						$("*[data-bill='totalSupplementaryAmount']").html((totalSupplementaryAmount));
						$("*[data-bill='totalSupplementaryAmountInWord']").html(convertNumberToWord(totalSupplementaryAmount));
						$("*[data-bill='totalSupplementaryGrandTotal']").html(billObj.billGrandTotal);
						$("*[data-bill='creditorAddress']").html(billObj.creditorAddress);
					}
					
				},setSuppleMentryBillInvoiceData : function(response) {
					var serialNo = 1;
					var supplementaryBillDetails = response.SupplementaryBillDetails
					var classNameofSerialNo = $("*[data-supplementrybillserialno='dynamic']").attr('class');
					var classNameofDiscription = $("*[data-supplementrybilldiscription='dynamic']").attr('class');
					var classNameofAmount = $("*[data-supplementrybilamount='dynamic']").attr('class');
					var classNameofRemark = $("*[data-supplementrybillremark='dynamic']").attr('class');
					var tbody = $("#data-supplementrybill");
					
					for(var index in supplementaryBillDetails){
					var newtr2 = $("<tr/>")
					var newtdSerialNo1 = $("<td></td>");
					newtdSerialNo1.attr("class",classNameofSerialNo);
					newtdSerialNo1.html(serialNo++);	
					newtr2.append(newtdSerialNo1);

					var newtdDescription1 = $("<td></td>");
					newtdDescription1.attr("class",classNameofDiscription);
					newtdDescription1.html(supplementaryBillDetails[index].description);	
					newtr2.append(newtdDescription1);

					var newtdAmount1 = $("<td></td>");
					newtdAmount1.attr("class",classNameofAmount);
					newtdAmount1.html(supplementaryBillDetails[index].amount);
					newtr2.append(newtdAmount1);

					var newtdRemark1 = $("<td></td>");
					newtdRemark1.attr("class",classNameofRemark);
					newtdRemark1.html(supplementaryBillDetails[index].remark);
					newtr2.append(newtdRemark1);
					$(tbody).before(newtr2);

					var newtr3 = $("<tr/>")

					var newtdSerialNo2 = $("<td></td>");
					newtdSerialNo2.attr("style",'border-right: 1px solid;');	
					newtdSerialNo2.html("&nbsp");	
					newtr3.append(newtdSerialNo2);

					var newtdDescription2 = $("<td></td>");
					newtdDescription2.attr("style",'border-right: 1px solid;');
					newtdDescription2.html("&nbsp");	
					newtr3.append(newtdDescription2);

					var newtdAmount2 = $("<td></td>");
					newtdAmount2.attr("style",'border-right: 1px solid;');
					newtdAmount2.html("&nbsp");	
					newtr3.append(newtdAmount2);

					var newtdRemark2 = $("<td></td>");
					newtdRemark2.html("&nbsp");	
					newtr3.append(newtdRemark2);
					$(tbody).before(newtr3);
				  }
				},setSuppleMentryBillInvoiceData2 : function(response) {
					var supplementaryBillDetails = response.SupplementaryBillDetails
					var classNameofDiscription = $("*[data-supplementrybilldiscription='dynamic']").attr('class');
					var classNameofAmount = $("*[data-supplementrybilamount='dynamic']").attr('class');
					var classNameofRemark = $("*[data-supplementrybillremark='dynamic']").attr('class');
					var tbody = $("#data-supplementrybill2");
					for(var index in supplementaryBillDetails){
						var newtr1 = $("<tr/>")
					var newtdDescription1 = $("<td></td>");
					newtdDescription1.attr("class",classNameofDiscription);
					newtdDescription1.html(supplementaryBillDetails[index].description);	
					newtr1.append(newtdDescription1);
					
					var newtdblank1 = $("<td></td>");
					newtdblank1.attr("class",classNameofRemark);
					newtdblank1.html("");
					newtr1.append(newtdblank1);

					var newtdAmount1 = $("<td></td>");
					newtdAmount1.attr("class",classNameofAmount);
					newtdAmount1.html(supplementaryBillDetails[index].amount);
					newtr1.append(newtdAmount1);
					$(tbody).before(newtr1);
					
					var newtr3 = $("<tr/>")
					
					var newtdremark1 = $("<td></td>");
					newtdremark1.attr("class",classNameofRemark);
					newtdremark1.html("Remark :"+supplementaryBillDetails[index].remark);
					newtr3.append(newtdremark1);
					$(tbody).before(newtr3);

					var newtr2 = $("<tr/>")

					var newtdSerialNo2 = $("<td></td>");
					newtdSerialNo2.attr("style",'border-right: 1px solid;');	
					newtdSerialNo2.html("&nbsp");	
					newtr2.append(newtdSerialNo2);

					var newtdDescription2 = $("<td></td>");
					newtdDescription2.attr("style",'border-right: 1px solid;');
					newtdDescription2.html("&nbsp");	
					newtr2.append(newtdDescription2);

					var newtdAmount2 = $("<td></td>");
					newtdAmount2.attr("style",'border-right: 1px solid;');
					newtdAmount2.html("&nbsp");	
					newtr2.append(newtdAmount2);

					var newtdRemark2 = $("<td></td>");
					newtdRemark2.html("&nbsp");	
					newtr2.append(newtdRemark2);
					$(tbody).before(newtr2);
					
					var newtr4 = $("<tr/>")
					var newtdRemark2 = $("<td></td>");
					newtdRemark2.html("&nbsp");	
					newtr4.append(newtdRemark2);
					$(tbody).before(newtr4);
				  }
			}, getHeaderAndFooterObject : function(supplementaryBillHeader, customGroupLogoAllowed) {
					if(customGroupLogoAllowed) {
						if(supplementaryBillHeader.imagePath != undefined && supplementaryBillHeader.imagePath != null && supplementaryBillHeader.imagePath != 'null'){
							$(".header").css('height','130px');
							$("#imgSrc").attr('src', supplementaryBillHeader.imagePath);
							$("#imgSrc").css('width','100%');
							$("#imgSrc").css('height','130px');
							$("*[data-group]").remove();
							$("*[data-selector='branchAddressLabel']").remove();
							$("*[data-address]").remove();
							$("[data-selector='branchPhoneNumberLabel']").remove();
							$("[data-phoneNumber]").remove();
						} else {
							$("[data-group]").html(supplementaryBillHeader[$("[data-group]").attr("data-group")]);
							
							var headerbreak	= $("[data-group='name']");
							
							if (pageCounter > 1) {
								var indexToRemove = 0;
								var numberToRemove = 1;
							
								headerbreak.splice(indexToRemove, numberToRemove);
								headerbreak.each(function(){					
									$(this).attr("class","page-break");
								});
							}
							
							$("[data-address]").html(supplementaryBillHeader[$("[data-address]").attr("data-address")]);
							$("[data-phoneNumber]").html(supplementaryBillHeader[$("[data-phoneNumber]").attr("data-phoneNumber")]);
						}
					} else {
						$("[data-group]").html(supplementaryBillHeader[$("[data-group]").attr("data-group")]);
						
						var headerbreak	= $("[data-group='name']");
						
						if (pageCounter > 1) {
							var indexToRemove = 0;
							var numberToRemove = 1;
						
							headerbreak.splice(indexToRemove, numberToRemove);
							headerbreak.each(function(){					
								$(this).attr("class","page-break");
							});
						}
						
						$("[data-address]").html(supplementaryBillHeader[$("[data-address]").attr("data-address")]);
						$("[data-phoneNumber]").html(supplementaryBillHeader[$("[data-phoneNumber]").attr("data-phoneNumber")]);
					}
					
					pageCounter++;
				}
			});
		});