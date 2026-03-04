/**
 * 
 */

var clearCount = 0;

function getPartyBillRegisterReport() {

	if(!ValidateFormElement()) {
		return false;
	}
	
	var jsonObject		= new Object();
		    	
	var fromDate		= getValueFromInputField('fromDate');
	var toDate			= getValueFromInputField('toDate');
	var billingPartyId	= getValueFromInputField('billingPartyId');
	var timeDuration	= getValueFromInputField('timeDuration');
		    
	var jsonObjectdata;
	jsonObjectdata = new Object();
			 	
	jsonObjectdata.billingPartyId 	= billingPartyId;
	jsonObjectdata.fromDate 		= fromDate;
	jsonObjectdata.toDate 			= toDate;
	jsonObjectdata.timeDuration		= timeDuration;
	
	jsonObject		= jsonObjectdata;
		    	
	var jsonStr 	= JSON.stringify(jsonObject);
					
	showLayer();
		    	
	$.getJSON("PartyBillRegisterReportAjaxAction.do?pageId=50&eventId=161",
			{json:jsonStr}, function(data) {

				hideLayer();
				
				emptyInnerValue('tabHeader');
				emptyInnerValue('tFoot');
				emptyInnerValue('tHead');
				emptyChildInnerValue('tFoot', 'tr');
				emptyChildInnerValue('results', 'tbody');
				emptyInnerValue('printpanel');
				emptyInnerValue('printpanel1');
							
				var partyBillRegister			= data.partyBillRegister;
				var accountGroupNameForPrint	= data.accountGroupNameForPrint;
				var branchAddress				= data.branchAddress;
				var branchPhoneNumber			= data.branchPhoneNumber;
				var isExcelButtonAllowed		= data.isExcelButtonAllowed;
				var billingPartyName			= getValueFromInputField('billingPartyName');
				var configuration				= data.configuration;

				if(data.isDataPresent) {
					showPartOfPage('bottom-border-boxshadow');
					
					if(clearCount > 0 ) {
						var table = $('#results').DataTable();
						table.clear().draw();
						table.destroy();
					}
									
					var headrow 	= createRowInTable('tr_', '', '');
									 
					var fDate		= createColumnInRow(headrow, 'td_' + data.fromDate, '', '', 'right', '', ''); 
					var tDate		= createColumnInRow(headrow, 'td_' + data.toDate, '', '', 'right', '', ''); 
					var partName	= createColumnInRow(headrow, 'td_' + billingPartyName, '', '', 'right', '', ''); 

					appendValueInTableCol(fDate, '<b>From Date :</b>' + data.fromDate);
					appendValueInTableCol(tDate, '<b>To Date :</b>' + data.toDate);
					appendValueInTableCol(partName, '<b>Billing Party Name :</b>' + billingPartyName);
					
					appendRowInTable('tabHeader', headrow);
    	  
					var tabHeader		= createRowInTable('columnsCount1', '', '');
					
					var blanckCell0		= createColumnInRow(tabHeader, 'td_', '', '', 'right', '', '');
					
					if(configuration.showPartyNameColumn == true || configuration.showPartyNameColumn == "true"){
						var blanckCell11	= createColumnInRow(tabHeader, 'td_', '', '', 'right', '', '');
					}
					
					if(configuration.showBranchNameColumn == true || configuration.showBranchNameColumn == "true"){
						var blanckCell12	= createColumnInRow(tabHeader, 'td_', '', '', 'right', '', '');
					}
					
					var blanckCell1		= createColumnInRow(tabHeader, 'td_', '', '', 'right', '', '');
					var blanckCell2		= createColumnInRow(tabHeader, 'td_', '', '', 'right', '', '');
					
					if(configuration.showAmountColumn == true || configuration.showAmountColumn == "true"){
						var blanckCell13	= createColumnInRow(tabHeader, 'td_', '', '', 'right', '', '');
					}
					
					if(configuration.showServiceTaxColumn == true || configuration.showServiceTaxColumn == "true"){
						var blanckCell14	= createColumnInRow(tabHeader, 'td_', '', '', 'right', '', '');
					}
					
					var blanckCell3		= createColumnInRow(tabHeader, 'td_', '', '', 'right', '', '');
					var blanckCell4		= createColumnInRow(tabHeader, 'td_', '', '', 'right', '', '');
					
					if(configuration.showReceiveAmountColumn == true || configuration.showReceiveAmountColumn == "true"){
						var blanckCell10	= createColumnInRow(tabHeader, 'td_', '', '', 'right', '', '');
					}
					
					if(configuration.showStatusDetailColumn == true || configuration.showStatusDetailColumn == "true"){
						var blanckCell5		= createColumnInRow(tabHeader, 'td_', '', '', 'right', '', '');
					}
					
					if(configuration.showPaymentModeColumn == true || configuration.showPaymentModeColumn == "true"){
						var blanckCell6		= createColumnInRow(tabHeader, 'td_', '', '', 'right', '', '');
					}
					
					if(configuration.showChequeNoColumn == true || configuration.showChequeNoColumn == "true"){
						var blanckCell7		= createColumnInRow(tabHeader, 'td_', '', '', 'right', '', '');
					}
					
					if(configuration.showChequeDateColumn == true || configuration.showChequeDateColumn == "true"){
						var blanckCell8		= createColumnInRow(tabHeader, 'td_', '', '', 'right', '', '');
					}
					
					if(configuration.showChequeRemarkColumn == true || configuration.showChequeRemarkColumn == "true"){
						var blanckCell9		= createColumnInRow(tabHeader, 'total_', '', '', 'right', '', '');
					}
					
					
					
					appendValueInTableCol(blanckCell0, 'SR.NO');
					
					if(configuration.showPartyNameColumn == true || configuration.showPartyNameColumn == "true"){
						appendValueInTableCol(blanckCell11, 'Name');
					}
					
					if(configuration.showBranchNameColumn == true || configuration.showBranchNameColumn == "true"){
						appendValueInTableCol(blanckCell12, 'Branch');
					}
					
					appendValueInTableCol(blanckCell1, 'Bill NO');
					appendValueInTableCol(blanckCell2, 'Bill Dt');
					
					if(configuration.showAmountColumn == true || configuration.showAmountColumn == "true"){
						appendValueInTableCol(blanckCell13, 'Amount');
					}
					
					if(configuration.showServiceTaxColumn == true || configuration.showServiceTaxColumn == "true"){
						appendValueInTableCol(blanckCell14, 'Service Tax');
					}
					
					appendValueInTableCol(blanckCell3, 'Bill Amt');
					appendValueInTableCol(blanckCell4, 'Status');
					
					if(configuration.showReceiveAmountColumn == true || configuration.showReceiveAmountColumn == "true"){
						appendValueInTableCol(blanckCell10, 'Rec Amt');
					}
					
					if(configuration.showStatusDetailColumn == true || configuration.showStatusDetailColumn == "true"){
						appendValueInTableCol(blanckCell5, 'Status Dt');
					}
					
					if(configuration.showPaymentModeColumn == true || configuration.showPaymentModeColumn == "true"){
						appendValueInTableCol(blanckCell6, 'Mode');
					}
					
					if(configuration.showChequeNoColumn == true || configuration.showChequeNoColumn == "true"){
						appendValueInTableCol(blanckCell7, 'Chq No');
					}
					
					if(configuration.showChequeDateColumn == true || configuration.showChequeDateColumn == "true"){
						appendValueInTableCol(blanckCell8, 'Chq Dt');
					}
					
					if(configuration.showChequeRemarkColumn == true || configuration.showChequeRemarkColumn == "true"){
						appendValueInTableCol(blanckCell9, 'Chq Rmark');
					}
					

					var tHead = $('#tHead').append(tabHeader);
					//$('#results').append(tHead);
					
					var totalamt = 0;
									
					for(var i = 0; i < partyBillRegister.length; i++) {
						var partyBill	= partyBillRegister[i];

						totalamt	+= partyBill.grandTotal;
										
						k = i+1;
						
						var row 			= createRowInTable('tr_'+k, '', '');
						var Srno								= createColumnInRow(row ,'td_' + k, '', '', 'right', '', ''); 
						
						if(configuration.showPartyNameColumn == true || configuration.showPartyNameColumn == "true"){
							var name								= createColumnInRow(row ,'td_' + partyBill.creditorName, '', '', 'right', '', '');
						}
						
						if(configuration.showBranchNameColumn == true || configuration.showBranchNameColumn == "true"){
							var branch								= createColumnInRow(row ,'td_' + partyBill.branchName, '', '', 'right', '', '');
						}
						var billNumber							= createColumnInRow(row ,'td_' + partyBill.billNumber, '', '', 'right', '', '');
						var creationDateTimeStampBill			= createColumnInRow(row ,'td_' + partyBill.creationDateTimeStampBillString, '', '', 'right', '', '');
					
						if(configuration.showAmountColumn == true || configuration.showAmountColumn == "true"){
							var amount								= createColumnInRow(row ,'td_' + partyBill.totalAmount, '', '', 'right', '', '');
						}
					
						if(configuration.showServiceTaxColumn == true || configuration.showServiceTaxColumn == "true"){
							var serviceTax								= createColumnInRow(row ,'td_' + partyBill.serviceTax, '', '', 'right', '', '');
						}
						var grandTotal							= createColumnInRow(row ,'td_' + partyBill.grandTotal, '', '', 'right', '', '');
						var status								= createColumnInRow(row ,'td_' + partyBill.statusBillString, '', '', 'right', '', '');
						
						if(configuration.showReceiveAmountColumn == true || configuration.showReceiveAmountColumn == "true"){
							var recAmt								= createColumnInRow(row ,'td_' + partyBill.totalReceivedAmount, '', '', 'right', '', '');
						}
						
						if(configuration.showStatusDetailColumn == true || configuration.showStatusDetailColumn == "true"){
							var creationDateTimeStampBillClearance	= createColumnInRow(row ,'td_' + partyBill.creationDateTimeStampBillClearanceString, '', '', 'right', '', '');
						}
						
						if(configuration.showPaymentModeColumn == true || configuration.showPaymentModeColumn == "true"){
							var transactionTypeString				= createColumnInRow(row ,'td_' + partyBill.transactionTypeString, '', '', 'right', '', '');
						}
						
						if(configuration.showChequeNoColumn == true || configuration.showChequeNoColumn == "true"){	
							var checkNumber							= createColumnInRow(row ,'td_' + partyBill.checkNumber, '', '', 'right', '', '');
						}
						
						if(configuration.showChequeDateColumn == true || configuration.showChequeDateColumn == "true"){
							var checkDate							= createColumnInRow(row ,'td_' + partyBill.checkDateString, '', '', 'right', '', '');
						}
						
						if(configuration.showChequeRemarkColumn == true || configuration.showChequeRemarkColumn == "true"){
							var remark								= createColumnInRow(row ,'td_' + partyBill.remark, '', '', 'right', '', '');
						}
						
						
						appendValueInTableCol(Srno, k);
						
						if(configuration.showPartyNameColumn == true || configuration.showPartyNameColumn == "true"){
							appendValueInTableCol(name, partyBill.creditorName);
						}
						
						if(configuration.showBranchNameColumn == true || configuration.showBranchNameColumn == "true"){
							appendValueInTableCol(branch, partyBill.branchName);
						}
						
						appendValueInTableCol(billNumber, partyBill.billNumber);
						appendValueInTableCol(creationDateTimeStampBill, partyBill.creationDateTimeStampBillString);
						
						if(configuration.showAmountColumn == true || configuration.showAmountColumn == "true"){
							appendValueInTableCol(amount, partyBill.totalAmount);
						}
						
						if(configuration.showServiceTaxColumn == true || configuration.showServiceTaxColumn == "true"){
							appendValueInTableCol(serviceTax, partyBill.serviceTax);
						}
						
						appendValueInTableCol(grandTotal, (partyBill.grandTotal));
						appendValueInTableCol(status, partyBill.statusBillString);
						
						if(configuration.showReceiveAmountColumn == true || configuration.showReceiveAmountColumn == "true"){
							appendValueInTableCol(recAmt, partyBill.totalReceivedAmount);
						}
						
						if(configuration.showStatusDetailColumn == true || configuration.showStatusDetailColumn == "true"){
							if(partyBill.creationDateTimeStampBillClearanceString != null) {
								appendValueInTableCol(creationDateTimeStampBillClearance, partyBill.creationDateTimeStampBillClearanceString);
							} else {
								appendValueInTableCol(creationDateTimeStampBillClearance, '-');
							}
						}
						
						if(configuration.showPaymentModeColumn == true || configuration.showPaymentModeColumn == "true"){
							if(partyBill.transactionTypeString != null) {
								appendValueInTableCol(transactionTypeString, partyBill.transactionTypeString);
							} else {
								appendValueInTableCol(transactionTypeString, '-');
							}
						}
						
						if(configuration.showChequeNoColumn == true || configuration.showChequeNoColumn == "true"){
							if(partyBill.checkNumber != null) {
								appendValueInTableCol(checkNumber, partyBill.checkNumber);
							} else {
								appendValueInTableCol(checkNumber, '-');
							}
						}
						
						if(configuration.showChequeDateColumn == true || configuration.showChequeDateColumn == "true"){
							if(partyBill.checkDateString != null) {
								appendValueInTableCol(checkDate, partyBill.checkDateString);
							} else {
								appendValueInTableCol(checkDate, '-');
							}
						}
						
						if(configuration.showChequeRemarkColumn == true || configuration.showChequeRemarkColumn == "true"){
							if(partyBill.remark != null) {
								appendValueInTableCol(remark, partyBill.remark);
							} else {
								appendValueInTableCol(remark, '-');
							}
						}
						
						
						appendRowInTable('results', row);
					}
					
					$.get("/ivcargo/includes/ReportButtonsAndLinkJson.jsp",
					{
					     accountGroupNameForPrint:accountGroupNameForPrint,
					     branchAddress:branchAddress,
					     branchPhoneNumber:branchPhoneNumber,
					     fromDate:fromDate,
					     toDate:toDate,
					     isExcelButtonAllowed:isExcelButtonAllowed
					}	 
					,function(data1) {
						setValueToContent('printpanel', 'htmlTag', "<br>" + data1 + "<br/><br/>");
						setValueToContent('printpanel1', 'htmlTag', "<br/><br/>" + data1);
					});	
					clearCount++;			 
					resetTable();	 
				} else {
					showMessage('error', recordNotFoundInfoMsg);
					setValueToTextField('billingPartyName', '');
					setValueToTextField('billingPartyId', 0);
					refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
				}
		}); 
}


