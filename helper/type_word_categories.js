/**
 * Maps common Polish type words (lowercased, first word only) to Pelias categories.
 * Used to boost venues in the matching category when the user query contains a type word.
 *
 * Built from cross-referencing openstreetmap/config/type_map_pl.js with category_map.js.
 * Only single first-word tokens are mapped for efficient lookup.
 */

const TYPE_WORD_TO_CATEGORIES = {
  'szpital':        ['health'],
  'klinika':        ['health'],
  'apteka':         ['health'],
  'przychodnia':    ['health'],
  'dentysta':       ['health'],
  'stomatolog':     ['health'],
  'lekarz':         ['health'],
  'drogeria':       ['health'],
  'optyk':          ['health'],

  'restauracja':    ['food'],
  'kawiarnia':      ['food'],
  'cafe':           ['food'],
  'bar':            ['food', 'nightlife'],
  'pub':            ['food', 'nightlife'],
  'pizzeria':       ['food'],
  'kebab':          ['food'],
  'lodziarnia':     ['food'],
  'piekarnia':      ['food'],
  'cukiernia':      ['food'],

  'hotel':          ['accommodation'],
  'hostel':         ['accommodation'],
  'motel':          ['accommodation'],
  'pensjonat':      ['accommodation'],
  'kemping':        ['accommodation'],

  'szkoła':         ['education'],
  'przedszkole':    ['education'],
  'uniwersytet':    ['education'],
  'politechnika':   ['education'],
  'uczelnia':       ['education'],
  'akademia':       ['education'],
  'biblioteka':     ['education', 'entertainment'],
  'muzeum':         ['education', 'entertainment'],
  'teatr':          ['education', 'entertainment'],
  'kino':           ['entertainment', 'nightlife'],
  'galeria':        ['education', 'entertainment'],

  'bank':           ['finance'],
  'bankomat':       ['finance'],
  'kantor':         ['finance'],

  'parking':        ['transport'],
  'dworzec':        ['transport'],
  'stacja':         ['transport'],
  'przystanek':     ['transport'],
  'lotnisko':       ['transport', 'transport:air'],

  'kościół':        ['religion'],
  'parafia':        ['religion'],
  'kaplica':        ['religion'],
  'meczet':         ['religion'],
  'synagoga':       ['religion'],

  'policja':        ['government'],
  'komisariat':     ['government'],
  'urząd':          ['government'],
  'ratusz':         ['government'],
  'sąd':            ['government'],
  'poczta':         ['government'],

  'supermarket':    ['retail'],
  'sklep':          ['retail'],
  'market':         ['retail'],
  'centrum':        ['retail'],

  'park':           ['recreation', 'entertainment'],
  'stadion':        ['entertainment'],
  'basen':          ['recreation'],
  'siłownia':       ['recreation'],
  'fitness':        ['recreation'],
  'boisko':         ['recreation'],
  'lodowisko':      ['recreation'],

  'mechanik':       ['professional'],
  'warsztat':       ['professional'],
  'fryzjer':        ['professional'],
};

module.exports = TYPE_WORD_TO_CATEGORIES;
