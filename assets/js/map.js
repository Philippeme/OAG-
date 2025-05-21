/**
 * map.js - Gestion de la carte interactive du site OAG
 * Ce fichier contient toutes les fonctionnalités liées à la carte
 * et au système de filtrage associé
 */

// Variable globale pour stocker l'instance de la carte
let worldMap;

// Données des pays (pour la démo)
const countriesData = [
    {
        name: 'Cameroun',
        code: 'CM',
        coords: [7.3697, 12.3547],
        projects: 20,
        interveners: 70,
        highlighted: true
    },
    {
        name: 'Vietnam',
        code: 'VN',
        coords: [14.0583, 108.2772],
        projects: 15,
        interveners: 45,
        highlighted: true
    },
    {
        name: 'République Démocratique du Congo',
        code: 'CD',
        coords: [-4.0383, 21.7587],
        projects: 25,
        interveners: 80,
        highlighted: true
    },
    {
        name: 'Sénégal',
        code: 'SN',
        coords: [14.4974, -14.4524],
        projects: 12,
        interveners: 35,
        highlighted: true
    },
    {
        name: 'Mali',
        code: 'ML',
        coords: [17.5707, -3.9962],
        projects: 8,
        interveners: 25,
        highlighted: true
    },
    {
        name: 'Bangladesh',
        code: 'BD',
        coords: [23.6850, 90.3563],
        projects: 18,
        interveners: 55,
        highlighted: true
    }
];

// Données des projets (pour la démo)
const projectsData = [
    {
        name: 'Projet de santé communautaire',
        country: 'Cameroun',
        coords: [4.0511, 9.7679], // Douala, Cameroun
        type: 'Santé',
        year: 2024,
        donor: 'OMS',
        sector: 'Public'
    },
    {
        name: 'Initiative d\'éducation rurale',
        country: 'Cameroun',
        coords: [9.3051, 12.3605], // Nord Cameroun
        type: 'Éducation',
        year: 2023,
        donor: 'UNICEF',
        sector: 'Public'
    },
    {
        name: 'Programme d\'accès à l\'eau potable',
        country: 'Cameroun',
        coords: [10.6418, 14.3954], // Extrême-Nord Cameroun
        type: 'Eau',
        year: 2025,
        donor: 'UE',
        sector: 'Public'
    },
    {
        name: 'Renforcement des capacités agricoles',
        country: 'Vietnam',
        coords: [10.8231, 106.6297],
        type: 'Agriculture',
        year: 2024,
        donor: 'FAO',
        sector: 'Public'
    },
    {
        name: 'Protection de la biodiversité',
        country: 'République Démocratique du Congo',
        coords: [-4.3217, 15.3139],
        type: 'Environnement',
        year: 2025,
        donor: 'PNUD',
        sector: 'ONG'
    },
    {
        name: 'Droits des enfants et éducation',
        country: 'Sénégal',
        coords: [14.7645, -17.3660],
        type: 'Droits humains',
        year: 2023,
        donor: 'UNICEF',
        sector: 'Public'
    }
];

/**
 * Initialisation de la carte
 */
function initMap() {
    const mapContainer = document.getElementById('world-map');

    if (!mapContainer) return;

    // Créer la carte Leaflet
    worldMap = L.map(mapContainer, {
        center: [10, 0], // Centrer plus sur l'Afrique
        zoom: 2,
        minZoom: 2,
        maxZoom: 6,
        scrollWheelZoom: false,
        zoomControl: false
    });

    // Ajouter les contrôles de zoom en haut à droite
    L.control.zoom({
        position: 'topright'
    }).addTo(worldMap);

    // Utiliser une couche de tuiles simple et claire
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
    }).addTo(worldMap);

    // Ajouter les marqueurs des pays
    addCountryMarkers();

    // Ajouter les marqueurs des projets
    addProjectMarkers();

    // Configurer les filtres
    setupFilters();

    // Ajuster la taille de la carte lors du redimensionnement de la fenêtre
    window.addEventListener('resize', function () {
        setTimeout(() => {
            worldMap.invalidateSize();
        }, 100);
    });
}

/**
 * Ajouter les marqueurs des pays sur la carte
 */
function addCountryMarkers() {
    // Parcourir les données des pays
    countriesData.forEach(country => {
        if (country.highlighted) {
            // Créer un cercle pour le pays
            const circle = L.circle(country.coords, {
                color: '#f18221',
                fillColor: '#f18221',
                fillOpacity: 0.6,
                radius: 500000
            }).addTo(worldMap);

            // Ajouter les événements interactifs
            circle.on('click', function () {
                showCountryInfo(country);
            });

            circle.on('mouseover', function () {
                this.setStyle({
                    fillOpacity: 0.8
                });
            });

            circle.on('mouseout', function () {
                this.setStyle({
                    fillOpacity: 0.6
                });
            });

            // Stocker une référence au cercle dans les données du pays
            country.marker = circle;
        }
    });
}

