import React from 'react';

import Card from '../../shared/components/UIElements/Card';
import DishItem from './DishItem';
import Button from '../../shared/components/FormElements/Button';

import './DishList.css';

const DishList = props => {
    if (props.items.length === 0) {
        return (
            <div className="dish-list center">
                <Card>
                    <h2>No dishes found.  Maybe create one?</h2>
                    <Button to="/dishes/new">Share Dish</Button>
                </Card>
            </div>
        );
    }

    return (
        <ul className="dish-list">
            {props.items.map(dish => (
                <DishItem 
                key={dish.id} 
                id={dish.id} 
                image={dish.image} 
                title={dish.title}
                name={dish.name}
                stars={dish.stars} 
                description={dish.description} 
                address={dish.address} 
                creatorId={dish.creator} 
                coordinates={dish.location}
                onDelete={props.onDeleteDish}
                />
            ))}
        </ul>
    );
};

export default DishList;