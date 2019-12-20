from sqlalchemy.orm import Session

from app.db.models.submission import Submission
from app.db.schemas.submission import SubmissionCreate


def get_submissions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Submission).offset(skip).limit(limit).all()


def create_submission(db: Session, submission: SubmissionCreate):
    db_item = Submission(**submission.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
