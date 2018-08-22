import React, {Component} from 'react';
import MapContainer from "../components/MapContainer";

class Home extends Component {
    render () {
        return (
            <main role="main">

                <div className="container-fluid">
                    <div className="row">
                        <div className="col-9" id="map">
                            <MapContainer
                                centerAroundCurrentLocation={true}
                            />
                        </div>
                        <div className="col-3" id="sidebar">

                        </div>
                    </div>
                </div>

            </main>
        );
    }
}

export default Home
