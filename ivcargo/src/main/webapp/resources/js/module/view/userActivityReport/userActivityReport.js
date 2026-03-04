let booking='booking',dispatch='dispatch',receive='receive',delivered='delivered';

define([  'JsonUtility'
		 ,'messageUtility'
		 ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/userActivityReport/userActivityReportFilepath.js'
		 ,'jquerylingua'
		 ,'language'
		 ,'autocomplete'
		 ,'autocompleteWrapper'
		 ,'slickGridWrapper3'
		 ,'nodvalidation'
		 ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		 ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
		 ,PROJECT_IVUIRESOURCES +'/resources/js/populateautocomplete/selectoption.js'//ModelUrls
		 ,'focusnavigation'//import in require.config
		 ],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
				 slickGridWrapper3, NodValidation, BootstrapModal,datePickerUI, Selection, ElementFocusNavigation) {
			'use strict';
			var jsonObject = new Object(), myNod, tab = "createTab", _this = '', gridObject, masterLangObj;
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this = this;
				},render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/report/userActivityWS/getUserActivityReportElement.do?',	_this.renderUserActivityElements,	EXECUTE_WITHOUT_ERROR);
					return _this;
				},renderUserActivityElements : function(response){
					var loadelement = new Array();
					var baseHtml = new $.Deferred();

					loadelement.push(baseHtml);
					
					$("#mainContent").load("/ivcargo/html/module/userActivityReport/userActivityReport.html",function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						var keyObject = Object.keys(response);
						for (var i = 0; i < keyObject.length; i++) {
							if (response[keyObject[i]].show == false) {
								$("*[data-attribute="+ keyObject[i]+ "]").addClass("hide");
							}
						}
						
						
						response.sourceAreaSelection 			= false;
						response.executiveWithBranchSelection 	= true;
						response.isCalenderSelection 			= true;
						response.isThreeMonthsCalenderSelection = true;
						response.executiveListByBranch 			= true;
						response.AllOptionsForExecutive 		= true;
						response.showAllExecutiveOfBranch 		= true;
						
						var elementConfiguration	= new Object();
						
						elementConfiguration.dateElement		= $('#dateEle');
						elementConfiguration.branchElement		= $('#branchEle');
						elementConfiguration.executiveElement	= $('#executiveEle');
						
						response.elementConfiguration	= elementConfiguration;
					
						Selection.setSelectionToGetData(response);
						Selection.setBranch(response);
						Selection.setExecutive(response);
						
						masterLangObj = FilePath.loadLanguage();
						loadLanguageWithParams(masterLangObj);
						
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});
							myNod.add({
								selector: '#branchEle',
								validate: 'validateAutocomplete:#branchEle_primary_key',
								errorMessage: 'Select proper Branch !'
							});
						myNod.add({
							selector: '#executiveEle',
							validate: 'validateAutocomplete:#executiveEle_primary_key',
							errorMessage: 'Select proper executive !'
						});
						$('#bookingActivityGif').hide();
						$('#dispatchActivityGif').hide();
						$('#receiveActivityGif').hide();
						$('#deliverActivityGif').hide();

						hideLayer();
						$("#find").click(function() {
							myNod.performCheck();
							if(myNod.areAll('valid')){
								$("#find").hide();
								_this.onSubmit(_this);								
							}
						});
					});

				},setReportData : function(response) {
					
					$('#bookedCount').text(response.bookingCount);
					$('#cancelledCount').text(response.cancelledCount);
					$('#bookingActivityGif').hide();
					$('#bookingActivityDiv').removeClass('hide');
					$('#bookingActivityDiv').wrap('<a href="javascript:void(0)" onclick="getActivityDetails(\'booking\')"/>');
					$('#DLSCount').text(response.dispactLsCount);
					$('#DLRCount').text(response.dispactLRCount);
					$('#dispatchActivityGif').hide();
					$('#disptchActivityDiv').removeClass('hide');
					$('#disptchActivityDiv').wrap('<a href="javascript:void(0)" onclick="getActivityDetails(\'dispatch\')"/>');
					$('#RTURCount').text(response.receiveTURCount);
					$('#RLRCount').text(response.receiveLRCount);
					$('#receiveActivityGif').hide();
					$('#receiveActivityDiv').removeClass('hide');
					$('#receiveActivityDiv').wrap('<a href="javascript:void(0)" onclick="getActivityDetails(\'receive\')"/>');
					$('#delLRCount').text(response.deliverCount);
					$('#deliverActivityGif').hide();
					$('#deliverActivityDiv').removeClass('hide');
					$('#deliverActivityDiv').wrap('<a href="javascript:void(0)" onclick="getActivityDetails(\'delivered\')"/>');
					$("#find").show();
				},onSubmit : function() {
					$("#find").hide();
					$('#bottom-border-boxshadow').removeClass('hide');
					$('#bookingActivityGif').show();
					$('#bookingActivityDiv').addClass('hide');
					
					$('#dispatchActivityGif').show();
					$('#disptchActivityDiv').addClass('hide');
					
					$('#receiveActivityGif').show();
					$('#receiveActivityDiv').addClass('hide');
					
					$('#deliverActivityGif').show();
					$('#deliverActivityDiv').addClass('hide');
					var jsonObject = new Object();
					
					if($('#dateEle').is(":visible")){
						if($("#dateEle").attr('data-startdate') != undefined){
							jsonObject["fromDate"] = $("#dateEle").attr('data-startdate');
						}
						
						if($("#dateEle").attr('data-enddate') != undefined){
							jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
						}
					} 
					jsonObject["sourceBranchId"] 		= $('#branchEle_primary_key').val();
					jsonObject["selectedExecutiveId"] 			= $('#executiveEle_primary_key').val();
					
					$('#selectedFromdate').val(jsonObject.fromDate);
					$('#selectedTodate').val(jsonObject.toDate);
					$('#selectedBranchId').val(jsonObject.sourceBranchId);
					$('#selectedExecutiveId').val(jsonObject.executiveId);
					$('#tableId').empty();
					$('#headerId').text('');
					getJSON(jsonObject, WEB_SERVICE_URL+'/report/userActivityWS/getUserActivityCounts.do', _this.setReportData, EXECUTE_WITH_ERROR);
				}
			});
		});
		
