/**
 * @author Anant Chaudhary	29-02-2016
 */

var clearCount = 0;

function viewAllCorporateParty() {
	
	if(!region('region')) {return false;};
	if(!subRegion('subRegion')) {return false;};
	if(!branchName(6, 'sourceBranch')) {return false;};
	
	var jsonObject = new Object();
	var jsonObjectData;
	
	jsonObjectData = new Object();
	
	if(getValueFromInputField('region') != null) {
		jsonObjectData.RegionID		= getValueFromInputField('region');
	} else {
		jsonObjectData.RegionID		= 0;
	}
	
	if(getValueFromInputField('subRegion') != null) {
		jsonObjectData.SubRegionID	= getValueFromInputField('subRegion');
	} else {
		jsonObjectData.SubRegionID	= 0;
	}
	
	if(getValueFromInputField('sourceBranch') != null) {
		jsonObjectData.BranchID		= getValueFromInputField('sourceBranch');
	} else {
		jsonObjectData.BranchID		= 0;
	}
	
	jsonObject 		= jsonObjectData;
	
	var jsonStr = JSON.stringify(jsonObject);
	//alert(jsonStr);
	
	showLayer();
	$.getJSON("GetAllParties.do?pageId=201&eventId=2", {json:jsonStr}, 
		function(data) {
		
			if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
				showMessage('info', recordNotFoundInfoMsg);
				hideLayer();
			} else {
				var corporateAccount		= data.partylist;
				var configuration			= data.configuration;

				emptyChildInnerValue('datatablebody', 'tbody');
				
				setUserInfo(data);
				
				//applyIndividualColSearch('Partytable');
				
				if(corporateAccount != null) {
					
					if(clearCount > 0 ) {
						var table = $('#Partytable').DataTable();
						table.clear().draw();
						table.destroy();
					}
					
					for(var i = 0; i < corporateAccount.length; i++) {
						
						var index					= i + 1;
						
						var name					= corporateAccount[i].name;
						var address					= corporateAccount[i].address;
						var cityName				= corporateAccount[i].cityName;
						var branchName				= corporateAccount[i].branchName;
						var pincode					= corporateAccount[i].pincode;
						var contactPerson			= corporateAccount[i].contactPerson;
						var department				= corporateAccount[i].department;
						var mobileNumber			= corporateAccount[i].mobileNumber;
						var phoneNumber				= corporateAccount[i].phoneNumber;
						var faxNumber				= corporateAccount[i].faxNumber;
						var emailAddress			= corporateAccount[i].emailAddress;
						var corpActTypeName			= corporateAccount[i].corporateAccountTypeName;
						var location				= corporateAccount[i].location;
						var corpActSubTypeName		= corporateAccount[i].corporateAccountSubTypeName;
						var mobileNumber2			= corporateAccount[i].mobileNumber2;
						var phoneNumber2			= corporateAccount[i].phoneNumber2;
						var marketingPersonName		= corporateAccount[i].marketingPersonName;
						var serviceTaxNumber		= corporateAccount[i].serviceTaxNumber;
						var tinNumber				= corporateAccount[i].tinNumber;
						var panNumber				= corporateAccount[i].panNumber;
						var serviceTaxRequired		= corporateAccount[i].serviceTaxRequired;
						var isBlackList				= corporateAccount[i].blackListedName;
						var displayName				= corporateAccount[i].displayName;
						
						
						var createRow				= createRowInTable('', '', '');
						
						var srNoCol					= createColumnInRow(createRow, '', '', '', '', '', '');
						var nameCol					= createColumnInRow(createRow, 'name_' + index, 'name', '', '', '', '');
						var addressCol				= createColumnInRow(createRow, 'address_' + index, 'address', '', '', '', '');
						var cityNameCol				= createColumnInRow(createRow, 'city_' + index, 'city', '', '', '', '');
						var branchNameCol			= createColumnInRow(createRow, 'branch_' + index, 'branch', '', '', '', '');
						var pinCodeCol				= createColumnInRow(createRow, 'pinCode_' + index, 'pinCode', '', '', '', '');
						var personNameCol			= createColumnInRow(createRow, 'contactPerson_' + index, 'contactPerson', '', '', '', '');
						var departmentCol			= createColumnInRow(createRow, 'department_' + index, 'department', '', '', '', '');
						var mobileNumberCol			= createColumnInRow(createRow, 'mobileNo_' + index, 'mobileNo', '', '', '', '');
						var phoneNumberCol			= createColumnInRow(createRow, 'phoneNo_' + index, 'phoneNo', '', '', '', '');
						var faxNumberCol			= createColumnInRow(createRow, 'faxNo_' + index, 'faxNo', '', '', '', '');
						var emailAddressCol			= createColumnInRow(createRow, 'email_' + index, 'email', '', '', '', '');
						var corpActTypeNameCol		= createColumnInRow(createRow, 'partyType_' + index, 'partyType', '', '', '', '');
						var locationCol				= createColumnInRow(createRow, 'location_' + index, 'location', '', '', '', '');
						var corpActSubTypeNameCol	= createColumnInRow(createRow, 'subType_' + index, 'subType', '', '', '', '');
						var mobileNumber2Col		= createColumnInRow(createRow, 'mobileNo2_' + index, 'mobileNo2', '', '', '', '');
						var phoneNumber2Col			= createColumnInRow(createRow, 'phoneNo2_' + index, 'phoneNo2', '', '', '', '');
						var marketingPersonNameCol	= createColumnInRow(createRow, 'markettingPerson_' + index, 'markettingPerson', '', '', '', '');
						var serviceTaxNumberCol		= createColumnInRow(createRow, 'serviceTaxNo_' + index, 'serviceTaxNo', '', '', '', '');
						var tinNumberCol			= createColumnInRow(createRow, 'tinNumber_' + index, 'tinNumber', '', '', '', '');
						var panNumberCol			= createColumnInRow(createRow, 'panNumber_' + index, 'panNumber', '', '', '', '');
						var serviceTaxReqCol		= createColumnInRow(createRow, 'serviceTaxRequired_' + index, 'serviceTaxRequired', '', '', '', '');
						var isBlackListCol			= createColumnInRow(createRow, 'blackList_' + index, 'blackList', '', '', '', '');
						var displayNameCol			= createColumnInRow(createRow, 'displayName_' + index, 'displayName', '', '', '', '');
						
						appendValueInTableCol(srNoCol, index);
						appendValueInTableCol(nameCol, name);
						appendValueInTableCol(addressCol, address);
						appendValueInTableCol(cityNameCol, cityName);
						appendValueInTableCol(branchNameCol, branchName);
						appendValueInTableCol(pinCodeCol, pincode);
						appendValueInTableCol(personNameCol, contactPerson);
						appendValueInTableCol(departmentCol, department);
						appendValueInTableCol(mobileNumberCol, mobileNumber);
						appendValueInTableCol(phoneNumberCol, phoneNumber);
						appendValueInTableCol(faxNumberCol, faxNumber);
						appendValueInTableCol(emailAddressCol, emailAddress);
						appendValueInTableCol(corpActTypeNameCol, corpActTypeName);
						appendValueInTableCol(locationCol, location);
						appendValueInTableCol(corpActSubTypeNameCol, corpActSubTypeName);
						appendValueInTableCol(mobileNumber2Col, mobileNumber2);
						appendValueInTableCol(phoneNumber2Col, phoneNumber2);
						appendValueInTableCol(marketingPersonNameCol, marketingPersonName);
						appendValueInTableCol(serviceTaxNumberCol, serviceTaxNumber);
						appendValueInTableCol(tinNumberCol, tinNumber);
						appendValueInTableCol(panNumberCol, panNumber);
						appendValueInTableCol(displayNameCol, displayName);
						
						if(serviceTaxRequired) {
							appendValueInTableCol(serviceTaxReqCol, 'YES');
						} else {
							appendValueInTableCol(serviceTaxReqCol, 'NO');
						}
						
						appendValueInTableCol(isBlackListCol, isBlackList);
						
	
						hideTableColumn(configuration);
						appendRowInTable('Partytable', createRow);
					}
					
					clearCount++;
					datatableDisplay('Partytable');
				}
				
				openDialog('viewPartyDetails');
				
				//datatableDisplay('Partytable');
				//applyIndividualColSearch('Partytable');
				//applyTableTools('Partytable');
				hideTableColumn(configuration);
				
				hideLayer();
			}
	})	
}

