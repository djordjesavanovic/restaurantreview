import React, {Component} from 'react';
import {Map, GoogleApiWrapper, Marker, InfoWindow} from 'google-maps-react';
import { Card, CardHeader, CardBody, CardFooter } from "react-simple-card";

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
        selectedRestaurant: ''
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

    onRestaurantClick(e) {
        this.setState({
            selectedRestaurant: e.currentTarget.dataset.id
        });
    };

    onMapReady = (mapProps, map) => this.searchNearby(map, map.center);

    searchNearby = (map, center) => {

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
                        <div className="col-9" id="map">
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
                        <div className="col-3" id="sidebar">
                            {this.state.places.map(((restaurant) => {
                                return (
                                    <Card key={restaurant.id}>
                                        <CardHeader><strong data-id={restaurant.id} onClick={this.onRestaurantClick.bind(this)}>{restaurant.name}</strong></CardHeader>
                                        <CardBody>{restaurant.vicinity}</CardBody>
                                        <CardFooter>Rating: {!restaurant.rating ? "Rating not available" : restaurant.rating}</CardFooter>
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
