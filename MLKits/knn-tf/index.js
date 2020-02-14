require('@tensorflow/tfjs-node'); // tutaj tfjs-node -> Daje znać TensorFlow gdzie wykonywać obliczenia (CPU lub GPU). W tym przypadku będzie do CPU by default. Jeżeli będzesz musiał przejść na GPU, to musisz tfjs-node zamienic na tfjs-node-gpu i byc moze cos jeszcze zainstalwoac jakas biblioteke
const tf = require('@tensorflow/tfs'); // dopiero to wymaga TF librari
// Może Cie dziwić powyższy zapis, bo masz pierwszy require nie zapisany w stałej

// Teraz importujemy nasz load-csv.js file (tam jest generalnie funkcja), któy pomoze nam załadować dane z "kc_house_data.excel"
const loadCSV = require('./load-csv');

// argumenty w loadCSV('nazwa_liku_z_ktoreg_importujemyDane', obiekt z opcjami np z uporządkowaniem "shuffle" danym przy pobraniem)
loadCSV('kc_house_data.csv', {
    shuffle: true, // Posortuj dobrze dane
    splitTest: 10, // podziel dane na testowe i trenignowe oraz daj znac ile danych ma być przeznaoczne na dane testowe, czyli -> spliTest: ilość danych na testSet
    dataColumns: ['lat', 'long'] // w tych dancyh jest mnóśtwo kolumn, które nas nie obchodzą, ale są kolumny "lat" i "long" i je potrzbujemy, daltego je tutaj wypsizemy w tablicy. Na razie beirzemy tylko współzędne, pzoniej może cos jeszcze dodamy
    labelColumns: ['price'], // analogicznie jak wyżej tylko dla labels a nie dataSet
});
