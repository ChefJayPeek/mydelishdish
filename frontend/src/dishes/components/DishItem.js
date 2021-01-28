import React, { useState, useContext } from 'react';
import ReactStars from 'react-stars';

import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import Modal from '../../shared/components/UIElements/Modal';
import Map from '../../shared/components/UIElements/Map';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { AuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import './DishItem.css';

const DishItem = props => {
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const auth = useContext(AuthContext);
    const [showMap, setShowMap] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    
    const openMapHandler = () => setShowMap(true);
    
    const closeMapHandler = () => setShowMap(false);

    const showDeleteWarningHandler = () => {
        setShowConfirmModal(true);
    };

    const cancelDeleteHandler = () => {
        setShowConfirmModal(false);
    };

    const confirmDeleteHandler = async () => {
        setShowConfirmModal(false);
        try {
            await sendRequest(
                `${process.env.REACT_APP_BACKEND_URL}/dishes/${props.id}`,
            'DELETE',
            null,
            {
                Authorization: 'Bearer ' + auth.token
            }
            );
            props.onDelete(props.id);
        } catch (err) {}
    };

    return (
        <React.Fragment>
        <ErrorModal error={error} onClear={clearError} />
            <Modal 
                show={showMap} 
                onCancel={closeMapHandler} 
                header={props.address} 
                contentClass="dish-item__modal-content" 
                footerClass="dish-item__modal-actions" 
                footer={<Button onClick={closeMapHandler}>CLOSE</Button>}
            >
                <div className="map-container">
                    <Map center={props.coordinates} zoom={16} />
                </div>
            </Modal>
            <Modal 
                show={showConfirmModal}
                onCancel={cancelDeleteHandler}
                header="Are you sure?" 
                footerClass="dish-item__modal-actions" 
                footer={
                <React.Fragment>
                    <Button inverse onClick={cancelDeleteHandler}>
                        CANCEL
                    </Button>
                    <Button danger onClick={confirmDeleteHandler}>
                    DELETE
                    </Button>
                </React.Fragment>
                }
            >
                <p>
                Do you want to proceed and delete this dish? Please note that it can't be undone.
                </p>
            </Modal>
            <li className="dish-item">
                <Card className="dish-item__content">
                    {isLoading && <LoadingSpinner asOverlay />}
                    <div className="dish-item__image">
                        <img 
                        src={`${process.env.REACT_APP_ASSET_URL}/${props.image}`} 
                        alt={props.title}
                        />
                    </div>
                    <div className="dish-item__info">
                        <h2>{props.name}</h2>
                        <ReactStars className="center" count={5} value={props.stars} />
                        <h4>{props.title}</h4>
                        <h4>{props.address}</h4>
                        <p>{props.description}</p>
                    </div>
                    <div className="dish-item__actions">
                        <Button inverse onClick={openMapHandler}>
                        VIEW ON MAP
                        </Button>
                        {auth.userId === props.creatorId && (
                            <Button to={`/dishes/${props.id}`}>EDIT</Button>
                            )}

                        {auth.userId === props.creatorId && (
                            <Button danger onClick={showDeleteWarningHandler}>
                        DELETE
                        </Button>
                        )}
                    </div>
                </Card>
            </li>
        </React.Fragment>
    );
};

export default DishItem;