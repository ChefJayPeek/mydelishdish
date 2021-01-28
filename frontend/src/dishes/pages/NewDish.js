import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import { 
    VALIDATOR_MINLENGTH, 
    VALIDATOR_REQUIRE 
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';

import './DishForm.css';

const NewDish = () => {
    const auth = useContext(AuthContext);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [formState, inputHandler] = useForm(
        {
            title: {
                value: '',
                isValid: false
            },
            description: {
                value: '',
                isValid: false
            },
            address: {
                value: '',
                isValid: false
            },
            stars: {
                value: '',
                isValid: false
            },
            name: {
                value: '',
                isValid: false
            },
            image: {
                value: null,
                isValid: false
            }
        }, false
    );

    const history = useHistory();
    
    const dishSubmitHandler = async event => {
        event.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', formState.inputs.title.value);
            formData.append('description', formState.inputs.description.value);
            formData.append('address', formState.inputs.address.value);
            formData.append('stars', formState.inputs.stars.value);
            formData.append('name', formState.inputs.name.value);
            formData.append('image', formState.inputs.image.value);
            await sendRequest(
                process.env.REACT_APP_BACKEND_URL + '/dishes', 
                'POST',
                formData,
                {Authorization: 'Bearer ' + auth.token}
            );
            history.push('/');
        } catch (err) {}
    };

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            <form className="dish-form" onSubmit={dishSubmitHandler}>
                {isLoading && <LoadingSpinner asOverlay />}
                <Input
                    id="title" 
                    element="input" 
                    type="text" 
                    label="Restaurant Name" 
                    validators={[VALIDATOR_REQUIRE()]} 
                    errorText="Please enter a valid title."
                    onInput={inputHandler}
                />
                <Input
                    id="name" 
                    element="input" 
                    type="text" 
                    label="Dish Name" 
                    validators={[VALIDATOR_REQUIRE()]} 
                    errorText="Please enter a valid dish name."
                    onInput={inputHandler}
                />
                <Input 
                    id="description"
                    element="textarea" 
                    label="Description" 
                    validators={[VALIDATOR_MINLENGTH(5)]} 
                    errorText="Please enter a valid description (at least 5 characters)."
                    onInput={inputHandler}
                />
                <Input
                    id="address" 
                    element="input" 
                    label="Address" 
                    validators={[VALIDATOR_REQUIRE()]} 
                    errorText="Please enter a valid address."
                    onInput={inputHandler}
                />
                <Input
                    id="stars" 
                    element="input" 
                    label="Star Rating 1 - 5" 
                    validators={[VALIDATOR_MINLENGTH(1)]} 
                    errorText="Please enter a number 1 to 5."
                    onInput={inputHandler}
                />
                <ImageUpload 
                    id="image" 
                    onInput={inputHandler}
                    errorText="Please provide an image."
                />
                <Button type="submit" disabled={!formState.isValid}>
                    ADD DISH
                </Button>
            </form>
        </React.Fragment>
    );
};

export default NewDish;