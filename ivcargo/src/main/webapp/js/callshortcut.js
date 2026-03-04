function callShortcut()
{
	shortcut.add('F7', function()  {var paid = document.getElementById('PAID'); if(paid!=null){createForm('F7');}});
	shortcut.add('F8', function()  {var toPay=document.getElementById('TOPAY');if(toPay!=null){createForm('F8');}});
	shortcut.add('F9', function()  {var foc =document.getElementById('CREDITOR'); if(foc!=null){createForm('F9');}});
	shortcut.add('F10', function() {var creditor=document.getElementById('FOC'); if(creditor!=null){createForm('F10');}});
	shortcut.add('Alt+s', function() {
	
		if(typeof (isReserveBookingChecked) != 'undefined' && isReserveBookingChecked != null && isReserveBookingChecked) {
			if(!isWayBillSaved){
				if(executeReserveAddScript()==false) {return false;}
				//Check if Save request already made 
				if (isWayBillSaved==false) {
					return reservedFormValidations();
					//document.wayBillForm.submit();
				}
				isWayBillSaved=true;
			}
		} else {
			if(!isWayBillSaved){
				var chkWtKg=document.getElementById('actualWeightKg'); 
				var chkWtGm=document.getElementById('actualWeightGm');
				var response=null;
				// Check for unadded consignment by checking weight
				if (((chkWtKg!=null) && (chkWtKg.value > 0))||((chkWtGm!=null) && (chkWtGm.value > 0))){
					if(executeAddScript()==false) return false;
				}

				//Check if Save request already made 
				if (isWayBillSaved==false) {
					// Calculate total
					calcTotal();
					return formValidations();
					//document.wayBillForm.submit();
				}
				isWayBillSaved=true;

			}
		}
	});

	shortcut.add('F2',function() {
		if (!serchKeyFlag){
			document.titleWayBillSearch.searchHeader.focus();
			serchKeyFlag=true;
		} else {
			var searchBox=document.getElementById('searchHeader');
			if(searchBox.value=='' || searchBox.value=='Search WayBill')
				return false;
			else {
				document.titleWayBillSearch.submit();
				serchKeyFlag=false;
			}
		}
	});

	shortcut.add('Shift+s',function(){
		setConsignorShortcut();
	});

	shortcut.add('Shift+r',function(){
		setConsigneeShortcut();
	});
	// For DDM Creation
	shortcut.add('Shift+c',function(){
		selectAllEle('dispatchTable');
	});
	
	//shortcut.add('Alt+d',function(){ deleteConsignment('myTable','myTable1');});
	shortcut.add('Alt+a',function(){executeAddScript();});
	//Shortcut For Delivery
	shortcut.add('Alt+d',function(){if(document.getElementById('deliver') != null && document.getElementById('deliver').disabled == false)deliverWayBill('Deliver');});
	//Shortcut For Dispatch
	shortcut.add('Shift+d',function(){selectAll('dispatchTable');});
	//Shortcut For Manual Way Bill
	shortcut.add('Alt+m',function() { if(manualBookingPageUrl != null && manualBookingPageUrl != undefined){window.location = manualBookingPageUrl}});
	// Shortcut for single Delivery module
	shortcut.add('Alt+x',function() { if(deliveryPageUrl != null && deliveryPageUrl != undefined && typeof deliveryPageUrl !== 'undefined') {window.location = deliveryPageUrl + '&wayBillId='+$('#wayBillId').val()}});
	// Shortcut for New Local Booking Screen 
	shortcut.add('Alt+l',function() {if(localBookingPageUrl != null && localBookingPageUrl != undefined){window.location = localBookingPageUrl}});
	// Shortcut for New FTL Booking Screen 
	shortcut.add('Alt+f',function() {if(ftlBookingPageUrl != null && ftlBookingPageUrl != undefined){window.location = ftlBookingPageUrl}});
	var url_string = window.location.href;
	var url = new URL(url_string);
	var wayBillId = url.searchParams.get("wayBillId");
	
	if((wayBillId != undefined && wayBillId != "undefined") && (wayBillId != null && wayBillId != "null")){
		setTimeout(function() {
			$("#waybillId").val(wayBillId);
			$('#findCR').trigger('click');
		}, 600);
	}
}
function createForm(shortcut)
{
	var isBkgPage = document.getElementById('wayBillBookingPage'); 
	if(isBkgPage == null){
		var param = document.createElement('input');
		param.type = 'hidden';
		param.name = 'shortcutParam';
		param.value = shortcut;
		document.shortcuts.appendChild(param);
		document.shortcuts.submit();
	}else{
		changeWayBillType(shortcut, false);
	}
}