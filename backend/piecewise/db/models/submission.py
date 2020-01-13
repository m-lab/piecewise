from sqlalchemy import Column, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from .base import Base


class Submission(Base):
    id = Column(Integer, primary_key=True, index=True)
    survey_service_type = Column(String)
    survey_outages = Column(String)
    survey_disruptions = Column(String)
    survey_subscribe_upload = Column(String)
    survey_subscribe_download = Column(String)
    survey_bundle = Column(String)
    survey_current_cost = Column(String)
    survey_satisfaction = Column(String)
    survey_carrier_choice = Column(String)
    survey_story = Column(String)
    survey_email = Column(String, index=True)
    survey_phone = Column(String, index=True)
    actual_download = Column(Numeric)
    actual_upload = Column(Numeric)
    min_rtt = Column(Numeric)
    latitude = Column(Numeric)
    longitude = Column(Numeric)
    bigquery_key = Column(String)
    owner_id = Column(Integer, ForeignKey("user.id"))
    owner = relationship("User", back_populates="submissions")
