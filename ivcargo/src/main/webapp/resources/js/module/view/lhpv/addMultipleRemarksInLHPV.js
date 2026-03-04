define(function() {
	let _this = '';
	let textBoxCount = 1;
	return {
		bindElements : function() {
			$("#addMultipleRemarks").on('click', function() {
				_this.addMultipleRemarks();
			});
			
			$("#addNewRemark").on('mouseup keydown', function(event) {
				if(event.type === 'mouseup' || event.type === 'keydown' && event.which === 13)
					_this.addNewRow();
			});
			
			$(".closeModal").on('click', function() {
				_this.resetModal();
			});
			
			$("#btRemove").on('click', function() {
				_this.removeLast();
			});
			
			$('#saveMulRmkBtn').on('click', function() {
				if (_this.validateRemarks()) {
					let remarks = _this.getAllRemarks();

					if (remarks.length > 0) {
						$("#addMultipleRemarksModal").modal("hide");
						_this.resetModal();
						_this.onSaveMultipleRemarks(remarks);
					} else
						showMessage('error', 'Please Enter At Least 1 Remark');
				}
			});
			
			$("#viewMultipleRemarks").on('click', function() {
				$("#viewMultipleRemarksModal").modal({
					backdrop: 'static',
					keyboard: false
				});
			});
			
			$(document).on('input', '[id^="rmk"]', function() {
			    $(this).css('border-color', '');
			});

			_this = this;
		}, addMultipleRemarks : function() {
			$("#addMultipleRemarksModal").modal({
				backdrop: 'static',
				keyboard: false
			});
		}, addNewRow : function() {
			let inputCount = document.getElementById('container').getElementsByTagName('input').length;
			
			for (let i = 0; i < inputCount; i++) {
				$('#rmk' + i).css('border-color', '');
	        }
			
			for(let i = 0; i < inputCount; i++) {
				let remarkVal		= $('#rmk' + i).val();
					
				if(remarkVal == '') {
					showMessage('error', 'Enter Remark');
					$('#rmk' + i).css('border-color', 'red');
					$('#rmk' + i).focus();
					return false;
				}
			}
				
			const rows = $("#multipleRemarksTable tbody tr");
				
			let maxRemarks	= Number(lhpvConfiguration.maxRemarks);
				
			if(inputCount === (maxRemarks - rows.length) || maxRemarks === rows.length) {
				showMessage('error', 'You Have Already Added ' + maxRemarks + ' Remarks !'); return false;
			}
				
			$("#rmk0").clone()
			.val('')
			.removeAttr('id')
			.attr('style', 'margin:3px 0px;')
			.attr('id', 'rmk' + textBoxCount)
			.attr('maxlength', '255')
			.appendTo("#container");
			
			textBoxCount = textBoxCount + 1;
		}, resetModal : function() {
			_this.removeTextValue();
			$('#rmk0').val('');
		}, removeTextValue : function() {
			for(let i = 1; i < textBoxCount; i++) { 
				$('#rmk' + (textBoxCount - i)).remove(); 
			}
			
			textBoxCount = 1;
			$("#addMultipleRemarksModal").modal("hide");
		}, removeLast : function() {
			if(textBoxCount != 1 && textBoxCount > 0) {
				$('#rmk' + (textBoxCount - 1)).remove();
				textBoxCount--;
			}
		}, validateRemarks : function() {
			let allValid = true;
			
			const allowedPattern = /^[a-zA-Z0-9\s.,!?@#\$%\^&*\(\)\-_:;/]*$/;
			
			$('[id^="rmk"]').css('border-color', '');
			
			$('[id^="rmk"]').each(function() {
				let val = $(this).val().trim();
				
				if(!allowedPattern.test(val)) {
					let invalidChars = val.split('').filter(c => !allowedPattern.test(c)).join('');
					let uniqueInvalid = [...new Set(invalidChars)].join(', ');

					$(this).css('border-color', 'red').focus();
					showMessage('error', 'Remark Contains Invalid Characters: ' + uniqueInvalid);
					allValid = false;
					return false;
				}
			});
			
			const rows = $("#multipleRemarksTable tbody tr");
			
			let maxRemarks	= Number(lhpvConfiguration.maxRemarks);
			
			if(rows.length === maxRemarks) {
				showMessage('error', 'You Have Already Added ' + maxRemarks + ' Remarks !');
				allValid = false;
			}
			
			return allValid;
		}, getAllRemarks : function() {
			let remarks = [];
			
			$('[id^="rmk"]').each(function() {
				let val = $(this).val().trim();
				
				if(val !== '')
					remarks.push(val);
			});
					
			return remarks;
		}, onSaveMultipleRemarks : function(remarks) {
			remarks.forEach((element, index) => {
				let columnArray = [];

				columnArray.push("<td style='text-align: center; vertical-align: middle; font-size: 15px;' class='viewRemark'>" + element + "</td>");

				columnArray.push(
					"<td style='text-align: center; vertical-align: middle; font-size: 15px; width:10%'>" +
					"<button class='btn btn-danger glyphicon glyphicon-remove' type='button' onclick='removeRmk(this);' value='Remove'> </button></td>"
				);

				$('#multipleRemarksTable tbody').append('<tr id="rm' + index + '">' + columnArray.join(' ') + '</tr>');
			});
			
			showMessage('success', 'Remarks Added Successfully !');
		}, getFinalRemarksArray : function() {
			return [...$("#multipleRemarksBody .viewRemark")].map(td => td.textContent.trim());
		}
	}
});

function removeRmk (element){
	$(element).closest("tr").remove();
}