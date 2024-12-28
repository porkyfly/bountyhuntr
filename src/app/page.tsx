'use client'

import { useEffect, useState, useCallback } from "react";
import { GoogleMap, LoadScript, Marker, MarkerF } from '@react-google-maps/api';
import { Bounty, Answer } from "@prisma/client";
import MobileLayout from "@/components/MobileLayout";
import DesktopLayout from "@/components/DesktopLayout";
import BountyModal from "@/components/BountyModal";
import { getRemainingTime } from '@/utils/time';
import SearchBox from '@/components/SearchBox';

type BountyWithAnswers = Bounty & { answers: Answer[] };

// Define libraries outside the component
const libraries = ['places'];

export default function Home() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [visibleBounties, setVisibleBounties] = useState<Bounty[]>([]);
  const [selectedBounty, setSelectedBounty] = useState<BountyWithAnswers | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [hoveredBountyId, setHoveredBountyId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickedLocation, setClickedLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [center, setCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [zoom, setZoom] = useState(12);
  const [mapOptions, setMapOptions] = useState({
    disableDefaultUI: false,
    clickableIcons: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    gestureHandling: 'greedy',
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    fetchBounties();
    initializeUserLocation();
  }, []);

  useEffect(() => {
    if (map) {
      updateVisibleBounties();
      const listener = map.addListener('idle', updateVisibleBounties);
      return () => {
        if (listener) {
          google.maps.event.removeListener(listener);
        }
      };
    }
  }, [map, bounties]);

  const initializeUserLocation = async () => {
    setIsLoadingLocation(true);

    try {
      if ("geolocation" in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });

        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        setCenter(userLocation);
        if (map) map.panTo(userLocation);
        setIsLoadingLocation(false);
        return;
      }
    } catch (error) {
      console.warn('Browser geolocation failed:', error);
    }

    try {
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) throw new Error('IP Geolocation failed');
      
      const data = await response.json();
      const ipLocation = {
        lat: parseFloat(data.latitude),
        lng: parseFloat(data.longitude)
      };

      setCenter(ipLocation);
      if (map) map.panTo(ipLocation);
    } catch (error) {
      console.error('IP Geolocation failed:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const updateVisibleBounties = () => {
    if (!map?.getBounds()) return;
    const bounds = map.getBounds()!;
    setVisibleBounties(
      bounties.filter(bounty => 
        bounds.contains({ lat: bounty.latitude, lng: bounty.longitude })
      )
    );
  };

  const handleAnswerAdd = (newAnswer: Answer) => {
    if (selectedBounty) {
      setSelectedBounty({
        ...selectedBounty,
        answers: [...selectedBounty.answers, newAnswer]
      });
    }
  };

  const handleCreateBounty = async ({ 
    question, 
    reward,
    expiryMinutes 
  }: { 
    question: string; 
    reward: number;
    expiryMinutes?: number;
  }) => {
    if (!clickedLocation) return;

    try {
      const response = await fetch('/api/bounties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          reward,
          latitude: clickedLocation.lat,
          longitude: clickedLocation.lng,
          expiryMinutes: expiryMinutes || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to create bounty');
      const newBounty = await response.json();
      setBounties([...bounties, newBounty]);
      setIsModalOpen(false);
      setClickedLocation(null);
    } catch (error) {
      console.error('Error creating bounty:', error);
    }
  };

  const getMarkerSize = (bountyId: string) =>
    hoveredBountyId === bountyId || selectedBounty?.id === bountyId ? 36 : 28;

  const fetchBounties = async () => {
    try {
      const response = await fetch('/api/bounties');
      if (!response.ok) throw new Error('Failed to fetch bounties');
      const data = await response.json();
      setBounties(data);
    } catch (error) {
      console.error('Error fetching bounties:', error);
    }
  };

  const fetchBountyWithAnswers = async (bountyId: string) => {
    try {
      const response = await fetch(`/api/bounties/${bountyId}?includeAnswers=true`);
      if (!response.ok) throw new Error('Failed to fetch bounty');
      const data = await response.json();
      setSelectedBounty(data);

      // Center map on desktop only, without zoom
      if (map && data && window.innerWidth >= 768) {
        map.panTo({
          lat: data.latitude,
          lng: data.longitude
        });
      }
    } catch (error) {
      console.error('Error fetching bounty:', error);
    }
  };

  const handlePlaceSelect = (lat: number, lng: number) => {
    setCenter({ lat, lng });
    setZoom(15); // Zoom in when a place is selected
  };

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      libraries={libraries}
    >
      <main className="relative h-screen w-screen overflow-hidden">
        <div className="absolute inset-0">
          {isLoadingLocation && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-50">
              <div className="text-lg font-semibold">Finding your location...</div>
            </div>
          )}
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={center}
            zoom={zoom}
            options={mapOptions}
            onLoad={(map) => {
              setMap(map);
            }}
            onClick={(e) => {
              if (e.latLng) {
                setClickedLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                setIsModalOpen(true);
              }
            }}
          >
            <SearchBox onPlaceSelect={handlePlaceSelect} />
            {map && visibleBounties.map((bounty) => {
              const remainingTime = getRemainingTime(bounty.expiryMinutes, bounty.createdAt);
              
              return (
                <Marker
                  key={bounty.id}
                  position={{ lat: bounty.latitude, lng: bounty.longitude }}
                  onClick={() => fetchBountyWithAnswers(bounty.id)}
                  onMouseOver={() => setHoveredBountyId(bounty.id)}
                  onMouseOut={() => setHoveredBountyId(null)}
                  icon={{
                    url: `data:image/svg+xml,${encodeURIComponent(`
                      <svg width="${getMarkerSize(bounty.id)}" height="${getMarkerSize(bounty.id)}" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="8" fill="${bounty.status === 'open' ? '#FF8C00' : '#00FF00'}" 
                          opacity="${hoveredBountyId === bounty.id || selectedBounty?.id === bounty.id ? '1' : '0.8'}"
                        />
                      </svg>
                    `)}`,
                    scaledSize: new window.google.maps.Size(getMarkerSize(bounty.id), getMarkerSize(bounty.id)),
                  }}
                  label={{
                    text: remainingTime || 'No expiry',
                    color: '#000000',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                />
              );
            })}
          </GoogleMap>
        </div>

        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="md:hidden">
            <MobileLayout
              bounties={visibleBounties}
              selectedBounty={selectedBounty}
              onBountyClick={fetchBountyWithAnswers}
              onBountyHover={setHoveredBountyId}
              onBountyClose={() => setSelectedBounty(null)}
              onAnswerSubmit={fetchBounties}
              onAnswerAdd={handleAnswerAdd}
            />
          </div>

          <div className="hidden md:block">
            <DesktopLayout
              bounties={visibleBounties}
              selectedBounty={selectedBounty}
              onBountyClick={fetchBountyWithAnswers}
              onBountyHover={setHoveredBountyId}
              onBountyClose={() => setSelectedBounty(null)}
              onAnswerSubmit={fetchBounties}
              onAnswerAdd={handleAnswerAdd}
            />
          </div>
        </div>

        <BountyModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setClickedLocation(null);
          }}
          onSubmit={handleCreateBounty}
        />
      </main>
    </LoadScript>
  );
}
