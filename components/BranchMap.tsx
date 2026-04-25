'use client';
import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Leaflet markers require a bit of hack to work with Webpack/Next.js
const fixLeafletIcon = (L: any) => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
};

interface BranchMapProps {
  lat?: number | string | null;
  lng?: number | string | null;
  address?: string;
  name?: string;
}

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

// Separate component for map manipulation to avoid hook issues
function MapEvents({ center }: { center: [number, number] }) {
  const { useMap } = require('react-leaflet');
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
      setTimeout(() => map.invalidateSize(), 100);
    }
  }, [center, map]);
  return null;
}

export default function BranchMap({ lat, lng, address, name }: BranchMapProps) {
  const [L, setL] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    import('leaflet').then(leaflet => {
      fixLeafletIcon(leaflet.default);
      setL(leaflet.default);
    });
  }, []);

  const position = useMemo((): [number, number] => {
    const pLat = typeof lat === 'string' ? parseFloat(lat) : (Number(lat) || 20.5937);
    const pLng = typeof lng === 'string' ? parseFloat(lng) : (Number(lng) || 78.9629);
    return [pLat, pLng];
  }, [lat, lng]);

  if (!mounted || !L) {
    return (
      <div className="w-full h-[400px] bg-[#0f1117] flex items-center justify-center text-[#8890a0] rounded-xl border border-[#1a1d24]">
        <div className="animate-pulse">Initializing Map Engine...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-[#1a1d24] relative z-0">
      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={false}
        style={{ height: '400px', width: '100%', background: '#1a1d24' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents center={position} />
        <Marker position={position}>
          <Popup>
            <div className="p-1 min-w-[150px]">
              <strong className="block text-[#0a0c10] text-sm">{name || 'Branch Location'}</strong>
              <span className="text-[11px] text-[#3d4455]">{address}</span>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
