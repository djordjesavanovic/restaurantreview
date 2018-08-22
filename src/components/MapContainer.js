import React, { Component } from 'react';
import {Map, GoogleApiWrapper, Marker, InfoWindow} from 'google-maps-react';

const Listing = ({ places }) => {

    let out = places && places.map(p => <Marker key={p.id} name={p.name} position={{ lat: p.geometry.location.lat(), lng: p.geometry.location.lng() }}/>)
    return out
};

class MapContainer extends Component {

    state = {
        activeMarker: {},
        selectedPlace: {},
        showingInfoWindow: false,
        name: '',
        lat: '',
        lng: '',
        places: []
    };

    onMarkerClick = (props, place) =>
        this.setState({
            activeMarker: place,
            selectedPlace: place,
            showingInfoWindow: true
        });

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

    onMapReady = (mapProps, map) => this.searchNearby(map, map.center);

    searchNearby = (map, center) => {

        const { google } = this.props;

        navigator.geolocation.getCurrentPosition((position) => {
            let initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(initialLocation);

            const service = new google.maps.places.PlacesService(map);

            // Specify location, radius and place types for your Places API search.
            const request = {
                location: initialLocation,
                radius: '500',
                type: ['food']
            };

            console.log("initialLocation: ", initialLocation);

            service.nearbySearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK)
                    this.setState({ places: results });
            });

        });


    };

    onMarkerClicked(place) {
        // this.setState(cuure)
    }

    render() {

        return(
            <Map
                className="map"
                google={this.props.google}
                onClick={this.onMapClicked}
                onReady={this.onMapReady}
            >
                {this.state.places.map(((place) => {
                    console.log("place", place);
                    return <Marker onClick={this.onMarkerClick} name={place.name} key={place.id} position={{lat: place.geometry.location.lat(), lng: place.geometry.location.lng()}} />
                }))}

                <InfoWindow
                    marker={this.state.activeMarker}
                    onClose={this.onInfoWindowClose}
                    visible={this.state.showingInfoWindow}>
                    <div>
                        <img src="https://maps.googleapis.com/maps/api/streetview?size=400x400&location="{this.state.selectedPlace.geometry.location.lat()}","{this.state.selectedPlace.geometry.location.lng()}"&fov=90&heading=235&pitch=10&key=AIzaSyD_PmkYQ4Dl6uLsm0t1Z-zi8FzckLYscJs" />
                        <p>{this.state.selectedPlace.name}</p>
                        {console.log("Selected place: ", this.state.selectedPlace)}
                    </div>
                </InfoWindow>
            </Map>
        );
    }
}

export default GoogleApiWrapper({
    apiKey: ('AIzaSyD_PmkYQ4Dl6uLsm0t1Z-zi8FzckLYscJs')
})(MapContainer)