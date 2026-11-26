import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { AccessibleRouteResult } from '../types';
import { Maximize2 } from 'lucide-react';

interface Props {
  route: AccessibleRouteResult | null;
  originCoords: [number, number];
  originName: string;
  destCoords: [number, number];
  destName: string;
  destClassification?: string;
  destScore?: number;
  destImage?: string;
  selectedStepNumber?: number | null;
  onSelectStep?: (stepNumber: number) => void;
}

export const RouteMapComponent: React.FC<Props> = ({
  route,
  originCoords,
  originName,
  destCoords,
  destName,
  destClassification,
  destScore,
  destImage,
  selectedStepNumber,
  onSelectStep,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: originCoords,
        zoom: 15,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      routeLayerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = routeLayerGroupRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    const bounds = L.latLngBounds([originCoords, destCoords]);

    // 1. Origin Marker (Faculdade FADAP / Partida)
    const originIcon = L.divIcon({
      className: 'custom-origin-marker',
      html: `
        <div style="position: relative; width: 38px; height: 38px;">
          <div style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background-color: rgba(16, 185, 129, 0.35); animation: ping 1.8s infinite;"></div>
          <div style="
            position: absolute;
            top: 2px;
            left: 2px;
            width: 34px;
            height: 34px;
            background: linear-gradient(135deg, #10b981, #047857);
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 6px 14px rgba(5, 150, 105, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 15px;
          ">
            🎓
          </div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      popupAnchor: [0, -24],
    });

    L.marker(originCoords, { icon: originIcon, title: `Localização Inicial: ${originName}` })
      .addTo(layer)
      .bindPopup(`
        <div style="font-family: Inter, sans-serif; min-width: 190px; padding: 2px;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #059669; margin-bottom: 3px; letter-spacing: 0.05em;">
            🎓 Localização Inicial (Partida)
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.3;">
            ${originName}
          </div>
        </div>
      `);

    // 2. Destination Marker
    let destPinColor = '#0284c7';
    if (destClassification === 'Acessibilidade bem avaliada') destPinColor = '#059669';
    else if (destClassification === 'Acessibilidade parcial') destPinColor = '#d97706';
    else if (destClassification === 'Acessibilidade limitada') destPinColor = '#ea580c';
    else if (destClassification === 'Acessibilidade insuficiente') destPinColor = '#dc2626';

    const destIcon = L.divIcon({
      className: 'custom-dest-marker',
      html: `
        <div style="position: relative; width: 38px; height: 38px;">
          <div style="
            position: absolute;
            width: 38px;
            height: 38px;
            background: ${destPinColor};
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 6px 14px rgba(15, 23, 42, 0.35);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="
              transform: rotate(45deg);
              color: white;
              font-weight: 800;
              font-size: 12px;
              font-family: Inter, sans-serif;
            ">${destScore ? destScore : 'B'}</span>
          </div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -36],
    });

    L.marker(destCoords, { icon: destIcon, title: `Destino: ${destName}` })
      .addTo(layer)
      .bindPopup(`
        <div style="font-family: Inter, sans-serif; min-width: 220px; padding: 2px;">
          ${destImage ? `<img src="${destImage}" alt="${destName}" style="width: 100%; height: 92px; object-fit: cover; border-radius: 10px; margin-bottom: 8px;" />` : ''}
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #0284c7; margin-bottom: 2px; letter-spacing: 0.05em;">
            🏁 Destino em Tupã
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 6px; line-height: 1.25;">
            ${destName}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px;">
            <span style="padding: 3px 8px; background: #f1f5f9; border-radius: 6px; font-weight: 600; color: #334155;">
              ${destClassification || 'Avaliado'}
            </span>
            ${destScore ? `<span style="font-weight: 800; color: ${destPinColor};">${destScore}/100</span>` : ''}
          </div>
        </div>
      `);

    // 3. Draw Route Polyline
    if (route && route.coordinates && route.coordinates.length > 0) {
      L.polyline(route.coordinates, {
        color: '#0369a1',
        weight: 10,
        opacity: 0.25,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(layer);

      L.polyline(route.coordinates, {
        color: route.route_type === 'curta' ? '#f59e0b' : '#0284c7',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(layer);

      route.coordinates.forEach((pt) => bounds.extend(pt));

      if (route.steps && route.steps.length > 0) {
        route.steps.forEach((step) => {
          if (step.step_number > 1 && step.step_number < route.steps.length && step.lat && step.lng) {
            const isSelected = selectedStepNumber === step.step_number;
            const stepIcon = L.divIcon({
              className: 'step-waypoint-marker',
              html: `
                <div style="
                  width: ${isSelected ? '28px' : '22px'};
                  height: ${isSelected ? '28px' : '22px'};
                  background-color: ${isSelected ? '#0f172a' : '#ffffff'};
                  color: ${isSelected ? '#ffffff' : '#0f172a'};
                  border: 2.5px solid ${step.alert ? '#f59e0b' : '#0284c7'};
                  border-radius: 50%;
                  font-size: ${isSelected ? '12px' : '10px'};
                  font-weight: 800;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  box-shadow: 0 3px 8px rgba(15, 23, 42, 0.22);
                  cursor: pointer;
                ">
                  ${step.step_number}
                </div>
              `,
              iconSize: [isSelected ? 28 : 22, isSelected ? 28 : 22],
              iconAnchor: [isSelected ? 14 : 11, isSelected ? 14 : 11],
            });

            const stepMarker = L.marker([step.lat, step.lng], { icon: stepIcon })
              .addTo(layer)
              .bindPopup(`
                <div style="font-family: Inter, sans-serif; font-size: 12px; line-height: 1.35;">
                  <strong style="color: #0284c7;">Etapa ${step.step_number}: ${step.title}</strong>
                  <p style="margin: 4px 0; color: #334155;">${step.instruction}</p>
                  <span style="font-size: 10px; font-weight: 700; color: #059669;">✓ ${step.accessibility_feature}</span>
                </div>
              `);

            stepMarker.on('click', () => {
              onSelectStep?.(step.step_number);
            });
          }
        });
      }
    }

    try {
      map.fitBounds(bounds, {
        padding: [48, 48],
        maxZoom: 16,
        animate: true,
      });
    } catch (_e) {
      map.setView(originCoords, 15);
    }
  }, [route, originCoords, originName, destCoords, destName, destClassification, destScore, destImage, selectedStepNumber]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds([originCoords, destCoords]);
    if (route && route.coordinates) {
      route.coordinates.forEach((pt) => bounds.extend(pt));
    }
    mapInstanceRef.current.fitBounds(bounds, { padding: [48, 48], maxZoom: 16 });
  };

  return (
    <div className="relative w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[560px] rounded-2xl overflow-hidden border border-slate-200/80 shadow-inner bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[560px]" />

      <div className="absolute top-3 right-3 z-[1000]">
        <button
          onClick={handleRecenter}
          title="Centralizar Rota Completa"
          aria-label="Centralizar Rota Completa no Mapa"
          className="p-2.5 bg-white/95 hover:bg-white text-slate-800 rounded-xl shadow-md border border-slate-200/80 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-md text-[11px] font-semibold text-slate-700 flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
          <span>Partida (FADAP)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-600 ring-2 ring-brand-200"></span>
          <span>Destino</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-1 rounded-full bg-brand-600"></span>
          <span>Trajeto Acessível</span>
        </span>
      </div>
    </div>
  );
};
