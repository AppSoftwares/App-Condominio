#!/usr/bin/env python3
"""
Simple helper to generate a raw API key and its SHA256 hash to store in DB.
Usage: python scripts/generate_api_key.py
"""
import hashlib
import secrets


def gen_key():
    raw = f"condo_{secrets.token_urlsafe(32)}"
    h = hashlib.sha256(raw.encode()).hexdigest()
    return raw, h


if __name__ == '__main__':
    raw, h = gen_key()
    print("Raw API Key (keep secret):", raw)
    print("SHA256 Hash to store in DB:", h)
