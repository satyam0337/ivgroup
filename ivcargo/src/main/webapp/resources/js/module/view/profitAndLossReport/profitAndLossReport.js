var ModuleIdentifierConstant = null;
define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/profitAndLossReport/profitAndLossReportFilePath.js'
	,'jquerylingua'
	,'language'
	,'selectizewrapper'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, Selectizewrapper, NodValidation, FocusNavigation,
			 BootstrapModal, Selection) {
	'use strict';
	var jsonObject = new Object(), 
	myNod,  
	viewObject,
	gridObject, 
	masterLangObj, 
	masterLangKeySet, 
	caLangObj, 
	caLangKeySet,
	_this = '';

	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/profitAndLossReportWS/getProfitAndLossReportElement.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){
			showLayer();
			console.log("response",response)
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			var executive				= response.executive;
			
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/profitAndLossReport/profitAndLossReport.html",function() {
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

				var elementConfiguration				= new Object();
				
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				
				response.elementConfiguration			= elementConfiguration;
				response.AllOptionsForRegion  			= true;
				response.AllOptionsForSubRegion			= true;
				response.AllOptionsForBranch  			= true;
				response.sourceAreaSelection			= true;
				response.isCalenderSelection			= true;
				response.isThreeMonthsCalenderSelection	= true;
				response.monthLimit						= 3;
				
				Selection.setSelectionToGetData(response);
				

				if (executive.executiveType == EXECUTIVE_TYPE_REGIONADMIN) {
					$("#regionEle_primary_key").val(executive.regionId);
					var autoSubRegionName = $("#subRegionEle").getInstance();

					$(autoSubRegionName).each(function() {
						this.option.source = response.subRegionList;
					});
				}
				
				if (executive.executiveType == EXECUTIVE_TYPE_SUBREGIONADMIN) {
					$("#regionEle_primary_key").val(executive.regionId);
					$("#subRegionEle_primary_key").val(executive.subRegionId);
					var autoBranchName = $("#branchEle").getInstance();

					$(autoBranchName).each(function() {
						this.option.source = response.branchList;
					})
				}
				
				if (executive.executiveType == EXECUTIVE_TYPE_BRANCHADMIN) {
					$("#regionEle_primary_key").val(executive.regionId);
					$("#subRegionEle_primary_key").val(executive.subRegionId);
					$("#branchEle_primary_key").val(executive.branchId);
				}
				
				if (executive.executiveType == EXECUTIVE_TYPE_EXECUTIVE) {
					$("#regionEle_primary_key").val(executive.regionId);
					$("#subRegionEle_primary_key").val(executive.subRegionId);
					$("#branchEle_primary_key").val(executive.branchId);
				}
				
				
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod.add({
					selector		: '#regionEle',
					validate		: 'validateAutocomplete:#regionEle',
					errorMessage	: 'Select proper Region !'
				});
				
				myNod.add({
					selector		: '#subRegionEle',
					validate		: 'validateAutocomplete:#subRegionEle',
					errorMessage	: 'Select proper SubRegion !'
				});
				
				myNod.add({
					selector		: '#branchEle',
					validate		: 'validateAutocomplete:#branchEle',
					errorMessage	: 'Select proper Branch !'
				});
				
				hideLayer();
				
				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid')) {
						_this.onSubmit();								
					}
				});
			});

		},onSubmit : function() {
			
			showLayer();
			
			var jsonObject = new Object();

			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}
			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			}
			
			jsonObject["regionId"] 			= $('#regionEle_primary_key').val();
			jsonObject["subRegionId"] 		= $('#subRegionEle_primary_key').val();
			jsonObject["branchId"] 			= $('#branch_primary_key').val();
			
			console.log('log >>> ', jsonObject)
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/profitAndLossReportWS/getProfitAndLossReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
			
		},setReportData : function(response){
			console.log('response',response)
			var data = response;
			if(data.message.messageId == 21){
        		var errorMessage = data.message;
        		showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
        		hideLayer();
        		return false;
        	}
        	
        	var fileName	= data.fileName;
        	if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
			
				var request = new XMLHttpRequest();
				request.open('GET', "Ajax.do?pageId=356&eventId=1&fileName="+fileName, true);
				request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
				request.responseType = 'blob';

				request.onload = function(e) {
					if (this.status === 200) {
						var blob = this.response;
						
						if(window.navigator.msSaveOrOpenBlob) {
							window.navigator.msSaveBlob(blob, fileName);
						} else {
							var downloadLink 		= window.document.createElement('a');
							var contentTypeHeader 	= request.getResponseHeader("Content-Type");
							downloadLink.href 		= window.URL.createObjectURL(new Blob([blob], { type: contentTypeHeader }));
							downloadLink.download 	= fileName;
							document.body.appendChild(downloadLink);
							downloadLink.click();
							document.body.removeChild(downloadLink);
						}
					}
				};
				request.send();
        	}
			hideLayer();
		
		}
	});
});