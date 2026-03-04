/**
 * @author Anant Chaudhary	05-11-2015
 * 
 * Please include this file with GetShortReceiveReport.js and GetPendingShortSettlement.js
 */

function articleDetails(shortNumber, row, data) {

	if(data.shortArticleHMCall) {

		var hm	= data.shortArticleHMCall;

		if(hm.hasOwnProperty(shortNumber)) {

			var list = hm[shortNumber];

			for(var i = 0; i < list.length; i++) {
				var article = list[i];

				var articleType		= article.articleType;
				var totalArticle	= article.totalArticle;
				var saidToContain	= article.saidToContain;
				var shortArticle	= article.shortArticle;
				var damageArticle	= article.damageArticle;

				var articleTypeCol		= createNewColumn(row, 'articleType_'+(i+1), 'datatd', '', '', '', '');
				var tottalArticleCol	= createNewColumn(row, 'totalArticle_'+(i+1), 'datatd', '', '', '', '');
				var saidToContainCol	= createNewColumn(row, 'saidToContain_'+(i+1), 'datatd', '', '', '', '');
				var shortArticleCol		= createNewColumn(row, 'shortArticle_'+(i+1), 'datatd', '', '', '', '');
				var damageArticleCol	= createNewColumn(row, 'damageArticle_'+(i+1), 'datatd', '', '', '', '');

				$(articleTypeCol).append(articleType);
				$(tottalArticleCol).append(totalArticle);
				$(saidToContainCol).append(saidToContain);
				$(shortArticleCol).append(shortArticle);
				$(damageArticleCol).append(damageArticle);
			}
		}
	}
}