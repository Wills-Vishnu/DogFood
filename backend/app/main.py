from urllib.parse import urlparse

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.errors import error_response, register_error_handlers
from app.services.uploads import upload_directory

_UNSAFE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="DOGFOOD API",
        version="1.0.0",
        openapi_url="/api/v1/openapi.json",
        docs_url="/api/docs",
        redoc_url=None,
    )
    register_error_handlers(app)

    @app.middleware("http")
    async def origin_guard(request: Request, call_next):
        # Defence in depth on top of SameSite=Lax cookies: reject cross-site writes from unknown origins.
        origin = request.headers.get("origin")
        if request.method in _UNSAFE_METHODS and origin:
            host = request.headers.get("x-forwarded-host") or request.headers.get("host", "")
            if origin not in settings.allowed_origins and urlparse(origin).netloc != host:
                return error_response(403, "origin_rejected", "Cross-site request rejected")
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("Referrer-Policy", "same-origin")
        return response

    if settings.allowed_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=list(settings.allowed_origins),
            allow_credentials=True,
            allow_methods=["GET", "POST", "PATCH", "DELETE"],
            allow_headers=["Content-Type"],
        )

    app.include_router(api_router, prefix="/api/v1")
    app.mount("/uploads", StaticFiles(directory=upload_directory()), name="uploads")
    return app


app = create_app()
