import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { locations } from './data/locations';

const EARTH_RADIUS_KM = 6371;

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

const App = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedContract, setSelectedContract] = useState('all');
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [showList, setShowList] = useState(false);
  const [message, setMessage] = useState('Lütfen konum seçin veya konumunuzu kullanın');

  const cities = useMemo(() => {
    try {
      const allCities = [...new Set(locations.map(loc => loc.city.trim()))]
        .sort((a, b) => a.localeCompare(b, 'tr'));
      console.log(`Benzersiz şehirler: ${allCities}`);
      return allCities;
    } catch (error) {
      console.error('Şehir listesi oluşturulurken hata:', error.message);
      return [];
    }
  }, []);

  const districts = useMemo(() => {
    try {
      if (!selectedCity) return [];
      const cityLocations = locations.filter(loc =>
        loc.city.trim().toLowerCase() === selectedCity.trim().toLowerCase()
      );
      const uniqueDistricts = [...new Set(cityLocations.map(loc => loc.district.trim()))]
        .sort((a, b) => a.localeCompare(b, 'tr'));
      return uniqueDistricts;
    } catch (error) {
      console.error('İlçe listesi oluşturulurken hata:', error.message);
      return [];
    }
  }, [selectedCity]);

  const resetFilters = useCallback(() => {
    setSelectedCity('');
    setSelectedDistrict('');
    setSelectedType('all');
    setSelectedContract('all');
    setFilteredLocations([]);
    setShowList(false);
    setMessage('Lütfen konum seçin veya konumunuzu kullanın');
  }, []);

  const findNearestLocations = useCallback((coords) => {
    try {
      const locationsWithDistance = locations.map(loc => ({
        ...loc,
        distance: calculateDistance(coords.latitude, coords.longitude, loc.latitude, loc.longitude)
      }));
      const filtered = locationsWithDistance.filter(loc => {
        const typeMatch = selectedType === 'all' || loc.type === selectedType;
        const contractMatch = selectedContract === 'all' || loc.contract === (selectedContract === 'true');
        return typeMatch && contractMatch;
      }).sort((a, b) => a.distance - b.distance);
      setFilteredLocations(filtered);
      setShowList(true);
      setMessage('');
    } catch (error) {
      console.error('Mesafe hesaplama hatası:', error);
      setMessage('Lokasyonlar hesaplanırken bir hata oluştu.');
    }
  }, [selectedType, selectedContract]);

  const useCurrentLocation = useCallback(() => {
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
      setMessage('Konum alınamadı. Lütfen manuel seçim yapın.');
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, { enableHighAccuracy: true });
  }, [findNearestLocations]);

  const filterLocations = useCallback(() => {
    try {
      const filtered = locations.filter(loc => {
        const cityMatch = !selectedCity || loc.city.trim().toLowerCase() === selectedCity.trim().toLowerCase();
        const districtMatch = !selectedDistrict || loc.district.trim() === selectedDistrict.trim();
        const typeMatch = selectedType === 'all' || loc.type === selectedType;
        const contractMatch = selectedContract === 'all' || loc.contract === (selectedContract === 'true');
        return cityMatch && districtMatch && typeMatch && contractMatch;
      });
      setFilteredLocations(filtered);
      setShowList(true);
      setMessage('');
    } catch (error) {
      console.error('Filtreleme hatası:', error);
      setMessage('Filtreleme sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    }
  }, [selectedCity, selectedDistrict, selectedType, selectedContract]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      filterLocations();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [filterLocations]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-600">Sağlık Merkezi Arama</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        {/* Şehir, İlçe ve Filtreleme Seçenekleri */}
        {/* Butonlar ve Listeleme */}
        {/* Uygun bileşenleri buraya ekleyin */}
      </div>
    </div>
  );
};

export default App;
