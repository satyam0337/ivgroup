define(
		[
			'slickGridWrapper2',
			PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',//PopulateAutocomplete
			'messageUtility',
			'JsonUtility',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES+'/resources/js/backbone/backbone.bootstrap-modal.js'
			],//PopulateAutocomplete

			function(slickGridWrapper2, Selection) {
			'use strict';
			var jsonObject = new Object(), 
			myNod, myNod2,	_this = '', hamalMasterId = 0, leaderBranchId = 0;

			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/hamalMasterWS/getHamaliMasterElement.do?',	_this.setHamaliMasterElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, setHamaliMasterElements : function(response) {
					showLayer();

					var loadelement = new Array();
					var baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);
					
					$("#mainContent").load("/ivcargo/html/master/hamalMaster/hamalMaster.html",function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						hideLayer();

						var elementConfiguration					= new Object();

						elementConfiguration.regionElement			= $('#regionEle');
						elementConfiguration.subregionElement		= $('#subRegionEle');
						elementConfiguration.branchElement			= $('#branchEle');
						elementConfiguration.hamalTeamLeaderElement	= $('#hamalTeamLeaderEle');

						response.elementConfiguration				= elementConfiguration;
						response.sourceAreaSelection				= true;
						response.hamalTeamLeaderSelection			= true;
						response.AllOptionsForRegion				= false;
						response.AllOptionsForSubRegion				= false;
						response.AllOptionsForBranch				= false;

						Selection.setSelectionToGetData(response);
						
						$("#middle-border-boxshadow").hide();
						$("#bottom-border-boxshadow").css("opacity", 0);
						
						setTimeout(function() {
							$('#hamalTeamLeaderEle').change(function() {
								_this.onHamalTeamSelect();
							});
						}, 100);

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
							selector		: '#branchEle',
							validate		: 'presence',
							errorMessage	: 'Select Branch !'
						});
						myNod.add({
							selector		: '#hamalTeamLeaderNameEle',
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
						myNod.add({
							selector		: '#addressEle',
							validate		: 'presence',
							errorMessage	: 'Enter Address !'
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
							selector		: '#hamalTeamLeaderNameEle',
							validate		: 'presence',
							errorMessage	: 'Enter Name !'
						});
						myNod2.add({
							selector		: '#mobilNumberEle',
							validate		: 'presence',
							errorMessage	: 'Enter Mobile Number !'
						});

						myNod2.add({
							selector		: '#mobilNumberEle',
							validate		: 'integer',
							errorMessage	: 'Enter Valid Mobile Number !'
						});

						$("#hamalTeamLeaderNameEle").keyup(function() {
							$('#updateBtn').attr("disabled",false);
						});
						
						$("#mobilNumberEle").keyup(function() {
							$('#updateBtn').attr("disabled",false);
						});
						
						$("#addressEle").keyup(function() {
							$('#updateBtn').attr("disabled",false);
						});

						$("#saveBtn").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid'))
								_this.saveHamalMaster();
						});

						$("#updateBtn").click(function() {
							myNod2.performCheck();
							
							if(myNod2.areAll('valid'))
								_this.updateHamalMasterDetails();
						});

						$("#deleteBtn").click(function() {
							_this.deleteHamalMaster();
						});

						$("#viewAllHamalTeamLeader").click(function() {
							_this.viewAllHamalTeamLeader();
						});

						$("#add").click(function() {
							_this.addHamalMaster();
						});
					});
				}, onHamalTeamSelect : function () {
					showLayer();
					let jsonObject = new Object();

					jsonObject.hamalMasterId	= $('#hamalTeamLeaderEle_primary_key').val();

					getJSON(jsonObject, WEB_SERVICE_URL + '/hamalMasterWS/getHamalTeamLeaderDetailsByHamalMasterId.do', _this.setLeaderName, EXECUTE_WITH_ERROR);
				}, setLeaderName : function (response) {
					let hamalMaster	= response.HamalMaster;
					$('#branchEle').attr("disabled",true);
					$('#updateBtn').attr("disabled",true);
					$('#branchEle').val(hamalMaster.branchName);
					$('#branchEle_primary_key').val(hamalMaster.branchId);
					$('#hamalTeamLeaderNameEle').val(hamalMaster.displayName);
					$('#mobilNumberEle').val(hamalMaster.mobileNumber);
					$('#addressEle').val(hamalMaster.address);
					
					hamalMasterId	= hamalMaster.hamalMasterId;
					leaderBranchId	= hamalMaster.branchId;
					
					$("#saveBtn").addClass("hide");
					$("#updateBtn").removeClass("hide");
					$("#deleteBtn").removeClass("hide");
					$(".regionBranchRow").addClass("hide");
					
					$("#middle-border-boxshadow").hide();
					$("#bottom-border-boxshadow").css("opacity", 0);
					$("#middle-border-boxshadow").removeClass("hide");
					$("#middle-border-boxshadow").toggle("slide", { direction: "right" }, 500);

					hideLayer();
				}, saveHamalMaster : function() {
					showLayer();
					let jsonObject = new Object();

					jsonObject.leaderBranchId		= $('#branchEle_primary_key').val();
					jsonObject.name					= $('#hamalTeamLeaderNameEle').val();
					jsonObject.mobileNumber			= $('#mobilNumberEle').val();
					jsonObject.address				= $('#addressEle').val();

					getJSON(jsonObject, WEB_SERVICE_URL + '/hamalMasterWS/addHamalTeamLeader.do', _this.afterSave, EXECUTE_WITH_ERROR);
				}, afterSave	: function(response) {
					hideLayer();
					_this.resetCustomerFeilds();

					if(response.message != undefined)
						return;
					
					if(response.accountGroupId != undefined)
						refreshCache(HAMAL_MASTER, response.accountGroupId);

					$("#middle-border-boxshadow").hide();
				}, updateHamalMasterDetails : function() {
					showLayer();
					let jsonObject = new Object();

					jsonObject.hamalMasterId			= hamalMasterId;
					jsonObject.leaderBranchId			= leaderBranchId;
					jsonObject.name						= $('#hamalTeamLeaderNameEle').val();
					jsonObject.mobileNumber				= $('#mobilNumberEle').val();
					jsonObject.address					= $('#addressEle').val();
					jsonObject.markForDelete			= false;

					getJSON(jsonObject, WEB_SERVICE_URL + '/hamalMasterWS/updateHamalMaster.do', _this.afterUpdate, EXECUTE_WITH_ERROR);
				}, afterUpdate	: function(response) {
					if(response.accountGroupId != undefined)
						refreshCache(HAMAL_MASTER, response.accountGroupId);
					
					hideLayer();
				}, deleteHamalMaster : function() {
					showLayer();
					let jsonObject = new Object();

					jsonObject.hamalMasterId			= hamalMasterId;

					getJSON(jsonObject, WEB_SERVICE_URL + '/hamalMasterWS/deleteHamalMaster.do', _this.afterDelete, EXECUTE_WITH_ERROR);
				}, afterDelete	: function(response) {
					if(response.accountGroupId != undefined)
						refreshCache(HAMAL_MASTER, response.accountGroupId);
										
					setTimeout(function() {
						var MyRouter = new Marionette.AppRouter({});
						MyRouter.navigate('&modulename=hamalMaster&updateCount='+false+'&dataUpdate='+false+'&dataDelete='+true);
						location.reload();
					}, 100);
				}, resetCustomerFeilds	: function() {
					$('#regionEle').val("");
					$('#regionEle_primary_key').val(0);
					$('#subRegionEle').val("");
					$('#subregionEle_primary_key').val(0);
					$('#branchEle').val("");
					$('#branchEle_primary_key').val(0);
					$('#hamalTeamLeaderNameEle').val("");
					$('#mobilNumberEle').val("");
					$('#addressEle').val("");
				}, viewAllHamalTeamLeader	: function() {
					showLayer();
					getJSON(jsonObject, WEB_SERVICE_URL + '/hamalMasterWS/getAllHamalTeamDetails.do', _this.setAllhamalLeaderDetails, EXECUTE_WITH_ERROR);
				}, setAllhamalLeaderDetails	: function(response) {
					hideLayer();
					
					if(response.message != undefined)
						return;
					
					slickGridWrapper2.setGrid(response);
					
					$("#middle-border-boxshadow").hide();
					$("#bottom-border-boxshadow").hide();
					$("#bottom-border-boxshadow").css("opacity", 1);
					$("#bottom-border-boxshadow").toggle("slide", { direction: "up" }, 500);
					
					hideLayer();
				}, addHamalMaster	: function() {
					_this.resetCustomerFeilds();

					$(".regionBranchRow").removeClass("hide");
					$("#saveBtn").removeClass("hide");
					$("#updateBtn").addClass("hide");
					$("#deleteBtn").addClass("hide");
					$('#branchEle').attr("disabled",false);

					$("#middle-border-boxshadow").hide();
					$("#bottom-border-boxshadow").css("opacity", 0);
					$("#middle-border-boxshadow").removeClass("hide");
					$("#middle-border-boxshadow").toggle("slide", { direction: "left" }, 500);
				}
			});
		});