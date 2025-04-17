import React, { useState, useEffect } from 'react';
import { locations } from './data/locations';

function App() {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedContract, setSelectedContract] = useState('all');
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [showList, setShowList] = useState(false);
  const [message, setMessage] = useState('Lütfen konum seçin veya konumunuzu kullanın');

  // ... diğer fonksiyonlar aynı ...

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
