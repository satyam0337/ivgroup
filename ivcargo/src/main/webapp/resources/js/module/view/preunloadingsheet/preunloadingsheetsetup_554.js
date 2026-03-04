define(['elementTemplateJs'],function(elementTemplateJs){
	var rowsPerPage	=90;
	var _this;
	var headerCollection,
	currentDateTime;
	return ({
		renderElements : function(response){
			_this = this;
			var preUnloadingSheetList = response.preUnloadingSheetList;
			
			var sourceObj = new Array();
			
			_.each(preUnloadingSheetList, function(preUnloadingSheet){
				sourceObj.push(preUnloadingSheet.wayBillSourceBranchName);
			});
						
			var uniqSourceBranch = _.uniq(sourceObj);
			
			var sourceWiseColl = new Object();
			var arrList	= null;
			_.each(uniqSourceBranch, function(sourceBranch){
				arrList = _.where(preUnloadingSheetList, {wayBillSourceBranchName: sourceBranch});
				sourceWiseColl[sourceBranch] = arrList;
			});
			
			headerCollection = response.PrintHeaderModel;
			currentDateTime = response.currentDateTime;
			var showDatainTabularFormat	= response.showDatainTabularFormat;
			var finalJsonObj = new Array();
			this.setSortedSources(sourceWiseColl,finalJsonObj);
			this.setDataForView(finalJsonObj,showDatainTabularFormat);
			
		},setDataForView:function(finalJsonObj,showDatainTabularFormat){
			var fileref = document.createElement("link");
			var totalLrNo = 0;
			var noOfArticle = 0;
			fileref.rel = "stylesheet";
			fileref.type = "text/css";
			fileref.href = "/ivcargo/resources/css/module/dispatch/preloadingsheet.css";
			document.getElementsByTagName("head")[0].appendChild(fileref)
			
			
			
				require(['text!/ivcargo/template/preunloading/preunloadingsheet_554.html'],function(PreLoadingSheet){
					
					var chunkArray = finalJsonObj.splitArray(rowsPerPage);
					var TotalCount = Object.keys(chunkArray).length;
					for(var key in chunkArray){
						$("#myGrid").append(PreLoadingSheet);
						_this.renderTable(chunkArray[key]);
						$('.pageInfo').last().html("Page "+(parseInt(key)+parseInt(1))+" of "+TotalCount);
						$('.currentDateTime').last().html(currentDateTime);
					}
					for(var key in finalJsonObj){
				if (finalJsonObj[key].consignmentSummaryQuantity != undefined) {
				noOfArticle += Number(finalJsonObj[key].consignmentSummaryQuantity);
				totalLrNo++;
				}
			}
			
			$('.divTableFoot:not(:last)').each(function(){$(this).empty()});
				$('.summaryinfo:not(:last)').each(function(){$(this).empty()});
				$('.summaryTable:not(:last)').each(function(){$(this).empty()});
				$("*[data-cell='totalLrNo']").html(totalLrNo);
				$("*[data-cell='noOfArticle']").html(noOfArticle);
				$('.noOfArticle').html(noOfArticle);
				$('.totalLrNo').html(totalLrNo);
					
					_this.setHeaderData(headerCollection);
					window.print();
				})
			
		},setHeaderData:function(headerCollection){
			$("*[data-accountgroup='name']").html(headerCollection.accountGroupName);
			$("*[data-branch='name']").html(headerCollection.branchName);
			$("*[data-branch='address']").html(headerCollection.branchAddress);
			$("*[data-branch='phonenumber']").html(headerCollection.branchContactDetailPhoneNumber);
			$("*[data-heading='heading']").html('Pre Loading Sheet');
			
			$(".preloadingSheetPage").each(function(i) {if(i!=0){$(this).addClass("page-break");}});
		},setSortedSources:function(sourceWiseColl,finalJsonObj){
			var sourceArray = new Array();
			for(sourceBranch in sourceWiseColl){
				sourceArray.push(sourceBranch);
			}
			sourceArray = sourceArray.sort(function(a, b) {return a.localeCompare(b);});

			for(var index in sourceArray){
				finalJsonObj.push({
					sourcebranch:sourceArray[index]
				})
				var detsinationcollection = sourceWiseColl[sourceArray[index]];
				for(var destkey in detsinationcollection){
					finalJsonObj.push(detsinationcollection[destkey]);
				}
				
				for(var i=0;(detsinationcollection).length > i;i++) {
				var serialNo= detsinationcollection[i];
					serialNo.srNo = i+1;
				}
			}
			
			
		},renderTable:function(chunkArray){
			var leftDataChunk = chunkArray.splitArray(Math.ceil(chunkArray.length/2));
			for(var leftData in leftDataChunk){
				if(leftData % 2 == 0){
					this.renderTableValues(leftDataChunk[leftData],'.leftdivTableBody');
				}else{
					this.renderTableValues(leftDataChunk[leftData],'.rightdivTableBody');
				}
			}
		},renderTableValues:function(chunkArray,className){
			console.log("chunkArray : " , chunkArray);
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