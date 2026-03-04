var isNewDDMCreation = false;

function getDataForSingle (event,tableId) {
	
	require(["ddm/GenericDDM"], function (result1) {
		showLayer();
		searchSingleWayBill(event,tableId);
	});
	
}

function getDDMDataForSingleLR(event,tableId) { //called from new ddm jsp
	require(["ddm/GenericDDM"], function (result1) {
		showLayer();
		isNewDDMCreation = true;
		searchSingleWayBill(event,tableId);
		
	});
}

function getData () {
	
	require(["ddm/GenericDDM"], function (result1) {
		searchDDMData()
	});
	
}

function getDataToGenerateDDM () {
	let branchId 		= 0;
	let locationId 		= 0;
	let	DeliveryFor 	= 0;
	let	destBranchId 	= 0;
	let destSubRegionId	= 0;
	let godownId		= 0;
	let	billSelectionId	= 0;
	let consigneeCorpAccId = 0;
	let	devisionId	= 0;
	
	if(document.getElementById("branch"))
		branchId 		= $("#branch").val();

	if(document.getElementById("locationId"))
		locationId 		= $("#locationId").val();
	
	if(document.getElementById("godownId"))
		godownId 		= $("#godownId").val();

	if(document.getElementById("billSelection"))
		billSelectionId	= document.getElementById("billSelection").value;
		
	if(document.getElementById("divisionSelection"))
		devisionId	= document.getElementById("divisionSelection").value;
		
	if(document.getElementById("DeliveryFor"))
		DeliveryFor 	= document.getElementById("DeliveryFor").value;
	
	if(configuration != null && configuration != undefined && configuration.showCustomerOptionForLRSearch) {
		if($('#customerNameId').val() != '' && $('#newConsigneeCorpAccId').val() == 0){
			showMessage('error', "Please Enter Valid Customer Name.!");
			$('#customerNameId').focus();
			$('#customerNameId').val('');
			return;
		}
	}
	
	consigneeCorpAccId 	= $('#newConsigneeCorpAccId').val();
	
	if(document.getElementById("destBranchId")) {
		let destBranch 	= document.getElementById("destBranchId");
		let ids 		= destBranch.value.split("_");
		
		if(ids.length > 1) {
			if(ids[2])
				destBranchId = ids[2];
		} else
			destBranchId = document.getElementById("destBranchId").value;
	}
	
	if(document.getElementById("destinationSubRegionId"))
		destSubRegionId 	= document.getElementById("destinationSubRegionId").value;
	
	window.open('Search.do?pageId=304&eventId=2&locationId='+locationId+'&branchId='+branchId+'&DeliveryFor='+DeliveryFor+'&destBranchId='+destBranchId+'&destSubRegionId='+destSubRegionId+'&godownId='+godownId+'&billSelection='+billSelectionId+"&consigneeCorpAccId="+consigneeCorpAccId+'&divisionSelection='+devisionId, 'newwin', config='height=610,width=815, toolbar=no, menubar=yes, scrollbars=yes, resizable=yes,location=no, directories=no, status=yes');
	document.getElementById("wayBillNumber").value="";
	$('#customerNameId').val("");
	$('#newConsigneeCorpAccId').val(0);
	
}