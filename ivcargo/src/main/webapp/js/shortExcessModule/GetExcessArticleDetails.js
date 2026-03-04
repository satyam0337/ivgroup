/**
 * @author Anant Chaudhary	09-11-2015
 */

function excessArticleDetails(data, excessReceiveId) {
	
	if (data.excessReceiveHMCall) {
		var exhm = data.excessReceiveHMCall;
		
		if (exhm.hasOwnProperty(excessReceiveId)) {
			var list = exhm[excessReceiveId];
		
			for (var i = 0; i < list.length; i++) {
				var excessDetails = list[i];
				
				var packingType		= excessDetails.packingType;
				var excessArticle	= excessDetails.excessArticle;
				var saidToContain	= excessDetails.saidToContain;
				var weight			= excessDetails.weight;
				
				var articleJsonObject	= new Object();
				
				articleJsonObject.id	= 'article_'+(i+1);
				
				var artTable	= createTableInHtml('exArticle_'+excessReceiveId, 'pure-table pure-table-bordered articleDetails', '', '', 'display: none');
				
				var artNameRow		= createRowInTable('', '', '');
				var artValueRow		= createRowInTable('', '', '');
				
				var packingTypeNameCol		= createColumnInRow(artNameRow, '', '', '', '', '', '');
				var excessArticleNameCol	= createColumnInRow(artNameRow, '', '', '', '', '', '');
				var saidToContainNameCol	= createColumnInRow(artNameRow, '', '', '', '', '', '');
				var weightNameCol			= createColumnInRow(artNameRow, '', '', '', '', '', '');
				
				var packingTypeValCol		= createColumnInRow(artValueRow, '', '', '', '', '', '');
				var excessArticleValCol		= createColumnInRow(artValueRow, '', '', '', '', '', '');
				var saidToContainValCol		= createColumnInRow(artValueRow, '', '', '', '', '', '');
				var weightValCol			= createColumnInRow(artValueRow, '', '', '', '', '', '');
				
				$(packingTypeNameCol).append('Article Type');
				$(excessArticleNameCol).append('Excess Article');
				$(saidToContainNameCol).append('Said To Contain');
				$(weightNameCol).append('Excess Weight');
				
				$(packingTypeValCol).append(packingType);
				$(excessArticleValCol).append(excessArticle);
				
				if(saidToContain != '') {
					$(saidToContainValCol).append(saidToContain);
				} else {
					$(saidToContainValCol).append('-----');
				}
				
				$(weightValCol).append(weight);
				
				$(artTable).append(artNameRow);
				$(artTable).append(artValueRow);
				
				$('#excessArticleDetails').append(artTable);
			}
		}
	}
}