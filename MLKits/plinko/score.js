// Here in this "outputs" we will assemble the type of data we wanna use
const outputs = [];
// const k = 3; // tylko na początku dawaliśmy hardcoded value of "k"

function onScoreUpdate(dropPosition, bounciness, size, bucketLabel) {
  // Ran every time a balls drops into a bucket

    outputs.push([dropPosition, bounciness, size, bucketLabel]);

    // console.log(outputs);
};

function runAnalysis() {
  // Write code here to analyze stuff
    const testSetSize = 100;

    // Poniżej mały destructuring. Pamiętaj, ze splitDataset zwróci tablice z dwoma elementami i teraz te elementy wyciągniemy i wrzucimy do zmeinnych
    const [testSet, trainingSet] = splitDataset(outputs, testSetSize);

    // let numberCorrect = 0;
    // for (let i = 0; i < testSet.length; i++) {
    //     const bucket = knn(trainingSet, testSet[i][0]);
    //     if (bucket === testSet[i][3]) {
    //         // To w tej instrukcji potrzebne nam jest do sprawdzenia precyzji naszego algorytu. Np. ze, w 40% zgadł wynik
    //         numberCorrect++;
    //     }
    //     // console.log(bucket, testSet[i][3]);
    // }
    // console.log('Accuracy: ', numberCorrect / testSetSize);

    // range to prosto funkcja z lodash
    // tutaj w range podajemy parametr pcozątkowy i końcowy, to są nasze wartości "k" (tutaj bedzie od 1 do 19), pozniej dopalamy forEach, ktory dla kazej tej wartości "k", stworzy const accuracy
    _.range(1,20).forEach(k => {
        // To poniżej robi za pomocą "lodash" to samo co zakomentowana pętla for powyżej.
        const accuracy = _.chain(testSet)
            .filter(testPoint => knn(trainingSet, testPoint[0], k) === testPoint[3])
            .size()
            .divide(testSetSize)
            .value();

        console.log('For k of:', k ,'Accuracy: ', accuracy);
    });

};

function knn(data, point, k) {
    return _.chain(data)
        .map(row => [distance(row[0], point), row[3]])
        .sortBy(row => row[0])
        .slice( 0, k )
        .countBy(row => row[1])
        .toPairs()
        .sortBy(row => row[1])
        .last()
        .first()
        .parseInt()
        .value();
    // Tutaj zwrócimy liczbową wartość, któa w sumei mówi nam, że dla danego dropPosition, prawdopodobnie wpanie do "x" i to "x" jet zwracane
};

function distance(pointA, pointB) {
    return Math.abs(pointA - pointB)
};

function splitDataset(data, testCount) {
    // Zanim bedziemy analizować dane, w naszym przypadku warto je na początku pomieszać,
    // zeby nie bylo czegos takiego, ze w "Traning" są dane z dropPoint do 0 do 300, a w test od 300 do 600
    // to taka randomizacja danych
    const shuffled = _.shuffle(data);

    const testSet = _.slice(shuffled, 0, testCount); // od 0 do testCount
    const traningSet = _.slice(shuffled, testCount); // od testCount do konca tablicy

    return [testSet, traningSet]
};
