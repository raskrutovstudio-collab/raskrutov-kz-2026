# -*- coding: utf-8 -*-
from pathlib import Path
import re

t = Path("site_mirror/web-studiya/lidogeneratsiya/index.pre-rebuild-20260812.html").read_text(encoding="utf-8", errors="ignore")
# unique local lpfile images near leadgen keywords
imgs = re.findall(r'src="([^"]+\.(?:webp|png|jpg|svg)[^"]*)"', t, re.I)
clean = []
for u in imgs:
    if "lpfile" in u or "perf-img" in u or "/img/" in u:
        # normalize
        u2 = u.split()[0]
        if u2 not in clean:
            clean.append(u2)
Path("tmp_lido_imgs.txt").write_text("\n".join(clean[:120]), encoding="utf-8")
print("count", len(clean))
print("\n".join(clean[:80]))
