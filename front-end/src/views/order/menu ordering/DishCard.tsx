import React from 'react';
import { type Dish } from './MenuOrderingView';
import './DishCard.css';

interface DishCardProps {
    dish: Dish;
    onClick: (dish: Dish) => void;
}

const DishCard: React.FC<DishCardProps> = ({ dish, onClick }) => {
    return (
        <div
            className={`dish-card ${!dish.isAvailable ? 'unavailable' : ''}`}
            onClick={() => onClick(dish)}
        >
            <div className="dish-img-container">
                {dish.image ? (
                    <img
                        src={dish.image}
                        alt={dish.name}
                        className="dish-img"
                        loading="lazy"
                    />
                ) : (
                    <div className="dish-img-fallback">
                        <span>No Image</span>
                    </div>
                )}
                {!dish.isAvailable && <span className="badge-unavailable">Tạm ngừng</span>}
            </div>
            <div className="dish-info">
                <h4>{dish.name}</h4>
                <p className="dish-price">{dish.price.toLocaleString()} đ</p>
            </div>
        </div>
    );
};

export default DishCard;