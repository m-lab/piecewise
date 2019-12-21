from pydantic import BaseModel


class SubmissionBase(BaseModel):
    isp_user: str
    other_isp: str
    connection_type: str
    cost_of_service: str
    advertised_download: int
    advertised_upload: int
    actual_download: int
    actual_upload: int
    min_rtt: int
    latitude: float
    longitude: float


class SubmissionCreate(SubmissionBase):
    pass


class SubmissionUpdate(SubmissionBase):
    id: int

    # owner_id: int

    class Config:
        orm_mode = True
