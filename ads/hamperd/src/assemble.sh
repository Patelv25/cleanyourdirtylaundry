#!/bin/bash
# Assemble the licensed edit: Miriam J footage (trimmed, tagged) + Hamper'd outro.
set -e
S="$(cd "$(dirname "$0")" && pwd)"
FF=/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2
V="/root/.claude/uploads/bd0ea0e1-c8ff-59ce-99c5-3fb21737b3c5/9791bbab-Miriam_J_epitomeofclassy_Instagram_reel.mp4"

CUT=14.6        # end of creator segment (before the tonal audio tail)
XF=0.5          # crossfade duration
OFFSET=14.1     # xfade offset = CUT - XF

$FF -y -i "$V" -i "$S/outro.mp4" -i "$S/tag.png" -filter_complex "
[0:v]trim=0:${CUT},setpts=PTS-STARTPTS,fps=30[c0];
[c0][2:v]overlay=x=48:y=1520,settb=AVTB[c1];
[1:v]settb=AVTB[o1];
[c1][o1]xfade=transition=fade:duration=${XF}:offset=${OFFSET}[v];
[0:a]atrim=0:${CUT},asetpts=PTS-STARTPTS,afade=t=out:st=13.6:d=1.0,apad=whole_dur=21.6[a]
" -map "[v]" -map "[a]" \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 128k -movflags +faststart -shortest \
  "$S/hamperd-x-miriamj-edit-v1.mp4"
echo assembled
