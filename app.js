document.addEventListener("DOMContentLoaded", () => {
    const citySelect = document.getElementById("city");
    const districtSelect = document.getElementById("district");
    const resultList = document.getElementById("resultList");

    // Şehir ve ilçe verilerini JSON'dan al
    fetch("eczane.json")  // Yolu güncelledim
        .then((response) => response.json())
        .then((data) => {
            const cities = [...new Set(data.map((item) => item.city))];
            cities.forEach((city) => {
                const option = document.createElement("option");
                option.value = city;
                option.textContent = city;
                citySelect.appendChild(option);
            });

            citySelect.addEventListener("change", () => {
                districtSelect.innerHTML = '<option value="">İlçe seçin</option>';
                districtSelect.disabled = false;

                const selectedCity = citySelect.value;
                const districts = [
                    ...new Set(
                        data
                            .filter((item) => item.city === selectedCity)
                            .map((item) => item.district)
                    ),
                ];

                districts.forEach((district) => {
                    const option = document.createElement("option");
                    option.value = district;
                    option.textContent = district;
                    districtSelect.appendChild(option);
                });
            });

            document.getElementById("filterForm").addEventListener("submit", (e) => {
                e.preventDefault();
                const selectedCity = citySelect.value;
                const selectedDistrict = districtSelect.value;

                const filteredResults = data.filter(
                    (item) =>
                        item.city === selectedCity &&
                        (!selectedDistrict || item.district === selectedDistrict)
                );

                resultList.innerHTML = "";
                filteredResults.forEach((result) => {
                    const li = document.createElement("li");
                    li.textContent = `${result.name} - ${result.address}`;
                    resultList.appendChild(li);
                });
            });
        })
        .catch((error) => console.error("Veriler yüklenemedi:", error));
});
