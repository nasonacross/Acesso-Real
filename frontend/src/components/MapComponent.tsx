import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Establishment } from '../types';

interface Props {
  establishments: Establishment[];
  center: [number, number];
  zoom?: number;
  userLocation?: [number, number] | null;
  radiusKm?: number;
  selectedId?: string | null;
  onSelectEstablishment: (est: Establishment) => void;
}

export const MapComponent: React.FC<Props> = ({
  establishments,
  center,
  zoom = 14,
  userLocation,
  radiusKm,
  selectedId,
  onSelectEstablishment,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const circleLayerRef = useRef<L.Circle | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
      });

      // Accessible OSM tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contribuintes',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update view when center changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Render markers and user location
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // User location marker
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="position: relative; width: 24px; height: 24px;">
            <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background-color: rgba(2, 132, 199, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; border-radius: 50%; background-color: #0284c7; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker(userLocation, { icon: userIcon, title: 'Localização Inicial: Faculdade FADAP (Tupã)' })
        .addTo(layer)
        .bindPopup('<strong>🎓 Localização Inicial: Faculdade FADAP / FAP (Tupã)</strong>');

      // Radius circle
      if (circleLayerRef.current) {
        circleLayerRef.current.remove();
      }
      if (radiusKm) {
        circleLayerRef.current = L.circle(userLocation, {
          radius: radiusKm * 1000,
          color: '#0284c7',
          fillColor: '#38bdf8',
          fillOpacity: 0.1,
          weight: 1.5,
          dashArray: '4, 4',
        }).addTo(map);
      }
    }

    // Establishment markers
    establishments.forEach((est) => {
      let pinColor = '#64748b'; // default slate
      if (est.classification === 'Acessibilidade bem avaliada') pinColor = '#16a34a'; // green
      else if (est.classification === 'Acessibilidade parcial') pinColor = '#d97706'; // amber
      else if (est.classification === 'Acessibilidade limitada') pinColor = '#ea580c'; // orange
      else if (est.classification === 'Acessibilidade insuficiente') pinColor = '#dc2626'; // red

      const isSelected = est.id === selectedId;

      const markerHtml = `
        <div style="
          background-color: ${pinColor};
          color: white;
          width: ${isSelected ? '38px' : '32px'};
          height: ${isSelected ? '38px' : '32px'};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
          cursor: pointer;
          transition: transform 0.2s ease;
        ">
          <span style="
            transform: rotate(45deg);
            font-size: ${isSelected ? '13px' : '11px'};
            font-weight: 800;
          ">
            ${est.overall_score}
          </span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-est-marker',
        html: markerHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34],
      });

      const marker = L.marker([est.lat, est.lng], { icon: customIcon });

      const popupContent = document.createElement('div');
      popupContent.style.minWidth = '220px';
      popupContent.innerHTML = `
        <div style="font-family: inherit;">
          <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 2px;">
            ${est.category.toUpperCase()}
          </div>
          <h4 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0; line-height: 1.2;">
            ${est.name}
          </h4>
          <p style="font-size: 12px; color: #475569; margin: 0 0 8px 0;">
            ${est.address}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: #f1f5f9; color: #334155;">
              ${est.classification}
            </span>
            <span style="font-size: 13px; font-weight: 800; color: ${pinColor};">
              ${est.overall_score}/100
            </span>
          </div>
          <button id="btn-view-${est.id}" style="
            width: 100%;
            padding: 6px 12px;
            background-color: #0284c7;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
          ">
            Ver Detalhes & Compatibilidade
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-view-${est.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectEstablishment(est);
          };
        }
      });

      marker.on('click', () => {
        onSelectEstablishment(est);
      });

      marker.addTo(layer);
    });
  }, [establishments, userLocation, radiusKm, selectedId, onSelectEstablishment]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '400px' }} />
    </div>
  );
};
