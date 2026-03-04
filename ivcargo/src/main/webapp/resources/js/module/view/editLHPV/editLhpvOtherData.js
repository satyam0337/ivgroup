/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
		'JsonUtility'
		,'messageUtility'
		,'/ivcargo/resources/js/generic/urlparameter.js'
		,'jquerylingua'
		,'language'
		,'autocompleteWrapper',//
        //constant for project name and domain urls
        //text! is used to convert the html to plain text which helps to fetch HTML through require
        //Master Template is used to get standard Layout of master pages
		,PROJECT_IVUIRESOURCES + '/resources/js/module/redirectAfterUpdate.js'
        ,'focusnavigation'//import in require.config
        ], function(JsonUtility, MessageUtility, UrlParameter, Lingua, Language, JqueryComboBox, ElementFocusNavigation){

	'use strict';// this basically give strictness to this specific js 
	var myNod, lhpvId = 0, jsonObject	= new Object(), _this = '', destBranch = null, lhpvEditRemarkRequired = false;

	// to know about layout refer url:http://marionettejs.com/docs/v1.8.7/marionette.layout.html
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//initialize is the first function called on call new view()
			_this = this;
			lhpvId				= UrlParameter.getModuleNameFromParam('masterid');
		}, render: function() {
			jsonObject.lhpvId			= lhpvId;
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/LHPVWS/getDataToUpdateLHPVData.do', _this.setData, EXECUTE_WITH_ERROR);
			//initialize is the first function called on call new view()
			return _this;
		}, setData : function(data) {
			
			if(data.message != undefined) {
				hideLayer();
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				
				if(errorMessage.typeName == 'info') {
					setTimeout(() => {
						window.close();
					}, 2000);
				}
			}
			
			var jsonObject 	= new Object();
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
				
			$("#mainContent").load("/ivcargo/html/module/editLHPV/editLhpvOtherData.html",
					function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				
				lhpvEditRemarkRequired			= data.lhpvEditRemarkRequired;
				var lhpv						= data.lhpv;
				destBranch						= data.destBranch;
				
				$('#lhpvNumberDetails').html('<b>Lhpv Number :- ' + lhpv.lHPVNumber + '</b><br>');
				
				_this.setDetails(data);
				_this.hideAndShowDestinationBranch();
				
				$("#Add").bind('click', function() {
					_this.saveLHPV();
				});

				if(lhpvEditRemarkRequired)
					$('#editRemark').removeClass('hide');
				
				//Calling from elementfocusnavigation.js file
				initialiseFocus();
			});
			
			hideLayer();
		}, setDetails : function(data) {
			var subRegionForGroup			= data.subRegionForGroup;
			var destSubRegionId				= data.destSubRegionId;
			var destSubRegionBranches		= data.destSubRegionBranches;
			var destBranchId				= data.destBranchId;
			var balPayableSubRegionId		= data.balPayableSubRegionId;
			var balPayableSubRegionBranches	= data.balPayableSubRegionBranches;
			var balPayableBranchId			= data.balPayableBranchId;
			
			$('#DestinationSubRegionId').append('<option value = "0">-- Area --</option>');
			
			for(var i = 0; i < subRegionForGroup.length; i++) {
				var subRegion	= subRegionForGroup[i];
				
				if(destSubRegionId == subRegion.subRegionId)
					$('#DestinationSubRegionId').append('<option value = "'+ subRegion.subRegionId +'"  selected="selected">'+ subRegion.subRegionName +'</option>');
				else
					$('#DestinationSubRegionId').append('<option value = "'+ subRegion.subRegionId +'">'+ subRegion.subRegionName +'</option>');
			}
			
			sortDropDownList('DestinationSubRegionId');
			
			$("#DestinationSubRegionId").bind('keyup', function() {
				$('#DestinationBranchId').val(0);
				$('#DestinationCityId').val(0);
				_this.populateBranchesWithCityBySubRegionId(this.value, 'DestinationSubBranchId');
			});
			
			$("#DestinationSubRegionId").bind('change', function() {
				$('#DestinationBranchId').val(0);
				$('#DestinationCityId').val(0);
				_this.populateBranchesWithCityBySubRegionId(this.value, 'DestinationSubBranchId');
			});
			
			if(destSubRegionBranches != undefined) {
				$('#DestinationSubBranchId').append('<option value = "0">-- Area --</option>');
				
				for(var i = 0; i < destSubRegionBranches.length; i++) {
					var branches	= destSubRegionBranches[i];
					
					if(destBranchId == branches.branchId) {
						$('#DestinationCityId').val(branches.branchCityId);
						$('#DestinationBranchId').val(destBranchId);
						$('#DestinationSubBranchId').append('<option value = "'+ destBranchId + "_" + branches.branchCityId +'"  selected="selected">'+ branches.branchName +'</option>');
					} else
						$('#DestinationSubBranchId').append('<option value = "'+ branches.branchId + "_" + branches.branchCityId +'">'+ branches.branchName +'</option>');
				}
				
				$("#DestinationSubBranchId").bind('click', function() {
					_this.getDestinationData(this.value);
				});
			}
			
			if(destBranch == undefined)
				$('#destination').remove();
			
			$('#BalancePayableSubRegionId').append('<option value = "0">-- Balance Payable Area --</option>');
			
			for(var i = 0; i < subRegionForGroup.length; i++) {
				var subRegion	= subRegionForGroup[i];
				
				if(balPayableSubRegionId == subRegion.subRegionId)
					$('#BalancePayableSubRegionId').append('<option value = "'+ subRegion.subRegionId +'"  selected="selected">'+ subRegion.subRegionName +'</option>');
				else
					$('#BalancePayableSubRegionId').append('<option value = "'+ subRegion.subRegionId +'">'+ subRegion.subRegionName +'</option>');
			}
			
			for(var i = 0; i < balPayableSubRegionBranches.length; i++) {
				var branches	= balPayableSubRegionBranches[i];
				
				if(balPayableBranchId == branches.branchId) {
					$('#BalancePayableCityId').val(branches.branchCityId);
					$('#BalancePayableBranchId').val(destBranchId);
					$('#BalancePayableSubBranchId').append('<option value = "'+ destBranchId + "_" + branches.branchCityId +'"  selected="selected">'+ branches.branchName +'</option>');
				} else
					$('#BalancePayableSubBranchId').append('<option value = "'+ branches.branchId + "_" + branches.branchCityId +'">'+ branches.branchName +'</option>');
			}
			
			$("#BalancePayableSubRegionId").bind('keyup', function() {
				_this.setBalancePayableData();
				_this.populateBranchesWithCityBySubRegionId(this.value, 'BalancePayableSubBranchId');
			});
			
			$("#BalancePayableSubRegionId").bind('change', function() {
				_this.setBalancePayableData();
				_this.populateBranchesWithCityBySubRegionId(this.value, 'BalancePayableSubBranchId');
			});
			
			$("#BalancePayableSubBranchId").bind('keyup', function() {
				_this.getBalancePayableData(this.value);
			});
			
			$("#BalancePayableSubBranchId").bind('change', function() {
				_this.getBalancePayableData(this.value);
			});
			
			sortDropDownList('BalancePayableSubRegionId');
		}, populateBranchesWithCityBySubRegionId : function(subRegionId, eleId) {
			var jsonObject	= new Object();
			
			jsonObject.subRegionSelectEle_primary_key		= subRegionId;
			
			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/selectOptionsWS/getSubRegionBranches.do',
				data		:	jsonObject,
				dataType	: 	'json',
				success		: 	function(data) {
					if (data.message != undefined) {
						hideLayer();
					} else {
						var subRegionBranches		= data.sourceBranch;

						_this.setSubRegionBranches(subRegionBranches, eleId);
					}
					
					hideLayer();
				}
			});
		}, setSubRegionBranches : function(subRegionBranches, eleId) {
			$('#' + eleId).find('option').remove().end();
			
			$('#' + eleId).append('<option value = "0">-- Select Branch --</option>');
			
			for(var i = 0; i < subRegionBranches.length; i++) {
				var branches	= subRegionBranches[i];
				
				$('#' + eleId).append('<option value = "'+ branches.branchId + "_" + branches.branchCityId +'">'+ branches.branchName +'</option>');
			}
			
			sortDropDownList(eleId);
		}, getDestinationData : function(destinationSubBranchId) {
			if(destinationSubBranchId != 0) {
				var destData = new Array();
				destData = destinationSubBranchId.split("_");
				
				$('#DestinationBranchId').val(parseInt(destData[0]));
				$('#DestinationCityId').val(parseInt(destData[1]));
			} else {
				$('#DestinationBranchId').val(0);
				$('#DestinationCityId').val(0);
			};
		}, getBalancePayableData : function() {
			var branchId_CityId = document.getElementById('BalancePayableSubBranchId').value;

			if(branchId_CityId != 0) {

				var destData = new Array();
				destData = branchId_CityId.split("_");

				var branchId 	= parseInt(destData[0]);
				var cityId 		= parseInt(destData[1]);

				document.getElementById('BalancePayableBranchId').value	= branchId;
				document.getElementById('BalancePayableCityId').value	= cityId;

			} else {
				_this.setBalancePayableData();
			};
		}, setBalancePayableData : function() {
			document.getElementById('BalancePayableBranchId').value	= '0';
			document.getElementById('BalancePayableCityId').value	= '0';
		}, hideAndShowDestinationBranch : function() {
			if(destBranch)
				$('#destination').css("display", "block");
			else
				$('#destination').css("display", "none");
		}, formvalidation : function() {
			if(destBranch) {
				if($("#DestinationCityId").val() <= 0) {
					showMessage('error', iconForErrMsg + ' Please Select Truck Destination Branch !');
					$("#DestinationSubBranchId").focus(); 
					return false;
				}
				
				if($("#DestinationBranchId").val() <= 0) {
					showMessage('error', iconForErrMsg + ' Please Select Truck Destination SubBranch !');
					$("#DestinationSubBranchId").focus(); 
					return false;
				}
			}
			
			if($("#BalancePayableCityId").val() <= 0) {
				showMessage('error', iconForErrMsg + ' Please Select Balance Payable At Branch !');
				$("#BalancePayableSubBranchId").focus(); 
				return false;
			}
			
			if($("#BalancePayableBranchId").val() <= 0) {
				showMessage('error', iconForErrMsg + ' Please Select Balance Payable At SubBranch !');
				$("#BalancePayableSubBranchId").focus(); 
				return false;
			}
			
			if(lhpvEditRemarkRequired) {
				if($("#editLhpvRemark").val() == "") {
					showMessage('error', iconForErrMsg + ' Please Enter Remark !');
					changeError1('editLhpvRemark','0','0');
					$("#editLhpvRemark").focus(); 
					return false;
				}
			}
			
			return true;
		}, saveLHPV : function() {
			if(!_this.formvalidation())
				return;

			if(confirm("Are you sure you want to update LHPV data ! ")) {
				showLayer();

				var jsonObject		= new Object();

				jsonObject.lhpvId					= lhpvId;
				jsonObject.remark					= $('#editLhpvRemark').val();
				jsonObject.balancePayableAtBranchId	= $('#BalancePayableBranchId').val();
				jsonObject.destinationBranchId		= $('#DestinationBranchId').val();

				getJSON(jsonObject, WEB_SERVICE_URL+'/LHPVWS/updateLHPVData.do', _this.afterSaveLhpv, EXECUTE_WITHOUT_ERROR);
			}
		}, afterSaveLhpv : function (response) {
			if(response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
			
			setTimeout(() => {
				redirectToAfterUpdate(response);
			}, 2000);
			
			hideLayer();
		}
	});
});


