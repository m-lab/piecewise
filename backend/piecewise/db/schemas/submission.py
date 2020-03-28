from typing import Optional
from pydantic import BaseModel


class SubmissionBase(BaseModel):
    survey_current_location: Optional[str]
    survey_normal_location: Optional[str]
    survey_normal_location_other: Optional[str]
    survey_location_performance: Optional[str]
    survey_applications: Optional[str]
    survey_other_software: Optional[str]
    survey_isp: Optional[str]
    survey_subscribe_download: Optional[str]
    survey_subscribe_upload: Optional[str]
    survey_bundle: Optional[str]
    survey_current_cost: Optional[str]
    survey_partner_org: Optional[str]
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
