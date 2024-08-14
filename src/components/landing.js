import React from 'react';
import { Link } from 'react-router-dom';
import '../css/landing.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


function Landing() {

    return (
        <div className="d-flex flex-column min-vh-100">

            <div className="main-content">
                <div className="container container-custom mt-4">
                    <div className="row align-items-center">
                        {/* Text and Buttons Column */}
                        <div className="col-md-6 text-center">
                            <h1>Your Dream Team,<br />A Click Away</h1>
                            <div className="mt-3">
                                <button className="btn btn-custom mb-2">Admin</button>
                                <br />
                                <Link to="/login">
                                    <button className="btn btn-custom">Member</button>
                                </Link>                            </div>
                        </div>

                        {/* Image Column */}
                        <div className="col-md-6 text-center">
                            <img src="/img7.png" alt="Landing" className="img-fluid" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Landing;