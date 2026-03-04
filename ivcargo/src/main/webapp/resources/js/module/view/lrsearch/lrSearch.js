define([  'JsonUtility'
          ,'messageUtility'
          ,'/ivcargo/resources/js/generic/urlparameter.js'
          ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/lrsearch/lrSearchfilepath.js'
          ,'jquerylingua'
          ,'language'
          ,'autocomplete'
          ,'autocompleteWrapper'
          ,'slickGridWrapper2'
          ,'nodvalidation'
          ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
          ,'focusnavigation'//import in require.config
          ,'selectizewrapper'
          ,'moment'
          ],
          function(JsonUtility, MessageUtility, UrlParameter, FilePath,Lingua, Language, AutoComplete, AutoCompleteWrapper,
        		  SlickGridWrapper,NodValidation,datePickerUI,ElementFocusNavigation,Selectizewrapper,moment) {
	'use strict';
	let jsonObject = new Object(), myNod,  _this = '', masterLangObj, masterLangKeySet, executive,isRestrictDateSelection,noOfMonthAllow,selectAllOptionOnlyGroupAdmin,threeMonthDateRange,isDoorDelSelected,configuration,AllOptionsForBranch;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/lRSearchWS/getLRSearchElements.do?', _this.renderLRSearch, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderLRSearch : function (response){
			executive				= response.executive;
			configuration 			= response;
			isRestrictDateSelection	= configuration.restrictBackDateSelection;
			noOfMonthAllow			= configuration.noOfMonthAllow;
			selectAllOptionOnlyGroupAdmin = configuration.selectAllOptionOnlyGroupAdmin;
			AllOptionsForBranch		= configuration.AllOptionsForBranch;
			
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/lrsearch/lrSearch.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
			
				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
				}
			
				let options = new Object();

				options.threeMonthDateRange = configuration.threeMonthDateRange;
				options.monthLimit = configuration.monthLimit;

				$("#dateEle").DatePickerCus(options);
				
				if(selectAllOptionOnlyGroupAdmin){
				var branchCollection = response.branchList;
				branchCollection.unshift({branchId:-1,branchName:"All"});
				}

		if(response.branchList != null){
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.branchList,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'branchEle',
					create			: 	false,
					maxItems		: 	1,
					onChange		: _this.onSourceSelect
				});
		}
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.destinationBranchList,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'destinationBranchEle',
					create			: 	false,
					maxItems		: 	1,
					onChange		: _this.onDestinationSelect
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.PackingGroupTypeMaster,
					valueField		:	'typeOfPackingMasterId',
					labelField		:	'packingTypeName',
					searchField		:	'packingTypeName',
					elementId		:	'articleTypeEle',
					create			: 	false,
					maxItems		: 	1
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.wayBillTypeArr,
					valueField		:	'wayBillTypeId',
					labelField		:	'wayBillType',
					searchField		:	'wayBillType',
					elementId		:	'wayBillTypeEle',
					create			: 	false,
					maxItems		: 	1
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.taxMasterArr,
					valueField		:	'taxMasterId',
					labelField		:	'taxMasterName',
					searchField		:	'taxMasterName',
					elementId		:	'stPaidByEle',
					create			: 	false,
					maxItems		: 	1
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.deliveryToArr,
					valueField		:	'deliveryToId',
					labelField		:	'deliveryToName',
					searchField		:	'deliveryToName',
					elementId		:	'deliveryAtEle',
					create			: 	false,
					maxItems		: 	1
				});
				
				masterLangObj = FilePath.loadLanguage();
				masterLangKeySet = loadLanguageWithParams(masterLangObj);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector		: '#branchEle',
					validate		: 'validateAutocomplete:#branchEle',
					errorMessage	: 'Select proper Source Branch !'
				});
				
				myNod.add({
					selector		: '#destinationBranchEle',
					validate		: 'validateAutocomplete:#destinationBranchEle',
					errorMessage	: 'Select proper Destination Branch !'
				});
				
				if(configuration.mandatoryInvoiceNumber){
					$("#asteriskshow").css("display","block");
					myNod.add({
						selector		: '#invoiceNOEle',
						validate		: 'presence',
						errorMessage	: 'Please Enter Invoice Number'
					});
				}

				if (executive.executiveType == EXECUTIVE_TYPE_BRANCHADMIN || executive.executiveType == EXECUTIVE_TYPE_EXECUTIVE ) {
					$('#branchEle').val(executive.branchId);
				}
				
				hideLayer();
				
				$("#saveBtn").click(function() {
					myNod.performCheck();
				
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
				
				$("#byDateEle").click(function() {
					if ($('#byDateEle').prop('checked'))
						$('#dateSelector').removeClass('hide');
			        else
			        	$('#dateSelector').addClass('hide');
				});
				
				if(configuration.allowAdvLrSearchPratyNameSuggetion){
					let cnorPartyNameAutoComplete 						= new Object();
						cnorPartyNameAutoComplete.primary_key 			= 'corporateAccountId';
						cnorPartyNameAutoComplete.url 					= WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocomplete.do?isSearchByAllParty=true&isShowDeactivateParty=false';
						cnorPartyNameAutoComplete.field 				= 'corporateAccountDisplayName';
						$("#consignorEle").autocompleteCustom(cnorPartyNameAutoComplete);
						
					let cneePartyNameAutoComplete 						= new Object();
						cneePartyNameAutoComplete.primary_key 			= 'corporateAccountId';
						cneePartyNameAutoComplete.url 					= WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocomplete.do?isSearchByAllParty=true&isShowDeactivateParty=false';
						cneePartyNameAutoComplete.field 				= 'corporateAccountDisplayName';
						$("#consigneeEle").autocompleteCustom(cneePartyNameAutoComplete);
				}
				
			});
			return _this;
		},onSubmit : function() {
			if(!AllOptionsForBranch && (!selectAllOptionOnlyGroupAdmin || executive.executiveType != EXECUTIVE_TYPE_GROUPADMIN)) {
				if ($('#branchEle').val() == -1 && $('#destinationBranchEle').val() == -1) {
					hideLayer();
					showMessage('error', 'All In Both Selection is not allowed !');
					return;
				}
			}
		
			showLayer();
				let jsonObject = new Object();
				
				if($("#dateEle").attr('data-startdate') != undefined)
					jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 

				if($("#dateEle").attr('data-enddate') != undefined)
					jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 

				jsonObject["sourceBranchId"] 			= $('#branchEle').val();
				jsonObject["destinationBranchId"] 		= $('#destinationBranchEle').val();
				jsonObject["privateMark"] 				= $('#privateMarkEle').val();
				jsonObject["consignor"] 				= $('#consignorEle').val();
				jsonObject["consignee"] 				= $('#consigneeEle').val();
				jsonObject["packingTypeMasterId"] 		= $('#articleTypeEle').val();
				jsonObject["isSearchByDate"] 			= $('#byDateEle').prop('checked');
				jsonObject["wayBillType"] 				= $('#wayBillTypeEle').val();
				jsonObject["gstPaidBy"] 				= $('#stPaidByEle').val();
				jsonObject["deliveryAt"] 				= $('#deliveryAtEle').val();
				jsonObject["invoiceNo"] 				= $('#invoiceNOEle').val();
				jsonObject["consignorCorpId"] 			= $('#consignorEle_primary_key').val();
				jsonObject["consigneeCorpId"] 			= $('#consigneeEle_primary_key').val();
				jsonObject["lrNumber"] 					= $('#lrNumberEle').val();
				
				isDoorDelSelected = Number($('#deliveryAtEle').val()) == 2;
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/lRSearchWS/getLRSearchDetails.do', _this.setLRSearchDetails, EXECUTE_WITH_ERROR);
		}, setLRSearchDetails : function(response){
			if(response.message != undefined){
				$('#bottom-border-boxshadow').addClass('hide');
				hideLayer();
				let errorMessage = response.message;
				showMessage('error', errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
			
			let ColumnConfig = response.tableConfig.columnConfiguration;
			let columnKeys	= _.keys(ColumnConfig);
			let bcolConfig	= new Object();
			
			for (const element of columnKeys) {
				let bObj	= ColumnConfig[element];

				if (bObj.show)
					bcolConfig[element] = bObj;
			}
			
			response.tableConfig.columnConfiguration	= bcolConfig;
			
			response.tableConfig.Language	= masterLangKeySet;
			
			if(!isDoorDelSelected && response.tableConfig.columnConfiguration.doorDelivery != undefined)
				response.tableConfig.columnConfiguration.doorDelivery.columnHidden = true;
			
			if(response.tableConfig.CorporateAccount != undefined) {
				$('#bottom-border-boxshadow').removeClass('hide');
				hideAllMessages();
				SlickGridWrapper.setGrid(response.tableConfig);
			}
			
			hideLayer();
		},onDestinationSelect : function (){
			if($('#destinationBranchEle').val() == -1){
					myNod.add({
						selector: '#byDateEle',
						validate: 'checked',
						errorMessage: 'Please Select Date !'
					});
					
					if (executive.executiveType != EXECUTIVE_TYPE_GROUPADMIN) {
						let options		= new Object();
							options.threeMonthDateRange	= configuration.threeMonthDateRange;
						if(isRestrictDateSelection) {
							options.minDate = moment().subtract(noOfMonthAllow, 'months').format('DD/MM/YYYY');
							$("#dateEle").DatePickerCus(options);
							$('#byDateEle').prop('checked',false);
							$('#dateSelector').addClass('hide');
						}
					}
			}
		},onSourceSelect : function(){
			if($('#branchEle').val() == -1){
				myNod.add({
					selector: '#byDateEle',
					validate: 'checked',
					errorMessage: 'Please Select Date !'
				});
				
				if (executive.executiveType != EXECUTIVE_TYPE_GROUPADMIN) {
					let options		= new Object();
						options.threeMonthDateRange	= configuration.threeMonthDateRange;;
					if(isRestrictDateSelection){
						options.minDate = moment().subtract(noOfMonthAllow, 'months').format('DD/MM/YYYY');
						$("#dateEle").DatePickerCus(options);
						$('#byDateEle').prop('checked',false);
						$('#dateSelector').addClass('hide');
					}
				}
			}
		}
	});
});

function transportSearch(grid,dataView,row){
	if(dataView.getItem(row).wayBillId != undefined){
		window.open('TransportSearchWayBillAction.do?pageId=3&eventId=8&wayBillId='+dataView.getItem(row).wayBillId+'&wayBillNumber='+dataView.getItem(row).wayBillNumber+'&flag=true&id=search+&userErrorId=0&errorAssociatedToNumber=');
	} 
}