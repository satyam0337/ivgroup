var ownerWiseCollectionProperties;
var allOptionsForFromSubRegion;
var allOptionsForFromBranch;
var allOptionsForTOSubRegion;
var allOptionsForTOBranch;
var showLessOtherTopayServiceChargeRow;
var diffCalculationForLessTopay;
var showPaidColumn;
var showToPayColumn;
var showTBBColumn;
var showTopayChargesExceptDDCharge;
define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/ownerWiseCollectionReport/ownerWisePaymentReportfilepath.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'slickGridWrapper2'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'selectizewrapper'
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			slickGridWrapper2, NodValidation, BootstrapModal,ElementFocusNavigation,Selection,Selectizewrapper) {
	'use strict';
	var jsonObject = new Object(),myNod,_this = '',gridObject,masterLangObj,masterLangKeySet,btModal,PrintHeaderModel;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
			//jsonObject	= jsonObjectData.jsonObject;
			btModal			= masterObj.btModal;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/ownerWiseCollectionReportWS/getOwnerWiseCollectionReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails : function(response){
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			let executive	= response.executive;
			ownerWiseCollectionProperties	= response;
			
			allOptionsForFromSubRegion		= ownerWiseCollectionProperties.AllOptionsForSubRegion;
			allOptionsForFromBranch			= ownerWiseCollectionProperties.AllOptionsForBranch;
			allOptionsForTOSubRegion		= ownerWiseCollectionProperties.AllOptionsForDestSubRegion;
			allOptionsForTOBranch			= ownerWiseCollectionProperties.AllOptionForDestinationBranch;
			showLessOtherTopayServiceChargeRow	= ownerWiseCollectionProperties.showLessOtherTopayServiceChargeRow;
			diffCalculationForLessTopay		= ownerWiseCollectionProperties.diffCalculationForLessTopay;
			showTBBColumn					= ownerWiseCollectionProperties.showTBBColumn;
			showPaidColumn					= ownerWiseCollectionProperties.showPaidColumn;
			showToPayColumn					= ownerWiseCollectionProperties.showToPayColumn;
			showTopayChargesExceptDDCharge 	= ownerWiseCollectionProperties.showTopayCharges;
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/ownerWiseCollectionReport/ownerWisePaymentReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").addClass("show");
				}
				/*var SelectTYPE = [
			        { "selectTypeId":1, "selectTypeName": "INCOMING" },
			        { "selectTypeId":2, "selectTypeName": "OUTGOING" },
			    ]
				*/
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
						let keycode = event.which;
						if(keycode == 13){
							next = 'searchBtn';
						}
					}
				});
			
				$("#searchBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onSubmit(_this);								
					}
				});
			});
		}, getToSubRegionByRegion : function() {
			let jsonObject = new Object();
			jsonObject.regionSelectEle_primary_key 		= Number($('#toRegionEle').val());
			jsonObject.AllOptionsForSubRegion 	   		= allOptionsForTOSubRegion;
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getSubRegionOption.do', _this.setToSubRegionOnRegion,EXECUTE_WITH_ERROR);
			
		}, getSubRegionByRegion : function() {
			let jsonObject = new Object();
			jsonObject.regionSelectEle_primary_key 		= Number($('#fromRegionEle').val());
			jsonObject.AllOptionsForSubRegion 	   		= allOptionsForFromSubRegion;
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getSubRegionOption.do', _this.setSubRegionOnRegion,EXECUTE_WITH_ERROR);
			
		}, getBranchBySubRegion : function() {
			if(Number($('#fromSubRegionEle').val()) > 0 || Number($('#fromSubRegionEle').val()) == -1) {
				let jsonObject = new Object();
				jsonObject.subRegionSelectEle_primary_key 	= Number($('#fromSubRegionEle').val());
				jsonObject.AllOptionsForBranch 			 	= allOptionsForFromBranch;
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getBranchOption.do', _this.setBranchOnSubRegion, EXECUTE_WITH_ERROR);
			}	
		}, getToBranchBySubRegion : function() {
			if(Number($('#toSubRegionEle').val()) > 0 || Number($('#toSubRegionEle').val()) == -1) {
				let jsonObject = new Object();
				jsonObject.subRegionSelectEle_primary_key 	= Number($('#toSubRegionEle').val());
				jsonObject.AllOptionsForBranch 			 	= allOptionsForTOBranch;
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getBranchOption.do', _this.setToBranchOnSubRegion, EXECUTE_WITH_ERROR);
			}
		}, setToSubRegionOnRegion : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.subRegion,
				valueField		:	'subRegionId',
				labelField		:	'subRegionName',
				searchField		:	'subRegionName',
				elementId		:	'toSubRegionEle'
			});
			
			if($('#toSubRegionEle').val() == -1) {
				var selectize 		= $('#toSubRegionEle').get(0).selectize;
				selectize.setValue(-1); 
			}
		}, setSubRegionOnRegion : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.subRegion,
				valueField		:	'subRegionId',
				labelField		:	'subRegionName',
				searchField		:	'subRegionName',
				elementId		:	'fromSubRegionEle'
			});
			
			if($('#fromRegionEle').val() == -1) {
				var selectize 		= $('#fromSubRegionEle').get(0).selectize;
				selectize.setValue(-1); 
			}
		}, setBranchOnSubRegion : function(response) {
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
			let selectize2 		= $('#fromRegionEle').get(0).selectize;
			selectize2.setValue(-1); 
			
			//sugama regionId predefined, property based work pending
			let karnatakaRegionId = 1053; //karnatak regionId
			let selectize3 		= $('#toRegionEle').get(0).selectize;
			selectize3.setValue(karnatakaRegionId); 
			
		}, setSelectType : function(){
			_this.setSelectTypeAutocompleteInstance();
		}, setSelectTypeAutocompleteInstance : function() {
			/*var autoSelectTypeName 			= new Object();
			autoSelectTypeName.primary_key 	= 'selectTypeId';
			autoSelectTypeName.field 		= 'selectTypeName';

			$("#selectTypeEle").autocompleteCustom(autoSelectTypeName)*/
		}, getFromSubRegionOnFromRegionChange : function(){
			jsonObject								= new Object();
			jsonObject.regionSelectEle_primary_key	= $('#fromRegionEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getSubRegionOption.do?', _this.setFromSubRegionOption, EXECUTE_WITH_ERROR);
		}, setFromSubRegionOption:function(response){
			let autoSubRegionName = $("#fromSubRegionEle").getInstance();

			$(autoSubRegionName).each(function() {
				this.option.source = response.subRegion;
			});
		}, getFromBranchOnfromSubRegionChange : function() {
			jsonObject									= new Object();
			jsonObject.subRegionEle_primary_key			= $('#fromSubRegionEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getBranchOption.do?', _this.setFromBranch, EXECUTE_WITH_ERROR);
		}, setFromBranch:function(response){
			let autoBranchName = $("#fromBranchEle").getInstance();

			$(autoBranchName).each(function() {
				this.option.source = response.sourceBranch;
			})
		}, getToSubRegionOnToRegionChange : function(){
			jsonObject								= new Object();
			jsonObject.regionSelectEle_primary_key	= $('#toRegionEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getSubRegionOption.do?', _this.setToSubRegionOption, EXECUTE_WITH_ERROR);
		}, setToSubRegionOption : function(response){
			let autoSubRegionName = $("#toSubRegionEle").getInstance();

			$(autoSubRegionName).each(function() {
				this.option.source = response.subRegion;
			});
		}, getToBranchOnToSubRegionChange : function() {
			jsonObject									= new Object();
			jsonObject.subRegionEle_primary_key			= $('#toSubRegionEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getBranchOption.do?', _this.setToBranch, EXECUTE_WITH_ERROR);
		}, setToBranch:function(response) {
			let autoSubRegionName = $("#toBranchEle").getInstance();

			$(autoSubRegionName).each(function() {
				this.option.source = response.sourceBranch;
			});
		}, setSourceDestinationJson : function(jsonObject) {
			jsonObject["regionId"] 					= $('#fromRegionEle').val();
			jsonObject["subRegionId"] 				= $('#fromSubRegionEle').val();
			jsonObject["fromBranchIds"] 			= $('#fromBranchEle').val();
			jsonObject["destinationRegionId"] 		= $('#toRegionEle').val();
			jsonObject["destinationSubRegionId"] 	= $('#toSubRegionEle').val();  
			jsonObject["toBranchIds"] 				= $('#toBranchEle').val();    
		}, onSubmit : function() {
			if(!_this.checkForAllSelection('fromBranchEle', 'From Branch'))
				return false;
			
			if(!_this.checkForAllSelection('toBranchEle', 'To Branch'))
				return false;
			
			if(!_this.checkForAllSelection('fromSubRegionEle', 'From SubRegion'))
				return false;

			if(!_this.checkForAllSelection('toSubRegionEle', 'To SubRegion'))
				return false;
			
			let jsonObject = new Object();
						
			if($("#dateEle").attr('data-startdate') != undefined)
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 

			if($("#dateEle").attr('data-enddate') != undefined)
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			
			_this.setSourceDestinationJson(jsonObject);
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL+'/ownerWiseCollectionReportWS/getOwnerWisePaymnetReportDeatils.do', _this.setreportData1, EXECUTE_WITH_ERROR);
		}, checkForAllSelection : function(id, branchName) {
			let selectedBranch = $('#' + id).val();
			let selectedSubRegion = $('#' + id).val();
			let selectedArr = selectedBranch.split(',');
			
			if(selectedArr.length > 1 && isValueExistInArray(selectedArr, -1)){
				showMessage('error', " You Are  Not Allowed Select Another Branch With All Branch Selection !!");
				return false;
			}
			
			if(selectedBranch == "") {
				showMessage('error', ' Select proper ' + branchName +' !!');
				return false;
			}
			
			if(selectedSubRegion == "") {
				showMessage('error', ' Select proper ' + branchName +' !!');
				return false;
			}
			
			return true;
		}, setreportData1 : function(response) {
			hideLayer();
			if(response.message != undefined){
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}
			
			$('#bottom-border-boxshadow').removeClass();
			$('#reportData1 tbody').empty();
			$('#reportData2 tbody').empty();
			$('#reportData3 tbody').empty();
			$('#ownerPaymentCollectionReport').empty();
			let ownerWiseCollectionReportModelList 	= response.OwnerWiseCollectionReportModel;
			PrintHeaderModel				   		= response.PrintHeaderModel;	
			
			let columnArray		= new Array();
			let count			= 0;
			let paidGrandTotal	= 0;
			let topayGrandTotal	= 0;
			let tbbGrandTotal	= 0;
			let topayServiceChargeTotal = 0;
			let toPayOtherCharge = 0;
			let commissionAmount = 0;
			let incomingPaidGrandTotal	= 0;
			let incomingTopayGrandTotal	= 0;
			let incomingTbbGrandTotal	= 0;
			let incomingDeliveryCharge	= 0;
			let incomingCharge			= 0;
			let lessIncomingDeliveryCharge		= false;
			let topayHamaliTotal				= 0;
			let topayCrossingCharges			= 0;
			let toPayHamaliCharges				= 0;
			let toPayHandlingCharges			= 0;
			let toPayLoadingChargeTotal			= 0;	
			
			if(ownerWiseCollectionReportModelList != undefined && ownerWiseCollectionReportModelList.length > 0) {
				$("#fromDatePrint").html(response.fromDate);
				$("#toDatePrint").html(response.toDate);
				$("#fromSubRegionName").html(response.fromSubRegionName);
				$("#toSubRegionName").html(response.toSubRegionName);
				
				for (let i = 0; i < ownerWiseCollectionReportModelList.length; i++) {
					let obj = ownerWiseCollectionReportModelList[i];
					count 					= count + 1;
					paidGrandTotal			+= obj.paidTotal;
					topayGrandTotal			+= obj.topayTotal;
					tbbGrandTotal			+= obj.tbbTotal;
					topayServiceChargeTotal	+= obj.topayServiceChargeTotal;
					toPayOtherCharge		+= obj.toPayOtherCharge;
					commissionAmount		+= obj.commissionAmount;
					topayHamaliTotal		+= obj.topayHamaliTotal;
					topayCrossingCharges 	+= obj.toPayCrossingCharge
					toPayHamaliCharges		+= obj.toPayHamaliCharge;
					toPayHandlingCharges	+= obj.toPayHandlingCharge;
					toPayLoadingChargeTotal += obj.toPayLoadingChargeTotal;
					
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>"+obj.sourceBranchName+"</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + obj.destinationBranchName + "</td>");
					
					if(showPaidColumn)
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase;color: green;'>" + toFixedWhenDecimal(obj.paidTotal) + "</td>");
					
					if(showToPayColumn)
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + toFixedWhenDecimal(obj.topayTotal) + "</td>");
					
					if(showTBBColumn)
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + toFixedWhenDecimal(obj.tbbTotal) + "</td>");
					
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + toFixedWhenDecimal(obj.totalAmount) + "</td>");
	
					$('#reportData1 tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					
					columnArray	= [];
				}
			}
			
			let grandTotalAmount    = paidGrandTotal + topayGrandTotal + tbbGrandTotal; 
			let totalAmount 		= (paidGrandTotal + topayGrandTotal + tbbGrandTotal) * (0.5 / 100);
				
			let totalColumnArray = new Array();
				
			if(paidGrandTotal > 0 || topayGrandTotal > 0 || tbbGrandTotal > 0 || grandTotalAmount > 0){
				totalColumnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
				totalColumnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
				totalColumnArray.push("<td style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase'>Total</td>");
					
				if(showPaidColumn)
					totalColumnArray.push("<td id='paidGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;color: red; '>"+Math.round(paidGrandTotal)+"</td>");
					
				if(showToPayColumn)
					totalColumnArray.push("<td id='topayGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase'>"+Math.round(topayGrandTotal)+"</td>");

				if(showTBBColumn)
					totalColumnArray.push("<td id='tbbGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase'>"+Math.round(tbbGrandTotal)+"</td>");
					
				totalColumnArray.push("<td id='grandTotalAmount' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase'>"+Math.round(grandTotalAmount)+"</td>");		
				$('#reportData1 tbody').append('<tr>' + totalColumnArray.join(' ') + '</tr>');
			}
				
			if(response.incomingOwnerWiseCollectionReportModelList != undefined && response.incomingOwnerWiseCollectionReportModelList.length > 0) {
				if($('#toRegionEle').val() < 0 && $('#fromRegionEle').val() < 0)
					$("#reportData2").addClass('hide');
				else
					$("#reportData2").removeClass('hide');
			} else
				$("#reportData2").addClass('hide');
				
			let incomingGrandTotalAmount    = incomingPaidGrandTotal + incomingTopayGrandTotal + incomingTbbGrandTotal;
			incomingDeliveryCharge			= incomingCharge * (10 / 100);
			let totalColumnArray2 			= new Array();
			
			if(incomingPaidGrandTotal > 0 || incomingTopayGrandTotal > 0 || incomingTbbGrandTotal > 0 || incomingGrandTotalAmount > 0){
				totalColumnArray2.push("<td style='text-align: center; vertical-align: middle;'></td>");
				totalColumnArray2.push("<td style='text-align: center; vertical-align: middle;'></td>");
				totalColumnArray2.push("<td style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase'>Total</td>");
				totalColumnArray2.push("<td id='paidGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;color: yellow;'>"+Math.round(incomingPaidGrandTotal)+"</td>");
				totalColumnArray2.push("<td id='topayGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase'>"+Math.round(incomingTopayGrandTotal)+"</td>");
				totalColumnArray2.push("<td id='tbbGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase'>"+Math.round(incomingTbbGrandTotal)+"</td>");
				totalColumnArray2.push("<td id='grandTotalAmount' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase'>"+Math.round(incomingGrandTotalAmount)+"</td>");		
				$('#reportData2 tbody').append('<tr>' + totalColumnArray2.join(' ') + '</tr>');
			}
				
			let toPayTotal		= 0;
			let totalPaybleAmount		= 0;
			let lessTopayLabel	= '';
				
			if(diffCalculationForLessTopay && !showLessOtherTopayServiceChargeRow) {
				if(showTopayChargesExceptDDCharge)
					toPayTotal				= topayGrandTotal + topayServiceChargeTotal + toPayOtherCharge + topayHamaliTotal + topayCrossingCharges + toPayHamaliCharges + toPayHandlingCharges + toPayLoadingChargeTotal;
				else
					toPayTotal				= topayGrandTotal + topayServiceChargeTotal + toPayOtherCharge + topayHamaliTotal + toPayLoadingChargeTotal;
				
				totalPaybleAmount   = grandTotalAmount - toPayTotal - commissionAmount - totalAmount - incomingDeliveryCharge;
				
				if(showTopayChargesExceptDDCharge)
					lessTopayLabel	= '<span style="font-size:12px;">(Grand Total + Total Service Charge + Total Other Charge + Total Hamali + Total Crossing Charges + Total Hamali Charges + Total Handling Charges + Total Loading Charge)</span>';
				else
					lessTopayLabel	= '<span style="font-size:12px;">(Grand Total + Total Service Charge + Total Other Charge + Total Hamali + Total Loading Charge)</span>';
			} else
				totalPaybleAmount   = grandTotalAmount - topayGrandTotal - topayServiceChargeTotal - commissionAmount - totalAmount - incomingDeliveryCharge - toPayLoadingChargeTotal;
					
			totalColumnArray = new Array();
			totalColumnArray.push("<td colspan='6' style='font-weight: bold;text-align: right; vertical-align: middle;font-size:15px;'>Less TOPAY : <br>" + lessTopayLabel + "</td>");
					
			if(diffCalculationForLessTopay)
				totalColumnArray.push("<td id='topayGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(toPayTotal)+"</td>");		
			else
				totalColumnArray.push("<td id='topayGrandTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:15px;'>"+Math.round(topayGrandTotal)+"</td>");		

			$('#reportData3 tbody').append('<tr>' + totalColumnArray.join(' ') + '</tr>');
					
			if(showLessOtherTopayServiceChargeRow) {
				totalColumnArray = new Array();
				totalColumnArray.push("<td colspan='6' style='font-weight: bold;text-align: right; vertical-align: middle;font-size:14px;'>Less Other Branch Topay Service Charge : </td>");
				totalColumnArray.push("<td id='topayServiceChargeTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:14px;'>"+Math.round(topayServiceChargeTotal)+"</td>");		
				$('#reportData3 tbody').append('<tr>' + totalColumnArray.join(' ') + '</tr>');
				
				totalColumnArray = new Array();
				totalColumnArray.push("<td colspan='6' style='font-weight: bold;text-align: right; vertical-align: middle;font-size:14px;'>Less Other Branch Topay Loading Charge : </td>");
				totalColumnArray.push("<td id='topayLoadingChargeTotal' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:14px;'>"+Math.round(toPayLoadingChargeTotal)+"</td>");		
				$('#reportData3 tbody').append('<tr>' + totalColumnArray.join(' ') + '</tr>');
			}
					
			totalColumnArray = new Array();
			totalColumnArray.push("<td colspan='6' style='font-weight: bold;text-align: right; vertical-align: middle;font-size:14px;'>Less Operator Expenses ( 30 %) : </td>");
			totalColumnArray.push("<td id='commissionAmount' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:14px;'>"+Math.round(commissionAmount)+"</td>");		
			$('#reportData3 tbody').append('<tr>' + totalColumnArray.join(' ') + '</tr>');
					
			totalColumnArray = new Array();
			totalColumnArray.push("<td colspan='6' style='font-weight: bold;text-align: right; vertical-align: middle;font-size:14px;'>Less Online Charges (0.50 %) On Basic Freight of all LRs : </td>");
			totalColumnArray.push("<td id='grandTotalAmount' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:14px;'>"+Math.round(totalAmount)+"</td>");		
			$('#reportData3 tbody').append('<tr>' + totalColumnArray.join(' ') + '</tr>');
			
			if(lessIncomingDeliveryCharge) {
				totalColumnArray = new Array();
				totalColumnArray.push("<td colspan='6' style='font-weight: bold;text-align: right; vertical-align: middle;font-size:14px;'>Less Incoming Delivery Charge (10% on basic Freight) : </td>");
				totalColumnArray.push("<td id='grandTotalAmount' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:14px;'>"+Math.round(incomingDeliveryCharge)+"</td>");		
				$('#reportData3 tbody').append('<tr>' + totalColumnArray.join(' ') + '</tr>');	
			}
						
			totalColumnArray = new Array();
			totalColumnArray.push("<td colspan='6' style='font-weight: bold;text-align: right; vertical-align: middle;font-size:14px;'>Total Payable : </td>");
			totalColumnArray.push("<td id='grandTotalAmount' style='font-weight: bold;text-align: center; vertical-align: middle; text-transform: uppercase;font-size:14px;'>"+Math.round(totalPaybleAmount)+"</td>");		
			$('#reportData3 tbody').append('<tr>' + totalColumnArray.join(' ') + '</tr>');
				
			let data = new Object();
			data.accountGroupNameForPrint	= PrintHeaderModel.accountGroupName;
			data.branchAddress				= PrintHeaderModel.branchAddress;
			data.branchPhoneNumber			= PrintHeaderModel.branchPhoneNumber;
			data.isLaserPrintAllow			= 'true';
			data.isPlainPrintAllow			= 'true';
			data.isExcelButtonDisplay		= 'true';
			printTable(data, 'reportData', 'ownerPaymentCollectionReport', 'Owner Wise Payment Report', 'ownerPaymentCollectionReport');
		}
	});
});
