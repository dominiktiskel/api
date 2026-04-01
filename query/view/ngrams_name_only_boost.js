const toMultiFields = require('./helper').toMultiFields;

/**
  Scoring-only view that matches input:name against name.default (and name.{lang})
  WITHOUT including name.type. Used as a 'should' clause to give higher scores to
  documents where the search term appears in the actual name rather than only in a
  type alias (e.g., "Szpital" from amenity=hospital).
**/

module.exports = function( vs ){

  if( !vs.isset('input:name') || !vs.isset('ngram:field') ){
    return null;
  }

  var boost = vs.isset('ngram:name_only_boost') ? vs.var('ngram:name_only_boost').get() : 50;

  var fields = toMultiFields(vs.var('ngram:field').get(), vs.var('lang').get());

  return {
    multi_match: {
      type: 'phrase',
      fields: fields,
      query: vs.var('input:name').get(),
      analyzer: vs.var('ngram:analyzer').get(),
      boost: boost,
      slop: vs.var('phrase:slop').get()
    }
  };
};
