define([
	PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/partywiselrsequencecounter/UpdatePartyLrSequenceDetails.js'
	,'selectizewrapper'
	,'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/partywiselrsequencecounter/PartyLrSequenceDetails.js'
	,'JsonUtility'
	,'messageUtility'
	,'autocomplete'
	,'autocompleteWrapper'
	,'bootstrapSwitch'
	,'nodvalidation'
	,'focusnavigation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	]
	,function(Selection, UpdatePartySequenceDetails, Selectizewrapper, SlickGridWrapper, PartyLrSequenceDetails) {
	'use strict';
	var jsonObject = new Object(), myNod ,myNod2, _this = '', isBranch = false;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/partyWiseLrSequenceCounterWS/getPartyWiseLRSeqCounterElement.do?',	_this.renderPartySequenceElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderPartySequenceElements : function(response) {
			showLayer();
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/sequencecounter/partyWiseLrSequenceCounter.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function(){
				initialiseFocus();
				var keyObject = Object.keys(response);

				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
				}
				
				let elementConfiguration				= new Object();
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration				= elementConfiguration;
				response.billingPartySelectionWithSelectize	= true;
				response.sourceAreaSelection			= response.region || response.subRegion || response.branch;
				response.AllOptionsForRegion			= false;
				response.AllOptionsForSubRegion			= false;
				response.AllOptionsForBranch			= false;
				isBranch								= response.sourceAreaSelection;
				
				Selection.setSelectionToGetData(response);
				
				$("#middle-border-boxshadow").hide();
				
				hideLayer();
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod.add({
					selector		: '#billingPartyNameEle',
					validate		: 'presence',
					errorMessage	: 'Select Party !'
				});
				
				myNod.add({
					selector: '#minRangeEle',
					validate: 'checkForNumber:#minRangeEle',
					errorMessage: 'Enter Min Range !'
				});

				myNod.add({
					selector: '#maxRangeEle',
					validate: 'checkForNumber:#maxRangeEle',
					errorMessage: 'Enter Max Range !'
				});
				
				myNod.add({
					selector		: '#maxRangeEle',
					validate 		: 'checkGreater:#minRangeEle:#maxRangeEle',
					errorMessage	: 'Should Be Gretaer Than Min Range'
				});
				
				if(isBranch) {
					myNod.add({
						selector: '#branchEle',
						validate: 'presence',
						errorMessage: 'Select Branch!'
					});
				}
				
				myNod2 = nod();
				myNod2.configure({
					parentClass:'validation-message'
				});
				
				myNod2.add({
					selector		: '#partyNameEle',
					validate		: 'presence',
					errorMessage	: 'Select Party !'
				});
				
				if(isBranch) {
					myNod2.add({
						selector: '#branchNameEle',
						validate: 'presence',
						errorMessage: 'Select Branch!'
					});
				}
				
				$("#savePartyLrSequence").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit(_this);				
				});
				
				$("#viewAllSequences").click(function() {
					_this.viewAllLRSequences(response);
				});

				$("#add").click(function() {
					_this.addSequences();
				});
				
				$('#viewAllPartylrMaster').click(function() {
					_this.viewAllPartyDetails();
				});
				
				$("#updateBtn").click(function() {
					myNod2.performCheck();
					
					if(myNod2.areAll('valid'))
						_this.onView(_this);								
				});
				
			});
		}, viewAllLRSequences : function(response) {
			let elementConfiguration				= new Object();
			elementConfiguration.regionElement		= $('#regionNameEle');
			elementConfiguration.subregionElement	= $('#subRegionNameEle');
			elementConfiguration.branchElement		= $('#branchNameEle');

			response.elementConfiguration			= elementConfiguration;
			response.sourceAreaSelection			= response.region || response.subRegion || response.branch;
			response.AllOptionsForRegion			= false;
			response.AllOptionsForSubRegion			= false;
			response.AllOptionsForBranch			= false;
			
			Selection.setSelectionToGetData(response);
				
			Selectizewrapper.setAutocomplete({
				url 				: 	WEB_SERVICE_URL+'/autoCompleteWS/getTBBPartyDetailsAutocomplete.do?',
				valueField			:	'corporateAccountId',
				labelField			:	'corporateAccountDisplayName',
				searchField			:	'corporateAccountDisplayName',
				elementId			:	'partyNameEle',
				responseObjectKey 	: 	'result',
				create				: 	false,
				maxItems			: 	1
			});
			
			if($("#middle-border-boxshadow").css('display') != 'none')
				$("#middle-border-boxshadow").toggle(900);

			$("#bottom-border-boxshadow").toggle(900);
			$("#updateBtn").show();
		}, addSequences	: function() {
			$("#middle-border-boxshadow").toggle(900);
			
			if($("#bottom-border-boxshadow").css('display') != 'none')
				$("#bottom-border-boxshadow").toggle(900);
		}, onSubmit: function() {
			showLayer();
			var jsonObject = new Object();
			jsonObject.corporateAccountId	= $('#billingPartyNameEle').val();
			jsonObject.lrSequenceMin		= $('#minRangeEle').val();
			jsonObject.lrSequenceMax		= $('#maxRangeEle').val();
			jsonObject.nextVal				= $('#nextValueEle').val();
			
			if(isBranch)
				jsonObject.configBranchId = $('#branchEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/partyWiseLrSequenceCounterWS/addPartyWiseLrSequence.do', _this.setSavingResponse, EXECUTE_WITH_ERROR);
		}, setSavingResponse : function(response) {
			hideLayer();
		}, onView : function () {
			showLayer();
			
			var jsonObject = new Object();
			jsonObject.corporateAccountId	= $('#partyNameEle').val();
			
			if(isBranch)
				jsonObject.configBranchId 	= $('#branchNameEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/partyWiseLrSequenceCounterWS/viewPartySequenceDetails.do', _this.setViewResponse, EXECUTE_WITH_ERROR);
		}, setViewResponse : function(response) {
			if(response.message != undefined) {
				refreshAndHidePartOfPage('partySequenceDetailsDiv', 'hide');
				hideLayer();
				return;
			}
			
			if(response.CorporateAccount != undefined) {
				$('#partySequenceDetailsDiv').show();
				hideAllMessages();
				response.tableProperties.callBackFunctionForPartial = _this.viewPartySequenceforUpdate;
				SlickGridWrapper.setGrid(response);
			}
			
			hideLayer();
		}, viewPartySequenceforUpdate : function(grid, dataView, row) {
			var jsonObject 		= new Object();
			jsonObject.dataView = dataView.getItem(row);
			var object 			= new Object();
			object.elementValue = jsonObject;
			
			var btModal = new Backbone.BootstrapModal({
				content: new UpdatePartySequenceDetails(object),
				modalWidth : 90,
				title:'Update Party Sequence Details'

			}).open();
		}, viewAllPartyDetails : function () {
			var jsonObject	= new Object();
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL+'/partyWiseLrSequenceCounterWS/viewAllPartylrMasterDetails.do', _this.viewAllPartylrSequenceDetails, EXECUTE_WITH_ERROR);
		}, viewAllPartylrSequenceDetails : function(response) {
			hideLayer();
			
			if(response.message != undefined)
				return;
			
			if(response.CorporateAccount != undefined && (response.CorporateAccount).length > 0) {
				var jsonObject = new Object();
				jsonObject["response"] 		= response;
				
				var object = new Object();
				object.elementValue = jsonObject;

				var btModal = new Backbone.BootstrapModal({
					content		: new PartyLrSequenceDetails(object),
					modalWidth 	: 80,
					showFooter	: true,
					cancelText	: false,
					okText		: 'Close',
					title		:'Party LR Sequence Master View All Details'
				}).open();
				
				object.btModal = btModal;
				new PartyLrSequenceDetails(object)
				btModal.open();
			}
		}
	});
});

