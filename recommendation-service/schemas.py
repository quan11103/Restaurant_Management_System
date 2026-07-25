from pydantic import BaseModel
from typing import List


class RecommendRequest(BaseModel):
    clientId: int
    topK: int = 10


class HistoryItem(BaseModel):
    dishId: int
    interaction: float


class NewUserRequest(BaseModel):
    history: List[HistoryItem]
    topK: int = 10


class RecommendResponse(BaseModel):
    dishIds: List[int]