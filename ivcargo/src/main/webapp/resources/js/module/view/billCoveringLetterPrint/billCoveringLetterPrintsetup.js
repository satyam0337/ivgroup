define([], function(){	
	let pageCounter					= 1;
	return {
		getConfiguration : function(configuration) {
			return '/ivcargo/html/print/billCoveringLetter/' + configuration.printFlavor + '.html';
		}, getFilePathForLabel : function() {
			return '/ivcargo/resources/js/module/view/billCoveringLetterPrint/billCoverLetterPrintFilePath.js';
		}, setHeadersForPrint : function(headerData, pageNumber) {
			let headerbreak	= $("[data-group='name']");
		
			if (pageCounter > 1) {
				let indexToRemove = 0;
				let numberToRemove = 1;
				headerbreak.splice(indexToRemove, numberToRemove);
				headerbreak.each(function(){					
					$(this).attr("class","page-break font33");
				});
			}
			
			pageCounter++;
		}, printHeaderData : function(headerData) {
			$("[data-group]").html(headerData.accountGroupName);
			$("*[data-group='name']").html(headerData.accountGroupName);
			$("[data-address]").html(headerData[$("[data-address]").attr("data-address")]);
			$("*[data-address='branchAddress']").html(headerData.branchAddress);
			
			setCompanyLogos(headerData.accountGroupId)

			if(headerData[$("[data-phoneNumber]").attr("data-phoneNumber")] != undefined) {
				let replacedString = (headerData[$("[data-phoneNumber]").attr("data-phoneNumber")]).replace('-','');
				let zerosReg = /[1-9]/g;
		
				if(zerosReg.test(replacedString))
					$("*[data-phoneNumber]").html(headerData[$("[data-phoneNumber]").attr("data-phoneNumber")]);
				else if(zerosReg.test(headerData[$("[data-mobileNumber]").attr("data-mobileNumber")]))
					$("*[data-phoneNumber]").html(headerData[$("[data-mobileNumber]").attr("data-mobileNumber")]);
			}
			
			if(headerData.phoneWithMobileNumber != undefined)
				$("*[data-account='phoneWithMobileNumber']").html((headerData.phoneWithMobileNumber).replace(',', ' / '));

			if(headerData.branchEmail != undefined)
				$("*[data-branchEmail]").html(headerData.branchEmail);
		
			if(headerData.branchGSTN != undefined)
				$("*[data-branchGSTN]").html(headerData.branchGSTN);
			
			if(headerData.contactPerson != undefined)
				$("*[data-contactPerson]").html(headerData.contactPerson);
		}, setInformationDivs : function(infoData) {
			$("*[data-info='billCoveringLetterNo']").html(infoData.billCoveringLetterNo);
			$("*[data-info='date']").html(infoData.date);
			$("*[data-info='branchName']").html(infoData.branchName);
			$("*[data-info='vehicleNumber']").html(infoData.vehicleNumber);
			$("*[data-info='creditorName']").html(infoData.creditorName);
			$("*[data-info='creditorAddress']").html(infoData.creditorAddress);
			$("*[data-info='creditorGSTN']").html(infoData.creditorGSTN);
			$("*[data-info='billBranchName']").html(infoData.billBranchName);
			$("*[data-info='dispatchByType']").html(infoData.dispatchByType);
			$("*[data-bill='remark']").html(infoData.remark);
		    $("*[data-bill='personName']").html(infoData.personName != undefined ? infoData.personName : "");
		    $("*[data-info='creditorMobileNumber']").html(infoData.creditorMobileNumber != null ? infoData.creditorMobileNumber : "");

		}, setDataTableDetails : function(tableData) {
			let lastItrObj				= tableData[tableData.length - 1];
			tableData.pop();
			let tbody					= $("[data-dataTableDetail='srNumber']").parent().parent();
			tbody						= (tbody[tbody.length-1]);
			columnObjectForDetails		= $("[data-row='dataTableDetails']").children();
			let dataTable				= $("#dataTable").clone();
			let lrAmtTotalCol			= 0;
			
			if(lastItrObj.lastITR == false || lastItrObj.lastITR == 'false')
				$('.lastPage').css('display','none');
			
			$(dataTable).removeClass('hide');
			$(dataTable).addClass('bold');
			$(tbody).before(dataTable);

			for(const element1 of tableData) {
				let newtr 				= $("<tr></tr>");
				
				for(const element of columnObjectForDetails) {
					let newtd 			= $("<td></td>");
					let dataPicker 		= $(element).attr("data-dataTableDetail");
				
					$(newtd).attr("class", $(element).attr("class"));
					$(newtd).attr("data-dataTableDetail", $(element).attr("data-dataTableDetail"));
				
					if(dataPicker == 'lrTotalAmt')
						lrAmtTotalCol	+= Number(element1[dataPicker]);
				
					$(newtd).html(element1[dataPicker]);
					$(newtr).append($(newtd));
				}

				$(tbody).before(newtr);
			}

			$("[data-dataTableTotalDetail='lrCoulumnTotalAmt']").html((lrAmtTotalCol).toFixed(2));
			$("[data-row='dataTableDetails']").remove();
		}, setFooterDiv : function(footerData) {
			$("[data-info='remark']").html(footerData[$("[data-info='remark']").attr("data-info")]);

			setTimeout(function(){window.print();},200);
		}
	}
});