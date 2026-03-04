/**
 *  @author Anant Chaudhary	09-11-2015
 */

function shortArticleDetails(data, shortReceiveId) {
	
	if(data.shortArticleHMCall) {

		var hm	= data.shortArticleHMCall;

		if(hm.hasOwnProperty(shortReceiveId)) {

			var list = hm[shortReceiveId];

			for(var i = 0; i < list.length; i++) {
				var article = list[i];

				var articleType		= article.articleType;
				//var totalArticle	= article.totalArticle;
				var shortArticle	= article.shortArticle;
				var damageArticle	= article.damageArticle;
				var shortWeight		= article.shortWeight;
				//var shortAmount		= article.shortAmount;
				var saidToContain	= article.saidToContain;

				var shArtTable				= createTableInHtml('shArticle_'+shortReceiveId, 'pure-table pure-table-bordered articleDetails', '', '', 'display: none');
				
				var shArtNameRow			= createRowInTable('shArtRow_' + shortReceiveId, '', '');
				var shArtValueRow			= createRowInTable('shArtRow_' + shortReceiveId, '', '');
				
				var articleTypeNameCol		= createColumnInRow(shArtNameRow, '', '', '', '', '', '');
				var shortArticleNameCol		= createColumnInRow(shArtNameRow, '', '', '', '', '', '');
				var damageArticleNameCol	= createColumnInRow(shArtNameRow, '', '', '', '', '', '');
				var shortWeightNameCol		= createColumnInRow(shArtNameRow, '', '', '', '', '', '');
				var saidToContainNameCol	= createColumnInRow(shArtNameRow, '', '', '', '', '', '');
				
				var articleTypeCol			= createColumnInRow(shArtValueRow, '', '', '', '', '', '');
				var shortArticleCol			= createColumnInRow(shArtValueRow, '', '', '', '', '', '');
				var damageArticleCol		= createColumnInRow(shArtValueRow, '', '', '', '', '', '');
				var shortWeightCol			= createColumnInRow(shArtValueRow, '', '', '', '', '', '');
				var saidToContainCol		= createColumnInRow(shArtValueRow, '', '', '', '', '', '');
				
				$(articleTypeNameCol).append('Article Type');
				$(shortArticleNameCol).append('Short Article');
				$(damageArticleNameCol).append('Damage Article');
				$(shortWeightNameCol).append('Short Weight');
				$(saidToContainNameCol).append('Said To Contain');

				$(articleTypeCol).append(articleType);
				$(shortArticleCol).append(shortArticle);
				$(damageArticleCol).append(damageArticle);
				$(shortWeightCol).append(shortWeight);
				$(saidToContainCol).append(saidToContain);
				
				$(shArtTable).append(shArtNameRow);
				$(shArtTable).append(shArtValueRow);
				
				$('#shortArticleDetails').append(shArtTable);
			}
		}
	}
}