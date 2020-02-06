import logging
from typing import List

from fastapi import APIRouter, Depends, Form
from sqlalchemy.orm import Session

from piecewise.db.crud.submission import create_submission, get_submissions
from piecewise.db.session import get_database
from piecewise.db.schemas.submission import (
    SubmissionCreate,
    SubmissionUpdate,
)

logger = logging.getLogger(__name__)

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
           id: integer = Form(None),
           db: Session = Depends(get_database),
           survey_service_type: str = Form(None),
           survey_outages: str = Form(None),
           survey_disruptions: str = Form(None),
           survey_subscribe_upload: str = Form(None),
           survey_subscribe_download: str = Form(None),
           survey_bundle: str = Form(None),
           survey_current_cost: str = Form(None),
           survey_satisfaction: str = Form(None),
           survey_carrier_choice: str = Form(None),
           survey_story: str = Form(None),
           survey_email: str = Form(None),
           survey_phone: str = Form(None),
           actual_download: float = Form(...),
           actual_upload: float = Form(...),
           min_rtt: float = Form(...),
           latitude: float = Form(None),
           longitude: float = Form(None),
           bigquery_key: str = Form(None)):
    if id: # if data stored in dom
        """
        Update an item.
        """
        sub_in = SubmissionUpdate(
            db=db,
            id=id,
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

        sub = update_submission(db=db, submission=sub_in)
    else:
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
