import os
import sentry_sdk
from sentry_sdk.integrations.asgi import SentryAsgiMiddleware


def init_sentry():
    dsn = os.getenv("SENTRY_DSN") or os.getenv("VITE_SENTRY_DSN")
    if not dsn:
        return False
    sentry_sdk.init(dsn, traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", 0.1)))
    return True


def wrap_app_with_sentry(app):
    # Wrap the ASGI app with Sentry middleware if DSN present
    dsn = os.getenv("SENTRY_DSN") or os.getenv("VITE_SENTRY_DSN")
    if not dsn:
        return app
    return SentryAsgiMiddleware(app)
