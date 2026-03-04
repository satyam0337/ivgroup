define([
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/lrWiseCostingDetails/lrWiseCostingDetailsfilepath.js'//FilePath
	,'language'//import in require.config
	,'slickGridWrapper'
	,'slickGridWrapper2'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	,'elementmodel'
	,'elementTemplateJs'
	,'constant'
	], function (FilePath,Language,slickGridWrapper,slickGridWrapper2,errorshow,JsonUtility,MessageUtility,UrlParameter,ElementModel,Elementtemplateutils,constant) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	wayBillId,
	masterLangKeySet,
	gridObject,
	masterLangObj,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//initialize is the first function called on call new view()
			_this = this;
			wayBillId 				= UrlParameter.getModuleNameFromParam('wayBillId');
			
			jsonObject.waybillId	= wayBillId;
		}, render: function() {
			
			jsonObject	= new Object();
			
			jsonObject.waybillId	= wayBillId;
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/lrWiseCostingDetailsWS/getLrWiseCostingDetailsData.do?', _this.setLrWiseCostingDetails, EXECUTE_WITHOUT_ERROR);
	
		}, setLrWiseCostingDetails : function(response) {
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/lrWiseCostingDetails/LrWiseCostingDetails.html",function() {
				baseHtml.resolve();
			});
			$.when.apply($, loadelement).done(function() {
				//initialiseFocus();
				_this.setArticleWiseTableDetails(response);
			//	_this.setWeightWiseTableDetails(response);
			});
		}, setArticleWiseTableDetails : function(response) {
			if(response.incomExpenseDetailsHM != undefined) {
				hideLayer();
				var incomExpenseDetailsHM = response.incomExpenseDetailsHM;
				var totalprofiLossAmount = 0;
				var totalAmount	= 0;
				var profitLossPercent = 0;
				var totalIncomeAmount = 0 ;
				
				var tr2			= $("<tr></tr>");
				tr2.append("<th colspan='2'><b>Income</b></th><th><b>Expense</b></th>");
				$('#incomeDetails').append(tr2);
				
				$("#lrNumber").text(response.wayBillNumber);

				for(var key in incomExpenseDetailsHM) {
					var articleAndWeightBasisHM	= incomExpenseDetailsHM[key];
					
					//totalAmount				= 0;
					totalprofiLossAmount	= 0;
					profitLossPercent       = 0;
					totalIncomeAmount       = 0;
					
					for(var key1 in articleAndWeightBasisHM){
						if(articleAndWeightBasisHM.hasOwnProperty(key1)){

							totalAmount	= 0;
							
							var incomExpenseDetails 		= articleAndWeightBasisHM[key1];

							//Create a HTML Table element.
							var table = document.createElement("TABLE");

							table.width = "100%";
							table.border = "1";

							//Add the header row.
							var row = table.insertRow(-1);
							var headerCell = document.createElement("TH");

							if(key1 == "Income")
								headerCell.innerHTML = 'Income';
							else if(key1 == "Expense")
								headerCell.innerHTML = 'Expense';

							headerCell.colSpan = '2';
							headerCell.style = 'text-align:center;background:pink;';


							row.appendChild(headerCell);

							//Add the data rows.
							for(var key2 in incomExpenseDetails){
								var amount 	= incomExpenseDetails[key2];

								row = table.insertRow(-1);

								var cell = row.insertCell(0);
								cell.innerHTML = key2;
								cell.height	= "25px";

								var amtCell = row.insertCell(-1);
								amtCell.innerHTML = amount.toFixed(2);
								amtCell.align = 'right';
								amtCell.height	= "25px";

								totalAmount += Number(amount);
								
								if(key1 == "Income") {
									totalIncomeAmount += Number(amount);									
								}

							} 

							var dvTable = null;

							if(key == 'Article Basis') {
								if(key1 == "Income")
									dvTable = document.getElementById("incomeDetails");

								if(key1 == "Expense")
									dvTable = document.getElementById("expenseDeatils");
							} else {
								if(key1 == "Income")
									dvTable = document.getElementById("weightWiseIncomeDetails");

								if(key1 == "Expense")
									dvTable = document.getElementById("weightWiseExpenseDetails");
							}
							
							/*
							if(key1 == "Income") {
								for(var i = 0; i < 5; i++) {
									row = table.insertRow(-1);

									var cell = row.insertCell(0);
									cell.colSpan = 2;
									cell.height	= "25px";
								}
							}
							*/
							if(key1 == "Income")
								totalprofiLossAmount	= totalAmount;
							else
								totalprofiLossAmount	= totalprofiLossAmount - totalAmount;

							row = table.insertRow(-1);

							var cell = row.insertCell(0);
							cell.innerHTML = "<b>Total</b>";
							cell.height	= "25px";

							var amtCell = row.insertCell(-1);
							amtCell.innerHTML = totalAmount.toFixed(2);
							cell.height	= "25px";
							amtCell.align = 'right';

							dvTable.innerHTML = "";
							dvTable.appendChild(table);
						}
					}
					
					profitLossPercent = (totalprofiLossAmount*100)/totalIncomeAmount;
					var tr5			= $("<tr></tr>");
					tr5.append("<th style='text-align:center;background: antiquewhite;'><b>Profit/Loss</b>&nbsp;&nbsp;<b> "+totalprofiLossAmount.toFixed(2)+"</b></th>");
					tr5.append("<th style='text-align:center;background: antiquewhite;'><b>Profit/Loss Percent</b>&nbsp;&nbsp;<b> "+profitLossPercent.toFixed(2)+"</b></th>");
					
					if(key == 'Article Basis'){
						$('#articleBasisDetails').append(tr5);
					} else {
						$('#weightBasisDetails').append(tr5);
					}	
				}
			}
		}
	});
});