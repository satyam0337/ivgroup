var fromDate = null;
var toDate = null;
define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/newAllBranchWiseCollection/newAllBranchWiseCollectionfilepath.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'slickGridWrapper2'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/saveReportRequest.js'
	,'selectizewrapper'
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			slickGridWrapper2, NodValidation, BootstrapModal,ElementFocusNavigation,Selection,SaveReportRequest,Selectizewrapper) {
	'use strict';
	var jsonObject = new Object(), 
	myNod,  
	_this = '', 
	gridObject, 
	masterLangObj, 
	masterLangKeySet, 
	caLangObj, 
	executive,
	configuration,
	caLangKeySet;

	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/newAllBranchWiseCollectionReportWS/getAllBranchWiseCollectionElement.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){


			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			executive	= response.executive;
			configuration = response.configuration;


			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/newAllBranchWiseCollectionReport/newAllBranchWiseCollectionReport.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == true) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
					}
				}
				var SelectTYPE = [
					{ "selectTypeId":1, "selectTypeName": "OWN BRANCH" },
					{ "selectTypeId":2, "selectTypeName": "AGENT BRANCH" },
					{ "selectTypeId":0, "selectTypeName": "BOTH" },
					]

				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	SelectTYPE,
					valueField		:	'selectTypeId',
					labelField		:	'selectTypeName',
					searchField		:	'selectTypeName',
					elementId		:	'selectTypeEle',
					create			: 	false,
					maxItems		: 	1

				});

				Selectizewrapper.setAutocomplete({
					jsonResultList		: response.branchModelList,
					valueField			: 'branchId',
					labelField			: 'branchName',
					searchField			: 'branchName',
					elementId			: 'allBranch'
				});
				Selectizewrapper.setAutocomplete({
					jsonResultList		: response.ownModelList,
					valueField			: 'branchId',
					labelField			: 'branchName',
					searchField			: 'branchName',
					elementId			: 'ownBranch'
				});
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.agentModelList,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'agentBranch',
					create			: 	false,
					maxItems		: 	1
				});				
				
				var elementConfiguration	= new Object();

				elementConfiguration.dateElement		= $('#dateEle');


				response.elementConfiguration	= elementConfiguration;
				response.sourceAreaSelection	= true;
				response.isCalenderSelection	= true;
				response.monthLimit				= configuration.monthLimitToShowDate;


				Selection.setSelectionToGetData(response);

				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);

				myNod = nod();

				myNod.configure({
					parentClass:'validation-message'
				});

				$("#selectTypeEle").change(function() {

					var selectType = $("#selectTypeEle").val();

					if(selectType == 0 ){
						$("#allBranchDiv").css('display','block');
					}else{
						$("#allBranchDiv").css('display','none');
					}
					if(selectType == 1 ){
						$("#ownBranchDiv").css('display','block');
					}else{
						$("#ownBranchDiv").css('display','none');	
					}
					if(selectType == 2 ){
						$("#agentBranchDiv").css('display','block');
					}else{
						$("#agentBranchDiv").css('display','none');
					}


					if( selectType == 0){
						myNod.add({
							selector: '#allBranch',
							validate: 'validateAutocomplete:#allBranch',
							errorMessage: 'Select proper Branch !'
						});
					}

					if( selectType == 1){
						myNod.add({
							selector: '#ownBranch',
							validate: 'validateAutocomplete:#ownBranch',
							errorMessage: 'Select proper Branch !'
						});
					}
					if( selectType == 2){
						myNod.add({
							selector: '#agentBranch',
							validate: 'validateAutocomplete:#agentBranch',
							errorMessage: 'Select proper Agent Branch !'
						});
					}
				});


				if (executive.executiveType != EXECUTIVE_TYPE_EXECUTIVE && executive.executiveType != EXECUTIVE_TYPE_BRANCHADMIN) {
					if($("#selectTypeEle").val() == "" || $("#selectTypeEle").val() == undefined){
						myNod.add({
							selector: '#selectTypeEle',
							validate: 'validateAutocomplete:#selectTypeEle',
							errorMessage: 'Please Select Type !'
						});
					}
					console.log('executive.executiveType',executive.executiveType)
					$("#findBtn").click(function() {
						myNod.performCheck();
						if(myNod.areAll('valid')){
							_this.onSubmit(_this);								
						}
					});
					
				}  else {
					$("#selectTypeDiv").css('display','none');
					$("#findBtn").click(function() {
						_this.onSubmit(_this);								
					});
				}
				
					$('#maxDaysToFindReport').val(configuration.maxDaysToFindReport);
					$('#dateEle').change(function(){
						checkDate();						
					});
					
					$("#sendRequest").click(function(){
						myNod.performCheck();
						if(myNod.areAll('valid')){
							saveReportRequest(1);							
						}
					});

				hideLayer();

			});
		},onSubmit : function() {

			showLayer();
			var jsonObject = new Object();
			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
				fromDate = $("#dateEle").attr('data-startdate'); 
			}

			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
				toDate = $("#dateEle").attr('data-enddate'); ;
			}
			if($("#selectTypeEle").val() == 0)
				jsonObject["sourceBranchId"] = $('#allBranch').val();
			else if($("#selectTypeEle").val() == 1)
				jsonObject["sourceBranchId"] = $('#ownBranch').val();
			else if($("#selectTypeEle").val() == 2)
				jsonObject["sourceBranchId"] = $('#agentBranch').val();
			else
				jsonObject["sourceBranchId"] = executive.branchId;



			getJSON(jsonObject, WEB_SERVICE_URL+'/newAllBranchWiseCollectionReportWS/getAllBranchWiseData.do', _this.setReportData, EXECUTE_WITH_ERROR);
		},setReportData : function(response) {
			$("#branchWiseCollectionReportDiv").empty();
			$('.left-border-boxshadow').removeClass('hide');
			if(response.message != undefined){
				hideLayer();
				$('#bottom-border-boxshadow').hide();
				$('#btnprint_branchWiseReportDetails').hide();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}

			var branchWiseReportModelColumnConfig		= response.branchWiseBkgAndDlyList.columnConfiguration;
			var branchWiseReportModelKeys				= _.keys(branchWiseReportModelColumnConfig);
			var bcolConfig								= new Object();

			for (var i=0; i<branchWiseReportModelKeys.length; i++) {
				var bObj	= branchWiseReportModelColumnConfig[branchWiseReportModelKeys[i]];
				if (bObj.show == true) {
					bcolConfig[branchWiseReportModelKeys[i]]	= bObj;
				}
			}

			response.branchWiseBkgAndDlyList.columnConfiguration		= bcolConfig;
			response.branchWiseBkgAndDlyList.Language					= masterLangKeySet;

			if(response.branchWiseBkgAndDlyList.CorporateAccount != undefined && response.branchWiseBkgAndDlyList.CorporateAccount.length > 0) {
				$('#bottom-border-boxshadow').show();
				$('#btnprint_branchWiseReportDetails').show();
				gridObject = slickGridWrapper2.setGrid(response.branchWiseBkgAndDlyList);
				$('#print_branchWiseReportDetails').css("padding-left", "15px");
				$('#print_branchWiseReportDetails').css("padding-top", "10px");
			} else {
				$('#bottom-border-boxshadow').hide();
				$('#btnprint_branchWiseReportDetails').hide();
			}

			hideLayer();
		},setSelectType : function(){

			_this.setSelectTypeAutocompleteInstance();

			var autoSelectType = $("#selectTypeEle").getInstance();

			$( autoSelectType ).each(function() {
				this.option.source = SelectTYPE;
			})
		},setSelectTypeAutocompleteInstance : function() {
			var autoSelectTypeName 			= new Object();
			autoSelectTypeName.primary_key 	= 'selectTypeId';
			autoSelectTypeName.field 		= 'selectTypeName';

			$("#selectTypeEle").autocompleteCustom(autoSelectTypeName)
		}
	});
});

