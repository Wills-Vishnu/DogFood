from fastapi import APIRouter, Request, Response

from app.api.deps import CurrentUser, DbSession
from app.core.config import get_settings
from app.schemas.auth import LoginRequest, ProfileUpdate, RegisterRequest, UserOut
from app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


def _set_session_cookie(response: Response, token: str) -> None:
    settings = get_settings()
    response.set_cookie(
        settings.session_cookie_name,
        token,
        max_age=settings.session_ttl_hours * 3600,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        path="/",
    )


@router.post("/register", response_model=UserOut, status_code=201)
def register(payload: RegisterRequest, response: Response, db: DbSession):
    user = auth_service.register_user(db, payload.email, payload.password, payload.display_name)
    _set_session_cookie(response, auth_service.create_session(db, user))
    return user


@router.post("/login", response_model=UserOut)
def login(payload: LoginRequest, request: Request, response: Response, db: DbSession):
    user = auth_service.authenticate(db, payload.email, payload.password)
    previous = request.cookies.get(get_settings().session_cookie_name)
    if previous:
        auth_service.revoke_session(db, previous)
    _set_session_cookie(response, auth_service.create_session(db, user))
    return user


@router.post("/logout", status_code=204)
def logout(request: Request, db: DbSession) -> Response:
    settings = get_settings()
    token = request.cookies.get(settings.session_cookie_name)
    if token:
        auth_service.revoke_session(db, token)
    response = Response(status_code=204)
    response.delete_cookie(
        settings.session_cookie_name, path="/", httponly=True, secure=settings.cookie_secure, samesite="lax"
    )
    return response


@router.get("/me", response_model=UserOut)
def me(user: CurrentUser):
    return user


@router.patch("/me", response_model=UserOut)
def update_me(payload: ProfileUpdate, user: CurrentUser, db: DbSession):
    return auth_service.update_profile(db, user, payload)
