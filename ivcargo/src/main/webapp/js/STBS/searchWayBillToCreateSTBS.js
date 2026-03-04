/**
 * @Author	Anant Chaudhary 16-01-2015
 * 
 * Please include CommonJsFunction.js file
 */
var allowSTBSCreationWithoutCollectionPerson	= false;
var stbsCreationWithParty						= false;
var isShowBothOptionInPartyWiseSelection		= false;
var wayBillIdList								= [];
var wayBillTypeConstant 						= null;
var creditWayBillTxnConstant 					= null;
var stbsSelectionTypeConstant 					= null;
var allowBackDateEntryForStbsCreation			= false;
var executiveNameColumnDisplay					= false;
var invoiceNumberColumnDisplay 					= false;
var allowToValidateForSamePartyToCreateSTBSPrint	= false;
var showHsnCode								= false;
var applyTaxOnStbs							= false;

function loadSTBS(allowSTBSCreationWithoutCollPerson, STBSCreationWithParty, isShowBothOptInPartyWiseSelection, executiveNameColDisplay, invoiceNumberColDisplay,allowToValidateForSamePartyToCreateSTBS,showHsnCode,applyTaxOnStbs) {
	allowSTBSCreationWithoutCollectionPerson	= allowSTBSCreationWithoutCollPerson;
	isShowBothOptionInPartyWiseSelection		= isShowBothOptInPartyWiseSelection
	stbsCreationWithParty						= STBSCreationWithParty;
	executiveNameColumnDisplay					= executiveNameColDisplay;
	invoiceNumberColumnDisplay					= invoiceNumberColDisplay;
	allowToValidateForSamePartyToCreateSTBSPrint	= allowToValidateForSamePartyToCreateSTBS;
	showHsnCode									= showHsnCode;
	applyTaxOnStbs								= applyTaxOnStbs;
			
	if (allowSTBSCreationWithoutCollectionPerson)
		$(".searchCollectionPersonDiv").addClass('hide');

	if (!showHsnCode)
		$(".applyTaxForStbs").addClass('hide');
	if (!applyTaxOnStbs)
		$(".hsnCode").addClass('hide');
}

function searchWayBillToCreateSTBS1() {
	
	var selectiontype		= 0;
	var region				= 0;
	var subregion			= 0;
	var branch				= 0;
	var partyId				= 0;
	var fromDate			= null;
	var toDate				= null;
	var collPersonId		= 0;
	srNo 					= 0;

	if(allowSTBSCreationWithoutCollectionPerson)
		$(".searchCollectionPersonDiv").addClass('hide');
	
	if($("#partyAuto").val() == "") // checks whether the party input is empty or not
		$("#partyId").val(0);

	if(stbsCreationWithParty) {
		var selectiontype = getValueFromInputField('selectiontype');

		if(selectiontype == 1 || selectiontype == 2)
			$(".searchPartyDiv").removeClass('hide');
		else
			$(".searchPartyDiv").addClass('hide');
	}

	$('#summarytable').hide();

	if(getValueFromInputField('selectiontype') != null)
		selectiontype		= getValueFromInputField('selectiontype');

	if(getValueFromInputField('region') != null)
		region		= getValueFromInputField('region');

	if(getValueFromInputField('subRegion') != null)
		subregion	= getValueFromInputField('subRegion');

	if(getValueFromInputField('branch') != null)
		branch		= getValueFromInputField('branch');

	if(getValueFromInputField('partyId') != null)
		partyId		= getValueFromInputField('partyId');

	if(getValueFromInputField('fromDate') != null)
		fromDate		= getValueFromInputField('fromDate');

	if(getValueFromInputField('toDate') != null)
		toDate		= getValueFromInputField('toDate');

	if(getValueFromInputField('collectionPersonId') != null)
		collPersonId		= getValueFromInputField('collectionPersonId');

	var txnType = getValueFromInputField('txnType');
	var billSelectionTypeId = getValueFromInputField('billSelectionTypeId');

	if(txnType == 0) {
		showMessage('error', transactionTypeErrMsg);
		toogleElement('basicError','block');
		changeTextFieldColor('txnType', '', '', 'red');
		return false;
	}
	
	if(showBillSelectionTypeId == true || showBillSelectionTypeId == 'true'){
		if(billSelectionTypeId == 0) {
			showMessage('error', 'Please, Select Bill Type !');
			toogleElement('basicError','block');
			changeTextFieldColor('billSelectionTypeId', '', '', 'red');
			return false;
		}
	}

	if(!ValidateFormElement())
		return false;

	if(document.getElementById('DateRange') != null && document.getElementById('DateRange').checked == true)
		var url = 'AutoCompleteAjax.do?pageId=9&eventId=13&filter=25&txnType='+txnType+'&selectiontype='+selectiontype+'&region='+region+'&subRegion='+subregion+'&branch='+branch+'&partyId='+partyId+'&fromDate='+fromDate+'&toDate='+toDate+'&collPersonId='+collPersonId+'&billSelectionTypeId='+billSelectionTypeId;
	else
		var url = 'AutoCompleteAjax.do?pageId=9&eventId=13&filter=25&txnType='+txnType+'&selectiontype='+selectiontype+'&region='+region+'&subRegion='+subregion+'&branch='+branch+'&partyId='+partyId+'&collPersonId='+collPersonId+'&billSelectionTypeId='+billSelectionTypeId;

	showLayer();
	$.getJSON(url,function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription || data.norecordfound == 'Record not found !' || data.logout == 'You are logged out, Please login again !') {
					showMessage('info', data.logout);
					showMessage('info', recordNotFoundInfoMsg);
					wayBillIdList	= [];
					refreshAndHidePartOfPage('middle-border-boxshadow', 'hideAndRefresh');
					hideLayer();
				} else {
					if(Number($('#selectiontype').val()) != 2)
						wayBillIdList	= [];
					
					showPartOfPage('middle-border-boxshadow');
					getWayBillDetails(data, txnType);
					hideLayer();
				}
			});
}

