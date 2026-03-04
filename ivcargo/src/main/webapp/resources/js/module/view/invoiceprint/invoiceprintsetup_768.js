var billData
define([], function() {	
	return {
			renderElements: function() {
			this._this = this; // Store reference to 'this'
		},

		printWindow: function(isPdfExportAllow) {
			if (!isPdfExportAllow) {
				hideLayer();
				setTimeout(function() { 
					window.print(); 
					window.close();
				}, 500);
			}
		},
		setPopup: function(accountGroupId, data) {
			let _this = this; // Fix: Assign `_this` to reference the module properly
	  		billData = data.billDataForEMail;
			
			$('#popUpContent_' + accountGroupId).bPopup({
			}, function() {
				let _thisMod = this;
				$(this).html(`
					<div class='confirm' style='height:200px'>
						<h1>Print Option</h1><br>
						<center id='sendEmailButton'><input type='checkbox' name='sendEmail' id='sendEmail' style='font-weight: bold;font-size: 20px;' /> Send Email</center> 
						<br>
						<center><input type='checkbox' name='takePrint' id='takePrint' style='font-weight: bold;font-size: 20px;' checked /> Take Print</center>
						<br><br>
						<button type='button' name='cancel' id='cancel' class='btn-primary'>Cancel</button>
						<button type='button' name='printButton' id='printButton' class='btn-primary' style='margin-left: 50px;'>Print</button>
					</div>
				`);

				$('.confirm').focus();
				$('#printButton').focus();
				
				if(isCRMPage == true || isCRMPage == 'true')
					$("#sendEmailButton").remove();
				
				$("#cancel").click(function() {
					_thisMod.close();
				});

				function sendEmail() {
					_this.generatePdf(billData);
				}

				$("#printButton").click(function() {
					if ($("#sendEmail").is(":checked") && !$("#takePrint").is(":checked")) {
						sendEmail();
						_thisMod.close();
					} else if ($("#sendEmail").is(":checked") && $("#takePrint").is(":checked")) {
						sendEmail();
						_thisMod.close();
						_this.printWindow(); // Fix: Removed `isPdfExportAllow` (was undefined)
					} else if ($("#takePrint").is(":checked") && !$("#sendEmail").is(":checked")) {
						_thisMod.close();
						$("#excelDownLoad").hide()
						_this.printWindow(); // Fix: Removed `isPdfExportAllow` (was undefined)
					}
				});
			});
		},

		generatePdf: function(billData) {			
			let jsonObject2 = new Object();

							$.ajax({
								type: "POST",
								dataType: 'json',
								url: WEB_SERVICE_URL + "/creditorInvoiceWS/validateSessionBeforeRestHit.do",
								data: jsonObject2,
								success: function(response) {
							if (response != undefined && response.validatedSession) {
								if (openInvoicePrintPopUpAfterBkgDly)
									window.close(); // Close the invoice window in both cases

								let filename = 'Invoice_'+billData.billNumber+'.pdf';
								$(".removeLetterSpacing").css("letter-spacing", '10px');

								html2canvas(document.getElementById('mainContent')).then(function(canvas) {
									let imgData = canvas.toDataURL('image/png');
									let height = canvas.height;
									let width = canvas.width;
									let millimeters = {};
										 
									millimeters.width = Math.floor(width * 0.264583);
									millimeters.height = Math.floor(height * 0.264583);
					
									let doc = new jsPDF("p", "mm", [420, 594]);
									
									//doc.addImage(imgData, 'JPEG', 10, 10, millimeters.width, millimeters.height, '', 'FAST');
									doc.addImage(imgData, 'JPEG', 10, 10, 400, 300, '', 'FAST');
									
									let pdfData = doc.output('blob'); // Save the PDF as a Blob
									
									let formData = new FormData();
									formData.append("files", pdfData, filename);
									formData.append("fileName", filename);
									formData.append("billId",  billData.billId);
									formData.append("emailAddress", $('#emailAddress').val());
									formData.append("accountGroupId", response.accountGroupId);
									formData.append("branchId", response.branchId);
									formData.append("executiveId", response.executiveId);
									$(".removeLetterSpacing").css("letter-spacing", '0px');

									let xhr = new XMLHttpRequest();
									xhr.open('POST', '/ivwebservices/creditorInvoiceWS/generateInvoicePrintPdfByBillId.do?', true);
									xhr.onload = function() {
										if (xhr.status === 200) {
											console.log('Email sent successfully!');
										} else {
											console.error('Error sending email.');
										}
									};
									xhr.send(formData);
								  });
								}
							}
						});	
			// Your PDF generation logic here
		},

		
	};
});
