import React, { useState, useEffect } from 'react';
import { locations } from './data/locations';

function App() {
  const [locationType, setLocationType] = useState('eczane');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [isUsingLocation, setIsUsingLocation] = useState(false); // değişken adını değiştirdik
  const [userCoordinates, setUserCoordinates] = useState(null);

  // Benzersiz şehirleri al
  useEffect(() => {
    const uniqueCities = [...new Set(locations.map(item => item.city))].sort();
    setCities(uniqueCities);
  }, []);

  // Seçili şehre göre ilçeleri güncelle
  useEffect(() => {
    if (selectedCity) {
      const cityDistricts = [...new Set(
        locations
          .filter(item => item.city === selectedCity)
          .map(item => item.district)
      )].sort();
      setDistricts(cityDistricts);
    } else {
      setDistricts([]);
    }
  }, [selectedCity]);

  // Konumu kullan butonuna tıklandığında
  const handleUseLocation = () => {
    setIsUsingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        // Konum alındığında şehir ve ilçe seçimlerini sıfırla
        setSelectedCity('');
        setSelectedDistrict('');
      },
      (error) => {
        console.error("Konum alınamadı:", error);
        setIsUsingLocation(false);
        alert("Konumunuz alınamadı. Lütfen konum izinlerini kontrol edin.");
      }
    );
  };

  // Filtreleme işlemi
  useEffect(() => {
    let filtered = [...locations];
    
    if (selectedCity) {
      filtered = filtered.filter(item => item.city === selectedCity);
    }
    
    if (selectedDistrict) {
      filtered = filtered.filter(item => item.district === selectedDistrict);
    }

    // Eğer konum kullanılıyorsa ve koordinatlar varsa
    if (isUsingLocation && userCoordinates) {
      // Burada gerçek bir mesafe hesaplaması yapılabilir
      // Şimdilik sadece bir bilgi mesajı gösterelim
      console.log("Kullanıcı konumu:", userCoordinates);
    }

    setFilteredLocations(filtered);
  }, [selectedCity, selectedDistrict, isUsingLocation, userCoordinates]);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Sağlık Merkezi Arama
          </h1>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            {/* Tür Seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tür
              </label>
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="eczane">Eczane</option>
                <option value="hastane">Hastane</option>
              </select>
            </div>

            {/* Şehir Seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şehir
              </label>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedDistrict('');
                }}
                disabled={isUsingLocation}
                className="w-full rounded-md border border-gray-300 p-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Şehir Seçin</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* İlçe Seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İlçe
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={!selectedCity || isUsingLocation}
              >
                <option value="">İlçe Seçin</option>
                {districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            {/* Konum Butonu */}
            <div className="flex items-end">
              <button
                onClick={handleUseLocation}
                className={`w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isUsingLocation 
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isUsingLocation ? 'Konumu İptal Et' : 'Konumumu Kullan'}
              </button>
            </div>
          </div>

          {/* Sonuçlar Listesi */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">
              {isUsingLocation ? 'Size En Yakın Merkezler' : 'Sonuçlar'}
            </h2>
            <div className="space-y-4">
              {filteredLocations.map((location, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-medium text-gray-900">{location.name}</h3>
                  <p className="text-gray-600">
                    {location.city}, {location.district}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">{location.address}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
