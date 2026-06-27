import React from 'react';
import DishCard from './DishCard';
import { type Dish } from './MenuOrderingView';
import './DishGrid.css';

interface DishGridProps {
    dishes: Dish[];
    onDishClick: (dish: Dish) => void;
}

const DishGrid: React.FC<DishGridProps> = ({ dishes, onDishClick }) => {
    if (dishes.length === 0) {
        return (
            <div className="dish-grid-empty">
                <p>Không tìm thấy món ăn nào phù hợp với tìm kiếm của bạn.</p>
            </div>
        );
    }

    return (
        <div className="dish-grid-container">
            {dishes.map(dish => (
                <DishCard
                    key={dish.id}
                    dish={dish}
                    onClick={onDishClick}
                />
            ))}
        </div>
    );
};

export default DishGrid;