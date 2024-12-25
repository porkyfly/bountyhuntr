'use client'

import { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import BountyModal from "@/components/BountyModal";
import BountySidebar from "@/components/BountySidebar";
import BountyList from "@/components/BountyList";
import { Bounty } from "@prisma/client";

export default function Home() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [visibleBounties, setVisibleBounties] = useState<Bounty[]>([]);
  const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickedLocation, setClickedLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapCenter, setMapCenter] = useState({
    lat: 40.7128,
    lng: -74.0060
  });

  useEffect(() => {
    fetchBounties();
  }, []);

  useEffect(() => {
    if (map) {
      updateVisibleBounties();
      // Update visible bounties when the map moves
      map.addListener('idle', updateVisibleBounties);
    }
  }, [map, bounties]);

  useEffect(() => {
    // Get user's location when component mounts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Error getting location:', error);
          // Keep default NYC coordinates if geolocation fails
        }
      );
    }
  }, []);

  const updateVisibleBounties = () => {
    if (!map) return;
    
    const bounds = map.getBounds();
    if (!bounds) return;

    const visible = bounties.filter(bounty => {
      return bounds.contains({
        lat: bounty.latitude,
        lng: bounty.longitude
      });
    });

    setVisibleBounties(visible);
  };

  const fetchBounties = async () => {
    const response = await fetch('/api/bounties');
    const data = await response.json();
    setBounties(data);
  };

  const mapContainerStyle = {
    width: '100%',
    height: 'calc(100vh - 2rem)',
    borderRadius: '0.75rem'
  };
  
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;
    
    setClickedLocation({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });
    setIsModalOpen(true);
  };

  const handleCreateBounty = async ({ question, reward }) => {
    if (!clickedLocation) return;

    try {
      const response = await fetch('/api/bounties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          reward,
          latitude: clickedLocation.lat,
          longitude: clickedLocation.lng,
        }),
      });

      if (!response.ok) throw new Error('Failed to create bounty');

      const newBounty = await response.json();
      setBounties([...bounties, newBounty]);
      setClickedLocation(null);
    } catch (error) {
      console.error('Error creating bounty:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <BountySidebar
        bounty={selectedBounty}
        onClose={() => setSelectedBounty(null)}
        onAnswerSubmit={fetchBounties}
      />
      <div className="flex-1 p-4">
        <div className="flex gap-4 h-full max-w-[1920px] mx-auto">
          <div className="flex-1 rounded-xl overflow-hidden shadow-lg bg-white">
            <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={12}
                onClick={handleMapClick}
                onLoad={setMap}
                options={{
                  disableDefaultUI: false,
                  clickableIcons: false,
                  styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
                }}
              >
                {bounties.map((bounty) => (
                  <Marker
                    key={bounty.id}
                    position={{ lat: bounty.latitude, lng: bounty.longitude }}
                    onClick={() => setSelectedBounty(bounty)}
                    icon={{
                      url: `data:image/svg+xml,${encodeURIComponent(`
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="10" cy="10" r="8" fill="${bounty.status === 'open' ? '#FF0000' : '#00FF00'}"/>
                        </svg>
                      `)}`,
                      scaledSize: new window.google.maps.Size(20, 20)
                    }}
                  />
                ))}
              </GoogleMap>
            </LoadScript>
          </div>
          <div className="w-72">
            <BountyList 
              bounties={visibleBounties}
              onBountyClick={setSelectedBounty}
              className="h-full"
            />
          </div>
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
