define([
        'marionette'
        ,'text!'+PROJECT_IVUIRESOURCES+'/html/module/lhpvCommissionMaster/lhpvCommissionMaster.html'
        ,'errorshow'
        ,'JsonUtility'
        ,'messageUtility'
        ,'nodvalidation'
        ,'validation'
        ,'autocompleteWrapper'
        ,'focusnavigation'
        ,'selectizewrapper'
        ], function(Marionette, Template) {
	'use strict'; 
	var myNod, lhpvcommissionid, _this;
	return Marionette.LayoutView.extend({
		 template: _.template(Template),
		 regions: {}
		,initialize: function(){_this = this;this.$el.html(this.template);}
		,onShow: function(){getJSON(null, WEB_SERVICE_URL+'/lHPVCommissionMasterWS/getLhpvCommissionElementConfiguration.do', _this.setElements, EXECUTE_WITH_ERROR);}
		,triggers: {}
		,behaviors: {}
		,setElements: function(response){
			myNod = nod();
			myNod.configure({
				parentClass:'validation-message'
			});
			var keyObject = Object.keys(response);
			for (var i = 0; i < keyObject.length; i++) {
				if (response[keyObject[i]]) {
					$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}
			}
			_this.setCreateData(response);
			var toBranchAutoComplete 			= new Object();
			toBranchAutoComplete.url 			= response.branchList;
			toBranchAutoComplete.primary_key 	= 'branchId';
			toBranchAutoComplete.field 			= 'branchName';
			toBranchAutoComplete.callBack 		= _this.getBranchCommisionDetails;
			$("#branchEle").autocompleteCustom(toBranchAutoComplete);
			
			var chargeTypeAutoComplete 			= new Object();
			chargeTypeAutoComplete.primary_key 	= 'chargeId';
			chargeTypeAutoComplete.url 			= response.ChargeTypeArr;
			chargeTypeAutoComplete.field 		= 'chargeName';
			$("#chargeTypeEle").autocompleteCustom(chargeTypeAutoComplete);
		
			initialiseFocus();
			hideLayer();
		},setCreateData : function(response) {

			myNod.add({
				selector		: '#branchEle',
				validate		: 'presence',
				errorMessage	: 'Select, Proper Branch'
			});
			myNod.add({
				selector		: '#amountEle',
				validate		: 'presence',
				errorMessage	: 'Please, Enter Amount'
			});
			myNod.add({
				selector		: '#amountEle',
				validate		: 'float',
				errorMessage	: 'Amount should be decimal number'
			});
			if(response.chargeTypeRow.show){
				myNod.add({
					selector	: '#chargeTypeEle',
					validate	: 'presence',
					errorMessage: 'Select, Proper Charge Type'
				});
			}
			_this.setButtons(true);
			_this.createLhpvChargesCheckBox(response);
			_this.createBLhpvChargesCheckBox(response);
		},setButtons : function(flag) {
			
			if (flag == false) {
				$("#saveBtn").prop('disabled', true);
				$("#deleteBtn").removeAttr('disabled');
				$(".formInput").change(function(){
					$('#updateBtn').prop('disabled', false);
				});
			}
			
			if (flag == true) {
				$("#saveBtn").removeAttr("disabled");
				$("#deleteBtn").prop('disabled', true);
				$(".formInput").change(function(){
					$("#updateBtn").prop('disabled', true);
				});
				$("#updateBtn").prop('disabled', true);
			}
		}, showResponseAfterOperation : function (response) {
			$("#branchEle").val("");
			$("#amountEle").val("");
			$("#chargeTypeEle").val("");
			
			$('input[type=checkbox]').each(function () {
				 $('input:checkbox').removeAttr('checked');
			});

			hideLayer();			
		}, events:{
			"click #saveBtn"	: 	"saveLhpvCommission",
			"click #updateBtn" 	: 	"updateLhpvCommission",	
			"click #deleteBtn"	: 	"deleteLhpvCommission",
			"click #selectAll"	: 	"selectDeselectAll",
		}, saveLhpvCommission : function() {
			myNod.performCheck();
			var allChecked 		= false;
			var blhpvidCheck  	= false;
			
			$('#lhpvCharges input[type=checkbox]').each(function () {
			    if(this.checked)
			    	allChecked = true;
			});
			
			$('#blhpvCharges input[type=checkbox]').each(function () {
			    if(this.checked)
			    	blhpvidCheck = true;
			});
			
			if(!allChecked)
				showMessage('error', iconForErrMsg + ' Please, Select Atleast  One Lhpv Charges CheckBox !');
			
			if(!blhpvidCheck)
				showMessage('error', iconForErrMsg + ' Please, Select DiscountOn CheckBox !');
			
			if (myNod.areAll('valid') && allChecked && blhpvidCheck) {
				if (confirm("Are you sure to Save?")) {
					showLayer();
					var jsonObject = new Object();
					var $inputs = $('#content :input');
					$inputs.each(function (index){if($(this).val() != ""){jsonObject[$(this).attr('name')] = $.trim($(this).val());}});
					
					var lhpvChargeIdString = "";
					$('#lhpvCharges input[type=checkbox]').each(function () {
						var sThisVal;
							
						if(this.checked) {
							sThisVal = this.id;
							lhpvChargeIdString += (lhpvChargeIdString == "" ? sThisVal : "," + sThisVal);
						}
					});
					
					jsonObject.lhpvChargeIdString 	= lhpvChargeIdString;
					jsonObject.blhpvChargeId 		= lhpvChargeIdString;
					
					$('#blhpvCharges input:checked').each(function() {
						jsonObject.blhpvChargeId = $(this).attr('id');
					});
					
					getJSON(jsonObject, WEB_SERVICE_URL+'/lHPVCommissionMasterWS/saveLhpvCommissionConfiguration.do', _this.showResponseAfterOperation, EXECUTE_WITH_ERROR);
					showLayer();
				}
			}
		}, createLhpvChargesCheckBox : function (response) {
			var lhpvChrgsForGrpArrList	= response.lhpvChrgsForGrpArrList;
			
			for (var i = 0; i < lhpvChrgsForGrpArrList.length; i++) {
				var $label = $("<label style='width:120px;'>").text(lhpvChrgsForGrpArrList[i].displayName);
				$('<input />', {
			        type 	: 'checkbox',
			        id		: lhpvChrgsForGrpArrList[i].lhpvChargeTypeMasterId,
			        name	: 'charge' + lhpvChrgsForGrpArrList[i].lhpvChargeTypeMasterId,
			        value	: '',
			        class	: 'checkbox'
			    }).appendTo($label);
				$label.appendTo("#lhpvCharges");
			}
		}, createBLhpvChargesCheckBox : function (response) {
			var blhpvChrgsForGrpArrList	= response.blhpvChrgsForGrpArrList;
			
			for (var i = 0; i < blhpvChrgsForGrpArrList.length; i++) {
				
				var $label = $("<label style='width:120px;'>").text(blhpvChrgsForGrpArrList[i].displayName);
				$('<input />', {
			        type 	: 'checkbox',
			        id		: blhpvChrgsForGrpArrList[i].lhpvChargeTypeMasterId,
			        name	: 'charge' + blhpvChrgsForGrpArrList[i].lhpvChargeTypeMasterId,
			        value	: '',
			        class	: 'checkbox'
			    }).appendTo($label);
				$label.appendTo("#blhpvCharges");
			}
		}, getBranchCommisionDetails : function (response) {

			var jsonObject = new Object();
			jsonObject.branchId = $("#branchEle_primary_key").val();
			getJSON(jsonObject, WEB_SERVICE_URL+'/lHPVCommissionMasterWS/getBranchLhpvCommisionDetails.do', _this.setForEdit, EXECUTE_WITH_ERROR);
		
		}, setForEdit : function (response) {
			$('input:checkbox').removeAttr('checked');
			var lhpvChargeIdString;
			var lhpvChargeIdArr;
			
			if(response.lhpvCommissionMaster != undefined) {
				lhpvcommissionid	= response.lhpvCommissionMaster.lhpvCommissionId;
				
				if(response.lhpvCommissionMaster.commissionTypeId == 1)
					$("#chargeTypeEle").val('Amount');
				
				if(response.lhpvCommissionMaster.commissionTypeId == 2)
					$("#chargeTypeEle").val('Weight');
				
				$("#chargeTypeEle_primary_key").val(response.lhpvCommissionMaster.commissionTypeId);
				$("#amountEle").val(response.lhpvCommissionMaster.commissionValue);
				
				lhpvChargeIdString = response.lhpvCommissionMaster.applicableOnLhpvChargeMasterIds
				lhpvChargeIdArr	   = lhpvChargeIdString.split(',');
			
				for(var i = 0; i < lhpvChargeIdArr.length; i++) {
					var id = lhpvChargeIdArr[i];
					$('#' + id).prop('checked', true);
				}
				
				if(response.lhpvCommissionMaster.discountOnBlhpvChargeId != undefined)
					$('#'+response.lhpvCommissionMaster.discountOnBlhpvChargeId).prop('checked', true);
				
				_this.setButtons(false);
			} else {
				$("#chargeTypeEle").val('');
				$("#chargeTypeEle_primary_key").val('');
				$("#amountEle").val('');
				_this.setButtons(true);
			}
		}, updateLhpvCommission : function(){
			myNod.performCheck();
			var allChecked 		= false;
			var blhpvidCheck  	= false;
			
			$('#lhpvCharges input[type=checkbox]').each(function () {
			    if(this.checked)
			    	allChecked = true;
			});
			
			$('#blhpvCharges input[type=checkbox]').each(function () {
			    if(this.checked)
			    	blhpvidCheck = true;
			});
			
			if(!allChecked)
				showMessage('error', iconForErrMsg + ' Please, Select Atleast One lhpvCharges CheckBox !');
			
			if(!blhpvidCheck)
				showMessage('error', iconForErrMsg + ' Please, Select DiscountOn CheckBox !');
			
			if (myNod.areAll('valid') && allChecked && blhpvidCheck) {
				if (confirm("Are you sure to Update ?")) {
					showLayer();
					var jsonObject = new Object();
					var $inputs = $('#content :input');
					$inputs.each(function (index){if($(this).val() != ""){jsonObject[$(this).attr('name')] = $.trim($(this).val());}});
					var lhpvChargeIdString = "";
					
					$('#lhpvCharges input[type=checkbox]').each(function () {
					    var sThisVal ;
					    if(this.checked) {
					    	sThisVal = this.id;
					    	lhpvChargeIdString += (lhpvChargeIdString == "" ? sThisVal : "," + sThisVal);
					    }
					});
					
					jsonObject.lhpvChargeIdString = lhpvChargeIdString;
					jsonObject.lhpvcommissionid	  = lhpvcommissionid;
					
					getJSON(jsonObject, WEB_SERVICE_URL+'/lHPVCommissionMasterWS/updateLhpvCommission.do', _this.showResponseAfterOperation, EXECUTE_WITH_ERROR);
					showLayer();
				}
			}
		}, deleteLhpvCommission  : function () {
			if (confirm("Are you sure to Delete ?")) {
				showLayer();
				var jsonObject = new Object();
				jsonObject.lhpvcommissionid	  = lhpvcommissionid;
				getJSON(jsonObject, WEB_SERVICE_URL+'/lHPVCommissionMasterWS/deleteLhpvCommission.do', _this.showResponseAfterOperation, EXECUTE_WITH_ERROR);
				showLayer();
			}
		}, selectDeselectAll : function (){
			if($('#selectAll').prop('checked')) {
				$('#lhpvCharges input[type=checkbox]').each(function () {
					$(this).prop("checked", true);
				});
			} else {
				$('#lhpvCharges input[type=checkbox]').each(function () {
					$(this).prop("checked", false);
				});
			}
		}
	});
});