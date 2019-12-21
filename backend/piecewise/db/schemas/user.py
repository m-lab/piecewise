from typing import List

from pydantic import BaseModel

from .submission import SubmissionBase


class UserBase(BaseModel):
    email: str
    full_name: str


class UserCreate(UserBase):
    password: str


class UserUpdate(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    submissions: List[SubmissionBase] = []

    class Config:
        orm_mode = True
