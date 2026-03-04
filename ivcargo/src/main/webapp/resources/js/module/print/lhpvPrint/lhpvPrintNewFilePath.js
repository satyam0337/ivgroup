define(function(require) {
	return {
		loadLanguage:function(flavourName) {
			//global variable Language file Path Needs to be present in every HTML file
			let globalLanguageObj = new Object();
			//file path needs to be specified from languages folder
			globalLanguageObj.filePath 		= PROJECT_IVUIRESOURCES+'/resources/data/languages/print/lhpvPrint';
			//file name for language to be specified
			globalLanguageObj.fileName 		= flavourName
			return globalLanguageObj;
		}
	}
});