function searchWayBillToCreateSTBS(event) {
	if(event.which){
		var keycode = event.which;

		if(keycode == 13) {
			var wbNo 					= getValueFromInputField('LRNumber').trim();

			if(wbNo == '') {
				showMessage('error', lrNumberErrMsg);
				setTimeout(function() {
					$("#LRNumber").focus();
				}, 200);
				return false;
			}

			if(checkValueInTableColumn('selectedLRNumbers', wbNo)) {
				showMessage('info', lrNumberAlreadyAdded(wbNo));
				return false;
			}

			var txnType = getValueFromInputField('txnType');
			var billSelectionTypeId = getValueFromInputField('billSelectionTypeId');

			if(txnType == 0) {
				showMessage('error', transactionTypeErrMsg);
				toogleElement('basicError','block');
				changeTextFieldColor('txnType', '', '', 'red');
				return false;
			}
			
			if(showBillSelectionTypeId == true || showBillSelectionTypeId == 'true'){
				if(billSelectionTypeId == 0) {
					showMessage('error', 'Please, Select Bill Type !');
					toogleElement('basicError','block');
					changeTextFieldColor('billSelectionTypeId', '', '', 'red');
					return false;
				}
			}

			showLayer();
			$.getJSON('AutoCompleteAjax.do?pageId=9&eventId=13&filter=25&WBNumber='+wbNo+'&txnType='+txnType+'&selectionFilter=1'+'&billSelectionTypeId='+billSelectionTypeId,
					 function(data) {
						if (!data || jQuery.isEmptyObject(data) || data.errorDescription || data.norecordfound == 'Record not found !' || data.logout == 'You are logged out, Please login again !') {
							showMessage('info', recordNotFoundForLrNumber(wbNo));
							showMessage('info', data.logout);
							showMessage('info', recordNotFoundInfoMsg);
							wayBillIdList	= [];
							hideLayer();
							setTimeout(function() {
								$("#LRNumber").focus();
							}, 200);

						} else {
							hideAllMessages();
							getSameWayBillDetails(data, txnType);
						
							if(stbsCreationWithParty) {
								var selectiontype = getValueFromInputField('selectiontype');

								if(selectiontype == 1 || selectiontype == 2)
									$(".searchPartyDiv").removeClass('hide');
								else
									$(".searchPartyDiv").addClass('hide');
							}

							hideLayer();
							setTimeout(function() {
								$("#LRNumber").focus();
							}, 200);
						}
					});
			hideLayer();
		}
	}
}

