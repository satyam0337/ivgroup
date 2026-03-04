var ownerWiseCollectionProperties;
var allowLrTypeAmntAsLink;

define([  
	PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/ownerWiseCollectionReport/ownerWiseCollectionrReportfilepath.js'
	,'selectizewrapper'
	,'slickGridWrapper2'
	,'JsonUtility'
	,'messageUtility'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	],function(Selection, FilePath, Selectizewrapper) {
	'use strict';
	let jsonObject = new Object(),myNod,_this = '',masterLangObj,masterLangKeySet,PrintHeaderModel, showLoadingCharge = false;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/ownerWiseCollectionReportWS/getOwnerWiseCollectionReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails : function(response){
			let loadelement				= new Array();
			let baseHtml 				= new $.Deferred();
			let executive				= response.executive;
			ownerWiseCollectionProperties	= response;
			allowLrTypeAmntAsLink			= ownerWiseCollectionProperties.allowLrTypeAmntAsLink;
			showLoadingCharge				= ownerWiseCollectionProperties.showLoadingCharge;
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/ownerWiseCollectionReport/ownerWiseCollectionReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
				}
				
				let SelectTYPE = [
			        { "selectTypeId":1, "selectTypeName": "INCOMING" },
			        { "selectTypeId":2, "selectTypeName": "OUTGOING" },
			    ]
				
				$('#bottom-border-boxshadow').addClass('hide');
				let options		= new Object();
				options.minDate	= response.minDateString;
				$("#dateEle").DatePickerCus(options);
				
				if (executive.executiveType == EXECUTIVE_TYPE_GROUPADMIN) {
					 Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.regionList,
						valueField		:	'regionId',
						labelField		:	'regionName',
						searchField		:	'regionName',
						elementId		:	'fromRegionEle',
						create			: 	false,
						maxItems		: 	1
					});
				}	
				
				if (executive.executiveType == EXECUTIVE_TYPE_REGIONADMIN) {
					 Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.subRegionList,
						valueField		:	'subRegionId',
						labelField		:	'subRegionName',
						searchField		:	'subRegionName',
						elementId		:	'fromSubRegionEle',
						create			: 	false,
						maxItems		: 	1
					});
				}
				
				if (executive.executiveType == EXECUTIVE_TYPE_SUBREGIONADMIN) {
					 Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.branchList,
						valueField		:	'branchId',
						labelField		:	'branchName',
						searchField		:	'branchName',
						elementId		:	'fromBranchEle',
						create			: 	false,
						maxItems		: 	1
					});
				}

				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.toregionList,
					valueField		:	'regionId',
					labelField		:	'regionName',
					searchField		:	'regionName',
					elementId		:	'toRegionEle',
					create			: 	false,
					maxItems		: 	1
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	SelectTYPE,
					valueField		:	'selectTypeId',
					labelField		:	'selectTypeName',
					searchField		:	'selectTypeName',
					elementId		:	'selectTypeEle',
					create			: 	false,
					maxItems		: 	1
				});
				
				$("#fromRegionEle").change(function(){
					_this.getSubRegionByRegion();
				});
				
				$("#fromSubRegionEle").change(function(){
					_this.getBranchBySubRegion();
				});
				
				$("#toRegionEle").change(function(){
					_this.getToSubRegionByRegion();
				});
				
				$("#toSubRegionEle").change(function(){
					_this.getToBranchBySubRegion();
				});
				
				if (executive.executiveType == EXECUTIVE_TYPE_REGIONADMIN) {
					$("#fromRegionEle").val(executive.regionId);
					let autoSubRegionName = $("#fromSubRegionEle").getInstance();
					$(autoSubRegionName).each(function() {
						this.option.source = response.subRegionList;
					});
					
				}
				
				if (executive.executiveType == EXECUTIVE_TYPE_SUBREGIONADMIN) {
					$("#fromRegionEle").val(executive.regionId);
					$("#fromSubRegionEle").val(executive.subRegionId);
					let autoBranchName = $("#fromBranchEle").getInstance();

					$(autoBranchName).each(function() {
						this.option.source = response.branchList;
					})
					
				}
				
				if (executive.executiveType == EXECUTIVE_TYPE_BRANCHADMIN) {
					$("#fromregionEle").val(executive.regionId);
					$("#fromsubRegionEle").val(executive.subRegionId);
					$("#frombranchEle").val(executive.branchId);
				}
				
				if (executive.executiveType == EXECUTIVE_TYPE_EXECUTIVE) {
					$("#fromregionEle").val(executive.regionId);
					$("#fromsubRegionEle").val(executive.subRegionId);
					$("#frombranchEle").val(executive.branchId);
				}
				
				masterLangObj = FilePath.loadLanguage();
				masterLangKeySet = loadLanguageWithParams(masterLangObj);
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod.add({
					selector: '#fromRegionEle_wrapper',
					validate: 'validateAutocomplete:#fromRegionEle',
					errorMessage: 'Select proper Region !'
				});

				myNod.add({
					selector: '#fromSubRegionEle_wrapper',
					validate: 'validateAutocomplete:#fromSubRegionEle',
					errorMessage: 'Select proper Area !'
				});

				myNod.add({
					selector: '#fromBranchEle_wrapper',
					validate: 'validateAutocomplete:#fromBranchEle',
					errorMessage: 'Select proper Branch !'
				});
				
				
				myNod.add({
					selector: '#toRegionEle_wrapper',
					validate: 'validateAutocomplete:#toRegionEle',
					errorMessage: 'Select proper Region !'
				});

				myNod.add({
					selector: '#toSubRegionEle_wrapper',
					validate: 'validateAutocomplete:#toSubRegionEle',
					errorMessage: 'Select proper Area !'
				});

				myNod.add({
					selector: '#toBranchEle_wrapper',
					validate: 'validateAutocomplete:#toBranchEle',
					errorMessage: 'Select proper Branch !'
				});
				
				hideLayer();
				
				$("#searchBtn").keyup(function(event) {
					if(event.which){
						var keycode = event.which;
						if(keycode == 13){
							next = 'searchBtn';
						}
					}
				});
			
				$("#searchBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
				
				_this.setPreDefinedValues();
			});
			
		},getToSubRegionByRegion : function() {
			let jsonObject = new Object();
			jsonObject.regionSelectEle_primary_key 		= Number($('#toRegionEle').val());
			jsonObject.AllOptionsForSubRegion 	   		= ownerWiseCollectionProperties.AllOptionsForDestSubRegion;
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getSubRegionOption.do', _this.setToSubRegionOnRegion,EXECUTE_WITH_ERROR);
			
		},getSubRegionByRegion : function() {
			let jsonObject = new Object();
			jsonObject.regionSelectEle_primary_key 		= Number($('#fromRegionEle').val());
			jsonObject.AllOptionsForSubRegion 	   		= ownerWiseCollectionProperties.AllOptionsForSubRegion;
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getSubRegionOption.do', _this.setSubRegionOnRegion,EXECUTE_WITH_ERROR);
			
		},getBranchBySubRegion : function() {
			
			if(Number($('#fromSubRegionEle').val()) > 0 || Number($('#fromSubRegionEle').val()) == -1) {
				let jsonObject = new Object();
				jsonObject.subRegionSelectEle_primary_key 	= Number($('#fromSubRegionEle').val());
				jsonObject.AllOptionsForBranch 			 	= ownerWiseCollectionProperties.AllOptionsForBranch;
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getBranchOption.do', _this.setBranchOnSubRegion, EXECUTE_WITH_ERROR);
			}
			
		},getToBranchBySubRegion : function() {
			if(Number($('#toSubRegionEle').val()) > 0 || Number($('#toSubRegionEle').val()) == -1) {
				let jsonObject = new Object();
				jsonObject.subRegionSelectEle_primary_key 	= Number($('#toSubRegionEle').val());
				jsonObject.AllOptionsForBranch 			 	= ownerWiseCollectionProperties.AllOptionForDestinationBranch;
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getBranchOption.do', _this.setToBranchOnSubRegion, EXECUTE_WITH_ERROR);
			}	
		},setToSubRegionOnRegion : function(response) {
			
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.subRegion,
				valueField		:	'subRegionId',
				labelField		:	'subRegionName',
				searchField		:	'subRegionName',
				elementId		:	'toSubRegionEle'
			});
			
			if($('#toRegionEle').val() == -1) {
				let selectize 		= $('#toSubRegionEle').get(0).selectize;
				selectize.setValue(-1);
			}
		},setSubRegionOnRegion : function(response) {
			
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.subRegion,
				valueField		:	'subRegionId',
				labelField		:	'subRegionName',
				searchField		:	'subRegionName',
				elementId		:	'fromSubRegionEle'
			});
			
			if($('#fromRegionEle').val() == -1) {
				let selectize 		= $('#fromSubRegionEle').get(0).selectize;
				selectize.setValue(-1); 
			}
			
		},setBranchOnSubRegion : function(response) {
			
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.sourceBranch,
				valueField		:	'branchId',
				labelField		:	'branchName',
				searchField		:	'branchName',
				elementId		:	'fromBranchEle',
				create			: 	false,
				maxItems		: 	100
			});
			let selectize 		= $('#fromBranchEle').get(0).selectize;
			selectize.setValue(-1); 
		},setToBranchOnSubRegion : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.sourceBranch,
				valueField		:	'branchId',
				labelField		:	'branchName',
				searchField		:	'branchName',
				elementId		:	'toBranchEle',
				create			: 	false,
				maxItems		: 	100
			});
			
			let selectize 		= $('#toBranchEle').get(0).selectize;
			selectize.setValue(-1); 
		},setPreDefinedValues : function(){
			
			let selectize 		= $('#selectTypeEle').get(0).selectize;
			selectize.setValue(2); 
			
			let selectize2 		= $('#fromRegionEle').get(0).selectize;
			selectize2.setValue(-1); 
			
			//sugama regionId predefined, property based work pending
			let karnatakaRegionId = 1053; //karnatak regionId
			let selectize3 		= $('#toRegionEle').get(0).selectize;
			selectize3.setValue(karnatakaRegionId); 
		},setSelectType : function(){
			_this.setSelectTypeAutocompleteInstance();
			
			let autoSelectType = $("#selectTypeEle").getInstance();
			
			$( autoSelectType ).each(function() {
				this.option.source = SelectTYPE;
			})
		},setSelectTypeAutocompleteInstance : function() {
			let autoSelectTypeName 			= new Object();
			autoSelectTypeName.primary_key 	= 'selectTypeId';
			autoSelectTypeName.field 		= 'selectTypeName';

			$("#selectTypeEle").autocompleteCustom(autoSelectTypeName)
		},getFromSubRegionOnFromRegionChange : function(){
			$("#fromSubRegionEle").val('');
			$("#fromSubRegionEle_primary_key").val('');
			jsonObject								= new Object();
			jsonObject.regionSelectEle_primary_key	= $('#fromRegionEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getSubRegionOption.do?',_this.setFromSubRegionOption, EXECUTE_WITH_ERROR);
		},setFromSubRegionOption:function(response){
			let autoSubRegionName = $("#fromSubRegionEle").getInstance();

			$(autoSubRegionName).each(function() {
				this.option.source = response.subRegion;
			});
			
		},getFromBranchOnfromSubRegionChange : function(){
			jsonObject									= new Object();
			jsonObject.subRegionEle_primary_key			= $('#fromSubRegionEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getBranchOption.do?',_this.setFromBranch, EXECUTE_WITH_ERROR);
		},setFromBranch:function(response){
			let autoBranchName = $("#fromBranchEle").getInstance();

			$(autoBranchName).each(function() {
				this.option.source = response.sourceBranch;
			})
			
		},getToSubRegionOnToRegionChange : function(){
			jsonObject								= new Object();
			jsonObject.regionSelectEle_primary_key	= $('#toRegionEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getSubRegionOption.do?',_this.setToSubRegionOption, EXECUTE_WITH_ERROR);
		},setToSubRegionOption : function(response){
			let autoSubRegionName = $("#toSubRegionEle").getInstance();

			$(autoSubRegionName).each(function() {
				this.option.source = response.subRegion;
			});
		},getToBranchOnToSubRegionChange : function(){
			jsonObject									= new Object();
			jsonObject.subRegionEle_primary_key			= $('#toSubRegionEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getBranchOption.do?',_this.setToBranch, EXECUTE_WITH_ERROR);
		},setToBranch:function(response){
			let autoSubRegionName = $("#toBranchEle").getInstance();

			$(autoSubRegionName).each(function() {
				this.option.source = response.sourceBranch;
			});
		},setSourceDestinationJson : function(jsonObject) {
			let selectType						= $('#selectTypeEle').val();

			if(selectType == 1){ //incoming
				jsonObject["regionId"] 					= $('#toRegionEle').val(); 
				jsonObject["subRegionId"] 				= $('#toSubRegionEle').val();     
				jsonObject["fromBranchIds"] 			= $('#toBranchEle').val();   
				jsonObject["destinationRegionId"] 		= $('#fromRegionEle').val();   
				jsonObject["destinationSubRegionId"] 	= $('#fromSubRegionEle').val();     
				jsonObject["toBranchIds"] 				= $('#fromBranchEle').val();             
			} else if (selectType == 2){ //outgoing
				jsonObject["regionId"] 					= $('#fromRegionEle').val();
				jsonObject["subRegionId"] 				= $('#fromSubRegionEle').val();
				jsonObject["fromBranchIds"] 			= $('#fromBranchEle').val();
				jsonObject["destinationRegionId"] 		= $('#toRegionEle').val();
				jsonObject["destinationSubRegionId"] 	= $('#toSubRegionEle').val();  
				jsonObject["toBranchIds"] 				= $('#toBranchEle').val();    
			}
		},onSubmit : function() {
			let jsonObject = new Object();
			
			if($("#dateEle").attr('data-startdate') != undefined)
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 

			if($("#dateEle").attr('data-enddate') != undefined)
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			
			if(!_this.checkForAllSelection('fromBranchEle', 'From Branch')) 
				return false;
			
			if(!_this.checkForAllSelection('toBranchEle', 'To Branch'))
				return false;

			if(!_this.checkForAllSelection('fromSubRegionEle', 'From SubRegion'))
				return false;
			
			if(!_this.checkForAllSelection('toSubRegionEle', 'To SubRegion'))
				return false;
			
			_this.setSourceDestinationJson(jsonObject);
			
			showLayer();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/ownerWiseCollectionReportWS/getOwnerWiseCollectionReportDeatils.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, checkForAllSelection : function(id, branchName) {
			let selectedBranch = $('#' + id).val();
			let selectedSubRegion = $('#' + id).val();
			let selectedArr = selectedBranch.split(',');
			
			if(selectedArr.length > 1 && isValueExistInArray(selectedArr, -1)){
				showMessage('error', " You Are  Not Allowed Select Another Branch With All Branch Selection !!");
				return false;
			}
			
			if(selectedBranch == ""){
				showMessage('error', ' Select proper ' + branchName +' !!');
				$('#' + id).focus();
				return false;
			}
			
			if(selectedSubRegion == ""){
				showMessage('error', ' Select proper ' + branchName +' !!');
				return false;
			}
			
			return true;
		},setReportData : function(response) {
			hideLayer();
			
			if(response.message != undefined){
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}
			
			$('#bottom-border-boxshadow').removeClass('hide');
			$('#reportData1 tbody').empty();
			$('#ownerWiseCollectionReport').empty();
			
			let ownerWiseCollectionReportModelList 	= response.CorporateAccount;
			PrintHeaderModel				   		= response.PrintHeaderModel;
			
			if(ownerWiseCollectionReportModelList != undefined && ownerWiseCollectionReportModelList.length > 0) {
				
				$('#reportData1 thead').empty();
				let headerColumnArray = new Array();
				
				headerColumnArray.push('<th class="titletd" style="width: 4%; text-align: center;font-size:15px;">Sr No.</th>');
				headerColumnArray.push('<th class="titletd" style="width: 4%; text-align: center;font-size:15px;">City</th>');
				headerColumnArray.push('<th class="titletd" style="width: 4%; text-align: center;font-size:15px;">To Branch</th>');
				headerColumnArray.push('<th class="titletd" style="width: 4%; text-align: center;font-size:15px;">Paid Amount </th>');
				headerColumnArray.push('<th class="titletd" style="width: 4%; text-align: center;font-size:15px;">Topay Amount </th>');
				headerColumnArray.push('<th class="titletd" style="width: 4%; text-align: center;font-size:15px;">TBB Amount</th>');
				headerColumnArray.push('<th class="titletd" style="width: 4%; text-align: center;font-size:15px;">Paid Service Charge</th>');
				headerColumnArray.push('<th class="titletd" style="width: 4%; text-align: center;font-size:15px;">Topay Service Charge</th>');
				headerColumnArray.push('<th class="titletd" style="width: 4%; text-align: center;font-size:15px;">TBB Service Charge</th>');
				
				if(showLoadingCharge) {
					headerColumnArray.push('<th class="titletd" style="width: 4%; text-align: center;font-size:15px;">Paid Loading Charge</th>');
					headerColumnArray.push('<th class="titletd" style="width: 4%; text-align: center;font-size:15px;">ToPay Loading Charge</th>');
					headerColumnArray.push('<th class="titletd" style="width: 4%; text-align: center;font-size:15px;">TBB Loading Charge</th>');
				}
				
				headerColumnArray.push('<th class="titletd" style="width: 4%; text-align: center;font-size:15px;">Paid Other Charge</th>');
				headerColumnArray.push('<th class="titletd" style="width: 4%; text-align: center;font-size:15px;">ToPay Other Charge</th>');
				headerColumnArray.push('<th class="titletd" style="width: 4%; text-align: center;font-size:15px;">TBB Other Charge</th>');
				headerColumnArray.push('<th class="titletd" style="width: 4%; text-align: center;font-size:15px;">Paid Handling Charge</th>');
				headerColumnArray.push('<th class="titletd" style="width: 4%; text-align: center;font-size:15px;">ToPay Handling Charge</th>');
				headerColumnArray.push('<th class="titletd" style="width: 4%; text-align: center;font-size:15px;">TBB Handling Charge</th>');
				headerColumnArray.push('<th class="titletd" style="width: 4%; text-align: center;font-size:15px;">Door Delivery</th>');
				headerColumnArray.push('<th class="titletd" style="width: 4%; text-align: center;font-size:15px;">Paid Hamali Charge</th>');
				headerColumnArray.push('<th class="titletd" style="width: 4%; text-align: center;font-size:15px;">ToPay Hamali Charge</th>');
				headerColumnArray.push('<th class="titletd" style="width: 4%; text-align: center;font-size:15px;">TBB Hamali Charge</th>');
				headerColumnArray.push('<th class="titletd" style="width: 4%; text-align: center;font-size:15px;">Paid Crossing Charge</th>');
				headerColumnArray.push('<th class="titletd" style="width: 4%; text-align: center;font-size:15px;">ToPay Crossing Charge</th>');
				headerColumnArray.push('<th class="titletd" style="width: 4%; text-align: center;font-size:15px;">TBB Crossing Charge</th>');
				headerColumnArray.push('<th class="titletd" style="width: 4%; text-align: center;font-size:15px;">Total</th>');
				
				$('#reportData1 thead').append('<tr class="text-info text-center">' + headerColumnArray.join(' ') + '</tr>');
				
				var columnArray		= new Array();
				var count			= 0;
				var paidGrandTotal	= 0;
				var topayGrandTotal	= 0;
				var tbbGrandTotal	= 0;
				var paidServiceChargeTotal 	= 0;
				var topayServiceChargeTotal = 0;
				var tbbServiceChargeTotal 	= 0;
				var commissionAmount 		= 0;
				var doorDeliveryTotal 		= 0;
				var paidOtherCharge			= 0;
				var toPayOtherCharge		= 0;
				var tbbOtherCharge			= 0;
				var paidHandlingCharge		= 0;
				var toPayHandlingCharge		= 0;
				var tbbHandlingCharge		= 0;
				var paidHamaliCharge		= 0;
				var toPayHamaliCharge		= 0;
				var tbbHamaliCharge			= 0;
				let paidCrossingCharge		= 0;
				let toPayCrossingCharge		= 0;
				let tbbCrossingCharge		= 0;
				let paidLoadingChargeTotal	= 0;
				let toPayLoadingChargeTotal	= 0;
				let tbbLoadingChargeTotal	= 0;
				
				for (let i = 0; i < ownerWiseCollectionReportModelList.length; i++) {
					let obj = ownerWiseCollectionReportModelList[i];
					count 					+= 1;
					paidGrandTotal			+= obj.paidTotal;
					topayGrandTotal			+= obj.topayTotal;
					tbbGrandTotal			+= obj.tbbTotal;
					paidServiceChargeTotal	+= obj.paidServiceChargeTotal;
					topayServiceChargeTotal	+= obj.topayServiceChargeTotal;
					tbbServiceChargeTotal	+= obj.tbbServiceChargeTotal;
					doorDeliveryTotal		+= obj.doorDeliveryTotal;
					commissionAmount		+= obj.commissionAmount;
					paidOtherCharge			+= obj.paidOtherCharge;
					toPayOtherCharge		+= obj.toPayOtherCharge;
					tbbOtherCharge			+= obj.tbbOtherCharge;
					paidHandlingCharge		+= obj.paidHandlingCharge;
					toPayHandlingCharge		+= obj.toPayHandlingCharge;
					tbbHandlingCharge		+= obj.tbbHandlingCharge;
					paidHamaliCharge		+= obj.paidHamaliCharge;
					toPayHamaliCharge		+= obj.toPayHamaliCharge;
					tbbHamaliCharge			+= obj.tbbHamaliCharge;
					paidCrossingCharge		+= obj.paidCrossingCharge;
					toPayCrossingCharge		+= obj.toPayCrossingCharge;
					tbbCrossingCharge		+= obj.tbbCrossingCharge;
					
					if(showLoadingCharge) {
						paidLoadingChargeTotal	+= obj.paidLoadingChargeTotal;
						toPayLoadingChargeTotal	+= obj.toPayLoadingChargeTotal;
						tbbLoadingChargeTotal	+= obj.tbbLoadingChargeTotal;
					}
					
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;''>" + (i + 1) + "</td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;''>"+obj.sourceBranchName+"</td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + obj.destinationBranchName + "</td>");
					
					if(allowLrTypeAmntAsLink) {
						if(obj.paidTotal > 0)
							columnArray.push("<td id='paidTotalId' class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;color:blue'><span style='cursor:pointer;' onclick='getLrTypeWiseDetails("+obj.paidTotal+ ','+1+','+obj.fromSubRegionId+','+obj.destinationBranchId+")'>" + toFixedWhenDecimal(obj.paidTotal) + "</span></td>");
						else
							columnArray.push("<td id='paidTotalId' class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + toFixedWhenDecimal(obj.paidTotal) +"</td>");
						
						if(obj.topayTotal > 0)
							columnArray.push("<td id='topayTotalId' class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;color:blue'><span style='cursor:pointer;' onclick='getLrTypeWiseDetails("+obj.topayTotal+ ','+2+','+obj.fromSubRegionId+','+obj.destinationBranchId+")'>" + toFixedWhenDecimal(obj.topayTotal) + "</span></td>");
						else
							columnArray.push("<td id='topayTotalId' class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + toFixedWhenDecimal(obj.topayTotal) + "</td>");
						
						if(obj.tbbTotal > 0)
							columnArray.push("<td id='tbbTotalId' class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;color:blue'><span style='cursor:pointer;' onclick='getLrTypeWiseDetails("+obj.tbbTotal+ ','+4+','+obj.fromSubRegionId+','+obj.destinationBranchId+")'>" + toFixedWhenDecimal(obj.tbbTotal) + "</span></td>");
						else
							columnArray.push("<td id='tbbTotalId' class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + toFixedWhenDecimal(obj.tbbTotal) + "</td>");
					} else {
						columnArray.push("<td id='paidTotalId' class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + toFixedWhenDecimal(obj.paidTotal) +"</td>");
						columnArray.push("<td id='topayTotalId' class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + toFixedWhenDecimal(obj.topayTotal) + "</td>");
						columnArray.push("<td id='tbbTotalId' class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + toFixedWhenDecimal(obj.tbbTotal) + "</td>");
					}
					
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + obj.paidServiceChargeTotal + "</td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + obj.topayServiceChargeTotal + "</td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + obj.tbbServiceChargeTotal + "</td>");
					
					if(showLoadingCharge) {
						columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + obj.paidLoadingChargeTotal + "</td>");
						columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + obj.toPayLoadingChargeTotal + "</td>");
						columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + obj.tbbLoadingChargeTotal + "</td>");
					}
					
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + obj.paidOtherCharge + "</td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + obj.toPayOtherCharge + "</td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + obj.tbbOtherCharge + "</td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + obj.paidHandlingCharge + "</td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + obj.toPayHandlingCharge + "</td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + obj.tbbHandlingCharge + "</td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + obj.doorDeliveryTotal  + "</td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + obj.paidHamaliCharge  + "</td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + obj.toPayHamaliCharge  + "</td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + obj.tbbHamaliCharge  + "</td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + obj.paidCrossingCharge  + "</td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + obj.toPayCrossingCharge  + "</td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + obj.tbbCrossingCharge  + "</td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + toFixedWhenDecimal(obj.totalAmount + obj.paidCrossingCharge + obj.toPayCrossingCharge + obj.tbbCrossingCharge) + "</td>");
	
					$('#reportData1 tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					
					if(ownerWiseCollectionReportModelList.length == count ) {
						let totalColumnArray = new Array();
						let grandTotalAmount = paidGrandTotal + topayGrandTotal + tbbGrandTotal + paidServiceChargeTotal + topayServiceChargeTotal + tbbServiceChargeTotal + paidHamaliCharge + toPayHamaliCharge + tbbHamaliCharge + doorDeliveryTotal + paidOtherCharge + toPayOtherCharge + tbbOtherCharge + paidHandlingCharge + toPayHandlingCharge + tbbHandlingCharge + paidCrossingCharge + toPayCrossingCharge + tbbCrossingCharge + paidLoadingChargeTotal + toPayLoadingChargeTotal + tbbLoadingChargeTotal;
						totalColumnArray.push("<td class='datatd' colspan='3'style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>Total</td>");
						totalColumnArray.push("<td class='datatd' id='paidGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(paidGrandTotal)+"</td>");
						totalColumnArray.push("<td class='datatd' id='topayGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(topayGrandTotal)+"</td>");
						totalColumnArray.push("<td class='datatd' id='tbbGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(tbbGrandTotal)+"</td>");
						totalColumnArray.push("<td class='datatd' id='paidGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(paidServiceChargeTotal)+"</td>");
						totalColumnArray.push("<td class='datatd' id='topayGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(topayServiceChargeTotal)+"</td>");
						totalColumnArray.push("<td class='datatd' id='topayGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(tbbServiceChargeTotal)+"</td>");
						
						if(showLoadingCharge) {
							totalColumnArray.push("<td class='datatd' id='paidGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(paidLoadingChargeTotal)+"</td>");
							totalColumnArray.push("<td class='datatd' id='paidGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(toPayLoadingChargeTotal)+"</td>");
							totalColumnArray.push("<td class='datatd' id='paidGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(tbbLoadingChargeTotal)+"</td>");
						}
						
						totalColumnArray.push("<td class='datatd' id='tbbGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(paidOtherCharge)+"</td>");
						totalColumnArray.push("<td class='datatd' id='tbbGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(toPayOtherCharge)+"</td>");
						totalColumnArray.push("<td class='datatd' id='tbbGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(tbbOtherCharge)+"</td>");
						totalColumnArray.push("<td class='datatd' id='tbbGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(paidHandlingCharge)+"</td>");
						totalColumnArray.push("<td class='datatd' id='tbbGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(toPayHandlingCharge)+"</td>");
						totalColumnArray.push("<td class='datatd' id='tbbGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(tbbHandlingCharge)+"</td>");
						totalColumnArray.push("<td class='datatd' id='topayGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(doorDeliveryTotal)+"</td>");
						totalColumnArray.push("<td class='datatd' id='paidHamaliCharge' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(paidHamaliCharge)+"</td>");
						totalColumnArray.push("<td class='datatd' id='toPayHamaliCharge' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(toPayHamaliCharge)+"</td>");
						totalColumnArray.push("<td class='datatd' id='tbbHamaliCharge' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(tbbHamaliCharge)+"</td>");
						totalColumnArray.push("<td class='datatd' id='paidCrossingCharge' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(paidCrossingCharge)+"</td>");
						totalColumnArray.push("<td class='datatd' id='toPayCrossingCharge' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(toPayCrossingCharge)+"</td>");
						totalColumnArray.push("<td class='datatd' id='tbbCrossingCharge' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(tbbCrossingCharge)+"</td>");
						totalColumnArray.push("<td class='datatd' id='grandTotalAmount' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(grandTotalAmount)+"</td>");		
						
						$('#reportData1 tbody').append('<tr>' + totalColumnArray.join(' ') + '</tr>');
						totalColumnArray=[];
					}
					
					columnArray	= [];
				}
				
				let fromDate	= $("#dateEle").attr('data-startdate');
				let toDate		= $("#dateEle").attr('data-enddate');
				let subRegion	= $('#fromSubRegionEle').val();
				
				$('#selectedDate').html("From : "+fromDate+" To : "+toDate);
				$('#selectedSubregion').html("Owner Name : "+subRegion);
				$('#printDate').html("Print Date :"+new Date().toLocaleString());
				
				let data = new Object();
				data.accountGroupNameForPrint	= PrintHeaderModel.accountGroupName;
				data.branchAddress				= PrintHeaderModel.branchAddress;
				data.branchPhoneNumber			= PrintHeaderModel.branchPhoneNumber;
				data.isLaserPrintAllow			= 'true';
				data.isPlainPrintAllow			= 'false';
				data.isExcelButtonDisplay		= 'true';
				printTable(data, 'reportData', 'ownerWiseCollectionReport', 'Owner Wise Collection Report', 'ownerWiseCollectionReport');
			}
		}
	});		
});

function getLrTypeWiseDetails(totalAmount,waybillTypeId,fromSubRegionId,destBranchId){
	if(allowLrTypeAmntAsLink)
		lrTypeWiseDetails(waybillTypeId,fromSubRegionId,destBranchId);
}

function lrTypeWiseDetails(waybillTypeId,fromSubRegionId,destBranchId){
	showLayer();
	let jsonObject = new Object();

	if($("#dateEle").attr('data-startdate') != undefined)
		jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 

	if($("#dateEle").attr('data-enddate') != undefined)
		jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
		
	jsonObject["lrType"] 	= waybillTypeId; 
	jsonObject["subRegionId"] = fromSubRegionId; 
	jsonObject["destinationBranchId"] = destBranchId; 
	 
	require([PROJECT_IVUIRESOURCES + '/resources/js/module/view/ownerWiseCollectionReport/LRDetailsForOwnerWiseCollectionReport.js'], function(LRDetails){
		let btModal = new Backbone.BootstrapModal({
			content		: new LRDetails(jsonObject),
			modalWidth 	: 80,
			okText		: 'Close',
			showFooter 	: true,
			title		: '<center>LR Details</center>'
		}).open();
	});
}