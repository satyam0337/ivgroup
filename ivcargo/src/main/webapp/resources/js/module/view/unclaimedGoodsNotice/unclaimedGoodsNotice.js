var operationId 				= 0;
var noticeGenerated 			= false;
var generateOtherBranchNotice 	= false;
var selectedBranch 				= 0;
var executiveBranchId 			= 0;
var iconForWarningMsg			= '<i class="fa fa-warning"></i>';
var alphaNumericAllowWarningMsg	= iconForWarningMsg+' Only A-Z and 0-9 allowed, No other Character Allowed !';
var NOTICE_1					= 0;
var NOTICE_2					= 0;
var NOTICE_3					= 0;
define([ 'marionette'
	,'JsonUtility'
	,'messageUtility'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/unclaimedGoodsNotice/unclaimedGoodsNoticeFilePath.js'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'jquerylingua'
	,'language'
	,'nodvalidation'
	,'focusnavigation'
	,'selectizewrapper'
	,'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'/ivcargo/resources/js/validation/regexvalidation.js'
	],
	function(Marionette, JsonUtility, MessageUtility, UrlParameter, FilePath, BootstrapModal, jquerylingua, language, NodValidation, FocusNavigation, Selectizewrapper, slickGridWrapper2, Selection, regexvalidation) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	masterLangKeySet,
	gridObject,
	masterLangObj,
	myNod,
	myNod1,
	srcount = 0,
	chargesArr = new Array(),
	wayBillChargeForGroupId,
	OfficeExpenseChargesList,
	LRExpenseChargesList,
	chargeTypeModelArr,
	expenseVoucherConfigId,
	incomeExpenseChargeMasterId,
	branchIds,
	expenseTypeId,
	updateArray,
	expenseName,
	noticeArr,
	noticeCount,
	noticeLimit,
	noticeDays,
	noticeIdList,
	noticeIdWithDays,
	noticeMap = new Map(),
	generateNotice	= 1,
	viewNotice		= 2,
	doneTheStuff = false,
	_this = '';
	var jsonObject = new Object(), myNod, corporateAccountId = 0,  _this = '', gridObject, corporateAccountId = 0,crossingTypeComboBoxShow = false, customerAccessId = 0, masterLangObj, masterLangKeySet, caLangObj, caLangKeySet,viewAll=true,checkViewAll=false,sortByLastNumber=false,crossingBranchWisePendingDispatch,crossingBranchIds,branchIdsForCrossingBranch;
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			_this = this;
		}, render: function() {

			getJSON(jsonObject, WEB_SERVICE_URL + '/unclaimedGoodsNoticeWS/getUnclaimedGoodsNoticeElementConfiguration.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);

		}, setElements : function(response) {
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/unclaimedGoodsNotice/unclaimedGoodsNotice.html",function() {
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

				masterLangObj 				= FilePath.loadLanguage();
				masterLangKeySet 			= loadLanguageWithParams(masterLangObj);

				var elementConfiguration				= new Object();

				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration			= elementConfiguration;
				response.sourceAreaSelection			= true;
				response.AllOptionsForRegion  			= false;
				response.AllOptionsForSubRegion			= false;
				response.AllOptionsForBranch  			= false;
				response.isPhysicalBranchesShow			= true;

				Selection.setSelectionToGetData(response);

				executiveBranchId			= response.executive.branchId;
				generateOtherBranchNotice	= response.generateOtherBranchNotice;
				noticeIdWithDays			= response.noticeConfig.noticeIdWithDays;
				noticeIdList    			= new Array();
				var noticeIds				= noticeIdWithDays.split(',');
				NOTICE_1					= response.NOTICE_1;
				NOTICE_2					= response.NOTICE_2;
				NOTICE_3					= response.NOTICE_3;

				for(var k = 0; k<noticeIds.length; k++){
					noticeIdList[k] = noticeIds[k].split('_')[0];
					noticeMap.set(noticeIds[k].split('_')[0], noticeIds[k].split('_')[1]);
				}

				if (executive.executiveType == EXECUTIVE_TYPE_REGIONADMIN) {
					$("#regionEle_primary_key").val(executive.regionId);
					var autoSubRegionName = $("#subRegionEle").getInstance();

					$(autoSubRegionName).each(function() {
						this.option.source = response.subRegionList;
					});
				}

				if (executive.executiveType == EXECUTIVE_TYPE_SUBREGIONADMIN) {
					$("#regionEle_primary_key").val(executive.regionId);
					$("#subRegionEle_primary_key").val(executive.subRegionId);
					var autoBranchName = $("#branchEle").getInstance();

					$(autoBranchName).each(function() {
						this.option.source = response.branchList;
					})
				}

				if (executive.executiveType == EXECUTIVE_TYPE_BRANCHADMIN) {
					$("#regionEle_primary_key").val(executive.regionId);
					$("#subRegionEle_primary_key").val(executive.subRegionId);
					$("#branchEle_primary_key").val(executive.branchId);
				}

				if (executive.executiveType == EXECUTIVE_TYPE_EXECUTIVE) {
					$("#regionEle_primary_key").val(executive.regionId);
					$("#subRegionEle_primary_key").val(executive.subRegionId);
					$("#branchEle_primary_key").val(executive.branchId);
				}

				var operationArr 	= new Array();
				operationArr[0] 	= {'id':generateNotice,'value':'Generate notice'};
				operationArr[1] 	= {'id':viewNotice,'value':'View notices'};

				noticeArr	 		= new Array();
				for(var i=0; i<noticeIdList.length; i++){
					noticeArr[i]    = {'id':(i + 1),'value':'Notice '+(noticeIdList[i])+''};
				}

				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	noticeArr,
					valueField		:	'id',
					labelField		:	'value',
					searchField		:	'value',
					elementId		:	'noticeEle',
					create			: 	false,
					maxItems		: 	1,
				});

				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	operationArr,
					valueField		:	'id',
					labelField		:	'value',
					searchField		:	'value',
					elementId		:	'operationEle',
					create			: 	false,
					maxItems		: 	1,
					onChange		:   _this.onOperationChange
				});

				Selectizewrapper.setAutocomplete({
					valueField		:	'godownId',
					labelField		:	'name',
					searchField		:	'name',
					elementId		:	'godownEle',
					create			: 	false,
					maxItems		: 	1,
				});

				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);

				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector		: '#regionEle',
					validate		: 'validateAutocomplete:#regionEle',
					errorMessage	: 'Select proper Region !'
				});

				myNod.add({
					selector		: '#subRegionEle',
					validate		: 'validateAutocomplete:#subRegionEle',
					errorMessage	: 'Select proper SubRegion !'
				});

				myNod.add({
					selector		: '#branchEle',
					validate		: 'validateAutocomplete:#branchEle',
					errorMessage	: 'Select proper Branch !'
				});

				myNod.add({
					selector		: '#godownEle',
					validate		: 'validateAutocomplete:#godownEle',
					errorMessage	: 'Select proper Godown !'
				});

				myNod.add({
					selector		: '#operationEle',
					validate		: 'validateAutocomplete:#operationEle',
					errorMessage	: 'Select proper operation !'
				});

				hideLayer();

				if($('#branchEle').exists() && $('#branchEle').is(":visible")){
					$('#branchEle').change(function(){
						_this.getGodownDropDown($("#branch_primary_key").val());
					});
				} else {
					_this.getGodownDropDown(executive.branchId);
				}

				$("#searchBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')) {
						_this.onSubmit();								
					}
				});
			});
		}, onOperationChange : function(value) {
			if(value == viewNotice){
				$('#noticeDiv').removeClass('hide');
			} else {
				$('#noticeDiv').addClass('hide');
			}
		}, getGodownDropDown : function(response) {
			var jsonObject = new Object();

			jsonObject.branchId	= response;

			getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getGodownList.do?', _this.setGodownDropDown, EXECUTE_WITHOUT_ERROR);

		}, setGodownDropDown : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.GODOWN_LIST,
				valueField		:	'godownId',
				labelField		:	'name',
				searchField		:	'name',
				elementId		:	'godownEle',
				create			: 	false,
				maxItems		: 	1,
			});
		}, onSubmit : function() {

			operationId	= $('#operationEle').val();
			if(operationId == viewNotice){
				if($('#noticeEle').val() <= 0){
					showMessage('error', "Please select notice !");
					$('#noticeEle').focus();
					return false;
				}
			}

			showLayer();

			var jsonObject = new Object();

			jsonObject["regionId"] 							= $('#regionEle_primary_key').val();
			jsonObject["subRegionId"] 						= $('#subRegionEle_primary_key').val();
			jsonObject["branchId"] 							= $('#branch_primary_key').val();
			jsonObject["godownId"] 							= $('#godownEle').val();
			jsonObject["operationId"] 						= $('#operationEle').val();
			jsonObject["noticeId"] 							= $('#noticeEle').val();
			jsonObject["noticeIdWithDays"] 					= noticeIdWithDays
			jsonObject["noticeIdList"] 						= noticeIdList;
			jsonObject["noticeMap"] 						= noticeMap;

			getJSON(jsonObject, WEB_SERVICE_URL + '/unclaimedGoodsNoticeWS/getUnclaimedGoodsNoticeDetails.do?', _this.setReportData, EXECUTE_WITHOUT_ERROR);

		}, setReportData : function (response) {
			noticeGenerated = false;
			if(response.UnclaimedGoodsNotice == undefined || response.UnclaimedGoodsNotice.CorporateAccount.length <= 0){
				showMessage('error', "No Records Found");
				$('#middle-border-boxshadow').addClass('hide');
				hideLayer();
			}
			selectedBranch				= response.branchId;

			if(response.UnclaimedGoodsNotice != undefined) {
				var unclaimedGoodsNoticeColumnConfig		= response.UnclaimedGoodsNotice.columnConfiguration;
				var unclaimedGoodsNoticeKeys				= _.keys(unclaimedGoodsNoticeColumnConfig);
				var bcolConfig								= new Object();

				var NewUnclaimedGoodsNoticeColumnKeys		= new Array();

				for(var i = 0;unclaimedGoodsNoticeKeys.length > i; i++) {
					if(unclaimedGoodsNoticeKeys[i] != 'deliveryToStr') {
						NewUnclaimedGoodsNoticeColumnKeys.push(unclaimedGoodsNoticeKeys[i]);
					} else {
						break;
					}
				}

				if(response.noticeIdWiseHM != undefined) {
					var noticeIdWiseHM	= response.noticeIdWiseHM;
					for(var j in noticeIdWiseHM) {
						if(noticeIdWiseHM[j] != null) {
							NewUnclaimedGoodsNoticeColumnKeys.push(noticeIdWiseHM[j].replace(/[' ',.,/]/g,""));
							unclaimedGoodsNoticeColumnConfig[noticeIdWiseHM[j].replace(/[' ',.,/]/g,"")] = {	 
									"dataDtoKey":noticeIdWiseHM[j].replace(/[' ',.,/]/g,"")
									,"dataType":"text"
										,"languageKey":noticeIdWiseHM[j].replace(/[' ',.,/]/g,"")
										,"searchFilter":false
										,"listFilter":false
										,"columnHidden":false
										,"displayColumnTotal":false
										,"columnMinimumDisplayWidthInPx":70
										,"columnInitialDisplayWidthInPx":90
										,"columnMaximumDisplayWidthInPx":120
										,"columnPrintWidthInPercentage":8
										,"elementCssClass":"hyperlink"
											,"columnDisplayCssClass":"btn btn-primary btn-xs uneditable-input"
												,"columnPrintCssClass":""
													,"inputElement":"link"
														,"buttonCallback": "addCustomerDetails"
															,"getButtonCallbackEvent": true
															,"sortColumn":true
															,"show":true
							};
							masterLangKeySet[noticeIdWiseHM[j].replace(/[' ',.,/]/g,"")] = noticeIdWiseHM[j].replace(/[' ',.,/]/g,"");
						}
					}
				}

				NewUnclaimedGoodsNoticeColumnKeys = _.union(NewUnclaimedGoodsNoticeColumnKeys, unclaimedGoodsNoticeKeys);
				for (var i = 0; i < NewUnclaimedGoodsNoticeColumnKeys.length; i++) {
					var bObj	= unclaimedGoodsNoticeColumnConfig[NewUnclaimedGoodsNoticeColumnKeys[i]];

					if(bObj != null) {
						if(operationId == generateNotice){
							if(bObj.languageKey == 'viewNotice'){
								bObj.show = false;
							}
						} else {
							if(bObj.languageKey == 'viewNotice'){
								bObj.show = true;
							}
						}
						if (bObj.show != undefined && bObj.show == true) {
							bcolConfig[NewUnclaimedGoodsNoticeColumnKeys[i]] = bObj;
						}
					}
				}
				response.UnclaimedGoodsNotice.columnConfiguration		= bcolConfig;
				response.UnclaimedGoodsNotice.Language				= masterLangKeySet;
			}

			if(response.UnclaimedGoodsNotice.CorporateAccount != undefined 
					&& response.UnclaimedGoodsNotice.CorporateAccount.length > 0) {
				hideLayer();

				for(var i=0;response.UnclaimedGoodsNotice.CorporateAccount.length > i; i++) {
					var noticeIdWiseHM	= response.noticeIdWiseHM;
					for(var k in noticeIdWiseHM) {
						if(noticeIdWiseHM[k] != null) {
							response.UnclaimedGoodsNotice.CorporateAccount[i][noticeIdWiseHM[k].replace(/[' ',.,/]/g,"")] = "NA";
						}
					}
					if(response.UnclaimedGoodsNotice.CorporateAccount[i].noticeIdWiseHM != undefined) {
						var noticeString	= response.UnclaimedGoodsNotice.CorporateAccount[i].noticeIdWiseHM;
						for(var l in noticeString) {
							if(l != undefined) {
								response.UnclaimedGoodsNotice.CorporateAccount[i]["Notice"+l.replace(/[' ',.,/]/g,"")]  = noticeString[l];
							}
						} 
					}
				}

				$('#middle-border-boxshadow').removeClass('hide');
				gridObject = slickGridWrapper2.setGrid(response.UnclaimedGoodsNotice);
			}
			hideLayer();

		}, viewNoticeDetails : function (response) {
			var wayBillId 	= response.wayBillId;
			childwin 		= window.open ('unclaimedGoodsNotice.do?pageId=340&eventId=2&modulename=viewUnclaimedGoodsNotice&wayBillId=' + wayBillId,'newwindow', config='left=200,top=130,width=1055,height=490, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');

		}
	});
});

