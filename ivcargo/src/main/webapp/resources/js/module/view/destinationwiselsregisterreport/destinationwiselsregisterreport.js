
var destinationWiseLSRegister = null;
define([  'JsonUtility'
          ,'messageUtility'
          ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/destinationwiselsregisterreport/destinationwiselsregisterreportfilepath.js'
          ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/destinationwiselsregisterreport/destinationwiselsregisterreportHandle.js'
          ,'jquerylingua'
          ,'language'
          ,'autocomplete'
          ,'autocompleteWrapper'
          ,'slickGridWrapper2'
          ,'nodvalidation'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
          ,'focusnavigation'//import in require.config
          ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
          ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/populatesubregionandbranch.js'//PopulateAutocomplete
          ],function(JsonUtility, MessageUtility, FilePath, Handle, Lingua, Language, AutoComplete, AutoCompleteWrapper,
        		  slickGridWrapper2, NodValidation, BootstrapModal,datePickerUI,ElementFocusNavigation,Selection,PopulateAutocomplete) {
	'use strict';
	var jsonObject = new Object(), myNod,companyWisePrintList, _this = '', masterLangObj, masterLangKeySet;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/destinationWiseLSRegisterReportWS/getDestinationWiseLSRegisterReportElement.do?',	_this.setDestinationWiseLsRegisterElements,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},setDestinationWiseLsRegisterElements : function(response){
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			
			destinationWiseLSRegister = response.destinationWiseLSRegister;
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/destinationwiselsregisterreport/DestinationWiseLSRegisterReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show)
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}
				
				var elementConfiguration				= new Object();

				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				response.elementConfiguration			= elementConfiguration;
				response.sourceAreaSelection			= true;
				response.isCalenderSelection			= true;
				response.AllOptionsForRegion			= true;
				response.AllOptionsForSubRegion			= true;
				response.AllOptionsForBranch			= true;

				Selection.setSelectionToGetData(response);
				
				masterLangObj = FilePath.loadLanguage();
				masterLangKeySet = loadLanguageWithParams(masterLangObj);
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector: '#regionEle',
					validate: 'validateAutocomplete:#regionEle_primary_key',
					errorMessage: 'Select proper Region !'
				});

				myNod.add({
					selector: '#subRegionEle',
					validate: 'validateAutocomplete:#subRegionEle_primary_key',
					errorMessage: 'Select proper Area !'
				});

				myNod.add({
					selector: '#branchEle',
					validate: 'validateAutocomplete:#branchEle_primary_key',
					errorMessage: 'Select proper Branch !'
				});
				myNod.add({
					selector: '#pendingPaymentType',
					validate: 'validateAutocomplete:#pendingPaymentType_primary_key',
					errorMessage: 'Select proper Type !'
				});

				hideLayer();
				
				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit(_this);								
				});
				
				$("#companyWiseLsDetailsBtn").click(function() {
					_this.getCompanyWisePrint();								
				});
				
				if(destinationWiseLSRegister.showGetCompanyWisePrintButton)
					$("#companyWiseLsDetailsBtn").removeClass('hide');
				else
					$("#companyWiseLsDetailsBtn").addClass('hide');
			});

		}, onSubmit : function() {
			showLayer();
			var jsonObject = new Object();
			
			if($("#dateEle").attr('data-startdate') != undefined)
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 

			if($("#dateEle").attr('data-enddate') != undefined)
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			
			jsonObject["regionId"] 				= $('#regionEle_primary_key').val();
			jsonObject["subRegionId"] 			= $('#subRegionEle_primary_key').val();
			jsonObject["sourceBranchId"] 		= $('#branchEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/destinationWiseLSRegisterReportWS/getDestinationWiseLsRegisterDetails.do', _this.setDestinationWiseLsRegisterTableData, EXECUTE_WITH_ERROR);
		},setDestinationWiseLsRegisterTableData : function(response) {
			if(response.message != undefined){
				hideLayer();
				$('#bottom-border-boxshadow').hide();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			
			var deliveryColumnConfig	= response.tableConfig.columnConfiguration;
			var deliveryKeys	= _.keys(deliveryColumnConfig);
			var dcolConfig	= new Object();
			
			for (var i = 0; i < deliveryKeys.length; i++) {
				var dObj	= deliveryColumnConfig[deliveryKeys[i]];
				
				if (dObj.show)
					dcolConfig[deliveryKeys[i]]	= dObj;
			}
			
			response.tableConfig.columnConfiguration	= dcolConfig;
			response.tableConfig.Language				= masterLangKeySet;
			companyWisePrintList	= response.compayWiseConfig.CorporateAccount;
			
			if(response.tableConfig.CorporateAccount != undefined && response.tableConfig.CorporateAccount.length > 0) {
				$('#bottom-border-boxshadow').show();
				var grid = slickGridWrapper2.setGrid(response.tableConfig);
				slickGridWrapper2.setAggregateFunction(grid,'destinationBranchName');
			}
			
			hideLayer();
		}, getCompanyWisePrint : function(){
			var finallsNumberWiseColl = new Object();
			var lsNumberWiseColl = new Object();

			var companyNameWiseArray;
			
			var dispatchNumberWiseArr	= _.groupBy(companyWisePrintList,'lsNumber');
			
			_.map(dispatchNumberWiseArr,function(accountgroupwisedata,dispatchkey){
				 companyNameWiseArray = _.groupBy(accountgroupwisedata,'companyName');
				_.map(companyNameWiseArray,function(groupwisedata,key){
					companyNameWiseArray[key] = _.groupBy(groupwisedata,'destinationBranchName');
				});
				lsNumberWiseColl[dispatchkey] = companyNameWiseArray;
			});
				
			finallsNumberWiseColl.lsNumberWiseColl = lsNumberWiseColl;
			_this.getPopUpForCompanyWisePrint(finallsNumberWiseColl);
		}, getPopUpForCompanyWisePrint : function(lsNumberWiseColl){
			lsNumberWiseColl.columns = grid.getColumns();
			
			var accountGroupName = $("#accountGroupName").val();
			var headerDetails = $("#printDetails").val();
			var headerValue = $("*[data-selector='header']").html();
			var selectedDetails="";
			
			$("#ElementDiv").find('span').each(function(index) {
				if(!$(this).isHidden() && $(this).prop("id") != undefined && $(this).prop("id") != '' )
					selectedDetails += "<b>"+$(this).html()+"</b> = "+ $("#"+$(this).prop("id")+'Ele').val()+"&emsp;";	
			});
			
			lsNumberWiseColl.accountGroupdata = {
					accountGroupName : accountGroupName,
					headerDetails: headerDetails,
					headerValue: headerValue,
					selectedDetails:selectedDetails
			}
			
			var childWindow = window.open("/ivcargo/html/module/destinationwiselsregisterreport/DestinationWiseLSRegisterPrint.html");
			childWindow.dataObject=lsNumberWiseColl;
		}, setHeaderData:function(){
			var headerValue = $("*[data-selector='header']").html();
			var selectedDetails="";
	           
			$("#ElementDiv").find('span').each(function(index) {
				if(!$(this).isHidden() && $(this).prop("id") != undefined && $(this).prop("id") != '' )
					selectedDetails += "<b>"+$(this).html()+"</b> = "+ $("#"+$(this).prop("id")+'Ele').val()+"&emsp;";	
			});
			
			$("*[data-accountgroup='name']").html($("#accountGroupName").val());
			$("*[data-heading='heading']").html(headerValue);
			$("*[data-selectedDetails='selectedDetails'").html(selectedDetails);
		}
	});
});