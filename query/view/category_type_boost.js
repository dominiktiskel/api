/**
  Scoring view that boosts documents whose category matches the detected
  type word in the user's query. For example, querying "Szpital Katowice"
  should prefer venues in the 'health' category over bus stops named "Szpital".
**/

const TYPE_WORD_TO_CATEGORIES = require('../../helper/type_word_categories');

module.exports = function( vs ){

  if( !vs.isset('input:name:tokens_complete') && !vs.isset('input:name:tokens_incomplete') ){
    return null;
  }

  var tokens = [];
  if( vs.isset('input:name:tokens_complete') ){
    tokens = tokens.concat( vs.var('input:name:tokens_complete').get() || [] );
  }
  if( vs.isset('input:name:tokens_incomplete') ){
    tokens = tokens.concat( vs.var('input:name:tokens_incomplete').get() || [] );
  }

  if( !tokens.length ){ return null; }

  var matchedCategories = new Set();
  tokens.forEach(function(token){
    var lower = token.toLowerCase();
    var cats = TYPE_WORD_TO_CATEGORIES[lower];
    if( cats ){
      cats.forEach(function(c){ matchedCategories.add(c); });
    }
  });

  if( matchedCategories.size === 0 ){ return null; }

  return {
    constant_score: {
      filter: {
        terms: {
          category: Array.from(matchedCategories)
        }
      },
      boost: 8
    }
  };
};
