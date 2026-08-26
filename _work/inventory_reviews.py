# -*- coding: utf-8 -*-
import re
import html
from pathlib import Path
from collections import OrderedDict

base = Path(r"d:\РАБОТА\111 ПОРТАЛ ,,, ПРОЕКТ РАСКРУТОВ 05,2026 111\raskrutov-kz-2026")


def hash_from_src(src: str):
    m = re.search(r"lpfile/[0-9a-f/]+/([0-9a-f]{32})", src, re.I)
    return m.group(1).lower() if m else None


def attr(tag: str, name: str):
    m = re.search(rf'\b{name}="([^"]*)"', tag)
    return html.unescape(m.group(1)) if m else None


def extract_img_tag_attrs(tag: str):
    return {
        "src": attr(tag, "src"),
        "alt": attr(tag, "alt"),
        "title": attr(tag, "title"),
        "width": attr(tag, "width"),
        "height": attr(tag, "height"),
    }


# ========== A. Благодарственные письма ==========
bp_path = base / "site_mirror/o-kompanii/blagodarstvennye-pisma/index.html"
bp = bp_path.read_text(encoding="utf-8", errors="replace")

print("=" * 80)
print("A. BLAGODARSTVENNYE-PISMA")
print("=" * 80)

# ImageObject name + following img
letters = OrderedDict()
for m in re.finditer(
    r'itemprop="name"\s+content="([^"]*)"([\s\S]{0,1500}?)',
    bp,
):
    name = html.unescape(m.group(1)).strip()
    chunk = m.group(0)
    img_m = re.search(r"<img[^>]*>", chunk)
    if not img_m:
        # search a bit further after match end
        start = m.end()
        img_m = re.search(r"<img[^>]*>", bp[start : start + 800])
        if not img_m:
            continue
        tag = img_m.group(0)
    else:
        tag = img_m.group(0)
    info = extract_img_tag_attrs(tag)
    src = info["src"] or ""
    h = hash_from_src(src)
    key = h or src
    # skip logos / icons / non-letter
    if "81a3fe2ab76d8a7d4df2ea1900ce0265" in src:
        continue
    if key in letters:
        continue
    letters[key] = {
        "name_meta": name,
        "src": src,
        "alt": info["alt"],
        "title": info["title"],
        "width": info["width"],
        "height": info["height"],
        "hash": h,
        "source": "o-kompanii/blagodarstvennye-pisma/index.html",
    }

print(f"ImageObject-linked images: {len(letters)}")
for i, (k, L) in enumerate(letters.items(), 1):
    print(f"\n{i}. META NAME: {L['name_meta']}")
    print(f"   hash: {L['hash']}")
    print(f"   src: {L['src']}")
    print(f"   alt: {L['alt']!r}")
    print(f"   title: {L['title']!r}")
    print(f"   width x height: {L['width']} x {L['height']}")

# Also collect ALL showOriginalImage imgs (gallery letters)
print("\n--- showOriginalImage gallery ---")
gallery = OrderedDict()
for m in re.finditer(r"showOriginalImage[\s\S]{0,2000}?(<img[^>]*>)", bp):
    tag = m.group(1)
    info = extract_img_tag_attrs(tag)
    src = info["src"] or ""
    if "81a3fe2ab76d8a7d4df2ea1900ce0265" in src:
        continue
    h = hash_from_src(src)
    key = h or src
    if key in gallery:
        continue
    # look backward for itemprop name
    start = max(0, m.start() - 600)
    prev = bp[start : m.start()]
    nm = re.search(r'itemprop="name"\s+content="([^"]*)"', prev)
    name = html.unescape(nm.group(1)).strip() if nm else None
    gallery[key] = {
        "name_meta": name,
        "src": src,
        "alt": info["alt"],
        "title": info["title"],
        "width": info["width"],
        "height": info["height"],
        "hash": h,
    }

print(f"Unique showOriginalImage: {len(gallery)}")
for i, (k, L) in enumerate(gallery.items(), 1):
    print(f"\nG{i}. META: {L['name_meta']}")
    print(f"   hash: {L['hash']}")
    print(f"   src: {L['src']}")
    print(f"   alt: {L['alt']!r} title: {L['title']!r}")
    print(f"   size attrs: {L['width']} x {L['height']}")

# Merge: prefer gallery if more complete
all_letters = OrderedDict()
for k, L in gallery.items():
    all_letters[k] = L
for k, L in letters.items():
    if k not in all_letters:
        all_letters[k] = L

print(f"\nTOTAL UNIQUE LETTER IMAGES (merged): {len(all_letters)}")

# ========== B/C. OTZIVI page ==========
otz_path = base / "site_mirror/assets/s239948.lpmotortest.com/otzivi/index.html"
otz = otz_path.read_text(encoding="utf-8", errors="replace")

print("\n" + "=" * 80)
print("OTZIVI PAGE STRUCTURE")
print("=" * 80)
print(f"File size: {len(otz)} chars")

