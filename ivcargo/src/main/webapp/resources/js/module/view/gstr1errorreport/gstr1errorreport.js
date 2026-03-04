define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/gstr1errorreport/gstr1errorreportfilepath.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'slickGridWrapper2'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
	,'focusnavigation'//import in require.config
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			slickGridWrapper2, NodValidation, BootstrapModal,datePickerUI,ElementFocusNavigation) {
	'use strict';
	var jsonObject = new Object(), myNod,  _this = '', gridObject, masterLangObj, masterLangKeySet, caLangObj, caLangKeySet;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/gstr1ErrorReportWS/getGstr1ErrorReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){

			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			var executive	= response.executive;

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/gstr1errorreport/Gstr1ErrorReport.html",function() {
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
				var options		= new Object();
				$("#dateEle").DatePickerCus(options);

				var companyNameAutoComplete = new Object();
				companyNameAutoComplete.primary_key = 'companyHeadMasterId';
				companyNameAutoComplete.callBack = _this.onCompanySelect;
				companyNameAutoComplete.field = 'companyHeadName';
				$("#companyNameEle").autocompleteCustom(companyNameAutoComplete);

				var autoCompanyName = $("#companyNameEle").getInstance();
				$(autoCompanyName).each(function() {
					this.option.source = response.companyHeadMasterArr;
				});
				
				var srcStateAutoComplete = new Object();
				srcStateAutoComplete.primary_key = 'stateId';
				srcStateAutoComplete.callBack = _this.onSrcStateSelect;
				srcStateAutoComplete.field = 'stateName';
				$("#srcStateEle").autocompleteCustom(srcStateAutoComplete);

				if(!(response.groupConfigObj.companyWiseGSTR1Report)) {
					var srcAutoStateName = $("#srcStateEle").getInstance();
					$(srcAutoStateName).each(function() {
						this.option.source = response.toStateList;
					});
				}

				var toStateAutoComplete = new Object();
				toStateAutoComplete.primary_key = 'stateId';
				toStateAutoComplete.callBack = _this.onToStateSelect;
				toStateAutoComplete.field = 'stateName';
				$("#toStateEle").autocompleteCustom(toStateAutoComplete);

				var toAutoStateName = $("#toStateEle").getInstance();
				$(toAutoStateName).each(function() {
					this.option.source = response.toStateList;
				});

				var srcBranchAutoComplete = new Object();
				srcBranchAutoComplete.primary_key = 'branchId';
				srcBranchAutoComplete.field = 'branchName';
				$("#srcBranchEle").autocompleteCustom(srcBranchAutoComplete);

				var toBranchAutoComplete = new Object();
				toBranchAutoComplete.primary_key = 'branchId';
				toBranchAutoComplete.field = 'branchName';
				$("#toBranchEle").autocompleteCustom(toBranchAutoComplete);

				masterLangObj = FilePath.loadLanguage();
				masterLangKeySet = loadLanguageWithParams(masterLangObj);

				myNod = nod();

				myNod.configure({
					parentClass:'validation-message'
				});

				if (executive.executiveType == 1) {
					if(response.groupConfigObj.companyWiseGSTR1Report) {
						myNod.add({
							selector: '#companyNameEle',
							validate: 'validateAutocomplete:#companyNameEle_primary_key',
							errorMessage: 'Select Proper Company !'
						});
					}

					myNod.add({
						selector: '#srcStateEle',
						validate: 'validateAutocomplete:#srcStateEle_primary_key',
						errorMessage: 'Select Proper Source State !'
					});

					myNod.add({
						selector: '#srcBranchEle',
						validate: 'validateAutocomplete:#srcBranchEle_primary_key',
						errorMessage: 'Select Proper Source Branch !'
					});
				}

				hideLayer();

				$("#searchBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onSubmit(_this);								
					}
				});
			});

		},setReportData : function(response) {
			
			$("#gstr1ReportDiv").empty();

			if(response.message != undefined){
				hideLayer();
				$('#bottom-border-boxshadow').hide();
				$('#btnprint_gstr1ReportDetails').hide();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			var gstr1ReportColumnConfig		= response.Gstr1ReportModel.columnConfiguration;
			var gstr1ReportKeys				= _.keys(gstr1ReportColumnConfig);
			var bcolConfig					= new Object();
			
			for (var i=0; i<gstr1ReportKeys.length; i++) {
				var bObj	= gstr1ReportColumnConfig[gstr1ReportKeys[i]];
				if (bObj.show == true) {
					bcolConfig[gstr1ReportKeys[i]]	= bObj;
				}
			}
			
			response.Gstr1ReportModel.columnConfiguration	= bcolConfig;
			response.Gstr1ReportModel.Language				= masterLangKeySet;

			if(response.Gstr1ReportModel.CorporateAccount != undefined && response.Gstr1ReportModel.CorporateAccount.length > 0) {
				$('#bottom-border-boxshadow').show();
				$('#btnprint_gstr1ReportDetails').show();
				gridObject = slickGridWrapper2.setGrid(response.Gstr1ReportModel);
			} else {
				$('#bottom-border-boxshadow').hide();
				$('#btnprint_gstr1ReportDetails').hide();
			}

			hideLayer();
		},onCompanySelect : function() {
			showLayer();
			var jsonArray = new Array();
			jsonArray.push('#srcStateEle');
			jsonArray.push('#srcBranchEle');
			_this.resetAutcomplete(jsonArray);
			jsonObject = new Object();
			jsonObject.companyHeadMasterId = $("#" + $(this).attr("id") + "_primary_key").val();
			console.log("jsonObject on Company Select : " ,jsonObject)
			getJSON(jsonObject,	WEB_SERVICE_URL + '/selectOptionsWS/getStateListByCompanyWise.do', _this.setSourceState,EXECUTE_WITHOUT_ERROR);

		},setSourceState : function (jsonObj) {

			var autoStateName = $("#srcStateEle").getInstance();
			$(autoStateName).each(function() {
				this.option.source = jsonObj.stateList;
			});
			hideLayer();
		},onSrcStateSelect : function() {
			var jsonArray = new Array();
			jsonArray.push('#srcBranchEle');
			_this.resetAutcomplete(jsonArray);

			jsonObject = new Object();
			jsonObject.stateId = $("#" + $(this).attr("id") + "_primary_key").val();
			jsonObject.companyHeadMasterId = $("#companyNameEle_primary_key").val();
			jsonObject.isOnlyPhysicalBranch = true;
			console.log("jsonObject on Src State Select : " ,jsonObject)
			getJSON(jsonObject,	WEB_SERVICE_URL + '/selectOptionsWS/getBranchListByCompanyStateIdWise.do', _this.setSourceBranch,EXECUTE_WITHOUT_ERROR);

		},onToStateSelect : function() {
			var jsonArray = new Array();
			jsonArray.push('#toBranchEle');
			_this.resetAutcomplete(jsonArray);

			jsonObject = new Object();
			jsonObject.isOnlyPhysicalBranch = true;
			jsonObject.stateId = $("#" + $(this).attr("id") + "_primary_key").val();
			getJSON(jsonObject,	WEB_SERVICE_URL + '/selectOptionsWS/getBranchListByStateId.do', _this.setDestinationBranch,EXECUTE_WITHOUT_ERROR);

		},setSourceBranch : function (jsonObj) {
			var autoBranchName = $("#srcBranchEle").getInstance();

			$(autoBranchName).each(function() {
				this.option.source = jsonObj.branchList;
			})
			_this.setBranchGSTN(jsonObj.branchGSTN);
		},setBranchGSTN : function (branchGSTN) {
			if(branchGSTN != undefined) {
				$("#GSTNEle").val(branchGSTN);
			} else {
				$("#GSTNEle").val("--");
			}
		},setDestinationBranch : function (jsonObj) {
			var toAutoBranchName = $("#toBranchEle").getInstance();

			$(toAutoBranchName).each(function() {
				this.option.source = jsonObj.branchList;
			})
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
		},onSubmit : function() {
			showLayer();
			var jsonObject = new Object();
			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}

			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			}

			jsonObject["companyHeadMasterId"] 	= $("#companyNameEle_primary_key").val();
			jsonObject["stateId"] 				= $('#srcStateEle_primary_key').val();
			jsonObject["sourceBranchId"] 		= $('#srcBranchEle_primary_key').val();
			jsonObject["toStateId"] 			= $('#toStateEle_primary_key').val();
			jsonObject["destinationBranchId"] 	= $('#toBranchEle_primary_key').val();

			console.log("jsonObject : " ,jsonObject);
			getJSON(jsonObject, WEB_SERVICE_URL+'/gstr1ErrorReportWS/getGstr1ErrorReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}
	});
});