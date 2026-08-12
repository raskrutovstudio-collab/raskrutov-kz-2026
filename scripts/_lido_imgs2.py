# -*- coding: utf-8 -*-
from pathlib import Path
import re
import shutil

t = Path("site_mirror/web-studiya/lidogeneratsiya/index.pre-rebuild-20260812.html").read_text(encoding="utf-8", errors="ignore")
dst = Path("site_mirror/assets/img/lidogeneratsiya")
dst.mkdir(parents=True, exist_ok=True)

for kw in ["Заявки и CRM", "Воронки", "Формы и", "Анализ и стратегия", "Источники лидов", "amoCRM"]:
    i = t.find(kw)
    print("====", kw, i)
    if i < 0:
        continue
    chunk = t[max(0, i - 500) : i + 3000]
    for m in re.findall(r'src="([^"]+lpfile[^"]+)"', chunk):
        print(" ", m[:200])

# largest files for card hashes
root = Path("site_mirror/assets/m-files.cdn1.cc/lpfile")
for hash_, name in [
    ("f4a5da2c167fb02ddc7d6a5c5ad276bc", "card-funnel.webp"),
    ("d86ed553087efe6398e2155e7ae5c466", "card-forms.webp"),
    ("d80f08356d5f7c52d623f3b2840f0e1e", "card-crm-icon.webp"),
    ("4cf23121cad74a27f59e45eed13c7278", "card-crm-visual.webp"),
    ("174ca11720b34cbc15ddf4b1d255d93e", "process-01.webp"),
    ("cc7db4b463af188c27a7438dba7664d9", "process-icon.webp"),
]:
    files = list(root.rglob(hash_ + "*"))
    files += [p for p in root.joinpath(hash_[0], hash_[1], hash_[2], hash_).rglob("*") if p.is_file()] if root.joinpath(hash_[0], hash_[1], hash_[2], hash_).exists() else []
    files = [p for p in files if p.suffix.lower() in {".webp", ".png", ".jpg"}]
    files = sorted(set(files), key=lambda p: p.stat().st_size, reverse=True)
    if files:
        shutil.copy2(files[0], dst / name)
        print("COPY", name, files[0].stat().st_size, files[0])
    else:
        print("MISS", name)
