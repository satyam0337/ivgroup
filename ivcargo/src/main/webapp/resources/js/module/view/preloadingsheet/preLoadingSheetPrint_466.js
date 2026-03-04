define(['elementTemplateJs'
	],function(elementTemplateJs){
	var rowsPerPage	=90;
	var _this;
	var headerCollection,
	currentDateTime,destBrnachesNameCommaSep="";
	var dataView;
	return ({
		renderElements : function(response){
			$('#dataPopup').remove();
			hideLayer();
			_this = this;
			var pendingSheet = response.pendingDispatchmodelColl;
			headerCollection = response.PrintHeaderModel;
			destBrnachesNameCommaSep	= response.destBrnachesNameCommaSep;
			currentDateTime = response.currentDateTime;
			var showDestinationSelectionPopUpInPreloadingSheetPrint = response.showDestinationSelectionPopUpInPreloadingSheetPrint;
			if(showDestinationSelectionPopUpInPreloadingSheetPrint == 'true' || showDestinationSelectionPopUpInPreloadingSheetPrint == true){
				var destinationBranchArr = _.keys(pendingSheet);
				$("#myGrid").append('<div style="display: none;" id="dataPopup"></div>');
				_this.showPopUpWindow(destinationBranchArr,pendingSheet,showDestinationSelectionPopUpInPreloadingSheetPrint);
			} else{
				var finalJsonObj = new Array();
				this.setSortedSources(pendingSheet,finalJsonObj);
				this.setDataForView(finalJsonObj,showDestinationSelectionPopUpInPreloadingSheetPrint);
			}

		},showPopUpWindow:function(destinationBranchArr,pendingSheet,showDestinationSelectionPopUpInPreloadingSheetPrint){
			$('#dataPopup').bPopup({
			},function(){
				var _thisMod = this;
				var keyCollection = _this.createCheckBoxFeild(destinationBranchArr);
				$(this).html("<div class='confirm'><h1 style='font-size:20px;color: #0073BA;'>Please select Destination Branch To Print.</h1><table align='center'>"+keyCollection+"</table><p style='font-size:12px;'>Shortcut Keys : Enter = Yes, Esc = No</p><br/><button id='cancelButton'>NO</button><button autofocus data-btmodel='confirm' id='confirm'>YES</button></div>")
				$("#selectAll").click(function () {
					if($(this).prop("checked")) {
						$(".checkBoxClass").prop("checked", true);
					} else {
						$(".checkBoxClass").prop("checked", false);
					} 
				});
				$("#confirm").focus();
				$("[data-btmodel='confirm']").click(function(){
					_thisMod.close();
					var finalSourceObj = new Object();
					_.each(destinationBranchArr,function(destinationBranchName){
						if($('#'+destinationBranchName.split('(')[0].trim().replace(/ /g,"_")).is(':checked')){
							finalSourceObj[destinationBranchName] = pendingSheet[destinationBranchName]
						}
					})
					var finalJsonObj = new Array();
					_this.setSortedSources(finalSourceObj,finalJsonObj);
					_this.setDataForView(finalJsonObj,showDestinationSelectionPopUpInPreloadingSheetPrint);
				})
				$("#confirm").on('keydown', function(e) {
					if (e.which == 27) {  //escape
						_thisMod.close();
					}
				});
				$("#cancelButton").click(function(){
					_thisMod.close();
				})
			})
		},setDataForView:function(finalJsonObj,showDestinationSelectionPopUpInPreloadingSheetPrint){
			if(dataView == undefined){
				require(['text!/ivcargo/template/preloading/preloadingsheet_466.html'],function(PreLoadingSheet){
					_this.setData(finalJsonObj,showDestinationSelectionPopUpInPreloadingSheetPrint,PreLoadingSheet);
				})
			}else{
				_this.setData(finalJsonObj,showDestinationSelectionPopUpInPreloadingSheetPrint,dataView);
			}

		},setData:function(finalJsonObj,showDestinationSelectionPopUpInPreloadingSheetPrint,PreLoadingSheet){
			$("#myGrid").addClass('visible-print-block');
			var chunkArray = finalJsonObj.splitArray(rowsPerPage);
			var TotalCount = Object.keys(chunkArray).length;
			var totalNoOfLR = 0;
			var totalNoOfQuantity = 0;
			var totalActualWeight = 0;
			var totalChargedWeight = 0;
			
			for(var i = 0;i<finalJsonObj.length;i++){
				var pendingDispatchModel  = finalJsonObj[i];
				if(pendingDispatchModel.pendingQuantity > 0){
					totalNoOfQuantity += pendingDispatchModel.pendingQuantity;
					totalActualWeight += pendingDispatchModel.consignmentSummaryActualWeight;
					totalChargedWeight += pendingDispatchModel.consignmentSummaryChargedWeight
					totalNoOfLR++;
				}
			}
			for(var key in chunkArray){
				$("#myGrid").append(PreLoadingSheet);
				_this.renderTable(chunkArray[key]);
				$('.pageInfo').last().html("Page "+(parseInt(key)+parseInt(1))+" of "+TotalCount);
				$('.currentDateTime').last().html(currentDateTime);
			}
			
			$('.summaryinfo:not(:last)').each(function(){$(this).empty()});
			$('.summaryTable:not(:last)').each(function(){$(this).empty()});
			$("*[data-cell='totalNoOfLr']").html(totalNoOfLR);
			$("*[data-cell='totalNoOfArticle']").html(totalNoOfQuantity);
			$("*[data-cell='totalActualWeight']").html(totalActualWeight);
			$("*[data-cell='totalChargeWeight']").html(totalChargedWeight);
			
			_this.setHeaderData(headerCollection);
			hideLayer();	
			_this.showPrintOnPopup();

		},
		renderTable:function(chunkArray){
			var leftDataChunk = chunkArray.splitArray(Math.ceil(chunkArray.length/2));
			for(var leftData in leftDataChunk){
				if(leftData % 2 == 0){
					this.renderTableValues(leftDataChunk[leftData],'.leftdivTableBody');
				}else{
					this.renderTableValues(leftDataChunk[leftData],'.rightdivTableBody');
				}
			}
		},setHeaderData:function(headerCollection){
			$("*[data-accountgroup='name']").html(headerCollection.accountGroupName);
			$("*[data-branch='name']").html(headerCollection.branchName);
			$("*[data-branch='address']").html(headerCollection.branchAddress);
			$("*[data-branch='phonenumber']").html(headerCollection.branchContactDetailPhoneNumber);
			$("*[data-heading='heading']").html('Pre Loading Sheet');
			$("*[data-heading='destBranchSubregion']").html(headerCollection.destBranchSubregion);
			$("*[data-heading='currentTimeStamp']").html(currentDateTime);
			$("*[data-branch='destinationBranch']").html(destBrnachesNameCommaSep);

			$(".preloadingSheetPage").each(function(i) {if(i!=0){$(this).addClass("page-break");}});
		},renderTableValues:function(chunkArray,className){
			var htmlVariable = '';
			for(var chunk in chunkArray){
				$.each( $(className).last(), function(i, left) {
					$('div', left).each(function() {
						if(typeof $(this).attr('data-cell') != "undefined" ){
							if(chunkArray[chunk][$(this).attr('data-cell')] != undefined){
								htmlVariable += '<div class="'+$(this).attr('class')+'">'+chunkArray[chunk][$(this).attr('data-cell')]+'</div>'
							}else{
								if($(this).attr('data-fullrow')){
									htmlVariable += '<div class="'+$(this).attr('class')+'"></div>'
								}
							}
						}
					});
				})
			}
			$(className).last().html(htmlVariable);
		},showPrintOnPopup:function(){
			var width = 1000;
			var height = 600;
			var left = parseInt((screen.availWidth/2) - (width/2));
			var top = parseInt((screen.availHeight/2) - (height/2));
			childwin = window.open ('', 'newwindow', config='height='+height+',width='+width+',left='+left+ ',top='+top+', toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
			childwin.document.write('<html><head><title>Print it!</title></head><body>')
			childwin.document.write($("#myGrid").html());
			childwin.document.write('</body></html>');
			if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
				childwin.print();
				//childwin.close();
				doneTheStuff	= false;
				childwin.opener.setValue(doneTheStuff);
			}else{
				setTimeout(function(){
					childwin.print();
					childwin.close();
					doneTheStuff	= false;
					childwin.opener.setValue(doneTheStuff);
				},200)
			}
		},setSortedSources:function(pendingSheet,finalJsonObj){
			var destinationArray = new Array();
			for(sourceBranch in pendingSheet){
				destinationArray.push(sourceBranch);
			}
			destinationArray = destinationArray.sort(function(a, b) {return a.localeCompare(b);});
			for(var index in destinationArray){
				finalJsonObj.push({
					sourcebranch:destinationArray[index]
				})
				
				for(var i=0;(pendingSheet[destinationArray[index]]).length > i;i++) {
					var wayBillNumber	= pendingSheet[destinationArray[index]][i].wayBillNumber;
				
					pendingSheet[destinationArray[index]][i].sortByWayBillNumber  = Number(wayBillNumber.substr(wayBillNumber.indexOf("/") + 1));
				
					pendingSheet[destinationArray[index]] =  _.sortBy(pendingSheet[destinationArray[index]],'sortByWayBillNumber');
				}
				var detsinationcollection = pendingSheet[destinationArray[index]];
//				detsinationcollection	= _.sortBy(detsinationcollection, 'wayBillNumberLong');
				for(var destkey in detsinationcollection){
					finalJsonObj.push(detsinationcollection[destkey]);
				}
			}
			
		},createCheckBoxFeild:function(destinationArray){
			var collection = '';
			collection += "<tr><td colspan='2' style='background-color: #E2E2E2;color: #0073BA;font-size:15px'><b><input type='checkbox' id='selectAll' checked>SelectAll<b></td></tr>";

			for(var i=0;i<destinationArray.length;i++){
				if(i % 2 == 0){
					collection += "<tr><td style='background-color: #E2E2E2;font-size:15px'><b><input type='checkbox' id="+destinationArray[i].split('(')[0].trim().replace(/ /g,"_")+" value="+destinationArray[i].split('(')[0].trim()+" class='checkBoxClass' checked>&nbsp;&nbsp;"+destinationArray[i].split('(')[0].trim()+"</b></td>";
				}else{
					collection += "<td style='background-color: #E2E2E2;font-size:15px'><b><input type='checkbox' id="+destinationArray[i].split('(')[0].trim().replace(/ /g,"_")+" value="+destinationArray[i].split('(')[0].trim()+" class='checkBoxClass' checked>&nbsp;&nbsp;"+destinationArray[i].split('(')[0].trim()+"</b></td></tr>";
				}
			}
			return collection;
		}
	});
});
Object.defineProperty(Array.prototype, 'splitArray', {
	value: function(chunkSize) {
		var array=this;
		return [].concat.apply([],
				array.map(function(elem,i) {
					return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
				})
		);
	}
});