function getSameWayBillDetails(data, txnType) {
	var creditWayBillTxn 		= data.creditWayBillTxnCall;
	wayBillTypeConstant 		= data.WayBillTypeConstant;
	creditWayBillTxnConstant 	= data.CreditWayBillTxnConstant;
	
	if(creditWayBillTxn.length > 1) {
		emptyInnerValue('wayBillThead');
		emptyChildInnerValue('sameWayBillDetails', 'tbody');

		makeHeaderForSameWayBill();

		for(var i = 0; i < creditWayBillTxn.length; i++) {
			var credit = creditWayBillTxn[i];

			var wayBillNumber 	= credit.wayBillNumber;
			var wayBillId		= credit.wayBillId;
			var bookDate		= credit.creationDateTime;
			var srcBranch		= credit.sourceBranch;
			var desBranch		= credit.destinationBranch;
			var consinor		= credit.consignor;
			var consinee		= credit.consignee;
			var actWeight		= credit.actualWeight;
			var pakgs			= credit.quantity;
			var grandTotal		= credit.grandTotal;
			var cperName		= credit.collectionPersonName;
			var creditWayBillTxnId  = credit.creditWayBillTxnId;
			var txnTypeId		= credit.txnTypeId;
			var txnTypeName		= credit.txnTypeName;
			var executiveName    = credit.executiveName;
			var invNo			= credit.invoiceNo;

			var tableRow		= createRowInTable('', '', '');

			var checkBoxCol		= createColumnInRow(tableRow, '', 'datatd', '', 'center', '', '');
			var wayBillNumCol	= createColumnInRow(tableRow, '', 'datatd', '', 'center', '', '');
			var bookDateCol		= createColumnInRow(tableRow, '', 'datatd', '', 'center', '', '');
			var srcBranchCol	= createColumnInRow(tableRow, '', 'datatd', '', 'center', '', '');
			var desBranchCol	= createColumnInRow(tableRow, '', 'datatd', '', 'center', '', '');
			var consinorCol		= createColumnInRow(tableRow, '', 'datatd', '', 'left', '', '');
			var consineeCol		= createColumnInRow(tableRow, '', 'datatd', '', 'left', '', '');

			var checkBoxObject		= new Object();

			checkBoxObject.name		= 'checkbox1';
			checkBoxObject.type		= 'checkbox';
			checkBoxObject.value	= wayBillNumber+'_'+wayBillId+'_'+bookDate+'_'+srcBranch+'_'+desBranch+'_'+consinor+'_'+consinee+'_'+actWeight+'_'+pakgs+'_'+grandTotal+'_'+cperName+'_'+txnType+'_'+creditWayBillTxnId+'_'+txnTypeId+'_'+txnTypeName+'_'+executiveName+'_'+invNo;
			checkBoxObject.id		= 'check2';

			createInput(checkBoxCol, checkBoxObject);

			appendValueInTableCol(wayBillNumCol, wayBillNumber);
			appendValueInTableCol(bookDateCol, bookDate);
			appendValueInTableCol(srcBranchCol, srcBranch);
			appendValueInTableCol(desBranchCol, desBranch);
			appendValueInTableCol(consinorCol, consinor);
			appendValueInTableCol(consineeCol, consinee);

			appendRowInTable('sameWayBillDetails', tableRow);
		}
		
		if(data.allowBackDateEntryForStbsCreation)
			backDateForAll(data.previousDate, data.showStbsDueDate);
		else
			$('.stbsBillCreationDateEle').remove();
		if(data.showStbsDueDate)
			dueDateForAll(new Date());
		else
			$('.showStbsDueDate').remove();
		
		$("#LRNumber").focus();
		openDialog('sameWayBill');
	} else {
		$("#LRNumber").focus();
		showPartOfPage('middle-border-boxshadow');
		getWayBillDetails(data, txnType);
	}
}

function addWayBillInList() {
	var totalActWght 	= 0;
	var totalPkgs		= 0;
	var	totalAmt		= 0;
	srNo 				= 0;

	$('#summarytable').hide();

	var val	= getCheckedValue('check2');

	if(val == null) {
		showMessage('error', selectCheckBoxErrMsg);
		return false;
	}

	showPartOfPage('middle-border-boxshadow');

	var len		= countTableRow('reportTable');

	if(len <= 0) {
		makeHeaderRowForSTBS();
		changeDisplayProperty('middle-border-boxshadow', 'block');
		changeDisplayProperty('createBillButtonRow', 'block');
	}

	var	checkBoxArr		= [];
	var value			= null;
	var wayBillId 		= 0;

	checkBoxArr			= getAllCheckBoxSelectValue('checkbox1');

	for(var i = 0; i < checkBoxArr.length; i++) {
		value	= checkBoxArr[i];

		result 	= value.split('_');

		wayBillId = result[1];

		if(!(wayBillIdList.indexOf(wayBillId) > -1)) {
			addWayBillDetails(result[0], result[1], result[2], result[3], result[4], result[5], result[6], result[7], result[8], result[9], result[10], result[11], result[12], result[13], result[14], result[15],result[16],result[17],result[18]);

			totalActWght 	= totalActWght 	+ Math.round(result[7]);
			totalPkgs		= totalPkgs 	+ Math.round(result[8]);
			totalAmt		= totalAmt 		+ Math.round(result[9]);
			wayBillIdList.push(wayBillId);
		}
	}

	if(len <= 0)
		addRowForDisplayTotal(totalActWght, totalPkgs, totalAmt);
	else
		addTotal(totalActWght, totalPkgs, totalAmt);

	closeJqueryDialog('sameWayBill');

}

