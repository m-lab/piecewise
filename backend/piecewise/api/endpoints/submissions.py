from typing import List

from fastapi import APIRouter, Depends, Form, HTTPException
import sys
from sqlalchemy.orm import Session

from piecewise.db.crud.submission import create_submission, get_submissions
from piecewise.db.session import get_database
from piecewise.db.schemas.submission import (
    SubmissionCreate,
    SubmissionUpdate,
)

router = APIRouter()


@router.get("/", response_model=List[SubmissionUpdate])
def get(
    db: Session = Depends(get_database),
    skip: int = 0,
    limit: int = 100,
):
    """
    Retrieve items.
    """
    subs = get_submissions(db=db, skip=skip, limit=limit)
    return subs


@router.post("/", response_model=SubmissionUpdate)
def submit(*,
           db: Session = Depends(get_database),
           survey_service_type: str = Form(...),
           survey_outages: str = Form(...),
           survey_disruptions: str = Form(...),
           survey_subscribe_upload: str = Form(...),
           survey_subscribe_download: str = Form(...),
           survey_bundle: str = Form(...),
           survey_current_cost: str = Form(...),
           survey_satisfaction: str = Form(...),
           survey_carrier_choice: str = Form(...),
           survey_story: str = Form(...),
           survey_email: str = Form(...),
           survey_phone: str = Form(...),
           actual_download: int = Form(...),
           actual_upload: int = Form(...),
           min_rtt: int = Form(...),
           latitude: float = Form(...),
           longitude: float = Form(...),
           bigquery_key: str = Form(...)):
    """
    Create new item.
    """
    sub_in = SubmissionCreate(
        db=db,
        survey_service_type=survey_service_type,
        survey_outages=survey_outages,
        survey_disruptions=survey_disruptions,
        survey_subscribe_upload=survey_subscribe_upload,
        survey_subscribe_download=survey_subscribe_download,
        survey_bundle=survey_bundle,
        survey_current_cost=survey_current_cost,
        survey_satisfaction=survey_satisfaction,
        survey_carrier_choice=survey_carrier_choice,
        survey_story=survey_story,
        survey_email=survey_email,
        survey_phone=survey_phone,
        actual_download=actual_download,
        actual_upload=actual_upload,
        min_rtt=min_rtt,
        latitude=latitude,
        longitude=longitude,
        bigquery_key=bigquery_key,
    )

    sub = create_submission(db=db, submission=sub_in)
    return sub
