define(function(require) {
	return {
		loadLanguage:function(flavourName) {
			//global variable Language file Path Needs to be present in every HTML file
			var globalLanguageObj = new Object();
			//file path needs to be specified from languages folder
			globalLanguageObj.filePath 		= PROJECT_IVUIRESOURCES+'/resources/data/languages/print/branchIncomeVoucherPrint';
			//file name for language to be specified
			globalLanguageObj.fileName 		= flavourName
			return globalLanguageObj;
		}
	}
});