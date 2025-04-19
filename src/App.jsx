import React, { useState, useEffect } from 'react';
 import { locations } from './data/locations';
 
 function App() {
   const [selectedCity, setSelectedCity] = useState('');
   const [selectedDistrict, setSelectedDistrict] = useState('');
   const [selectedType, setSelectedType] = useState('all');
   const [selectedContract, setSelectedContract] = useState('all');
   const [filteredLocations, setFilteredLocations] = useState([]);
   const [showList, setShowList] = useState(false)
   const [message, setMessage] = useState('Lütfen konum seçin veya konumunuzu kullanın');
 
   // Benzersiz şehirleri al
  // const cities = [...new Set(locations.map(loc => loc.city))].sort();
 //  const cities = [...new Set(locations.map(loc => loc.city))].sort();
     //const cities = [...new Set(locations.map(loc => loc.city))].sort((a, b) => a.localeCompare(b, 'tr'));
     const cities = [...new Set(locations.map(loc => loc.city).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'tr'));

 
   // Seçili şehre göre ilçeleri al
//   const districts = [...new Set(locations
    // .filter(loc => loc.city === selectedCity)
  //   .map(loc => loc.district))].sort();
  // const districts = [...new Set(locations
    // .filter(loc => loc.city === selectedCity)
   //  .map(loc => loc.district))].sort();
 
    // const districts = [...new Set(locations
    //   .filter(loc => loc.city === selectedCity)
     //  .map(loc => loc.district))].sort((a, b) => a.localeCompare(b, 'tr'));

          const districts = [...new Set(locations
            .filter(loc => loc.city === selectedCity)
            .map(loc => loc.district)
            .filter(Boolean))].sort((a, b) => a.localeCompare(b, 'tr'));

   
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
   };
 
   // Konum kullanma
   const useCurrentLocation = () => {
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
   };
 
   // Filtreleme
   const filterLocations = () => {
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
 
     // Şehir bazlı filtreleme
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
 
   // Google Maps yol tarifi
   const getDirections = (location) => {
     const destination = `${location.name}, ${location.address}, ${location.district}, ${location.city}`;
     const encodedDestination = encodeURIComponent(destination);
     window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedDestination}`, '_blank');
   };
 
   // Filtreleri izle
   useEffect(() => {
     filterLocations();
   }, [selectedCity, selectedDistrict, selectedType, selectedContract]);
 
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
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
{filteredLocations.map((location, index) => (
  <div key={index} className="bg-white shadow-md rounded px-6 py-4 flex flex-col h-full">
    {/* Ana içerik */}
    <div className="flex-grow">
      <h2 className="text-xl font-bold mb-2">{location.name}</h2>
      <p className="text-gray-600 mb-2">{location.type === 'hastane' ? 'Hastane' : 'Eczane'}</p>
      <p className="text-gray-600 mb-2">{location.address}</p>
      <p className="text-gray-600">{location.district}, {location.city}</p>
      <p className="text-gray-600 mb-2">
        İletişim: {location.iletisim ? (
          <a href={`tel:${location.iletisim}`} className="text-blue-600 hover:underline">
            {location.iletisim}
          </a>
        ) : 'Belirtilmemiş'}
      </p>
    </div>

    {/* Footer - her zaman altta sabit */}
    <div className="border-t pt-3 mt-3">
      <div className="flex items-center justify-between">
        <span className={`inline-block px-2 py-1 rounded text-sm ${
          location.contract ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {location.contract ? 'Anlaşmalı' : 'Anlaşmasız'}
        </span>
        <button
          onClick={() => getDirections(location)}
          className="yol-tarifi-btn"
        >
          Yol Tarifi
        </button>
      </div>
    </div>
  </div>
))}
         </div>
       )}
     </div>
   );
 }
 
 export default App;
