# Claude Code follow-up | NADI Muallim V3 competition film

Revise the existing 120-second NADI Muallim project and render a new MP4. Work from the editable sources in the current Claude Code workspace. This pass focuses on the opening, the manual-to-phone handoff, selected animation from the 90-second cut, and the narration mix. Keep the film at exactly 02:00. Save a V3 copy of the player and MP4 so the previous exports remain available for comparison.

## Inputs and priorities

- Use NADI-Muallim-120s.mp4 and its 120-second HTML player, uploaded as "video-showcase (1).html", as the current edit reference. Identify local copies by runtime and contents if filenames differ.
- Use e-ACD-Denggi-Pitch.mp4 and its original 90-second source or player as the motion and music reference. Check the existing project and prior Claude Code workspace before recreating an asset.
- Locate narration-bm.wav, subtitles-bm.srt and voiceover-script-bm.md in the supplied NADI_Muallim_Voiceover_120s folder or ZIP. The WAV is the 120-second Malaysian Malay voiceover already prepared. Its 19 supplied subtitle cues govern speech timing. Use the V3 visual timings below for this revision. The uploaded 120-second player contains 27 cues from a different script. Replace that cue set with the 19 supplied cues, then check their boundaries against the WAV.
- Keep the video build offline. Use the existing artwork, simulated datasets, device mockups and reusable frame-seek and export pipeline. Treat the operational e-ACD HTML, Apps Script, Sheets and NADI data as read-only references. Make all changes in the film project.
- The current MP4 has a 48 kHz AAC track whose waveform matches the HTML's generated music and effects. Use the supplied WAV in the final mix and verify that the rendered track contains that narration. Surface an actionable missing-file or render error if it prevents a narrated export.

## Footage to reference

| Original 90-second MP4 | What to adapt | Where it belongs in V3 |
| --- | --- | --- |
| 00:00.00 to 00:03.80 | Dark district map, restrained pin pulse over Kg. Ketoyong, drone and paired heartbeat. | 00:00.00 to 00:04.00 |
| 00:03.90 to 00:15.30 | Paper, tally and re-entry focus changes. The riser builds to an impact at about 00:14.95. | 00:04.00 to 00:13.20 for the manual process. Retime the impact to the NADI title reveal at about 00:13.35. |
| 00:56.80 to 01:07.50, especially 00:59.92 | Angled phone and desktop together, device depth, lighting and a controlled pullback. | 01:02.00 to 01:04.50 for the device reveal, then settle for the coverage reading. |
| 01:10.65 to 01:14.10, especially 01:11.83 | One visual path from the phone through Apps Script to cells filling in Google Sheets. | 00:55.00 to 01:02.00 after the saved visit is shown. |
| 01:22.60 to 01:25.30, especially 01:24.27 | Icon cards arrive in sequence and can be read as one row. | 01:45.00 to 01:52.35, with updated NADI wording. |

Reuse the motion and sound design from these references. Use the V3 data, captions and branding for the new shots. The 90-second device shot at 00:59.92 displays 68/110 (62%) while the caption reads 92/110. In V3, set every surface to the same final aggregate before the 92/110 cue.

## V3 edit and audio timing

