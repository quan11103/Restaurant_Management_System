from pathlib import Path

from fastapi import FastAPI

from recommender import ALSRecommender
from schemas import (
    RecommendRequest,
    RecommendResponse,
    NewUserRequest,
)

app = FastAPI()

recommender = ALSRecommender(
    model_path=Path("model/als_model.pkl"),
    mappings_path=Path("model/mappings.pkl"),
    interactions_path=Path("output/train_interactions.csv"),
)

print("Recommender initialized.")


@app.get("/health")
def health():

    info = recommender.info()

    return {
        "status": "ok",
        **info,
    }


@app.post(
    "/recommend/user",
    response_model=RecommendResponse,
)
def recommend_existing_user(request: RecommendRequest):

    dish_ids = recommender.recommend_existing_user(
        client_id=request.clientId,
        top_k=request.topK,
        exclude_dish_ids=request.excludeDishIds,
    )

    return RecommendResponse(
        dishIds=dish_ids
    )


@app.post(
    "/recommend/new-user",
    response_model=RecommendResponse,
)
def recommend_new_user(request: NewUserRequest):

    history = [
        (item.dishId, item.interaction)
        for item in request.history
    ]

    dish_ids = recommender.recommend_new_user(
        history=history,
        top_k=request.topK,
        exclude_dish_ids=request.excludeDishIds,
    )

    return RecommendResponse(
        dishIds=dish_ids
    )