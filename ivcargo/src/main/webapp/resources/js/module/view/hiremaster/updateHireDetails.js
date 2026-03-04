define([  'JsonUtility'
          ,'messageUtility'
          ,'/ivcargo/resources/js/generic/urlparameter.js'
          ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/hiremaster/hireMasterFilepath.js'
          ,'jquerylingua'
          ,'language'
          ,'autocomplete'
          ,'autocompleteWrapper'
          ,'slickGridWrapper2'
          ,'nodvalidation'
          ,'focusnavigation'//import in require.config
          ,'selectizewrapper'
          ,'bootstrapSwitch'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ],
          function(JsonUtility, MessageUtility, UrlParameter, FilePath,Lingua, Language, AutoComplete, AutoCompleteWrapper,
        		  SlickGridWrapper,NodValidation,ElementFocusNavigation,Selectizewrapper,BootstrapSwitch,BootstrapModal) {
	'use strict';
	var jsonObject = new Object(), myNod,  _this = '',btModal,sourceBranchWiseCrossingAmountId, updateSuccess,masterLangObj, masterLangKeySet,gridObject,executive,companyCommisionId;
	return Marionette.LayoutView.extend({
		initialize : function(jsonObjectData) {

			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 				= this;
			jsonObject 			= jsonObjectData.elementValue;
			btModal				= jsonObjectData.btModal;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/hireMasterWS/getHireMasterElements.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);
		},setElements : function (response){
			var branchArray		= new Array();
			var destArray		= new Array();
			var crossBranchArr	= new Array();
			var hireTypeIdArr	= new Array();
			var sequenceArr		= new Array();
			sourceBranchWiseCrossingAmountId	= jsonObject.dataView.sourceBranchWiseCrossingAmountId
			branchArray.push(jsonObject.dataView.sourceBranchId);
			if(jsonObject.dataView.crossingBranchId == 0){
				crossBranchArr.push(-1);
			}else{
				crossBranchArr.push(jsonObject.dataView.crossingBranchId);
			}
			
			if(jsonObject.dataView.destinationBranchId == 0){
				destArray.push(-1);
			}else{
				destArray.push(jsonObject.dataView.destinationBranchId);
			}
			hireTypeIdArr.push(jsonObject.dataView.hireTypeId);
			sequenceArr.push(jsonObject.dataView.sequnceNumber);
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
		
			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/hiremaster/hireMasterDetails.html",function() {
					baseHtml.resolve();
				});
			},200);
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == true) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
					}
				}
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.branchList,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'updateBranchEle',
					create			: 	false,
					maxItems		: 	1,
					items			:   branchArray
				});
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.destinationBranchList,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'uptdestinationBranchEle',
					create			: 	false,
					maxItems		: 	1,
					items			:   destArray
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.destinationBranchList,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'uptcrossingBranchEle',
					create			: 	false,
					maxItems		: 	1,
					items			:   crossBranchArr
				});
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.hireTypeArr,
					valueField		:	'hireTypeId',
					labelField		:	'hireTypeSting',
					searchField		:	'hireTypeSting',
					elementId		:	'upttypeOfHireEle',
					create			: 	false,
					maxItems		: 	1,
					onChange		: _this.onHireTypeSelect,
					items			:   hireTypeIdArr
				});
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.sequenceNumberArr,
					valueField		:	'sequnceNumber',
					labelField		:	'sequnceNumberString',
					searchField		:	'sequnceNumberString',
					elementId		:	'upthireTypeIdEle',
					create			: 	false,
					maxItems		: 	1,
					items			:   sequenceArr
				});

				
				masterLangObj = FilePath.loadLanguage();
				masterLangKeySet = loadLanguageWithParams(masterLangObj);
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector: '#updateBranchEle',
					validate: 'validateAutocomplete:#updateBranchEle',
					errorMessage: 'Select proper Source Branch !'
				});
				
				myNod.add({
					selector: '#uptdestinationBranchEle',
					validate: 'validateAutocomplete:#uptdestinationBranchEle',
					errorMessage: 'Select proper Destination Branch !'
				});
				
			
				myNod.add({
					selector: '#uptAmountEle',
					validate: 'presence',
					errorMessage: 'Please Enter Amount'
				});
				myNod.add({
					selector		: '#uptAmountEle',
					validate		: 'float',
					errorMessage	: 'value should be decimal number'
				});
				
				$('#uptAmountEle').val(jsonObject.dataView.crossingAmount);
				if(jsonObject.dataView.hireTypeId == 1){
					$('#uptcrossingBranchRow').show(); 
				}
				if(jsonObject.dataView.hireTypeId == 2){
					$('#uptdestinationBranchRow').show(); 
					 $('#uptsequnceNumberId').show(); 
				}
				hideLayer();
				$("#updateHireBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onUpdate(_this);								
					}
				});
				
				$('#uptisWeightTypeEle').bootstrapSwitch({
					on : 'YES',
					off : 'NO',
					onLabel : 'YES',
					offLabel : 'NO',
					deactiveContent : 'Are You Sure To Switch To Weight Type?',
					activeContent : 'Are You Sure To Switch From Weight Type?'

				});
				
			});
			return _this;
		
		},setBranch : function (jsonObj) {
			var autoBranchName = $("#branchEle").getInstance();

			$(autoBranchName).each(function() {
				this.option.source = jsonObj.sourceBranch;
			})
		},resetAutcomplete : function (jsonArray) {
			for ( var eleId in jsonArray) {
				var elem = $(jsonArray[eleId]).getInstance();
				$(elem).each(function() {
					var elemObj = this.elem.combo_input;
					$(elemObj).each(function() {
						$("#" + $(this).attr("id")).val('');
						$("#" + $(this).attr("id") + '_primary_key').val("");
					})
				})
			}
		},onUpdate : function() {
			showLayer();
				var jsonObject = new Object();
				if (confirm('Are you sure you want to Update?')) {
				    jsonObject["sourceBranchWiseCrossingAmountId"] 	= sourceBranchWiseCrossingAmountId;
					jsonObject["sourceBranchId"] 					= $('#updateBranchEle').val();
					jsonObject["destinationBranchId"] 				= $('#uptdestinationBranchEle').val();
					jsonObject["crossingBranchId"] 					= $('#uptcrossingBranchEle').val();
					jsonObject["hireType"] 							= $('#upttypeOfHireEle').val();
					jsonObject["sequenceNumber"] 					= $('#upthireTypeIdEle').val();
					jsonObject["amount"] 							= $('#uptAmountEle').val();
					jsonObject["isWeightType"] 						= $('#uptisWeightTypeEle').prop('checked');
					 getJSON(jsonObject, WEB_SERVICE_URL+'/hireMasterWS/updateHireDetails.do', _this.setUpdate, EXECUTE_WITH_ERROR);
					
				} else {
					hideLayer();
				}
			
		},setUpdate : function(response){
			if(response.message != undefined){
				var errorMessage = response.message;
				//showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				var MyRouter = new Marionette.AppRouter({});
				MyRouter.navigate('&modulename=hireMaster&updateSuccess=true',{trigger: true});
				location.reload();
				hideLayer();
				return;
			}

			hideLayer();
		},onShow: function(){
			updateSuccess	= UrlParameter.getModuleNameFromParam('updateSuccess');
			if(updateSuccess == 'true'){
				showMessage('success', 'Data Updated Successfully !');
			}
		},onHireTypeSelect : function (response){
			if(Number(response) == 1){
				$('#uptcrossingBranchRow').show();
				$("#uptcrossingBranchEle").prop('disabled', false);
				myNod.add({
					selector: '#uptcrossingBranchEle',
					validate: 'presenceIfNotDisable:#uptcrossingBranchEle',
					errorMessage: 'Select Crossing Branch !'
				});
			}else{
				$('#uptcrossingBranchRow').hide();
				$("#uptcrossingBranchEle").prop('disabled', true);
			}
			if(Number(response) == 2){
				$('#uptdestinationBranchRow').show();
				$("#uptdestinationBranchEle").prop('disabled', false);
				myNod.add({
					selector: '#uptdestinationBranchEle',
					validate: 'presenceIfNotDisable:#uptdestinationBranchEle',
					errorMessage: 'Select Proper Destination Branch !'
				});
				$("#uptdestinationBranchEle").prop('disabled', false);
				
				$('#uptsequnceNumberId').show();
				$("#upthireTypeIdEle").prop('disabled', false);
				myNod.add({
					selector: '#upthireTypeIdEle',
					validate: 'presenceIfNotDisable:#upthireTypeIdEle',
					errorMessage: 'Select Proper Hire Number !'
				});
			 }else{
				 $('#uptdestinationBranchRow').hide(); 
				 $('#uptsequnceNumberId').hide(); 
				 $("#uptdestinationBranchEle").prop('disabled', true);
				 $("#upthireTypeIdEle").prop('disabled', true);
			 }
		}
	});
});
