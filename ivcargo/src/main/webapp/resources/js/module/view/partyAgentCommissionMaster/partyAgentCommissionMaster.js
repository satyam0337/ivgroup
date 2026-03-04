define(
		[
			'slickGridWrapper2',
			PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
			PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',//PopulateAutocomplete
			PROJECT_IVUIRESOURCES+'/resources/js/module/view/partyAgentCommissionMaster/partyAgentCommissionMasterDetails.js',
			'messageUtility',
			'JsonUtility',
			'autocomplete',
			'autocompleteWrapper',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES+'/resources/js/backbone/backbone.bootstrap-modal.js'
			],//PopulateAutocomplete

			function(slickGridWrapper2, UrlParameter, Selection, PartyAgentCommisionDetails) {
			'use strict';

			var jsonObject = new Object(), 
			myNod,
			myNod2,
			_this = '',
			gridObject,
			showViewAllPartyAgentCommision = false,
			partyAgentCommisionId = 0,
			agentBranchId = 0,
			dataUpdated = false,
			dataDeleted = false;

			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
					showViewAllPartyAgentCommision		= UrlParameter.getModuleNameFromParam('updateCount');
					dataUpdated 						= UrlParameter.getModuleNameFromParam('dataUpdate');
					dataDeleted 						= UrlParameter.getModuleNameFromParam('dataDelete');

				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/partyAgentCommissionMasterWS/getPartyAgentCommisionElement.do?',	_this.setPartyAgentCommisionElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, setPartyAgentCommisionElements : function(response) {
					showLayer();

					var loadelement = new Array();
					var baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/partyAgentCommissionMaster/partyAgentCommissionMaster.html",function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						hideLayer();
						
						var elementConfiguration					= new Object();

						elementConfiguration.regionElement			= $('#regionEle');
						elementConfiguration.subregionElement		= $('#subRegionEle');
						elementConfiguration.branchElement			= $('#branchEle');

						response.elementConfiguration				= elementConfiguration;
						response.sourceAreaSelection				= true;
						response.AllOptionsForRegion				= false;
						response.AllOptionsForSubRegion				= false;
						response.AllOptionsForBranch				= false;

						Selection.setSelectionToGetData(response);
						
						$("#middle-border-boxshadow").hide();
						$("#bottom-border-boxshadow").css("opacity", 0);

						var partyAgentAutoComplete 			= new Object();
						partyAgentAutoComplete.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getPartyAgentCommisionAutocomplete.do?';
						partyAgentAutoComplete.primary_key 	= 'partyAgentCommisionId';
						partyAgentAutoComplete.field 		= 'displayName';
						partyAgentAutoComplete.callBack 	= _this.onPartyAgentSelect;
						$("#partyAgentCommisionEle").autocompleteCustom(partyAgentAutoComplete);

						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});

						myNod.add({
							selector		: '#branchEle',
							validate		: 'validateAutocomplete:#branchEle_primary_key',
							errorMessage	: 'Select Branch !'
						});
						myNod.add({
							selector		: '#partyAgentCommisionNameEle',
							validate		: 'presence',
							errorMessage	: 'Enter Name !'
						});
						myNod.add({
							selector		: '#mobilNumberEle',
							validate		: 'presence',
							errorMessage	: 'Enter Mobile Number !'
						});
						myNod.add({
							selector		: '#mobilNumberEle',
							validate		: 'integer',
							errorMessage	: 'Enter Valid Mobile Number !'
						});

						myNod2 = nod();
						myNod2.configure({
							parentClass:'validation-message'
						});

						myNod2.add({
							selector		: '#branchEle',
							validate		: 'validateAutocomplete:#branchEle_primary_key',
							errorMessage	: 'Select Branch !'
						});
						myNod2.add({
							selector		: '#partyAgentCommisionNameEle',
							validate		: 'presence',
							errorMessage	: 'Enter Name !'
						});
						myNod2.add({
							selector		: '#mobilNumberEle',
							validate		: 'presence',
							errorMessage	: 'Enter Mobil Number !'
						});

						myNod2.add({
							selector		: '#mobilNumberEle',
							validate		: 'integer',
							errorMessage	: 'Enter Valid Mobile Number !'
						});

						$("#partyAgentCommisionNameEle").keyup(function() {
							$('#updateBtn').attr("disabled",false);
						});
						
						$("#mobilNumberEle").keyup(function() {
							$('#updateBtn').attr("disabled",false);
						});
						
						$("#emailEle").keyup(function() {
							$('#updateBtn').attr("disabled",false);
						});
						
						$("#addressEle").keyup(function() {
							$('#updateBtn').attr("disabled",false);
						});

						$("#saveBtn").click(function() {
							myNod.performCheck();
							if(myNod.areAll('valid')) {
								_this.savePartyAgentCommision(_this);
							}
						});

						$("#updateBtn").click(function() {
							myNod2.performCheck();
							if(myNod2.areAll('valid')) {
								_this.updatePartyAgentCommision(_this);
							}
						});

						$("#deleteBtn").click(function() {
							_this.deletePartyAgentCommision(_this);
						});

						$("#viewAllPartyAgent").click(function() {
							_this.viewAllPartyAgentCommision();
						});

						$("#add").click(function(){
							_this.addPartyAgentCommision();
						});

						if((showViewAllPartyAgentCommision == 'true' || showViewAllPartyAgentCommision == true)) {
							_this.viewAllPartyAgentCommision();
						}
						
						if(dataUpdated != null && (dataUpdated == 'true' || dataUpdated == true)) {
							showMessage('success','Data Updated Successfully !');
						} else if(dataDeleted != null && (dataDeleted == 'true' || dataDeleted == true)) {
							showMessage('success','Data Deleted Successfully !');
						}
					});
				},onPartyAgentSelect : function () {
					showLayer();
					var jsonObject = new Object();

					jsonObject.partyAgentCommisionId	= $('#partyAgentCommisionEle_primary_key').val();

					getJSON(jsonObject, WEB_SERVICE_URL + '/partyAgentCommissionMasterWS/getPartyAgentCommisionDetailsByPartyAgentCommisionMasterId.do', _this.setPartyAgent, EXECUTE_WITH_ERROR);
				},setPartyAgent : function (response) {

					$('#updateBtn').attr("disabled",true);
					
					$('#regionEle').val(response.PartyAgentCommision.regionName);
					$('#regionEle_primary_key').val(response.PartyAgentCommision.regionId);
					$('#subRegionEle').val(response.PartyAgentCommision.subRegionName);
					$('#subregionEle_primary_key').val(response.PartyAgentCommision.subRegionId);
					$('#branchEle').val(response.PartyAgentCommision.branchName);
					$('#branchEle_primary_key').val(response.PartyAgentCommision.branchId);
					
					partyAgentCommisionId	= response.PartyAgentCommision.partyAgentCommisionId;
					$('#partyAgentCommisionNameEle').val(response.PartyAgentCommision.displayName);
					$('#mobilNumberEle').val(response.PartyAgentCommision.mobileNumber);
					$('#emailEle').val(response.PartyAgentCommision.email);
					$('#addressEle').val(response.PartyAgentCommision.address);
					$('#branchEle_primary_key').val(response.PartyAgentCommision.branchId);
					agentBranchId	= response.PartyAgentCommision.branchId;

					$("#saveBtn").addClass("hide");
					$("#updateBtn").removeClass("hide");
					$("#deleteBtn").removeClass("hide");

					$("#regionBranchRow").addClass("hide");
					
					$("#middle-border-boxshadow").hide();
					$("#bottom-border-boxshadow").css("opacity", 0);
					$("#middle-border-boxshadow").removeClass("hide");
					$("#middle-border-boxshadow").toggle("slide", { direction: "right" }, 500);

					hideLayer();
				}, savePartyAgentCommision : function() {
					showLayer();
					var jsonObject = new Object();

					jsonObject.agentBranchId		= $('#branchEle_primary_key').val();
					jsonObject.name					= $('#partyAgentCommisionNameEle').val();
					jsonObject.MobileNumber			= $('#mobilNumberEle').val();
					jsonObject.EmailAddress			= $('#emailEle').val();
					jsonObject.address				= $('#addressEle').val();

					getJSON(jsonObject, WEB_SERVICE_URL + '/partyAgentCommissionMasterWS/addPartyAgentCommision.do', _this.afterSave, EXECUTE_WITH_ERROR);
				},afterSave	: function(response) {
					_this.resetCustomerFeilds();

					if(response.message != undefined){
						hideLayer();
						return;
					}

					$("#middle-border-boxshadow").hide();
					showMessage('success','Data Inserted Successfully !');
					hideLayer();
				}, updatePartyAgentCommision : function() {
					showLayer();
					var jsonObject = new Object();

					jsonObject.partyAgentCommisionId	= partyAgentCommisionId;
					jsonObject.agentBranchId			= agentBranchId;
					jsonObject.name						= $('#partyAgentCommisionNameEle').val();
					jsonObject.mobileNumber				= $('#mobilNumberEle').val();
					jsonObject.email					= $('#emailEle').val();
					jsonObject.address					= $('#addressEle').val();
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
					jsonObject.agentBranchId			= agentBranchId;
					jsonObject.name						= $('#partyAgentCommisionNameEle').val();
					jsonObject.MobileNumber				= $('#mobilNumberEle').val();
					jsonObject.EmailAddress				= $('#emailEle').val();
					jsonObject.address					= $('#addressEle').val();
					jsonObject.markForDelete			= true;
					getJSON(jsonObject, WEB_SERVICE_URL + '/partyAgentCommissionMasterWS/updatePartyAgentCommision.do', _this.afterDelate, EXECUTE_WITH_ERROR);
				},afterDelate	: function(response) {
					var MyRouter = new Marionette.AppRouter({});
					MyRouter.navigate('&modulename=partyAgentCommissionMaster&updateCount='+false+'&dataUpdate='+false+'&dataDelete='+true);
					location.reload();
				},resetCustomerFeilds	: function() {
					$('#regionEle').val("");
					$('#regionEle_primary_key').val(0);
					$('#subRegionEle').val("");
					$('#subregionEle_primary_key').val(0);
					$('#branchEle').val("");
					$('#branchEle_primary_key').val(0);
					$('#partyAgentCommisionNameEle').val("");
					$('#mobilNumberEle').val("");
					$('#emailEle').val("");
					$('#addressEle').val("");
				},viewAllPartyAgentCommision	: function() {
					showLayer();
					getJSON(jsonObject, WEB_SERVICE_URL + '/partyAgentCommissionMasterWS/getAllPartyAgentCommisionDetails.do', _this.setAllPartyAgentCommision, EXECUTE_WITH_ERROR);
				},setAllPartyAgentCommision	: function(response) {
					if(response.message != undefined){
						hideLayer();
						return;
					}
					
					if(response.CorporateAccount != undefined && response.CorporateAccount.length > 0) {
						gridObject = slickGridWrapper2.setGrid(response);
					}

					gridObject.onDblClick.subscribe(function (e, args){
						var cell = gridObject.getCellFromEvent(e)
						var row = cell.row;
						var dataView = gridObject.getData();
						var item = dataView.getItem(row);
						_this.getDataPopForUpdate(item,response);
					});
					
					$("#middle-border-boxshadow").hide();
					$("#bottom-border-boxshadow").hide();
					$("#bottom-border-boxshadow").css("opacity", 1);
					$("#bottom-border-boxshadow").toggle("slide", { direction: "up" }, 500);
					
					hideLayer();
				},addPartyAgentCommision	: function() {
					_this.resetCustomerFeilds();

					$("#regionBranchRow").removeClass("hide");
					$("#saveBtn").removeClass("hide");
					$("#updateBtn").addClass("hide");
					$("#deleteBtn").addClass("hide");

					$("#middle-border-boxshadow").hide();
					$("#bottom-border-boxshadow").css("opacity", 0);
					$("#middle-border-boxshadow").removeClass("hide");
					$("#middle-border-boxshadow").toggle("slide", { direction: "left" }, 500);
					
				},getDataPopForUpdate:function(item){
					var jsonObject = new Object();

					if(item.partyAgentCommisionId != undefined && item.partyAgentCommisionId > 0) {
						jsonObject["partyAgentCommisionId"] 		= item.partyAgentCommisionId;
					}

					var object 			= new Object();
					object.elementValue = jsonObject;

					var btModal = new Backbone.BootstrapModal({
						content: new PartyAgentCommisionDetails(object),
						modalWidth : 60,
						title:'Update Agent Details'

					}).open();
					object.btModal = btModal;
					new PartyAgentCommisionDetails(object)
					btModal.open();
				}
			});
		});