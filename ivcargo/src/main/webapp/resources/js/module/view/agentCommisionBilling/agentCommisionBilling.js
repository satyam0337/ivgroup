define([  
	
	'slickGridWrapper3'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/agentCommisionBilling/pendingLrForAgentCommisionBilling.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
	],function(slickGridWrapper3, PendingLrForAgentCommisionBilling, UrlParameter, Selection) {
	'use strict';
	var jsonObject = new Object()
	, myNod
	,  _this = ''
		, agentCommissionBillingSummaryId
		, agentCommissionBillingSummaryNumber
		,count=0
		,agentCommisionBillingModel;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			this.$el.html(this.template);

			agentCommissionBillingSummaryId 		= UrlParameter.getModuleNameFromParam(MASTERID);
			agentCommissionBillingSummaryNumber   	= UrlParameter.getModuleNameFromParam(MASTERID2);

			if(agentCommissionBillingSummaryId != null && agentCommissionBillingSummaryNumber!=null){
				var jsonInobj = new Object();
				jsonInobj.agentCommissionBillingSummaryNumber = agentCommissionBillingSummaryNumber;
				showMessage('success',' Agent Commission '+agentCommissionBillingSummaryNumber+' created successfully !');
				_this.openPrint(agentCommissionBillingSummaryId);
			}
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/agentCommissionBillingModuleWS/getAgentCommissionBillingModuleElement.do?',_this.setElementDetails,	EXECUTE_WITH_ERROR);
			return _this;
		},setElementDetails : function(response){
			//focus navigation initiates through this function
			initialiseFocus();
			var loadelement = new Array();
			var baseHtml = new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/agentCommisionBilling/agentCommisionBilling.html",function() {
				baseHtml.resolve();

				if(agentCommissionBillingSummaryId != null && agentCommissionBillingSummaryNumber!=null){
					$("#previousAgentCommissionBillingNumber").html(agentCommissionBillingSummaryNumber);
					$("#previousAgentCommissionBillingDetails").removeClass("hide");
				}
			});
			
			if(!response.allowDeliveredLrsForAgentBilling) response.txnType	= false;

			$.when.apply($, loadelement).done(function() {
				var keyObject = Object.keys(response);
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]]) {
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
					}
				}

				let elementConfiguration	= {};
				
				elementConfiguration.dateElement					= $("#dateEle");
				elementConfiguration.collectionPersonNameElement	= $("#collectionPersonNameEle");
				
				response.isCalenderSelection		= true;
				response.collectionPersonSelection	= true;
				response.agentBranchSelection		= true;
				
				response.elementConfiguration		= elementConfiguration;
				
				Selection.setSelectionToGetData(response);

				var statusTypeAutoComplete = new Object();
				statusTypeAutoComplete.primary_key = 'txnTypeId';
				statusTypeAutoComplete.field = 'txnTypeName';
				statusTypeAutoComplete.callBack = _this.onStatusTypeSelect;
				$("#txnTypeEle").autocompleteCustom(statusTypeAutoComplete);

				var autoStatusType = $("#txnTypeEle").getInstance();
				
				$(autoStatusType).each(function() {
					this.option.source = response.statusTypeList;
				});

				response.branch		= true;

				myNod = Selection.setNodElementForValidation(response);
				
				hideLayer();
				
				$( "#singleLREle" ).keydown(function(e) {
					if (e.which == 13) {
						if($('#branchEle').val() <= 0) {
							showMessage('info', 'Please Select Agent Branch !');
							$("#branchEle").focus();
							return;
						}
						
						if($('#txnTypeEle').exists() && $('#txnTypeEle').is(":visible") && $('#txnTypeEle_primary_key').val() <= 0) {
							showMessage('info', 'Please Select Txn Type !');
							$("#txnTypeEle").focus();
							return;
						}

						_this.searchLRByNumber();
					}
				});

				$("#reprintBtn").click(function() {
					_this.openPrint(agentCommissionBillingSummaryId);
				});
				
				if(response.branchList.length == 0) {
					$("#findAllBtn").attr("disabled", "disabled");
				}

				$("#dateCheckEle").click(function() {
					if ($('#dateCheckEle').prop('checked'))
						$("#dateSelection").removeClass('hide');
					else
						$("#dateSelection").addClass('hide');
				});
				
				$("#findAllBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.searchLRByBranchId();
				});
			});
		}, onStatusTypeSelect :  function() {
			$('#agentCommissionBillingDiv').empty();
		}, searchLRByNumber : function() {
			showLayer();

			var jsonObject = new Object();
			
			jsonObject["wayBillNumber"] 	= $('#singleLREle').val();
			jsonObject["sourceBranchId"] 	= $('#branchEle').val();
			
			if($('#txnTypeEle').exists() && $('#txnTypeEle').is(":visible"))
				jsonObject["statusTypeId"] 	= $('#txnTypeEle_primary_key').val();
			else
				jsonObject["statusTypeId"] 	= 1;
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/agentCommissionBillingModuleWS/getAgentCommissionBillingDetailsByWayBillNumber.do?', _this.setData, EXECUTE_WITH_ERROR);
		},searchLRByBranchId : function(){
			var jsonObject = new Object();
			
			if($("#dateEle").attr('data-startdate') != undefined)
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			
			if($("#dateEle").attr('data-enddate') != undefined)
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			
			jsonObject["dateWise"] 			= $('#dateCheckEle').prop('checked');
			jsonObject["sourceBranchId"] 	= $('#branchEle').val();
			
			if($('#txnTypeEle').exists() && $('#txnTypeEle').is(":visible"))
				jsonObject["statusTypeId"] 	= $('#txnTypeEle_primary_key').val();
			else
				jsonObject["statusTypeId"] 	= 1;
			
			var object = new Object();
			object.elementValue = jsonObject;

			var btModal = new Backbone.BootstrapModal({
				content		: 	new PendingLrForAgentCommisionBilling(object),
				modalWidth 	:	60,
				title		:	'Pending LRs For Agent Commission Billing',
				okText		:	'Add',
				showFooter 	: 	true
			}).open();

			object.btModal = btModal;
			new PendingLrForAgentCommisionBilling(object)
			btModal.open();
		},setData : function(response) {
			if(response.message != undefined) {
				setTimeout(function(){$('#singleLREle').focus()}, 100);
				hideLayer();
				return;
			}

			$( "#singleLREle" ).val("");
			
			var selectedGridObject 	= slickGridWrapper3.getSlickGridInstance({InnerSlickId : 'agentCommissionBillingDiv'});
			
			if(selectedGridObject != undefined){

				var dataView 				= selectedGridObject.getData();
				var slickData 				= dataView.getItems();
				agentCommisionBillingModel	= response.CorporateAccount;

				if(agentCommisionBillingModel.length > 0 && slickData != undefined && slickData.length > 0){
					for(var i = 0 ; i < agentCommisionBillingModel.length ; i++){
						if(slickData[0].branchId != agentCommisionBillingModel[i].branchId){
							showMessage('error', 'You Cannot Add LRs Of Different Branch');
							hideLayer();
							return false;
						}
					}
				}
			}

			count	= count + 1;

			var pendingAgentCommisionBilling 	= new PendingLrForAgentCommisionBilling();
			var object 				= new Object();
			object.ColumnHead 		= response.columnConfigurationList;
			object.data 			= _.values(response.CorporateAccount);
			object.count 			= count;

			pendingAgentCommisionBilling.lrNumberAppend(object);

			hideLayer();
			$('#singleLREle').focus();
		},openPrint : function(agentCommissionBillingSummaryId) {
			var newwindow=window.open('AgentCommissionBilling.do?pageId=340&eventId=10&modulename=agentCommisionBillingPrint&masterid='+agentCommissionBillingSummaryId+'&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}
	});
});