/**
 * Ajouter les marqueurs des projets sur la carte
 */
function addProjectMarkers() {
    // Créer une icône personnalisée pour les projets
    const projectIcon = L.divIcon({
        className: 'project-marker',
        html: '<div class="marker-icon"><i class="fas fa-map-marker-alt"></i></div>',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
    });

    // Parcourir les données des projets
    projectsData.forEach(project => {
        // Créer un marqueur pour le projet
        const marker = L.marker(project.coords, {
            icon: projectIcon
        }).addTo(worldMap);

        // Créer une popup avec les informations du projet
        const popupContent = `
            <div class="project-popup">
                <h3>${project.name}</h3>
                <p><strong>Pays:</strong> ${project.country}</p>
                <p><strong>Type:</strong> ${project.type}</p>
                <p><strong>Année:</strong> ${project.year}</p>
                <p><strong>Bailleur:</strong> ${project.donor}</p>
                <p><strong>Secteur:</strong> ${project.sector}</p>
            </div>
        `;

        marker.bindPopup(popupContent);

        // Stocker une référence au marqueur dans les données du projet
        project.marker = marker;
    });

    // Ajouter du CSS personnalisé pour les marqueurs
    const style = document.createElement('style');
    style.textContent = `
        .project-marker {
            background: transparent;
        }
        
        .marker-icon {
            color: #1a4b8f;
            font-size: 28px;
            text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.3);
            transition: transform 0.3s ease, color 0.3s ease;
        }
        
        .marker-icon:hover {
            color: #f18221;
            transform: scale(1.2);
        }
        
        .project-popup h3 {
            font-size: 16px;
            margin-bottom: 10px;
            color: #1a4b8f;
        }
        
        .project-popup p {
            margin: 5px 0;
            font-size: 13px;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Afficher les informations d'un pays dans la carte
 * @param {Object} country - Données du pays
 */
function showCountryInfo(country) {
    const popup = document.getElementById('map-popup');

    if (!popup) return;

    // Mettre à jour le contenu du popup
    popup.innerHTML = `
        <div class="country-flag">
            <img src="assets/images/flags/${country.code.toLowerCase()}.png" alt="${country.name}">
            <span>${country.name}</span>
        </div>
        <div class="country-stats">
            <div class="stat">Projet : <span>${country.projects}</span></div>
            <div class="stat">Intervenants : <span>${country.interveners}</span></div>
        </div>
    `;

    // Positionner le popup en fonction des coordonnées du pays
    const point = worldMap.latLngToContainerPoint(country.coords);
    const mapRect = document.getElementById('world-map').getBoundingClientRect();

    popup.style.display = 'block';
    popup.style.top = (point.y - 30) + 'px';
    popup.style.left = (point.x + 30) + 'px';
    popup.classList.add('active');

    // Ajuster la position si le popup sort de la carte
    const popupRect = popup.getBoundingClientRect();

    if (popupRect.right > mapRect.right) {
        popup.style.left = (point.x - popupRect.width - 30) + 'px';
    }

    if (popupRect.bottom > mapRect.bottom) {
        popup.style.top = (point.y - popupRect.height - 30) + 'px';
    }
}

/**
 * Configuration du système de filtrage
 */
function setupFilters() {
    // Obtenir les éléments de filtre
    const countryFilter = document.getElementById('pays');
    const yearFilter = document.getElementById('annee');
    const domainFilter = document.getElementById('domaine');
    const donorFilter = document.getElementById('bailleur');
    const sectorFilter = document.getElementById('secteur');
    const resetButton = document.querySelector('.filter-panel .btn-block');

    // Ajouter des options à la liste déroulante des années
    if (yearFilter) {
        // Obtenir les années uniques des projets
        const years = [...new Set(projectsData.map(project => project.year))].sort((a, b) => b - a);

        // Ajouter les options
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });
    }

    // Ajouter des options à la liste déroulante des domaines
    if (domainFilter) {
        // Obtenir les domaines uniques des projets
        const domains = [...new Set(projectsData.map(project => project.type))].sort();

        // Ajouter les options
        domains.forEach(domain => {
            const option = document.createElement('option');
            option.value = domain.toLowerCase();
            option.textContent = domain;
            domainFilter.appendChild(option);
        });
    }

    // Ajouter des options à la liste déroulante des secteurs
    if (sectorFilter) {
        // Obtenir les secteurs uniques des projets
        const sectors = [...new Set(projectsData.map(project => project.sector))].sort();

        // Ajouter les options
        sectors.forEach(sector => {
            const option = document.createElement('option');
            option.value = sector.toLowerCase();
            option.textContent = sector;
            sectorFilter.appendChild(option);
        });
    }

    // Événements pour les filtres
    const applyFilters = () => {
        const filters = {
            country: countryFilter && countryFilter.value ? countryFilter.value.toLowerCase() : null,
            year: yearFilter && yearFilter.value ? parseInt(yearFilter.value) : null,
            domain: domainFilter && domainFilter.value ? domainFilter.value.toLowerCase() : null,
            donor: donorFilter && donorFilter.value ? donorFilter.value.toLowerCase() : null,
            sector: sectorFilter && sectorFilter.value ? sectorFilter.value.toLowerCase() : null
        };

        // Filtrer les projets
        filterProjects(filters);
    };

    // Ajouter les événements de changement
    if (countryFilter) countryFilter.addEventListener('input', applyFilters);
    if (yearFilter) yearFilter.addEventListener('change', applyFilters);
    if (domainFilter) domainFilter.addEventListener('change', applyFilters);
    if (donorFilter) donorFilter.addEventListener('input', applyFilters);
    if (sectorFilter) sectorFilter.addEventListener('change', applyFilters);

    // Événement pour la réinitialisation
    if (resetButton) {
        resetButton.addEventListener('click', function (e) {
            e.preventDefault();

            // Réinitialiser les champs
            if (countryFilter) countryFilter.value = '';
            if (yearFilter) yearFilter.selectedIndex = 0;
            if (domainFilter) domainFilter.selectedIndex = 0;
            if (donorFilter) donorFilter.value = '';
            if (sectorFilter) sectorFilter.selectedIndex = 0;

            // Réinitialiser les filtres
            resetFilters();
        });
    }
}

/**
 * Filtrer les projets en fonction des critères
 * @param {Object} filters - Critères de filtrage
 */
function filterProjects(filters) {
    // Masquer le popup d'information du pays
    const popup = document.getElementById('map-popup');
    if (popup) popup.style.display = 'none';

    // Filtrer les projets
    projectsData.forEach(project => {
        let visible = true;

        // Appliquer les filtres
        if (filters.country && !project.country.toLowerCase().includes(filters.country)) {
            visible = false;
        }

        if (filters.year && project.year !== filters.year) {
            visible = false;
        }

        if (filters.domain && !project.type.toLowerCase().includes(filters.domain)) {
            visible = false;
        }

        if (filters.donor && !project.donor.toLowerCase().includes(filters.donor)) {
            visible = false;
        }

        if (filters.sector && !project.sector.toLowerCase().includes(filters.sector)) {
            visible = false;
        }

        // Appliquer la visibilité au marqueur
        if (project.marker) {
            if (visible) {
                if (!worldMap.hasLayer(project.marker)) {
                    worldMap.addLayer(project.marker);
                }
            } else {
                if (worldMap.hasLayer(project.marker)) {
                    worldMap.removeLayer(project.marker);
                }
            }
        }
    });

    // Filtrer les pays
    countriesData.forEach(country => {
        let visible = true;

        // Un pays est visible si au moins un de ses projets est visible
        if (filters.country && !country.name.toLowerCase().includes(filters.country)) {
            visible = false;
        }

        // Vérifier si le pays a des projets visibles
        const hasVisibleProjects = projectsData.some(project =>
            project.country === country.name &&
            worldMap.hasLayer(project.marker)
        );

        // Un pays est visible s'il correspond au filtre du pays ou s'il a des projets visibles
        visible = visible && (hasVisibleProjects || !filters.hasOwnProperty('country') || !filters.country);

        // Appliquer la visibilité au marqueur du pays
        if (country.marker) {
            if (visible) {
                if (!worldMap.hasLayer(country.marker)) {
                    worldMap.addLayer(country.marker);
                }
                country.marker.setStyle({
                    fillOpacity: 0.6
                });
            } else {
                if (worldMap.hasLayer(country.marker)) {
                    worldMap.removeLayer(country.marker);
                }
            }
        }
    });
}

/**
 * Réinitialiser tous les filtres
 */
function resetFilters() {
    // Masquer le popup d'information du pays
    const popup = document.getElementById('map-popup');
    if (popup) popup.style.display = 'none';

    // Réinitialiser la visibilité des projets
    projectsData.forEach(project => {
        if (project.marker && !worldMap.hasLayer(project.marker)) {
            worldMap.addLayer(project.marker);
        }
    });

    // Réinitialiser la visibilité des pays
    countriesData.forEach(country => {
        if (country.marker) {
            if (!worldMap.hasLayer(country.marker)) {
                worldMap.addLayer(country.marker);
            }

            country.marker.setStyle({
                fillOpacity: 0.6
            });
        }
    });
}

/**
 * Mettre à jour la carte en fonction des données actuelles
 * Fonction utilitaire pour les mises à jour externes
 */
function updateMap() {
    if (worldMap) {
        worldMap.invalidateSize();
    }
}

// Exposer les fonctions publiquement
window.mapUtils = {
    update: updateMap,
    resetFilters: resetFilters
};