define(['JsonUtility',
	 'messageUtility',
	  PROJECT_IVUIRESOURCES + '/resources/js/module/view/groupdatareport/lsContains1Or2Lrsfilepath.js',
	 'jquerylingua',
	 'language',
	 'bootstrapSwitch',
	 'slickGridWrapper2',
	 'nodvalidation',
	 'focusnavigation',
	 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
	 PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	],function(JsonUtility, MessageUtility,FilePath, Lingua, Language, BootstrapSwitch, slickGridWrapper2, 
			NodValidation, FocusNavigation,BootstrapModal, Selection){
	'use strict';
	var jsonObject = new Object(), myNod, masterLangObj, masterLangKeySet, gridObject,  _this;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/LsContains1Or2LrsReportWS/getLsContains1Or2LrsExcelSheetElementConfiguration.do?',_this.setReportsElements, EXECUTE_WITH_ERROR);
			return _this;
		},setReportsElements : function(response){

			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
				$("#mainContent").load("/ivcargo/html/module/groupdatareport/lsContains1Or2LrsExcelSheet.html",function() {
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
				
				var elementConfiguration	= new Object();
				
				elementConfiguration.dateElement		= $('#dateEle');
				
				response.elementConfiguration	        = elementConfiguration;
				response.sourceAreaSelection	        = true;
				response.isCalenderSelection	        = true;
				
				Selection.setSelectionToGetData(response);
				
				//masterLangObj 		= FilePath.loadLanguage();
				//masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				hideLayer();
				
				$("#downloadExcel").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid')) {
						_this.onSubmit(_this);								
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
			getJSON(jsonObject, WEB_SERVICE_URL+'/LsContains1Or2LrsReportWS/setExcelData.do', _this.responseForExcel, EXECUTE_WITH_ERROR);
	
		},responseForExcel : function(data) {
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
		}
	});
});