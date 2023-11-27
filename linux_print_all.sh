#!/usr/bin/env bash

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <path to directory containing svg files>"
  exit 1
fi

pushd "$1"

for im in $(ls -v *.svg); do
  ## sending all in one job was failing (too big?) prints each one separately
  rsvg-convert $im | lp
done

popd
