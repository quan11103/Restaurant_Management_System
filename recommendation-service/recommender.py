from pathlib import Path

import joblib
import pandas as pd
import scipy.sparse as sparse


class ALSRecommender:

    def __init__(
        self,
        model_path: Path,
        mappings_path: Path,
        interactions_path: Path,
    ):

        print("Loading model...")

        self.model = joblib.load(model_path)

        mappings = joblib.load(mappings_path)

        self.user_to_index = mappings["user_to_index"]
        self.index_to_user = mappings["index_to_user"]

        self.item_to_index = mappings["item_to_index"]
        self.index_to_item = mappings["index_to_item"]

        print("Loading interactions...")

        interaction_df = pd.read_csv(interactions_path)

        interaction_df["userIndex"] = interaction_df["clientId"].map(
            self.user_to_index
        )

        interaction_df["itemIndex"] = interaction_df["dishId"].map(
            self.item_to_index
        )

        interaction_df = interaction_df.dropna(
            subset=["userIndex", "itemIndex"]
        )

        self.user_item_matrix = sparse.csr_matrix(
            (
                interaction_df["interaction"].astype(float),
                (
                    interaction_df["userIndex"].astype(int),
                    interaction_df["itemIndex"].astype(int),
                ),
            ),
            shape=(
                len(self.user_to_index),
                len(self.item_to_index),
            ),
        )

        print("Recommendation service is ready.")

    def recommend_existing_user(
        self,
        client_id: int,
        top_k: int = 8,
        exclude_dish_ids: list[int] | None = None,
    ) -> list[int]:

        if client_id not in self.user_to_index:
            return []

        user_index = self.user_to_index[client_id]

        exclude_dish_ids = set(exclude_dish_ids or [])

        item_indexes, _ = self.model.recommend(
            userid=user_index,
            user_items=self.user_item_matrix[user_index],
            N=top_k + len(exclude_dish_ids),
            filter_already_liked_items=True,
        )

        dish_ids = [
            self.index_to_item[item_index]
            for item_index in item_indexes
        ]

        dish_ids = [
            dish_id
            for dish_id in dish_ids
            if dish_id not in exclude_dish_ids
        ]

        return dish_ids[:top_k]

    def recommend_new_user(
        self,
        history: list[tuple[int, float]],
        top_k: int = 8,
        exclude_dish_ids: list[int] | None = None,
    ) -> list[int]:

        row = sparse.lil_matrix(
            (
                1,
                len(self.item_to_index),
            ),
            dtype=float,
        )

        for dish_id, interaction in history:

            if dish_id not in self.item_to_index:
                continue

            row[
                0,
                self.item_to_index[dish_id]
            ] = interaction

        row = row.tocsr()

        exclude_dish_ids = set(exclude_dish_ids or [])

        item_indexes, _ = self.model.recommend(
            userid=0,
            user_items=row,
            N=top_k + len(exclude_dish_ids),
            filter_already_liked_items=True,
            recalculate_user=True,
        )

        dish_ids = [
            self.index_to_item[item_index]
            for item_index in item_indexes
        ]

        dish_ids = [
            dish_id
            for dish_id in dish_ids
            if dish_id not in exclude_dish_ids
        ]

        return dish_ids[:top_k]

    def info(self):

        return {
            "users": len(self.user_to_index),
            "items": len(self.item_to_index),
        }