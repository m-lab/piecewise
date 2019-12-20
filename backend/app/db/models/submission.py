from sqlalchemy import Column, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .base import Base


class Submission(Base):
    id = Column(Integer, primary_key=True, index=True)
    isp_user = Column(String, index=True)
    other_isp = Column(String, index=True)
    connection_type = Column(String, index=True)
    cost_of_service = Column(String, index=True)
    advertised_download = Column(Integer)
    advertised_upload = Column(Integer)
    actual_download = Column(Integer)
    actual_upload = Column(Integer)
    min_rtt = Column(Integer)
    latitude = Column(Float(precision=64))
    longitude = Column(Float(precision=64))
    owner_id = Column(Integer, ForeignKey("user.id"))
    owner = relationship("User", back_populates="submissions")
