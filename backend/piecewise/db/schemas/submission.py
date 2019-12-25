from pydantic import BaseModel


class SubmissionBase(BaseModel):
    survey_service_type: str
    survey_outages: str
    survey_disruptions: str
    survey_subscribe_upload: str
    survey_subscribe_download: str
    survey_bundle: str
    survey_current_cost: str
    survey_satisfaction: str
    survey_carrier_choice: str
    survey_story: str
    survey_email: str
    survey_phone: str
    actual_download: int
    actual_upload: int
    min_rtt: int
    latitude: float
    longitude: float
    bigquery_key: str


class SubmissionCreate(SubmissionBase):
    pass


class SubmissionUpdate(SubmissionBase):
    id: int

    # owner_id: int

    class Config:
        orm_mode = True
