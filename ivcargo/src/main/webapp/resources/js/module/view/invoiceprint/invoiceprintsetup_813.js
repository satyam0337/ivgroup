define([], function(){	
	return {
		setPopup : function(accountGroupId, data) {
			$('#popUpContent_' + accountGroupId).bPopup({}, function() {
				var _thisMod = this;
				
				$(this).html(`
					<div class='confirm' style='font-size:18px;height:200px;text-align:center;width:300px;color:DodgerBlue;'>
						<b style='font-size:18px;'>Print Option</b><br><br>
						<input type='checkbox' id='branchAddress' checked name='branchAddress' />
						&nbsp;<b style='font-size:16px;'>Print Branch Address</b><br><br>
						<input type='checkbox' id='headOffcAddress'  name='headOffcAddress' />
						&nbsp;<b style='font-size:16px;'>Print HeadOffice Address</b><br><br>
						<button id='cancel'>Cancel</button>
						<button id='print'>Print</button>
					</div>
				`);

				function updateAddressVisibility() {
					const showBranch = $('#branchAddress').is(':checked');
					const showHeadOffice = $('#headOffcAddress').is(':checked');
					
					// Toggle address display based on checkboxes
					$('.hideAddress').toggle(showBranch);
					$('.showAddress').toggle(showHeadOffice);
				}

				$('#branchAddress, #headOffcAddress').on('change', updateAddressVisibility);

				updateAddressVisibility();

				$('#print').off('click').on('click', function () {
					_thisMod.close();
					$("#excelDownLoad").bPopup().close();
					setTimeout(function () {
						window.print();
					}, 200);
				});
				
				$('#cancel').off('click').on('click', function () {
					_thisMod.close();
				});
			});
		}
	}
});
