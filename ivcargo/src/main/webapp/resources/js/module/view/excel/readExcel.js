let partyAndBranchWiseAddRateMaster = false;

define([  'JsonUtility'
		  ,'messageUtility'
		  ,'slickGridWrapper2'
		  ,'nodvalidation'
		  ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		  ,'focusnavigation'//import in require.config
		  ],function() {
	'use strict';
	let myNod, _this = '', uploadExcelTypeMap = null;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			let jsonObject = new Object();
			getJSON(jsonObject, WEB_SERVICE_URL + '/readExcelWS/loadForExcelFile.do?', _this.setDataElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setDataElements : function(response) {
			let errorMessage = response.message;
			
			if(errorMessage != undefined)
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			
			let loadelement = new Array();
			let baseHtml	= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/excel/readExcel.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				hideLayer();
				
				let readExcelProperties	= response;
				uploadExcelTypeMap = response.uploadExcelTypeMap;
				
				partyAndBranchWiseAddRateMaster	= readExcelProperties.partyAndBranchWiseAddRateMaster;

				if(!readExcelProperties.gstStatusUpdate)
					$('#gstStatusUpdate').remove();
				
				let validFileTypeAndSize	= _this.validateFileTypeAndSize();
				
				if(!validFileTypeAndSize)
					return;
				
				$("#gstStatusUpdate").click(function() {
					if(_this.validate())
						_this.gstStatusUpdate();
				});
				
				if(response.isSelection)
					_this.setUploadTypeDropDown();
				else {
					$('#uploadExcelTypeDiv').remove();
					$('#uploadExcelBtn').remove();
				}
				
				if(!response.isRegionPermission)
					$('#downloadBranchDataExcel').remove();
				
				$("#downloadBranchDataExcel").click(function() {
					_this.downloadBranchDataExcel();
				});

				$("#uploadExcelType").on("change", function () {
				    if($(this).val() == 9 || $(this).val() == 10)
						$('#downloadBranchDataExcel').removeClass('hide');
					else
						$('#downloadBranchDataExcel').addClass('hide');
				});

				$("#uploadExcelBtn").click(function() {
					if(_this.validate())
						_this.uploadExcel($('#uploadExcelType').val());
				});
			});
		}, setUploadTypeDropDown : function () {
			$('#uploadExcelType').find('option').remove().end();
			
			if(Object.keys(uploadExcelTypeMap).length > 1)
				$('#uploadExcelType').append('<option value="' + 0 + '" id="' + 0 + '">-- Select Excel Type--</option>');

			Object.entries(uploadExcelTypeMap).forEach(([key, value]) => {
				$('#uploadExcelType').append(
					'<option value="' + key + '" id="' + key + '">' + value + '</option>'
				);
			});
		}, validateFileTypeAndSize : function() {
			$('#uploadExcelEle').bind('change', function() {
				if (this.files && this.files[0]) {
					let sFileName		= this.files[0].name;
					let sFileExtension	= sFileName.split('.')[sFileName.split('.').length - 1].toLowerCase();
						
					if(!(sFileExtension === 'xls' || sFileExtension === 'xlsx')) {
						showMessage('info', 'Please, Select valid Excel File !');
						$.trim($(this).val(''));
						return false;	
					}
				}
					
				return true;
			});
			
			return true;
		}, validate : function() {
			if($('#uploadExcelEle').val() == '') {
				showMessage('error', 'Please, Select Excel File !');
				return false;
			}
			
			return true;
		}, gstStatusUpdate : function() {
			let btModalConfirm = new Backbone.BootstrapModal({
				content		:	"Are you sure you want to Upload Excel For Update Gst Status ?",
				modalWidth	:	30,
				title		:	'Upload Excel',
				okText		:	'YES',
				showFooter	:	true,
				okCloses	:	true
			}).open();
				
			let form = $('#fileUploadForm')[0];
			let data = new FormData(form);
					
			btModalConfirm.on('ok', function() {
				showLayer();
				$.ajax({
					type	: "POST",
					enctype	: 'multipart/form-data',
					url		: WEB_SERVICE_URL+'/readExcelWS/readExcelFileUpdateGstStatus.do?&readFile=true&filter=6&isReadExcelFile=true',
					data	: data,
					processData: false, //prevent jQuery from automatically transforming the data into a query string
					contentType: false,
					cache: false,
					// timeout: 600000,
					success: function (data) {
						console.log("SUCCESS : ", data);
						_this.setResponse(data);
						hideLayer();
					},
					error: function (e) {
						$("#result").text(e.responseText);
						if (typeof btModalConfirm !== 'undefined' && btModalConfirm != null) {
							btModalConfirm.close();
						}
						hideLayer();
						console.log("ERROR : ", e);
					}
				});
			});
		}, downloadBranchDataExcel : function() {
			showLayer();
			let jsonObject = new Object();
			getJSON(jsonObject, WEB_SERVICE_URL + '/readExcelWS/getDataForExcel.do?', _this.generateDataExcel, EXECUTE_WITHOUT_ERROR);
		}, uploadExcel: function() {
			let filter = Number($('#uploadExcelType').val());
			
			if (filter == 0) {
				showAlertMessage("error", "Please, Select Upload Excel Type !")
				return;
			}

			let btModalConfirm = new Backbone.BootstrapModal({
				content		:	"Are you sure you want to Upload Excel For " + uploadExcelTypeMap[filter]+" ?",
				modalWidth	:	30,
				title		:	'Upload Excel',
				okText		:	'YES',
				showFooter	:	true,
				okCloses	:	true
			}).open();
			
			let form = $('#fileUploadForm')[0];
			let data = new FormData(form);
			
			btModalConfirm.on('ok', function() {
				showLayer();
				$.ajax({
					type	: "POST",
					enctype	: 'multipart/form-data',
					url: `${WEB_SERVICE_URL}/readExcelWS/readExcelFile.do?&readFile=true&filter=${filter}&isReadExcelFile=true`,
					data	: data,
					processData: false, //prevent jQuery from automatically transforming the data into a query string
					contentType: false,
					cache: false,
					// timeout: 600000,
					success: function (data) {
						console.log(`SUCCESS (filter=${filter}) : `, data);
						_this.setResponse(data);
						hideLayer();
					},
					error: function (e) {
						$("#result").text(e.responseText);
						console.log(`ERROR (filter=${filter}) : `, e);
						
						if (typeof btModalConfirm !== 'undefined' && btModalConfirm != null)
							btModalConfirm.close();
						
						hideLayer();
						console.log("ERROR : ", e);
					}
				});
			});
		}, generateDataExcel : function(response){
			generateFileToDownload(response);
			hideLayer();
		}, setResponse : function(response) {
			let response1	= jQuery.parseJSON(response);
			if(response1.message != undefined) {

				hideLayer();
				let errorMessage = response1.message;

				if(errorMessage.type == 2) {
					sweetAlert({
						 title: "Error",
						 text: errorMessage.description,
						 showCancelButton: true,
						 showConfirmButton: false,
					});
					$('#uploadExcelEle').val('');
				} else {
					if(errorMessage.type == 1 && errorMessage.messageId == 0)
						_this.openErrorScreen(errorMessage.description);
					else
						sweetAlert({
							 title: "Success",
							 text: errorMessage.description,
							 showCancelButton: true,
							 showConfirmButton: false,
						});
					
					$('#uploadExcelEle').val('');
					$('#uploadExcelType').val(0);
				}
			}
			
		}, openErrorScreen : function (errorText) {
            const win = window.open('', '_blank'),
                rows = errorText.split('\n').filter(r => r.trim());

            win.document.write(`
			<html>
				<head>
					<title>Excel Validation Errors</title>
					<style>
						body{font-family:Arial;background:#f4f6f8;padding:20px}
						h2{color:#c0392b}
						table{width:100%;border-collapse:collapse;background:#fff}
						th,td{border:1px solid #ddd;padding:8px;vertical-align:top}
						th{background:#2c3e50;color:#fff}
						tr:nth-child(even){background:#f9f9f9}
						.row{color:#d35400;font-weight:bold}
					</style>
				</head>
				<body>
					<h2>Excel Upload Errors</h2>
					<b>Total Error Rows: ${rows.length}</b>
					<table>
						<tr><th>#</th><th>Row</th><th>Error Details</th></tr>
						${rows.map((r, i) => {
                const [row, ...msg] = r.split(':');
                return `<tr><td style="width: 40px;">${i + 1}</td><td class="row" style="width: 250px;">${row}</td><td>${msg.join(':')}</td></tr>`;
            }).join('')}
					</table>
				</body>
			</html> `);

            win.document.close();
        }
	});
});
