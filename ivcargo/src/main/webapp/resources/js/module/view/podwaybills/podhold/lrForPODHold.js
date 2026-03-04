/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
	PROJECT_IVUIRESOURCES + '/resources/js/module/view/podwaybills/podhold/podholdmodulefilepath.js'
	,'language'//import in require.config
	,'slickGridWrapper3'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'elementmodel'
	,'elementTemplateJs'
	,'constant'
	], function (FilePath,Language,slickGridWrapper3,errorshow,JsonUtility,MessageUtility,ElementModel,Elementtemplateutils,constant) {
	'use strict';// this basically give strictness to this specific js
	var 
	_this = '',
	columnHiddenConfiguration,
	columnHeaderJsonArr,
	LangKeySet,
	columnHeaderArr,
	allGridObject,
	selectedGridObject,
	viewObject,
	gridObejct,
	btModal,
	jsonObject;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){

			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 				= this;
			jsonObject 			= jsonObjectData.elementValue;
			btModal				= jsonObjectData.btModal;
			selectedGridObject 	= jsonObjectData.gridObj;
		},
		render: function(){
			showLayer();
		},lrNumberAppend:function(pendingDispatchobj){
			columnHeaderJsonArr 		= pendingDispatchobj.ColumnHead;
			LangKeySet 					= pendingDispatchobj.Language;

			$('#singleLREle').focus();
			
			return _this.getDataFromGrid(pendingDispatchobj.data);
		},getDataFromGrid:function(dataObject){
			if(dataObject.length > 0) {
				changeDisplayProperty('middle-border-boxshadow', 'block');
				changeDisplayProperty('bottom-border-boxshadow', 'block');
				$(".PODToBeHold").removeClass("hide");
				
				if(slickGridWrapper3.checkToAddRowInTable({InnerSlickId : 'podToBeHoldDiv'},dataObject,'wayBillId')){
					showMessage('error','LR already added.');
					return false;
				}

				slickGridWrapper3.applyGrid(
						{
							ColumnHead						:	columnHeaderJsonArr, // *compulsory // for table headers
							ColumnData						:	dataObject, 	// *compulsory // for table's data
							Language						:	LangKeySet, 			// *compulsory for table's header row language
							DivId							:	'myGrid',				// *compulsary field // division id where slickgrid table has to be created
							InnerSlickId					:	'podToBeHoldDiv',
							SerialNo						:[{					// optional field // for showing Row number
								showSerialNo	:	false,
								SearchFilter	:	false,          // for search filter on serial no
								ListFilter		:	false				// for list filter on serial no
							}],
							NoVerticalScrollBar				:	false, //optional for no vertical scrolling & if set true remove height attribute to Grid Div
							ShowDeleteButton 				: 	true,
							DataVieObject					:	viewObject,
							DataGridObject					:	gridObejct,
							PersistGridToAppend				:	true,
						});
			}	
		}
	});
});