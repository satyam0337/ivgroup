define([  
	
	PROJECT_IVUIRESOURCES + '/resources/js/module/view/partyAgentCommision/pendingLrForPartyAgentCommision.js'
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
	],function(PendingLrForPartyAgentCommision, UrlParameter, Selection) {
	'use strict';
	var jsonObject = new Object()
	, myNod
	,  _this = ''
	, partyAgentCommissionId
	, partyAgentCommissionNumber
	,count=0;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
			this.$el.html(this.template);
			
			partyAgentCommissionId 			= UrlParameter.getModuleNameFromParam(MASTERID);
			partyAgentCommissionNumber   	= UrlParameter.getModuleNameFromParam(MASTERID2);
			
			if(partyAgentCommissionId != null && partyAgentCommissionNumber!=null){
				var jsonInobj = new Object();
				jsonInobj.partyAgentCommissionNumber = partyAgentCommissionNumber;
				showMessage('success','Party Agent Commission '+partyAgentCommissionNumber+' created successfully !');
				_this.openPrint(partyAgentCommissionId);
			}
			
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/partyAgentCommissionModuleWS/getPartyAgentCommissionModuleElement.do?',_this.setElementDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},setElementDetails : function(response){

			//focus navigation initiates through this function
			initialiseFocus();
			var loadelement = new Array();
			var baseHtml = new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/partyagentcommisionmodule/PartyAgentCommisionModule.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				var keyObject = Object.keys(response);
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]]) {
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
					}
				}
				
				let elementConfiguration	= {};
				
				elementConfiguration.partyAgentNameElement	= $("#partyAgentCommisionEle");
				
				response.partyAgentNameSelection	= true;
				
				response.elementConfiguration		= elementConfiguration;
				
				Selection.setSelectionToGetData(response);

				if(partyAgentCommissionId != null && partyAgentCommissionNumber!=null){
					$("#previousPartyAgentCommissionNumber").html(partyAgentCommissionNumber);
					$("#previousPartyAgentCommissionDetails").removeClass("hide");
				}
				
				$( "#singleLREle" ).keydown(function(e) {
					if (e.which == 13) {
						_this.searchLRByNumber();
					}
				});

				hideLayer();

				$("#reprintBtn").click(function() {
					_this.openPrint(partyAgentCommissionId);
				});
			});

		},searchLRByNumber:function(){

			myNod = nod();
			myNod.configure({
				parentClass:'validation-message'
			});

			myNod.add({
				selector		: '#partyAgentCommisionEle',
				validate		: 'validateAutocomplete:#partyAgentCommisionEle_primary_key',
				errorMessage	: 'Enter Name !'
			});
			
			myNod.performCheck();
			
			if(myNod.areAll('valid')) {
				showLayer();
				
				var jsonObject = new Object();

				jsonObject["wayBillNumber"] 			= $('#singleLREle').val();
				jsonObject["partyAgentCommisionId"] 	= $('#partyAgentCommisionEle_primary_key').val();
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/partyAgentCommissionModuleWS/getPartyAgentCommissionDetailsByWayBillNumber.do?', _this.setData, EXECUTE_WITH_ERROR);
			}
		},setData : function(response) {
			if(response.message != undefined) {
				setTimeout(function(){$('#singleLREle').focus()}, 100);
				hideLayer();
				return;
			}
			
			if(Number(response.CorporateAccount.length) == 0 && response.isLRExits) {
				var array = (response.DataExist).split("_");
				showAlertMessage('error', 'Commission already configured for LR number '+array[0]+' for Agent '+array[1]);
			}
			
			if(Number(response.CorporateAccount.length) > 1) {
				 _this.setDataOnPopUp(response);
				 return;				
			}
			
			$( "#singleLREle" ).val("");
			
			count	= count + 1;
			
			var pendingPartyAgentCommision 	= new PendingLrForPartyAgentCommision();
			var object 				= new Object();
			object.ColumnHead 		= response.columnConfigurationList;
			object.data 			= _.values(response.CorporateAccount);
			object.count 			= count;

			pendingPartyAgentCommision.lrNumberAppend(object);
			
			hideLayer();
			$('#singleLREle').focus();
		},setDataOnPopUp : function(response) {
			if(response.CorporateAccount != undefined) {
				if((response.CorporateAccount).length > 0) {
					var jsonObject = new Object();
					jsonObject["wayBillNumber"] 			= $('#singleLREle').val();
					var object = new Object();
					object.elementValue = jsonObject;

					var btModal = new Backbone.BootstrapModal({
						content		: 	new PendingLrForPartyAgentCommision(object),
						modalWidth 	:	60,
						title		:	'Pending LRs For Party Agent Commission',
						okText		:	'Add',
						showFooter 	: 	true
					}).open();
					object.btModal = btModal;
					new PendingLrForPartyAgentCommision(object)
					btModal.open();
				}
			}
		},openPrint:function(partyAgentCommissionId) {
			var newwindow=window.open('PartyAgentCommision.do?pageId=340&eventId=10&modulename=partyAgentCommisionPrint&masterid='+partyAgentCommissionId+'&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}
	});
});