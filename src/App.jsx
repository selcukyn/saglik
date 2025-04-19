import React, { useState, useEffect } from 'react';
import { FaHospital, FaPills, FaDirections } from 'react-icons/fa';
import { locations } from './data/locations';

// Mesafe hesaplama fonksiyonu
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Dünya'nın yarıçapı (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function App() {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedContract, setSelectedContract] = useState('all');
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [showList, setShowList] = useState(false);
  const [message, setMessage] = useState('Lütfen konum seçin veya konumunuzu kullanın');
  const [userLocation, setUserLocation] = useState(null);

  const cities = [...new Set(locations.map(loc => loc.city).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'tr'));

  const districts = [...new Set(locations
    .filter(loc => loc.city === selectedCity)
    .map(loc => loc.district)
    .filter(Boolean))].sort((a, b) => a.localeCompare(b, 'tr'));

  const resetFilters = () => {
    setSelectedCity('');
    setSelectedDistrict('');
    setSelectedType('all');
    setSelectedContract('all');
    setFilteredLocations([]);
    setShowList(false);
    setMessage('Lütfen konum seçin veya konumunuzu kullanın');
    setUserLocation(null);
  };

  const findNearestLocations = (coords) => {
    const locationsWithDistance = locations.map(loc => ({
      ...loc,
      distance: calculateDistance(coords.latitude, coords.longitude, loc.latitude, loc.longitude)
    }));

    let filtered = locationsWithDistance.filter(loc => {
      const typeMatch = selectedType === 'all' || loc.type === selectedType;
      const contractMatch = selectedContract === 'all' || loc.contract === (selectedContract === 'true');
      return typeMatch && contractMatch;
    });

    const sorted = filtered.sort((a, b) => a.distance - b.distance);
    setFilteredLocations(sorted);
    setShowList(true);
    setMessage('');
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage('Tarayıcınız konum özelliğini desteklemiyor.');
      return;
    }

    setSelectedCity('');
    setSelectedDistrict('');

    const handleSuccess = (position) => {
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      findNearestLocations(position.coords);
      setMessage('');
    };

    const handleError = (error) => {
      console.error('Konum hatası:', error);
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setMessage('Konum izni reddedildi.');
          break;
        case error.POSITION_UNAVAILABLE:
          setMessage('Konum bilgisi alınamıyor.');
          break;
        case error.TIMEOUT:
          setMessage('Konum isteği zaman aşımına uğradı.');
          break;
        default:
          setMessage('Konum alınamadı. Lütfen manuel seçim yapın.');
      }
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
  };

  const filterLocations = () => {
    if (!selectedCity && filteredLocations.length === 0) {
      setFilteredLocations([]);
      setShowList(false);
      return;
    }

    if (filteredLocations.length > 0 && !selectedCity) {
      let filtered = filteredLocations.filter(loc => {
        const typeMatch = selectedType === 'all' || loc.type === selectedType;
        const contractMatch = selectedContract === 'all' || loc.contract === (selectedContract === 'true');
        return typeMatch && contractMatch;
      });
      setFilteredLocations(filtered);
      return;
    }

    let filtered = locations.filter(loc => {
      const cityMatch = loc.city === selectedCity;
      const districtMatch = !selectedDistrict || loc.district === selectedDistrict;
      const typeMatch = selectedType === 'all' || loc.type === selectedType;
      const contractMatch = selectedContract === 'all' || loc.contract === (selectedContract === 'true');
      return cityMatch && districtMatch && typeMatch && contractMatch;
    });

    if (userLocation) {
      filtered = filtered.map(loc => ({
        ...loc,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          loc.latitude,
          loc.longitude
        )
      }));
      filtered.sort((a, b) => a.distance - b.distance);
    }

    setFilteredLocations(filtered);
    setShowList(true);
    setMessage('');
  };

  const getDirections = (location) => {
    const destination = `${location.name}, ${location.address}, ${location.district}, ${location.city}`;
    const encodedDestination = encodeURIComponent(destination);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedDestination}`, '_blank');
  };

  useEffect(() => {
    filterLocations();
  }, [selectedCity, selectedDistrict, selectedType, selectedContract, userLocation]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-600">
        Sağlık Merkezi Arama
      </h1>

      {/* Filtreleme alanları */}
      {/* ... mevcut filtreleme kodlarını buraya bırakabilirsiniz ... */}

      {message && !showList && (
        <div className="text-center text-gray-600 my-4">
          {message}
          <br />
          Gösterilen mesafe fikir vermesi için kuş uçuşu hesaplanmaktadır, sürüş veya yürüyüş mesafesi için lütfen "Yol Tarifi" butonunu kullanınız.
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-gray-500 mt-8">
        Site tasarımı: Selçuk Yıldıran
      </footer>
    </div>
  );
}

export default App;
