import React, { Component } from 'react';
import { Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react';

// const googleMapURL = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCYmGp0uOW185yXkNFzPLeE8a_n4ri_RKg&callback=initMap';

const Listing = ({ places }) => (
    <ul>{places && places.map(p => <li key={p.id}>{p.name}</li>)}</ul>
);

const pyrmont = {lat: -33.867, lng: 151.195};

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


    onMarkerClick = (props, marker) =>
        this.setState({
            activeMarker: marker,
            selectedPlace: props,
            showingInfoWindow: true
        });

    onInfoWindowClose = () =>
        this.setState({
            activeMarker: null,
            showingInfoWindow: false
        });

    componentDidMount() {

        fetch('https://api.myjson.com/bins/hsh1e')
            .then((response) => response.json())
            .then((findresponse) => {
                console.log(findresponse);
                this.setState({
                    name: findresponse.name,
                    lat: findresponse.lat,
                    lng: findresponse.lng
                });
            });
    }


    fetchPlaces(mapProps, map) {
        const {google} = mapProps;
        const service = new google.maps.places.PlacesService(map);
        console.log(service);
    }

    render() {
        return(
            <Map
                google={this.props.google}
                zoom={14}
                initialCenter={this.centerAroundCurrentLocation}
                onReady={this.fetchPlaces}
            >
                <Listing places={this.state.places} />
            </Map>
        );
    }
}

export default GoogleApiWrapper({
    apiKey: ('AIzaSyCYmGp0uOW185yXkNFzPLeE8a_n4ri_RKg')
})(MapContainer)