| Time in V3 | Visual and sound direction |
| --- | --- |
| 00:00.00 to 00:04.00 | Start on the dark illustrative Muallim map. Give the Kg. Ketoyong marker one purposeful pulse and a slow push-in. Show the question "Premis mana yang masih perlu dilawati?" as the first spoken line starts around 00:00.92. Make the locality and the question readable at a glance. Lead with the low drone and paired pulse from the old intro. Keep the map clearly illustrative and label the scenario DATA SIMULASI. |
| 00:04.00 to 00:09.20 | Bring the ACD form and file into focus as the narrator mentions them. Use a short cut to the physical form or the existing paper-in-motion animation. Keep the whole composition anchored to one focal element at a time. |
| 00:09.20 to 00:13.20 | Put the tally in focus on "dikira", then move the focus to a laptop cell on "ditaip semula". A short typing beat should finish by 00:11.85. Hold the completed entry until the subtitle ends around 00:12.33, then give the viewer a short pause. Let the riser build behind this beat. |
| 00:13.20 to 00:16.80 | Clear the manual scene and reveal "NADI Muallim" and "Dari Survelan ke Respons Denggi". Use the teal light, type hierarchy and lockup treatment of the current closing scene. Place one controlled impact near 00:13.35. Allow the title to settle by 00:13.80 and hold it until the dashboard cut. |
| 00:16.80 to 00:24.30 | Show a clean Kg. Ketoyong locality card as "NADI Muallim memaparkan situasi denggi mengikut lokaliti" begins. Reduce browser chrome and dense GIS detail in the crop. Show "Buka Operasi ACD" as the prototype action during the next line. Put PROTOTAIP INTEGRASI on the handoff. Activate the control around 00:24.10. |
| 00:24.30 to 00:33.00 | Bring in the e-ACD phone on a shallow three-quarter angle. Use a single match cut or short dissolve from the locality card to the phone, keep the same locality visible and open the form. Settle by about 00:25.60. Hold the line "Cukup satu telefon untuk rekod ACD" beside the phone. |
| 00:33.00 to 00:49.00 | Follow Pasukan 1 at Premis Contoh 012. Show status, screening and the recorded referral in the same readable area while the narration describes them. Keep the phone nearly front-on for the fields. During the pause after the one-phone message, allow a brief Bahagian C insert if it fits and can be read. |
| 00:49.00 to 00:55.00 | Show the save action close to the supplied "Selepas rekod disimpan" cue at 00:49.32. Hold "Rekod disimpan" and let the automatic count update. Allow at least four seconds for the result to be read before switching shots. |
| 00:55.00 to 01:02.00 | Restore the phone-to-Sheets shot. Begin with the saved state on the left. Move one set of animated data dots through a compact Google Apps Script node. Let the highlighted "Hasil ACD" cells settle and hold the resulting state. Use the short on-screen line "Dapatan diselaraskan apabila sambungan tersedia". The narration about time saved preparing the summary falls around 00:56.34 to 00:59.08. Keep the animation a simulation of the Sheets write. |
| 01:02.00 to 01:18.00 | Reveal the phone and monitor together with the original shallow 3D camera move. Complete the move by 01:04.50 and then hold the reading composition. Show "92 daripada 110 premis dilawati" and "84% liputan ACD" together through the final caption ending around 01:14.86. Keep the aggregate card legible and the detailed charts secondary. |
| 01:18.00 to 01:25.00 | Show the officer recording the Bahagian D confirmation as the narrator speaks. Hold the recorded state. Use a short, static report or share-ready summary in the same composition if it can fit without obscuring confirmation. |
| 01:25.00 to 01:45.00 | Return to the same NADI locality card, marked PROTOTAIP INTEGRASI and DATA SIMULASI. Have "6 premis belum dilawati" on screen by about 01:25.90. Keep "12 berkunci atau kosong" legible when it is mentioned around 01:30.42. Show the supervisor selecting "Rancang lawatan susulan" during the line beginning around 01:39.01. Keep the planned visits tied to the six simulated premises. |
| 01:45.00 to 01:52.35 | Restore the icon cards. Use "Rekod ACD pada telefon", "Kiraan liputan automatik", "Pengesahan dan ringkasan", and "Perancangan lawatan susulan". Mark the last card "Prototaip Integrasi". Bring the four cards in over about one second, then hold the full row for at least five seconds. Let the music carry the recap during the narration pause. |
| 01:52.35 to 02:00.00 | Return to the current NADI Muallim title, tagline and Pejabat Kesihatan Daerah Muallim identity. Bring the existing lockup fully into view by 01:53.20 and hold to the final frame. Resolve the music gently after the final spoken line. |

