var accountGroupName	= '';
var branchAddress		= '';
var branchPhoneNo		= '';
var detailHeader		= 'Door Delivery Memo Register';
var printDivId			= 'ddmRegisterDataDivForPrint';
var imagePath			= '';

function getData () {
	searchDataForDDMRegister();
}

function generateJSONSelectionDataForDDMRegister () {
	
	var	jsonData	= new Object();
	
	jsonData.fromDate	= $('#fromDate').val();
	jsonData.toDate		= $('#toDate').val();
	jsonData.region		= $('#region').val();
	jsonData.subRegion	= $('#subRegion').val();
	jsonData.branch		= $('#branch').val();
	jsonData.billSelectionId = $('#billSelection').val();
	jsonData.selectedVehicleNoId		= $('#selectedVehicleNoId').val();
	
	return jsonData;
	
}

function searchDataForDDMRegister (tableId) {
	
	showLayer();
		
	var	jsonObjectdata	= null;
	jsonObjectdata		= generateJSONSelectionDataForDDMRegister();
	
	var jsonStr = JSON.stringify(jsonObjectdata);
	
	$.getJSON("WayBillAjaxAction.do?pageId=50&eventId=159",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription);
					$('#bottom-border-boxshadow').addClass('hide');
					hideLayer();
				} else {
					resetDDMRegisterPage();
					setJSONDataForDDMRegister (data);
				}
				
				hideLayer();
			});
}

function setJSONDataForDDMRegister (data) {
	$('#bottom-border-boxshadow').removeClass('hide');
	var	ddmRegister = null;
	
	if(data.jsonData)
		ddmRegister = data.jsonData;
	
	if(ddmRegister && ddmRegister.length > 0)
		loadDDMRegisterDataInTable(ddmRegister);
	
	if(data.totalAmountsCollection)
		loadFooterRow(data.totalAmountsCollection);
	
	if(data.accountGroupNameForPrint)
		accountGroupName	= data.accountGroupNameForPrint;
	
	if(data.branchAddress)
		branchAddress		= data.branchAddress;
	
	if(data.branchPhoneNumber)
		branchPhoneNo		= data.branchPhoneNumber;
	if(data.imagePath != undefined){
		imagePath			= data.imagePath;
	} else{
		imagePath			= null;
	} 
	if(data.showLorryHireAmount == true || data.showLorryHireAmount == 'true'){
		$(".lorryHireAmount").removeClass('hide');
	}
	if(data.showLorryHireAmountStatus == true || data.showLorryHireAmountStatus == 'true'){
		$(".lorryHireAmountStatus").removeClass('hide');
	}
	if(data.removeStatusColumn == false || data.removeStatusColumn == 'false'){
		$(".statusCol").removeClass('hide');
	}
	if(data.showLHPVColumn == true || data.showLHPVColumn == 'true'){
		$(".lhpvNo").removeClass('hide');
	}
	if(data.showBLHPVColumn == true || data.showBLHPVColumn == 'true'){
		$(".bLhpvNo").removeClass('hide');
	}
	if(data.showCollectionPersonName == true || data.showCollectionPersonName == 'true'){
		$(".collectionPersonName").removeClass('hide');
	}
	if(data.showUnloadingTotal == true || data.showUnloadingTotal == 'true'){
		$(".unloadingTotal").removeClass('hide');
	}
	if(data.showDriverName == true || data.showDriverName == 'true'){
		$(".driverName").removeClass('hide');
	}
	if(data.showDeliveryDiscount == true || data.showDeliveryDiscount == 'true'){
		$(".discountTotalCol").removeClass('hide');
	}
	
	applyDataTable();
	showddmRegisterData();
	showPrintButtonPanel();
	
	if(data.showConsolidateEwaybillNo != undefined)
		showConEwayBillNo(data.showConsolidateEwaybillNo);
}

function loadDDMRegisterDataInTable (ddmRegisterArray) {
	
	var table = $('#results').DataTable();
	table.clear().draw();
	table.destroy();
	
	for (var i=0 ; i < ddmRegisterArray.length ; i++ ) {
		loadSingleRow(ddmRegisterArray[i],i+1);
	}
}

function showddmRegisterData () {
	$('#ddmRegisterDataDiv').switchClass("visibility-visible", "visibility-hidden");
}

function hideddmRegisterData () {
	$('#ddmRegisterDataDiv').switchClass("visibility-hidden", "visibility-visible");
}

