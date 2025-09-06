#!/usr/bin/env bash
# Quick test script to POST a sample contact payload to the contact endpoint.
# Usage: ./scripts/test-contact.sh [URL]
# If no URL is provided, it will default to http://localhost:3000/api/contact

URL=${1:-http://localhost:3000/api/contact}

curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"+1234567890","message":"This is a test message from scripts/test-contact.sh"}' \
  | jq '.'
