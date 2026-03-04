	let list = null;
	let lsSourceBranchId =0;
	let  id = 0;

define([ PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'//PopulateAutocomplete
	,'JsonUtility'
	,'messageUtility'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	], function(Selection) {
	'use strict';
	var jsonObject = new Object(), myNod,myNod1,  _this = '', BRANCH_SELECTION = 1, PARTY_SELECTION = 2, COD_NUMBER_SELECTION = 5;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			this.$el.html(this.template);
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/codReceiveWS/getCODReceiveElement.do?',_this.setElementDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},setElementDetails : function(response){
			initialiseFocus();
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/cod/codReceive.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}
				
				response.isCalenderSelection		= response['date'];
				response.executiveTypeWiseBranch	= true;
				
				var elementConfiguration	= new Object();
				
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.branchElement		= $('#codBranchEle');
				
				response.elementConfiguration	= elementConfiguration;
				
				Selection.setSelectionToGetData(response);
				
				var autoSelectionName 			= new Object();
				autoSelectionName.primary_key 	= 'selectionId';
				autoSelectionName.field 		= 'selectionName';
				autoSelectionName.callBack 		= _this.onSearchBySelect;
				$("#searchByOptionEle").autocompleteCustom(autoSelectionName);
				
				var autoSelectionNameInstance 	= $("#searchByOptionEle").getInstance();

				$(autoSelectionNameInstance).each(function() {
					this.option.source 			= response.selectionArr;
				});
						
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod.add({
					selector		: '#codBranchEle',
					validate		: 'validateAutocomplete:#codBranchEle_primary_key',
					errorMessage	: 'Select COD Branch !'
				});

				myNod1 = nod();
				myNod1.configure({
					parentClass:'validation-message'
				});
				
				myNod1.add({
					selector		: '#codNumberEle',
					validate		: 'presence',
					errorMessage	: 'Enter COD Number !'
				});
					
				hideLayer();
				
				$("#codNumberEle" ).keydown(function(e) {
					if (e.which == 13) {
						_this.searchCOD();
					}
				});

				$("#findNumberBtn").click(function() {
					if($('#searchByOptionEle_primary_key').val() == BRANCH_SELECTION) {
						myNod.performCheck();
						
						if(myNod.areAll('valid'))
							_this.searchCOD();							
					} else if($('#searchByOptionEle_primary_key').val() == COD_NUMBER_SELECTION) {
						myNod1.performCheck();
						
						if(myNod1.areAll('valid'))
							_this.searchCOD();								
					}
				});
			});
		}, onSearchBySelect : function() {
			if($('#searchByOptionEle_primary_key').val() == BRANCH_SELECTION) {
				$('.codBranch').removeClass('hide');
				$('.date').addClass('hide');
				$('.codNumber').addClass('hide');
				$('.lrNumber').addClass('hide');
				$('.partyName').addClass('hide');
			} else if($('#searchByOptionEle_primary_key').val() == COD_NUMBER_SELECTION) {
				$('.codNumber').removeClass('hide');
				$('.date').addClass('hide');
				$('.codBranch').addClass('hide');
				$('.lrNumber').addClass('hide');
			}
		}, searchCOD : function() {
			showLayer();
			
			let jsonObject = new Object();
		
			jsonObject.codDispatchNumber				= $('#codNumberEle').val();
			jsonObject.searchBy 						= $('#searchByOptionEle_primary_key').val();
			jsonObject.codBranchId  					= $("#codBranchEle_primary_key").val();
			jsonObject.wayBillNumber					= $('#singleLREle').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/codReceiveWS/getCodDetails.do?', _this.setData, EXECUTE_WITH_ERROR);
		}, setData : function(response) {
			
			hideLayer();
			$('#mainTable').empty();

			 list = response.codReceiveList;

			if(list.length  > 0){
			$('#bottom-border-boxshadow').removeClass('hide');
			
			let headerColumnArray = new Array();
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"  >Receive</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"  >COD Dispatch Number</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"  > From</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"  > To</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white" >COD Amount </th>');
				headerColumnArray.push("<th style='text-align: center;display:none ; font-size:15px;'><input style='font-weight:bold;' type='hidden' id='oxAll' value='checkboxAll' unchecked> </th>");
				headerColumnArray.push("<th style='text-align: center;display:none ; font-size:15px;'><input style='font-weight:bold;' type='hidden' id='xAll' value='checkboxAll' unchecked> </th>");

				$('#mainTable').append('<tr>' + headerColumnArray.join(' ') +' </tr>');
				
			for(let i=0;i < list.length;i++){
				var data = list[i];

				let dataColumnArray = new Array();
					dataColumnArray.push("<td style='text-align: center; vertical-align: middle; font-size: 15px; '><button class='btn btn-primary' id='Recieve_"+i+"' onclick='recieve(\"" + data.codDispatchNumber + "\")'>Recieve</button></td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;'>" +data.codDispatchNumber+ "</td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;' id='codNumber"+i+"'>" +data.sourceBranch+ "</td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;' id='codNumber"+i+"'>" +data.destinationBranch+ "</td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle;font-size:15px;' id='lsNumber_"+i+"'>" +data.codAmount+ "</td>");


					$("#mainTable").append('<tr>' +dataColumnArray.join(' ')+ '</tr>');
		
				$('#Recieve_' + i).click(function() {
					var codDispatchNumber = list[i].codDispatchNumber; 
					_this.recieve(codDispatchNumber, list[i].codDispatchLedgerId);
					
					setTimeout(function(){ 
						location.reload(); 
					});
				});
			}
			
				let totalArray = new Array();
					$("#mainTable").append('<tr>' +totalArray.join(' ')+ '</tr>');
			}
		}, recieve : function(codDispatchNumber, codDispatchLedgerId) {
			window.open('CodReceive.do?pageId=340&eventId=2&modulename=codLrReceive&codNumber=' + codDispatchNumber+'&codLedgerId='+codDispatchLedgerId);
		}
	});
});

function checkBoxForAll(){
	for(let i = 0; i < list.length; i++) {
		$("#check_"+i).prop("checked", $("#checkboxAll").prop("checked"));
	}
}


$('input[type="checkbox"]').change(function() {
    var anyChecked = $('input[type="checkbox"]:checked').length > 0;
    $('#saveRate').prop('disabled', !anyChecked);
});