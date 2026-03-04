define(['elementTemplateJs'
       ],function(elementTemplateJs){
	var rowsPerPage	=3000;
	var _this;
	var headerCollection,
	currentDateTime,destBrnachesNameCommaSep="";
	return ({
		renderElements : function(response){
			_this = this;
			var pendingSheet = response.pendingDispatchmodelColl;
			headerCollection = response.PrintHeaderModel;
			currentDateTime = response.currentDateTime;
			destBrnachesNameCommaSep	= response.destBrnachesNameCommaSep;
			var finalJsonObj = new Array();
			this.setSortedSources(pendingSheet,finalJsonObj);
			this.setDataForView(finalJsonObj);
		},setDataForView:function(finalJsonObj){
			var sortedJsonObj	= _.sortBy(finalJsonObj,'wayBillNumber');
			require(['text!/ivcargo/template/preloading/preloadingsheet_737.html'],function(PreLoadingSheet){
				$("#myGrid").addClass('visible-print-block');
				var chunkArray = sortedJsonObj.splitArray(rowsPerPage);
				var TotalCount = Object.keys(chunkArray).length;
				var totalNoOfLR = 0;
				var totalNoOfQuantity = 0;
				var totalActualWeight = 0;
				for(var i = 0;i<finalJsonObj.length;i++){
					var pendingDispatchModel  = finalJsonObj[i];
					if(pendingDispatchModel.pendingQuantity > 0){
						totalNoOfQuantity += pendingDispatchModel.pendingQuantity;
						totalActualWeight += pendingDispatchModel.consignmentSummaryActualWeight;
						totalNoOfLR++;
					}
				}
				for(var key in chunkArray){
					$("#myGrid").append(PreLoadingSheet);
					_this.renderTableValues(chunkArray[key],'.leftdivTableBody');
				//$('.pageInfo').last().html("Page "+(parseInt(key)+parseInt(1))+" of "+TotalCount);
					$('.currentDateTime').last().html(currentDateTime);
				}
				$('.leftdivTableBody .divTableCell:last').fadeOut();
				$('.divTableFoot:not(:last)').each(function(){$(this).empty()});
				$('.totalNoOfLr').last().html('LRs- '+totalNoOfLR);
				$('.totalNoOfArticle').last().html(totalNoOfQuantity);
				$('.actualweight').html(totalActualWeight);
				
				_this.setHeaderData(headerCollection);
				hideLayer();	
				_this.showPrintOnPopup();
			})
		},setHeaderData:function(headerCollection){
			$("*[data-heading='heading']").html('LOADING BOOK');
			$("*[data-accountgroup='name']").html(headerCollection.accountGroupName);
			$("*[data-accountgroup='info']").html('(AN ISO 9001 : 2008 CERTIFIED COMPANY)');
			$("*[data-branch='address']").html(headerCollection.branchAddress);
			$("*[data-branch='destinationBranch']").html(destBrnachesNameCommaSep);
			
			$(".preloadingSheetPage").each(function(i) {if(i!=0){$(this).addClass("page-break");}});
		} ,renderTableValues:function(chunkArray,className){
			console.log('chunkArray >>', chunkArray)
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
			childwin = window.open ('', 'newwindow', config='height='+height+',width='+width+',left='+left+ ',top='+top+', toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, directories=no, status=no');
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
					//childwin.close();
					doneTheStuff	= false;
					childwin.opener.setValue(doneTheStuff);
				},5000)
			}
		},setSortedSources:function(pendingSheet,finalJsonObj){
			var sourceArray = new Array();
			for(sourceBranch in pendingSheet){
				sourceArray.push(sourceBranch);
			}
			sourceArray = sourceArray.sort(function(a, b) {return a.localeCompare(b);});

			for(var index in sourceArray){
				finalJsonObj.push({
					sourcebranch:sourceArray[index]
				})
				var detsinationcollection = pendingSheet[sourceArray[index]];
				for(var destkey in detsinationcollection){
					finalJsonObj.push(detsinationcollection[destkey]);
				}
			}
		},isValueExistInArray(arr, value) {

			for(var i = 0; i < arr.length; i++) {
				if(arr[i] == value) {
					return true;
				}
			}
			
			return false;
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