function addWayBillDetails(wayBillNumber, wayBillId, bookDate, srcBranch, desBranch, consinor, consinee, actWeight, pakgs, grandTotal, cperName, txnType, creditWayBillTxnId, txnTypeId, txnTypeName, wayBillTypeId,wayBillDeliveryNumber,deliveredToName,executiveName,invNo,consignorId,consigneeId,bookingDate,deliveryDate) {
	srNo++;
	var tableRow		= createRowInTable('row' + wayBillId, '', 'font-size: 12px;');
	
	var srNoCol			= createColumnInRow(tableRow, '', 'datatd', '', 'center', '', '');
	var checkBoxCol		= createColumnInRow(tableRow, '', 'datatd', '', 'center', '', '');
	var wayBillNumCol	= createColumnInRow(tableRow, '', 'datatd', '', 'center', '', '');
	
	if(isShowCrNumberColumn)
		var crNumbercol  = createColumnInRow(tableRow, '', 'datatd', '', 'center', '', '');
	
	if(showBookingDeliveryDateColumnSeparately) {
		var bookingDateCol		= createColumnInRow(tableRow, 'bookingDate_' + wayBillId, 'datatd', '', 'center', '', '');
		var deliveryDateCol		= createColumnInRow(tableRow, 'deliveryDate_' + wayBillId, 'datatd', '', 'center', '', '');
	} else
		var bookDateCol		= createColumnInRow(tableRow, 'bookDate_' + wayBillId, 'datatd', '', 'center', '', '');

	if(isShowEditLrRateLink)
		var EditLrRateCol  = createColumnInRow(tableRow, '', 'datatd', '', 'center', '', '');

	if(isShowEditArticleLink)
		var EditArticleCol = createColumnInRow(tableRow, '', 'datatd', '', 'center', '', '');
	
	var srcBranchCol	= createColumnInRow(tableRow, '', 'datatd', '', 'center', '', '');
	var desBranchCol	= createColumnInRow(tableRow, '', 'datatd', '', 'center', '', '');
	var consinorCol		= createColumnInRow(tableRow, '', 'datatd', '', 'left', '', '');
	var consineeCol		= createColumnInRow(tableRow, '', 'datatd', '', 'left', '', '');
	var actWeightCol	= createColumnInRow(tableRow, 'actWght_' + wayBillId, 'datatd', '', 'right', '', '');
	var pakgsCol		= createColumnInRow(tableRow, 'packages_' + wayBillId, 'datatd', '', 'right', '', '');
	var grandTotalCol	= createColumnInRow(tableRow, 'amount_' + wayBillId, 'datatd', '', 'right', '', '');

	if(executiveNameColumnDisplay)
		var executiveNameCol = createColumnInRow(tableRow, '', 'datatd', '', 'center', '', '');

	if(!allowSTBSCreationWithoutCollectionPerson)
		var cperNameCol		= createColumnInRow(tableRow, '', 'datatd', '', 'center', '', '');

	if(isShowDeliveredToNameColumn)
		var deliveredNamecol  = createColumnInRow(tableRow, '', 'datatd', '', 'center', '', '');

	if(isShowBothOptionInPartyWiseSelection)
		var txnTypeCol		= createColumnInRow(tableRow, '', 'datatd', '', 'left', '', '');
		
	if(invoiceNumberColumnDisplay)
		var invNoCol		= createColumnInRow(tableRow, '', 'datatd', '', 'center', '', '');

	var checkBoxObject		= new Object();

	checkBoxObject.name		= 'checkbox';
	checkBoxObject.type		= 'checkbox';
	checkBoxObject.value	= wayBillId + ';' + txnTypeId+ ';'+ creditWayBillTxnId + ';' + consignorId + ';' + consigneeId;
	checkBoxObject.id		= wayBillId;
	checkBoxObject.onclick	= 'resetError1(this);calculateSelectedTotalLRData();';

	createInput(checkBoxCol, checkBoxObject);
	appendValueInTableCol(wayBillNumCol, "<a href='#' style='cursor:pointer;' onclick='openWindowForView(" + wayBillId + ",1,0);'>"+ wayBillNumber +"</a>");
	appendValueInTableCol(srNoCol, srNo);
	
	if(isShowCrNumberColumn)
			appendValueInTableCol(crNumbercol, wayBillDeliveryNumber);
			
	
	if(showBookingDeliveryDateColumnSeparately) {
		appendValueInTableCol(bookingDateCol, bookingDate);
		appendValueInTableCol(deliveryDateCol, deliveryDate);
	} else
		appendValueInTableCol(bookDateCol, bookDate);

	if(isShowEditLrRateLink && ((wayBillTypeId == wayBillTypeConstant.WAYBILL_TYPE_PAID && txnTypeId == creditWayBillTxnConstant.TXN_TYPE_BOOKING_ID)
			|| (wayBillTypeId == wayBillTypeConstant.WAYBILL_TYPE_TO_PAY && txnTypeId == creditWayBillTxnConstant.TXN_TYPE_DELIVERY_ID))){
		var editLrRateObj		= new Object();

		editLrRateObj.name		= 'editLrRateBtn';
		editLrRateObj.class		= 'btn btn-success';
		editLrRateObj.type		= 'button';
		editLrRateObj.id		= 'editLrRateBtn';
		editLrRateObj.value		= 'Click';
		editLrRateObj.html		= 'Click';
		editLrRateObj.onclick	= 'resetError1(this);editWayBillCharges('+wayBillId+');';

		createButton(EditLrRateCol, editLrRateObj);
	}
	
	if(isShowEditArticleLink){
		var editArticleObj		= new Object();

		editArticleObj.name		= 'editArticleBtn';
		editArticleObj.class	= 'btn btn-success';
		editArticleObj.type		= 'button';
		editArticleObj.id		= 'editArticleBtn';
		editArticleObj.value	= 'Click';
		editArticleObj.html		= 'Click';
		editArticleObj.onclick	= 'resetError1(this);updateConsignment('+wayBillId+')';

		createButton(EditArticleCol, editArticleObj);
	}
	
	appendValueInTableCol(srcBranchCol, srcBranch);
	appendValueInTableCol(desBranchCol, desBranch);
	appendValueInTableCol(consinorCol, consinor);
	appendValueInTableCol(consineeCol, consinee);
	appendValueInTableCol(actWeightCol, Math.round(actWeight));
	appendValueInTableCol(pakgsCol, pakgs);
	appendValueInTableCol(grandTotalCol, Math.round(grandTotal));
	
	if(executiveNameColumnDisplay)
		appendValueInTableCol(executiveNameCol, executiveName);

	if(!allowSTBSCreationWithoutCollectionPerson)
		appendValueInTableCol(cperNameCol, cperName);

	if(isShowDeliveredToNameColumn)
			appendValueInTableCol(deliveredNamecol, deliveredToName);

	if(isShowBothOptionInPartyWiseSelection)
		appendValueInTableCol(txnTypeCol, txnTypeName);
	
	if(invoiceNumberColumnDisplay)
		appendValueInTableCol(invNoCol, invNo);

	var selectedLrRow		= createRowInTable('lrRow' + wayBillId, '', 'display: none;');
	var selectedLrCol		= createColumnInRow(selectedLrRow, '', '', '', '', '', '');

	appendValueInTableCol(selectedLrCol, wayBillNumber);
	appendRowInTable('selectedLRNumbers', selectedLrRow);

    //save selected LR in other table
    
    appendRowInTable('billBody', tableRow);
}

