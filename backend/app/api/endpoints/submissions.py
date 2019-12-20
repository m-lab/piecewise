from typing import List

from fastapi import APIRouter, Depends, Form
from sqlalchemy.orm import Session

from app.db.crud.submission import create_submission, get_submissions
from app.db.session import get_database
from app.db.schemas.submission import SubmissionBase, SubmissionCreate

router = APIRouter()


@router.get("/", response_model=List[SubmissionBase])
def get_submissions(
    db: Session = Depends(get_database),
    skip: int = 0,
    limit: int = 100,
):
    """
    Retrieve items.
    """
    subs = get_submissions(db=db, skip=skip, limit=limit)
    return subs


@router.post("/", response_model=SubmissionBase)
def create_submission(*,
                      db: Session = Depends(get_database),
                      isp_user: str = Form(...),
                      other_isp: str = Form(...),
                      connection_type: str = Form(...),
                      cost_of_service: str = Form(...),
                      advertised_download: int = Form(...),
                      advertised_upload: int = Form(...),
                      actual_download: int = Form(...),
                      actual_upload: int = Form(...),
                      min_rtt: int = Form(...),
                      latitude: float = Form(...),
                      longitude: float = Form(...)):
    """
    Create new item.
    """
    sub_in = SubmissionCreate(
        db,
        isp_user=isp_user,
        other_isp=other_isp,
        connection_type=connection_type,
        cost_of_service=cost_of_service,
        advertised_download=advertised_download,
        advertised_upload=advertised_upload,
        actual_download=actual_download,
        actual_upload=actual_upload,
        min_rtt=min_rtt,
        latitude=latitude,
        longitude=longitude,
    )
    sub = create_submission(db_session=db, sub_in=sub_in)
    return sub
