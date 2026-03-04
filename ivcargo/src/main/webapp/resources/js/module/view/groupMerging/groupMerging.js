define([
	 PROJECT_IVUIRESOURCES + '/resources/js/module/view/groupMerging/groupMergingFilepath.js',
	 'selectizewrapper',
	 PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
	'JsonUtility',
	 'messageUtility',
	 'jquerylingua',
	 'language',
	 'bootstrapSwitch',
	 'nodvalidation',
	 'focusnavigation',
	 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
],function(FilePath, Selectizewrapper, Selection) {
	'use strict';
	let jsonObject = new Object(), 
	myNod, 
	masterLangObj, 
	masterLangKeySet, 
	_this, 
	BranchTypeConstant	  = null, accountGroupId = 0;
	return Marionette.LayoutView.extend({
		initialize : function(){
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/groupMergingWS/getGroupMergingElementConfiguration.do?', _this.setGroupMergingElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		},setGroupMergingElements : function(response){
			let loadelement				= new Array();
			let baseHtml				= new $.Deferred();
			BranchTypeConstant			= response.BranchTypeConstant;
			accountGroupId				= response.accountGroupId;
			
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/groupMerging/groupMerging.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (response[element].show == true) {
						$("*[data-attribute="+ element+ "]").addClass("show");
					}
				}

				$("#add").click(function(){
					_this.showAddBranchesPanel(response);
				});

				$("#edit").click(function(){
					_this.showEditBranchesPanel(response);
				});

				let elementConfiguration					= new Object();

				elementConfiguration.regionElement			= $('#regionEle');
				elementConfiguration.subregionElement		= $('#subRegionEle');

				elementConfiguration.destRegionElement		= $('#toRegionEle');
				elementConfiguration.destSubregionElement	= $('#toSubRegionEle');
				elementConfiguration.destBranchElement		= $('#toBranchEle');

				response.elementConfiguration				= elementConfiguration;
				response.sourceAreaSelection				= true;
				response.AllOptionsForDestSubRegion			= true;

				Selection.setSelectionToGetData(response);

				masterLangObj		= FilePath.loadLanguage();
				masterLangKeySet	= loadLanguageWithParams(masterLangObj);
				
				$('#subRegionEle').change(function() {
					jsonObject	= new Object();
					jsonObject.subRegionSelectEle_primary_key	= $('#subRegionEle_primary_key').val();

					getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getPhysicalBranchOption.do?',_this.setSourceBranchOption, EXECUTE_WITH_ERROR);
				});

				hideLayer();
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector	: '#regionEle',
					validate	: 'validateAutocomplete:#regionEle_primary_key',
					errorMessage	: 'Select proper Region !'
				});

				myNod.add({
					selector	: '#subRegionEle',
					validate	: 'validateAutocomplete:#subRegionEle_primary_key',
					errorMessage	: 'Select proper Area !'
				});

				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid')){
						_this.onSubmit(_this);								
					}
				});
			});
			
		},showAddBranchesPanel : function(response){
			$("#right-border-boxshadow").addClass("hide");
			$("#right-border-boxshadow").css("opacity", 0);
			$("#middle-border-boxshadow").hide();
			$("#bottom-border-boxshadow").css("opacity", 0);
			$("#middle-border-boxshadow").removeClass("hide");
			$("#middle-border-boxshadow").toggle("slide", { direction: "up" }, 500);

			Selectizewrapper.setAutocomplete({
				jsonResultList	:	response.accountGroupList,
				valueField		:	'accountGroupId',
				labelField		:	'accountGroupName',
				searchField		:	'accountGroupName',
				elementId		:	'accountGroupEle',
				create			:	false,
				maxItems		:	1,
				onChange		:	_this.getRegionOnAccountGroupChange
			});
			
		},showEditBranchesPanel : function(response){
			
			$("#right-border-boxshadow").addClass("hide");
			$("#right-border-boxshadow").css("opacity", 0);
			$("#middle-border-boxshadow").hide();
			$("#bottom-border-boxshadow").hide();
			$("#bottom-border-boxshadow").css("opacity", 1);
			$("#bottom-border-boxshadow").removeClass("hide");
			$("#bottom-border-boxshadow").toggle("slide", { direction: "up" }, 500);
			
			showLayer();
			
			jsonObject	= new Object();
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/groupMergingWS/getMergedGroupBranches.do?',_this.setMergedGroupBranches, EXECUTE_WITH_ERROR);
			
		}, setSourceBranchOption : function(response) {
			let branch	= response.sourceBranch;
			
			let sourceBranch	= new Array();
			
			if(branch != undefined && branch.length > 0) {
				for(const element of branch) {
					if(element.branchId != -1 && element.branchType != BranchTypeConstant.BRANCH_TYPE_DELIVERY)
						sourceBranch.push(element);
				}
			}
			
			if(sourceBranch.length > 0) {
				Selectizewrapper.setAutocomplete({
					jsonResultList	:	sourceBranch,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'branchEle',
					create			:	false,
					maxItems		:	1000
				});
			} else {
				showMessage('error', 'Branch Not Found !');
				return false;
			}
			
		}, getRegionOnAccountGroupChange : function() {
			
			jsonObject					= new Object();
			jsonObject.accountGroupId	= $('#accountGroupEle').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getRegionOption.do?',_this.setDestRegionOption, EXECUTE_WITH_ERROR);
			
		},setSubRegionOnRegionChange : function(regionId) {
			
			jsonObject								= new Object();
			jsonObject.regionSelectEle_primary_key	= regionId;
			jsonObject.isGroupMergingMaster			= true;
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getSubRegionOption.do?',_this.setDestSubRegionOption, EXECUTE_WITH_ERROR);
			
		},setBranchOnSubRegionChange : function(subRegionId) {
			
			jsonObject									= new Object();
			jsonObject.subRegionEle_primary_key			= subRegionId;
			jsonObject.isGroupMergingMaster				= true;
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getBranchOption.do?',_this.setDestBranchOption, EXECUTE_WITH_ERROR);
		}, setDestRegionOption : function(response) {
			
			let srcStateAutoComplete			= new Object();
			srcStateAutoComplete.primary_key	= 'regionId';
			srcStateAutoComplete.field			= 'regionName';
			$('#toRegionEle').autocompleteCustom(srcStateAutoComplete);
			
			let autoRegionName		= $('#toRegionEle').getInstance();
			
			$(autoRegionName).each(function() {
				let regionList	= new Array();

				_.each(response.region,function(key){
					if (key.regionId != -1){
						regionList.push(key);
					}
				})
				
				this.option.source	= regionList;

			});
			
			myNod.add({
				selector		: '#toRegionEle',
				validate		: 'validateAutocomplete:#toRegionEle_primary_key',
				errorMessage	: 'Select proper Region !'
			});
			
			$('#toRegionEle').change(function() {
				let regionId	= $('#toRegionEle_primary_key').val();
				
				_this.setSubRegionOnRegionChange(regionId);
			});
			
		}, setDestSubRegionOption : function(response) {
			let srcStateAutoComplete			= new Object();
			srcStateAutoComplete.primary_key	= 'subRegionId';
			srcStateAutoComplete.field			= 'subRegionName';
			$('#toSubRegionEle').autocompleteCustom(srcStateAutoComplete);
			
			let autoSubRegionName		= $('#toSubRegionEle').getInstance();
			
			$(autoSubRegionName).each(function() {
				let regionList	= new Array();

				_.each(response.subRegion,function(key){
					if (key.subRegionId != -1){
						regionList.push(key);
					}
				})

				this.option.source	= regionList;

			});
			
			myNod.add({
				selector		: '#toSubRegionEle',
				validate		: 'validateAutocomplete:#toSubRegionEle_primary_key',
				errorMessage	: 'Select proper Area !'
			});
			
			$('#toSubRegionEle').change(function() {
				let subRegionId		= $('#toSubRegionEle_primary_key').val();
				
				_this.setBranchOnSubRegionChange(subRegionId);
			});
			
		}, setDestBranchOption : function(response) {
			let branch		= response.sourceBranch;
			
			let destBranch	= new Array();
			
			if(branch != undefined && branch.length > 0) {
				for(const element of branch) {
					if(element.branchId != -1 && element.branchType != BranchTypeConstant.BRANCH_TYPE_BOOKING)
						destBranch.push(element);
				}
			}
			
			if(destBranch.length > 0) {
				Selectizewrapper.setAutocomplete({
					jsonResultList	:	destBranch,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'toBranchEle',
					create			:	false,
					maxItems		:	1000
				});
			} else {
				showMessage('error', 'Branch Not Found !');
				return false;
			}
		}, onSubmit : function() {
			
			let srcBranch		= $('#branchEle').val();
			let destBranch		= $('#toBranchEle').val();
			
			if(srcBranch == undefined || srcBranch.length == 0) {
				showMessage('error','Please Select Source Branch');
				return false;
			}
				
			if(destBranch == undefined || destBranch.length == 0) {
				showMessage('error','Please Select Dest Branch');
				return false;
			}
			
			if (confirm("Are you sure you want to Merge The Following Branches ?")) {
				showLayer();
				
				let jsonObject = new Object();
				
				jsonObject.assignAccountGroupId			= $('#accountGroupEle').val();
				jsonObject.regionId						= $('#regionEle_primary_key').val();
				jsonObject.subRegionId					= $('#subRegionEle_primary_key').val();
				jsonObject.destinationRegionId			= $('#toRegionEle_primary_key').val();
				jsonObject.destinationSubRegionId		= $('#toSubRegionEle_primary_key').val();
				jsonObject.configBranchIdsStr			= $('#branchEle').val();
				jsonObject.assignBranchIdsStr			= $('#toBranchEle').val();
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/groupMergingWS/mergeGroup.do', _this.setSuccess, EXECUTE_WITH_ERROR);
			}
			
		},setSuccess : function (response) {
			hideLayer();
			
			if(response.message != undefined) {
				refreshCache(GROUP_MERGING_MASTER, accountGroupId);
				
				setTimeout(() => {
					location.reload();
				}, 500);
			}
		}, setMergedGroupBranches : function(response) {
			if(response.message != undefined) {
				hideLayer();
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}
			
			_this.resetAllTables();
			
			if(response.branchNetworkConfigList != undefined && response.branchNetworkConfigList.length > 0) {
				$('#bottom-border-boxshadow').removeClass('hide');
				$('#mergedBranchDetailsLabel').removeClass('hide');
				$('#mergedBranchDetailsDiv').removeClass('hide');
				
				$('#mergedBranchDetailsTable tbody').empty();

				let branchNetworkConfigList	= response.branchNetworkConfigList;

				var columnArray		= new Array();

				for (var i = 0; i < branchNetworkConfigList.length; i++) {
					var obj		= branchNetworkConfigList[i];

					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='bkgDate_" + obj.configBranchId + "' name='' value='"+ obj.configBranchStr +"'>" + (obj.configBranchStr) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='cancelDate_" + obj.assignBranchId + "' name='' value='"+ obj.assignBranchStr +"'>" + (obj.assignBranchStr) + "</td>");

					$('#mergedBranchDetailsTable tbody').append('<tr id="mergedBranchDetails_'+ obj.branchNetWorkConfigurationId +'">' + columnArray.join(' ') + '</tr>');

					columnArray	= [];
				}
			}
			
			let configAccountGroupCode	= null;
			
			if(response.configAccountGroupCode != undefined && response.configAccountGroupCode != null) {
				configAccountGroupCode	= response.configAccountGroupCode;
			}
			
			if(response.configBranchNetworkHM != undefined && response.configBranchNetworkHM != null) {

				let configBranchNetworkHM	= response.configBranchNetworkHM;

				var columnArray		= new Array();

				for(var key in configBranchNetworkHM){
					let configBranchNetworkList	= configBranchNetworkHM[key];
					
					if(configBranchNetworkList != undefined && configBranchNetworkList.length > 0) {
						$('#configBranchNetworkDetailsLabel').removeClass('hide');
						$('#configBranchNetworkDetailsDiv').removeClass('hide');
						$('#configBranchNetworkDetailsTable tbody').empty();
						$('#configBranchNetworkDetailsLabel').html(configAccountGroupCode + "  is Booking For Following Branches");

						for (var i = 0; i < configBranchNetworkList.length; i++) {
							var obj		= configBranchNetworkList[i];
							var id = obj.branchNetWorkConfigurationId + "_" + obj.configBranchId + "_" + obj.assignBranchId + "_" + obj.assignBranchAccountGroupId + "_" + obj.configBranchAccountGroupId;
							
							if(!$('#configBranchNetworkDetails_' + obj.branchNetWorkConfigurationId).exists()) {
								columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
								columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='configBranch_" + obj.configBranchId + "' name='' value='"+ obj.configBranchStr +"'>" + (obj.configBranchStr) + "</td>");
								columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='assignBranch_" + obj.assignBranchId + "' name='' value='"+ obj.assignBranchStr +"'>" + (obj.assignBranchStr) + "</td>");
								columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='assignAccountGroup_" + obj.assignBranchAccountGroupId + "' name='' value='"+ obj.assignAccountGroupStr +"'>" + (obj.assignAccountGroupStr) + "</td>");
								columnArray.push("<td style='padding-left: 50px;'><button class='btn btn-danger' id='deleteConfigMergedBranches_" + id + "'>Delete</button></td>");
								
								$('#configBranchNetworkDetailsTable tbody').append('<tr id="configBranchNetworkDetails_'+ obj.branchNetWorkConfigurationId +'">' + columnArray.join(' ') + '</tr>');
							}
							
							$("#deleteConfigMergedBranches_"+id).bind("click", function() {
								let elementId						= $(this).attr('id');
								let branchNetWorkConfigurationId	= elementId.split('_')[1];
								let configBranchId					= elementId.split('_')[2];
								let assignBranchId					= elementId.split('_')[3];
								let assignAccountGroupId			= elementId.split('_')[4];
								let configAccountGroupId			= elementId.split('_')[5];
								
								_this.deleteMergedBranches(branchNetWorkConfigurationId, configBranchId, assignBranchId, assignAccountGroupId, configAccountGroupId);
							});
							
							columnArray	= [];
						}
					}
				}
			}
			
			if(response.assignBranchNetworkHM != undefined && response.assignBranchNetworkHM != null) {
				let assignBranchNetworkHM	= response.assignBranchNetworkHM;

				var columnArray		= new Array();

				for(var key in assignBranchNetworkHM){
					
					var assignBranchNetworkList	= assignBranchNetworkHM[key];
					
					if(assignBranchNetworkList != undefined && assignBranchNetworkList.length > 0) {
						
						$('#assignBranchNetworkDetailsLabel').removeClass('hide');
						$('#assignBranchNetworkDetailsDiv').removeClass('hide');
						$('#assignBranchNetworkDetailsTable tbody').empty();
						$('#assignBranchNetworkDetailsLabel').html("Following Branches Are Booking For "+ configAccountGroupCode);

						for (var i = 0; i < assignBranchNetworkList.length; i++) {

							var obj		= assignBranchNetworkList[i];
							var id = obj.branchNetWorkConfigurationId+"_"+obj.configBranchId+"_"+obj.assignBranchId+"_"+obj.assignBranchAccountGroupId+"_"+obj.configBranchAccountGroupId;

							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='assignBranch_" + obj.assignBranchId + "' name='' value='"+ obj.assignBranchStr +"'>" + (obj.assignBranchStr) + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='configBranch_" + obj.configBranchId + "' name='' value='"+ obj.configBranchStr +"'>" + (obj.configBranchStr) + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='configAccountGroup_" + obj.configAccountGroupId + "' name='' value='"+ obj.configAccountGroupStr +"'>" + (obj.configAccountGroupStr) + "</td>");
							columnArray.push("<td style='padding-left: 50px;'><button class='btn btn-danger' id='deleteAssignMergedBranches_" + id + "'>Delete</button></td>");
							
							$('#assignBranchNetworkDetailsTable tbody').append('<tr id="assignBranchNetworkDetails_'+ obj.branchNetWorkConfigurationId +'">' + columnArray.join(' ') + '</tr>');
							
							$("#deleteAssignMergedBranches_"+id).bind("click", function() {
								let elementId						= $(this).attr('id');
								
								let branchNetWorkConfigurationId	= elementId.split('_')[1];
								let configBranchId					= elementId.split('_')[2];
								let assignBranchId					= elementId.split('_')[3];
								let assignAccountGroupId			= elementId.split('_')[4];
								let configAccountGroupId			= elementId.split('_')[5];
								
								_this.deleteMergedBranches(branchNetWorkConfigurationId, configBranchId, assignBranchId, assignAccountGroupId, configAccountGroupId);
							});
							
							columnArray	= [];
						}
					}
				}
			}			
			_this.setMergedGroups(response);
			$('#middle-border-boxshadow').addClass('hide');
			hideLayer();
			
		}, deleteMergedBranches : function(branchNetWorkConfigurationId, configBranchId, assignBranchId, assignAccountGroupId, configAccountGroupId) {
			if (confirm("Are you sure you want to Delete?")) {
				showLayer();
				let jsonObject = new Object();
				
				jsonObject.branchNetWorkConfigurationId		= branchNetWorkConfigurationId;
				jsonObject.configBranchId					= configBranchId;
				jsonObject.assignBranchId					= assignBranchId;
				jsonObject.assignAccountGroupId				= assignAccountGroupId;
				jsonObject.configAccountGroupId				= configAccountGroupId;
			
				getJSON(jsonObject, WEB_SERVICE_URL+'/groupMergingWS/deleteMergedBranches.do', _this.showEditBranchesPanel, EXECUTE_WITH_ERROR);
			}
			
		},showResponseAfterOperation : function (response) {
			hideLayer();
			
			let row1 = $('#configBranchNetworkDetails_' + response.branchNetworkConfigId).closest('tr');
			
			setTimeout(function() { // Simulating ajax
				let siblings = row1.siblings();
				row1.remove();
				siblings.each(function(index) {
					$(this).children().first().text(index + 1);
				});
			}, 100);
			
			let row2 = $('#assignBranchNetworkDetails_' + response.branchNetworkConfigId).closest('tr');
			
			setTimeout(function() { // Simulating ajax
				let siblings = row2.siblings();
				row2.remove();
				siblings.each(function(index) {
					$(this).children().first().text(index + 1);
				});
			}, 100);
			
			let row3 = $('#mergedBranchDetails_' + response.branchNetworkConfigId).closest('tr');
			
			setTimeout(function() { // Simulating ajax
				let siblings = row3.siblings();
				row3.remove();
				siblings.each(function(index) {
					$(this).children().first().text(index + 1);
				});
			}, 100);
			
			if($('#mergedBranchDetailsTable tr').length - 1 > 0) {
				$('#mergedBranchDetailsLabel').removeClass('hide')
				$('#mergedBranchDetailsDiv').removeClass('hide')
			} else {
				$('#mergedBranchDetailsLabel').addClass('hide')
				$('#mergedBranchDetailsDiv').addClass('hide')
			}
			
			if($('#configBranchNetworkDetailsTable tr').length - 1 > 0) {
				$('#configBranchNetworkDetailsLabel').removeClass('hide')
				$('#configBranchNetworkDetailsDiv').removeClass('hide')
			} else {
				$('#configBranchNetworkDetailsLabel').addClass('hide')
				$('#configBranchNetworkDetailsDiv').addClass('hide')
			}
			
			if($('#assignBranchNetworkDetailsTable tr').length - 1 > 0) {
				$('#assignBranchNetworkDetailsLabel').removeClass('hide')
				$('#assignBranchNetworkDetailsDiv').removeClass('hide')
			} else {
				$('#assignBranchNetworkDetailsLabel').addClass('hide')
				$('#assignBranchNetworkDetailsDiv').addClass('hide')
			}
			
			if($('#mergedBranchDetailsTable tr').length - 1 <= 0 && $('#configBranchNetworkDetailsTable tr').length - 1 <= 0 && $('#assignBranchNetworkDetailsTable tr').length - 1 <= 0) {
				$('#bottom-border-boxshadow').addClass('hide');
			} else {
				$('#bottom-border-boxshadow').removeClass('hide');
			}
			
			if (response.message != undefined) {
				hideLayer();
				refreshCache(GROUP_MERGING_MASTER, accountGroupId);
			}
		}, setMergedGroups: function(response) {			
			if (response.mergedAccountGroupNetworkHM && Object.keys(response.mergedAccountGroupNetworkHM).length > 0) {
				$('#mergedGroupDetailsLabel').removeClass('hide');
				$('#mergedGroupDetailsDiv').removeClass('hide');
				$('#mergedGroupDetailsTable tbody').empty();
					
				let columnArray = [];
				let rowCount = 1;
					
				for (let key in response.mergedAccountGroupNetworkHM) {
					if (response.mergedAccountGroupNetworkHM.hasOwnProperty(key)) {
						let mergedGroup = response.mergedAccountGroupNetworkHM[key];
							
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + rowCount + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + 
							(mergedGroup.configAccountGroupName || "N/A") + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase'>" + 
							(mergedGroup.assignedAccountGroupName || "N/A") + "</td>");
						columnArray.push("<td style='padding-left: 50px;'><button class='btn btn-danger' id='deleteMergedGroup_" + 
							mergedGroup.assignBranchAccountGroupId + "'>Delete</button></td>");
						
						$('#mergedGroupDetailsTable tbody').append('<tr id="mergedGroupDetails_' + 
							mergedGroup.assignBranchAccountGroupId + '">' + columnArray.join(' ') + '</tr>');
							
						$("#deleteMergedGroup_" + mergedGroup.assignBranchAccountGroupId).bind("click", function() {
							let elementId = $(this).attr('id');
							let assignAccountGroupId = elementId.split('_')[1];
								
							if (confirm("Are you sure you want to delete all merged branches for this group?")) {
								showLayer();
								let jsonObject = new Object();
								jsonObject.assignAccountGroupId = assignAccountGroupId;
									
								getJSON(jsonObject, WEB_SERVICE_URL + '/groupMergingWS/deleteMergedGroup.do', _this.showEditBranchesPanel, EXECUTE_WITH_ERROR);
							}
						});
							
						columnArray = [];
						rowCount++;
					}
				}
			} else {
				$('#mergedGroupDetailsLabel').addClass('hide');
				$('#mergedGroupDetailsDiv').addClass('hide');
			}
		},	resetAllTables: function() {
		    // Empty table bodies
		    $('#mergedBranchDetailsTable tbody').empty();
		    $('#configBranchNetworkDetailsTable tbody').empty();
		    $('#assignBranchNetworkDetailsTable tbody').empty();
		    $('#mergedGroupDetailsTable tbody').empty();
		    
		    // Hide all table containers and labels
		    $('#mergedBranchDetailsDiv').addClass('hide');
		    $('#configBranchNetworkDetailsDiv').addClass('hide');
		    $('#assignBranchNetworkDetailsDiv').addClass('hide');
		    $('#mergedGroupDetailsDiv').addClass('hide');
		    
		    $('#mergedBranchDetailsLabel').addClass('hide');
		    $('#configBranchNetworkDetailsLabel').addClass('hide');
		    $('#assignBranchNetworkDetailsLabel').addClass('hide');
		    $('#mergedGroupDetailsLabel').addClass('hide');
		    
		    // Also hide main panel
		    $('#bottom-border-boxshadow').addClass('hide');
		},
	});
});