function getWayBillDetails(data, txnType) {
	var totalActWght 	= 0;
	var totalPkgs		= 0;
	var	totalAmt		= 0;

	var creditWayBillTxn 					= data.creditWayBillTxnCall
	wayBillTypeConstant 					= data.WayBillTypeConstant;
	creditWayBillTxnConstant 				= data.CreditWayBillTxnConstant;
	
	if(creditWayBillTxn.length > 0) {
		var len		= countTableRow('reportTable');

		if(len <= 0)
			makeHeaderRowForSTBS();

		if(Number($('#selectiontype').val()) != 2)
			$('#billBody').empty();
		
		if(data.STBSSelectionTypeConstant != undefined)
			stbsSelectionTypeConstant = data.STBSSelectionTypeConstant;

		for(var i = 0; i < creditWayBillTxn.length; i++) {
			var credit = creditWayBillTxn[i];

			var wayBillNumber 	= credit.wayBillNumber;
			var wayBillId		= credit.wayBillId;
			var bookDate		= credit.creationDateTime;
			var srcBranch		= credit.sourceBranch;
			var desBranch		= credit.destinationBranch;
			var consinor		= credit.consignor;
			var consinee		= credit.consignee;
			var actWeight		= credit.actualWeight;
			var pakgs			= credit.quantity;
			var grandTotal		= credit.grandTotal;
			var cperName		= credit.collectionPersonName;
			var creditWayBillTxnId = credit.creditWayBillTxnId;
			var txnTypeId		= credit.txnTypeId;
			var txnTypeName		= credit.txnTypeName;
			var wayBillTypeId	= credit.wayBillTypeId;
			var wayBillDeliveryNumber	= credit.wayBillDeliveryNumber;
			var deliveredToName	= credit.deliveredToName;
			var executiveName	= credit.executiveName;
			var invNo			= credit.invoiceNo;
			var consignorId		= credit.consignorId;
			var consigneeId		= credit.consigneeId;
			var bookingDate		= credit.bkgDateTime;
			var deliveryDate	= credit.deliveryDateTime;
			
			if(!(wayBillIdList.indexOf(wayBillId) > -1)) {
				addWayBillDetails(wayBillNumber, wayBillId, bookDate, srcBranch, desBranch, consinor, consinee, actWeight, pakgs, grandTotal, cperName, txnType, creditWayBillTxnId, txnTypeId, txnTypeName, wayBillTypeId,wayBillDeliveryNumber,deliveredToName,executiveName,invNo,consignorId,consigneeId,bookingDate,deliveryDate);
				totalActWght 	= totalActWght 	+ Math.round(actWeight);
				totalPkgs		= totalPkgs 	+ Math.round(pakgs);
				totalAmt		= totalAmt 		+ Math.round(grandTotal);
				wayBillIdList.push(wayBillId);
			}
		}
	}

	if(len <= 0)
		addRowForDisplayTotal(totalActWght, totalPkgs, totalAmt);
	else
		addTotal(totalActWght, totalPkgs, totalAmt);

	changeDisplayProperty('createBillButtonRow', 'inline');

	if(data.allowBackDateEntryForStbsCreation)
		backDateForAll(data.previousDate, data.showStbsDueDate);
	else
		$('.stbsBillCreationDateEle').remove();
		
	if(data.showStbsDueDate)
		dueDateForAll(new Date());
	else
		$('.showStbsDueDate').remove();
}

