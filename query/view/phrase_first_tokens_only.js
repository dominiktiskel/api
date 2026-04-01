const peliasQuery = require('pelias-query');
const toMultiFields = require('./helper').toMultiFields;

/**
  Phrase view which trims the 'input:name' and uses ALL BUT the last token.

  eg. if the input was "100 foo str", then 'input:name' would only be '100 foo'
  note: it is assumed that the rest of the input is matched using another view.
**/

module.exports = function( vs ){
  const view_name = 'first_tokens_only';
  // get a copy of the *complete* tokens produced from the input:name
  const tokens = vs.var('input:name:tokens_complete').get();

  // no valid tokens to use, fail now, don't render this view.
  if( !tokens || tokens.length < 1 ){ return null; }

  // set the 'input' variable to all but the last token
  vs.var(`multi_match:${view_name}:input`).set( tokens.join(' ') );
  var fields = toMultiFields(vs.var('phrase:field').get(), vs.var('lang').get());
  if (vs.isset('ngram:type_field')) {
    fields.push(vs.var('ngram:type_field').get().replace('name.', 'phrase.') + '^0.2');
  }
  vs.var(`multi_match:${view_name}:fields`).set(fields);

  vs.var(`multi_match:${view_name}:analyzer`).set(vs.var('phrase:analyzer').get());
  vs.var(`multi_match:${view_name}:boost`).set(vs.var('phrase:boost').get());
  vs.var(`multi_match:${view_name}:slop`).set(vs.var('phrase:slop').get());

  return peliasQuery.view.leaf.multi_match(view_name)( vs );
};
