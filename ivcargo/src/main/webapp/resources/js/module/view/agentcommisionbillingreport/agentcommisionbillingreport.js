define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/agentcommisionbillingreport/agentcommisionbillingreportfilepath.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'slickGridWrapper2'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			slickGridWrapper2, NodValidation,ElementFocusNavigation, BootstrapModal,UrlParameter,datePickerUI) {
	'use strict';
	var jsonObject = new Object()
	, myNod
	,  _this = ''
		, gridObject
		, masterLangObj
		, masterLangKeySet
		, caLangObj
		, caLangKeySet
		, agentCommissionBillingSummaryId
		, agentCommissionBillingSummaryNumber
		, sourceBranchCollection
		,LangKeySet
		,count=0;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
			this.$el.html(this.template);
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/agentCommissionBillReportWS/getAgentCommissionBillReportElement.do?',_this.setElementDetails,	EXECUTE_WITH_ERROR);
			return _this;
		},setElementDetails : function(response){
			//focus navigation initiates through this function
			initialiseFocus();
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			var executive	= response.executive;

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/agentCommissionBillReport/AgentCommissionBillReport.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				var keyObject = Object.keys(response);
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == true) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
					}
				}

				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);

				var options		= new Object();
				
				if(response.configObj.threeMonthDateRange != undefined){
					options.threeMonthDateRange	= response.configObj.threeMonthDateRange;
				}
				if(response.configObj.sixMonthDateRange != undefined){
					options.sixMonthDateRange	= response.configObj.sixMonthDateRange;
				}
				if(response.configObj.oneYearDateRange != undefined){
					options.oneYearDateRange	= response.configObj.oneYearDateRange
				}
				
				$("#dateEle").DatePickerCus(options);
				
				var searchTypeAutoComplete 			= new Object();
				searchTypeAutoComplete.primary_key 	= 'searchTypeId';
				searchTypeAutoComplete.callBack 	= _this.onSearchTypeSelect;
				searchTypeAutoComplete.field 		= 'searchTypeName';
				$("#searchTypeEle").autocompleteCustom(searchTypeAutoComplete);
				
				_this.setSearchType();

				var agentAutoComplete 			= new Object();
				agentAutoComplete.primary_key 	= 'branchId';
				agentAutoComplete.field 		= 'branchName';
				$("#agentEle").autocompleteCustom(agentAutoComplete);
				
				getJSON(null,	WEB_SERVICE_URL + '/selectOptionsWS/getAllBranchAutocomplete.do', _this.setBranch,EXECUTE_WITHOUT_ERROR);
				
				var collectionPerson = new Object();
				collectionPerson.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getCollectionPersonAutocomplete.do';
				collectionPerson.primary_key 	= 'collectionPersonMasterId';
				collectionPerson.field 			= 'name';
				$("#collectionPersonEle").autocompleteCustom(collectionPerson);

				var paymentStatusAutoComplete 			= new Object();
				paymentStatusAutoComplete.primary_key 	= 'paymentStatusId';
				paymentStatusAutoComplete.field 		= 'paymentStatusName';
				$("#paymentStatusEle").autocompleteCustom(paymentStatusAutoComplete);
				
				_this.setPaymentStatus();
				
				myNod = nod();

				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector: '#searchTypeEle',
					validate: 'validateAutocomplete:#searchTypeEle_primary_key',
					errorMessage: 'Select Search By !'
				});

				hideLayer();

				$("#dateCheckEle").click(function() {
					if ($('#dateCheckEle').prop('checked')) {
						$("#dateSelection").removeClass('hide');
					} else {
						$("#dateSelection").addClass('hide');
					}
				});

				$("#searchBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onSubmit();
					}
				});
			});

		},setBranch : function (response) {
			var agentName = $("#agentEle").getInstance();
			$(agentName).each(function() {
				this.option.source = response.branchList;
			});
		},onSearchTypeSelect:function(){
			if(Number($('#searchTypeEle_primary_key').val()) == Number(1)) {
				$("#agentSelection").removeClass('hide');
				$("#collectionPersonSelection").addClass('hide');
			} else if(Number($('#searchTypeEle_primary_key').val()) == Number(2)) {
				$("#collectionPersonSelection").removeClass('hide');
				$("#agentSelection").addClass('hide');
			}
		},onSubmit:function(){
			showLayer();
			
			var jsonObject = new Object();
			
			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}
			
			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			}
			
			jsonObject["dateWise"] 					= $('#dateCheckEle').prop('checked');
			jsonObject["searchTypeId"] 				= $('#searchTypeEle_primary_key').val();
			jsonObject["agentBranchId"] 			= $('#agentEle_primary_key').val();
			jsonObject["collectionPersonId"] 		= $('#collectionPersonEle_primary_key').val();
			jsonObject["paymentStatusId"] 			= $('#paymentStatusEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/agentCommissionBillReportWS/getAgentCommissionBillReportDetails.do?', _this.setData, EXECUTE_WITH_ERROR);
		},setData : function(response) {
			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				hideLayer();
				return;
			}
			
			if(response.AgentCommissionBillReportModel.CorporateAccount.length <= 0){
				showMessage('error', "No records found !");
				$('#bottom-border-boxshadow').addClass('hide');
				hideLayer();
				return;
			}
			
			if(response.AgentCommissionBillReportModel != undefined){
				var agentCommissionReportColumnConfig		= response.AgentCommissionBillReportModel.columnConfiguration;
				var agentCommissionReportKeys				= _.keys(agentCommissionReportColumnConfig);
				var bcolConfig								= new Object();
				
				for (var i=0; i<agentCommissionReportKeys.length; i++) {
					var bObj	= agentCommissionReportColumnConfig[agentCommissionReportKeys[i]];
					if (bObj.show == true) {
						bcolConfig[agentCommissionReportKeys[i]]	= bObj;
					}
				}
				
				response.AgentCommissionBillReportModel.columnConfiguration		= bcolConfig;
				response.AgentCommissionBillReportModel.Language				= masterLangKeySet;
			
			
				if(response.AgentCommissionBillReportModel.CorporateAccount != undefined && response.AgentCommissionBillReportModel.CorporateAccount.length > 0) {
					hideLayer();
					$('#bottom-border-boxshadow').removeClass('hide');
					gridObject = slickGridWrapper2.setGrid(response.AgentCommissionBillReportModel);
				}
		}
		hideLayer();
		},resetAutcomplete : function (jsonArray) {
			for ( var eleId in jsonArray) {
				var elem = $(jsonArray[eleId]).getInstance();
				$(elem).each(function() {
					var elemObj = this.elem.combo_input;
					$(elemObj).each(function() {
						$("#" + $(this).attr("id")).val('');
						$("#" + $(this).attr("id") + '_primary_key').val("");
					})
				})
			}
		},setSearchType : function () {

			var searchTypes = '{ "searchTypesArr" : [' +
			'{ "searchTypeId":"1" , "searchTypeName":"Agent" },' +
			'{ "searchTypeId":"2" , "searchTypeName":"Collection Person" } ]}';

			var obj = JSON.parse(searchTypes);
			var autoSearchType = $("#searchTypeEle").getInstance();
			$(autoSearchType).each(function() {
				this.option.source = obj.searchTypesArr;
			});
		},setPaymentStatus : function () {

			var paymentStatus = '{ "paymentStatusArr" : [' +
			'{ "paymentStatusId":"2" , "paymentStatusName":"Clear" },' +
			'{ "paymentStatusId":"1" , "paymentStatusName":"Due" },' +
			'{ "paymentStatusId":"3" , "paymentStatusName":"Partial" },' +
			'{ "paymentStatusId":"-1" , "paymentStatusName":"ALL" } ]}';

			var obj = JSON.parse(paymentStatus);
			var autoPaymentStatus = $("#paymentStatusEle").getInstance();
			$(autoPaymentStatus).each(function() {
				this.option.source = obj.paymentStatusArr;
			});
		}
	});
});
function paymnetDetails(grid, dataView,row) {
	if(dataView.getItem(row).paymentStatusId !=1) {
		childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=agentCommisionBillPaymentDetails&agentCommisionBillingSummaryId='+dataView.getItem(row).agentCommisionBillingSummaryId,'newwindow', config='height=400,width=800, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	}
}
function transportSearch(grid, dataView,row) {
		window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&pageId=5&eventId=3&wayBillNumber='+dataView.getItem(row).agentCommisionBillingNumber+'&TypeOfNumber='+23);
}