/**
 * 
 */
define(['elementTemplateJs'],
       function(elementTemplateJs){
	var _this
	,headerCollection
	,lsHeaderDetail
	,currentDateTime
	,shortCreditCollectionSheetLedgerModel
	,shortCreditCollectionSummaryWithoutPartyIdList
	,totalNumberOfLR = 0
	,totalNumberOfArticle = 0
	,totalShortAmount = 0
	,columnArray	= new Array();;
	return({
		renderElements : function(response){
			_this = this;
			//shortCreditCollectionSheetLedgerModel = response.shortCreditCollectionSheetLedgerModel;
			shortCreditCollectionSheetLedgerModel = _.sortBy(response.shortCreditCollectionSheetLedgerModel, 'corporateAccountName');
			shortCreditCollectionSummaryWithoutPartyIdList = response.shortCreditCollectionSummaryWithoutPartyIdList;
			headerCollection = response.printHeaderModel;
			lsHeaderDetail		= response.dispatchLSHeader;
			this.setDataForView();
		},setDataForView:function(){
			require(['text!/ivcargo/template/stbs/shortCreditSummaryPrint.html'],function(shortCreditSummaryPrintHTML){
				$("#myGrid").append(shortCreditSummaryPrintHTML);
				if (shortCreditCollectionSheetLedgerModel.length > 0) {
					$('#shortCreditWithPartyId').css('display','block');
					for (var i=0; i<shortCreditCollectionSheetLedgerModel.length; i++) {
						var shortCreditCollection	= shortCreditCollectionSheetLedgerModel[i];
						columnArray.push("<td class='center'>" + (i+1) + "</td>");
						columnArray.push("<td class='left'>" + shortCreditCollection.corporateAccountName + "</td>");
						columnArray.push("<td class='right'>" + shortCreditCollection.totalnumberOfLr + "</td>");
						columnArray.push("<td class='right'>" + shortCreditCollection.wayBillArticleQuantity + "</td>");
						columnArray.push("<td class='right'>" + shortCreditCollection.wayBillShortAmount + "</td>");
						$('#shortCreditSummaryTable tr:last').after('<tr>' + columnArray.join(' ') + '</tr>');
						totalNumberOfLR += shortCreditCollection.totalnumberOfLr;
						totalNumberOfArticle += shortCreditCollection.wayBillArticleQuantity;
						totalShortAmount += shortCreditCollection.wayBillShortAmount;
						columnArray	= [];
					}
					$('#blankRowShortCreditSummaryTable').remove();
					columnArray.push("<th class='center'>" + "&nbsp;" + "</th>");
					columnArray.push("<th class='left'>" + "Total" + "</th>");
					columnArray.push("<th class='right'>" + totalNumberOfLR + "</th>");
					columnArray.push("<th class='right'>" + totalNumberOfArticle + "</th>");
					columnArray.push("<th class='right'>" + totalShortAmount + "</th>");
					$('#shortCreditSummaryTable tr:last').after('<tr style="font-size: 20px;">' + columnArray.join(' ') + '</tr>');
					columnArray	= [];
				}
				
				if (shortCreditCollectionSummaryWithoutPartyIdList.length > 0) {
					$('#shortCreditWithoutPartyId').css('display','block');
					totalNumberOfLR = 0;totalNumberOfArticle = 0;totalShortAmount = 0
					for (var i=0; i<shortCreditCollectionSummaryWithoutPartyIdList.length; i++) {
						var shortCreditCollection	= shortCreditCollectionSummaryWithoutPartyIdList[i];
						columnArray.push("<td class='center'>" + (i+1) + "</td>");
						columnArray.push("<td class='left'>" + shortCreditCollection.txnPartyName + "</td>");
						columnArray.push("<td class='right'>" + shortCreditCollection.wayBillNumber + "</td>");
						columnArray.push("<td class='right'>" + shortCreditCollection.wayBillArticleQuantity + "</td>");
						columnArray.push("<td class='right'>" + shortCreditCollection.wayBillShortAmount + "</td>");
						$('#shortCreditWithoutPartyIdTable tr:last').after('<tr>' + columnArray.join(' ') + '</tr>');
						totalNumberOfArticle += shortCreditCollection.wayBillArticleQuantity;
						totalShortAmount += shortCreditCollection.wayBillShortAmount;
						columnArray	= [];
					}
					
					$('#blankRowShortCreditWithoutPartyIdTable').remove();
					columnArray.push("<th class='center'>" + "&nbsp;" + "</th>");
					columnArray.push("<th class='left'>" + "&nbsp;" + "</th>");
					columnArray.push("<th class='center'>" + "Total" + "</th>");
					columnArray.push("<th class='right'>" + totalNumberOfArticle + "</th>");
					columnArray.push("<th class='right'>" + totalShortAmount + "</th>");
					$('#shortCreditWithoutPartyIdTable tr:last').after('<tr style="font-size: 20px;">' + columnArray.join(' ') + '</tr>');
					columnArray	= [];
				}
				_this.setHeaderData();
				hideLayer();
				setTimeout(function(){window.print();},500);
			})
		},setHeaderData:function(){
			$("*[data-accountgroup='name']").html(headerCollection.accountGroupName);
			$("*[data-branch='name']").html(headerCollection.branchName);
			$("*[data-branch='address']").html(headerCollection.branchAddress);
			$("*[data-branch='phonenumber']").html(headerCollection.branchContactDetailPhoneNumber);
			$("*[data-heading='heading']").html('Short Credit Voucher Summary');
			$("*[data-heading='voucherNumber']").html(shortCreditCollectionSheetLedgerModel[0].shortCreditCollLedgerNumber);
			$("*[data-heading='voucherDate']").html(shortCreditCollectionSheetLedgerModel[0].shortCreditVoucherDateString);
			$("*[data-heading='collectionPerson']").html(shortCreditCollectionSheetLedgerModel[0].collectionPersonName);
		}
	});
});