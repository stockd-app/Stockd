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

if __name__ == "__main__":
    print("=== Testing sanitize_text ===")
    test_texts = [
        "  Hello World!  ",
        "<script>alert('xss')</script>",
        "This is a very long text " * 10,
        None,
        ""
    ]
    for t in test_texts:
        sanitized = sanitize_text(t)
        print(f"Original: {repr(t)} -> Sanitized: {repr(sanitized)}")

    print("\n=== Testing sanitize_quantity ===")
    test_quantities = ["10", "-5", 3.5, None, "abc"]
    for q in test_quantities:
        sanitized = sanitize_quantity(q)
        print(f"Original: {repr(q)} -> Sanitized: {sanitized}")

    print("\n=== Testing sanitize_url ===")
    test_urls = [
        "https://example.com",
        "http://example.com/path",
        "ftp://example.com",
        "javascript:alert('xss')",
        "   https://spaced.com  ",
        "",
        None
    ]
    for u in test_urls:
        sanitized = sanitize_url(u)
        print(f"Original: {repr(u)} -> Sanitized: {repr(sanitized)}")