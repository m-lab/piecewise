from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker


def get_session(url: str) -> Session:
    engine = create_engine(url, connect_args={"check_same_thread": False})
    maker = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return maker(url)


def get_database(url: str):
    try:
        db = get_session(url)
        yield db
    finally:
        db.close()
