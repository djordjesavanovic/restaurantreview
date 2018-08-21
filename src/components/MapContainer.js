import React, { Component } from 'react';
import {Map, GoogleApiWrapper, Marker} from 'google-maps-react';

const Listing = ({ places }) => (
    places && places.map(p => <Marker key={p.id} name={p.name} position={{ lat: p.geometry.location.lat(), lng: p.geometry.location.lng() }}/>)
);

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

        const service = new google.maps.places.PlacesService(map);

        // Specify location, radius and place types for your Places API search.
        const request = {
            location: center,
            radius: '500',
            type: ['food']
        };

        service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK)
                this.setState({ places: results });
                console.log();
        });
    };

    render() {
        return(
            <Map
                className="map"
                google={this.props.google}
                onReady={this.onMapReady}
                initialCenter={this.centerAroundCurrentLocation}
            >
                <Listing places={this.state.places} />
            </Map>
        );
    }
}

export default GoogleApiWrapper({
    apiKey: ('AIzaSyD_PmkYQ4Dl6uLsm0t1Z-zi8FzckLYscJs')
})(MapContainer)