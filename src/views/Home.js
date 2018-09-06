import React, {Component} from 'react';
import {Map, GoogleApiWrapper, Marker, InfoWindow} from 'google-maps-react';
import { Card, CardHeader, CardBody, CardFooter } from "react-simple-card";
import ReactStars from "react-stars";
import Modal from 'react-responsive-modal';
import randomString from 'random-string';

// Reviews component
const Reviews = ({ reviews }) => (
    <div>{reviews.map((review, i) =>
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
            selectedRestaurant: "",
            map: {},
            reviews: [],
            modalOpen: false,
            minRating: '',
            maxRating: '',
            addPlaceModal: false,
            placeName: '',
            setRating: null,
            author: '',
            reviewText: ''
        };

        this.filterPlaces = this.filterPlaces.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.onSaveRestaurant = this.onSaveRestaurant.bind(this);
        this.clearFilter = this.clearFilter.bind(this);
        this.getClickLocation = this.getClickLocation.bind(this);
        this.leaveReview = this.leaveReview.bind(this);
    }

    // Handles input changes for values stored in state
    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    // Handles changes for the rating component
    ratingChanged = (setRating) => {
        this.setState({
            setRating: setRating
        })
    };

    // Integrated handler for recognizing the selected marker and opening its InfoWindow (google-maps-react)
    onMarkerClick = (props, marker) => {
        this.setState({
            activeMarker: marker,
            selectedPlace: marker,
            showingInfoWindow: true
        });
    };

    // Integrated handler for closing an InfoWindow and removing the active Marker from state, when a user clicks on the X (google-maps-react)
    onInfoWindowClose = () =>
        this.setState({
            activeMarker: null,
            showingInfoWindow: false
        });

    // Integrated handler for closing an InfoWindow and removing the active Marker from state, when a user clicks on the map (google-maps-react)
    onMapClicked = () => {
        if (this.state.showingInfoWindow)
            this.setState({
                activeMarker: null,
                showingInfoWindow: false,
                reviews: []
            });
    };

    // Method for gathering the newly added restaurant's name and adding it to the places array in the state - also closes the modal window
    onSaveRestaurant() {
        this.setState({
            placeName: this.state.placeName,
            addPlaceModal: false,
        }, () => {
            this.setState({
                placeName: '',
                places: [...this.state.places, {name: this.state.placeName, place_id: randomString(this.state.placeName), id: randomString(this.state.placeName), author_name: this.state.author, rating: null, vicinity: this.state.formatted_address, geometry: {location: this.state.newMarkerLoc}}]
            })
        });

    }

    /* Method which gathers the location (latLng) from a double click on the map,
    converts it into a formatted address and opens up the modal window for adding a new restaurant */
    getClickLocation() {
        const { google } = this.props;
        let map = this.state.map;
        let geocoder = new google.maps.Geocoder();


        // Listener, which gathers the latitude & longitude on the selected place - double click
        map.addListener('dblclick', e => {
            this.setState({
                newMarkerLoc: e.latLng,
                newMarkerLocLat: e.latLng.lat(),
                newMarkerLocLng: e.latLng.lng(),
                addPlaceModal: true
            }, () => {
                geocodeLatLng(geocoder, map);
            });
        });


        // Reverse geocoding to get the physical address, base on the previously collected latitude & longitude
        const geocodeLatLng = (geocoder, map) => {
            let latlng = {lat: parseFloat(this.state.newMarkerLocLat), lng: parseFloat(this.state.newMarkerLocLng)};
            geocoder.geocode({'location': latlng}, (results, status) => {
                if (status === 'OK') {
                    if (results[0]) {
                        this.setState({
                            formatted_address: results[0].formatted_address
                        })
                    } else {
                        window.alert('No results found');
                    }
                } else {
                    window.alert('Geocoder failed due to: ' + status);
                }
            });
        }

    }

    // Simply closes the modal window
    onCloseModal = () => {
        this.setState({
            modalOpen: false,
            addPlaceModal: false,
        });
    };

    /* Picks up the ID of a selected restaurant in the side menu and requests its details from the Places API.
    Then it populates the reviews array in the state and opens up the modal window, displaying said reviews */
    onRestaurantClick(e) {
        this.setState({
            selectedRestaurant: e.currentTarget.dataset.id
        }, () => {

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
                console.log(this.state.reviews);
            });

            this.setState({
                modalOpen: true,
            });
        });
    };

    // Integrated method, which calls the searchNearby method and adds the map infos to the state (google-maps-react)
    onMapReady = (mapProps, map) => {
        this.searchNearby(map);
        this.setState({map: map});
    };

    // Integrated method, which finds user's location and based on it, it finds the nearest restaurants
    searchNearby = (map) => {

        const { google } = this.props;

        // Finds user's location
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

            // Finds nearest restaurant
            service.nearbySearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK)
                    this.setState({
                        places: results,
                        unfilteredPlaces: results
                    });
            });

        });

    };

    // Method, which filters the gathered restaurants, based on the lowest and highest rating
    filterPlaces() {
        const restaurants = this.state.places;

        const filteredRestaurant = restaurants.filter(restaurant => {
            return (
                restaurant.rating > this.state.minRating && restaurant.rating < this.state.maxRating
            );
        });

        this.setState({ places: filteredRestaurant });
    }

    // Method, which clears the filters and returns the original, unfiltered restaurants
    clearFilter() {
        this.setState({
            places: this.state.unfilteredPlaces,
            minRating: '',
            maxRating: ''
        });
    }

    // Method which adds the pre-entered review into the reviews array in the state
    leaveReview() {
        this.setState({
                reviews: [...this.state.reviews || [], {text: this.state.reviewText, author_name: this.state.author, rating: this.state.setRating}]
            });

        this.setState({
            reviewText: '',
            author: '',
            setRating: null
        })
    }

    render() {

        // Custom icon for user's location
        const icon = {
            url: "https://image.flaticon.com/icons/svg/149/149060.svg",
            scaledSize: new this.props.google.maps.Size(90, 42),
        };

        return (
            <main role="main">
                <div className="container-fluid">
                    <div className="row">

                        {/* Map area */}
                        <div className="col-8" id="map">
                            <Map
                                className="map"
                                google={this.props.google}
                                onClick={() => {this.onMapClicked(); this.getClickLocation()}}
                                onReady={this.onMapReady}
                                zoom={16}
                            >

                                {/* User's location */}
                                <Marker
                                    icon={icon}
                                    position={this.state.initialLocation}
                                />


                                {/* Mapping out markers on the map */}
                                {this.state.places.map(((place) => {
                                    return <Marker onClick={this.onMarkerClick} name={place.name} id={place.id} key={place.id} position={{lat: place.geometry.location.lat(), lng: place.geometry.location.lng()}} />
                                }))}

                                {/* InfoWindow component, which shows up, based on the selected marker */}
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

                        {/* Side menu */}
                        <div className="col-4" id="sidebar">
                            <div className="mb-3">
                                <div className="input-group">
                                    <input type="number" placeholder="Min. Stars" className="form-control" name="minRating" value={this.state.minRating} onChange={this.handleChange} />
                                    <input type="number" placeholder="Max. Stars" className="form-control" name="maxRating" value={this.state.maxRating} onChange={this.handleChange} />
                                </div>
                                <div className="row mt-2">
                                    <div className="col-6">
                                        {
                                            (!this.state.minRating || !this.state.maxRating) ?
                                                <button type="button" onClick={this.filterPlaces} className="btn btn-primary btn-block form-control" disabled>Filter</button>
                                                :
                                                <button type="button" onClick={this.filterPlaces} className="btn btn-primary btn-block form-control">Filter</button>
                                        }
                                    </div>
                                    <div className="col-6">
                                        <button type="button" onClick={this.clearFilter} className="btn btn-primary btn-block form-control">Clear</button>
                                    </div>
                                </div>
                            </div>


                            {/* Mapping out the restaurants in the side menu */}
                            {this.state.places.map(((restaurant, i) => {
                                return (
                                    <div key={i} data-id={restaurant.place_id} onClick={this.onRestaurantClick.bind(this)}>
                                        <Card>
                                            <CardHeader>
                                                <div>
                                                    <strong className="restaurantName">{restaurant.name}</strong>
                                                </div>
                                            </CardHeader>
                                            <CardBody>
                                                <ReactStars
                                                    count={5}
                                                    value={!restaurant.rating ? 0 : restaurant.rating}
                                                    onChange={this.ratingChanged}
                                                    size={18}
                                                    color2={'#ffd700'}
                                                    edit={false}
                                                />
                                            </CardBody>
                                            <CardFooter>
                                                <div>
                                                    <small>{restaurant.vicinity}</small>
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    </div>
                                )
                            }))}
                        </div>
                    </div>
                </div>

                {/* Modals */}

                {/* Reviews modal window */}
                <Modal open={this.state.modalOpen} onClose={this.onCloseModal} center>
                    <div className="row">
                        <div className="col-12">
                            <h3>Reviews:</h3>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12">
                            {!this.state.reviews ? <div className="mt-2 mb-2"><h4>There are currently no reviews for this place.</h4></div> :
                                <Reviews reviews={this.state.reviews}/>
                            }
                        </div>
                    </div>

                    {/* Leave a review */}
                    <div className="row">
                        <div className="col-12">
                            <h5>Leave a review</h5>
                            <div className="input-group mb-1">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">Author</span>
                                </div>
                                <input type="text" aria-label="Author" className="form-control" placeholder="e.g. John Doe" name="author" value={this.state.author} onChange={this.handleChange}/>
                            </div>

                            <div className="input-group mb-1">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">Rating</span>
                                </div>
                                <ReactStars
                                    count={5}
                                    value={this.state.setRating}
                                    onChange={this.ratingChanged}
                                    size={18}
                                    color2={'#ffd700'}
                                    className="form-control"
                                />
                            </div>

                            <div className="input-group mb-1">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">Review</span>
                                </div>
                                <input type="text" aria-label="Review" className="form-control" placeholder="e.g. A very nice place." name="reviewText" value={this.state.reviewText} onChange={this.handleChange} />
                            </div>

                            {
                                (!this.state.author || !this.state.setRating || !this.state.reviewText) ?
                                    <button className="btn-secondary btn-block form-control" disabled>Fill out the form to submit</button> :
                                    <button onClick={this.leaveReview} className="btn-primary btn-block form-control">Submit a review</button>
                            }
                        </div>
                    </div>
                </Modal>

                {/* Add a new place modal window */}
                <Modal open={this.state.addPlaceModal} onClose={this.onCloseModal} center>
                    <div style={{padding: 20}}>
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
                    </div>
                </Modal>

            </main>
        );
    }
}

export default GoogleApiWrapper({
    apiKey: ('AIzaSyAlA2_i0e46q-1FlJckttOZvuqwZkrXKHk')
})(Home)
