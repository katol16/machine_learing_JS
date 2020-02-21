require('@tensorflow/tfjs-node'); // tutaj tfjs-node -> Daje znać TensorFlow gdzie wykonywać obliczenia (CPU lub GPU). W tym przypadku będzie do CPU by default. Jeżeli będzesz musiał przejść na GPU, to musisz tfjs-node zamienic na tfjs-node-gpu i byc moze cos jeszcze zainstalwoac jakas biblioteke
const tf = require('@tensorflow/tfjs'); // dopiero to wymaga TF librari
// Może Cie dziwić powyższy zapis, bo masz pierwszy require nie zapisany w stałej (czyaj wyzej o co chodzi)

// Teraz importujemy nasz load-csv.js file (tam jest generalnie funkcja), któy pomoze nam załadować dane z "kc_house_data.excel"
const loadCSV = require('./load-csv');

function knn(features, labels, predictionPoint, k) {
    // Standarization
    // Pamiętaj, że standarization robimy dla predictionPoint i dla features
    const { mean, variance } = tf.moments(features, 0);

    // Standarization for predicitonPoint
    const scaledPrediciton = predictionPoint.sub(mean).div(variance.pow(0.5));

    return (
        features
            .sum(mean)
            .div(variance.pow(0.5))
            .sub(scaledPrediciton)
            .pow(2)
            .sum(1)
            .pow(0.5)
            .expandDims(1)
            .concat(labels, 1)
            .unstack()
            .sort((a,b) => a.get(0) > b.get(0) ? 1: -1)
            .slice(0,k)
            .reduce((acc, pair) => acc + pair.get(1), 0) / k
    );
}

// argumenty w loadCSV('nazwa_liku_z_ktoreg_importujemyDane', obiekt z opcjami np z uporządkowaniem "shuffle" danym przy pobraniem)
// funckja loadCSV zwróci obiekt, więc zrobimy mały destructuring
let { features, labels, testFeatures, testLabels } = loadCSV('kc_house_data.csv', {
    shuffle: true, // Posortuj dobrze dane
    splitTest: 10, // podziel dane na testowe i trenignowe oraz daj znac ile danych ma być przeznaoczne na dane testowe, czyli -> spliTest: ilość danych na testSet
    dataColumns: ['lat', 'long', 'sqft_lot'], // w tych dancyh jest mnóśtwo kolumn, które nas nie obchodzą, ale są kolumny "lat" i "long" i je potrzbujemy, daltego je tutaj wypsizemy w tablicy. Na razie beirzemy tylko współzędne, pzoniej może cos jeszcze dodamy
    labelColumns: ['price'], // analogicznie jak wyżej tylko dla labels a nie dataSet
});


// w naszym przypadku bedizemymiec 10 testFeatures i 10 testabels, a reszta to bedzie features i labels
console.log(testFeatures);
console.log(testLabels);

features = tf.tensor(features);
labels = tf.tensor(labels);

// Zanim przekażemy tu features itd. musimy pamiętać, że np. features jest tablicą a ma byc tensorem, dlatego powyzej zrobisz features = tf.tensor(features);
// Jako predictionPoint przekazujemy tylko konretny punkt, czyli konretny element tablicy, dlatego wystarczy zrobić tf.tensor(testFeatures[0]), czyli wziąć pierwszy element tablicy i wrzucić do tensora (PÓŻNIEJ ZROBIMY BARDZIEJ OGÓLNE ROZWIĄZANIE, któe wykona sie dla calego test set)
const result = knn(features, labels, tf.tensor(testFeatures[0]), 10);

// Reporting error value
    // error = (Expected Value - Predicted Value) / Expected Value
const err = (testLabels[0][0] - result) / testLabels[0][0];
console.log('Error: ', err * 100)

