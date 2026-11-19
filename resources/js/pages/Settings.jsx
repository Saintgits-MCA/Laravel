
import React from 'react';
import {
    Settings as SettingsIcon,
    Info,
    Code2,
    Database,
    ShieldCheck,
    Layers3,
    Package,
    CheckCircle2,
} from 'lucide-react';

const technologies = [
    {
        name: 'Laravel',
        description: 'Backend REST API',
        icon: Code2,
    },
    {
        name: 'React',
        description: 'Frontend interface',
        icon: Layers3,
    },
    {
        name: 'MySQL',
        description: 'Database management',
        icon: Database,
    },
    {
        name: 'Bootstrap 5',
        description: 'Responsive UI framework',
        icon: Package,
    },
];

export default function Settings() {
    return (
        <div className="container-fluid py-3 py-md-4 px-3 px-md-4">

            {/* Page heading */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">
                        Application Settings
                    </h2>
                    <p className="text-secondary mb-0">
                        Application information and system overview.
                    </p>
                </div>

                <span className="badge rounded-pill text-bg-success px-3 py-2">
                    <CheckCircle2 size={14} className="me-1" />
                    Application Overview
                </span>
            </div>

            {/* Main application card */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                <div className="card-body p-4 p-md-5">
                    <div className="d-flex flex-column flex-md-row align-items-md-center gap-4">

                        <div className="settings-brand-icon rounded-4 d-flex align-items-center justify-content-center">
                            <SettingsIcon size={36} />
                        </div>

                        <div>
                            <span className="badge text-bg-primary-subtle text-primary mb-2">
                                INVENTORY MANAGEMENT
                            </span>

                            <h3 className="fw-bold text-dark mb-2">
                                StockFlow
                            </h3>

                            <p className="text-secondary mb-0">
                                A beginner-friendly inventory management
                                application built using Laravel, React,
                                Vite and MySQL.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Information cards */}
            <div className="row g-3 g-lg-4 mb-4">

                <div className="col-12 col-md-6 col-xl-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <div className="settings-small-icon bg-primary-subtle text-primary mb-3">
                                <Info size={22} />
                            </div>

                            <h6 className="fw-bold mb-2">Application</h6>
                            <p className="text-secondary small mb-2">
                                Application name
                            </p>
                            <div className="fw-semibold">StockFlow</div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6 col-xl-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <div className="settings-small-icon bg-success-subtle text-success mb-3">
                                <ShieldCheck size={22} />
                            </div>

                            <h6 className="fw-bold mb-2">Backend</h6>
                            <p className="text-secondary small mb-2">
                                Server-side technology
                            </p>
                            <div className="fw-semibold">Laravel REST API</div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6 col-xl-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <div className="settings-small-icon bg-info-subtle text-info mb-3">
                                <Code2 size={22} />
                            </div>

                            <h6 className="fw-bold mb-2">Frontend</h6>
                            <p className="text-secondary small mb-2">
                                User interface technology
                            </p>
                            <div className="fw-semibold">React + Vite</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Technology stack */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-header bg-white border-0 px-4 pt-4 pb-2">
                    <h5 className="fw-bold mb-1">Technology Stack</h5>
                    <p className="text-secondary small mb-0">
                        Technologies used to build StockFlow.
                    </p>
                </div>

                <div className="card-body px-4 pb-4">
                    <div className="row g-3">
                        {technologies.map((technology) => {
                            const Icon = technology.icon;

                            return (
                                <div className="col-12 col-sm-6" key={technology.name}>
                                    <div className="d-flex align-items-center gap-3 border rounded-3 p-3 h-100">
                                        <div className="settings-tech-icon rounded-3 d-flex align-items-center justify-content-center">
                                            <Icon size={21} />
                                        </div>

                                        <div>
                                            <div className="fw-semibold">
                                                {technology.name}
                                            </div>
                                            <div className="text-secondary small">
                                                {technology.description}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer information */}
            <div className="card border-0 bg-light rounded-4">
                <div className="card-body p-3 p-md-4 d-flex align-items-start gap-3">
                    <Info className="text-primary  mt-1" size={20} />

                    <div>
                        <h6 className="fw-bold mb-1">
                            About StockFlow
                        </h6>
                        <p className="text-secondary small mb-0">
                            StockFlow helps organize products, categories
                            and inventory information in one place.
                            This page displays application information;
                            it does not change system or account settings.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}
