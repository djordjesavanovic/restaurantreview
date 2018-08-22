import React, { Component } from 'react';
import {Map, GoogleApiWrapper, Marker} from 'google-maps-react';

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
        console.log("rendering with", this.state.places)
        return(
            <Map
                className="map"
                google={this.props.google}
                onReady={this.onMapReady}
            >
                {this.state.places.map(((place) => {
                    console.log("place", place)
                    return <Marker key={place.id} position={{lat: place.geometry.location.lat(), lng: place.geometry.location.lng()}} />
                }))}
            </Map>
        );
    }
}

export default GoogleApiWrapper({
    apiKey: ('AIzaSyD_PmkYQ4Dl6uLsm0t1Z-zi8FzckLYscJs')
})(MapContainer)