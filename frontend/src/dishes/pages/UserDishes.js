import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import DishList from '../components/DishList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';

const UserDishes = () => {
    const [loadedDishes, setLoadedDishes] = useState();
    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    const userId = useParams().userId;

    useEffect(() => {
        const fetchDishes = async () => {
            try {
                const responseData = await sendRequest(
                    `${process.env.REACT_APP_BACKEND_URL}/dishes/user/${userId}`
                );
                setLoadedDishes(responseData.dishes);
            } catch (err) {}
        };
        fetchDishes();
    }, [sendRequest, userId]);

    const dishDeletedHandler = (deletedDishId) => {
        setLoadedDishes(prevDishes => prevDishes.filter(dish => dish.id !== deletedDishId)
        );
    };

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && (
                <div className="center">
                <LoadingSpinner />
                </div>
            )}
            {!isLoading && loadedDishes && (<DishList items={loadedDishes} onDeleteDish={dishDeletedHandler} />)}
        </React.Fragment>
    )

};

export default UserDishes;