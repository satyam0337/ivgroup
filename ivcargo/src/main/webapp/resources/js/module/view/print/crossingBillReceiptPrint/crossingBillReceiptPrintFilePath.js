define(function(require) {
	return {
		loadLanguage : function(printFlavor) {
			//global variable Language file Path Needs to be present in every HTML file
			let globalLanguageObj = new Object();
			//file path needs to be specified from languages folder
			globalLanguageObj.filePath 		= PROJECT_IVUIRESOURCES+'/resources/data/languages/print/crossingBillReceiptPrint';
			//file name for language to be specified
			globalLanguageObj.fileName 		= printFlavor
			return globalLanguageObj;
		}
	}
});