function setJsonData(jsonObject){
	
		if($("#dateEle").attr('data-startdate') != undefined)
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			
			if($("#dateEle").attr('data-enddate') != undefined)
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			
			
			if($("#selectTypeEle").val() == 0)
				jsonObject["sourceBranchId"] = $('#allBranch').val();
			else if($("#selectTypeEle").val() == 1)
				jsonObject["sourceBranchId"] = $('#ownBranch').val();
			else if($("#selectTypeEle").val() == 2)
				jsonObject["sourceBranchId"] = $('#agentBranch').val();
			else
				jsonObject["sourceBranchId"] = executive.branchId;
				
			jsonObject["selectTypeId"] 				= $('#selectTypeEle_primary_key').val();
			jsonObject["isExcel"] 					= true;
			jsonObject.filter						= 9;
}

function transportSearch(grid,dataView,row){
	if(dataView.getItem(row).branchId != undefined){
		window.open('Reports.do?pageId=23&eventId=21&SetAutoData=true&subRegion='+dataView.getItem(row).subRegionId+'&branch='+dataView.getItem(row).branchId+'&fromDate='+fromDate+'&toDate='+toDate);
	}
}

function ValidateFormElement(type){
	if(type == 1 && !validateSelectedDate()){
	showMessage('error',"You can not find report for more than "+$('#maxDaysToFindReport').val()+" days , Please use request option !");
	return false;
	}
	return true;
}
