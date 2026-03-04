define([], function(){	
	var
	pageCounter	= 1
	return {
		getConfiguration : function(configuration) {
			let path	= '/ivcargo/html/module/agentCommisionBillingPrint/' + configuration.agentCommisionBillingPrintFlavor + '.html';
			
			if(urlExists(path))
				return path;
			
			return '/ivcargo/html/module/agentCommisionBillingPrint/agentCommisionBillingPrint.html';
		}, getFilePathForLabel : function() {
			return '/ivcargo/resources/js/module/view/agentCommisionBillingPrint/agentCommisionBillingPrint_FilePath.js';
		}, setHeadersForPrint : function(headerData, pageNumber) {
			var pageNo = Number(pageNumber) + Number(1);

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

			pageCounter++;

		},setInformationDivs:function(infoData) {
			$("[data-info='agentCommisionBillingBranch']").html(infoData[$("[data-info='agentCommisionBillingBranch']").attr("data-info")]);
			$("[data-info='agentCommisionBillingNumber']").html(infoData[$("[data-info='agentCommisionBillingNumber']").attr("data-info")]);
			$("[data-info='agentCommisionBillingCollectionPersonName']").html(infoData[$("[data-info='agentCommisionBillingCollectionPersonName']").attr("data-info")]);
			$("[data-info='agentCommisionBillingCreationDateTimeStr']").html(infoData[$("[data-info='agentCommisionBillingCreationDateTimeStr']").attr("data-info")]);
			$("[data-info='agentCommisionBillingExecutiveName']").html(infoData[$("[data-info='agentCommisionBillingExecutiveName']").attr("data-info")]);
			$("[data-info='agentCommisionBillingRemark']").html(infoData[$("[data-info='agentCommisionBillingRemark']").attr("data-info")]);
			$("[data-info='agentCommisionBillingFromDateStr']").html(infoData[$("[data-info='agentCommisionBillingFromDateStr']").attr("data-info")]);
			$("[data-info='agentCommisionBillingToDateStr']").html(infoData[$("[data-info='agentCommisionBillingToDateStr']").attr("data-info")]);
			$("[data-info='agentCommisionBillingStatusType']").html(infoData[$("[data-info='agentCommisionBillingStatusType']").attr("data-info")]);

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
		},setBookingDataTableDetails:function(bookingtableData) {
			if(bookingtableData.length == 1){
				$('.bookingTable').addClass('hide');
			}
			var lastItrObj	= bookingtableData[bookingtableData.length - 1];
			bookingtableData.pop();
			var tbody	= $("[data-bookingDataTableDetail='srNumber']").parent().parent();
			tbody		= (tbody[tbody.length-1]);
			columnObjectForDetails		= $("[data-row='bookingDataTableDetails']").children();
			for(var i=0;i<bookingtableData.length;i++){
				var newtr = $("<tr></tr>");
				for(var j=0;j<columnObjectForDetails.length;j++){
					var newtd = $("<td></td>");
					var dataPicker = $(columnObjectForDetails[j]).attr("data-bookingDataTableDetail");
					$(newtd).attr("class",$(columnObjectForDetails[j]).attr("class"));
					$(newtd).attr("data-bookingDataTableDetail",$(columnObjectForDetails[j]).attr("data-bookingDataTableDetail"));						
					$(newtd).html(bookingtableData[i][dataPicker]);
					$(newtr).append($(newtd));
				}

				$(tbody).before(newtr);
			}

			$("[data-row='bookingDataTableDetails']").remove();
		},setDeliveryDataTableDetails:function(deliverytableData) {
			if(deliverytableData.length == 1){
				$('.deliveryTable').addClass('hide');
			}
			var lastItrObj	= deliverytableData[deliverytableData.length - 1];
			deliverytableData.pop();
			var tbody	= $("[data-deliveryDataTableDetail='srNumber']").parent().parent();
			tbody		= (tbody[tbody.length-1]);
			columnObjectForDetails		= $("[data-row='deliveryDataTableDetails']").children();
			for(var i=0;i<deliverytableData.length;i++){
				var newtr = $("<tr></tr>");
				for(var j=0;j<columnObjectForDetails.length;j++){
					var newtd = $("<td></td>");
					var dataPicker = $(columnObjectForDetails[j]).attr("data-deliveryDataTableDetail");
					$(newtd).attr("class",$(columnObjectForDetails[j]).attr("class"));
					$(newtd).attr("data-deliveryDataTableDetail",$(columnObjectForDetails[j]).attr("data-deliveryDataTableDetail"));						
					$(newtd).html(deliverytableData[i][dataPicker]);
					$(newtr).append($(newtd));
				}

				$(tbody).before(newtr);
			}

			$("[data-row='deliveryDataTableDetails']").remove();
		},setDataTableTotals:function(tableData,lastItrObj) {
			var freightAmtTotal = 0,commissionReceivableTotal = 0,commissionPayableTotal = 0,totalCommissionTotal = 0;
			for(var i=0;i<tableData.length;i++){
				freightAmtTotal	+= tableData[i].freightAmt;
				commissionReceivableTotal	+= tableData[i].commissionReceivable;
				commissionPayableTotal	+= tableData[i].commissionPayable;
				totalCommissionTotal   += tableData[i].totalCommission;
			}
			
			$("[data-info='freightAmtTotal']").html(Math.round(freightAmtTotal));
			$("[data-info='commissionReceivableTotal']").html(Math.round(commissionReceivableTotal));
			$("[data-info='commissionPayableTotal']").html(Math.round(commissionPayableTotal));
			$("[data-info='totalCommissionTotal']").html(Math.round(totalCommissionTotal));
			if(lastItrObj.lastITR == false || lastItrObj.lastITR == 'false'){
				$('.lastPage').css('display','none');
			}
		},setFooterDiv:function(footerData) {
			setTimeout(function(){window.print();},200);
		}
	}
});