function loadSingleRow (ddmRegister,count) {
	var	table = $('#results');
	
	var row		= createRow('results','');
	
	appendRow(table.attr('id'), row);
	
	var srNoCol		= createColumn(row ,'srNoCol', '','left','','');
	var checkBox	= createColumn(row ,'checkbox', '','center','','');
	var ddmDateCol	= createColumn(row ,'ddmDateCol', '','left','','');
	var ddNumCol	= createColumn(row ,'ddNumCol', '','left','','');
	var truckNum	= createColumn(row ,'truckNum', '','left','','');
	var driverNameCol	= createNewColumn(row ,'driverNameCol', 'hide driverName', '','left','','');
	var fromCol		= createColumn(row ,'fromCol', '','left','','');
	var toCol		= createColumn(row ,'toCol', '','left','','');
	var lrsCol		= createColumn(row ,'lrsCol', '','center','','');
	var artCol		= createColumn(row ,'artCol', '','center','','');
	var wghtCol		= createColumn(row ,'wghtCol', '','center','','');
	var toPayCol	= createColumn(row ,'toPayCol', '','center','','');
	var paidCol		= createColumn(row ,'paidCol', '','center','','');
	var tbbCol		= createColumn(row ,'tbbCol', '','center','','');
	var freightCol	= createColumn(row ,'freightCol', '','center','','');
	var discountCol		= createNewColumn(row ,'discountCol', 'hide discountTotalCol', '','center','','');
	var unloadingCol	= createNewColumn(row ,'unloadingCol', 'hide unloadingTotal', '','center','','');
	var lhpvNo		= createNewColumn(row ,'lhpvNo', 'hide lhpvNo', '','center','','');
	var bLhpvNo		= createNewColumn(row ,'bLhpvNo', 'hide bLhpvNo', '','center','','');
	var statusCol	= createNewColumn(row ,'statusCol', 'hide statusCol', '','center','','');
	var cewbNoCol	= createColumn(row ,'cewbNoCol', '','center','','');
	var lryHireAmtCol	= createNewColumn(row ,'lryHireAmtCol', 'hide lorryHireAmount', '','center','','');
	var lryHireAmtStatCol	= createNewColumn(row ,'lryHireAmtStatCol', 'hide lorryHireAmountStatus', '','center','','');
	var collectionPersonCol		= createNewColumn(row ,'collectionPersonCol', 'hide collectionPersonName', '','center','','');
	
	appendValueInTableCol(srNoCol, count);
	appendValueInTableCol(checkBox, '<input type="checkbox" class="vehicleCheck" id="check' + count + '" data-vehicleno="' + ddmRegister.vehicleNumber + '" name="checkbox" value="' + ddmRegister.deliveryRunSheetLedgerId + '" />');	
	appendValueInTableCol(ddmDateCol, ddmRegister.creationDateTimeForUser);
	appendValueInTableCol(ddNumCol, '<a href="#" onClick="openDDMPrint('+ddmRegister.deliveryRunSheetLedgerId+');" >'+ddmRegister.ddmNumber+'</a>');
	appendValueInTableCol(truckNum, ddmRegister.vehicleNumber);
	appendValueInTableCol(driverNameCol, ddmRegister.driverName);
	appendValueInTableCol(fromCol, ddmRegister.sourceBranch);
	appendValueInTableCol(toCol, ddmRegister.destinationBranch);
	appendValueInTableCol(lrsCol, ddmRegister.totalNoOfWayBills);
	appendValueInTableCol(artCol, ddmRegister.totalNoOfPackages);
	appendValueInTableCol(wghtCol, ddmRegister.totalActualWeight);
	appendValueInTableCol(toPayCol, ddmRegister.topayTotal);
	appendValueInTableCol(paidCol, ddmRegister.paidTotal);
	appendValueInTableCol(tbbCol, ddmRegister.creditTotal);
	appendValueInTableCol(freightCol, ddmRegister.freightTotal);
	appendValueInTableCol(discountCol, ddmRegister.deliveryDiscount);
	appendValueInTableCol(unloadingCol, ddmRegister.unloadingTotal);
	
	if(ddmRegister.lhpvId > 0)
		appendValueInTableCol(lhpvNo,'<a href="#" onClick="openLhpv('+ddmRegister.lhpvId+','+ddmRegister.lhpvNo+');">'+ddmRegister.lhpvNo+'</a>');
	else
		appendValueInTableCol(lhpvNo,0);	
	
	if(ddmRegister.blhpvId > 0)
		appendValueInTableCol(bLhpvNo, '<a href="javascript:openWindowForView('+ddmRegister.blhpvId+','+ddmRegister.blhpvNo+',9,'+ddmRegister.blhpvBranchId+',\''+ddmRegister.blhpvBranchName+'( '+ddmRegister.blhpvBranchSubRegionName+' )\');">'+ddmRegister.blhpvNo+'</a>');
	else
		appendValueInTableCol(bLhpvNo,0);
	
	appendValueInTableCol(statusCol, ddmRegister.statusStr);
	appendValueInTableCol(cewbNoCol, ddmRegister.consolidateEWaybillNumber);
	appendValueInTableCol(lryHireAmtCol, ddmRegister.lorryHireAmount);
	appendValueInTableCol(lryHireAmtStatCol, ddmRegister.lorryHireAmountSettlementStatus);
	appendValueInTableCol(collectionPersonCol, ddmRegister.collectionPerson);
}