function addTotal(totalActWght, totalPkgs, totalAmt) {
	var actWeight		= getValueFromHtmlTag('totalActWght');
	var pakgs			= getValueFromHtmlTag('totalPkgs');
	var grandTotal		= getValueFromHtmlTag('totalAmt');

	setValueToHtmlTag('totalActWght', Number(totalActWght) + Number(actWeight));
	
	if($("#selectiontype").val() == stbsSelectionTypeConstant.BRANCHES_ID || $("#selectiontype").val() == stbsSelectionTypeConstant.PARTY_WISE_ID || $("#selectiontype").val() == stbsSelectionTypeConstant.COLLECTION_PERSON_WISE_ID){
		setValueToHtmlTag('totalActWght', Number(totalActWght));
		setValueToHtmlTag('totalPkgs', Number(totalPkgs));
		setValueToHtmlTag('totalAmt', Number(totalAmt) );
	} else {
		setValueToHtmlTag('totalActWght', Number(totalActWght) + Number(actWeight));
		setValueToHtmlTag('totalPkgs', Number(totalPkgs) + Number(pakgs));
		setValueToHtmlTag('totalAmt', Number(totalAmt) + Number(grandTotal));
	}
}

function addRowForDisplayTotal(totalActWght, totalPkgs, totalAmt) {

	removeChildEleFromParent('rowForTotal');

	var totalRow		= createRowInTable('rowForTotal', '', 'background-color: #D0D0D0');

	var totalCol		= createColumnInRow(totalRow, '', 'datatd', '', 'center', 'font-weight: bold;background-color : #F7FBFF;', '');
	var blankCol4		= createColumnInRow(totalRow, '', 'datatd', '', '', 'background-color : #F7FBFF;', '');

	if(isShowCrNumberColumn)
		var blankColCr		= createColumnInRow(totalRow, '', 'datatd', '', '', 'background-color : #F7FBFF;', '');
	
	if(showBookingDeliveryDateColumnSeparately)
		var blankCol		= createColumnInRow(totalRow, '', 'datatd', '', '', 'background-color : #F7FBFF;', '');
	
	if(isShowEditLrRateLink || isShowEditArticleLink)
		var blankCol		= createColumnInRow(totalRow, '', 'datatd', '', '', 'background-color : #F7FBFF;', '8');
	else
		var blankCol		= createColumnInRow(totalRow, '', 'datatd', '', '', 'background-color : #F7FBFF;', '6');

	var totalActWghtCol	= createColumnInRow(totalRow, 'totalActWght', 'datatd', '', 'right', 'font-weight: bold;background-color : #F7FBFF;', '');
	var totalPkgsCol	= createColumnInRow(totalRow, 'totalPkgs', 'datatd', '', 'right', 'font-weight: bold;background-color : #F7FBFF;', '');
	var totalAmtCol		= createColumnInRow(totalRow, 'totalAmt', 'datatd', '', 'right', 'font-weight: bold;background-color : #F7FBFF;', '');

	if(!allowSTBSCreationWithoutCollectionPerson)
		var blankCol1		= createColumnInRow(totalRow, '', 'datatd', '', '', 'background-color : #F7FBFF;', '');
		
	if(isShowDeliveredToNameColumn){
		var blankColdelName		= createColumnInRow(totalRow, '', 'datatd', '', '', 'background-color : #F7FBFF;', '');
	}

	if(isShowBothOptionInPartyWiseSelection)
		var blankCol2		= createColumnInRow(totalRow, '', 'datatd', '', '', 'background-color : #F7FBFF;', '');
		
	if(executiveNameColumnDisplay)
		var blankCol3		= createColumnInRow(totalRow, '', 'datatd', '', '', 'background-color : #F7FBFF;', '');
		
	if(invoiceNumberColumnDisplay)
		var blankCol5		= createColumnInRow(totalRow, '', 'datatd', '', '', 'background-color : #F7FBFF;', '');

	appendValueInTableCol(blankCol4, '');
	
	if(isShowCrNumberColumn)
		appendValueInTableCol(blankColCr, '');
		
	if(showBookingDeliveryDateColumnSeparately)
		appendValueInTableCol(blankCol, '');
	
	appendValueInTableCol(totalCol, 'Total');
	appendValueInTableCol(blankCol, '');
	appendValueInTableCol(totalActWghtCol, totalActWght);
	appendValueInTableCol(totalPkgsCol, totalPkgs);
	appendValueInTableCol(totalAmtCol, totalAmt);

	if(!allowSTBSCreationWithoutCollectionPerson)
		appendValueInTableCol(blankCol1, '');
		
	if(isShowDeliveredToNameColumn)
		appendValueInTableCol(blankColdelName, '');

	if(isShowBothOptionInPartyWiseSelection)
		appendValueInTableCol(blankCol2, '');
		
	if(executiveNameColumnDisplay)
		appendValueInTableCol(blankCol3, '');
	
	if(invoiceNumberColumnDisplay)
		appendValueInTableCol(blankCol5, '');

	appendRowInTable('billTfoot', totalRow);

	var newTableObject = document.getElementById('reportTable');
	sorttable.makeSortable(newTableObject);
}

