import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { locations } from './data/locations';

function App() {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedContract, setSelectedContract] = useState('all');
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [showList, setShowList] = useState(false);
  const [message, setMessage] = useState('Lütfen konum seçin veya konumunuzu kullanın');

  // Şehir ve ilçe listelerini memoize et
  const cities = useMemo(() => {
    try {
      return [...new Set(locations.map(loc => loc.city))]
        .sort((a, b) => a.localeCompare(b, 'tr'));
    } catch (error) {
      console.error('Şehir listesi oluşturulurken hata:', error);
      return [];
    }
  }, []);

  const districts = useMemo(() => {
    try {
      if (!selectedCity) return [];
      
      console.log('Seçilen şehir:', selectedCity);
      console.log('Mevcut lokasyonlar:', locations);

      // Case-insensitive şehir filtreleme
      const cityLocations = locations.filter(loc => 
        loc.city.toUpperCase() === selectedCity.toUpperCase()
      );

      console.log('Bulunan lokasyonlar:', cityLocations);

      // İlçeleri benzersiz olarak al ve sırala
      const uniqueDistricts = [...new Set(
        cityLocations.map(loc => loc.district)
      )].sort((a, b) => a.localeCompare(b, 'tr'));

      console.log('Bulunan ilçeler:', uniqueDistricts);
      return uniqueDistricts;
    } catch (error) {
      console.error(`İlçe listesi oluşturulurken hata (${selectedCity}):`, error);
      return [];
    }
  }, [selectedCity]);

  // Konum sıfırlama
  const resetFilters = useCallback(() => {
    setSelectedCity('');
    setSelectedDistrict('');
    setSelectedType('all');
    setSelectedContract('all');
    setFilteredLocations([]);
    setShowList(false);
    setMessage('Lütfen konum seçin veya konumunuzu kullanın');
  }, []);

  // En yakın lokasyonları bul
  const findNearestLocations = useCallback((coords) => {
    try {
      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };

      // Önce mesafeleri hesapla
      const locationsWithDistance = locations.map(loc => ({
        ...loc,
        distance: calculateDistance(coords.latitude, coords.longitude, loc.latitude, loc.longitude)
      }));

      // Mevcut filtreleri uygula
      let filtered = locationsWithDistance.filter(loc => {
        const typeMatch = selectedType === 'all' || loc.type === selectedType;
        const contractMatch = selectedContract === 'all' || loc.contract === (selectedContract === 'true');
        return typeMatch && contractMatch;
      });

      // Mesafeye göre sırala
      const sorted = filtered.sort((a, b) => a.distance - b.distance);
      setFilteredLocations(sorted);
      setShowList(true);
      setMessage('');
    } catch (error) {
      console.error('Mesafe hesaplama hatası:', error);
      setMessage('Lokasyonlar hesaplanırken bir hata oluştu.');
    }
  }, [selectedType, selectedContract]);

  // Konum kullanma
  const useCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setMessage('Tarayıcınız konum özelliğini desteklemiyor.');
      return;
    }

    // Şehir ve ilçe seçimlerini sıfırla
    setSelectedCity('');
    setSelectedDistrict('');

    const handleSuccess = (position) => {
      findNearestLocations(position.coords);
      setMessage('');
    };

    const handleError = (error) => {
      console.error('Konum hatası:', error);
      switch(error.code) {
        case error.PERMISSION_DENIED:
          setMessage('Konum izni reddedildi. Tarayıcı ayarlarından konum iznini etkinleştirin.');
          alert('Konum özelliğini kullanmak için:\n\n' +
                '1. Tarayıcı adres çubuğundaki kilit/info ikonuna tıklayın\n' +
                '2. Konum iznini "İzin Ver" olarak değiştirin\n' +
                '3. Sayfayı yenileyin ve tekrar deneyin');
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

    navigator.permissions.query({ name: 'geolocation' })
      .then(result => {
        if (result.state === 'prompt' || result.state === 'granted') {
          navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
        } else {
          setMessage('Konum izni reddedildi. Tarayıcı ayarlarından konum iznini etkinleştirin.');
          alert('Konum özelliğini kullanmak için:\n\n' +
                '1. Tarayıcı adres çubuğundaki kilit/info ikonuna tıklayın\n' +
                '2. Konum iznini "İzin Ver" olarak değiştirin\n' +
                '3. Sayfayı yenileyin ve tekrar deneyin');
        }
      })
      .catch(error => {
        console.error('İzin kontrolü hatası:', error);
        navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
      });
  }, [findNearestLocations]);

  // Filtreleme
  const filterLocations = useCallback(() => {
    try {
      if (!selectedCity && filteredLocations.length === 0) {
        setFilteredLocations([]);
        setShowList(false);
        return;
      }

      // Eğer konum bazlı liste varsa (filteredLocations dolu ise)
      if (filteredLocations.length > 0 && !selectedCity) {
        let filtered = filteredLocations.filter(loc => {
          const typeMatch = selectedType === 'all' || loc.type === selectedType;
          const contractMatch = selectedContract === 'all' || loc.contract === (selectedContract === 'true');
          return typeMatch && contractMatch;
        });
        setFilteredLocations(filtered);
        return;
      }

      // Şehir bazlı filtreleme - case insensitive
      let filtered = locations.filter(loc => {
        const cityMatch = loc.city.toUpperCase() === selectedCity.toUpperCase();
        const districtMatch = !selectedDistrict || loc.district === selectedDistrict;
        const typeMatch = selectedType === 'all' || loc.type === selectedType;
        const contractMatch = selectedContract === 'all' || loc.contract === (selectedContract === 'true');
        
        return cityMatch && districtMatch && typeMatch && contractMatch;
      });

      setFilteredLocations(filtered);
      setShowList(true);
      setMessage('');
    } catch (error) {
      console.error('Filtreleme sırasında hata:', error);
      setMessage('Filtreleme sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    }
  }, [selectedCity, selectedDistrict, selectedType, selectedContract, filteredLocations]);

  // Google Maps yol tarifi
  const getDirections = useCallback((location) => {
    const destination = `${location.name}, ${location.address}, ${location.district}, ${location.city}`;
    const encodedDestination = encodeURIComponent(destination);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedDestination}`, '_blank');
  }, []);

  // Filtreleri izle
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      filterLocations();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [filterLocations]);

  return (
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
                try {
                  const newCity = e.target.value;
                  console.log('Seçilen şehir değeri:', newCity);
                  setSelectedCity(newCity);
                  setSelectedDistrict('');
                } catch (error) {
                  console.error('Şehir seçimi sırasında hata:', error);
                }
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
              {districts && districts.length > 0 ? (
                districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))
              ) : null}
            </select>
          </div>

          <div className="col-span-1">
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

          <div className="col-span-1">
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

          <div className="col-span-1">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              &nbsp;
            </label>
            <button
              onClick={useCurrentLocation}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Konumu Kullan
            </button>
          </div>

          <div className="col-span-1">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              &nbsp;
            </label>
            <button
              onClick={resetFilters}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Sıfırla
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
