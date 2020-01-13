from sqlalchemy import create_engine
from sqlalchemy.orm import Session, scoped_session, sessionmaker

from piecewise.config.settings import get_settings

settings = get_settings()


def get_session(url: str) -> Session:
    engine = create_engine(url)
    maker = scoped_session(
        sessionmaker(autocommit=False, autoflush=False, bind=engine))
    return maker


def get_database():
    db = get_session(settings.db_url)
    try:
        yield db
    finally:
        db.close()