function resetTable() {
	$('#results').dataTable( {
		"scrollY":        "300px",
        "bRetrieve": 	  true,
        "scrollCollapse": true,
        "bScrollCollapse": true,
        "paging":         false,
        "bPaginate": 	  true,
        "info":     	  false,
        "bautoWidth":     true,
        "bFilter": 		  false,
        /* "jQueryUI": 	  true, */
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


function printPlainData(accountGroupName , branchAddress ,branchPhoneNo ,detailHeader){
	var table = $('#results').DataTable();
	table.destroy();
	detailHeader 	= document.getElementById('reportName').innerHTML;
	childwin 		= window.open ('jsp/printData.jsp?accountGroupName='+accountGroupName+'&branchAddress='+branchAddress+'&branchPhoneNo='+branchPhoneNo+'&detailHeader='+detailHeader , 'newwindow', config='height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	window.setTimeout(waitForPlainDelay, 500);
	setTimeout(resetTable,500);
}

function waitForPlainDelay() {
	var dataTableId = 'results';
	var wbNoSize = 10;
	var remarkSize = 8;
	var nameSize = 10;
	var srcDestSize = 6;
	childwin.document.getElementById('data').innerHTML= document.getElementById('reportData').innerHTML;
	$('#data',childwin.document).removeClass().attr({'align': 'left'});
	//Replace Style Classes
	$('table',childwin.document).removeClass().removeAttr('style').css({'border':'0px'});
	$('#printHeader',childwin.document).attr({'width':'80%'});
	$('#printTimeTbl',childwin.document).attr({'width':'80%'});
	$('#'+dataTableId,childwin.document).attr({'width':'80%'});
	$('td',childwin.document).removeClass().addClass('datatd_plain_text');
	$('#groupName',childwin.document).removeClass().addClass('datatd_plain_text').css({"font-weight":"bold","font-size":"22px",'letter-spacing': '7px', 'text-align': 'center'});
	$("td:contains('Register')",childwin.document).css({"font-weight":"bold","font-size":"15px",'letter-spacing': '5px'});
	$('th',childwin.document).removeClass().addClass('datatd_plain_text').css("font-weight", "bold");
	
	$('#data tr',childwin.document).each(function(){
		
		//Format the lsNo column
	    var lsNo = $(this).find("td").eq(1).text().trim();
	    	$(this).find("td").eq(1).text(lsNo.substring(0,wbNoSize));
	    	
		/* //Format the Destination column
	    var dest = $(this).find("td").eq(4).text().trim();
	    	if(dest.length > srcDestSize)$(this).find("td").eq(4).text(dest.substring(0,srcDestSize)); */
	    	
	});
	//Remove Sr No Column
	$('#'+dataTableId+' td:first-child,th:first-child,',childwin.document).remove();
	childwin.print();
}

function ValidateFormElement() {

	var timeDuration = getValueFromInputField('timeDuration');
	
	if(timeDuration == 0) {
		showMessage('error', timeDurationErrMsg);
		toogleElement('basicError','block');
		changeError1('timeDuration','0','0');
		$("#timeDuration").focus(); 
		return false;
	
	}
	
	var billingPartyName = getValueFromInputField('billingPartyId');
	
	if(billingPartyName == 0) {
		showMessage('error', billingPartyErrMsg);
		toogleElement('basicError','block');
		changeError1('billingPartyName','0','0');
		$("#billingPartyName").focus(); 
		return false;
	}
	
	return true;
}


function open2Print(dispatchLedgerId) {
	
	childwin2 = window.open ('OutboundManifest.do?pageId=11&eventId=3&Type=Dispatched&isSecPrint=yes&dispatchLedgerId='+dispatchLedgerId, 'newwindow', config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	childwin1 = window.open ('OutboundManifest.do?pageId=11&eventId=3&Type=Dispatched&dispatchLedgerId='+dispatchLedgerId,'','location=0, status=0 ,scrollbars=1, width=800, height=600, resizable=1');
}

function openWindowForView(id,number,type,branchId,cityId,searchBy) {
	window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+id+'&wayBillNumber='+number+'&TypeOfNumber='+type+'&BranchId='+branchId+'&CityId='+cityId+'&searchBy='+searchBy);
}

function disableDate(){

	if(date == DAY_WISE_CUSTOM_ID ) {
		changeDisplayProperty('custom', 'block');
	} else {
		changeDisplayProperty('custom', 'none');
	}
}

function dropdownSelect(){
	
	var custselect = getValueFromInputField('timeDuration');
	
	if(custselect == DAY_WISE_CUSTOM_ID) {
		changeDisplayProperty('custom', 'block');
	} else {
		changeDisplayProperty('custom', 'none');
	}
}