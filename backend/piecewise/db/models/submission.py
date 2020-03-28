from sqlalchemy import Column, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from .base import Base


class Submission(Base):
    id = Column(Integer, primary_key=True, index=True)
    survey_current_location = Column(String)
    survey_normal_location = Column(String)
    survey_normal_location_other = Column(String)
    survey_location_performance = Column(String)
    survey_applications = Column(String)
    survey_other_software = Column(String)
    survey_isp = Column(String)
    survey_subscribe_download = Column(String)
    survey_subscribe_upload = Column(String)
    survey_bundle = Column(String)
    survey_current_cost = Column(String)
    survey_partner_org= Column(String)
    actual_download = Column(Numeric)
    actual_upload = Column(Numeric)
    min_rtt = Column(Numeric)
    latitude = Column(Numeric)
    longitude = Column(Numeric)
    bigquery_key = Column(String)
    owner_id = Column(Integer, ForeignKey("user.id"))
    owner = relationship("User", back_populates="submissions")
