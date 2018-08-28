import React, {Component} from 'react';
import {Map, GoogleApiWrapper, Marker, InfoWindow} from 'google-maps-react';
import { Card, CardHeader, CardBody, CardFooter } from "react-simple-card";
import ReactStars from "react-stars";
import Modal from 'react-responsive-modal';

const Reviews = ({ reviews }) => (
    <div>{reviews && reviews.map((review, i) =>
        <div key={i}>
            <div className="row">
                <div className="col-12">
                    <hr />
                    <small><strong>{review.author_name} | Rating: {review.rating}</strong></small>
                </div>
            </div>
            <div className="row">
                <div className="col-12">
                    <small>{review.text}</small>
                    <hr />
                </div>
            </div>
        </div>
    )}</div>
);

class Home extends Component {

    constructor(props) {
        super(props);

        this.state = {
            activeMarker: {},
            selectedPlace: [],
            showingInfoWindow: false,
            initialLocation: {},
            name: '',
            lat: '',
            lng: '',
            places: [],
            unfilteredPlaces: [],
            selectedRestaurant: "ChIJpaqqqm6qbUcRpqDvvWOJihk",
            map: {},
            reviews: [],
            modalOpen: false,
            minRating: '',
            maxRating: '',
            addPlaceModal: false,
            placeName: ''
        };

        this.filterPlaces = this.filterPlaces.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.onSaveRestaurant = this.onSaveRestaurant.bind(this);
        this.clearFilter = this.clearFilter.bind(this);
    }

    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    ratingChanged = (newRating) => {
        console.log(newRating)
    };


    onMarkerClick = (props, marker) => {
        this.setState({
            activeMarker: marker,
            selectedPlace: marker,
            showingInfoWindow: true
        });
    };

    onInfoWindowClose = () =>
        this.setState({
            activeMarker: null,
            showingInfoWindow: false
        });

    onMapClicked = () => {

        if (this.state.showingInfoWindow)
            this.setState({
                activeMarker: null,
                showingInfoWindow: false
            });
    };

    getClickLocation() {

        const { google } = this.props;

        let map = this.state.map;

        this.setState({
            addPlaceModal: true
        });

        map.addListener('click', function(e) {
            placeMarker(e.latLng, map);
        });

        let infowindow = new google.maps.InfoWindow({
            content: this.state.placeName
        });

        const placeMarker = (position, map) => {
            let marker = new google.maps.Marker({
                position: position,
                map: map
            });

            marker.addListener('click', function() {
                infowindow.open(map, marker);
            });
        }
    }

    onSaveRestaurant() {
        this.setState({
            placeName: this.state.placeName,
            addPlaceModal: false
        })
    }

    onCloseModal = () => {
        this.setState({
            modalOpen: false,
            addPlaceModal: false
        });
    };

    onRestaurantClick(e) {
        this.setState({
            selectedRestaurant: e.currentTarget.dataset.id
        });

        const { google } = this.props;

        let map = this.state.map;

        let service = new google.maps.places.PlacesService(map);

        const request = {
            placeId: this.state.selectedRestaurant
        };

        service.getDetails(request, (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                this.setState({reviews: place.reviews});
            }
        });