function transportSearch(grid,dataView,row){
	if (confirm('Are you sure you want to Delete?')) {
		showLayer();
		var jsonObject = new Object();
		jsonObject["partyWiseLrSequenceCounterId"] 				= dataView.getItem(row).partyWiseLrSequenceCounterId;
		jsonObject["configBranchId"] 							= dataView.getItem(row).branchId;
		jsonObject["corporateAccountId"] 						= dataView.getItem(row).corporateAccountId;
		jsonObject["minRange"] 									= dataView.getItem(row).minRange;
		jsonObject["maxRange"] 									= dataView.getItem(row).maxRange;
		jsonObject["nextVal"] 									= dataView.getItem(row).nextVal;
		jsonObject["createdOnStr"] 								= dataView.getItem(row).createdOnStr;
		jsonObject["createdBy"] 								= dataView.getItem(row).createdBy;
		 getJSON(jsonObject, WEB_SERVICE_URL+'/partyWiseLrSequenceCounterWS/deletePartySequenceDetails.do', responseAfterDelete, EXECUTE_WITH_ERROR);

	}else{
		hideLayer();
	}
}

function responseAfterDelete(){
	setTimeout(function(){ location.reload(); }, 500);
}

function transportSearchData(grid,dataView,row){
	require([PROJECT_IVUIRESOURCES+'/resources/js/module/view/partywiselrsequencecounter/PartyEditHistoryDetails.js'], function(PartyEditHistoryDetails){
		var jsonObject 		= new Object();
		jsonObject["partyWiseLrSequenceCounterId"] 				= dataView.getItem(row).partyWiseLrSequenceCounterId;
		jsonObject["branchId"] 									= dataView.getItem(row).branchId;
		jsonObject["corporateAccountId"] 						= dataView.getItem(row).corporateAccountId;
		jsonObject["minRange"] 									= dataView.getItem(row).minRange;
		jsonObject["maxRange"] 									= dataView.getItem(row).maxRange;
		jsonObject["nextVal"] 									= dataView.getItem(row).nextVal;
		jsonObject["createdOnStr"] 								= dataView.getItem(row).createdOnStr;
		jsonObject["createdBy"] 								= dataView.getItem(row).createdBy;

		var object 			= new Object();
		object.elementValue = jsonObject;
		
		var btModal = new Backbone.BootstrapModal({
			content		: new PartyEditHistoryDetails(object),
			modalWidth 	: 80,
			showFooter	: true,
			cancelText	: false,
			okText		: 'Close',
			title		: 'Edit History'
		});
		
		object.btModal = btModal;
		new PartyEditHistoryDetails(object);
		btModal.open();
	});
}