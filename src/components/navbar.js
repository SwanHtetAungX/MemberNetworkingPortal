import React from 'react';
import '../css/navbar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-light">
            <div className="container-fluid">
                <a className="navbar-brand" href="/home">Network.com</a>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <form className="d-flex search-spacing mx-auto" style={{ width: '400px' }}>
                        <input className="form-control me-2" type="search" placeholder="Who are you looking for?" aria-label="Search" />
                        <button className="btn btn-outline-success" type="submit">
                            <i className="bi bi-search"></i>
                        </button>
                    </form>
                    
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item text-center">
                            <a className="nav-link" href="/home">
                                <i className="bi bi-house-fill"></i><br />
                                Home
                            </a>
                        </li>
                        <li className="nav-item text-center">
                            <a className="nav-link" href="/network">
                                <i className="bi bi-people-fill"></i><br />
                                Network
                            </a>
                        </li>
                        <li className="nav-item text-center">
                            <a className="nav-link" href="/notifications">
                                <i className="bi bi-bell-fill"></i><br />
                                Notifications
                            </a>
                        </li>
                        <li className="nav-item text-center">
                            <a className="nav-link" href="/profile">
                                <i className="bi bi-person-fill"></i><br />
                                Profile
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
