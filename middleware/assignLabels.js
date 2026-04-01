const _ = require('lodash');

const defaultLabelGenerator = require('pelias-labels');

function setup(labelGenerator) {
  function middleware(req, res, next) {
    return assignLabel(req, res, next, labelGenerator || defaultLabelGenerator);
  }

  return middleware;
}

function assignLabel(req, res, next, labelGenerator) {

  // do nothing if there's nothing to process
  if (!res || !res.data) {
    return next();
  }

  res.data.forEach(function (result) {
    var label = labelGenerator(result, _.get(req, 'clean.lang.iso6393'));

    if (result.layer === 'venue' && result.address_parts && result.address_parts.street) {
      var street = result.address_parts.street;
      var parts = label.split(', ');
      if (parts.length >= 2 && parts[1] !== street) {
        parts.splice(1, 0, street);
        label = parts.join(', ');
      }
    }

    result.label = label;
  });

  next();
}

module.exports = setup;