function setUserInfo(data) {
	var jsonObjectUl			= new Object();
	
	jsonObjectUl.id				= 'detailsList';
	
	createUlTag('detailsInfo', jsonObjectUl);
	
	var branchNameTitleLi				= new Object();
	var regionNameTitleLi				= new Object();
	var subRegionNameTitleLi			= new Object();
	//var loggedinBranchNameTitleLi		= new Object();
	var groupNameTitleLi				= new Object();
	//var addressTitleLi					= new Object();
	
	var branchNameJsonObjectLi			= new Object();
	var regionNameJsonObjectLi			= new Object();
	var subRegionNameJsonObjectLi		= new Object();
	var phoneNumberJsonObjectLi			= new Object();
	//var loggedinBranchNameJsonObjectLi	= new Object();
	var groupNameJsonObjectLi			= new Object();
	//var addressJsonObjectLi				= new Object();
	
	branchNameTitleLi.id				= 'branchNameTitle';
	branchNameTitleLi.style				= 'font-weight: bold; margin-left: 50px;';
	
	regionNameTitleLi.id				= 'regionNameTitle';
	regionNameTitleLi.style				= 'font-weight: bold; margin-left: 50px;';
	
	subRegionNameTitleLi.id				= 'subRegionNameTitle';
	subRegionNameTitleLi.style			= 'font-weight: bold; margin-left: 50px;';
	
	//loggedinBranchNameTitleLi.id		= 'loggedinBranchNameTitle';
	//loggedinBranchNameTitleLi.style		= 'font-weight: bold; margin-left: 50px;';
	
	groupNameTitleLi.id					= 'groupNameTitle';
	groupNameTitleLi.style				= 'font-weight: bold; margin-left: 50px;';
	
	//addressTitleLi.id					= 'addressTitle';
	//addressTitleLi.style				= 'font-weight: bold; margin-left: 50px;';
	
	branchNameJsonObjectLi.id			= 'branchNameLI';
	regionNameJsonObjectLi.id			= 'regionNameLI';
	subRegionNameJsonObjectLi.id		= 'subRegionNameLI';
	phoneNumberJsonObjectLi.id			= 'phoneNumberLI';
	//loggedinBranchNameJsonObjectLi.id	= 'loggedinBranchNameLI';
	groupNameJsonObjectLi.id			= 'groupNameLI';
	//addressJsonObjectLi.id				= 'addressLI';
	
	createLiTag(jsonObjectUl.id, branchNameTitleLi);
	createLiTag(jsonObjectUl.id, branchNameJsonObjectLi);
	createLiTag(jsonObjectUl.id, regionNameTitleLi);
	createLiTag(jsonObjectUl.id, regionNameJsonObjectLi);
	createLiTag(jsonObjectUl.id, subRegionNameTitleLi);
	createLiTag(jsonObjectUl.id, subRegionNameJsonObjectLi);
	//createLiTag(jsonObjectUl.id, loggedinBranchNameTitleLi);
	//createLiTag(jsonObjectUl.id, loggedinBranchNameJsonObjectLi);
	createLiTag(jsonObjectUl.id, groupNameTitleLi);
	createLiTag(jsonObjectUl.id, groupNameJsonObjectLi);
	//createLiTag(jsonObjectUl.id, addressTitleLi);
	//createLiTag(jsonObjectUl.id, addressJsonObjectLi);
	
	setValueToHtmlTag(branchNameTitleLi.id, 'Branch :');
	setValueToHtmlTag(branchNameJsonObjectLi.id, data.branchName);
	
	setValueToHtmlTag(regionNameTitleLi.id, 'Region :');
	setValueToHtmlTag(regionNameJsonObjectLi.id, data.regionName);

	setValueToHtmlTag(subRegionNameTitleLi.id, 'Sub - Region :');
	setValueToHtmlTag(subRegionNameJsonObjectLi.id, data.subRegionName);
	
	//setValueToHtmlTag(loggedinBranchNameTitleLi.id, 'User Branch Name :');
	//setValueToHtmlTag(loggedinBranchNameJsonObjectLi.id, data.loggedinBranchName);

	setValueToHtmlTag(groupNameTitleLi.id, 'Group Name :');
	setValueToHtmlTag(groupNameJsonObjectLi.id, data.groupName);
	
	//setValueToHtmlTag(addressTitleLi.id, 'Address :');
	//setValueToHtmlTag(addressJsonObjectLi.id, data.address);
}

