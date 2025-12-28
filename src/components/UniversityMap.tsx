import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface University {
  uuid: string;
  name: string;
  slug: string;
  country: string | null;
  coordinates: any;
  logo_url: string | null;
}

interface UniversityMapProps {
  universities: University[];
}

// Fix for default marker icons in Leaflet with Vite
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

const UniversityMap = ({ universities }: UniversityMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map centered on EPFL (Switzerland)
    map.current = L.map(mapContainer.current, {
      center: [46.5191, 6.5668], // EPFL coordinates
      zoom: 10,
      scrollWheelZoom: true,
    });

    // Add OpenStreetMap tiles (free, no API key needed)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map.current);

    // Add markers for EPFL universities only
    universities.forEach((university) => {
      const isEPFL = university.name.toLowerCase().includes('epfl') || university.slug.toLowerCase().includes('epfl');
      
      if (!isEPFL) return; // Only show EPFL on the map for now
      
      // Use EPFL coordinates if available, otherwise use default
      let lat = 46.5191;
      let lng = 6.5668;
      
      if (university.coordinates && university.coordinates.x && university.coordinates.y) {
        lng = university.coordinates.x;
        lat = university.coordinates.y;
      }

      const logoHtml = university.logo_url 
        ? `<img src="${university.logo_url}" alt="${university.name}" style="height: 40px; width: auto; margin-bottom: 8px; object-fit: contain;" />`
        : '';

      const popupContent = `
        <div style="padding: 8px; min-width: 200px;">
          ${logoHtml}
          <h3 style="font-weight: bold; margin-bottom: 4px; font-size: 14px;">${university.name}</h3>
          <p style="color: #666; font-size: 12px; margin-bottom: 8px;">${university.country || ''}</p>
          <a href="/universities/${university.slug}" style="color: #0066cc; text-decoration: underline; font-size: 12px;">View Details</a>
        </div>
      `;

      L.marker([lat, lng])
        .addTo(map.current!)
        .bindPopup(popupContent);
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [universities]);

  return (
    <div className="space-y-4">
      {/* Beta notice for map */}
      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
        <p className="text-sm text-foreground">
          <strong>Beta Version:</strong> Currently only EPFL is displayed on the map. More universities will be added in future updates!
        </p>
      </div>
      <div className="relative w-full h-[500px] rounded-lg overflow-hidden shadow-lg">
        <div ref={mapContainer} className="absolute inset-0" />
      </div>
    </div>
  );
};

export default UniversityMap;
