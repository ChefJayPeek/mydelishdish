import React, { useEffect, useState, useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import { 
    VALIDATOR_REQUIRE, 
    VALIDATOR_MINLENGTH 
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import './DishForm.css';

const UpdateDish = () => {
    const auth = useContext(AuthContext);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [loadedDish, setLoadedDish] = useState();
    const dishId = useParams().dishId;
    const history = useHistory();
    
    const [formState, inputHandler, setFormData] = useForm(
        {
        title: {
            value: '',
            isValid: false
        },
        description: {
            value: '',
            isValid: false
        }
    }, 
    false
    );
    
    useEffect(() => {
        const fetchDish = async () => {
            try {
                const responseData = await sendRequest(
                    `${process.env.REACT_APP_BACKEND_URL}/dishes/${dishId}`
                );
                setLoadedDish(responseData.dish);
                setFormData(
                    {
                        title: {
                            value: responseData.dish.title,
                            isValid: true
                        },
                        description: {
                            value: responseData.dish.description,
                            isValid: true
                        }
                    }, 
                    true
                );
            } catch (err) {}
        };
        fetchDish();
    }, [sendRequest, dishId, setFormData]);
        
    const dishUpdateSubmitHandler = async event => {
        event.preventDefault();
        try {
            await sendRequest(
                `${process.env.REACT_APP_BACKEND_URL}/dishes/${dishId}`,
                'PATCH',
                JSON.stringify({
                    title: formState.inputs.title.value,
                    description: formState.inputs.description.value
                }),
                {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + auth.token
                }
            );
            history.push('/' + auth.userId + '/dishes');
        } catch (err) {}
    };

    if (isLoading) {
        return (
            <div className="center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!loadedDish && !error) {
        return (
            <div className="center">
                <Card>
                    <h2>Could not find dish!</h2>
                </Card>
            </div>
        );
    }

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {!isLoading && loadedDish && (
                <form className="dish-form" onSubmit={dishUpdateSubmitHandler}>
                <Input
                    id="title"
                    element="input"
                    type="text" 
                    label="Title" 
                    validators={[VALIDATOR_REQUIRE()]} 
                    errorText="Please enter a valid title."
                    onInput={inputHandler}
                    initialValue={loadedDish.title}
                    initialValid={true}
                />
                <Input
                    id="description"
                    element="textarea"
                    label="Description" 
                    validators={[VALIDATOR_MINLENGTH(5)]} 
                    errorText="Please enter a valid description (min. 5 characters)."
                    onInput={inputHandler}
                    initialValue={loadedDish.description}
                    initialValid={true}
                />
                <Button type="submit" disabled={!formState.isValid}>
                    UPDATE PLACE
                </Button>
            </form>
            )}
    </React.Fragment>
    );
};

export default UpdateDish;