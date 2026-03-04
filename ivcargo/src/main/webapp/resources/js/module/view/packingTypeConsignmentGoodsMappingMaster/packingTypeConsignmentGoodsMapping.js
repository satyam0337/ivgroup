define([  'JsonUtility'
          ,'messageUtility'
          ,'/ivcargo/resources/js/generic/urlparameter.js'
          ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/packingTypeConsignmentGoodsMappingMaster/packingTypeConsignmentGoodsMappingFilePath.js'
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
          ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/packingTypeConsignmentGoodsMappingMaster/packingTypeConsignmentGoodsMappingDetails.js'
          
          ],
          function(JsonUtility, MessageUtility, UrlParameter, FilePath,Lingua, Language, AutoComplete, AutoCompleteWrapper,
        		  SlickGridWrapper,NodValidation,ElementFocusNavigation,Selectizewrapper,BootstrapSwitch,BootstrapModal,PackingTypeConsignmentGoodsMappingDetails) {
	'use strict';
	var jsonObject = new Object(), myNod, mynod2,  _this = '',masterLangObj, masterLangKeySet,packingTypeConsignmentGoodsMappingId, tableRow=null, checkboxcount=10;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/packingTypeConsignmentGoodsMappingMasterWS/getPackingTypeConsignmentGoodsMappingElementConfiguration.do?',_this.setMasterElements, EXECUTE_WITH_ERROR);
			return _this;
		},setMasterElements : function (response){
			
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/packingTypeConsignmentGoodsMappingMaster/packingTypeConsignmentGoodsMapping.html",function() {
				baseHtml.resolve();
			});
			$.when.apply($, loadelement).done(function() {
			initialiseFocus();
				var keyObject = Object.keys(response);
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == true) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
					}
				}
				
				masterLangObj = FilePath.loadLanguage();
				masterLangKeySet = loadLanguageWithParams(masterLangObj);
				
				$("#add").click(function(){
					_this.showAddSaidToContainPanel();
				});
				
				$("#deleteOption").click(function(){
					_this.showDeleteSaidToContainPanel();
				});
				
				$("#viewAllBtn").click(function(){
					_this.getPackingTypeAndSaidToContainDetailsForView();
				});
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod.add({
					selector		: '#packingTypeEle',
					validate		: 'validateAutocomplete:#packingTypeEle_primary_key',
					errorMessage	: 'Please Select Packing Type'
				});
				
				/*myNod.add({
					selector		: '#saidToContainEle',
					validate		: 'validateAutocomplete:#saidToContainEle_primary_key',
					errorMessage	: 'Please Select Said To Contain'
				});*/
				
				var packingTypeAutoComplete = new Object();
				packingTypeAutoComplete.primary_key 	= 'packingTypeMasterId';
				packingTypeAutoComplete.url 			=  WEB_SERVICE_URL + '/autoCompleteWS/getPackingTypeByNameAndGroupId.do?isAllPackingType=true';
				packingTypeAutoComplete.field 			= 'packingGroupTypeName';
				
				$("#packingTypeEle").autocompleteCustom(packingTypeAutoComplete);
				
				var saidToContainAutoComplete = new Object();
				saidToContainAutoComplete.primary_key 	= 'consignmentGoodsId';
				saidToContainAutoComplete.url 			=  WEB_SERVICE_URL + '/autoCompleteWS/getAllConsignmentGoodsDetailsByName.do?';
				saidToContainAutoComplete.field 		= 'name';
				saidToContainAutoComplete.callBack		= _this.createCheckBoxForSaidToContainList
				
				$("#saidToContainEle").autocompleteCustom(saidToContainAutoComplete);
				
				var packingTypeNameAutoComplete = new Object();
				packingTypeNameAutoComplete.primary_key 	= 'packingTypeMasterId';
				packingTypeNameAutoComplete.url 			=  WEB_SERVICE_URL + '/autoCompleteWS/getPackingTypeByNameAndGroupId.do?isAllPackingType=true';
				packingTypeNameAutoComplete.field 			= 'packingGroupTypeName';
				
				$("#packingTypeNameEle").autocompleteCustom(packingTypeNameAutoComplete);
				
				hideLayer();
				$("#saveBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						if($('#saidToContainIdList').exists() && !$('#saidToContainIdList').is(':empty')) {
							_this.onSubmit(_this);								
						} else {
							showMessage('error', 'Please Select Said To Contain !');
							return;
						}
					}
				});
			});
			return _this;
		
		},showAddSaidToContainPanel : function(){
			
			$("#right-border-boxshadow").addClass("hide");
			$("#right-border-boxshadow").css("opacity", 0);
			$("#middle-border-boxshadow").hide();
			$("#bottom-border-boxshadow").css("opacity", 0);
			$("#middle-border-boxshadow").removeClass("hide");
			$("#middle-border-boxshadow").toggle("slide", { direction: "up" }, 500);
			$("#packingTypeEle").val('');
			$("#saidToContainEle").val('');
			$("#saidToContainIdList").empty();
			$('#deleteSelection').show();
			
		},showDeleteSaidToContainPanel : function(){
			
			$("#right-border-boxshadow").addClass("hide");
			$("#right-border-boxshadow").css("opacity", 0);
			$("#middle-border-boxshadow").hide();
			$("#bottom-border-boxshadow").hide();
			$("#bottom-border-boxshadow").css("opacity", 1);
			$("#bottom-border-boxshadow").removeClass("hide");
			$("#bottom-border-boxshadow").toggle("slide", { direction: "up" }, 500);
			$("#packingTypeNameEle").val('');
			$("#saidToContainIdList").empty();
			
			mynod2 = nod();
			mynod2.configure({
				parentClass:'validation-message'
			});
			
			mynod2.add({
				selector		: '#packingTypeNameEle',
				validate		: 'validateAutocomplete:#packingTypeNameEle_primary_key',
				errorMessage	: 'Please Select Packing Type'
			});
			
			hideLayer();
			$("#findBtn").click(function() {
				mynod2.performCheck();
				if(mynod2.areAll('valid')){
					_this.getPackingTypeAndSaidToContainDetailsForDelete();					
				}
			});
			
		},getPackingTypeAndSaidToContainDetailsForView : function(){
			
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/packingTypeConsignmentGoodsMappingMasterWS/getPackingTypeConsignmentGoodsMappingDetailsByAccountGroupId.do', _this.setViewAllData, EXECUTE_WITH_ERROR);
			
		},getPackingTypeAndSaidToContainDetailsForDelete : function() {
			$("#right-border-boxshadow").removeClass("hide");
			$("#right-border-boxshadow").css("opacity", 1);
			showLayer();
			var jsonObject = new Object();
			
			jsonObject["packingTypeMasterId"]	= $('#packingTypeNameEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/packingTypeConsignmentGoodsMappingMasterWS/getPackingTypeConsignmentGoodsMappingDetailsByAccountGroupIdAndPackingTypeMasterId.do', _this.setDataForDelete, EXECUTE_WITH_ERROR);
			
		},createCheckBoxForSaidToContainList : function () {
			var id 	= $('#saidToContainEle_primary_key').val();
			var name	= $('#saidToContainEle').val();
			
			$("#saidToContainIdList").show();
			
			if($("#checkboxSaidToContain" + id).exists()) {
				showMessage('warning', 'Said To Contain Already Added !');
				return;
			}
			
			var rowscounts = $("#saidToContainIdList").find('tr').length;
			var columnscounts = 0;

			if (rowscounts == 0) {
				tableRow		= createRowInTable('tr_'+id,'','');
			} else {
				columnscounts = $("#saidToContainIdList").find('tr:last')[0].cells.length;
			}
			
			if (columnscounts % checkboxcount == 0) {
				tableRow		=  createRowInTable('tr_'+id,'','');
			}
			
			var inputAttr1		= new Object();
			
			var tableCol		= createColumnInRow(tableRow,'td_' + id,'50px','','','', '');
			
			var checkboxSaidToContain		= $("<input/>", { 
				type		: 'checkbox', 
				id			: 'checkboxSaidToContain' + id, 
				class		: 'form-control col-xs-1 text-right', 
				name		: 'checkboxSaidToContain' , 
				value 		: id});

			$(tableCol).append(name);
			$(tableCol).append('<br>');
			appendValueInTableCol(tableCol, checkboxSaidToContain);
			
			$('#saidToContainIdList').append(tableRow);
			$('#saidToContainEle').val('');
			$('#saidToContainEle_primary_key').val(0);
		},setDataForDelete : function(response) {
			
			$('#middle-border-boxshadow').addClass('hide');
			
			$('#deletePackingTypeConsignmentGoodsMappingDetails').empty();
			goToPosition('right-border-boxshadow', 'slow');
						
			if(response.message != undefined){
				hideLayer();
				var errorMessage = response.message;
				showMessage('error', errorMessage.typeSymble + '  ' +  errorMessage.description);
				$('#right-border-boxshadow').addClass('hide');
				return;
			}
			
			var packingTypeConsignmentGoodsMappingList	= response.packingTypeConsignmentGoodsMappingList;
			
			
			if(response.packingTypeConsignmentGoodsMappingList != undefined || packingTypeConsignmentGoodsMappingList != undefined) {
				
				var columnArray		= new Array();

				for (var i = 0; i < packingTypeConsignmentGoodsMappingList.length; i++) {
					var obj		= packingTypeConsignmentGoodsMappingList[i];

					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='packingTypeTd_" + obj.packingTypeConsignmentGoodsMappingId + "' name='packingTypeTd_" + obj.packingTypeMasterId + "' value='"+ obj.packingTypeName +"'>" + (obj.packingTypeName) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='saidToContainTd_" + obj.packingTypeConsignmentGoodsMappingId + "' name='saidToContainTd_" + obj.consignmentGoodsId + "' value='"+ obj.consignmentGoodsName +"'>" + (obj.consignmentGoodsName) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='deleteConsignmentGoods_" + obj.packingTypeConsignmentGoodsMappingId + "'><b style='font-size: 14px'>Delete</b></a></td>");
					$('#editDetailsTable tbody').append('<tr id="editPackingTypeConsignmentGoodsMappingDetails_'+ obj.packingTypeConsignmentGoodsMappingId +'">' + columnArray.join(' ') + '</tr>');

					$("#deleteConsignmentGoods_" + obj.packingTypeConsignmentGoodsMappingId).bind("click", function() {
						var elementId							= $(this).attr('id');
						packingTypeConsignmentGoodsMappingId	= elementId.split('_')[1];
						_this.deleteConsignmentGoodsDetails();
					});

					columnArray	= [];
				}

				hideLayer();
			}
		},setViewAllData : function(response) {
			
			if(response.packingTypeConsignmentGoodsMappingList != undefined && (response.packingTypeConsignmentGoodsMappingList.CorporateAccount).length > 0) {
				var jsonObject = new Object();
				jsonObject["response"] 		= response;
				
				var object = new Object();
				object.elementValue = jsonObject;

				var btModal = new Backbone.BootstrapModal({
					content: new PackingTypeConsignmentGoodsMappingDetails(object),
					modalWidth : 55,
					title:'Article Mapping Master Details'
				}).open();
				
				object.btModal = btModal;
				new PackingTypeConsignmentGoodsMappingDetails(object)
				btModal.open();
			} else {
				hideLayer();
				showMessage('error','No Records Found!');
			}
			
		},removeMultiIdList : function () {
			if ($("#selectAllMultiId").prop("checked") == true) {
				$('#saidToContainIdList').empty();
			} else {
				$("input[name='checkboxSaidToContain']:checked").closest("td").remove(); // closest function find closest tag of given id. 
			}
		},deleteConsignmentGoodsDetails : function () {
			if (confirm("Are you sure to delete?")) {
				showLayer();
				if($('#deletePackingTypeConsignmentGoodsMappingDetails').is(':empty')) {
					
					$('#right-border-boxshadow').addClass('hide');
					$("#right-border-boxshadow").css("opacity", 0);
					
				}
				
				var jsonObject = new Object();
				
				jsonObject["packingTypeConsignmentGoodsMappingId"]	=	packingTypeConsignmentGoodsMappingId;
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/packingTypeConsignmentGoodsMappingMasterWS/deleteConsignmentGoodsDetails.do', _this.showResponseAfterDelete, EXECUTE_WITH_ERROR);
			}
		},showResponseAfterDelete : function (response) {
			
			if (response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				
			} 
			
			if(response.deleted) {
				
				var row = $('#editPackingTypeConsignmentGoodsMappingDetails_' + packingTypeConsignmentGoodsMappingId).closest('tr');
				
				setTimeout(function() { // Simulating ajax
					var siblings = row.siblings();
					row.remove();
					siblings.each(function(index) {
						$(this).children().first().text(index + 1);
					});
				}, 100);
				
				var deletePackingTypeConsignmentGoodsMappingDetailsLength = $('#deletePackingTypeConsignmentGoodsMappingDetails tr').length - 1;
				
				if(deletePackingTypeConsignmentGoodsMappingDetailsLength == 0) {
					$('#right-border-boxshadow').addClass('hide');
				}
			}
			
			hideLayer();
		},onSubmit : function() {
			showLayer();
				var jsonObject = new Object();
				
				jsonObject["packingTypeMasterId"]	= $('#packingTypeEle_primary_key').val();
				
				var checkBoxArray	= new Array();
				
				$("input[name=checkboxSaidToContain]").each( function () {
					checkBoxArray.push($(this).val());
				});

				jsonObject["consignmentGoodsIds"]	= checkBoxArray.join(',');
				
				 getJSON(jsonObject, WEB_SERVICE_URL+'/packingTypeConsignmentGoodsMappingMasterWS/savePackingTypeConsignmentGoodsMappingDetails.do',_this.setSavingResponse, EXECUTE_WITH_ERROR);
		},setSavingResponse : function(response) {
			
			$("#packingTypeEle").val('');
			$("#saidToContainEle").val('');
			$("#saidToContainIdList").empty();
			
			hideLayer();
			return;
		}
	});
});