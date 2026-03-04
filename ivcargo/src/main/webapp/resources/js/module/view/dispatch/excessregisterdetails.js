/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define(
		[
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/dispatch/dispatchfilepath.js',
			'JsonUtility',
			'messageUtility',
			'jquerylingua',
			'language',
			'autocomplete',
			'autocompleteWrapper',
			PROJECT_IVUIRESOURCES+'/resources/js/backbone/backbone.bootstrap-modal.js',
			'selectizewrapper'
			],//PopulateAutocomplete
			function(FilePath) {
			'use strict';// this basically give strictness to this specific js
			var _this = '', jsonObject;
			return Marionette.LayoutView.extend({
				initialize: function(jsonObjectData){

					//initialize is the first function called on call new view()
					//append template first 
					//the html would be set in the el element
					//this object is not found in other function so _this has been created
					_this 				= this;
					jsonObject 			= jsonObjectData.elementValue;
				},render: function(){
					_this.viewExcessRegisterDetails();
				},viewExcessRegisterDetails : function() {

					var loadelement = new Array();
					var baseHtml = new $.Deferred();
					loadelement.push(baseHtml);

					setTimeout(function(){
						$("#modalBody").load("/ivcargo/html/module/dispatch/ExcessRegisterDetails.html",function() {
							baseHtml.resolve();
						});
					},200);

					$.when.apply($, loadelement).done(function() {
						initialiseFocus();

						loadLanguageWithParams(FilePath.loadLanguage());

						if(!(_.isArray(excessEntryDetailsArray) && _.isEmpty(excessEntryDetailsArray))) {
							
							var table = $('<table class="table table-bordered" />'); 
							
							for (var i = 0; i < excessEntryDetailsArray.length; i++){
								if(i == 0) {
									var tr 	=  $('<tr class="info"/>'); 
									
									var th1 	=  $('<th/>');
									var th2 	=  $('<th/>');
									var th3 	=  $('<th/>');
									var th4 	=  $('<th/>');
									var th5 	=  $('<th/>');
									var th6 	=  $('<th/>');
									var th7 	=  $('<th/>');
									var th8 	=  $('<th/>');
									
									th1.append("LR No");
									th2.append("From");
									th3.append("To");
									th4.append("Article");
									th5.append("Packing Type");
									th6.append("Weight");
									th7.append("Remark");
									th8.append("#");
									
									tr.append(th1);
									tr.append(th2);
									tr.append(th3);
									tr.append(th4);
									tr.append(th5);
									tr.append(th6);
									tr.append(th7);
									tr.append(th8);
									
									table.append(tr);
								} 
									var tr 	=  $('<tr/>'); 
									tr.attr('id',"row_"+(excessEntryDetailsArray[i].wayBillId));

									var td1 	=  $('<td/>');
									var td2 	=  $('<td/>');
									var td3 	=  $('<td/>');
									var td4 	=  $('<td/>');
									var td5 	=  $('<td/>');
									var td6 	=  $('<td/>');
									var td7 	=  $('<td/>');
									var td8 	=  $('<td/>');
									
									var button = $('<button class="btn btn-primary">Delete</button>')
									button.attr('id',"deleteBtn_"+(excessEntryDetailsArray[i].wayBillId));
									button.attr('onclick',"deleteExcessEntry("+(excessEntryDetailsArray[i].wayBillId)+")");
									
									td1.append(excessEntryDetailsArray[i].wayBillNumber);
									td2.append(excessEntryDetailsArray[i].srcBranchName);
									td3.append(excessEntryDetailsArray[i].destBranchName);
									td4.append(excessEntryDetailsArray[i].quantity);
									td5.append(excessEntryDetailsArray[i].packingTypeName);
									td6.append(excessEntryDetailsArray[i].weight);
									td7.append(excessEntryDetailsArray[i].remark);
									td8.append(button);
									
									tr.append(td1);
									tr.append(td2);
									tr.append(td3);
									tr.append(td4);
									tr.append(td5);
									tr.append(td6);
									tr.append(td7);
									tr.append(td8);
									
									table.append(tr);
							}
							$('#excessEntriesDiv').append(table);
						}

						hideLayer();
					});
				}
			});
		});

function deleteExcessEntry(id) {

	var btModalConfirm = new Backbone.BootstrapModal({
		content		: 	"Are you sure you want to Delete ?",
		modalWidth 	: 	30,
		title		:	'Delete',
		okText		:	'Delete',
		showFooter 	: 	true,
		okCloses	:	true
	}).open();

	btModalConfirm.on('ok', function() {
		$("#row_"+id).remove();
		excessEntryDetailsArray = _.without(excessEntryDetailsArray, _.findWhere(excessEntryDetailsArray, {
			  wayBillId: ""+id
		}));
	});
}