function makeHeaderRowForSTBS() {
	var headerRow			= createRowInTable('headerRow', '', 'font-size: 14px;');

	var srNoCol				= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');
	var checkBoxCol			= createColumnInRow(headerRow, '', 'titletd sorttable_nosort', '', 'center', '', '');
	var lrTitleCol			= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');
	
	if(isShowCrNumberColumn)
		var crTitleCol			= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');
		
	if(showBookingDeliveryDateColumnSeparately) {
		var bkgDataeTitleCol	= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');
		var dlyDataeTitleCol	= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');
	} else
		var bkgDataeTitleCol	= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');
	
	if(isShowEditLrRateLink)
		var editLrRate			= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');
	
	if(isShowEditArticleLink)
		var editArticle			= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');

	var fromTitleCol		= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');
	var toTitleCol			= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');
	var consinorTitleCol	= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');
	var consineeTitleCol	= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');
	var actWeightTitleCol	= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');
	var pkgsTitleCol		= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');
	var amountTitleCol		= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');
	
	if(executiveNameColumnDisplay)
		var executiveNameCol		= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');

	if(!allowSTBSCreationWithoutCollectionPerson)
		var collPerTitleCol		= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');

	if(isShowDeliveredToNameColumn)
		var deliveredNameTitleCol			= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');

	if(isShowBothOptionInPartyWiseSelection)
		var txnTypeTitleCol		= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');
		
	if(invoiceNumberColumnDisplay)
		var invNoTitleCol		= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');

	var checkBoxObject		= new Object();

	checkBoxObject.name		= 'selectAll2';
	checkBoxObject.type		= 'checkbox';
	checkBoxObject.value	= 'Select All';
	checkBoxObject.id		= 'selectAll2';
	checkBoxObject.onclick	= "selectAllCheckBoxForSTBSBill(this.checked, 'reportTable')";

	createInput(checkBoxCol, checkBoxObject);

	appendValueInTableCol(srNoCol, 'SR No.');
	appendValueInTableCol(lrTitleCol, 'LR No');
	
	if(isShowCrNumberColumn)
		appendValueInTableCol(crTitleCol, 'CR No');
		
	if(showBookingDeliveryDateColumnSeparately) {
		appendValueInTableCol(bkgDataeTitleCol, 'Booking Date');
		appendValueInTableCol(dlyDataeTitleCol, 'Delivery Date');
	} else
		appendValueInTableCol(bkgDataeTitleCol, 'Date');

	if(isShowEditLrRateLink)
		appendValueInTableCol(editLrRate, 'Edit LR Rate');
	
	if(isShowEditArticleLink)
		appendValueInTableCol(editArticle, 'Edit Article');

	appendValueInTableCol(fromTitleCol, 'From');
	appendValueInTableCol(toTitleCol, 'To');
	appendValueInTableCol(consinorTitleCol, 'C/nor');
	appendValueInTableCol(consineeTitleCol, 'C/nee');
	appendValueInTableCol(actWeightTitleCol, 'Act. Wt.');
	appendValueInTableCol(pkgsTitleCol, 'Pkgs.');
	appendValueInTableCol(amountTitleCol, 'Amount');
	
	if(executiveNameColumnDisplay)
		appendValueInTableCol(executiveNameCol, 'User Name');

	if(!allowSTBSCreationWithoutCollectionPerson)
		appendValueInTableCol(collPerTitleCol, 'Collection Person');

	if(isShowDeliveredToNameColumn)
		appendValueInTableCol(deliveredNameTitleCol, 'Deliver To Name');

	if(isShowBothOptionInPartyWiseSelection)
		appendValueInTableCol(txnTypeTitleCol, 'Txn Type');
		
	if(invoiceNumberColumnDisplay)
		appendValueInTableCol(invNoTitleCol, 'Invoice No');

	appendRowInTable('billThead', headerRow);
}

function makeHeaderForSameWayBill() {
	var headerRow			= createRowInTable('', '', '');

	var checkBoxCol			= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');
	var lrTitleCol			= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');
	var bkgDataeTitleCol	= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');
	var fromTitleCol		= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');
	var toTitleCol			= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');
	var consinorTitleCol	= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');
	var consineeTitleCol	= createColumnInRow(headerRow, '', 'titletd', '', 'center', '', '');

	var checkBoxObject		= new Object();

	checkBoxObject.name		= '';
	checkBoxObject.type		= 'checkbox';
	checkBoxObject.value	= 'Select All';
	checkBoxObject.id		= 'selectAllWayBill';
	checkBoxObject.onclick	= "selectAllCheckBox(this.checked, 'sameWayBillDetails');";

	createInput(checkBoxCol, checkBoxObject);

	appendValueInTableCol(lrTitleCol, 'LR No');
	appendValueInTableCol(bkgDataeTitleCol, 'Bk Date');
	appendValueInTableCol(fromTitleCol, 'From');
	appendValueInTableCol(toTitleCol, 'To');
	appendValueInTableCol(consinorTitleCol, 'C/nor');
	appendValueInTableCol(consineeTitleCol, 'C/nee');

	appendRowInTable('wayBillThead', headerRow);
}

function editWayBillCharges(wayBillId){
	window.open('editWayBillCharges.do?pageId=340&eventId=2&modulename=editLRRate&wayBillId='+wayBillId+'&redirectFilter=14','mywin','left=100,top=70,width=1100,height=900,toolbar=no,resizable=no,scrollbars=yes');
}

