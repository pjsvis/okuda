The night shift is quiet, save for the hum of cooling fans and the slow chime of the quarter-hour bell from the cloister tower. The Lead Engineer / Scholar turns from the desk, setting down an empty mug of tea, and looks toward the terminal. In centuries past, a simple call to an attendant would fetch the quires; tonight, there is no one else in the room. To reach into the archives, the researcher must act as their own *armarius* and speak directly to the machine in its own dialect.

**Initial Request:**
*"Fetch me all work we did on speech synthesis over SSH during August 2026. Don't bother with the briefs, just get the downsttream stuff."*

---

### Dual-Time Narrative: Systems Operator / Armarius

* **Grammar Translation & Input:**
The Lead Engineer / Scholar sits before the screen, translating the spoken request into the constraints of Gloam's two-filter query syntax:


```text
!(briefs/) (debriefs/|decisions/|docs/) 2026-08 speech ssh

```


* **Display Filtering:**
Gloam applies structural exclusion to drop the `briefs/` silo while filtering candidate records against the disjoint keywords, displaying the matching set in the candidate list:


* `decisions/013-ssh-serving-forcecommand.md`

* `debriefs/2026-08-27-debrief-ssh-forcecommand-feasibility.md`

* `docs/2026-08-29-deterministic-speech-rendering.md`

* `docs/2026-08-30-voice-actuator-testing.md`



* **Document Selection:**
Acting as Systems Operator / *Armarius*, the user highlights `decisions/013-ssh-serving-forcecommand.md` and submits the selection.


* **Rendering & Actuator Inspection:**
Gloam renders the record within the active frame. Alongside embedded document references, silcrows appear in the margins, each displaying its designated actuator indicator to show which rendering subsystem handles the referenced record.


* **De-reference & View Update:**
The Systems Operator / *Armarius* strikes key token `2`. Gloam resolves the link bound to that silcrow, de-references the target document, and renders it directly inside the current frame.