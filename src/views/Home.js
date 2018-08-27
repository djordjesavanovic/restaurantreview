import React, {Component} from 'react';
import {Map, GoogleApiWrapper, Marker, InfoWindow} from 'google-maps-react';
import { Card, CardHeader, CardBody, CardFooter } from "react-simple-card";
import ReactStars from "react-stars";

class Home extends Component {

    state = {
        activeMarker: {},
        selectedPlace: [],
        showingInfoWindow: false,
        initialLocation: {},
        name: '',
        lat: '',
        lng: '',
        places: [],
        selectedRestaurant: "ChIJpaqqqm6qbUcRpqDvvWOJihk",
        map: {},
        reviews: []

    };

    ratingChanged = (newRating) => {
        console.log(newRating)
    }

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
                console.log("Place, onRestClick: ", place);
            }
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
                    this.setState({ places: results });
                    console.log(results);
            });

        });

    };

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
                                onClick={this.onMapClicked}
                                onReady={this.onMapReady}
                                zoom={17}
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
                            {this.state.places.map(((restaurant, i) => {
                                return (
                                    <Card key={i}>
                                        {console.log(i)}
                                        <CardHeader>
                                            <div>
                                                <strong data-id={restaurant.place_id} onClick={this.onRestaurantClick.bind(this)}>{restaurant.name}</strong>
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
                                            {
                                                !this.state.reviews ? <div/> :
                                                    this.state.reviews.map(((review, i) => {
                                                        return (
                                                            <div key={i}>
                                                                <p>{review.author_name}</p>
                                                                <p>{review.text}</p>
                                                                <p>{review.rating}</p>
                                                            </div>
                                                        )
                                                    }))
                                            }
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

            </main>
        );
    }
}

export default GoogleApiWrapper({
    apiKey: ('AIzaSyAlA2_i0e46q-1FlJckttOZvuqwZkrXKHk')
})(Home)
