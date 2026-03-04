var wayBillId;
define([], function() {	
	return {
		renderElements: function() {
			this._this = this; // Store reference to 'this'
		},

		// ✅ Function to Get URL Parameters (Moved Inside Module)
		getUrlParameter: function(paramName) {
			let params = new URLSearchParams(window.location.search);
			return params.get(paramName);
		}, printWindow: function(isPdfExportAllow) {
			if (!isPdfExportAllow) {
				hideLayer();
				setTimeout(function() { 
					window.print(); 
					window.close();
				}, 500);
			}
		}, showPopUp: function(responseOut, isPdfExportAllow) {
			wayBillId = responseOut.wayBillId;
			// ✅ Get `isRePrint` from URL
			hideLayer();
			let _this = this; // Ensure _this is assigned within this function scope

			$('#popUpContentForEmail').bPopup({}, function() {
				$(".removeChargest").hide();
				let _thisMod = this;

				$(this).html(`
					<div class='confirm' style='height:200px'>
						<h1>Print Option</h1><br>
						<center><input type='checkbox' name='sendEmail' id='sendEmail' style='font-weight: bold;font-size: 20px;' /> Send Email</center> 
						<br>
						<center><input type='checkbox' name='takePrint' id='takePrint' style='font-weight: bold;font-size: 20px;' checked /> Take Print</center>
						<br><br>
						<button type='button' name='cancel' id='cancel' class='btn-primary'>Cancel</button>
						<button type='button' name='printButton' id='printButton' class='btn-primary' style='margin-left: 50px;'>Print</button>
					</div>
				`);

				$('.confirm').focus();
				$('#printButton').focus();

				$("#cancel").click(function() {
					_thisMod.close();
					_this.printWindow(isPdfExportAllow);
				});

				function sendEmail() {
					_this.generatePdf();
				}

				$("#printButton").click(function() {
					if ($("#sendEmail").is(":checked") && !$("#takePrint").is(":checked")) {
						sendEmail();
						_thisMod.close();
					} else if ($("#sendEmail").is(":checked") && $("#takePrint").is(":checked")) {
						sendEmail();
						_thisMod.close();
						_this.printWindow(isPdfExportAllow);
					} else if ($("#takePrint").is(":checked") && !$("#sendEmail").is(":checked")) {
						_thisMod.close();
						_this.printWindow(isPdfExportAllow);
					}
				});
			});
		}, generatePdf: function() {
			let _this = this; // Fix: Assign _this inside the function to ensure proper reference
            $("#header").css('display', 'block');
			$(".dataPdf").hide();
			$(".transportname").hide();
			$(".carriergst").show();
			$(".removeLetterSpacing").css("letter-spacing", '10px !important');
			$("table").attr("border", "1");
			$("table").css("width", "100%");
			$("#copy1").css("margin-top", "0px");
			$("#copy2").hide();
			$("#copy3").hide();
			let jsonObject = {
				waybillId: wayBillId,
				lrPrint: $("#mainContent").html()
			};
			
			$("#header, #headerpdfimg").hide();
			$(".dataPdf").show();
			$(".transportname").show();
			$(".carriergst").hide();
			$(".removeLetterSpacing").css("letter-spacing", '0px !important');
			$("table").removeAttr("border"); // Removes the border attribute
			$("table").css("width", ""); // Resets the width to default
			$("#copy1").css("margin-top", "115px");
			$("#copy2").show();
			$("#copy3").show();
			$("#header").show();
			$("#header").attr('src', '768.jpg');
			// Call the API to generate PDF
			getJSON(jsonObject, WEB_SERVICE_URL + '/lrPrintWS/generateLRPrintPdfBywayBillId.do?', _this.getResponse, EXECUTE_WITHOUT_ERROR);
		}, getResponse: function() {
			hideAllMessages();
		}
	};
});
