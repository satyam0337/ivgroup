define([
	'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
    ,'bootstrapSwitch'
    ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	],function() {
	'use strict';
	var jsonObject = new Object(), myNod,  _this = ''
	,partyWiseLrSequenceCounterId,prevBranchId,prevCorporateAccountId,prevMinRange,prevMaxRange,prevNextVal,lastCreatedOn,lastCreatedBy;
	return Marionette.LayoutView.extend({
		initialize : function(jsonObjectData) {
			_this 				= this;
			jsonObject 			= jsonObjectData.elementValue;
		},render : function() {
			_this.setElements();
		},setElements : function (){
			partyWiseLrSequenceCounterId	= jsonObject.dataView.partyWiseLrSequenceCounterId;
			prevBranchId					= jsonObject.dataView.branchId;
			prevCorporateAccountId			= jsonObject.dataView.corporateAccountId;
			prevMinRange					= jsonObject.dataView.minRange;
			prevMaxRange					= jsonObject.dataView.maxRange;
			prevNextVal						= jsonObject.dataView.nextVal;
			lastCreatedOn					= jsonObject.dataView.createdOnStr;
			lastCreatedBy					= jsonObject.dataView.createdBy;
			
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);

			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/sequencecounter/updatePartyLrSequenceCounter.html",function() {
					baseHtml.resolve();
				});
			},200);

			$.when.apply($, loadelement).done(function(){
				initialiseFocus();

				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod.add({
					selector: '#uptMinRangeEle',
					validate: 'checkForNumber:#uptMinRangeEle',
					errorMessage: 'Enter Min Range !'
				});
				
				myNod.add({
					selector: '#uptMaxRangeEle',
					validate: 'checkForNumber:#uptMaxRangeEle',
					errorMessage: 'Enter Max Range !'
				});
				
				myNod.add({
					selector		: '#uptMaxRangeEle',
					validate 		: 'checkGreater:#uptMinRangeEle:#uptMaxRangeEle',
					errorMessage	: 'Should Be Gretaer Than Min Range'
				});
				
				$('#uptMinRangeEle').val(jsonObject.dataView.minRange);
				$('#uptMaxRangeEle').val(jsonObject.dataView.maxRange);
				$('#uptNextValueEle').val(jsonObject.dataView.nextVal);

				hideLayer();

				$("#updateSequenceBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onUpdate(_this);								
					}
				});
				
				$("#uptMinRangeEle").blur(function(){
					$('#uptNextValueEle').val($('#uptMinRangeEle').val())
				});
				
			});
			return _this;
		},onUpdate : function(){
			if (confirm('Are you sure you want to update?')){
				showLayer();
				var jsonObject = new Object();
				jsonObject["partyWiseLrSequenceCounterId"] 		= partyWiseLrSequenceCounterId;
				jsonObject["configBranchId"] 					= prevBranchId;
				jsonObject["corporateAccountId"] 				= prevCorporateAccountId;
				jsonObject["minRange"] 							= prevMinRange;
				jsonObject["maxRange"] 							= prevMaxRange;
				jsonObject["nextVal"] 							= prevNextVal;
				jsonObject["createdOnStr"] 						= lastCreatedOn;
				jsonObject["createdBy"] 						= lastCreatedBy;
				jsonObject["updatedMinRange"] 					= $('#uptMinRangeEle').val();
				jsonObject["updatedMaxRange"] 					= $('#uptMaxRangeEle').val();
				jsonObject["updatedNextVal"] 					= $('#uptNextValueEle').val();
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/partyWiseLrSequenceCounterWS/updatePartySequenceDetails.do', _this.setSavingResponse, EXECUTE_WITH_ERROR);
			}else{
				hideLayer();
			}
		},setSavingResponse : function(response){
			if(response.message != undefined){
				var MyRouter = new Marionette.AppRouter({});
				MyRouter.navigate('&modulename=partyLrSequenceMaster&savedSuccess=true',{trigger: true});
				location.reload();
				hideLayer();
				return;
			}

			hideLayer();
		}
	});
});