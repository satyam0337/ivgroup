define([], function(){	
	return {
		setPopup : function(accountGroupId, configuration) {
				if (configuration.bankDetailsAndQrOptionInMasterPopup)
    				configuration.bankDetailsOptionInMasterPopup = configuration.qrOptionInMasterPopup = false;
					// Normalize conflicting config: Combo mode takes priority over separate Bank & QR
				
				let $popup = 			$('#invoiceMasterPopup_' + accountGroupId);

 				$popup.html(`<div style="font-family: Segoe UI, Arial; width:340px; padding:20px; background:#ffffff; border-radius:8px; box-shadow:0 8px 25px rgba(0,0,0,0.15);">
						    
						 <div style="font-size:22px; font-weight:600; color:#1976d2; margin-bottom:8px;">
						    🖨️ Print Settings
						</div>
						<div style="height:1px; background:#eaeaea; margin-bottom:12px;"></div>

						    <table style="width:100%; border-collapse:collapse; font-size:15px;">
						
						        ${configuration.headerOptionInMasterPopup ? `
						        <tr style="border-bottom:1px solid #eee;">
						            <td style="padding:10px 0; font-weight:600; color:#333;">Header</td>
						            <td style="padding:10px 0; text-align:right;">
						                <label style="margin-right:10px; cursor:pointer;">
						                    <input type="radio" id="withHeader" name="header" > With
						                </label>
						                <label style="cursor:pointer;">
						                    <input type="radio" id="withoutHeader" name="header"> Without
						                </label>
						            </td>
						        </tr>` : ``}
						
						        ${configuration.signatureOptionInMasterPopup ? `
						        <tr style="border-bottom:1px solid #eee;">
						            <td style="padding:10px 0; font-weight:600; color:#333;">Signature</td>
						            <td style="padding:10px 0; text-align:right;">
						                <label style="margin-right:10px; cursor:pointer;">
						                    <input type="radio" id="withSignature" name="signature" > With
						                </label>
						                <label style="cursor:pointer;">
						                    <input type="radio" id="withoutSignature" name="signature"> Without
						                </label>
						            </td>
						        </tr>` : ``}
						
						        ${configuration.bankDetailsOptionInMasterPopup ? `
						        <tr style="border-bottom:1px solid #eee;">
						            <td style="padding:10px 0; font-weight:600; color:#333;">Bank Details</td>
						            <td style="padding:10px 0; text-align:right;">
						                <label style="margin-right:10px; cursor:pointer;">
						                    <input type="radio" id="withBankDetails" name="bank" > With
						                </label>
						                <label style="cursor:pointer;">
						                    <input type="radio" id="withoutBankDetails" name="bank"> Without
						                </label>
						            </td>
						        </tr>` : ``}
						
						        ${configuration.qrOptionInMasterPopup ? `
						        <tr style="border-bottom:1px solid #eee;">
						            <td style="padding:10px 0; font-weight:600; color:#333;">Payment QR</td>
						            <td style="padding:10px 0; text-align:right;">
						                <label style="margin-right:10px; cursor:pointer;">
						                    <input type="radio" id="withQr" name="qr" > With
						                </label>
						                <label style="cursor:pointer;">
						                    <input type="radio" id="withoutQr" name="qr"> Without
						                </label>
						            </td>
						        </tr>` : ``}
						        
						       ${configuration.bankDetailsAndQrOptionInMasterPopup ? `
								<tr style="border-bottom:1px solid #eee;">
								    <td style="padding:10px 0; font-weight:600; color:#333;">
								      Bank + QR
								    </td>
								    <td style="padding:10px 0; text-align:right;">
								        <label style="margin-right:10px; cursor:pointer;">
								            <input type="radio" id="bankDetailsWithQr" name="paymentSection"> Both
								        </label>
								        <label style="cursor:pointer;">
								            <input type="radio" id="bankDetailsWithoutQr" name="paymentSection"> Bank Only
								        </label>
								    </td>
								</tr>` : ``}
						
						        ${configuration.footerOptionInMasterPopup ? `
								<tr style="border-bottom:1px solid #eee;">
						            <td style="padding:10px 0; font-weight:600; color:#333;">Footer</td>
						            <td style="padding:10px 0; text-align:right;">
						                <label style="margin-right:10px; cursor:pointer;">
						                    <input type="radio" id="withFooter" name="footer" > With
						                </label>
						                <label style="cursor:pointer;">
						                    <input type="radio" id="withoutFooter" name="footer"> Without
						                </label>
						            </td>
						        </tr>` : ``}
						        
						       ${configuration.formatWiseOptionInMasterPopup ? `
								  <tr style="border-bottom:1px solid #eee;">
								        <td style="padding:10px 0; font-weight:600; color:#333;">Format Wise</td> 
								    </tr>
								    <tr style="border-bottom:1px solid #eee;">
								        <td style="padding:10px 0; text-align:right;" colspan="2">
								            ${(() => {
								                const formatCount = configuration.formatCountInMasterPopup || 1;
								                let labels = '';
								                for (let i = 1; i <= formatCount; i++) {
								                    labels += `
								                        <label style="margin-right:8px; cursor:pointer;">
								                            <input type="radio" 
								                                   id="format${i}" 
								                                   name="printFormat" 
								                                   value="${i}" > FT-${i}
								                        </label>`;
								                }
								                return labels;
								            })()}
								        </td>
								    </tr>` : ``}

						    </table>
						
						    <div style="margin-top:15px; text-align:right;">
						        <button id="cancel" style="padding:10px 20px; border:1px solid #ccc; background:#f5f5f5; border-radius:4px; cursor:pointer; font-weight:500;">
						            Cancel
						        </button>
						        <button id="ok" style="margin-left:15px; padding:10px 25px; background:#1976d2; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:600;">
						            Print
						        </button>
						    </div>
						
						</div>`);
					
				$popup.bPopup({ }, function() {
				var _thisMod = this;
					 setTimeout(function () {
					        restoreColumnClassesFromFirstTdRow();
					    }, 50);
				function toggleSection(withId, withoutId, sectionClass,headerVisibilityClass) {
				    $('#' + withId).click(function() {
				        $("." + sectionClass).show();
						$("."+headerVisibilityClass).css('visibility', 'visible');
				    });
				
				    $('#' + withoutId).click(function() {
				        $("." + sectionClass).hide();
						$("."+headerVisibilityClass).css('visibility', 'hidden');
				    });
				}
				
				// ================= CONFIG BASE TOGGLE BINDING =================
				
				if (configuration.headerOptionInMasterPopup)
				    toggleSection('withHeader', 'withoutHeader', 'headerSection', 'headerVisibility');
				
				if (configuration.signatureOptionInMasterPopup)
				    toggleSection('withSignature', 'withoutSignature', 'signatureSection', 'signatureVisibility');
				
				if (configuration.footerOptionInMasterPopup)
				    toggleSection('withFooter', 'withoutFooter', 'footerSection', 'footerVisibility');
				
				// ===== Separate Mode (only if combo NOT enabled) =====
				if (configuration.bankDetailsOptionInMasterPopup && !configuration.bankDetailsAndQrOptionInMasterPopup) 
				    toggleSection('withBankDetails', 'withoutBankDetails', 'bankDetailsSection', 'bankDetailsVisibility');
				
				if (configuration.qrOptionInMasterPopup && !configuration.bankDetailsAndQrOptionInMasterPopup) 
				    toggleSection('withQr', 'withoutQr', 'qrSection', 'qrVisibility');

				// call new toggleSection here for more option in future...........
				
				
				
					// ===== COMBO MODE (only when enabled) =====
				if (configuration.bankDetailsAndQrOptionInMasterPopup) {
				
				    // Bank + QR (Both)
				    $('#bankDetailsWithQr').click(function () {
				        $(".bankDetailsSection").show();
				        $(".bankDetailsVisibility").css('visibility', 'visible');
				
				        $(".qrSection").show();
				        $(".qrVisibility").css('visibility', 'visible');
				    });
				
				    // Bank Only
				    $('#bankDetailsWithoutQr').click(function () {
				        $(".bankDetailsSection").show();
				        $(".bankDetailsVisibility").css('visibility', 'visible');
				
				        $(".qrSection").hide();
				        $(".qrVisibility").css('visibility', 'hidden');
				    });
				}

				// ===== FORMAT SWITCHING (Only if enabled) =====
				if (configuration.formatWiseOptionInMasterPopup) {
				
				    // Common function to handle switching
				    function showFormat(formatNumber) {
				        // Sabhi format sections ko ek sath hide kare (using a common class)
       					 $("[class*='format'][class*='Section']").hide();				        
				        // Target format ko show kare
				        $(".format" + formatNumber + "Section").show();
				    }
				
				    // Single event listener (Better Performance)
				    $(document).on('click', 'input[name="printFormat"]', function () {
				        const selectedFormat = $(this).val(); // Maan lijiye value 1, 2, 3 hai
				        showFormat(selectedFormat);
				    });
				}

				

				$("#ok").click(function() {
					_thisMod.close();
					setTimeout(function(){
						window.print();
					},200);
				});

				$("#cancel").click(function() {
					_thisMod.close();
				});
			});
		}
	}
});

