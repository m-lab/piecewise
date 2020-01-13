from typing import Optional
from pydantic import BaseModel


class SubmissionBase(BaseModel):
    survey_service_type: Optional[str]
    survey_outages: Optional[str]
    survey_disruptions: Optional[str]
    survey_subscribe_upload: Optional[str]
    survey_subscribe_download: Optional[str]
    survey_bundle: Optional[str]
    survey_current_cost: Optional[str]
    survey_satisfaction: Optional[str]
    survey_carrier_choice: Optional[str]
    survey_story: Optional[str]
    survey_email: Optional[str]
    survey_phone: Optional[str]
    actual_download: float
    actual_upload: float
    min_rtt: float
    latitude: Optional[float]
    longitude: Optional[float]
    bigquery_key: Optional[str]


class SubmissionCreate(SubmissionBase):
    pass


class SubmissionUpdate(SubmissionBase):
    id: int

    # owner_id: int

    class Config:
        orm_mode = True
