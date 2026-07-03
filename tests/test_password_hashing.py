import unittest

from app.core.security import hash_password, verify_password


class PasswordHashingTests(unittest.TestCase):
    def test_hash_and_verify_password(self):
        hashed = hash_password("secret123")

        self.assertTrue(verify_password("secret123", hashed))
        self.assertFalse(verify_password("wrong123", hashed))

    def test_legacy_plaintext_passwords_still_verify(self):
        self.assertTrue(verify_password("plain-password", "plain-password"))


if __name__ == "__main__":
    unittest.main()
