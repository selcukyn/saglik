import React, { useState, useEffect } from 'react';
import { locations } from './data/locations';

function App() {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedContract, setSelectedContract] = useState('all'); // yeni
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [showList, setShowList] = useState(false); // yeni
  const [message, setMessage] = useState('Lütfen konum seçin veya konumunuzu kullanın'); // yeni

  // Benzersiz şehirleri al
  const cities = [...new Set(locations.map(loc => loc.city))].sort();

  // Seçili şehre göre ilçeleri al
  const districts = [...new Set(locations
    .filter(loc => loc.city === selectedCity)
    .map(loc => loc.district))].sort();

  // Konum kullanma fonksiyonu
  const useCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then(function(result) {
        if (result.state === 'granted') {
          getCurrentPosition();
        } else if (result.state === 'prompt') {
          navigator.geolocation.getCurrentPosition(
            position => {
              findNearestLocations(position.coords);
            },
            error => {
              setMessage('Konum alınamadı. Lütfen manuel seçim yapın.');
            }
          );
        } else {
          setMessage('Konum izni reddedildi. Lütfen manuel seçim yapın.');
        }
      });
    } else {
      setMessage('Tarayıcınız konum özelliğini desteklemiyor.');
    }
  };

  const getCurrentPosition = () => {
    navigator.geolocation.getCurrentPosition(
      position => {
        findNearestLocations(position.coords);
      },
      error => {
        setMessage('Konum alınamadı. Lütfen manuel seçim yapın.');
      }
    );
  };

  // En yakın lokasyonları bul
  const findNearestLocations = (coords) => {
    // Basit bir mesafe hesaplama için Haversine formülü
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Dünya'nın yarıçapı (km)
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const locationsWithDistance = locations.map(loc => ({
      ...loc,
      distance: calculateDistance(coords.latitude, coords.longitude, loc.latitude, loc.longitude)
    }));

    const sorted = locationsWithDistance.sort((a, b) => a.distance - b.distance);
    setFilteredLocations(sorted);
    setShowList(true);
    setMessage('');
  };

  // Filtreleme fonksiyonu
  const filterLocations = () => {
    if (!selectedCity) {
      setFilteredLocations([]);
      setShowList(false);
      return;
    }

    let filtered = locations.filter(loc => {
      const cityMatch = loc.city === selectedCity;
      const districtMatch = !selectedDistrict || loc.district === selectedDistrict;
      const typeMatch = selectedType === 'all' || loc.type === selectedType;
      const contractMatch = selectedContract === 'all' || loc.contract === selectedContract;
      
      return cityMatch && districtMatch && typeMatch && contractMatch;
    });

    setFilteredLocations(filtered);
    setShowList(true);
    setMessage('');
  };

  useEffect(() => {
    filterLocations();
  }, [selectedCity, selectedDistrict, selectedType, selectedContract]);

  // Google Maps yol tarifi fonksiyonu
  const getDirections = (location) => {
    const destination = `${location.name}, ${location.address}, ${location.district}, ${location.city}`;
    const encodedDestination = encodeURIComponent(destination);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedDestination}`, '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-600">
        Sağlık Merkezi Arama
      </h1>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
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

          <div>
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

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Tür
            </label>
            <select
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">Tümü</option>
              <option value="hastane">Hastane</option>
              <option value="eczane">Eczane</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Anlaşma Durumu
            </label>
            <select
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={selectedContract}
              onChange={(e) => setSelectedContract(e.target.value)}
            >
              <option value="all">Tümü</option>
              <option value="true">Anlaşmalı</option>
              <option value="false">Anlaşmasız</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={useCurrentLocation}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Konumu Kullan
            </button>
          </div>
        </div>
      </div>

      {message && !showList && (
        <div className="text-center text-gray-600 my-4">
          {message}
        </div>
      )}

      {showList && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLocations.map((location, index) => (
            <div key={index} className="bg-white shadow-md rounded px-6 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold mb-2">{location.name}</h2>
                  <p className="text-gray-600 mb-2">{location.type === 'hastane' ? 'Hastane' : 'Eczane'}</p>
                  <p className="text-gray-600 mb-2">{location.address}</p>
                  <p className="text-gray-600">{location.district}, {location.city}</p>
                  <span className={`inline-block px-2 py-1 rounded text-sm ${
                    location.contract ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  } mt-2`}>
                    {location.contract ? 'Anlaşmalı' : 'Anlaşmasız'}
                  </span>
                </div>
                <button
                  onClick={() => getDirections(location)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Yol Tarifi
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