function validateNotice(wayBillId,noticeId,model){
	var jsonObject					= new Object();

	jsonObject.waybillId 			= wayBillId;
	jsonObject.noticeId 			= noticeId;
	
	$.ajax({type: "POST",
		url: WEB_SERVICE_URL+'/unclaimedGoodsNoticeWS/getAllNoticesByWayBillId.do',
		data:jsonObject,
		dataType : 'json',
		success: function (response) {
			if (response.message == null) {
				var ugnArray = response.UnclaimedGoodsNotice;
				if(noticeId == NOTICE_3){
					if(ugnArray.length == 1){
						showMessage('info', 'Please generate notice 2.');
						hideLayer();
						return false;
					} else {
						hideLayer();
						generateNoticePopUp(wayBillId,noticeId,model);
					}
					
				} else {
					hideLayer();
					generateNoticePopUp(wayBillId,noticeId,model);
				}
			} else {
				if (noticeId == NOTICE_2) {
					showMessage('info', 'Please generate notice 1.');
					hideLayer();
					return false;
				} else if (noticeId == NOTICE_3){
					showMessage('info', 'Please generate notice 2.');
					hideLayer();
					return false;
				} else {
					hideLayer();
					generateNoticePopUp(wayBillId,noticeId,model);
				}
			}
		}
	});
}

