define([  
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,'JsonUtility'
	,'messageUtility'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	], function(UrlParameter) {
	'use strict';// this basically give strictness to this specific js
	let _this = '', jsonObject, deleteAll = false, deletedPdfDetailsIds = [], waybillId = 0, moduleId = 0;
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
			this.$el.html(this.template);
	
			waybillId				= UrlParameter.getModuleNameFromParam(MASTERID);
			moduleId				= UrlParameter.getModuleNameFromParam("moduleId");
		}, render: function() {
			jsonObject				= new Object();
			jsonObject.id			= waybillId;
			jsonObject.moduleId		= moduleId;
			getJSON(jsonObject, WEB_SERVICE_URL+'/uploadPdfDetailsWS/getDownloadPdfDataDetails.do', _this.loadElements, EXECUTE_WITH_ERROR); //submit JSON
			
			hideLayer();
		}, loadElements : function(response) {
			if(response.message != undefined) {
				let successMessage = response.message;
				showMessage(successMessage.typeName, successMessage.typeSymble + '' + successMessage.description);
					
				setTimeout(function() {
					window.close();
				},1500);
			}
				
			let loadelement = new Array();
			let baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/uploadPdfDetails/uploadPdfDetails.html",
					function() {
						baseHtml.resolve();
			});
			
			let pdfDocumentList 	= response.pdfDocumentList;
			let showDeletePdfFiles	= response.showDeletePdfFiles;
			
			$.when.apply($, loadelement).done(function() {
				hideLayer();
				_this.setModel(pdfDocumentList);
				
				if(showDeletePdfFiles)
					$('.deleteId').removeClass('hide');
			
				$("#downloadAllPdf").click(function() {
					_this.downloadPdfAll(pdfDocumentList);
				});
				
				$("#deleteAllPdf").click(function() {
					deleteAll	= true;
					let pdfFinalIds = response.pdfDetailsIds;
					
					if(deletedPdfDetailsIds.length > 0) {
						let idsMap = response.pdfDetailsIds.split(',').map(Number);
						
						idsMap = idsMap.filter(function(id) {
						    return !deletedPdfDetailsIds.includes(id);
						});
						
						pdfFinalIds = idsMap.join(',');
					}
					_this.deletePdfFile(pdfFinalIds, response.pdfDocumentSummaryId);
				});
			});
			
		}, setModel : function(pdfDocList) {
			let tablebody 	= $("#pdfDocumentDetails");
			
			if(pdfDocList != undefined) {
				$('#bottom-border-boxshadow').removeClass('hide');
				
				for(let i = 0; i < pdfDocList.length; i++) {
					let checkCell	= $("<td style='text-align : center'>").text(i + 1);
					let branchCell 	= $("<td>").text(pdfDocList[i].pdfName);
					//view button
					let actionsCell = $("<td>");
					
					let viewButton = $("<button>").text("Download").addClass("btn btn-primary me-2").click(function() {
						$("#images-container").empty();
						downloadDocument(pdfDocList[i].pdfFile, pdfDocList[i].pdfName);
					});
					
					viewButton.css("margin-right", "10px");
			
					let deleteButton = $("<button>").text("Delete").addClass("btn btn-danger hide deleteId").click(function() {
						_this.deletePdfFile(pdfDocList[i].pdfDetailsId + "", pdfDocList[i].pdfSummaryId);
						deletedPdfDetailsIds.push(pdfDocList[i].pdfDetailsId);
					});
			
					actionsCell.append(viewButton, deleteButton);
					//creating new row
					let row = $("<tr id = 'tr_" + pdfDocList[i].pdfDetailsId + "'>");
					row.append(checkCell, branchCell, actionsCell);
					//inserting the row in the table body
					tablebody.append(row);
				}
			} 
		}, downloadPdfAll : function(pdfList) {
			for(const element of pdfList) {
				if(!isValueExistInArray(deletedPdfDetailsIds, element.pdfDetailsId))
					downloadDocument(element.pdfFile, element.pdfName);
			}
		}, deletePdfFile : function(ids, pdfSummaryId) {
			let jsonObj = new Object();
			
			jsonObj.pdfDetailsIds 	= ids;
			jsonObj.pdfSummaryId	= pdfSummaryId;
			getJSON(jsonObj, WEB_SERVICE_URL+'/uploadPdfDetailsWS/deleteUploadedPdfFile.do', _this.onDelete, EXECUTE_WITHOUT_ERROR);
				
			if(deleteAll) {
				setTimeout(function() {
					location.reload();
				}, 500);
			} else
				$('#tr_' + ids).remove();
		}, onDelete : function(response){
			hideLayer();
		}
	});
});
