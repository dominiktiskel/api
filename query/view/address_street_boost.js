/**
  Scoring-only view that boosts venues where the user's search text matches
  address_parts.street. Enables "Biedronka Chorzowska" to prefer the Biedronka
  located on Chorzowska street over one on a different street.

  Uses the full input:name so that any token in the query can match a street.
**/

module.exports = function( vs ){

  if( !vs.isset('input:name') ){
    return null;
  }

  var boost = vs.isset('address:street:boost:query') ?
    vs.var('address:street:boost:query').get() : 5;

  return {
    match: {
      'address_parts.street': {
        query: vs.var('input:name').get(),
        analyzer: 'peliasQuery',
        boost: boost
      }
    }
  };
};
