define([], function(){	
	var pageCounter	= 1
	return {
		getConfiguration : function(podDispatchPrintFlavor) {
			return 'text!/ivcargo/html/module/podwaybills/podDispatchPrint/' + podDispatchPrintFlavor + '.html';
		}, getFilePathForLabel : function() {
			return '/ivcargo/resources/js/module/view/podwaybills/poddispatchprint/podDispatchPrintFilePath.js';
		}, setHeadersForPrint : function(headerData, isHeaderDisplayOnNextPage, pageNumber, customGroupLogoAllowed) {
			var pageNo = Number(pageNumber) + Number(1);

			if(customGroupLogoAllowed == 'true'){
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
				}else{
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
					$("[data-selector='branchAddressLabel']").html($("[data-selector='branchAddressLabel']").attr("data-addressLabel")+":");
					$("[data-address]").html(headerData[$("[data-address]").attr("data-address")]);
					$("[data-selector='branchPhoneNumberLabel']").html($("[data-phoneNumberLabel='branchPhoneNumberLabel']").attr("data-phoneNumberLabel")+":");

				}
			}else{
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
				$("[data-selector='branchAddressLabel']").html($("[data-selector='branchAddressLabel']").attr("data-addressLabel")+":");
				$("[data-address]").html(headerData[$("[data-address]").attr("data-address")]);
				$("[data-selector='branchPhoneNumberLabel']").html($("[data-phoneNumberLabel='branchPhoneNumberLabel']").attr("data-phoneNumberLabel")+":");
			}
			
			if((isHeaderDisplayOnNextPage == 'false' || isHeaderDisplayOnNextPage == false) && (pageNo > 1)){
				$("*[data-group]:not(:first)").remove();
				$("*[data-selector='branchAddressLabel']:not(:first)").remove();
				$("*[data-address]:not(:first)").remove();

				//$("[data-selector='branchAddressLabel']").remove();
				//$("[data-address]").remove();
				$("[data-selector='branchPhoneNumberLabel']:not(:first)").remove();
				$("[data-phoneNumber]:not(:first)").remove();
				$('.reportHeaderType:not(:first)').each(function(){$(this).empty()});
				$("[data-selector='dispatchNumberLabel']:not(:first)").remove();
				$("[data-info='dispatchNumber']:not(:first)").remove();
				$("[data-selector='vehicleNumberLabel']:not(:first)").remove();
				$("[data-info='vehicleNumber']:not(:first)").remove();
				$("[data-selector='dispatchDateLabel']:not(:first)").remove();
				$("[data-info='dispatchDate']:not(:first)").remove();
				$("[data-info='date']:not(:first)").remove();
				$("[data-info='time']:not(:first)").remove();
				$("[data-selector='fromBranchLabel']:not(:first)").remove();
				$("[data-info='fromBranch']:not(:first)").remove();
				$("[data-selector='toBranchLabel']:not(:first)").remove();
				$("[data-info='toBranch']:not(:first)").remove();
			}

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

			pageCounter++;

		},setInformationDivs:function(infoData) {
			$("[data-info='podDispatchNumber']").html(infoData[$("[data-info='podDispatchNumber']").attr("data-info")]);
			$("[data-info='podDispatchDate']").html(infoData[$("[data-info='podDispatchDate']").attr("data-info")]);
			$("[data-info='podDispatchFromBranch']").html(infoData[$("[data-info='podDispatchFromBranch']").attr("data-info")]);
			$("[data-info='podDispatchToBranch']").html(infoData[$("[data-info='podDispatchToBranch']").attr("data-info")]);

		},setDataTableDetails:function(tableData) {
			var lastItrObj	= tableData[tableData.length - 1];
			tableData.pop();
			var tbody	= $("[data-dataTableDetail='srNumber']").parent().parent();
			tbody		= (tbody[tbody.length-1]);
			columnObjectForDetails		= $("[data-row='dataTableDetails']").children();

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
		}
	}
});