define([], function(){	
	var
	summeryObject				= new Object();
	pageCounter	= 1
	return {
		getConfiguration : function(configuration){
		
			return  'text!/ivcargo/html/print/consolidatedBLHPV/'+configuration.printFlavor+'.html';
		},getFilePathForLabel:function(configuration){
			return  '/ivcargo/resources/js/module/view/consolidatedBLHPVPrint/'+configuration.printFlavor+'_FilePath.js';
		},setHeadersForPrint:function(headerData,pageNumber,removeHeader,customGroupLogoAllowed) {
			var pageNo = Number(pageNumber)+Number(1);
			if(removeHeader == 'true' || removeHeader == true) {
				$("[data-group]").html('&nbsp;');
				$("h4").empty();
				$('.header').addClass("page-break");
				$( ".header" ).first().removeClass("page-break");
				pageCounter++;
			} else {
				
				if (customGroupLogoAllowed == true || customGroupLogoAllowed == 'true')	{
					if(headerData.imagePath != undefined || headerData.imagePath != null || headerData.imagePath != 'null'){
						
						$(".header").css('height','130px');
						$("#imgSrc").attr('src', headerData.imagePath);
						$("#imgSrc").css('width','100%');
						$("#imgSrc").css('height','130px');
						$("*[data-group]").remove();
						$("*[data-selector='branchAddressLabel']").remove();
						$("*[data-address]").remove();
						$("[data-selector='branchPhoneNumberLabel']").remove();
						$("[data-phoneNumber]").remove();
				}else {
					$("[data-group]").html(headerData[$("[data-group]").attr("data-group")]);
					$("[data-selector='branchAddressLabel']").html($("[data-selector='branchAddressLabel']").attr("data-addressLabel")+":");
					$("[data-address]").html(headerData[$("[data-address]").attr("data-address")]);
					$("[data-selector='branchPhoneNumberLabel']").html($("[data-phoneNumberLabel='branchPhoneNumberLabel']").attr("data-phoneNumberLabel")+":");
					if(headerData[$("[data-phoneNumber]").attr("data-phoneNumber")] != undefined) {
						var replacedString =  (headerData[$("[data-phoneNumber]").attr("data-phoneNumber")]).replace('-','');
						var zerosReg = /[1-9]/g;
						if(zerosReg.test(replacedString)){
							$("[data-phoneNumber]").html(headerData[$("[data-phoneNumber]").attr("data-phoneNumber")]);
						} else if(zerosReg.test(headerData[$("[data-mobileNumber]").attr("data-mobileNumber")])){
							$("[data-phoneNumber]").html(headerData[$("[data-mobileNumber]").attr("data-mobileNumber")]);
						} else {
							$("[data-phoneNumber]").html('');
						}
					}
				}
			}else {
				$("[data-selector='branchAddressLabel']").html($("[data-selector='branchAddressLabel']").attr("data-addressLabel")+":");
				$("[data-address]").html(headerData[$("[data-address]").attr("data-address")]);
				$("[data-selector='branchPhoneNumberLabel']").html($("[data-phoneNumberLabel='branchPhoneNumberLabel']").attr("data-phoneNumberLabel")+":");

				if(headerData[$("[data-phoneNumber]").attr("data-phoneNumber")] != undefined) {
					var replacedString =  (headerData[$("[data-phoneNumber]").attr("data-phoneNumber")]).replace('-','');
					var zerosReg = /[1-9]/g;
					if(zerosReg.test(replacedString)){
						$("[data-phoneNumber]").html(headerData[$("[data-phoneNumber]").attr("data-phoneNumber")]);
					} else if(zerosReg.test(headerData[$("[data-mobileNumber]").attr("data-mobileNumber")])){
						$("[data-phoneNumber]").html(headerData[$("[data-mobileNumber]").attr("data-mobileNumber")]);
					} else {
						$("[data-phoneNumber]").html('');
					}
				}
			}	
			$("[data-group]").html(headerData[$("[data-group]").attr("data-group")]);
			var headerbreak	= $("[data-group='name']");
			if (pageCounter > 1) {
				var indexToRemove = 0;
				var numberToRemove = 1;
				headerbreak.splice(indexToRemove, numberToRemove);
				headerbreak.each(function(){					
					$(this).attr("class","page-break");
				});
			}
			pageCounter++;
	    }
		},setInformationDivs:function(infoData) {
			$("[data-info='consolidatedBLHPVNo']").html(infoData[$("[data-info='consolidatedBLHPVNo']").attr("data-info")]);
			$("[data-info='currentDate']").html(infoData[$("[data-info='currentDate']").attr("data-info")]);
			$("[data-info='currentTime']").html(infoData[$("[data-info='currentTime']").attr("data-info")]);	
			$("[data-info='branchName']").html(infoData[$("[data-info='branchName']").attr("data-info")]);
			$("[data-info='vehicleNumber']").html(infoData[$("[data-info='vehicleNumber']").attr("data-info")]);
			$("[data-info='chequeNumber']").html(infoData[$("[data-info='chequeNumber']").attr("data-info")]);
			$("[data-info='bankName']").html(infoData[$("[data-info='bankName']").attr("data-info")]);
			$("[data-info='paymentModeStr']").html(infoData[$("[data-info='paymentModeStr']").attr("data-info")]);
			$("[data-info='chequeDateString']").html(infoData[$("[data-info='chequeDateString']").attr("data-info")]);
			$("[data-info='totalAmount']").html(Math.abs(infoData[$("[data-info='totalAmount']").attr("data-info")]));
			$("[data-info='totalAmountInwords']").html(this.convertNumberToWord(Math.abs(infoData.totalAmount)));
			$("[data-info='chequeGivenBy']").html(infoData[$("[data-info='chequeGivenBy']").attr("data-info")]);
			$("[data-info='chequeGivenTo']").html(infoData[$("[data-info='chequeGivenTo']").attr("data-info")]);
			$("[data-info='chequeAmount']").html(Math.abs(infoData[$("[data-info='chequeAmount']").attr("data-info")]));
			$("[data-info='remark']").html(infoData[$("[data-info='remark']").attr("data-info")]);
			$("[data-info='totalAdvancePaid']").html(Math.abs(infoData.totalAmount));
			$("[data-info='executiveName']").html(infoData[$("[data-info='executiveName']").attr("data-info")]);
			$("[data-info='paymentMadeTo']").html(infoData[$("[data-info='paymentMadeTo']").attr("data-info")]);
			$("[data-info='branchPhnNumber']").html(infoData[$("[data-info='branchPhnNumber']").attr("data-info")]);
			$("[data-info='creationDateTime']").html(infoData[$("[data-info='creationDateTime']").attr("data-info")]);
			$("[data-info='creationTime']").html(infoData[$("[data-info='creationTime']").attr("data-info")]);
			$("[data-info='totalLorryHire']").html(Math.abs(infoData.totalLorryHire));
			$("[data-info='totalLhpvBalanceAmount']").html(Math.abs(infoData.totalLhpvBalanceAmount));
			$("[data-info='totalRefundAmount']").html(Math.abs(infoData.totalRefundAmount));
			$("[data-info='totalOtherAddAmount']").html(Math.abs(infoData.totalOtherAddAmount));
			$("[data-info='totalAdvancePaidNew']").html(Math.abs(infoData.totalAdvancePaid));
			$("[data-info='balanceAmount']").html(Math.abs(infoData[$("[data-info='balanceAmount']").attr("data-info")]));
			$("[data-info='totalTDSAmount']").html(Math.abs(infoData[$("[data-info='totalTDSAmount']").attr("data-info")]));
			$("[data-info='netPayableAmount']").html(Math.round(Math.abs(infoData.balanceAmount - infoData.totalTDSAmount)));
			
			if(infoData.totalAmount > 0){
				$("#balanceAmount").addClass("hide");
				$("#refundAmount").removeClass("hide");
			}else if(infoData.totalAmount < 0){
				$("#refundAmount").addClass("hide");
				$("#balanceAmount").removeClass("hide");
			}

			if(infoData.chequeGivenTo != undefined && infoData.chequeGivenTo != '') {
				$("#chequeGivenByCol").addClass("hide");
				$("#chequeGivenToCol").removeClass("hide");
			}else if(infoData.chequeGivenBy != undefined && infoData.chequeGivenBy != '') {
				$("#chequeGivenToCol").addClass("hide");
				$("#chequeGivenByCol").removeClass("hide");
			}
		},setDataTableDetails:function(tableData) {
			var lastItrObj	= tableData[tableData.length - 1];
			tableData.pop();
			var tbody	= $("[data-dataTableDetail='srNumber']").parent().parent();
			tbody		= (tbody[tbody.length-1]);
			columnObjectForDetails		= $("[data-row='dataTableDetails']").children();
			var dataTable	= $("#dataTable").clone();
			
			$(dataTable).removeClass('hide');
			$(dataTable).addClass('bold');
			$(tbody).before(dataTable);
			for(var i=0;i<tableData.length;i++){
				var newtr = $("<tr></tr>");
				for(var j=0;j<columnObjectForDetails.length;j++){
					var newtd = $("<td></td>");
					var dataPicker = $(columnObjectForDetails[j]).attr("data-dataTableDetail");
					$(newtd).attr("class",$(columnObjectForDetails[j]).attr("class"));
					$(newtd).attr("data-dataTableDetail",$(columnObjectForDetails[j]).attr("data-dataTableDetail"));
					$(newtd).html(tableData[i][dataPicker]);
					$(newtr).append($(newtd));
				}

				$(tbody).before(newtr);
			}

			$("[data-row='dataTableDetails']").remove();
		},setFooterDiv:function(footerData) {
			$("[data-info='lsRemark']").html(footerData[$("[data-info='lsRemark']").attr("data-info")]);

			setTimeout(function(){window.print();},200);
		},convertNumberToWord : function (totalAdvancePaid) {
			var str 	= new String(totalAdvancePaid)
			var splt 	= str.split("");
			var rev 	= splt.reverse();
			var once 	= ['Zero', ' One', ' Two', ' Three', ' Four', ' Five', ' Six', ' Seven', ' Eight', ' Nine'];
			var twos 	= ['Ten', ' Eleven', ' Twelve', ' Thirteen', ' Fourteen', ' Fifteen', ' Sixteen', ' Seventeen', ' Eighteen', ' Nineteen'];
			var tens 	= ['', 'Ten', ' Twenty', ' Thirty', ' Forty', ' Fifty', ' Sixty', ' Seventy', ' Eighty', ' Ninety'];

			numLength 	= rev.length;
			var word 	= new Array();
			var j 		= 0;

			for (i = 0; i < numLength; i++) {
				switch (i) {
				case 0:
					if ((rev[i] == 0) || (rev[i + 1] == 1)) {
						word[j] = '';
					} else {
						word[j] = '' + once[rev[i]];
					}
					word[j] = word[j];
					break;

				case 1:
					aboveTens();
					break;

				case 2:
					if (rev[i] == 0) {
						word[j] = '';
					} else if ((rev[i - 1] == 0) || (rev[i - 2] == 0)) {
						word[j] = once[rev[i]] + " Hundred ";
					} else {
						word[j] = once[rev[i]] + " Hundred and";
					}
					break;

				case 3:
					if (rev[i] == 0 || rev[i + 1] == 1) {
						word[j] = '';
					} else {
						word[j] = once[rev[i]];
					}

					if ((rev[i + 1] != 0) || (rev[i] > 0)) {
						word[j] = word[j] + " Thousand";
					}
					break;


				case 4:
					aboveTens();
					break;

				case 5:
					if ((rev[i] == 0) || (rev[i + 1] == 1)) {
						word[j] = '';
					} else {
						word[j] = once[rev[i]];
					}

					if (rev[i + 1] !== '0' || rev[i] > '0') {
						word[j] = word[j] + " Lakh";
					}

					break;

				case 6:
					aboveTens();
					break;

				case 7:
					if ((rev[i] == 0) || (rev[i + 1] == 1)) {
						word[j] = '';
					} else {
						word[j] = once[rev[i]];
					}

					if (rev[i + 1] !== '0' || rev[i] > '0') {
						word[j] = word[j] + " Crore";
					}                
					break;

				case 8:
					aboveTens();
					break;

				default: break;
				}
				j++;
			}

			function aboveTens() {
				if (rev[i] == 0) { word[j] = ''; }
				else if (rev[i] == 1) { word[j] = twos[rev[i - 1]]; }
				else { word[j] = tens[rev[i]]; }
			}

			word.reverse();
			var finalOutput = '';

			for (i = 0; i < numLength; i++) {
				finalOutput = finalOutput + word[i];
			}
			return finalOutput;
		}
	}
});