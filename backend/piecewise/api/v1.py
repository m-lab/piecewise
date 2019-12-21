from fastapi import APIRouter

from .endpoints import submissions


def get_api_router():
    api_router = APIRouter()
    api_router.include_router(submissions.router,
                              prefix="/submissions",
                              tags=["submissions"])
    # api_router.include_router(users.router, prefix="/users", tags=["users"])
    return api_router
