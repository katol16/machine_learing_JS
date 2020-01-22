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

            // to byłow cześniej z one dimentional distance
            // .filter(testPoint => knn(trainingSet, testPoint[0], k) === testPoint[3])

            // dzięki _.initial(testPoint), mamy pewnosć, że przekażemy tablice z 3 features bez koszyka, do którego wpadła piłka
            .filter(testPoint => knn(trainingSet, _.initial(testPoint), k) === testPoint[3])
            .size()
            .divide(testSetSize)
            .value();

        console.log('For k of:', k ,'Accuracy: ', accuracy);
    });

};

function knn(data, point, k) {
    return _.chain(data)
        // UWAGA! Nasz algorytm napiszemy tak żeby nie wysypał sie gdy dodamy więcej "features", czyli tych parametróœ typu "bouciness, dropPosition" itd.
        // Będzie to troche trudniejsze do zrobienia, ale zdecydowanie lepsze

        // W tej funkcji, będziemy chcieli wydzielić ostatni element z naszej tablicy point, bo ten element jest koszykiem
        // a nas tutaj w "distance" interesują tylko features
        // zrobimy to za pomocą lodash
        // Przykład:
        // const point = [350, 0.5, 16, 4];
        //
        // _.initial(point) // zwróci [350, 0.5, 16]
        // _.last(point) // zwróci 4

        // Możesz się zastanawiać dlaczego właściwie nie robimy tak:
        // point.pop(); // to też zwróci ostatni element.
        // Problem w tym, że to modyfikuje też naszą orginalną tablicę
        // po operacji .pop, nasz const point bedzie wyglądał tak: [350, 0.5, 16]
        // w akurat tym przypadku mozemy mieć na to wyjebane, ale będą najczęściej takie przypadki, gdzie nie możemy sobei na to pozwolić
        // Lodash nie modyfikuje orginalnej tablicy i daltego go używamy!

        // tego poniżej używaliśµy do one dimentional distance
        // .map(row => [distance(row[0], point), row[3]])

        .map(row => {
            // point has 3 values!!!
            return [
                distance(_.initial(row), point),
                _.last(row)
            ]
        })
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
    // UWAGA! Nasz algorytm napiszemy tak żeby nie wysypał sie gdy dodamy więcej "features", czyli tych parametróœ typu "bouciness, dropPosition" itd.
    // Będzie to troche trudniejsze do zrobienia, ale zdecydowanie lepsze

    // Wcześniej mielismy:
    // pointA = 300, pointB = 350
    // Teraz będziemy mieć:
    // pointA = [350, .5, 16], pointB = [350, .55, 16]
    // Za pomocą lodash, obliczymy dystans dla tych elementów, które są de'fakto tablcami ze współrzędnymi

    // "zip" function, weżmie pierwsze indeksy z tablic i połaczy je w jedną tablicę, drugie indeksy z tablic i połaćzy je w drugą tablicę itd.
    // całość, czyli wszysktie te tablice wsadzi do jednej tablicy

    // Przykład:
    // const pointA = [1,1];
    // const pointB = [4,5];
    //
    // _.chain(pointA)
    //     .zip(pointB) // [[1,4],[1,5]] -> to jest potrzebne, ze względu na sposób obliczania odległości w ukąłdzie wspólrzędnych (to ogarniasz)
    //     .map(pair => (pair[0] - pair[1])**2) // lub inny zapis z destructuring .map(([a,b]) => (a - b)**2) , dodatkowo pamiętaj, że **2 znaczy "do kwadratu"
    //     .sum()
    //     .value() ** 0.5; // na koniec w "chain" trzeba dać to value, no i pierwiastek z wartości czyli ** 0.5
    // Pamiętaj też, ze to powyżej zadziała jeśli będzie pointA = [1,1,1]; i pointB = [4,5,6]; czyli jeśli będą 3 współrzędne
    // zadziała z tymi 3 współrzędnymi i nic nie trzeba zmieniać



    return _.chain(pointA)
        .zip(pointB) // [[1,4],[1,5]] -> to jest potrzebne, ze względu na sposób obliczania odległości w ukąłdzie wspólrzędnych (to ogarniasz)
        .map(pair => (pair[0] - pair[1])**2) // lub inny zapis z destructuring .map(([a,b]) => (a - b)**2) , dodatkowo pamiętaj, że **2 znaczy "do kwadratu"
        .sum()
        .value() ** 0.5;

    // To poniżej było wcześniej, dla one dimential distance
    // return Math.abs(pointA - pointB)
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
