define([  
	PROJECT_IVUIRESOURCES + '/resources/js/module/view/podwaybills/poddispatch/pendingLrForPODDispatch.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	],function(PendingLrForPODDispatch, UrlParameter, Selection) {
	'use strict';
	let jsonObject = new Object(), configuration = null
	, myNod , _this = '' , podDispatchId , podLsNumber , count = 0;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			this.$el.html(this.template);
			
			podDispatchId	= UrlParameter.getModuleNameFromParam(MASTERID);
			podLsNumber		= UrlParameter.getModuleNameFromParam(MASTERID2);
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/podDispatchWS/getPODDispatchElement.do?', _this.setElementDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setElementDetails : function(response) {
			//focus navigation initiates through this function
			initialiseFocus();
			let loadelement = new Array();
			let baseHtml = new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/podwaybills/podDispatch/podDispatch.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				if(podDispatchId != null && podLsNumber != null) {
					showAlertMessage('success', 'POD Dispatch ' + podLsNumber + ' created successfully !');
					_this.openPrint(podDispatchId);

					$("#previousPODNumber").html(podLsNumber);
					$("#previousPODDispatchDetails").removeClass("hide");
				}
				
				configuration	= response;
									
				$( "#singleLREle" ).keydown(function(e) {
					if (e.which == 13)
						_this.searchLRByNumber();
				});
				
				if(response.isSearchByDate) {
					$('#searchByDateSelection').removeClass('hide');
					
					let elementConfiguration	= new Object();

					elementConfiguration.dateElement	= $('#dateEle');
					
					response.elementConfiguration		= elementConfiguration;
					response.isCalenderSelection		= true;
					
					Selection.setSelectionToGetData(response);
					
					$( "#isSearchByDate" ).click(function() {
						if(this.checked)
							$("*[data-attribute=date]").removeClass("hide");
						else
							$("*[data-attribute=date]").addClass("hide");
					});
				} else
					$('#searchByDateSelection').remove();
								
				myNod = nod();

				myNod.configure({
					parentClass:'validation-message'
				});
				
				$('#limitMessage').html('Only top ' + response.limit + ' LR will be allow for POD Dispatch !');

				hideLayer();

				$("#findAllBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSearch();								
				});

				$("#reprintBtn").click(function() {
					_this.openPrint(podDispatchId);
				});
			}); 
		}, searchLRByNumber : function() {
			showLayer();
    
			let jsonObject = new Object();
			
			let wayBillInput = $('#singleLREle').val();

			if (configuration.searchLRNumberByQRCodeScanner) {
				if (wayBillInput.includes('~')) { 
					jsonObject["wayBillNumber"] = wayBillInput.split('~')[1];
					
				} else {
					jsonObject["wayBillNumber"] = wayBillInput;
				}
			} else {
				jsonObject["wayBillNumber"] = wayBillInput;
			}

			jsonObject['searchByDate']		= $("#isSearchByDate" ).prop('checked');
			
			if($("#dateEle").attr('data-startdate') != undefined)
				jsonObject["fromDate"]	= $("#dateEle").attr('data-startdate'); 

			if($("#dateEle").attr('data-enddate') != undefined)
				jsonObject["toDate"]	= $("#dateEle").attr('data-enddate'); 

			getJSON(jsonObject, WEB_SERVICE_URL+'/podDispatchWS/getPodDetailsForDispatchByWayBillNumber.do?', _this.setData, EXECUTE_WITH_ERROR);
		}, setData : function(response) {
			$( "#singleLREle" ).val("");
			
			if(response.message != undefined) {
				setTimeout(function(){$('#singleLREle').focus()}, 100);
				hideLayer();
				return;
			}
			
			if(configuration.showPopupForLrInMultipleFinancialYears && response.CorporateAccount.length > 1) {
				_this.yearSelectionForPendingLrDispatch(response)
				return;
			}
			
			_this.createObjectForLrNumberAppend(response);
		}, onSearch : function() {
			_this.setDataOnPopUp();
		}, setDataOnPopUp : function() {
			let object = new Object();
			
			object['searchByDate']		= $("#isSearchByDate" ).prop('checked');
						
			if($("#dateEle").attr('data-startdate') != undefined)
				object["fromDate"]	= $("#dateEle").attr('data-startdate'); 

			if($("#dateEle").attr('data-enddate') != undefined)
				object["toDate"]	= $("#dateEle").attr('data-enddate'); 

			let btModal = new Backbone.BootstrapModal({
				content		:	new PendingLrForPODDispatch(object),
				modalWidth	:	60,
				title		:	'Pending LRs For POD Dispatch',
				okText		:	'Add',
				showFooter	:	true
			}).open();
			
			object.btModal = btModal;
			
			new PendingLrForPODDispatch(object)
			btModal.open();
		}, openPrint : function(podDispatchId) {
			let newwindow=window.open('InterBranch.do?pageId=340&eventId=10&modulename=podDispatchPrint&masterid='+podDispatchId+'&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}, yearSelectionForPendingLrDispatch: function (response) {
			let selectedCorporateAccount = [];

			$('#yearSelection').html('');
			$('#yearModal').modal('show');

			$('#addSelectedLrBtn').remove();
			$('#yearModal .modal-footer').append('<button id="addSelectedLrBtn" class="btn btn-primary">Add</button>');

			response.CorporateAccount.forEach(obj => {
				const rowHtml = `
					<tr>
						<td><input type="checkbox" class="lrCheckbox" data-waybillid="${obj.wayBillId}"></td>
						<td>${obj.wayBillNumber}</td>
						<td>${obj.partyName}</td>
						<td>${obj.podBranchName}</td>
						<td>${obj.deliveryDateString}</td>
						<td>${obj.pendingDays}</td>
					</tr>`;
				$('#yearSelection').append(rowHtml);
			});
			
			$(document).on('change', '#selectAllCheckbox', function () {
				const isChecked = $(this).is(':checked');
				$('.lrCheckbox').prop('checked', isChecked);
			});
			
			$(document).on('change', '.lrCheckbox', function () {
				const total = $('.lrCheckbox').length;
				const checked = $('.lrCheckbox:checked').length;
				$('#selectAllCheckbox').prop('checked', total === checked);
			});
			
			$('#yearModalClose').on('click', function () {
				$('#selectAllCheckbox').prop('checked', false);
				$('#yearModal').modal('hide');
			});

			$('#addSelectedLrBtn').on('click', function () {
				selectedCorporateAccount.length = 0;

				$('.lrCheckbox:checked').each(function () {
					const wayBillId = $(this).data('waybillid');
					const selectedObj = response.CorporateAccount.find(ca => ca.wayBillId === wayBillId);
			
					if (selectedObj)
						selectedCorporateAccount.push(selectedObj);
				});

				if (selectedCorporateAccount.length === 0) {
					showMessage('error',"Please Select Atleast 1 LR !");
					return;
				}

				if (!(new PendingLrForPODDispatch().checkIfPodUploadRequired(selectedCorporateAccount)))
					return false;

				response.selectedCorporateAccount = selectedCorporateAccount;

				if (response.selectedCorporateAccount.length > 0) {
					_this.createObjectForLrNumberAppend(response);
					$('#selectAllCheckbox').prop('checked', false);
					$('#yearModal').modal('hide');
				}
			});
		}, createObjectForLrNumberAppend : function(response) {
			count	= count + 1;
			let data = null;
				
			if(response.CorporateAccount.length > 0 && response.selectedCorporateAccount != undefined)
				data = response.selectedCorporateAccount;
			else
				data = _.values(response.CorporateAccount);
										
			let pendingPODDispatch	= new PendingLrForPODDispatch();
			let object				= new Object();
			object.ColumnHead		= response.columnConfiguration;
			object.data				= data;
			object.Language			= response.Language;
			object.count			= count;
			
			pendingPODDispatch.lrNumberAppend(object);
			
			hideLayer();
			$('#singleLREle').focus();
		}
	});
});