// ===== IVEDITOR CLASS RESTORE PATCH ===== // this work  for manual  for making compatible  with ivEditor
function restoreColumnClassesFromFirstTdRow() {

    // jitne bhi format class exist karte h unke parent table detect karna h
    var processedTables = new Set();

    $("[class*='format'][class*='Section']").each(function () {
        var table = $(this).closest("table")[0];
        if (table) processedTables.add(table);
    });

    // har table pe apply karo
    processedTables.forEach(function (tableEl) {
        var $table = $(tableEl);

        // first row jisme td exist karta ho (no th assumption)
        var $firstRow = $table.find("tr").filter(function () {
            return $(this).find("td").length > 0;
        }).first();

        if (!$firstRow.length) return;

        var $firstRowTds = $firstRow.find("td");

        // har column ka class copy karo
        $firstRowTds.each(function (colIndex) {
            var classAttr = $(this).attr("class");

            // agar first row me class hai tabhi propagate karo
            if (classAttr && classAttr.trim() !== "") {

                $table.find("tr").each(function () {
                    var $tds = $(this).find("td");

                    if ($tds.eq(colIndex).length) {
                        var $targetTd = $tds.eq(colIndex);

                        // only set class if empty (safe for manual templates)
                        if (!$targetTd.attr("class") || $targetTd.attr("class").trim() === "") {
                            $targetTd.attr("class", classAttr);
                        }
                    }
                });

            }
        });
    });
}