Use these scene times as the edit anchors. Allow small adjustments within each slot to match the supplied WAV, subtitle boundaries and reading time. Keep the narrative order and hard gates below.

## Implementation details and hard gates

1. Fix the early phone entry at the source. In the supplied 120-second player, T.s2.rise and T.s2.shrink start at 17.00 s. The typing continues until 19.00 s and the manual layer exits over 19.30 to 20.00 s. As a result, the phone is already visible in frames 1027 and 1065. In the new timeline, finish the manual entry and its last caption, clear the manual props, introduce NADI, then make the first phone frame at or after 24.30 s (frame 1458). Set the visibility gate on the entire phone layer, including its outline, shadow, app badge, tap marker and reveal sound. Use the same timing gate for normal playback, seek and export. Update the camera and cue tables together.
2. Restore the older soundtrack's opening design. Reuse the legacy drone, paired accelerating heartbeat, ticking and riser, and move the impact to the new title reveal. Align accents with the pin, form/tally, completed entry and title. Duck the music and effects under the supplied narration and use the natural speech gaps for the accents. Use one resolved mix. Keep the narration present in the MP4, with no overlapping browser-synthesized voice. If the standalone player is narrated, use the same offline narration or mix and synchronize it on seek and restart.
3. Adapt the old 3D motion to the 120-second base. Reuse its perspective, rotateX/rotateY and depth treatment for the phone entrance, data transfer, and phone-plus-monitor reveal. Start around 8 to 14 degrees of yaw as a design range and settle near frontal when a form, number or table needs reading. Keep the device shadows and highlights understated. Use steady close-ups with captions in the lower safe area.
4. Use one simulated dataset. Final operation numbers are 110 premises, 92 visited, 12 locked or empty, 6 unvisited and 84% rounded coverage. Give charts, phone, Sheets, captions and NADI card their values from that same state. Keep the headline numbers out of the phone reveal if they would pre-empt the record being saved. Maintain the distinction between screened or referred individuals and notified dengue cases.
5. Model the data handoff accurately. If showing the spreadsheet range, label it "Hasil ACD!C8:H13", the six team rows and columns used by the supplied Apps Script. Make the cell fill follow the save, and keep the arrow one way to Sheets for this beat. A successful demo write is conditional on connectivity. In the later NADI shot, the ACD summary and follow-up are a labelled prototype. Use the simulated case data, no live endpoint calls, and a visible supervisor action.

## Build, review and export

- Edit the real source files and rebuild the HTML with the project's existing tools. Update beat constants, scene markers, caption generation, frame-seek code and sound cues from the same timeline. Keep offline preview, playback, seek, restart and clean export working.
- Inspect frames 1027, 1065 and 1160 (the reported regression), frame 1457 (phone hidden), and a settled phone frame after 00:25.60. Inspect 00:11.85 and 00:12.33 for the completed manual entry, and 00:13.35 for the title impact. Check the same gates with direct seeks in the rebuilt player and on an exported clip.
- Export a short narrated preview of 00:00 to 00:30 and inspect the Sheets and coverage beats around 00:55 to 01:15. Verify that short exports use the matching timestamp in the supplied narration. Check speech intelligibility, Muallim and Ketoyong pronunciation, subtitle timing and placement, and the hold on the follow-up cards. Fix any issues, then render the full film.
- Use the project's voiceover-enabled render command. If it supports the existing interface, use:

```bash
node render-video.js --voiceover narration-bm.wav --out NADI-Muallim-Pitch-120s-v3.mp4
```

- Verify the final MP4 with FFprobe. Expect H.264, 1920 x 1080, constant 60 fps, 7,200 decoded video frames, AAC 48 kHz, and exactly 120.000 seconds. Verify actual speech in the mixed export by comparing an identifiable passage with the source WAV, or by auditioning the clip. The presence of an AAC stream alone does not verify narration.
- Deliver the final V3 MP4, the rebuilt V3 HTML player and the synchronized SRT. Give the exact output paths, the preview and verification results, and any unresolved issue.
