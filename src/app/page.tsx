'use client'

import { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Bounty, Answer } from "@prisma/client";
import MobileLayout from "@/components/MobileLayout";
import DesktopLayout from "@/components/DesktopLayout";
import BountyModal from "@/components/BountyModal";
import { getRemainingTime } from '@/utils/time';

type BountyWithAnswers = Bounty & { answers: Answer[] };

export default function Home() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [visibleBounties, setVisibleBounties] = useState<Bounty[]>([]);
  const [selectedBounty, setSelectedBounty] = useState<BountyWithAnswers | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [hoveredBountyId, setHoveredBountyId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickedLocation, setClickedLocation] = useState<google.maps.LatLngLiteral | null>(null);

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

  const initializeUserLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (position) => setMapCenter({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      })
    );
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

  return (
    <div className="relative h-[100dvh] w-full">
      <div className="absolute inset-0 z-0">
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={mapCenter}
            zoom={12}
            onClick={(e) => {
              if (e.latLng) {
                setClickedLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                setIsModalOpen(true);
              }
            }}
            onLoad={setMap}
            options={{
              disableDefaultUI: false,
              clickableIcons: false,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
              gestureHandling: 'greedy',
            }}
          >
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
        </LoadScript>
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
    </div>
  );
}
