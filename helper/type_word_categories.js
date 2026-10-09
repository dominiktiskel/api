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

  'лікарня':        ['health'],
  'клініка':        ['health'],
  'аптека':         ['health'],
  'поліклініка':    ['health'],
  'стоматолог':     ['health'],
  'лікар':          ['health'],
  'дрогерія':       ['health'],
  'оптика':         ['health'],

  'ресторан':       ['food'],
  'кавярня':        ['food'],
  "кав'ярня":       ['food'],
  'кафе':           ['food'],
  'бар':            ['food', 'nightlife'],
  'паб':            ['food', 'nightlife'],
  'піцерія':        ['food'],
  'кебаб':          ['food'],
  'морозиво':       ['food'],
  'пекарня':        ['food'],
  'кондитерська':   ['food'],

  'готель':         ['accommodation'],
  'хостел':         ['accommodation'],
  'мотель':         ['accommodation'],
  'пансіонат':      ['accommodation'],
  'кемпінг':        ['accommodation'],

  'школа':          ['education'],
  'дитсадок':       ['education'],
  'університет':    ['education'],
  'політехніка':    ['education'],
  'академія':       ['education'],
  'бібліотека':     ['education', 'entertainment'],
  'музей':          ['education', 'entertainment'],
  'театр':          ['education', 'entertainment'],
  'кіно':           ['entertainment', 'nightlife'],
  'галерея':        ['education', 'entertainment'],

  'банк':           ['finance'],
  'банкомат':       ['finance'],
  'обмінник':       ['finance'],

  'парковка':       ['transport'],
  'вокзал':         ['transport'],
  'станція':        ['transport'],
  'зупинка':        ['transport'],
  'аеропорт':       ['transport', 'transport:air'],

  'церква':         ['religion'],
  'парафія':        ['religion'],
  'каплиця':        ['religion'],
  'мечеть':         ['religion'],
  'синагога':       ['religion'],

  'поліція':        ['government'],
  'відділок':       ['government'],
  'управа':         ['government'],
  'ратуша':         ['government'],
  'суд':            ['government'],
  'пошта':          ['government'],

  'супермаркет':    ['retail'],
  'магазин':        ['retail'],
  'маркет':         ['retail'],
  'центр':          ['retail'],

  'парк':           ['recreation', 'entertainment'],
  'стадіон':        ['entertainment'],
  'басейн':         ['recreation'],
  'спортзал':       ['recreation'],
  'фітнес':         ['recreation'],
  'майданчик':      ['recreation'],
  'ковзанка':       ['recreation'],

  'механік':        ['professional'],
  'майстерня':      ['professional'],
  'перукар':        ['professional'],
};

module.exports = TYPE_WORD_TO_CATEGORIES;