console.log('Guess: ', result, testLabels[0][0]) // Na ten moment nie dostaniemy tutaj super rezultatu
// result to nasz wynik zgadywania, a testLabels[0][0] jest faktycznym wynikiem. Wczesniej w wywołaniu predicitonPoint był testFeatures[0], więc teraz też nusimy wziąć w testLabels pierwszy element.
// Ponieważ jest to tablica będzie testLabels[0][0]

// Powyżej wywołujemy knn tylo dla jednego punktu, co daje mają obiektywnosć. Wywołajmy knn dla kazdego testFeture
testFeatures.forEach((testPoint, i) => {
    const result = knn(features, labels, tf.tensor(testPoint), 10);
    const err = (testLabels[i][0] - result) / testLabels[i][0];
    console.log('Errors in loop: ', err * 100)
});

// Mimo powyżśego wciąż nie mamy najlepszego wyniku, dlatego dodamy też powierzchnię do naszej estymatów
// Datego dodaliśmy do dataColumns 'sqft_lot'
// Tam będziemy mieć taki przypadek, że po pierwsze jest duża różnica pomiędzy lat, long a sqft_lot. Po drugie, wewnątrz sqft_lot są duże róznice. Jest mieszkanie co ma 500 m^2 i takie co ma ponad milion, a dodatkowow jest duży "gap" pomeidzy ogromnym a dużym meiszakniem.
// Z tych powodów użyjemy tutaj metode Standarized, do standaryzowania naszych danych.
// Standarized działą tak:
    // wartości są pomiędzy "from -1 standard deviation to 1 standard deviation". Oczywiscie mogą być więskz eniż -1 i 1. Ważne jest to, że średnie wartości i najczęstsze wartości będą w okolicach zera.
    // Generalnie dlatego użwyamy standarized method, bo działą lepiej dla danych, któe mają wartości, które są bardzo różne od wiekszości wartości (Obiegaja mocno od reszty)
    // Czyli np. jest 100 danych, które są liczbami w zakresie od 0 do 10, ale jest kilak co ma wartości ponad 500

// Implementacja Standarized method w lekcji nr 56
    // Standarization -> (Value - Average) / StandardDeviation  -> Generalnie za pomocą tensorflow, idzie to dość łątwo ogarnąć
        // Poniżej mały przykład
        // const numbers = tf.tensor([
        //    [1,2], // przyjmiemy, ze pierwszy element w tym tensorze to latitiude a drugi sqft_lot
        //    [3,4,
        //    [5,6],
        // ]);

        // Tutaj warto zazanczyć, że to Standarization działa "per column or per feature" -> bo w zasadzie dana kolumna, to dany feature

        // moments it's not a property of a tensor. We can NOT call number.moment()
        // tf.moments(numbers); // tot utaj zwróci między innymi obiekty mean i variance.
        // Ponziej zrobimy destructuring dla mean i variance i opsizmey co oznaczają
        // const { mean, variance } = tf.moments(numbers);
        // "mean" to po prostu "Average" z naszego wzoru
        // "variance" -> to coś co ma związek z StandardDeviation, a mainowicie StandardDeviation = sqrt(variance).

        // Ważna infromacja jest taka, że mean i variance zwrócą jedną wartość, a my potrzbeujemy wartości mean i variance per column, więc po dwie
        // funckja "moments" działa podobnei jak sum ( ta zasada z axis), czyli defaultowo zadziala nie per column ale dla calosci, dlatego musimy pdoac dodatkowy argument
        // Czyli: 0 - dla kolumn, 1 dla wierszy. Więc u nas będize 0
        // const { mean, variance } = tf.moments(numbers, 0);
        // Poniważ ostatecznie nasz  Standarization = (Value - mean) / sqrt(variance)
        // więc mamy
        // numbers.sub(mean).div(variance.pow(.5));
        // powyzej zwróci coś takiego [[-1.224,-1.224],[0,0],[1.224,1.224]] -> i to jest git, takei wartości są ok, jak popatrzysz jak działa Standarization

    // To był taki pobocnzy przykład w lekcji nr 57, bedziemy to rozwiąznaie stosować, dla naszego głównego przykładu