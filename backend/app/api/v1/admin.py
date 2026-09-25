from fastapi import APIRouter, Query

from app.api.deps import AdminUser, DbSession
from app.models import Role
from app.schemas.auth import AdminUserOut
from app.schemas.me import AdminOverviewOut, AdminUserUpdate
from app.services import admin as admin_service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/overview", response_model=AdminOverviewOut)
def get_overview(_admin: AdminUser, db: DbSession):
    return admin_service.overview(db)


@router.get("/users", response_model=list[AdminUserOut])
def list_users(
    _admin: AdminUser,
    db: DbSession,
    q: str | None = Query(default=None, max_length=100),
    role: Role | None = None,
):
    return admin_service.list_users(db, q=q, role=role.value if role else None)


@router.patch("/users/{user_id}", response_model=AdminUserOut)
def update_user(user_id: int, payload: AdminUserUpdate, admin: AdminUser, db: DbSession):
    return admin_service.update_user(db, admin, user_id, payload)
