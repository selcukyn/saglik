import React, { useState, useEffect } from 'react';
import { locations } from './data/locations';
import ErrorBoundary from './ErrorBoundary'; // ErrorBoundary bileşenini dahil edin

function App() {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedContract, setSelectedContract] = useState('all');
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [showList, setShowList] = useState(false);
  const [message, setMessage] = useState('Lütfen konum seçin veya konumunuzu kullanın');

  // Benzersiz şehirleri al
  const cities = [...new Set(locations.map(loc => loc.city))].sort((a, b) => a.localeCompare(b, 'tr'));

  // Seçili şehre göre ilçeleri al
  const districts = [...new Set(locations
    .filter(loc => loc.city === selectedCity)
    .map(loc => loc.district))].sort((a, b) => a.localeCompare(b, 'tr'));

  // Konum sıfırlama
  const resetFilters = () => {
    setSelectedCity('');
    setSelectedDistrict('');
    setSelectedType('all');
    setSelectedContract('all');
    setFilteredLocations([]);
    setShowList(false);
    setMessage('Lütfen konum seçin veya konumunuzu kullanın');
  };

  // En yakın lokasyonları bul
  const findNearestLocations = (coords) => {
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

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

  // Konum kullanma
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage('Tarayıcınız konum özelliğini desteklemiyor.');
      return;
    }

    setSelectedCity('');
    setSelectedDistrict('');

    const handleSuccess = (position) => {
      findNearestLocations(position.coords);
      setMessage('');
    };

    const handleError = (error) => {
      console.error('Konum hatası:', error);
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setMessage('Konum izni reddedildi. Tarayıcı ayarlarından konum iznini etkinleştirin.');
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

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
  };

  // Filtreleme
  const filterLocations = () => {
    if (!selectedCity && filteredLocations.length === 0) {
      setFilteredLocations([]);
      setShowList(false);
      return;
    }

    let filtered = locations.filter(loc => {
      const cityMatch = loc.city === selectedCity;
      const districtMatch = !selectedDistrict || loc.district === selectedDistrict;
      const typeMatch = selectedType === 'all' || loc.type === selectedType;
      const contractMatch = selectedContract === 'all' || loc.contract === (selectedContract === 'true');

      return cityMatch && districtMatch && typeMatch && contractMatch;
    });

    setFilteredLocations(filtered);
    setShowList(true);
    setMessage('');
  };

  // Filtreleri izle
  useEffect(() => {
    filterLocations();
  }, [selectedCity, selectedDistrict, selectedType, selectedContract]);

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-600">
          Sağlık Merkezi Arama
        </h1>

        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="col-span-1">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Şehir
              </label>
              <select
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedDistrict('');
                }}
              >
                <option value="">Seçiniz</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                İlçe
              </label>
              <select
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={!selectedCity}
              >
                <option value="">Tümü</option>
                {districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {message && !showList && (
          <div className="text-center text-gray-600 my-4">{message}</div>
        )}

        {showList && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLocations.map((location, index) => (
              <div key={index} className="bg-white shadow-md rounded px-6 py-4">
                <h2 className="text-xl font-bold mb-2">{location.name}</h2>
              </div>
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
