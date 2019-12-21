from fastapi import FastAPI
import logging
import sys
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import RedirectResponse
from starlette.staticfiles import StaticFiles
import uvicorn

from piecewise.api.v1 import get_api_router
from piecewise.config.settings import get_settings

# from app.db.session import get_database

logging.basicConfig(
    stream=sys.stderr,
    level=logging.DEBUG,
    format="%(asctime)s %(filename)s:%(lineno)s %(levelname)s %(message)s",
)

logger = logging.getLogger(__name__)


def get_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.name,
        openapi_url=settings.openapi_route,
        debug=settings.debug,
    )

    # Setup API
    app.include_router(get_api_router(), prefix=settings.api_v1_route)

    # Configure static files path
    static_files = StaticFiles(directory=settings.static_dir)
    app.mount(path=settings.static_mount_path, app=static_files, name="static")

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/", include_in_schema=False)
    def redirect_to_docs() -> RedirectResponse:
        return RedirectResponse("/docs")

    # @app.on_event("startup")
    # async def connect_to_database() -> None:
    #    database = get_database(settings.db_url)
    #    if not database.is_connected:
    #        await database.connect()

    # @app.on_event("shutdown")
    # async def shutdown() -> None:
    #    database = get_database(settings.db_url)
    #    if database.is_connected:
    #        await database.disconnect()

    return app


app = get_app()


def main():
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")


if __name__ == "__main__":
    main()
