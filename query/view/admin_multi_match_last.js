const peliasQuery = require('pelias-query');

module.exports = function (adminFields) {
  const subview = peliasQuery.view.admin_multi_match(adminFields, 'peliasAdmin');

  return (vs) => {

    // check which of the possible admin_properties are actually set
    // from the query
    var valid_admin_properties = adminFields.filter(admin_property => {
      return admin_property &&
        vs.isset('input:' + admin_property) &&
        vs.isset('admin:' + admin_property + ':field');
    });

    if (valid_admin_properties.length === 0) {
      return null;
    }

    // the actual query text is simply taken from the first valid admin field
    // this assumes all the values would be the same, which is probably not true
    // TODO: handle the case where not all admin area input values are the same
    var tokens = vs.var('input:' + valid_admin_properties[0]).get().split(/\s+/g);

    // CUSTOM LOG: Check admin matching
    console.log('[LOCALITY DEBUG] admin_multi_match_last - valid_admin_properties:', valid_admin_properties);
    console.log('[LOCALITY DEBUG] admin_multi_match_last - tokens:', tokens, 'length:', tokens.length);
    console.log('[LOCALITY DEBUG] admin_multi_match_last - last token:', tokens[tokens.length - 1]);

    // no valid tokens to use, fail now, don't render this view.
    if (!tokens || tokens.length < 1) { 
      console.log('[LOCALITY DEBUG] admin_multi_match_last - SKIPPED (no tokens)');
      return null; 
    }
    
    console.log('[LOCALITY DEBUG] admin_multi_match_last - ACTIVE, rendering view');

    // make a copy Vars so we don't mutate the original
    var vsCopy = new peliasQuery.Vars(vs.export());

    adminFields.forEach(field => {
      // set the admin variables in the copy to only the last token
      vsCopy.var(`input:${field}`).set(tokens[ tokens.length -1 ]);
    });

    return subview(vsCopy);
  };
};