function datatableDisplay(id){
	var datatable	= $('#'+id).DataTable( {

		"scrollY": 400,
		"scrollX": true,
		"scrollCollapse": true,
		"paging": true,
		"bJQueryUI": true,
		"pagingType": "full_numbers",
		"fixedColumns": true,
		responsive: true,
		"deferRender": true,
		"lengthMenu": [[10, 25, 50, 100, 200, 500, 1000, -1], [10, 25, 50, 100, 200, 500, 1000, "All"]],
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
		                 "aaSorting": [[ 1, 'asc' ]],
		                 //dom: 'T<"clear">lfrtip', 
		               //  "sextends":'print'
		             /*    "oTableTools": {
		                     "sSwfPath": "/swf/copy_csv_xls_pdf.swf"*/
		                 destroy: true,
		                 fixedHeader: {
		                     header: false,
		                     footer: true
		                 },
		
		 "dom": 'T<"clear">lfrtip',
	        "tableTools": {
	            "sSwfPath": "/swf/copy_csv_xls_pdf.swf"
	        }
	});
	
	return datatable;
}

function applyIndividualColSearch(id) {
	 $('#'+id+' tfoot th').each( function () {
	        var title = $(this).text();
	        $(this).html( '<input type="text" placeholder="Search '+title+'" />' );
	    } );
	 
	    // DataTable
	    var datatable = datatableDisplay(id);
	 
	    // Apply the search
	    datatable.columns().every( function () {
	        var that = this;
	 
	        $( 'input', this.footer() ).on( 'keyup change', function () {
	            if ( that.search() !== this.value ) {
	                that
	                    .search( this.value )
	                    .draw();
	            }
	        } );
	    } );
}