# Headings
for m in re.finditer(r"<h[1-3][^>]*>([\s\S]*?)</h[1-3]>", otz, re.I):
    text = re.sub(r"<[^>]+>", "", m.group(1))
    text = html.unescape(re.sub(r"\s+", " ", text)).strip()
    if text:
        print(f"HEADING: {text[:200]}")

# Google / 2GIS markers
for kw in ["Google", "google", "2GIS", "2ГИС", "2gis", "g.page", "maps.app.goo", "goo.gl", "yandex"]:
    c = otz.lower().count(kw.lower()) if kw != "2ГИС" else otz.count("2ГИС")
    if c:
        print(f"Keyword '{kw}' count: {c}")

# Gallery images on otzivi
print("\n--- OTZIVI gallery preview images ---")
otz_imgs = OrderedDict()
for m in re.finditer(r'<img[^>]+class="[^"]*preview__image[^"]*"[^>]*>', otz):
    tag = m.group(0)
    info = extract_img_tag_attrs(tag)
    src = info["src"] or ""
    # normalize protocol-relative
    if src.startswith("//"):
        src_rel = "https:" + src
    else:
        src_rel = src
    h = hash_from_src(src)
    key = h or src
    if key in otz_imgs:
        continue
    idx = attr(tag, "data-index")
    otz_imgs[key] = {"src": src, "hash": h, "data_index": idx, "alt": info["alt"]}

# also section__gallery-image backgrounds / imgs
for m in re.finditer(r'section__gallery-image[\s\S]{0,800}?(?:src=["\']([^"\']+)["\']|url\(([^)]+)\))', otz):
    src = (m.group(1) or m.group(2) or "").strip("'\"")
    h = hash_from_src(src)
    key = h or src
    if key not in otz_imgs:
        otz_imgs[key] = {"src": src, "hash": h, "data_index": None, "alt": None}

print(f"Otzivi gallery unique images: {len(otz_imgs)}")
for i, (k, L) in enumerate(otz_imgs.items(), 1):
    print(f"O{i}. idx={L['data_index']} hash={L['hash']}")
    print(f"   src={L['src']}")

# Text reviews - look for review-like text blocks
print("\n--- TEXT CONTENT BLOCKS (potential reviews) ---")
# blk_text bodies
texts = []
for m in re.finditer(r'<div class="blk blk_text[^"]*"[^>]*>[\s\S]*?<div class="blk-data[^"]*"[^>]*>([\s\S]*?)</div>', otz):
    raw = m.group(1)
    text = re.sub(r"<br\s*/?>", "\n", raw, flags=re.I)
    text = re.sub(r"</p>", "\n", text, flags=re.I)
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n\s*\n+", "\n", text).strip()
    if len(text) >= 40:
        texts.append(text)

# also span.ms-active-string and paragraph-like
for m in re.finditer(r'<(?:p|span|li)[^>]*>([\s\S]{40,2000}?)</(?:p|span|li)>', otz):
    text = re.sub(r"<[^>]+>", "", m.group(1))
    text = html.unescape(re.sub(r"\s+", " ", text)).strip()
    if len(text) >= 60 and any(x in text.lower() for x in ["сайт", "работ", "рекоменд", "спасибо", "отлично", "агентств", "студи", "seo", "реклам", "разработ"]):
        if text not in texts:
            texts.append(text)

print(f"Candidate text blocks: {len(texts)}")
for i, t in enumerate(texts[:40], 1):
    print(f"\nT{i} ({len(t)} chars):")
    print(t[:500])
    if len(t) > 500:
        print("...[truncated]")

# Star ratings patterns
print("\n--- RATING / AUTHOR patterns ---")
for pat in [r"[★☆⭐]{1,5}", r"\d\s*/\s*5", r"оценк", r"рейтинг", r"Review", r"reviewer", r"author"]:
    ms = list(re.finditer(pat, otz, re.I))
    if ms:
        print(f"Pattern {pat!r}: {len(ms)} matches")
        for mm in ms[:5]:
            ctx = otz[max(0, mm.start() - 80) : mm.end() + 120]
            ctx = re.sub(r"\s+", " ", ctx)
            print(f"  ...{ctx[:200]}...")

# Links to google / 2gis profiles
print("\n--- EXTERNAL PROFILE LINKS ---")
for m in re.finditer(r'href="([^"]+)"', otz):
    href = m.group(1)
    if any(x in href.lower() for x in ["google", "g.page", "2gis", "maps", "yandex", "flamp", "zoon"]):
        print(href)

# ========== D. Duplicates ==========
print("\n" + "=" * 80)
print("D. DUPLICATES (letter hashes vs otzivi hashes)")
print("=" * 80)
letter_hashes = set(all_letters.keys())
otz_hashes = set(otz_imgs.keys())
common = letter_hashes & otz_hashes
print(f"Letter hashes: {len(letter_hashes)}")
print(f"Otzivi hashes: {len(otz_hashes)}")
print(f"Common hashes: {len(common)}")
for h in common:
    ln = all_letters.get(h, {}).get("name_meta")
    print(f"  {h} letter_name={ln}")

