/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
	PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'//PopulateAutocomplete
	,'slickGridWrapper2'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'elementmodel'
	,'elementTemplateJs'
	], function (Selection) {
	'use strict';// this basically give strictness to this specific js
	var 
	_this = '',
	jsonObject,
	partyAgentCommisionId,
	myNod;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){

			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 				= this;
			jsonObject 			= jsonObjectData.elementValue;
		},
		render: function(){
			getJSON(jsonObject, WEB_SERVICE_URL + '/partyAgentCommissionMasterWS/getPartyAgentCommisionElement.do', _this.setPartyAgentCommisionElements, EXECUTE_WITH_ERROR);
		},setPartyAgentCommisionElements : function(response) {

			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);

			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/partyAgentCommissionMaster/UpdatePartyAgentCommision.html",function() {
					baseHtml.resolve();
				});
			},200);

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				var elementConfiguration					= new Object();

				elementConfiguration.regionElement			= $('#upregionEle');
				elementConfiguration.subregionElement		= $('#upsubRegionEle');
				elementConfiguration.branchElement			= $('#upbranchEle');

				response.elementConfiguration				= elementConfiguration;
				response.sourceAreaSelection				= true;

				Selection.setSelectionToGetData(response);
				
				if(jsonObject.partyAgentCommisionId != undefined && jsonObject.partyAgentCommisionId > 0) {
					getJSON(jsonObject, WEB_SERVICE_URL + '/partyAgentCommissionMasterWS/getPartyAgentCommisionDetailsByPartyAgentCommisionMasterId.do', _this.setPartyAgent, EXECUTE_WITH_ERROR);
				}
				
				$('#upupdateBtn').attr("disabled",true);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector		: '#upbranchEle',
					validate		: 'validateAutocomplete:#upbranchEle_primary_key',
					errorMessage	: 'Select Branch !'
				});
				myNod.add({
					selector		: '#uppartyAgentCommisionNameEle',
					validate		: 'presence',
					errorMessage	: 'Enter Name !'
				});
				myNod.add({
					selector		: '#upmobilNumberEle',
					validate		: 'presence',
					errorMessage	: 'Enter Mobil Number !'
				});

				$("#uppartyAgentCommisionNameEle").keyup(function() {
					$('#upupdateBtn').attr("disabled",false);
				});
				
				$("#upmobilNumberEle").keyup(function() {
					$('#upupdateBtn').attr("disabled",false);
				});
				
				$("#upemailEle").keyup(function() {
					$('#upupdateBtn').attr("disabled",false);
				});
				
				$("#upaddressEle").keyup(function() {
					$('#upupdateBtn').attr("disabled",false);
				});
				
				$("#upupdateBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')) {
						_this.updatePartyAgentCommision(_this);
					}
				});

				$("#updeleteBtn").click(function() {
					_this.deletePartyAgentCommision(_this);
				});

				hideLayer();
			});

		},setPartyAgent : function (response) {
			$('#upregionEle').val(response.PartyAgentCommision.regionName);
			$('#upregionEle_primary_key').val(response.PartyAgentCommision.regionId);
			$('#upsubRegionEle').val(response.PartyAgentCommision.subRegionName);
			$('#upsubregionEle_primary_key').val(response.PartyAgentCommision.subRegionId);
			$('#upbranchEle').val(response.PartyAgentCommision.branchName);
			$('#upbranchEle_primary_key').val(response.PartyAgentCommision.branchId);
			
			partyAgentCommisionId	= response.PartyAgentCommision.partyAgentCommisionId;
			$('#uppartyAgentCommisionNameEle').val(response.PartyAgentCommision.displayName);
			$('#upmobilNumberEle').val(response.PartyAgentCommision.mobileNumber);
			$('#upemailEle').val(response.PartyAgentCommision.email);
			$('#upaddressEle').val(response.PartyAgentCommision.address);
		}, updatePartyAgentCommision : function() {
			showLayer();
			var jsonObject = new Object();

			jsonObject.partyAgentCommisionId	= partyAgentCommisionId;
			jsonObject.agentBranchId			= $('#upbranchEle_primary_key').val();
			jsonObject.name						= $('#uppartyAgentCommisionNameEle').val();
			jsonObject.mobileNumber				= $('#upmobilNumberEle').val();
			jsonObject.email					= $('#upemailEle').val();
			jsonObject.address					= $('#upaddressEle').val();
			jsonObject.markForDelete			= false;

			getJSON(jsonObject, WEB_SERVICE_URL + '/partyAgentCommissionMasterWS/updatePartyAgentCommision.do', _this.afterUpdate, EXECUTE_WITH_ERROR);
		
		},afterUpdate	: function(response) {
			var jsonObject = new Object();

			if(response.partyAgentCommisionId != undefined && response.partyAgentCommisionId > 0) {
				jsonObject.partyAgentCommisionId				= response.partyAgentCommisionId;
				getJSON(jsonObject, WEB_SERVICE_URL + '/partyAgentCommissionMasterWS/getPartyAgentCommisionDetailsByPartyAgentCommisionMasterId.do', _this.setPartyAgent, EXECUTE_WITH_ERROR);
			}
			showMessage('success','Data Updated Successfully !');
			hideLayer();
		}, deletePartyAgentCommision : function() {
			showLayer();
			var jsonObject = new Object();

			jsonObject.partyAgentCommisionId	= partyAgentCommisionId;
			jsonObject.agentBranchId			= $('#upbranchEle_primary_key').val();
			jsonObject.name						= $('#uppartyAgentCommisionNameEle').val();
			jsonObject.mobileNumber				= $('#upmobilNumberEle').val();
			jsonObject.email					= $('#upemailEle').val();
			jsonObject.address					= $('#upaddressEle').val();
			jsonObject.markForDelete			= true;

			getJSON(jsonObject, WEB_SERVICE_URL + '/partyAgentCommissionMasterWS/updatePartyAgentCommision.do', _this.afterDelate, EXECUTE_WITH_ERROR);
		},afterDelate	: function(response) {
			var MyRouter = new Marionette.AppRouter({});
			MyRouter.navigate('&modulename=partyAgentCommissionMaster&updateCount='+false+'&dataUpdate='+false+'&dataDelete='+true);
			location.reload();
		}
	});
});