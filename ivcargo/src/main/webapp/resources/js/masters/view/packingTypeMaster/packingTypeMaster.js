define([
	'JsonUtility'
	,'messageUtility'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,'selectizewrapper'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
	],function(){
	'use strict';
	var _this = '', packingGroupTypeMasterArray, packingGroupTypeIdArr,isPackingGroupType	= false,newPackingTypeId = 0,executiveId= 0,newPackingTypeForGroupId = 0,accountGroupId = 0,executive;
	return Marionette.LayoutView.extend({
		initialize : function(){
			_this = this;
			this.$el.html(this.template);
		},render : function(){
			var jsonObject = new Object();
			getJSON(jsonObject, WEB_SERVICE_URL + '/PackingTypeMasterWS/getPackingTypeElements.do?', _this.renderPackingTypeMasterElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderPackingTypeMasterElements : function(response){
			showLayer();
			var jsonObject 				= new Object();
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			
			executive					= response.executive;
			isPackingGroupType			= response.isPackingGroupType;
			executiveId					= executive.executiveId;
			accountGroupId				= executive.accountGroupId;
			
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/master/packingtypemaster.html",
					function() {
				baseHtml.resolve();
			});
			hideLayer();

			/*---DELETE feature is working as DEACTIVATE there is no delete method for packing type---*/

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var packingTypeNameAutoComplete = new Object();
				packingTypeNameAutoComplete.primary_key 	= 'packingTypeMasterId';
				packingTypeNameAutoComplete.url 			=  WEB_SERVICE_URL + '/autoCompleteWS/getPackingTypeAutoComplete.do?';
				packingTypeNameAutoComplete.field 			= 'packingTypeMasterName';
			
				$("#packingTypeAutoEle").autocompleteCustom(packingTypeNameAutoComplete);
				$("#packingTypeAutoEle").focus();
			
				$('#packingTypeAutoEle').on('blur change',function(event){
					if($('#packingTypeAutoEle').val() != '' && $('#packingTypeAutoEle').val() != null){
						_this.getPackingTypeName(event);
						jsonObject.packingTypeMasterId 	= $('#packingTypeAutoEle_primary_key').val();
						jsonObject.accountGroupId 		= accountGroupId;
						if(jsonObject.packingTypeMasterId != null && jsonObject.packingTypeMasterId != ''){
							getJSON(jsonObject, WEB_SERVICE_URL + '/PackingTypeMasterWS/getPackingTypeDetailsByMasterAndAccountId.do?', _this.getSelectedItemData, EXECUTE_WITHOUT_ERROR);
						}
						$('#packingTypeGroup').focus();
					}else{
						$("#packingTypeGroup").removeAttr('disabled');
						$('#packingTypeName').focus();
					}
					if($('#packingTypeName').val() != '' && $('#packingTypeName').val() != null){
						$("#activate").removeAttr('disabled');
					}

					if($('#packingTypeAutoEle_primary_key').val() != '' && $('#packingTypeAutoEle_primary_key').val() != null){
						$("#delete").removeAttr('disabled');
					}
					if(isPackingGroupType && $('#packingTypeGroup').val() < 0){
						$("#activate").attr('disabled','disabled');
						$("#delete").attr('disabled','disabled');
					}
					if(jsonObject.packingTypeMasterId != null && jsonObject.packingTypeMasterId != ''){
						getJSON(jsonObject, WEB_SERVICE_URL + '/PackingTypeMasterWS/checkPackingTypeDetailsForGroup.do?', _this.getDataToViewButtons, EXECUTE_WITHOUT_ERROR);
					}
				});

				$('#packingTypeAutoEle').keyup(function(event){
					if(event.keyCode === 8 && event.keyCode != undefined){
						_this.resetAllValues();
					}
					$("#packingTypeName").removeAttr('disabled');
				});

				$('#reset').click(function(){
					_this.resetAllValues();
				});

				$('#add').click(function(){
					_this.addPackingType();
				});

				$('#addToGrp').click(function(){
					_this.addPackingTypeToGroup();
				});

				$('#delete').click(function(){
					showLayer();
					_this.deletePackingType();
				});

				$('#activate').click(function(){
					_this.activatePackingType();
				});

				$('#refresh').click(function(){
					_this.refreshMasterData();
				});

				if(isPackingGroupType) {
					$('#packingGroupPanel').removeClass("hide");
					getJSON(jsonObject, WEB_SERVICE_URL + '/PackingTypeMasterWS/getPackingGroupTypeById.do?', _this.setPackingGroupOption, EXECUTE_WITHOUT_ERROR);
				}
			});
		}, getPackingTypeName : function(e){
			var primary_key = $('#packingTypeAutoEle_primary_key').val();
			if(primary_key != ''){
				if(primary_key != null && primary_key != ''){
					$('#packingTypeName').val($("#packingTypeAutoEle").val());
					$("#packingTypeName").attr('disabled','disabled');
				}else{
					setTimeout(function(){ $('#packingTypeAutoEle').focus(); }, 500);
					showMessage('error', 'Please Select From Drop Down !');
				}
			}
		} , setPackingGroupOption : function(response){
			packingGroupTypeMasterArray = response.PackingGroupTypeMaster;
			if(packingGroupTypeMasterArray != null) {

				for(var i = 0 ; i < packingGroupTypeMasterArray.length ; i++) {
					var optionId 	= packingGroupTypeMasterArray[i].packingGroupTypeId;
					var optionValue	= packingGroupTypeMasterArray[i].packingGroupTypeId;
					var optionText	= packingGroupTypeMasterArray[i].packingGroupTypeName;

					var newOption = $("<option/>");
					$('#packingTypeGroup').append(newOption);
					newOption.attr('id', optionId);
					newOption.val(optionValue);
					newOption.html(optionText);

				}
			}
		},resetAllValues : function(){
			$('#packingTypeAutoEle').val('');
			$('#packingTypeName').val('');
			$('#packingTypeName').removeAttr('disabled');
			$('#packingTypeGroup').val(-1);

			$('#packingTypeGroup').prop('disabled', false);
			$('#add').prop('disabled', false);
			$('#addToGrp').prop('disabled', true);
			$('#edit').prop('disabled', true);
			$('#delete').prop('disabled', true);
			$('#activate').prop('disabled', true);
			$("#packingTypeName").readOnly = false;
		}, getSelectedItemData : function(response){
			// work pending
			packingGroupTypeIdArr = response.packingGroupTypeDetails;
			if(isPackingGroupType){
				if(packingGroupTypeIdArr != null && packingGroupTypeIdArr.length > 0){
					for(var i = 0; i<packingGroupTypeIdArr.length ; i++){
						var packingGroupTypeId = packingGroupTypeIdArr[i].packingGroupTypeId;
						$('#packingTypeGroup').val(packingGroupTypeId)
						$("#packingTypeGroup").attr('disabled','disabled');
						$("#add").attr('disabled','disabled');
						$("#addToGrp").attr('disabled','disabled');
						$("#delete").removeAttr('disabled');
					}
				}else{
					$("#packingTypeGroup").removeAttr('disabled');
					$("#addToGrp").removeAttr('disabled');
					$('#packingTypeGroup').focus();
					$('#packingTypeGroup').val(-1)
				}
			}
		}, addPackingType : function(){
			if($('#packingTypeName').val() != ''){
				_this.insertUpdatePackingType();
				$('#packingTypeName').css('border-color','green');
			}else{
				$('#packingTypeName').focus();
				$('#packingTypeName').css('border-color','red');
				showMessage('error', 'Please, Enter Packing Type Name !');
			}

		},insertUpdatePackingType : function(){
			var packingTypeName			= $('#packingTypeName').val();
			var packingGrpId			= $('#packingTypeGroup').val();

			var jsonObject				= new Object();

			jsonObject.filter			= 3;
			jsonObject.pkgTypeName		= packingTypeName.trim();
			jsonObject.packingGrpId		= packingGrpId;
			jsonObject.executiveId		= executiveId;
			if(packingTypeName == '' || packingTypeName == null){
				showMessage('error', 'Please, Enter Packing Type Name !');
				$('#packingTypeName').focus();
				return false;
			}
			if(isPackingGroupType){
				if($('#packingTypeGroup').val() < 0){
					showMessage('error', 'Please, Select Packing Type Group !');
					$('#packingTypeGroup').focus();
					return false;
				}
			}
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/PackingTypeMasterWS/addPackingTypeMaster.do?', _this.afterCheckingExistingAddPackingTypeMaster, EXECUTE_WITHOUT_ERROR);
		}, afterCheckingExistingAddPackingTypeMaster : function(response){

			var packingTypeName			= $('#packingTypeName').val();
			var packingGrpId			= $('#packingTypeGroup').val();
			var jsonObject				= new Object();

			jsonObject.pkgTypeName		= packingTypeName.trim();
			jsonObject.packingGrpId		= packingGrpId;
			jsonObject.executiveId		= executiveId;
			jsonObject.executive		= executive;
			jsonObject.accountGroupId	= accountGroupId;
			if(!response.isPackingTypeExits){
				showLayer();
				if(isPackingGroupType){
					if(packingGrpId < 0){
						showMessage('error', 'Please, Select Packing Type Group !');
						$('#packingTypeGroup').focus();
						$('#packingTypeGroup').css('border-color','red');
						return false;
					}
					getJSON(jsonObject, WEB_SERVICE_URL + '/PackingTypeMasterWS/insertPackingType.do?', _this.afterInsertPackingTypeWithPackingGroup, EXECUTE_WITHOUT_ERROR);
				}else{
					getJSON(jsonObject, WEB_SERVICE_URL + '/PackingTypeMasterWS/insertPackingType.do?', _this.afterInsertPackingType, EXECUTE_WITHOUT_ERROR);
				}
			}else{
				showMessage('warning', 'Packing Type Already Exists !');
				hideLayer();
			}

		},afterInsertPackingTypeWithPackingGroup : function(response){
			newPackingTypeId = response.PackingTypeMasterDetails;
			if(newPackingTypeId > 0){
				var jsonObject				= new Object();

				jsonObject.packingTypeId		= newPackingTypeId;
				jsonObject.accountGroupId		= accountGroupId;
				jsonObject.executiveId			= executiveId;

				getJSON(jsonObject, WEB_SERVICE_URL + '/PackingTypeMasterWS/insertForGroup.do?', _this.afterInsertForGroup, EXECUTE_WITHOUT_ERROR);
			}

		}, afterInsertForGroup : function(response){
			var jsonObject				= new Object();
			var packingGrpId			= $('#packingTypeGroup').val();

			newPackingTypeForGroupId 		= response.PackingTypeMasterDetails;
			if(newPackingTypeId != 0){
				jsonObject.newPackingTypeId		= newPackingTypeId;
			}else{
				jsonObject.newPackingTypeId		= $('#packingTypeAutoEle_primary_key').val();
			}
			jsonObject.accountGroupId		= accountGroupId;
			jsonObject.executiveId			= executiveId;
			jsonObject.packingGrpId			= packingGrpId;

			jsonObject.newPackingTypeForGroupId			= newPackingTypeForGroupId;
			if(newPackingTypeForGroupId > 0){
				getJSON(jsonObject, WEB_SERVICE_URL + '/PackingTypeMasterWS/updatePackingGroupMapping.do?', _this.afterUpdatePackingGroupMapping, EXECUTE_WITHOUT_ERROR);
			}
		}, afterUpdatePackingGroupMapping : function(response){
			if(response.addSuccessGrp == 'true'){
				showMessage('success', 'Packing Type Added Successfully And Grouping Also Done! Please Wait.....');
				_this.refreshMasterData();
			}else{
				showMessage('error', 'Something went Wrong !');
				hideLayer();
			}
			_this.resetAllValues();
		} , afterInsertPackingType : function(response){
			newPackingTypeId = response.PackingTypeMasterDetails;
			if(newPackingTypeId > 0){
				showMessage('success', 'Packing Type Added Successfully! Please Wait.....');
				_this.resetAllValues();
				_this.refreshMasterData();
			}
		}, addPackingTypeToGroup : function (){
			var packingTypeId			= $('#packingTypeAutoEle_primary_key').val();
			var packingGrpId			= $('#packingTypeGroup').val();

			var jsonObject				= new Object();
			jsonObject.packingTypeId	= packingTypeId;
			jsonObject.packingGrpId		= packingGrpId;
			jsonObject.executiveId		= executiveId;
			jsonObject.accountGroupId	= accountGroupId;

			if(isPackingGroupType){
				if(packingGrpId < 0){
					showMessage('error', 'Please, Select Packing Type Group !');
					$('#packingTypeGroup').focus();
					return false;
				}
				if(packingTypeId > 0){
					showLayer();
					getJSON(jsonObject, WEB_SERVICE_URL + '/PackingTypeMasterWS/insertForGroup.do?', _this.afterInsertForGroup, EXECUTE_WITH_ERROR);
				}
			}else{
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL + '/PackingTypeMasterWS/insertForGroup.do?', _this.afterInsertPackingType, EXECUTE_WITH_ERROR);
			}


		}, deletePackingType : function(){
			var packingTypeId			= $('#packingTypeAutoEle_primary_key').val();
			var jsonObject				= new Object();

			jsonObject.packingTypeId	= packingTypeId;
			jsonObject.accountGroupId	= accountGroupId;
			jsonObject.executiveId		= executiveId;

			if(isPackingGroupType){
				if(packingTypeId > 0 && packingTypeId != ''){
					getJSON(jsonObject, WEB_SERVICE_URL + '/PackingTypeMasterWS/deletePackingTypeForGroup.do?', _this.afterDeletePackingTypeForGroup, EXECUTE_WITHOUT_ERROR);
				}
			}else{
				getJSON(jsonObject, WEB_SERVICE_URL + '/PackingTypeMasterWS/deletePackingTypeForGroup.do?', _this.afterDeletePackingTypeOnly, EXECUTE_WITHOUT_ERROR);
			}

		}, afterDeletePackingTypeForGroup : function(response){
			var packingTypeId			= $('#packingTypeAutoEle_primary_key').val();
			var jsonObject				= new Object();

			jsonObject.packingTypeId	= packingTypeId;
			jsonObject.accountGroupId	= accountGroupId;
			jsonObject.executiveId		= executiveId;
			if(response.deleteSuccessGrp == 'true'){
				getJSON(jsonObject, WEB_SERVICE_URL + '/PackingTypeMasterWS/deletePackingTypeByGroupMapping.do?', _this.afterDeletePackingTypeByGroupMapping, EXECUTE_WITHOUT_ERROR);
			}
		}, afterDeletePackingTypeByGroupMapping : function(response){
			if(response.deleteSuccessGrp == 'true'){
				showMessage('success', 'Packing Type Removed Successfully And Mapping Removed!  Please Wait.....');
				_this.resetAllValues();
				_this.refreshMasterData();
				//refresh cache
			}else{
				showMessage('error', 'Packing Type Cannot Removed or Already Deleted!');
				hideLayer();
			}

		}, afterDeletePackingTypeOnly : function(response){

			if(response.deleteSuccessGrp == 'true'){
				showMessage('success', 'Packing Type Removed Successfully ! Please Wait.....');
			}else{
				showMessage('error', 'Packing Type Cannot Removed or Already Deleted!');
			}
			_this.resetAllValues();
			_this.refreshMasterData();
			//refresh cache
		}, activatePackingType : function(){
			showLayer();
			var packingTypeId			= $('#packingTypeAutoEle_primary_key').val();
			var jsonObject				= new Object();

			jsonObject.packingTypeId	= packingTypeId;
			jsonObject.accountGroupId	= accountGroupId;
			jsonObject.executiveId		= executiveId;
			if(packingTypeId != ''){

				getJSON(jsonObject, WEB_SERVICE_URL + '/PackingTypeMasterWS/activatePackingType.do?', _this.afterActivatePackingType, EXECUTE_WITHOUT_ERROR);
			}
		}, afterActivatePackingType : function(response){

			if(response.activateSuccessGrp == 'true'){
				showMessage('success', 'Packing Type Activated Successfully ! Please Wait.....');
				_this.resetAllValues();
				_this.refreshMasterData();
				//refresh cache
			}else{
				showMessage('warning', 'Packing Type Cannot Activate , First Add To Group!');
				hideLayer();
			}
		}, refreshMasterData : function(){
			//showLayer();
			showMessage('info', 'Master Data is Updating Please Wait... !');
			refreshCache(PACKING_TYPE_MASTER, accountGroupId);
		}, getDataToViewButtons : function(response){
			
			var packingTypeArr = response.packingTypeMaster;
			/*if(packingTypeArr != null || !packingTypeArr.isEmpty()){
			}*/
			if(packingTypeArr.length == 0){
				$('#add').prop('disabled', true);
				$('#delete').prop('disabled', true);
				$('#activate').prop('disabled', true);
				$('#addToGrp').prop('disabled', false);
				
			}
			if(packingTypeArr.length > 0){
				for(var i = 0; i < response.packingTypeMaster.length; i++){
					if(!response.packingTypeMaster[i].packingTypeMasterMfd){
						$('#add').prop('disabled', true);
						$('#addToGrp').prop('disabled', true);
						$('#activate').prop('disabled', true);
					}else{
						$('#add').prop('disabled', true);
						$('#delete').prop('disabled', true);
						
					}
				}
			}
		}
	});
});