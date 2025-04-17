import React, { useState, useEffect } from 'react';
import { locations } from './data/locations';

function App() {
  // ... diğer state'ler aynı ...

  // Sıfırlama fonksiyonu
  const resetFilters = () => {
    setSelectedCity('');
    setSelectedDistrict('');
    setSelectedType('all');
    setSelectedContract('all');
    setFilteredLocations([]);
    setShowList(false);
    setMessage('Lütfen konum seçin veya konumunuzu kullanın');
  };

  // Konum kullanma fonksiyonunu güncelleyelim
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage('Tarayıcınız konum özelliğini desteklemiyor.');
      return;
    }

    const handleSuccess = (position) => {
      findNearestLocations(position.coords);
      setMessage('');
    };

    const handleError = (error) => {
      console.error('Konum hatası:', error);
      switch(error.code) {
        case error.PERMISSION_DENIED:
          setMessage('Konum izni reddedildi. Tarayıcı ayarlarından konum iznini etkinleştirin.');
          // Kullanıcıya nasıl izin vereceğini gösteren bir mesaj ekleyelim
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

    // Önce mevcut izin durumunu kontrol edelim
    navigator.permissions.query({ name: 'geolocation' })
      .then(result => {
        if (result.state === 'prompt' || result.state === 'granted') {
          navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
        } else {
          setMessage('Konum izni reddedildi. Tarayıcı ayarlarından konum iznini etkinleştirin.');
          // Kullanıcıya nasıl izin vereceğini gösteren bir mesaj
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
  };

  // ... diğer fonksiyonlar aynı ...

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-600">
        Sağlık Merkezi Arama
      </h1>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4"> {/* grid-cols-5'ten grid-cols-6'ya değişti */}
          {/* ... diğer input'lar aynı ... */}

          <div className="flex items-end">
            <button
              onClick={useCurrentLocation}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Konumu Kullan
            </button>
          </div>

          {/* Sıfırlama butonu */}
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Sıfırla
            </button>
          </div>
        </div>
      </div>

      {/* ... geri kalan kısım aynı ... */}
    </div>
  );
}

export default App;
