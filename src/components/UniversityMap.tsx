import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

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

const UniversityMap = ({ universities }: UniversityMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isTokenSet, setIsTokenSet] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !isTokenSet || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [10, 50],
      zoom: 3,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers for universities with coordinates
    universities.forEach((university) => {
      if (university.coordinates && university.coordinates.x && university.coordinates.y) {
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px;">
            <h3 style="font-weight: bold; margin-bottom: 4px;">${university.name}</h3>
            <p style="color: #666; font-size: 14px;">${university.country || ''}</p>
            <a href="/universities/${university.slug}" style="color: #0066cc; text-decoration: underline; font-size: 14px;">View Details</a>
          </div>
        `);

        new mapboxgl.Marker({ color: '#0066cc' })
          .setLngLat([university.coordinates.x, university.coordinates.y])
          .setPopup(popup)
          .addTo(map.current!);
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [universities, isTokenSet, mapboxToken]);

  if (!isTokenSet) {
    return (
      <Card className="p-6 bg-accent/50">
        <div className="space-y-4 max-w-md">
          <div>
            <h3 className="font-semibold mb-2">Display Universities on Map</h3>
            <p className="text-sm text-muted-foreground mb-4">
              To view universities on an interactive map, please enter your Mapbox public token.
              Get your free token at{' '}
              <a 
                href="https://mapbox.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                mapbox.com
              </a>
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
            <Input
              id="mapbox-token"
              type="text"
              placeholder="pk.eyJ1..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsTokenSet(true)}
            disabled={!mapboxToken}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Show Map
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default UniversityMap;
