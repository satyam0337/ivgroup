var _thisPopulate;
define(['JsonUtility'],function(JsonUtility) {
	return {
		getRegionSubRegionBranch:function(executiveType){
			_thisPopulate = this;
			
			if(executiveType == EXECUTIVE_TYPE_GROUPADMIN) {
				getJSON(null, WEB_SERVICE_URL+'/selectOptionsWS/getRegionOption.do', _thisPopulate.setRegions, EXECUTE_WITH_ERROR);
			}else if(executiveType == EXECUTIVE_TYPE_REGIONADMIN){
				getJSON(null, WEB_SERVICE_URL+'/selectOptionsWS/getSubRegionOption.do', _thisPopulate.setSubRegions, EXECUTE_WITH_ERROR);
			} else if(executiveType == EXECUTIVE_TYPE_SUBREGIONADMIN){
				getJSON(null, WEB_SERVICE_URL+'/selectOptionsWS/getBranchOption.do', _thisPopulate.setBranches, EXECUTE_WITH_ERROR);
			}
			
		},setRegions : function(jsonObj){
			var configuration = jsonObj.configuration;
			if(configuration.Region == 'true'){
				_thisPopulate.setSubregionAutocompleteInstance();
				_thisPopulate.setBranchesAutocompleteInstance();
			}

			var autoRegionName = new Object();
			autoRegionName.url = jsonObj.region;
			autoRegionName.primary_key = 'regionId';
			autoRegionName.field = 'regionName';
			autoRegionName.callBack = _thisPopulate.onRegionSelect;

			$("#regionSelectEle").autocompleteCustom(autoRegionName);
		},onRegionSelect : function(obj){
			var jsonArray = new Array();

			jsonArray.push('#subRegionSelectEle');
			jsonArray.push('#branchSelectEle');
			jsonArray.push('#godownEle');

			_thisPopulate.resetAutcomplete(jsonArray);

			var jsonObject = new Object();
			var $inputs = $('#ElementDiv :input');
			$inputs.each(function (index){if($(this).val() != ""){jsonObject[$(this).attr('name')] = $.trim($(this).val());}});

			getJSON(jsonObject, WEB_SERVICE_URL+'/selectOptionsWS/getSubRegionOption.do', _thisPopulate.setSubRegions, EXECUTE_WITH_ERROR);

		},setSubRegions : function(jsonObj){
			var configuration = jsonObj.configuration;

			if(configuration.Region == 'false'){
				_thisPopulate.setSubregionAutocompleteInstance();
				_thisPopulate.setBranchesAutocompleteInstance();
			}

			var autoSubRegionName = $("#subRegionSelectEle").getInstance();

			$( autoSubRegionName ).each(function() {
				this.option.source = jsonObj.subRegion;
			})
		},onSubRegionSelect : function(obj){
			var jsonArray = new Array();

			jsonArray.push('#branchSelectEle');
			

			_thisPopulate.resetAutcomplete(jsonArray);

			var jsonObject = new Object();
			var $inputs = $('#ElementDiv :input');
			$inputs.each(function (index){if($(this).val() != ""){jsonObject[$(this).attr('name')] = $.trim($(this).val());}});

			getJSON(jsonObject, WEB_SERVICE_URL+'/selectOptionsWS/getBranchOption.do', _thisPopulate.setBranches, EXECUTE_WITH_ERROR);
		},setBranches : function(jsonObj){	
			var configuration = jsonObj.configuration;

			if(configuration.SubRegion == 'false'){
				_thisPopulate.setBranchesAutocompleteInstance();
			}

			var autoBranchName = $("#branchSelectEle").getInstance();
			$( autoBranchName ).each(function() {
				this.option.source = jsonObj.sourceBranch;
			})
		},setSubregionAutocompleteInstance:function(){
			var autoSubRegionName = new Object();

			autoSubRegionName.primary_key = 'subRegionId';
			autoSubRegionName.field = 'subRegionName';
			autoSubRegionName.callBack = _thisPopulate.onSubRegionSelect;
			$("#subRegionSelectEle").autocompleteCustom(autoSubRegionName);
		},resetAutcomplete:function(jsonArray){
			for(var eleId in jsonArray){
				var elem = $(jsonArray[eleId]).getInstance();
				$( elem ).each(function() {
					this.elem.combo_input.context.value = '';
					$(this.elem.combo_input.context.id+'_primary_key').val("");
				})
			}
		},setBranchesAutocompleteInstance : function(){
			
			var autoBranchName = new Object();
			autoBranchName.primary_key = 'branchId';
			autoBranchName.field = 'branchName';

			$("#branchSelectEle").autocompleteCustom(autoBranchName)
		},getRegionSubRegionBranchwithoutExecutiveType : function(){
			_thisPopulate = this;
			getJSON(null, WEB_SERVICE_URL+'/selectOptionsWS/getRegionOption.do', _thisPopulate.setRegions, EXECUTE_WITH_ERROR);
		}
	}
})