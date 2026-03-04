/**
 * 
 */
define(['elementTemplateJs'],
       function(elementTemplateJs){
	var _this
	,headerCollection
	,shortCreditCollectionSummaryHeaderModel
	,currentDateTime
	,shortCreditCollectionSheetLedgerModel
	,stbsSummWithoutDlyCustomerIdList
	,totalNumberOfLR = 0
	,totalNumberOfArticle = 0
	,totalShortAmount = 0
	,columnArray	= new Array();;
	return({
		renderElements : function(response){
			_this = this;
			shortCreditCollectionSheetLedgerModel = _.sortBy(response.shortCreditCollectionSheetLedgerModel, 'deliveryCustomerName');
			stbsSummWithoutDlyCustomerIdList = response.stbsSummWithoutDlyCustomerIdList;
			shortCreditCollectionSummaryHeaderModel	= response.shortCreditCollectionSummaryHeaderModel;
			headerCollection = response.printHeaderModel;
			this.setDataForView();
		},setDataForView:function(){
			require(['text!/ivcargo/template/stbs/deliveredToNameWiseSTBSSummaryPrint.html'],function(shortCreditSummaryPrintHTML){
				$("#myGrid").append(shortCreditSummaryPrintHTML);
				if (shortCreditCollectionSheetLedgerModel.length > 0) {
					$('#shortCreditWithDeliveryCustomerId').css('display','block');
					for (var i=0; i<shortCreditCollectionSheetLedgerModel.length; i++) {
						var shortCreditCollection	= shortCreditCollectionSheetLedgerModel[i];
						columnArray.push("<td class='center'>" + (i+1) + "</td>");
						if(shortCreditCollection.deliveryCustomerName != undefined) {
							columnArray.push("<td class='left'>" + shortCreditCollection.deliveryCustomerName + "</td>");
						} else if(shortCreditCollection.deliveredToName != undefined) {
							columnArray.push("<td class='left'>" + shortCreditCollection.deliveredToName+ "</td>");
						} else if(shortCreditCollection.corporateAccountName != undefined) {
							columnArray.push("<td class='left'>" + shortCreditCollection.corporateAccountName  + "</td>");
						} else {
							columnArray.push("<td class='left'>" + shortCreditCollection.txnPartyName + "</td>");
						}
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

				if (stbsSummWithoutDlyCustomerIdList.length > 0) {
					$('#shortCreditWithoutDeliveryCustomerId').css('display','block');
					totalNumberOfLR = 0;totalNumberOfArticle = 0;totalShortAmount = 0
					for (var i=0; i<stbsSummWithoutDlyCustomerIdList.length; i++) {
						var shortCreditCollection	= stbsSummWithoutDlyCustomerIdList[i];
						columnArray.push("<td class='center'>" + (i+1) + "</td>");
						if(shortCreditCollection.deliveryCustomerName != undefined) {
							columnArray.push("<td class='left'>" + shortCreditCollection.deliveryCustomerName + "</td>");
						} else if(shortCreditCollection.deliveredToName != undefined) {
							columnArray.push("<td class='left'>" + shortCreditCollection.deliveredToName+ "</td>");
						} else if(shortCreditCollection.corporateAccountName != undefined) {
							columnArray.push("<td class='left'>" + shortCreditCollection.corporateAccountName  + "</td>");
						} else {
							columnArray.push("<td class='left'>" + shortCreditCollection.txnPartyName + "</td>");
						}
						columnArray.push("<td class='right'>" + shortCreditCollection.wayBillNumber + "</td>");
						columnArray.push("<td class='right'>" + shortCreditCollection.wayBillArticleQuantity + "</td>");
						columnArray.push("<td class='right'>" + shortCreditCollection.wayBillShortAmount + "</td>");
						$('#shortCreditWithoutDeliveryCustomerIdTable tr:last').after('<tr>' + columnArray.join(' ') + '</tr>');
						totalNumberOfArticle += shortCreditCollection.wayBillArticleQuantity;
						totalShortAmount += shortCreditCollection.wayBillShortAmount;
						columnArray	= [];
					}
					
					$('#blankRowShortCreditWithoutDeliveryCustomerIdTable').remove();
					columnArray.push("<th class='center'>" + "&nbsp;" + "</th>");
					columnArray.push("<th class='left'>" + "&nbsp;" + "</th>");
					columnArray.push("<th class='center'>" + "Total" + "</th>");
					columnArray.push("<th class='right'>" + totalNumberOfArticle + "</th>");
					columnArray.push("<th class='right'>" + totalShortAmount + "</th>");
					$('#shortCreditWithoutDeliveryCustomerIdTable tr:last').after('<tr style="font-size: 20px;">' + columnArray.join(' ') + '</tr>');
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
			$("*[data-heading='voucherNumber']").html(shortCreditCollectionSummaryHeaderModel.shortCreditCollLedgerNumber);
			$("*[data-heading='voucherDate']").html(shortCreditCollectionSummaryHeaderModel.shortCreditVoucherDateString);
			$("*[data-heading='collectionPerson']").html(shortCreditCollectionSummaryHeaderModel.collectionPersonName);
		}
	});
});