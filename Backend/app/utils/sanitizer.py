import re
import html

MAX_LENGTH = 100

def sanitize_text(text: str, max_length: int = MAX_LENGTH) -> str:
    if not text:
        return ""
    text = text.strip()
    text = html.escape(text)
    text = re.sub(r"[^a-zA-Z0-9\s.,'-]", "", text)
    return text[:max_length]

def sanitize_quantity(value):
    try:
        q = float(value)
        return max(0, q)
    except (TypeError, ValueError):
        return 0

def sanitize_url(url: str) -> str:
    if not url:
        return ""
    url = url.strip()
    if re.match(r"^https?://", url):
        return url
    return ""