only_otz = otz_hashes - letter_hashes
only_let = letter_hashes - otz_hashes
print(f"Only on otzivi: {len(only_otz)}")
for h in only_otz:
    print(f"  {h} src={otz_imgs[h]['src'][:100]}")
print(f"Only on letters page: {len(only_let)}")

# ========== E. Clean templates ==========
print("\n" + "=" * 80)
print("E. CLEAN TEMPLATE CANDIDATES")
print("=" * 80)

candidates = []
search_roots = [
    base / "site_mirror/o-kompanii",
    base / "site_mirror/web-studiya",
    base / "site_mirror",
]
seen_pages = set()
for root in [base / "site_mirror/o-kompanii", base / "site_mirror/web-studiya/podderzhka-saytov", base / "site_mirror"]:
    if not root.exists():
        continue
    for p in root.rglob("index.html"):
        rel = str(p.relative_to(base / "site_mirror")).replace("\\", "/")
        if rel in seen_pages:
            continue
        if "assets/" in rel or "_work" in rel or "lpmotor" in rel.lower():
            continue
        seen_pages.add(rel)
        try:
            txt = p.read_text(encoding="utf-8", errors="replace")
        except Exception:
            continue
        has_public = "public.bundle" in txt
        has_lpm = "lpmotor" in txt.lower() or "m-files.cdn1.cc/web/build" in txt
        rk_count = len(re.findall(r"\brk-[a-z0-9_-]+", txt, re.I))
        home_clean = "home-clean" in txt or "rk-home" in txt
        has_form = bool(re.search(r"<form\b", txt, re.I))
        has_header = bool(re.search(r"<header\b|rk-header|class=\"[^\"]*header", txt, re.I))
        has_footer = bool(re.search(r"<footer\b|rk-footer", txt, re.I))
        size = p.stat().st_size
        # score clean
        if (not has_public and not has_lpm and rk_count >= 5) or home_clean or (rk_count >= 20 and not has_public):
            candidates.append(
                {
                    "path": rel,
                    "size": size,
                    "rk": rk_count,
                    "public_bundle": has_public,
                    "lpm": has_lpm,
                    "home_clean": home_clean,
                    "form": has_form,
                    "header": has_header,
                    "footer": has_footer,
                }
            )

candidates.sort(key=lambda x: (-x["rk"], x["public_bundle"], x["size"]))
print(f"Clean-ish candidates: {len(candidates)}")
for c in candidates[:25]:
    print(
        f"{c['path']} | rk={c['rk']} | public={c['public_bundle']} | lpm={c['lpm']} | "
        f"home_clean={c['home_clean']} | form={c['form']} | header={c['header']} | footer={c['footer']} | size={c['size']}"
    )

# Specifically o-kompanii
print("\n--- o-kompanii pages status ---")
for p in sorted((base / "site_mirror/o-kompanii").rglob("index.html")):
    rel = str(p.relative_to(base / "site_mirror")).replace("\\", "/")
    txt = p.read_text(encoding="utf-8", errors="replace")
    print(
        f"{rel}: public.bundle={'YES' if 'public.bundle' in txt else 'no'} "
        f"rk={len(re.findall(r'\\brk-[a-z0-9_-]+', txt, re.I))} "
        f"size={p.stat().st_size}"
    )

# ========== F. Lightbox on clean pages ==========
print("\n" + "=" * 80)
print("F. LIGHTBOX ON CLEAN PAGES")
print("=" * 80)

lightbox_pats = [
    r"lightbox",
    r"fancybox",
    r"glightbox",
    r"data-lightbox",
    r"photoSwipe",
    r"photoswipe",
    r"rk-lightbox",
    r"rk-gallery",
    r"showOriginalImage",
    r"image-modal",
    r"modal.*img|img.*modal",
]
for p in (base / "site_mirror").rglob("index.html"):
    rel = str(p.relative_to(base / "site_mirror")).replace("\\", "/")
    if "assets/" in rel or "_work" in rel:
        continue
    try:
        txt = p.read_text(encoding="utf-8", errors="replace")
    except Exception:
        continue
    if "public.bundle" in txt:
        continue
    hits = []
    for pat in lightbox_pats:
        if re.search(pat, txt, re.I):
            hits.append(pat)
    if hits:
        print(f"{rel}: {hits}")

# also search css/js assets
print("\n--- lightbox in assets css/js (sample) ---")
for pat_name, glob_pat in [("css", "**/*lightbox*"), ("js", "**/*lightbox*"), ("glightbox", "**/*glightbox*"), ("fancybox", "**/*fancybox*")]:
    found = list((base / "site_mirror").glob(glob_pat))
    for f in found[:10]:
        print(f"{pat_name}: {f.relative_to(base)}")

# Grep-like in clean css
for p in (base / "site_mirror/assets").rglob("*.css"):
    name = p.name.lower()
    if any(x in name for x in ["lightbox", "gallery", "fancybox", "glightbox", "photoswipe"]):
        print(f"asset: {p.relative_to(base)}")

print("\nDONE")
