# hardened_run.sh — Production-ready wrapper for local execution
# macOS 27.0 (26A428), fm 2.0.68.1.402
mkdir -p ~/.fm/run && chmod 700 ~/.fm/run
fm serve --socket ~/.fm/run/fm.sock &
 
# Token pre-flight check, instruction isolation, and output schema enforcement
DOCUMENT_PATH="inbox/referral_01.txt"
 
if [ "$(fm count-tokens -q --text "$(cat "$DOCUMENT_PATH")")" -lt 7700 ]; then
  fm respond --no-stream --schema triage.json \
    -i 'Summarize the document in three bullet points.' \
    --text "$(cat "$DOCUMENT_PATH")"
else
  echo "Error: Document exceeds safe context limit." >&2
  exit 1
fi