#!/usr/bin/env bash
# Mark payment_events rows archived using SUPABASE env vars
set -euo pipefail

ORDER_IDS="${ORDER_IDS:-}"
SUPABASE_URL="${SUPABASE_URL:-}"
SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"

if [[ -z "$SUPABASE_URL" || -z "$SUPABASE_SERVICE_ROLE_KEY" ]]; then
  echo "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment"
  exit 1
fi

# list of ids passed inline for this run; replace or accept via env
IDS="2674cefc-a0ac-4160-88d7-dbab0e507f03,c1a33710-abb6-40c6-acb1-79ff39a6d4fd,5c5730c5-bb2c-4e88-b276-115ecadfa132,cc43d972-5314-4759-be39-26c106ab3c90,355ea310-f7a5-4438-a83a-156c1e803a86,9a05fd1e-399f-434c-9fd9-1c610bae2eb9,cace5fb4-72a8-4df3-885a-32133e199c1b,57e6b490-9557-4e13-9842-6f99f2d9d8ed,766fb8d7-1142-41c6-901f-eb9111abda6e,79512e8c-5b90-469f-9a42-b5ed7ae79e02,a3baa0e1-0b12-4045-b9ce-ddb2e3a26c25,2ed25089-cbca-48df-a525-4d98b3122b29,1736717e-9624-4286-8c15-3a64843a530f,7c9f17c8-1573-4ed5-acf5-f442f127ab3a,2261b7e9-753d-46f2-baed-741bf0228038"

# perform PATCH
curl -i -X PATCH "${SUPABASE_URL}/rest/v1/payment_events?id=in.(${IDS})" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"archived":true}'

# verify
curl -s "${SUPABASE_URL}/rest/v1/payment_events?select=id,reference,event_type,archived&order=created_at.desc&limit=200" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" | jq -r '.'