        this.setState({
            modalOpen: true,
            reviews: null
        });
    };

    onMapReady = (mapProps, map) => {
        this.searchNearby(map);
        this.setState({map: map});
    };

    searchNearby = (map) => {

        const { google } = this.props;

        navigator.geolocation.getCurrentPosition((position) => {
            let initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(initialLocation);

            this.setState({initialLocation: initialLocation});

            const service = new google.maps.places.PlacesService(map);

            // Specify location, radius and place types for your Places API search.
            const request = {
                location: initialLocation,
                radius: '500',
                type: ['restaurant'],
            };

            service.nearbySearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK)
                    this.setState({
                        places: results,
                        unfilteredPlaces: results
                    });
            });

        });

    };

    filterPlaces() {

        const restaurants = this.state.places;

        const filteredRestaurant = restaurants.filter(restaurant => {
            return (
                restaurant.rating > this.state.minRating && restaurant.rating < this.state.maxRating
            );
        });

        this.setState({ places: filteredRestaurant });
    }

    clearFilter() {
        this.setState({ places: this.state.unfilteredPlaces });
    }

    render() {

        const icon = {
            url: "https://image.flaticon.com/icons/svg/149/149060.svg",
            scaledSize: new this.props.google.maps.Size(90, 42),
        };

        return (
            <main role="main">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-8" id="map">
                            <Map
                                className="map"
                                google={this.props.google}
                                onClick={() => {this.onMapClicked(); this.getClickLocation()}}
                                onReady={this.onMapReady}
                                zoom={16}
                            >
                                <Marker
                                    icon={icon}
                                    position={this.state.initialLocation}
                                />

                                {this.state.places.map(((place) => {
                                    return <Marker onClick={this.onMarkerClick} name={place.name} id={place.id} key={place.id} position={{lat: place.geometry.location.lat(), lng: place.geometry.location.lng()}} />
                                }))}

                                <InfoWindow
                                    marker={this.state.activeMarker}
                                    onClose={this.onInfoWindowClose}
                                    visible={this.state.showingInfoWindow}>
                                    {
                                        !this.state.selectedPlace.position
                                            ?
                                            <p>Loading data...</p>
                                            :
                                            <div>
                                                <p style={{width: 200}}>{this.state.selectedPlace.name}</p>
                                                <img src={"https://maps.googleapis.com/maps/api/streetview?size=200x200&location=" + this.state.selectedPlace.position.lat() + "," + this.state.selectedPlace.position.lng() + "&fov=90&heading=235&pitch=10&key=AIzaSyAlA2_i0e46q-1FlJckttOZvuqwZkrXKHk"} alt="Street View Pic"/>
                                            </div>
                                    }
                                </InfoWindow>
                            </Map>
                        </div>
                        <div className="col-4" id="sidebar">
                            <div className="mb-3">
                                <div className="input-group">
                                    <input type="number" placeholder="Min. Stars" className="form-control" name="minRating" value={this.state.minRating} onChange={this.handleChange} />
                                    <input type="number" placeholder="Max. Stars" className="form-control" name="maxRating" value={this.state.maxRating} onChange={this.handleChange} />
                                </div>
                                <div className="row mt-2">
                                    <div className="col-6">
                                        <button type="button" onClick={this.filterPlaces} className="btn btn-primary btn-block form-control">Filter</button>
                                    </div>
                                    <div className="col-6">
                                        <button type="button" onClick={this.clearFilter} className="btn btn-primary btn-block form-control">Clear</button>
                                    </div>
                                </div>
                            </div>
                            {this.state.places.map(((restaurant, i) => {
                                return (
                                    <Card key={i}>
                                        <CardHeader>
                                            <div>
                                                <strong className="restaurantName" data-id={restaurant.place_id} onClick={this.onRestaurantClick.bind(this)}>{restaurant.name}</strong>
                                            </div>
                                        </CardHeader>
                                        <CardBody>
                                            <ReactStars
                                                count={5}
                                                value={!restaurant.rating ? 0 : restaurant.rating}
                                                onChange={this.ratingChanged}
                                                size={18}
                                                color2={'#ffd700'}
                                            />
                                        </CardBody>
                                        <CardFooter>
                                            <div>
                                                <small>{restaurant.vicinity}</small>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                )
                            }))}
                        </div>
                    </div>
                </div>
                <Modal open={this.state.modalOpen} onClose={this.onCloseModal} center>
                    <h3>Reviews:</h3>
                    <Reviews reviews={this.state.reviews} />
                </Modal>

                <Modal open={this.state.addPlaceModal} onClose={this.onCloseModal} center>
                    <h3>Add a new place</h3>

                    <div className="row">
                        <div className="col-12">
                            <strong>Place name:</strong>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <input type="text" placeholder="e.g. Robby's Diner" className="form-control" name="placeName" value={this.state.placeName} onChange={this.handleChange} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <button type="button" onClick={this.onSaveRestaurant} className="btn btn-primary btn-block form-control">Add place</button>
                        </div>
                    </div>
                </Modal>
            </main>
        );
    }
}

export default GoogleApiWrapper({
    apiKey: ('AIzaSyAlA2_i0e46q-1FlJckttOZvuqwZkrXKHk')
})(Home)
