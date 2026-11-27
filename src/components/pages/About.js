
import React from "react";
import {
    FiArrowRight,
    FiMapPin,
    FiNavigation,
    FiTruck,
    FiShield,
    FiActivity,
    FiClock,
    FiLayers,
    FiRadio,
} from "react-icons/fi";

import "../../css/About.css";

function About() {
    const features = [
        {
            icon: <FiMapPin />,
            title: "Real-Time GPS Tracking",
            description:
                "Monitor vehicle locations and movement through a centralized live tracking interface.",
        },
        {
            icon: <FiNavigation />,
            title: "Route Playback",
            description:
                "Review historical vehicle journeys and understand where vehicles have travelled.",
        },
        {
            icon: <FiTruck />,
            title: "Vehicle Management",
            description:
                "Organize vehicles and manage fleet information from one centralized platform.",
        },
        {
            icon: <FiShield />,
            title: "Role-Based Access",
            description:
                "Control access to platform features through user roles and assigned permissions.",
        },
        {
            icon: <FiActivity />,
            title: "Fleet Monitoring",
            description:
                "Get an overview of vehicle activity and fleet status through the dashboard.",
        },
        {
            icon: <FiLayers />,
            title: "Organized Management",
            description:
                "Manage dealers, companies, branches and vehicles within a structured hierarchy.",
        },
    ];

    const technologies = [
        "React.js",
        "Node.js",
        "Express.js",
        "MongoDB",
        "Socket.IO",
        "Leaflet",
    ];

    return (
        <main className="sf-about-page">

            {/* HERO SECTION */}
            <section className="sf-about-hero">

                <div className="sf-about-hero-content">

                    <div className="sf-about-eyebrow">
                        <FiRadio />
                        <span>INTELLIGENT FLEET MANAGEMENT</span>
                    </div>

                    <h1>
                        Complete visibility.
                        <span> Smarter fleet operations.</span>
                    </h1>

                    <p>
                        SyncFleet brings vehicle tracking, fleet monitoring
                        and operational management together in one
                        centralized platform.
                    </p>

                    <a href="#sf-about-features" className="sf-about-hero-link">
                        Explore SyncFleet
                        <FiArrowRight />
                    </a>

                </div>

                <div className="sf-about-hero-visual">
                    <video
                        className="sf-about-hero-video"
                        autoPlay
                        muted
                        loop
                        playsInline
                    >
                        <source src="/videos/Syncfleet-video.mp4" type="video/mp4" />
                    </video>
                </div>

            </section>

            {/* INTRODUCTION */}
            <section className="sf-about-intro">

                <div className="sf-about-section-label">
                    ABOUT THE PLATFORM
                </div>

                <h2>
                    One platform.
                    <span> Complete fleet visibility.</span>
                </h2>

                <p>
                    SyncFleet is a vehicle fleet management platform
                    designed to help businesses monitor vehicles,
                    review journeys and manage fleet operations
                    through a unified digital workspace.
                </p>

            </section>

            {/* FEATURES */}
            <section
                className="sf-about-features"
                id="sf-about-features"
            >

                <div className="sf-about-section-heading">
                    <div className="sf-about-section-label">
                        PLATFORM CAPABILITIES
                    </div>

                    <h2>Everything your fleet needs.</h2>

                    <p>
                        Tools designed to bring vehicle information
                        and fleet operations into one place.
                    </p>
                </div>

                <div className="sf-about-feature-grid">

                    {features.map((feature, index) => (
                        <article
                            className="sf-about-feature-card"
                            key={index}
                        >
                            <div className="sf-about-feature-icon">
                                {feature.icon}
                            </div>

                            <h3>{feature.title}</h3>

                            <p>{feature.description}</p>
                        </article>
                    ))}

                </div>

            </section>

            {/* TECHNOLOGY */}
            <section className="sf-about-technology">

                <div className="sf-about-section-label">
                    TECHNOLOGY STACK
                </div>

                <h2>Built with modern technology.</h2>

                <p>
                    SyncFleet uses a modern web technology stack
                    to support its tracking and fleet management
                    functionality.
                </p>

                <div className="sf-about-tech-list">
                    {technologies.map((technology) => (
                        <span key={technology}>
                            {technology}
                        </span>
                    ))}
                </div>

            </section>

            {/* OBJECTIVE */}
            <section className="sf-about-objective">

                <div className="sf-about-objective-content">
                    <div className="sf-about-section-label">
                        OUR OBJECTIVE
                    </div>

                    <h2>
                        Making fleet management
                        <span> simpler and more visible.</span>
                    </h2>

                    <p>
                        Our objective is to simplify fleet operations
                        through centralized vehicle information,
                        GPS-based tracking and accessible management tools.
                    </p>
                </div>

            </section>

            {/* FOOTER */}
            <footer className="sf-about-footer">

                <div className="sf-about-footer-brand">
                    <FiRadio />
                    <span>SyncFleet</span>
                </div>

                <p>
                    Vehicle Fleet Management Platform
                </p>

                <span className="sf-about-footer-copy">
                    © {new Date().getFullYear()} SyncFleet
                </span>

            </footer>

        </main>
    );
}

export default About;