function getActivityDetails(type) {
	showLayer();
	setHeader(type);
	var jsonObject = new Object();

	jsonObject['fromDate'] = $('#selectedFromdate').val();
	jsonObject['toDate'] = $('#selectedTodate').val();
	jsonObject['sourceBranchId'] = $('#selectedBranchId').val();
	jsonObject['selectedExecutiveId'] = $('#selectedExecutiveId').val();
	jsonObject['type'] = type;

	$.ajax({
		url: WEB_SERVICE_URL + '/report/userActivityWS/getUserActivityDetails.do',
		type: 'POST',
		dataType: 'json',
		data: jsonObject,
		success: function(data) {
			if(type == booking || type == delivered)
			createBookingTable(data,type);
			else
			createDispatchAndReceiveTable(data,type)
		},
		error: function(e) {
			console.log("error : ", e);
		}
	})
}

function createBookingTable(data,type){
	$('#tableId').empty();
	if(data != undefined && data.list != undefined && data.list.length > 0) {
	var thead = $('<thead>');
	var tr1 = $('<tr class="bg-gradient-secondary">');
	var th1		= $('<th>');
	var th2		= $('<th>');
	var th3		= $('<th>');
	var th4		= $('<th>');
	var th5		= $('<th>');
	var th6		= $('<th>');
	var th7		= $('<th>');
	tr1.append(th1.append("Executive Name"));
	tr1.append(th2.append("Paid"));
	tr1.append(th3.append("FOC"));
	tr1.append(th4.append("To pay"));
	tr1.append(th5.append("Credit"));
	tr1.append(th6.append("Total"));
	if(booking == type)
	tr1.append(th7.append("Cancel"));
	thead.append(tr1);
	var tbody=$('<tbody>');
		var list = data.list;
			for(var i = 0; i < list.length; i++) {
			var tr1 	= $('<tr class="ng-scope">');
			var td1		= $('<td>');
			var td2		= $('<td>');
			var td3		= $('<td>');
			var td4		= $('<td>');
			var td5		= $('<td>');
			var td6		= $('<td>');
			var td7		= $('<td>');
			
			tr1.append(td1.append(list[i].executiveName));
			tr1.append(td2.append(list[i].paidCount));
			tr1.append(td3.append(list[i].focCount));
			tr1.append(td4.append(list[i].toPayCount));
			tr1.append(td5.append(list[i].tbbCount));
			tr1.append(td7.append(list[i].total));
			if(booking == type)
			tr1.append(td6.append(list[i].cancelledCount));
			tbody.append(tr1);
			}
	$('#tableId').append(thead);
	$('#tableId').append(tbody);
		$('#tableBox').removeClass('hide');
		document.getElementById('tableBox').scrollIntoView({
  		behavior: 'smooth'
	});
			
	}else{
			showMessage('info',"No Records Found ");
		$('#tableBox').addClass('hide');
	}
	hideLayer();
}