function addCustomerDetails(grid,dataView,row,e){

	var innerText	= e.target.innerText;
	var id			= e.target.id;
	var idSplit		= id.split('_')[0];
	var noticeId	= Number(idSplit[idSplit.length -1]);
	var model		= dataView.getItem(row);
	var wayBillId	= model.waybillId;

	if(innerText == 'Print'){
		if(noticeId > 0){
			printNotice(wayBillId,noticeId);
		}
	} else if(innerText == 'Generate'){
		showLayer();
		if(!generateOtherBranchNotice){
			if(selectedBranch != executiveBranchId){
				showMessage('info', 'Notice of other branch cannot be generated.');
				hideLayer();
				return false;
			}
		}
		
		if(!validateNotice(wayBillId,noticeId,model)){
			return false;
		};
	}
}

function generateNoticePopUp(wayBillId,noticeId,model){
	

	var consignor			= model.consignor;
	var consignorMobile		= model.consignorMobile;
	var consignorAddress	= model.consignorAddress;

	var consignee			= model.consignee;
	var consigneeMobile		= model.consigneeMobile;
	var consigneeAddress	= model.consigneeAddress;

	var contentTable		= 		'<div class="panel-body" >'
		+		'<div class="" id="customerDiv" style="height:150px;">													'
		+		'<div class="validation-message">																		'
		+		'<div class="left-inner-addon">																			'
		+		'<table>                                                                                                 '
		+		'<thead><tr><th colspan="" style="text-align: center;color: #3d78d0;">&nbsp;</th>'
		+		'<th colspan="" style="text-align: center;center;color: #2fa43f;" >Consignor</th>		'
		+		'<th colspan="" style="text-align: center;center;color: #2fa43f;" >Consignee</th></tr></thead>	'
		+	    '<tbody><tr><td style="text-align: center;center;color: #1b1ee8;background-color: ghostwhite;" ><b>Name<b> </td>                                                                                             '
		+	    '<td>                                                                                                  	'
		+	    '<input class="form-control" type="text" maxlength="15" data-tooltip="Name" placeholder="Enter Name" id="conNor_'+wayBillId+'" value="'+consignor+'" onkeypress="">'
		+	    '</td>                                                                                                 	'
		+	    '<td>                                                                                                  	'
		+	    '<input class="form-control" type="text" maxlength="15" data-tooltip="Name" placeholder="Enter Name" id="conNee_'+wayBillId+'" value="'+consignee+'" onkeypress="">'
		+	    '</td></tr><tr><td style="text-align: center;center;color: #1b1ee8;background-color: ghostwhite;" ><b>Address<b> </td>                                                                                                 	'
		+	    '<td>                                                                                                  	'
		+	    '<input class="form-control" type="text" maxlength="" data-tooltip="Address" placeholder="Enter Address" id="conNorAdd_'+wayBillId+'" value="'+consignorAddress+'" onkeypress="">'
		+	    '</td>                                                                                                	'
		+	    '<td>                                                                                                  	'
		+	    '<input class="form-control" type="text" maxlength="" data-tooltip="Address" placeholder="Enter Address" id="conNeeAdd_'+wayBillId+'" value="'+consigneeAddress+'" onkeypress="">'
		+	    '</td></tr><tr><td style="text-align: center;center;color: #1b1ee8;background-color: ghostwhite;" ><b>Mobile<b> </td>                                                                                                  	'
		+	    '<td>                                                                                                  	'
		+	    '<input class="form-control" type="text" maxlength="10" data-tooltip="Number" onkeypress="return allowOnlyNumeric(event);" placeholder="Enter Number" id="conNorMob_'+wayBillId+'" value="'+consignorMobile+'" onkeypress="">'
		+	    '</td>                                                                                                 	'
		+	    '<td>                                                                                                  	'
		+	    '<input class="form-control" type="text" maxlength="10" data-tooltip="Number" onkeypress="return allowOnlyNumeric(event);" placeholder="Enter Number" id="conNeeMob_'+wayBillId+'" value="'+consigneeMobile+'" onkeypress="">'
		+	    '</td>                                                                                                 	'
		+	    '</tr><tr><td style="text-align: center;center;color: #1b1ee8;background-color: ghostwhite;" ><b>Email<b> </td>                                                                                                '
		+		'<td>                                                                                                  	'
		+	    '<input class="form-control" type="text" data-tooltip="Email" placeholder="Enter Email" id="conNorEmail_'+wayBillId+'" value="" onkeypress="">'
		+	    '</td>                                                                                                 	'
		+	    '<td>                                                                                                  	'
		+	    '<input class="form-control" type="text" data-tooltip="Email" placeholder="Enter Email" id="conNeeEmail_'+wayBillId+'" value="" onkeypress="">'
		+	    '</td>'
		+	  	'</tbody><input type="hidden" id="noticeId" value="'+noticeId+'" ><input type="hidden" id="wayBillId" value="'+wayBillId+'" ></table>'
		+		'</div>																									'
		+		'</div>																									'
		+		'</div>																									'
		+		'</div>';


	var btModal = new Backbone.BootstrapModal({
		content		: contentTable,
		modalWidth 	: 40,
		okText		: 'Confirm',
		okCloses	: false,
		showFooter 	: true,
		title		: '<center>Customer Details</center>'

	}).open();

	btModal.on('ok', function() {

		var wayBillId = $('#wayBillId').val();

		if($('#conNor_'+wayBillId).val() == ''){
			showMessage('error', 'Please enter consignor name.');
			$('#conNor_'+wayBillId).focus();
			return false;
		}
		if($('#conNee_'+wayBillId).val() == ''){
			showMessage('error', 'Please enter consignee name.');
			$('#conNee_'+wayBillId).focus();
			return false;
		}
		if($('#conNorMob_'+wayBillId).val() == ''){
			showMessage('error', 'Please enter consignor number.');
			$('#conNorMob_'+wayBillId).focus();
			return false;
		}
		if($('#conNeeMob_'+wayBillId).val() == ''){
			showMessage('error', 'Please enter consignee number.');
			$('#conNeeMob_'+wayBillId).focus();
			return false;
		}
		if($('#conNorAdd_'+wayBillId).val() == ''){
			showMessage('error', 'Please enter consignor address.');
			$('#conNorAdd_'+wayBillId).focus();
			return false;
		}
		if($('#conNeeAdd_'+wayBillId).val() == ''){
			showMessage('error', 'Please enter consignee address.');
			$('#conNeeAdd_'+wayBillId).focus();
			return false;
		}
		if($('#conNorEmail_'+wayBillId).val() == ''){
			showMessage('error', 'Please enter consignor email.');
			$('#conNorEmail_'+wayBillId).focus();
			return false;
		}
		if($('#conNeeEmail_'+wayBillId).val() == ''){
			showMessage('error', 'Please enter consignee email.');
			$('#conNeeEmail_'+wayBillId).focus();
			return false;
		}
		if(confirm("Are you sure to generate notice?")){
			if(!noticeGenerated){
				noticeGenerated = true;
				showLayer();
				$("#modalDialog .close").click();

				var jsonObject 			= new Object();

				jsonObject.waybillId				= wayBillId;
				jsonObject.noticeId					= noticeId;
				jsonObject.consignorName			= $('#conNor_'+wayBillId).val();
				jsonObject.consignorMobileNumber	= $('#conNorMob_'+wayBillId).val();
				jsonObject.consignorAddress			= $('#conNorAdd_'+wayBillId).val();
				jsonObject.consigneeName			= $('#conNee_'+wayBillId).val();
				jsonObject.consigneeMobileNumber	= $('#conNeeMob_'+wayBillId).val();
				jsonObject.consigneeAddress			= $('#conNeeAdd_'+wayBillId).val();
				jsonObject.consignorEmail			= $('#conNorEmail_'+wayBillId).val();
				jsonObject.consigneeEmail			= $('#conNeeEmail_'+wayBillId).val();

				getJSON(jsonObject, WEB_SERVICE_URL + '/unclaimedGoodsNoticeWS/generateNotice.do?', setPrint, EXECUTE_WITHOUT_ERROR);
			}
		} else {
			noticeGenerated = false;
			hideLayer();
		}

	});

	btModal.on('cancel', function() {
		$(".ok").removeClass('hide');
		$(".ok").attr("disabled", false);
		hideLayer();
	});
	
	setTimeout(() => {
		$('#conNor_'+wayBillId).focus();
		initialiseFocus();
	}, 1000);
}

