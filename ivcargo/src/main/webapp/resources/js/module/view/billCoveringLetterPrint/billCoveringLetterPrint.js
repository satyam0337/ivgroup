define([
        PROJECT_IVUIRESOURCES + '/resources/js/generic/urlparameter.js',
        PROJECT_IVUIRESOURCES + '/resources/js/module/view/billCoveringLetterPrint/billCoveringLetterPrintsetup.js',
        'JsonUtility',
        'messageUtility',
        'jquerylingua',
        'language'
	], function(UrlParameter, billCoveringLetterPrintsetup) {
	'use strict';// this basically give strictness to this specific js
	let masterId = "0",
	jsonObject	= new Object(),
	pageBreaker,
	pageCounter,
	configuration,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			//masterid is fetched and passed when the view is called and it is set to fetch it from webservice
			masterId 	= UrlParameter.getModuleNameFromParam('billCoveringLetterId');
			_this 		= this;
		}, render : function() {
			jsonObject.billCoveringLetterId = masterId;
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/billPrintWS/getBillCoveringLetterPrint.do?', _this.setPrintDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setPrintDetails : function(response) {
			hideLayer();
			let headerFooterData		= _this.getHeaderAndFooterObject(response.PrintHeaderModel);
			let billCoveringLetterData	= _this.getBillCoveringLetterData(response.BillCoveringLetter, response.billPrintModel);
			let tableData				= _this.getArrayForTableDetails(response.billPrintModel);
			configuration				=  response.configuration;
			
			if(configuration.lrWiseBillCoveringTableDetails){
				tableData	= _.sortBy(tableData, 'wayBillInfoWayBillId');
				tableData 	= _this.setSrNumber(tableData);
					
				require(['text!' + billCoveringLetterPrintsetup.getConfiguration(configuration),
				         billCoveringLetterPrintsetup.getFilePathForLabel()], function(View, FilePath){
					pageBreaker		= 42;
	
					pageCounter		= Math.round(tableData.length/pageBreaker);
	
					let lastItrObj	= new Object();
					lastItrObj.lastITR	= false;
					
					let pageNumber = 0;
					
					if (pageCounter <= 0) {
						lastItrObj.lastITR	= true;
						_this.$el.html(_.template(View));
						
						billCoveringLetterPrintsetup.setHeadersForPrint(headerFooterData, pageNumber);
						billCoveringLetterPrintsetup.printHeaderData(headerFooterData);
						billCoveringLetterPrintsetup.setInformationDivs(billCoveringLetterData);
						tableData.push(lastItrObj);
						billCoveringLetterPrintsetup.setDataTableDetails(tableData);
	
						pageNumber++;
						$("*[data-footerpage='pageNo']").last().html(pageNumber);
						$("[data-footerpage='pagecounter']").html(pageCounter+1);
						billCoveringLetterPrintsetup.setFooterDiv(headerFooterData);
					} else {
						for (let j = 0; j < tableData.length; j += pageBreaker) {
							_this.$el.append(_.template(View));
							
							if (j+pageBreaker >= tableData.length){
								lastItrObj.lastITR = true;
							}
							
							let chunkArray = tableData.slice(j, j + pageBreaker);
							billCoveringLetterPrintsetup.setHeadersForPrint(headerFooterData, pageNumber);
							billCoveringLetterPrintsetup.printHeaderData(headerFooterData);
							billCoveringLetterPrintsetup.setInformationDivs(billCoveringLetterData);
							chunkArray.push(lastItrObj);
							billCoveringLetterPrintsetup.setDataTableDetails(chunkArray);
							pageNumber++;
							$("*[data-footerpage='pageNo']").last().html(pageNumber);
							$("[data-footerpage='pagecounter']").html(pageCounter);
						}
						
						billCoveringLetterPrintsetup.setFooterDiv(headerFooterData);
					}
							 
					loadLanguageWithParams(FilePath.loadLanguage(configuration.printFlavor));
				});	
			} else {
				_this.setTableData(response, headerFooterData, billCoveringLetterData);
			}
		},getArrayForTableDetails : function(billPrintModellist) {
			let dataArray	= new Array();
			let srNo				= 1;
			
			for (const element of billPrintModellist) {
				let dataObj	= element;

				let dataObject	= new Object();
				
				dataObject.accountGroupId       	= dataObj.accountGroupId;
				dataObject.lrNumber    				= dataObj.wayBillNumber;
				dataObject.lrSource				    = dataObj.wayBillInfoSourceBranchName;
				dataObject.lrDestination     		= dataObj.wayBillInfoDestinationBranchName;
				dataObject.lrBookingDate     		= dataObj.wayBillInfoBookingDateTimeString;
				dataObject.lrTotalAmt	      		= (dataObj.wayBillInfoGrandTotal).toFixed(2);;
			
				if(dataObj.wayBillInfoDestinationBranchId == dataObj.billBranchId)
					dataObject.mesgRemark      		= "Incoming";
				else
					dataObject.mesgRemark      		= "Outgoing";
				
				srNo++;
				dataArray.push(dataObject)
			}
			
			return dataArray;
		}, getHeaderAndFooterObject : function(printHeaderModel) {
			printHeaderModel.name					= printHeaderModel.accountGroupName;
			printHeaderModel.branchMobileNumber		= printHeaderModel.branchContactDetailMobileNumber;
			printHeaderModel.branchEmail			= printHeaderModel.branchContactDetailEmailAddress;
			printHeaderModel.contactPerson			= printHeaderModel.branchContactDetailContactPersonName;
			
			return printHeaderModel;
		}, getBillCoveringLetterData : function(billCoveringLetter, billPrintModel) {
			billCoveringLetter.date					= billCoveringLetter.creationDateTimeStr;
			billCoveringLetter.creditorName			= billPrintModel[0].corporateAccountName;
			billCoveringLetter.creditorAddress		= billPrintModel[0].corporateAccountAddress;
			billCoveringLetter.creditorGSTN			= billPrintModel[0].corporateAccountGstn;
			billCoveringLetter.billBranchName		= billPrintModel[0].billBranchName;
			billCoveringLetter.vehicleNumber		= billPrintModel[0].vehicleNumber;
			billCoveringLetter.creditorMobileNumber		= billPrintModel[0].corporateAccountMobileNumber;
			
			return billCoveringLetter;
		}, setSrNumber : function(dataArray) {
			for(let i = 0; dataArray.length > i; i++) {
				dataArray[i].srNumber	= i + 1;
			}
			
			return dataArray;
		}, setTableData : function(response, headerData, infoData) {
			let billPrintDetailArr		= _.sortBy(response.billPrintDetailArr, 'billId');
		
			require(['text!' + billCoveringLetterPrintsetup.getConfiguration(configuration), billCoveringLetterPrintsetup.getFilePathForLabel()], 
				function(View, FilePath) {
			_this.$el.html(_.template(View));
			
			billCoveringLetterPrintsetup.printHeaderData(headerData);
			billCoveringLetterPrintsetup.setInformationDivs(infoData);

			$('#billCoveringTable tbody').empty();
			$('#billCoveringTable tfoot').empty();
						
			let dataColumnArray			= new Array();
			let footerColumnarray		= new Array();
			let totalAmount				= 0;

			for(let i = 0; i < billPrintDetailArr.length; i++) {
				let obj	= billPrintDetailArr[i];
				totalAmount += obj.billGrandTotal;
				
				dataColumnArray.push("<td class='infoStyle borderRight borderLeft borderBottom font15' style='text-align: center; vertical-align: middle; width: 10%; padding: 8px;'>" + (i + 1) + "</td>");	
				dataColumnArray.push("<td class='infoStyle borderRight borderBottom font15' style='text-align: center; vertical-align: middle; width: 22%;'>" + obj.billBillNumber + "</td>");						
				dataColumnArray.push("<td class='infoStyle borderRight borderBottom font15' style='text-align: center; vertical-align: middle; width: 20%;'>" + obj.billCreationDateTimeStampString + "</td>");						
				dataColumnArray.push("<td class='infoStyle borderRight borderBottom font15' style='text-align: right; vertical-align: middle; width: 18%;padding-right: 10px;'>" + obj.billGrandTotal + "</td>");			
				dataColumnArray.push("<td class='infoStyle borderBottom borderRight font15' style='text-align: center; vertical-align: middle; width: 30%;'>" + obj.billRemark + "</td>");
				
				$('#billCoveringTable tbody').append('<tr>' + dataColumnArray.join(' ') + '</tr>');
				
				dataColumnArray	= [];
			}

			footerColumnarray.push("<td  colspan='3'</td>");		
			footerColumnarray.push("<td class='font15 borderRight borderLeft' style='text-align: right; vertical-align: middle;padding-right: 10px;border-top: 1px solid #333333; border-bottom: 1px solid #333333;'><b><span>Total Amount : " + totalAmount + "</span></b></td>");		
			footerColumnarray.push("<td></td>");		
			
			$('#billCoveringTable tfoot').append('<tr>' + footerColumnarray.join(' ') + '</tr>');
			$("*[data-bill='totalAmtInWord']").html(convertNumberToWord(totalAmount) + " Rupees Only");
			
			loadLanguageWithParams(FilePath.loadLanguage(configuration.printFlavor));
			
			setTimeout(function(){window.print();},200);
		});	
	  }
	});
});