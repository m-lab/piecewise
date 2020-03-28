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
    db: Session = Depends(get_database), skip: int = 0, limit: int = 100,
):
    """
    Retrieve items.
    """
    subs = get_submissions(db=db, skip=skip, limit=limit)
    return subs


@router.post("/", response_model=SubmissionUpdate)
def submit(
    *,
    id: float = Form(None),
    db: Session = Depends(get_database),
    survey_current_location: str = Form(None),
    survey_normal_location: str = Form(None),
    survey_normal_location_other: str = Form(None),
    survey_location_performance: str = Form(None),
    survey_applications: List[str] = Form(None),
    survey_other_software: str = Form(None),
    survey_isp: str = Form(None),
    survey_subscribe_download: str = Form(None),
    survey_subscribe_upload: str = Form(None),
    survey_bundle: str = Form(None),
    survey_current_cost: str = Form(None),
    survey_partner_org: str = Form(None),
    actual_download: float = Form(None),
    actual_upload: float = Form(None),
    min_rtt: float = Form(None),
    latitude: float = Form(None),
    longitude: float = Form(None),
    bigquery_key: str = Form(None),
):
    if id:  # if data stored in dom
        """
        Update an item.
        """
        sub_in = SubmissionUpdate(
            db=db,
            id=id,
            survey_current_location=survey_current_location,
            survey_normal_location=survey_normal_location,
            survey_normal_location_other=survey_normal_location_other,
            survey_location_performance=survey_location_performance,
            survey_applications=",".join(map(str, survey_applications)),
            survey_other_software=survey_other_software,
            survey_isp=survey_isp,
            survey_subscribe_download=survey_subscribe_download,
            survey_subscribe_upload=survey_subscribe_upload,
            survey_bundle=survey_bundle,
            survey_current_cost=survey_current_cost,
            survey_partner_org=survey_partner_org,
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

        if survey_applications is None:
            survey_applications = 'none'

        sub_in = SubmissionCreate(
            db=db,
            survey_current_location=survey_current_location,
            survey_normal_location=survey_normal_location,
            survey_normal_location_other=survey_normal_location_other,
            survey_location_performance=survey_location_performance,
            survey_applications=",".join(map(str, survey_applications)),
            survey_other_software=survey_other_software,
            survey_isp=survey_isp,
            survey_subscribe_download=survey_subscribe_download,
            survey_subscribe_upload=survey_subscribe_upload,
            survey_bundle=survey_bundle,
            survey_current_cost=survey_current_cost,
            survey_partner_org=survey_partner_org,
            actual_download=actual_download,
            actual_upload=actual_upload,
            min_rtt=min_rtt,
            latitude=latitude,
            longitude=longitude,
            bigquery_key=bigquery_key,
        )

        sub = create_submission(db=db, submission=sub_in)
    return sub
