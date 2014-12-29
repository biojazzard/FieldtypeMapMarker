cd "$(dirname "$0")"
uglifyjs MarkupGoogleMap.js -o MarkupGoogleMap.min.js --source-map MarkupGoogleMap.min.js.map
