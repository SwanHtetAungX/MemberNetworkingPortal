import React from 'react';
//import { NavLink } from "react-router-dom";
import '../css/navbar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function Navbar() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <nav className="navbar navbar-expand-lg navbar-light">
                <a className="navbar-brand" href="/home">Network.com</a>

                <form class="d-flex search-spacing " style={{ width: '400px' }}>
                    <input class="form-control" type="search" placeholder="Who are you looking for?" aria-label="Search" />
                    <button class="btn btn-outline-success" type="submit">
                        <i className="bi bi-search"></i>
                    </button>
                </form>

                {/* <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button> */}

                <div className="navbar-collapse" id="navbarNav">
                <ul className="navbar-nav mx-auto">
                        <li className="nav-item text-center">
                            <a className="nav-link" href="/home">
                                <i className="bi bi-house-fill" ></i><br />
                                Home
                            </a>
                        </li>
                        <li className="nav-item text-center">
                            <a className="nav-link" href="/network">
                                <i className="bi bi-people-fill" ></i><br />
                                Network
                            </a>
                        </li>
                        <li className="nav-item text-center">
                            <a className="nav-link" href="/notifications">
                                <i className="bi bi-bell-fill" ></i><br />
                                Notifications
                            </a>
                        </li>
                        <li className="nav-item text-center">
                            <a className="nav-link" href="/profile">
                                <i className="bi bi-person-fill" ></i><br />
                                Profile
                            </a>
                        </li>
                    </ul>

                </div>

            </nav>
        </div>
    );
}

export default Navbar;
