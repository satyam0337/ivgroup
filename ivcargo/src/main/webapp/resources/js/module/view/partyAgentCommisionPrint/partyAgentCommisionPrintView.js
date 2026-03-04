define([], function(){	
	let summeryObject	= new Object(), pageCounter	= 1;
	return {
		getConfiguration : function(configuration){
			return '/ivcargo/html/module/partyAgentCommisionPrint/' + configuration.partyAgentCommisionPrintFlavor + '.html';
		},getFilePathForLabel:function(){
			return '/ivcargo/resources/js/module/view/partyAgentCommisionPrint/partyAgentCommisionPrintFilePath.js';
		},setHeadersForPrint:function(headerData, pageNumber) {
			$("[data-group]").html(headerData[$("[data-group]").attr("data-group")]);
			let headerbreak	= $("[data-group='name']");
			
			if (pageCounter > 1) {
				let indexToRemove = 0;
				let numberToRemove = 1;
				headerbreak.splice(indexToRemove, numberToRemove);
				headerbreak.each(function(){					
					$(this).attr("class","page-break");
				});
			}
			
			$("[data-selector='branchAddressLabel']").html($("[data-selector='branchAddressLabel']").attr("data-addressLabel")+":");
			$("[data-address]").html(headerData[$("[data-address]").attr("data-address")]);
			$("[data-selector='branchPhoneNumberLabel']").html($("[data-phoneNumberLabel='branchPhoneNumberLabel']").attr("data-phoneNumberLabel")+":");

			if(headerData[$("[data-phoneNumber]").attr("data-phoneNumber")] != undefined) {
				let replacedString =  (headerData[$("[data-phoneNumber]").attr("data-phoneNumber")]).replace('-','');
				let zerosReg = /[1-9]/g;
				
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
			$("[data-info='partyAgentCommisionNumber']").html(infoData[$("[data-info='partyAgentCommisionNumber']").attr("data-info")]);
			$("[data-info='partyAgentName']").html(infoData[$("[data-info='partyAgentName']").attr("data-info")]);
			$("[data-info='partyAgentCommisionDate']").html(infoData[$("[data-info='partyAgentCommisionDate']").attr("data-info")]);
		},setDataTableDetails:function(tableData) {
			tableData.pop();
			let tbody	= $("[data-dataTableDetail='srNumber']").parent().parent();
			tbody		= (tbody[tbody.length-1]);
			let columnObjectForDetails		= $("[data-row='dataTableDetails']").children();

			for(const element of tableData) {
				let newtr = $("<tr></tr>");
				
				for(let j = 0; j < columnObjectForDetails.length; j++) {
					let newtd = $("<td></td>");
					let dataPicker = $(columnObjectForDetails[j]).attr("data-dataTableDetail");
					$(newtd).attr("class",$(columnObjectForDetails[j]).attr("class"));
					$(newtd).attr("data-dataTableDetail",$(columnObjectForDetails[j]).attr("data-dataTableDetail"));						
					$(newtd).html(element[dataPicker]);
					$(newtr).append($(newtd));
				}

				$(tbody).before(newtr);
			}

			$("[data-row='dataTableDetails']").remove();
		},setFooterDiv:function(footerData) {
//			$("[data-info='lsRemark']").html(footerData[$("[data-info='lsRemark']").attr("data-info")]);

			setTimeout(function(){window.print();},200);
		}
	}
});