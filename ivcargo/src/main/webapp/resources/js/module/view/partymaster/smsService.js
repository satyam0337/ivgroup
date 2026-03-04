define([
	'text!'+PROJECT_IVVIEWPAGES+'/template/elementtemplate.html'
	,'language'//import in require.config
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'elementmodel'
	,'nodvalidation'
	,'nodvalidation'
	,'elementTemplateJs'
	,'autocompleteWrapper'
	,'elementTemplateJs'
	,'constant'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	], function (ElementTemplate,Language,errorshow,JsonUtility,MessageUtility,ElementModel,NodValidation,AutoCompleteWrapper,Elementtemplateutils,constant,BootstrapModal) {
	'use strict';// this basically give strictness to this specific js
	var 
	_this = '',
	myNod,
	ElementModelArray,
	btModal,
	jsonObject,
	bill,
	noOfSmsEvent = 6,
	smsEventList,
	smsService,
	partySmsDetailList,
	btModalConfirm;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData) {

			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 					= this;
			jsonObject				= jsonObjectData;
			smsEventList			= jsonObjectData.smsEventList;
			btModal					= jsonObjectData.btModal;
			partySmsDetailList		= jsonObjectData.partySms;
		},
		render: function() {
			setTimeout(_this.setElements, 1000);
		},setElements : function() {
			
			for(var i = 0; i < smsEventList.length; i++) {
				var table = $("<table style='width:100%;'></table>");
				var modalBody = $( "#modalBody" );
				var newtr =	$('<tr id="smsEventId_' + smsEventList[i].smsEventId + '"style="height: 50px;"></tr>');
				
				var newtd1 	= $("<td style='width:40%;'></td>");
				var newtd2 	= $("<td style='width:60%;'></td>");
				
				var span1	= $("<span style='float: left;width: 25px;'><input id='smsEvent_"+smsEventList[i].smsEventId+"' type='checkbox' /></span>");
				var span2	= $("<span style='width:40%;'>"+smsEventList[i].smsSentToName+"</span>");
				var span3	= $("<span style='float: left;width: 100px;'>SMS Sent To :</span>");
				var span4	= $("<span style='float: left;'><select id='sentTo_"+smsEventList[i].smsEventId+"'><option value='1'>Consignor</option><option value='2'>Consignee</option><option value='3'>Both</option></select></span>");

				$(newtd1).append(span1);
				$(newtd1).append(span2);
				$(newtd2).append(span3);
				$(newtd2).append(span4);
				$(newtr).append(newtd1);
				$(newtr).append(newtd2);
				$(table).append(newtr);

				$("#modalBody").append(table);
			}
			for(var i = 0; i < partySmsDetailList.length; i++) {
				if(partySmsDetailList[i].smsEventId > 0) {
					$('#smsEvent_' + partySmsDetailList[i].smsEventId).prop('checked', 'true');
					$('#sentTo_' + partySmsDetailList[i].smsEventId).val(partySmsDetailList[i].smsSentToId);
				}
			}
		}
			
	});
});