#!/usr/bin/env bash

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <path to directory containing svg files>"
  exit 1
fi

pushd "$1"

# for each svg or png file
for im in *.svg *.png; do
  if [ ! -f "$im" ]; then
    continue
  fi
  if [[ $im == *.svg ]]; then
    rsvg-convert $im | lp
  else
    lp $im
  fi
done

popd