function updateConsignment(wayBillId){
	window.open('updateConsignment.do?pageId=340&eventId=2&modulename=editConsignment&wayBillId='+wayBillId+'&redirectFilter=14','newwindow','left=100,top=70,width=1100,height=900,toolbar=no,resizable=no,scrollbars=yes');
}

function openWindowForView(id,type,branchId) {
	window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+id+'&NumberType='+type+'&BranchId='+branchId);
}

function selectAllCheckBoxForSTBSBill(param, id){
	var ele 	= document.getElementById(id);

	if(ele != null) {
		var count 	= parseFloat(ele.rows.length - 2);

		for (var row = count; row > 0; row--) {
			if(ele.rows[row].style.display == '')
				ele.rows[row].cells[1].firstChild.checked = param;
		}
	}

	calculateSelectedTotalLRData();
}

function calculateSelectedTotalLRData(){
	

	var tableEl 		= document.getElementById("reportTable");
	var flagToShow 		= false;
	var totalLrs 		= 0;
	var totalAmount 	= 0;
	var totalPkgs 		= 0;
	var totalActWght 	= 0;
	
	let idSet = new Set();

	for (var i = 1; i < tableEl.rows.length -1; i++){
		if(tableEl.rows[i].cells[1].getElementsByTagName("input")[0] != null &&
				tableEl.rows[i].cells[1].getElementsByTagName("input")[0].checked){

			var wayBillIdWithString = wayBillId = tableEl.rows[i].cells[1].getElementsByTagName("input")[0].value;
			var wayBillId 			= wayBillIdWithString.split(";")[0];
			var txnTypeId			= wayBillIdWithString.split(";")[1];
			var consignorId			= wayBillIdWithString.split(";")[3];
			var consigneeId			= wayBillIdWithString.split(";")[4];

			if(allowToValidateForSamePartyToCreateSTBSPrint){
				if(txnTypeId == 1){
					idSet.add(consignorId);
				}else
					idSet.add(consigneeId);
				
				if(idSet.size > 1){
					showMessage('error', iconForErrMsg + 'Select Only Same Party To Create STBS Bill !');
					let checkbox = document.getElementById(wayBillId);
					checkbox.checked = false;
				}else{
					totalLrs 				+= 1;
					totalActWght 			+=  parseInt($('#actWght_'+wayBillId).text());
					totalPkgs 				+=  parseInt($('#packages_'+wayBillId).text());
					totalAmount 			+=  parseInt($('#amount_'+wayBillId).text());
				}
			}else{
				totalLrs 				+= 1;
				totalActWght 			+=  parseInt($('#actWght_'+wayBillId).text());
				totalPkgs 				+=  parseInt($('#packages_'+wayBillId).text());
				totalAmount 			+=  parseInt($('#amount_'+wayBillId).text());
			}
				
			flagToShow = true;
		}

		if(flagToShow){
			$('#totalLR').html(totalLrs);
			$('#totalActWt').html(totalActWght);
			$('#TotlaPkg').html(totalPkgs);
			$('#TotalAmt').html(totalAmount);

			$('#summarytable').show();
		} else{
			$('#summarytable').hide();
		};
	}
}

function backDateForAll(previousDate, showStbsDueDate) {
	$("#stbsBillCreationDate").datepicker({
		showAnim	: "fold",
		maxDate		: new Date(curDate),
		minDate		: previousDate,
		dateFormat	: 'dd-mm-yy',
		onSelect: function(date) {
			$("#stbsBillCreationDate").datepicker('setDate', new Date(date.split("-")[2], date.split("-")[1] - 1, date.split("-")[0]));
			if(showStbsDueDate)
				dueDateForAll(new Date(date.split("-")[2], date.split("-")[1] - 1, date.split("-")[0]));
			$("#stbsBillCreationDate").trigger("blur");
		},
	});

	$('#stbsBillCreationDate').val(dateWithDateFormatForCalender(curDate,"-"));
}

function dueDateForAll(date) {
   var maxDate = new Date(date);
    maxDate.setDate(maxDate.getDate() + 179);
	$("#stbsBillDueDate").datepicker("option", "minDate", date);
    $("#stbsBillDueDate").datepicker("option", "maxDate", maxDate);
    $("#stbsBillDueDate").datepicker({
        showAnim    : "fold",
        maxDate     : maxDate,
        minDate     : date,
        dateFormat  : 'dd-mm-yy',
        onSelect: function(date) {
            $("#stbsBillDueDate").datepicker('setDate', new Date(date.split("-")[2], date.split("-")[1] - 1, date.split("-")[0]));
            $("#stbsBillDueDate").trigger("blur");
        }
    });

    $('#stbsBillDueDate').val(dateWithDateFormatForCalender(date, "-"));
}
function applyTaxOnBill() {
	console.log(",mmmmmmmmmmmmmmmmm")
let getBoolean = $('#applyTax').prop("checked");
if(getBoolean == true){
	$('#applyTax').val('true')
}else{
	$('#applyTax').val('false')
	
}
console.log("getBoolean",getBoolean)		/*$('#applyTax').prop("checked", false);
		toogleElement('error','block');
		return false;*/
}
