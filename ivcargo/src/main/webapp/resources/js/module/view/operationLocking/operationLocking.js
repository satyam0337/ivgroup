var branchOperationLockingConfig;
define([  
        PROJECT_IVUIRESOURCES + '/resources/js/module/view/operationLocking/operationLockingFilePath.js'
        ,'slickGridWrapper2'
        ,'selectizewrapper'
		,'JsonUtility'
          ,'messageUtility'
          ,'/ivcargo/resources/js/generic/urlparameter.js'
          ,'jquerylingua'
          ,'language'
          ,'autocomplete'
          ,'autocompleteWrapper'
          ,'nodvalidation'
          ,'focusnavigation'//import in require.config
          ,'bootstrapSwitch'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ],
          function(FilePath, SlickGridWrapper, Selectizewrapper) {
	'use strict';
	let jsonObject = new Object(), myNod, primaryId,  _this = '', allBranchConfiguration, masterLangObj, masterLangKeySet,gridObject;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/OperationLockingWS/getBranchOperationLockingMasterElementConfiguration.do?',_this.setMasterElements, EXECUTE_WITH_ERROR);
			
			return _this;
		},setMasterElements : function (response){
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			branchOperationLockingConfig = response;
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/operationLocking/operationLocking.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.branchList,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'branchEle',
					maxItems		: 	1,
				});
				
				masterLangObj = FilePath.loadLanguage();
				masterLangKeySet = loadLanguageWithParams(masterLangObj);
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector: '#branchEle_wrapper',
					validate: 'validateAutocomplete:#branchEle',
					errorMessage: 'Select proper Branch !'
				});
				
				hideLayer();

				$("#viewBranchConfig").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onView(_this);								
					}
				});

				$("#viewAllBranchConfig").click(function() {
					_this.viewAllBranchConfig(_this);								
				});
			});

			return _this;
		},viewAllBranchConfig : function (){
			getJSON(jsonObject, WEB_SERVICE_URL + '/OperationLockingWS/getAllBranchLockingConfiguration.do?', _this.renderView, EXECUTE_WITHOUT_ERROR);
		},renderView : function (response){
			$('#bottom-border-boxshadow').addClass("hide");
			$('#branchLockingDetails').addClass("hide");
			$("#middle-border-boxshadow").removeClass('hide');
			
			if(response.allBranchLockingConfiguration != undefined) {
				let ArrivedLRColumnConfig 		= response.allBranchLockingConfiguration.columnConfiguration;
				let ArrivedLRColumnKeys			= _.keys(ArrivedLRColumnConfig);
				let ArrivedLRConfig				= new Object();
				
				for (const element of ArrivedLRColumnKeys) {
					let bObj	= ArrivedLRColumnConfig[element];
					
					if (bObj.show) {
						ArrivedLRConfig[element] = bObj;
					}
				}
				
				response.allBranchLockingConfiguration.columnConfiguration	= ArrivedLRConfig;
				response.allBranchLockingConfiguration.Language				= masterLangKeySet;
			}
			
			if(response.allBranchLockingConfiguration != undefined && response.allBranchLockingConfiguration.CorporateAccount != undefined) {
				$("#allBranchConfigurationsDiv").show();
				hideAllMessages();
				response.allBranchLockingConfiguration.tableProperties.callBackFunctionForPartial = _this.configureThisBranch;
				gridObject = SlickGridWrapper.setGrid(response.allBranchLockingConfiguration);
				SlickGridWrapper.setAggregateFunction(gridObject,"status");
			} else {
				$("#allBranchConfigurationsDiv").hide();
			}
			
			hideLayer();
		},onView : function (){
			showLayer();
			let jsonObject = new Object();
			jsonObject["branchId"] 			= $('#branchEle').val();
			 getJSON(jsonObject, WEB_SERVICE_URL+'/OperationLockingWS/configureOperationLockingThroughMaster.do', _this.setViewResponse, EXECUTE_WITH_ERROR);
		},setViewResponse : function (response){
			$('#branchLockingDetails').empty();

			if(response.message != undefined ){
				$('#bottom-border-boxshadow').addClass("hide");
				$('#branchLockingDetails').addClass("hide");
				hideLayer();
				return;
			}
			
			allBranchConfiguration	= response.allBranchConfiguration;
			let columnArray			= new Array();
			
			if(allBranchConfiguration != undefined && allBranchConfiguration.length > 0){
				$('#middle-border-boxshadow').addClass("hide");
				$('#bottom-border-boxshadow').removeClass("hide");
				$('#branchLockingDetails').removeClass("hide");
				
				for (let i = 0; i < allBranchConfiguration.length; i++) {
					if(branchOperationLockingConfig.removePendingDispatchCol)
						$("#dispatchLocking").removeClass('hide');	
					else
						$("#dispatchLocking").addClass('hide');	
					
					if(branchOperationLockingConfig.removeReceiveCol)
						$("#receiveLocking").removeClass('hide');	
					else
						$("#receiveLocking").addClass('hide');	
					
					if(branchOperationLockingConfig.removeDDMCol)
						$("#ddmLocking").removeClass('hide');	
					else
						$("#ddmLocking").addClass('hide');	
					
					if(branchOperationLockingConfig.allowLockingTimeForDDM)
					 	$("#ddmLockingTime").removeClass('hide');	
					else
						$("#ddmLockingTime").addClass('hide');	
						
					if(branchOperationLockingConfig.allowTemporarilyUnlockedDays)
						$("#temporaryUnlocked").removeClass('hide');	
					else
						$("#temporaryUnlocked").addClass('hide');
					
					if(branchOperationLockingConfig.allowPermanentlyUnlocked)
						$("#permanentlyUnlocked").removeClass('hide');	
					else
						$("#permanentlyUnlocked").addClass('hide');
						
					if(branchOperationLockingConfig.allowOpenigTimeAndClosingTime) {
						$("#openingTime").removeClass('hide');
						$("#closingTime").removeClass('hide');	
					} else {
						$("#openingTime").addClass('hide');
						$("#closingTime").addClass('hide');
					}
						
					if(branchOperationLockingConfig.allowLockingForBooking)
						$("#lockBooking").removeClass('hide');	
					else
						$("#lockBooking").addClass('hide');
					
					var obj		= allBranchConfiguration[i];
					primaryId	= obj.branchOperationLockingConfigId;
					columnArray.push("<td style='text-align: center; vertical-align: middle;' id = '"+primaryId+"'>" + (i + 1) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;font-weight: bold;color: #0c517d;background-color: lavenderblush;' id = 'branchName_"+primaryId+"'>" + obj.branchName + "</td>");
					
					if(branchOperationLockingConfig.removePendingDispatchCol) {
						columnArray.push("<td style='text-align: center; vertical-align: middle;' ><div style='position: absolute;margin-top: -9px;padding-left: 33px;' class='checkbox'>"
								+"<label style='font-size: 1.5em'>" 
								+"<input id = 'pendingDispatch_"+ primaryId +"' type='checkbox'>" 
								+"<span class='cr'><i class='cr-icon fa fa-check'></i></span>"
								+"</div></td>");
					}
					
					if(branchOperationLockingConfig.removeReceiveCol) {
						columnArray.push("<td style='text-align: center; vertical-align: middle;' ><div style='position: absolute;padding-left: 55px;margin-top: -9px;' class='checkbox'>"
								+"<label style='font-size: 1.5em'>" 
								+"<input id = 'pendingReceive_"+ primaryId +"' type='checkbox'>" 
								+"<span class='cr'><i class='cr-icon fa fa-check'></i></span>"
								+"</div></td>");
					}
					
					if(branchOperationLockingConfig.removeDDMCol) {
						columnArray.push("<td style='text-align: center; vertical-align: middle;' ><div style='position: absolute;padding-left: 55px;margin-top: -9px;' class='checkbox'>"
								+"<label style='font-size: 1.5em'>" 
								+"<input id = 'pendingDDM_"+ primaryId +"' type='checkbox'>" 
								+"<span class='cr'><i class='cr-icon fa fa-check'></i></span>"
								+"</div></td>");
					}
					
					if(branchOperationLockingConfig.allowLockingTimeForDDM) {
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>"
							+ "<input id='lockingTime_" + primaryId + "' type='text' style='font-size: 1.5em;' placeholder='lockTime'>"
							+ "</td>");
					}
					
					if(branchOperationLockingConfig.allowTemporarilyUnlockedDays) {
						columnArray.push("<td style='text-align: center; vertical-align: middle;' ><label class='switch'>"
								+ "<input id = 'isTemporaryUnlocked_"+ primaryId +"' type='checkbox' class='default'>"
		         				+ " <span class='slider round'></span></label></td>");
					}

					if(branchOperationLockingConfig.allowPermanentlyUnlocked) {
						columnArray.push("<td style='text-align: center; vertical-align: middle;' ><label class='switch'>"
								+ "<input id = 'isPermanentlyUnlocked_"+ primaryId +"' type='checkbox' class='default'>"
		         				+ " <span class='slider round'></span></label></td>");
					}
					
					if(branchOperationLockingConfig.allowLockingForBooking) {
						columnArray.push("<td style='text-align: center; vertical-align: middle;' ><div style='position: absolute;padding-left: 50px;margin-top: -9px;' class='checkbox'>"
									+"<label style='font-size: 1.5em'>" 
									+"<input id = 'lockBooking_"+ primaryId +"' type='checkbox'>" 
									+"<span class='cr'><i class='cr-icon fa fa-check'></i></span>"
									+"</div></td>");
					}
					
					if(branchOperationLockingConfig.allowOpenigTimeAndClosingTime) {
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><label>"
										    + "<input data-clocklet='format: h:mm a;placement: top;' type='text' id='openingTime_" + primaryId 
										    + "' placeholder='Opening Time' data-tooltip='Opening Time' class='form-control' required></label></td>");
			         				
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><label>"
										    + "<input data-clocklet='format: h:mm a;placement: top;' type='text' id='closingTime_" + primaryId 
										    + "' placeholder='Closing Time' data-tooltip='Closing Time' class='form-control' required></label></td>");
					}
					
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><button style='font-size: 14px' class='btn btn-primary' id='updateBranchConfiguration_" + primaryId + "'>Save</button></a></td>");
					$('#branchLockingDetails').append('<tr id="branchConfigurationLockingDetails_'+ primaryId +'">' + columnArray.join(' ') + '</tr>');
					
					setTimeout(function() {
						$('#pendingDispatch_' + primaryId).prop('checked', branchOperationLockingConfig.removePendingDispatchCol && obj.pendingDispatch);
						$('#pendingReceive_' + primaryId).prop('checked', branchOperationLockingConfig.removeReceiveCol && obj.pendingReceive);
						$('#pendingDDM_' + primaryId).prop('checked', branchOperationLockingConfig.removeDDMCol && obj.pendingDDM);
						$('#isTemporaryUnlocked_' + primaryId).prop('checked', branchOperationLockingConfig.allowTemporarilyUnlockedDays && obj.temporaryUnlocked);
						$('#isPermanentlyUnlocked_' + primaryId).prop('checked', branchOperationLockingConfig.allowPermanentlyUnlocked && obj.permanentlyUnlocked);
						
						if(branchOperationLockingConfig.allowLockingForBooking) {
							if(obj.lockBooking ) {
								$('#lockBooking_' + primaryId).prop('checked', true);
								
								if(branchOperationLockingConfig.allowOpenigTimeAndClosingTime) {
									if(obj.openingTime != undefined)
										$('#openingTime_' + primaryId).val(obj.openingTime);
									
									if(obj.closingTime != undefined)
										$('#closingTime_' + primaryId).val(obj.closingTime);
								}
							} else
								$('#lockBooking_' + primaryId).prop('checked',false);
						}
						
					}, 500);
					$("#updateBranchConfiguration_" + primaryId).bind("click", function() {
					    _this.updateBranchConfiguration();
					});
					columnArray	= [];
				}
			} else {
				showMessage("error","No Records Found..");
				$('#bottom-border-boxshadow').addClass("hide");
				$('#branchLockingDetails').addClass("hide");
				hideLayer();
				return;
			}
			
			hideLayer();
		}, updateBranchConfiguration : function() {
			
			if($('#lockBooking_' + primaryId).exists() && $('#lockBooking_' + primaryId)[0].checked)
				if($('#openingTime_' + primaryId).val() == '' || $('#closingTime_' + primaryId).val() == '') {
					showMessage("error","Please Enter Opening And Closing Time..");
					hideLayer();
					return;
				}
				
			if (confirm("Are you sure to update?")) {
				$('.confirm').addClass('hide');
				
				jsonObject.branchId 			= $('#branchEle').val();
				jsonObject.branchOperationLockingConfigId	= primaryId;
				
				if(branchOperationLockingConfig.removePendingDispatchCol)
					jsonObject.pendingDispatchData				= $('#pendingDispatch_' + primaryId)[0].checked;
				
				if(branchOperationLockingConfig.removeReceiveCol)
					jsonObject.pendingReceiveData				= $('#pendingReceive_' + primaryId)[0].checked;
				
				if(branchOperationLockingConfig.removeDDMCol)
					jsonObject.pendingDDMData				= $('#pendingDDM_' + primaryId)[0].checked;
					
				if(branchOperationLockingConfig.allowTemporarilyUnlockedDays)
					jsonObject.isTemporaryUnlocked				= $('#isTemporaryUnlocked_' + primaryId)[0].checked;
					
				if(branchOperationLockingConfig.allowPermanentlyUnlocked)
					jsonObject.isPermanentlyUnlocked			= $('#isPermanentlyUnlocked_' + primaryId)[0].checked;
					
				jsonObject.lockingTime						= $('#lockingTime_' + primaryId).val();
				
				if($('#lockBooking_' + primaryId).exists()) {
					jsonObject.lockBooking						= $('#lockBooking_' + primaryId)[0].checked;
				
					if(jsonObject.lockBooking) {
						jsonObject.openingTime					= _this.convertTo12HourFormatWithLeadingZero($('#openingTime_' + primaryId).val());
						jsonObject.closingTime					= _this.convertTo12HourFormatWithLeadingZero($('#closingTime_' + primaryId).val());
					}
				}
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/OperationLockingWS/updateBranchLockingConfiguration.do', _this.showResponseAfterOperation, EXECUTE_WITH_ERROR);
				showLayer();
			}
		}, showResponseAfterOperation : function(response) {
			hideLayer();
			_this.setViewResponse(response);
			refreshCache(OPERATION_LOCKING);
		}, configureThisBranch(grid,dataView,row){
			showLayer();
			let jsonObject 				= new Object();
			let selectize 				= $('#branchEle').get(0).selectize;
			selectize.setValue(dataView.getItem(row).branchId); 
			jsonObject["branchId"] 		= dataView.getItem(row).branchId;
			getJSON(jsonObject, WEB_SERVICE_URL+'/OperationLockingWS/configureOperationLockingThroughMaster.do', _this.setViewResponse, EXECUTE_WITH_ERROR);
		}, convertTo12HourFormatWithLeadingZero : function(timeStr) {
		    let [hour, minutes] = timeStr.slice(0, -2).split(':');
		    const ampm = timeStr.slice(-2).toLowerCase();
		    if (hour.length === 1) hour = '0' + hour;
		    return hour + ":" + minutes + ampm;
		}
	});
});
