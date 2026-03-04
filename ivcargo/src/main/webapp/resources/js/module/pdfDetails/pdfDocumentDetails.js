var pdfDataObject = null;
var uploadPdfInPod = false;
var maxFileSizeToAllow = 1024;
let pdfFileArr = new Array();


function openPdfModel(noOfFileToUpload) {

	$('#pdfSelection').empty();
	$('#pdfSelection').html('');
	pdfFileArr = []
	$("#modalForOpenPdf").modal({
		backdrop: 'static',
		keyboard: false,
		okCloses: true
	});
	var noOfFileToUpload = noOfFileToUpload;

	for (let i = 1; i <= noOfFileToUpload; i++) {
		pdfFileArr.push({
			elementId: 'document_' + i,
			elementName: 'document_' + i,
			elementType: 'file',
			tooltipName: 'Select File',
			labelValue: 'Label for document_' + i,
			showLabel: true,
			labelCss: 'file-label',
			labelId: 'label_' + i,
		});
	}

	// Create the final HTML structure
	var $finalHTML = $("<div></div>");
	let $divElement = $("<div></div>").addClass("row").attr("id", "pdfDiv");

	pdfFileArr.forEach(file => {
		let elementObject = file;
		let elementImage = `<i class='${elementObject.elementGlyphicon}'></i>`;

		elementObject.elementImageTag = elementImage;
		elementObject.labelTag = "";

		// Create the file input element
		$divElement.append(`
                <div class="col" style="margin:15px;">
					${elementObject.labelTag}
					${elementObject.elementImageTag}
					<input type="file" id="${elementObject.elementId}" class="form-control col-md-6" style="width:80%;" name="${elementObject.elementName}" accept="application/pdf" />
					<button class="delete-btn btn btn-danger" id="delete_${elementObject.elementId}">Delete</button>
					<iframe id="iframe_${elementObject.elementId}" style="display:none; width: 350px; height: 150px;" frameborder="0"></iframe>
				</div>
  			`);

		// Event listener to display the PDF
		$divElement.on('change', `#${elementObject.elementId}`, function(event) {
			const file = event.target.files[0];
			if (file) {
				const fileURL = URL.createObjectURL(file);
				$(`#iframe_${elementObject.elementId}`).attr('src', fileURL).show();
			}
		});

		// Event listener for delete button
		$divElement.on('click', `#delete_${elementObject.elementId}`, function() {
			$(`#${elementObject.elementId}`).val(''); // Clear the file input
			$(`#iframe_${elementObject.elementId}`).hide(); // Hide the iframe

		});
	});

	$finalHTML.append($divElement);

	// Append $finalHTML to your desired container
	$('#pdfSelection').append($finalHTML);


	if (!validateFileTypeAndSizeForUploadPdf(noOfFileToUpload, maxFileSizeToAllow))
		return;
}

function hideIdPdfDetailsModel() {
	$('#modalForOpenPdf').modal('hide');
}
function addPDFDetailsData() {
	if (!validateData())
		return false;
	let $inputs = $('#pdfDiv :input');
	pdfDataObject = new Object();

	$inputs.each(function(index) {
		if ($(this).val() != "") {
			let fileName = $(this).attr('name');
			let nameArr = fileName.split('_');
			let pdfFileName = "pdfFileName_" + nameArr[1];

			if (this.files && this.files[0]) {
				let FR = new FileReader();
				pdfDataObject[pdfFileName] = this.files[0]['name']

				FR.addEventListener("load", function(e) {
					pdfDataObject[fileName] = e.target.result;
				});

				FR.readAsDataURL(this.files[0]);
			}
		}
	});
	hideIdPdfDetailsModel()

}

function validateData() {
	let totalFile = 0;
	let jsonObjectNew = new Object();
	let $inputs = $('#pdfSelection :input');
	//this will iterate all elements and will set the name as key and value of Element as value in jsonObject
	$inputs.each(function(index) {
		if ($(this).val() != "") {

			totalFile++;
		}
	});

	if (totalFile == 0) {
		showMessage('error', 'Please, Select atleast 1 PDF File!');
		return false;
	}

	return true;
}