function setPrint(response){

	if(response.message != undefined) {
		var errorMessage = response.message;
		showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
		hideLayer();
		return;
	}
	var waybillId 	 = response.waybillId;
	var noticeId	 = response.noticeId;
	
	 childwin = window.open("printWayBill.do?pageId=340&eventId=10&modulename=unclaimedGoodsNoticeprintsetup&masterid=" + waybillId + "&noticeId="+noticeId,"newwin","width=400,height=200");
	
	$( "#searchBtn" ).trigger( "click" );
}

function printNotice(wayBillId,noticeId){
	
	childwin = window.open("printWayBill.do?pageId=340&eventId=10&modulename=unclaimedGoodsNoticeprintsetup&masterid=" + wayBillId + "&noticeId="+noticeId,"newwin","width=400,height=200");
}

function viewNotice(grid,dataView,row){
	var model		= dataView.getItem(row);
	var wayBillId 	= model.waybillId;
	childwin = window.open ('unclaimedGoodsNotice.do?pageId=340&eventId=2&modulename=viewUnclaimedGoodsNotice&wayBillId=' + wayBillId,'newwindow', config='left=200,top=130,width=1055,height=490, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function transportSearch(grid,dataView,row){
	var LR_SEARCH_TYPE_ID		= 1;
	if(dataView.getItem(row).waybillId != undefined) {
		window.open('SearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + dataView.getItem(row).waybillId + '&NumberType=' + LR_SEARCH_TYPE_ID + '&BranchId=0');
	} 
}
function allowOnlyAlphanumeric(evt) {
	if (evt.ctrlKey == 1) {
		return true;
	} else {
		var keynum = null;

		if(window.event){ // IE
			keynum = evt.keyCode;
		} else if(evt.which){ // Netscape/Firefox/Opera
			keynum = evt.which;
		}

		if(keynum == 8 || keynum == 13) {
			return true;
		}

		var charStr = String.fromCharCode(keynum);
		if (/[a-z0-9]/i.test(charStr)) {
			hideAllMessages();
			return true;
		} else {
			showMessage('warning', alphaNumericAllowWarningMsg);
			return false;
		}
	}
}