function openLhpv(lhpvId,lhpvNo) {
	newwindow=window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+lhpvId+'&wayBillNumber='+lhpvNo+'&TypeOfNumber=3&BranchId=0&CityId=0&searchBy=');
}
function openDDMPrint(deliveryRunSheetLedgerId) {
	newwindow=window.open('DoorDeliveryPrint.do?pageId=304&eventId=5&deliveryRunSheetLedgerId='+deliveryRunSheetLedgerId, 'newwindow', config='height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}
function openWindowForView(id,number,type,branchId,branchName) {
	window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+id+'&wayBillNumber='+number+'&TypeOfNumber='+type+'&BranchId='+branchId+'&searchBy='+branchName);
}

function loadFooterRow (footerData) {
	
	$('#totalLRs').html(footerData.totalLRs);
	$('#totalArt').html(footerData.totalArticles);
	$('#totalWght').html(footerData.totalWght);
	$('#totalToPay').html(footerData.totalToPay);
	$('#totalPaid').html(footerData.totalPaid);
	$('#totalTBB').html(footerData.totalTBB);
	$('#totalFreight').html(footerData.totalFreight);
	$('#totalUnloading').html(footerData.totalUnloading);
	$('#totalDelDisc').html(footerData.totalDeliveryDiscount);
	$('#totalLorryHireAmount').html(footerData.totalLorryHireAmount);
}

function resetDDMRegisterPage () {
	
	hideddmRegisterData();
	clearTableData();
	hidePrintButtonPanel();
	
}

function clearTableData () {
	removeTableRows('results', 'tbody');
	removeFooterData();
}

function removeFooterData () {
	
	$('#totalLRs').html('');
	$('#totalArt').html('');
	$('#totalWght').html('');
	$('#totalToPay').html('');
	$('#totalPaid').html('');
	$('#totalTBB').html('');
	$('#totalFreight').html('');
	$('#totalUnloading').html('');
	$('#totalLorryHireAmount').html('');
	
}

function applyDataTable () {

	$('#results').dataTable( {
			"scrollY":		  "300px",
			"bRetrieve":	  true,
			"scrollCollapse": true,
			"bScrollCollapse": true,
			"paging":		  false,
			"bPaginate":	  true,
			"info":			  false,
			"bautoWidth":	  true,
			"bFilter":		  false,
			/* "jQueryUI":	  true, */
			"sDom": '<"top"i>rt<"bottom"flp><"clear">',
			"fnDrawCallback": function ( oSettings ) {
				
				/* Need to redo the counters if filtered or sorted */
				if ( oSettings.bSorted || oSettings.bFiltered )
				{
					for ( var i=0, iLen=oSettings.aiDisplay.length ; i<iLen ; i++ )
					{
						$('td:eq(0)', oSettings.aoData[ oSettings.aiDisplay[i] ].nTr ).html( i+1 );
					}
				}
			},
			"aoColumnDefs": [
				{ "bSortable": false, "aTargets": [ 0 ] }
			],
			"aaSorting": [[ 1, 'asc' ]]
		  });
	
}

function hideShowExcelButton () {

	//isExcelButtonAllowed defined in main jsp
	if(isExcelButtonAllowed) {
		$('#excelDownLoadLink').switchClass("visibility-visible", "visibility-hidden");
	}
	
}

function showPrintButtonPanel () {
	$('#printDown').switchClass("show", "hide");
}
function hidePrintButtonPanel () {
	$('#printDown').switchClass("hide", "show");
}

function openMultiDDMPrint() {
	let checkedBoxes = $('.vehicleCheck:checked');

	if (checkedBoxes.length === 0) {
		showMessage('error', 'Please Select At Least One CheckBox');
		return false;
	}
	
	if (checkedBoxes.length > 5) {
		showMessage('error', 'Please select 5 DDMs only.');
		return;
	}

	let checkedIds = checkedBoxes.map(function () {
		return $(this).val();
	}).get();


	let vehicleNos = [...new Set(checkedBoxes.map(function () {
		return $(this).data('vehicleno');
	}).get())];

	if (vehicleNos.length > 1) {
		showMessage('error', 'Please select DDMs with the same vehicle only.');
		return;
	}
	
	window.open('prints.do?pageId=340&eventId=10&modulename=ddmPrint&&deliveryRunSheetLedgerIds='+checkedIds,'newwindow', config='height=300,width=425, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}