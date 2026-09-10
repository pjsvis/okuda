# say tts tips & tricks,,,,,,

The **say** command is the built-in macOS Terminal tool for text-to-speech: ,,

- **to speak immediately** ,,,, use `say "Hello world"` ,,,,,,
- **to change the voice** ,,,, use `say -v Samantha "Hi"` ,,,,,,
- **to read a file** ,,,, use `say -f filename.txt` ,,,,,,
- **to save audio** ,,,,  use `-o output.aiff` ,,,,,,

## Voice Selection and Listing

*   **List all voices:** ,,,, `say -v '?'`,,,,,, 

## Audio Output Control
,,,,,,
*   **to Save as A I F F Audio File:** ,,,, use `say -o file.aiff "Text"` ,,,,,,
*   **to Save as A A C Audio File:** ,,,, use `say -o file.m4af` ,,,,,, 
*   **to Adjust Speed:** ,,,, use `say --rate 200 "Speak fast"` ,,,,,, 
*   **to Pause with Commas:** ,,,, use `say "Hello,,,, how are you?"` ,,,,,, 
*   **to Highlight Text:** ,,,, use `-i` to print text line-by-line in the terminal ,,,,,, 

## Advanced Usage
*   **Read from Standard Input:**  `echo "Hello" | say -f -`.
*   **Audio Device Outpu:** `say -a DeviceName "Hello"` and list devices with `say -a '?'` 
*   **Quality:** `say --quality 127` for highest fidelity

## Common Shortcuts (GUI)
*   **Speak Selection:** Enable in **System Settings > Accessibility > Spoken Content**. Highlight text and press **Option + Esc** (default) to hear it.
*   **Dictation:** Press **Fn** twice to speak text into any field (Speech-to-Text).

## Troubleshooting
*   **No Sound:** Ensure volume is up and the correct audio device is selected.
*   **Personal Voice Not Working:** Terminal lacks permission by default; grant it via a GUI interaction or a custom permission-granting script.
*   **Voice Not Found:** Verify the voice is installed via **System Settings > Accessibility > Spoken Content > Manage Voices**.