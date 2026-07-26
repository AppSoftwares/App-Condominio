from app.main import app

# Este archivo permite que Vercel detecte y ejecute FastAPI como una función serverless.
# Las peticiones a /api/* serán manejadas por la instancia 'app' definida en app/main.py.
