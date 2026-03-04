define([  
	PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	],function(Selection) {	
	'use strict';
	var jsonObject = new Object(), _this = '',childwin,BRANCH_SELECTION = 1, PARTY_SELECTION = 2;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/coverLetterPrintModuleWS/initCoverLetterPrintData.do?',_this.getCoverLetterPrintData, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getCoverLetterPrintData : function(response){
			var loadelement		= new Array();
			var baseHtml 		= new $.Deferred();
			
			executive		= response.executive;
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/coverLetter/coverLetterPrintModule.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				let sourceBranchAutoComplete			= new Object();

				sourceBranchAutoComplete.url			= response.branchModel;
				sourceBranchAutoComplete.primary_key	= 'branchId';
				sourceBranchAutoComplete.field			= 'branchName';

				$("#srcBranchEle").autocompleteCustom(sourceBranchAutoComplete);
				$("#destBranchEle").autocompleteCustom(sourceBranchAutoComplete);
		
				let autoSelectionToBranchName 			= new Object();
				autoSelectionToBranchName.primary_key 	= 'selectId';
				autoSelectionToBranchName.field 		= 'selectType';
				autoSelectionToBranchName.callBack 		= _this.changeToGetData;
				$("#selectToTypeEle").autocompleteCustom(autoSelectionToBranchName); 
				let autoSelectionNameInstance 	= $("#selectToTypeEle").getInstance();
				
				let elementConfiguration	= {};
				
				elementConfiguration.partyNameElement	= $('#partyNameEle');
				
				response.partySelectionWithoutSelectize			= true;
				response.isSearchByAllParty						= true;
				response.elementConfiguration					= elementConfiguration;
				
				Selection.setSelectionToGetData(response);
				
				var selectionArr	= [{ selectId: 1, selectType: "To Branch"}, { selectId: 2, selectType: "To Party"}];
	
				$(autoSelectionNameInstance).each(function() {
					this.option.source 			= selectionArr;
				});

				hideLayer();

				$("#printBtn").click(function() {
					_this.submitDataForPrint(_this);								
				});
			});
		}, changeToGetData : function() {
			let selectionId			= $("#" + $(this).attr("id") + "_primary_key").val();
			
			if(selectionId == BRANCH_SELECTION) {//for Branch
				$("*[data-attribute='destBranch']").removeClass("hide");
				$("*[data-attribute='partyName']").addClass("hide");
			} else if(selectionId == PARTY_SELECTION) { //for Party
				$("*[data-attribute='destBranch']").addClass("hide");
				$("*[data-attribute='partyName']").removeClass("hide");
			} 
			
		}, submitDataForPrint: function() {
			let selectionId			= $("#selectToTypeEle_primary_key").val();
			var fromBranchId 		= $("#srcBranchEle_primary_key").val();
			var destinationBranchId	= $("#destBranchEle_primary_key").val();
			var corporateAccountId 	= $("#partyNameEle_primary_key").val();  
		
			if (!fromBranchId) {
				showAlertMessage('error', "Please select From Branch!");
				return false;
			}

			if (selectionId == undefined || selectionId == 0) {
				showAlertMessage('error', "Please select Type!");
				return false;
			}
		
			if (selectionId == BRANCH_SELECTION && (destinationBranchId == undefined || destinationBranchId == 0)) {
				showAlertMessage('error', "Please select To Branch!");
				return false;
			}
		
			if (selectionId == PARTY_SELECTION && (corporateAccountId == undefined || corporateAccountId == 0)) {
				showAlertMessage('error', "Please select Party!");
				return false;
			}
		
			if(selectionId == BRANCH_SELECTION) corporateAccountId = 0;
			if(selectionId == PARTY_SELECTION) destinationBranchId = 0;
			
			childwin = window.open('coverletterPrint.do?pageId=340&eventId=10&modulename=coverLetterPrint&sourceBranchId='+fromBranchId+'&destinationBranchId='+destinationBranchId+'&corporateAccountId='+ corporateAccountId,  'newwindow', 'config=height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}

	});
});


