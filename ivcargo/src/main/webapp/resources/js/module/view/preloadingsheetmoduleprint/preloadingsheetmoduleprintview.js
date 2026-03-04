define([], function(){	
	var
	summeryObject				= new Object();
	pageCounter	= 1,
	amount = 0,
	paidBookingTotal = 0,
	toPayBookingTotal = 0,
	tbbBookingTotal  = 0
	paidAmount = 0;
	return {
		getConfiguration : function(configuration){
			var josnObject = new Object();
			josnObject.preLoadingSheetPrint_1 	= 'text!/ivcargo/html/module/preloadingsheetmoduleprint/defaultPreloadingSheetModulePrint.html';

			if (josnObject != null && josnObject[configuration.preLoadingSheetPrintFlavor] != undefined) {
				return josnObject[configuration.preLoadingSheetPrintFlavor];
			} else {
				return '';
			}

		},getFilePathForLabel:function(configuration){
			var josnObject = new Object();

			josnObject.preLoadingSheetPrint_1 	= '/ivcargo/resources/js/module/view/preloadingsheetmoduleprint/preloadingSheetModulePrint_default_FilePath.js';

			if (josnObject != null && josnObject[configuration.preLoadingSheetPrintFlavor] != undefined) {
				return josnObject[configuration.preLoadingSheetPrintFlavor];
			} else {
				return '';
			}

		},setHeadersForPrint:function(headerData,pageNumber,showHeader,removeHeader) {
			var pageNo = Number(pageNumber)+Number(1);
			
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
			
			if(removeHeader == true){
				$('#header').remove();
			}

			pageCounter++;

		},setInformationDivs:function(infoData) {
			$("[data-info='DispatchNumber']").html(infoData[$("[data-info='DispatchNumber']").attr("data-info")]);
			$("[data-info='DispatchDate']").html(infoData[$("[data-info='DispatchDate']").attr("data-info")]);
			$("[data-info='DispatchFromBranch']").html(infoData[$("[data-info='DispatchFromBranch']").attr("data-info")]);
		},setDataTableDetails:function(tableData,WayBillTypeConstant,showPaidColumn,showToPayColumn,showTBBColumn) {
			
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
			setTimeout(function(){window.print();},200);
		}
	}
});