function hideTableColumn(configuration) {

	if(configuration.nameColumnDisplay == 'false') {
		$('.name').hide();
	}
	
	if(configuration.addressColumnDisplay == 'false') {
		$('.address').hide();
	}
	
	if(configuration.cityNameColumnDisplay == 'false') {
		$('.city').hide();
	}
	
	if(configuration.branchNameColumnDisplay == 'false') {
		$('.branch').hide();
	}
	
	if(configuration.pincodeColumnDisplay == 'false') {
		$('.pinCode').hide();
	}
	
	if(configuration.contactPersonColumnDisplay == 'false') {
		$('.contactPerson').hide();
	}
	
	if(configuration.departmentColumnDisplay == 'false') {
		$('.department').hide();
	}
	
	if(configuration.mobileNumberColumnDisplay == 'false') {
		$('.mobileNo').hide();
	}
	
	if(configuration.phoneNumberColumnDisplay == 'false') {
		$('.phoneNo').hide();
	}
	
	if(configuration.faxNumberColumnDisplay == 'false') {
		$('.faxNo').hide();
	}
	
	if(configuration.emailAddressColumnDisplay == 'false') {
		$('.email').hide();
	}
	
	if(configuration.partyTypeColumnDisplay == 'false') {
		$('.partyType').hide();
	}
	
	if(configuration.locationColumnDisplay == 'false') {
		$('.location').hide();
	}
	
	if(configuration.accountSubTypeColumnDisplay == 'false') {
		$('.subType').hide();
	}
	
	if(configuration.mobileNumber2ColumnDisplay == 'false') {
		$('.mobileNo2').hide();
	}
	
	if(configuration.phoneNumber2ColumnDisplay == 'false') {
		$('.phoneNo2').hide();
	}
	
	if(configuration.markettingPersonColumnDisplay == 'false') {
		$('.markettingPerson').hide();
	}
	
	if(configuration.serviceTaxNoColumnDisplay == 'false') {
		$('.serviceTaxNo').hide();
	}
	
	if(configuration.tinNumberColumnDisplay == 'false') {
		$('.tinNumber').hide();
	}
	
	if(configuration.panNumberColumnDisplay == 'false') {
		$('.panNumber').hide();
	}
	
	if(configuration.isServiceTaxReqColumnDisplay == 'false') {
		$('.serviceTaxRequired').hide();
	}
	
	if(configuration.isBlackListColumnDisplay == 'false') {
		$('.blackList').hide();
	}
	
	if(configuration.displayNameColumnDisplay == 'false') {
		$('.displayName').hide();
	}
}