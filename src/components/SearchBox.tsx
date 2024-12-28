'use client'

import { useState } from 'react';
import { Autocomplete } from '@react-google-maps/api';

interface SearchBoxProps {
  onPlaceSelect: (lat: number, lng: number) => void;
}

export default function SearchBox({ onPlaceSelect }: SearchBoxProps) {
  const [searchBox, setSearchBox] = useState<google.maps.places.Autocomplete | null>(null);

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    setSearchBox(autocomplete);
  };

  const onPlaceChanged = () => {
    if (searchBox) {
      const place = searchBox.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        onPlaceSelect(lat, lng);
      }
    }
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-96 max-w-[calc(100%-2rem)]">
      <Autocomplete
        onLoad={onLoad}
        onPlaceChanged={onPlaceChanged}
      >
        <input
          type="text"
          placeholder="Search locations..."
          className="w-full px-4 py-2 rounded-lg shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </Autocomplete>
    </div>
  );
} 