function createDispatchAndReceiveTable(data,type){
	$('#tableId').empty();
	if( data != undefined && data.list != undefined && data.list.length > 0) {
	var thead = $('<thead>');
	var tr1 = $('<tr class="bg-gradient-secondary">');
	var th1		= $('<th>');
	var th2		= $('<th>');
	var th3		= $('<th>');
	tr1.append(th1.append("Executive Name"));
	if(dispatch == type)
	tr1.append(th2.append("LS"));
	else
	tr1.append(th2.append("TUR"));
	tr1.append(th3.append("LR"));
	thead.append(tr1);
	var tbody=$('<tbody>');
		var list = data.list;
			for(var i = 0; i < list.length; i++) {
			var tr1 	= $('<tr class="ng-scope">');
			var td1		= $('<td>');
			var td2		= $('<td>');
			var td3		= $('<td>');
			tr1.append(td1.append(list[i].executiveName));
			tr1.append(td2.append(list[i].lsCount));
			tr1.append(td3.append(list[i].lrCount));
			tbody.append(tr1);
			}
	$('#tableId').append(thead);
	$('#tableId').append(tbody);
	$('#tableBox').removeClass('hide');
		document.getElementById('tableBox').scrollIntoView({
  		behavior: 'smooth'
	});
	}else{
		showMessage('info',"No Records Found ");
		$('#tableBox').addClass('hide');
	}
	hideLayer();
}
function setHeader(type){
	
	$('#bookingActivityC').addClass('bg-gradient-blueOne').removeClass('bg-gradient-primary');
	$('#disptchActivityC').addClass('bg-gradient-blueOne').removeClass('bg-gradient-primary');
	$('#receiveActivityC').addClass('bg-gradient-blueOne').removeClass('bg-gradient-primary');
	$('#deliverActivityC').addClass('bg-gradient-blueOne').removeClass('bg-gradient-primary');
	
	if(type == booking){
	$('#headerId').text('Executive Wise Booking Count')
	$('#bookingActivityC').addClass('bg-gradient-primary').removeClass('bg-gradient-blueOne');
	}else if (type == dispatch){
	$('#disptchActivityC').addClass('bg-gradient-primary').removeClass('bg-gradient-blueOne');
	$('#headerId').text('Executive Wise Dispatch Count')
	}else if (type == receive){
	$('#receiveActivityC').addClass('bg-gradient-primary').removeClass('bg-gradient-blueOne');
	$('#headerId').text('Executive Wise Receive Count')
	}else if (type == delivered){
	$('#deliverActivityC').addClass('bg-gradient-primary').removeClass('bg-gradient-blueOne');
	$('#headerId').text('Executive Wise delivered Count')
	}
}