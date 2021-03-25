import { AverageMethod, ConfusionMatrix, ConfusionMatrixClasses } from "./confusion-matrix.models";

describe("Confusion matrix model test suite", () => {

    it("Can initialize correctly.", () => {
        const confusionMatrix = TestsHelper.getConfusionMatrix();
        expect(confusionMatrix.labels).toEqual(TestsHelper.getLabels());
        expect(confusionMatrix.matrix).toEqual(TestsHelper.getMatrix());
    });

    it("Should set confusion matrix from another confusion matrix.", () => {
        const confusionMatrix = TestsHelper.getConfusionMatrix();
        const labels = ['Joy', 'Euphoria'];
        const matrix = [[10, 20], [30, 40]]
        const anotherConfusionMatrix = new ConfusionMatrix({
            labels, matrix
        });
        const returnedConfusionMatrix = confusionMatrix.setConfusionMatrix(anotherConfusionMatrix, false);
        expect(confusionMatrix.labels).toEqual(labels);
        expect(confusionMatrix.matrix).toEqual(matrix);
        expect(returnedConfusionMatrix.labels).toEqual(anotherConfusionMatrix.labels);
        expect(returnedConfusionMatrix.matrix).toEqual(anotherConfusionMatrix.matrix);
        expect(confusionMatrix.labels).toEqual(anotherConfusionMatrix.labels);
        expect(confusionMatrix.matrix).toEqual(anotherConfusionMatrix.matrix);
    });

    it("Should set/get labels and matrix", () => {
        const confusionMatrix = new ConfusionMatrix()
        const labels = ['Joy', 'Euphoria'];
        const matrix = [[10, 20], [30, 40]]
        confusionMatrix.labels = labels;
        confusionMatrix.matrix = matrix;
        expect(confusionMatrix.labels).toEqual(labels);
        expect(confusionMatrix.matrix).toEqual(matrix);
    });

    it("Should normalize a matrix", () => {
        let confusionMatrix = TestsHelper.getConfusionMatrix();
        let returnedMatrix = confusionMatrix.normalize();
        expect(confusionMatrix.matrix).toEqual([[0.7, 0.8, 1],
        [0.1, 0.2, 0.3],
        [0.3, 0.2, 0]]
        );
        expect(returnedMatrix).toEqual(confusionMatrix);

        confusionMatrix = TestsHelper.getConfusionMatrix();
        confusionMatrix.normalize(1, 2);
        expect(confusionMatrix.matrix).toEqual([[1.7, 1.8, 2],
        [1.1, 1.2, 1.3],
        [1.3, 1.2, 1]]
        );
        expect(returnedMatrix).not.toEqual(confusionMatrix);

        confusionMatrix = TestsHelper.getConfusionMatrix();
        confusionMatrix.normalize(-1, 0, 1);
        expect(confusionMatrix.matrix).toEqual([[-0.3, -0.2, 0],
        [-0.9, -0.8, -0.7],
        [-0.7, -0.8, -1]]
        );

        confusionMatrix = TestsHelper.getConfusionMatrix();
        confusionMatrix.normalize(-13.726, 89.93214, 5);
        expect(confusionMatrix.matrix).toEqual([[58.8347, 69.20051, 89.93214],
        [-3.36019, 7.00563, 17.37144],
        [17.37144, 7.00563, -13.726]]
        );

        confusionMatrix.normalize(-13.726, 89.93214, 5);

        expect(() => confusionMatrix.normalize(3, 3))
            .toThrow(new Error('Min value cannot be equal or greater than max value.'));

        expect(() => confusionMatrix.normalize(4, 3))
            .toThrow(new Error('Min value cannot be equal or greater than max value.'));

        expect(() => confusionMatrix.normalize(-1, -3))
            .toThrow(new Error('Min value cannot be equal or greater than max value.'));

    });

    it("Can revert normalizations.", () => {
        const confusionMatrix = TestsHelper.getConfusionMatrix();
        confusionMatrix.normalize(0, 1);
        expect(confusionMatrix.matrix).toEqual([[0.7, 0.8, 1],
        [0.1, 0.2, 0.3],
        [0.3, 0.2, 0]]
        );
        let result = confusionMatrix.revertNormalization() as ConfusionMatrix;
        expect(confusionMatrix.matrix).toEqual(TestsHelper.getConfusionMatrix().matrix);
        expect(result.matrix).toEqual(TestsHelper.getConfusionMatrix().matrix);

        let result2 = confusionMatrix.revertNormalization();
        expect(confusionMatrix.matrix).toEqual(TestsHelper.getConfusionMatrix().matrix);
        expect(result2).toBeNull();

    });

    it("Can revert all normalizations.", () => {
        const confusionMatrix = TestsHelper.getConfusionMatrix();
        let returnedConfusionMatrix = confusionMatrix.revertAllNormalizations();
        expect(confusionMatrix.matrix).toEqual(TestsHelper.getConfusionMatrix().matrix);
        expect(returnedConfusionMatrix).toEqual(confusionMatrix);
        confusionMatrix.normalize(0, 1);
        confusionMatrix.normalize(1, 2);
        confusionMatrix.normalize(3, 4);
        confusionMatrix.normalize(-1, 6);
        returnedConfusionMatrix = confusionMatrix.revertAllNormalizations();
        expect(confusionMatrix.matrix).toEqual(TestsHelper.getConfusionMatrix().matrix);
        expect(returnedConfusionMatrix).toEqual(confusionMatrix);

    });

    it("Can get min and max.", () => {
        const confusionMatrix = TestsHelper.getConfusionMatrix();
        let matrixMinMax = confusionMatrix.getMinAndMax();
        expect(matrixMinMax).toEqual({ min: 0, max: 10 });
        confusionMatrix.matrix = [[]];
        matrixMinMax = confusionMatrix.getMinAndMax();
        expect(matrixMinMax).toBeNull();

    });

    it("Can clone confusion matrix.", () => {
        const confusionMatrix = TestsHelper.getConfusionMatrix();

        // To test bug #16: insures history object is not empty.
        confusionMatrix.setConfusionMatrix(new ConfusionMatrix({
            labels: ["Amazing", "Library"],
            matrix: [[5, 2],
            [0, 5]]
        }));

        const clonedConfusionMatrix = confusionMatrix.clone();

        expect(confusionMatrix).toEqual(clonedConfusionMatrix);

        clonedConfusionMatrix.normalize(1, 2);
        expect(confusionMatrix).not.toEqual(clonedConfusionMatrix);

    });


    it("Can validate labels format correctly.", () => {
        let confusionMatrix = TestsHelper.getConfusionMatrix();
        expect(confusionMatrix.labels).toEqual(TestsHelper.getLabels());
        expect(confusionMatrix.matrix).toEqual(TestsHelper.getMatrix());
        expect(confusionMatrix.labels.length).toBe(TestsHelper.getMatrix().length);

    });

    it("Can get true classes.", () => {
        const confusionMatrix = TestsHelper.getConfusionMatrix();
        const { Apple, Orange, Mango } = TestsHelper.getConfusionMatrixClasses();

        const appleMatrixClass = confusionMatrix.getConfusionMatrixClasses('Apple');
        const orangeMatrixClass = confusionMatrix.getConfusionMatrixClasses('Orange');
        const mangoMatrixClass = confusionMatrix.getConfusionMatrixClasses('Mango');

        expect(appleMatrixClass).toEqual(Apple);
        expect(orangeMatrixClass).toEqual(Orange);
        expect(mangoMatrixClass).toEqual(Mango);

        expect(() => confusionMatrix.getConfusionMatrixClasses(''))
            .toThrow(new Error('A valid label should be passed.'));

        expect(() => confusionMatrix.getConfusionMatrixClasses('abc'))
            .toThrow(new Error('The label does not exists in the matrix.'));

    });

    it("Can get all true classes.", () => {
        const confusionMatrix = TestsHelper.getConfusionMatrix();
        const { Apple, Orange, Mango } = TestsHelper.getConfusionMatrixClasses();

        const allMatrixClasses = confusionMatrix.getAllMatrixClasses();

        expect(allMatrixClasses[0].confusionMatrixClasses).toEqual(Apple);
        expect(allMatrixClasses[1].confusionMatrixClasses).toEqual(Orange);
        expect(allMatrixClasses[2].confusionMatrixClasses).toEqual(Mango);

    });

    it("Can validate the confusion matrix.", () => {
        let confusionMatrix = TestsHelper.getConfusionMatrix();

        //Is valid, therefore, should return the confusion matrix object.
        const returnedConfusionMatrix = confusionMatrix.validate();
        expect(returnedConfusionMatrix).toEqual(confusionMatrix);

        confusionMatrix.labels = [];
        expect(() => confusionMatrix.validate()).toThrow(new Error('The labels length should be equals to the matrix columns length.'));

        confusionMatrix = TestsHelper.getConfusionMatrix();
        confusionMatrix.matrix = [[1]];
        expect(() => confusionMatrix.validate()).toThrow(new Error('The labels length should be equals to the matrix columns length.'));

        confusionMatrix = TestsHelper.getConfusionMatrix();
        confusionMatrix.labels = ['Apple', 'OOOO', 'Apple'];
        expect(() => confusionMatrix.validate()).toThrow(new Error('The label Apple appears more than once in the labels array.'));

        confusionMatrix = TestsHelper.getConfusionMatrix();
        confusionMatrix.matrix = [[1, 2], [1, 2], [1, 2]];
        expect(() => confusionMatrix.validate()).toThrow(new Error('The confusion matrix does not have the columns/rows length.'));

    });

    it("Can get the total number of predictions", () => {
        const confusionMatrix = TestsHelper.getConfusionMatrix();
        const sum = TestsHelper.getLabelsPredictionsSum();
        expect(confusionMatrix.getNumberOfPredictions()).toBe(sum.Apple + sum.Mango + sum.Orange);

        confusionMatrix.matrix = [[1, 1, 1], [1, 1, 1], [1, 1, 1]];
        expect(confusionMatrix.getNumberOfPredictions()).toBe(9);

        confusionMatrix.matrix = TestsHelper.getConfusionMatrix().matrix;

        expect(confusionMatrix.getNumberOfPredictions('Orange')).toBe(sum.Orange);
    });


    it("Can calculate the matrix accuracy", () => {
        let confusionMatrix = TestsHelper.getConfusionMatrix();
        const configuration = {
            label: 'Apple'
        };
        const { Apple, Orange, Mango } = TestsHelper.getConfusionMatrixClasses();

        // Expected values for each label
        const expectedAppleAccuracyValue = (Apple.truePositive + Apple.trueNegative) /
            (Apple.trueNegative + Apple.truePositive + Apple.falsePositive + Apple.falseNegative);

        const expectedOrangeAccuracyValue = (Orange.truePositive + Orange.trueNegative) /
            (Orange.trueNegative + Orange.truePositive + Orange.falsePositive + Orange.falseNegative);

        const expectedMangoAccuracyValue = (Mango.truePositive + Mango.trueNegative) /
            (Mango.trueNegative + Mango.truePositive + Mango.falsePositive + Mango.falseNegative);

        // Test Apple accuracy.
        let value = confusionMatrix.accuracy(configuration);
        expect(value).toBe((expectedAppleAccuracyValue))

        // Test Orange accuracy.
        configuration.label = 'Orange';
        value = confusionMatrix.accuracy(configuration);
        expect(value).toBe((expectedOrangeAccuracyValue))

        // Test Mango accuracy.
        configuration.label = 'Mango';
        value = confusionMatrix.accuracy(configuration);
        expect(value).toBe((expectedMangoAccuracyValue));

        value = confusionMatrix.accuracy(configuration);
        expect(value).toBe((expectedMangoAccuracyValue));

        const sumMatrixClasses = TestsHelper.getSumConfusionMatrixClasses();

        // Expected micro accuracy value.
        const microAccuracyValue = (sumMatrixClasses.truePositive + sumMatrixClasses.trueNegative) /
            (sumMatrixClasses.truePositive + sumMatrixClasses.trueNegative + sumMatrixClasses.falsePositive + sumMatrixClasses.falseNegative);

        // Test matrix accuracy.
        value = confusionMatrix.accuracy({ average: AverageMethod.Micro });
        expect(value).toBe(microAccuracyValue);

        // Expected micro accuracy value.
        const macroAccuracyValue = (expectedAppleAccuracyValue + expectedOrangeAccuracyValue
            + expectedMangoAccuracyValue) / 3;

        // Test matrix accuracy.
        value = confusionMatrix.accuracy({ average: AverageMethod.Macro });
        expect(value).toBe(macroAccuracyValue);

        const predictionsLabel = TestsHelper.getLabelsPredictionsSum();

        // Expected matrix weight accuracy value.
        const expectedWeightMatrixAccuracyValue =
            ((expectedAppleAccuracyValue * predictionsLabel.Apple) +
                (expectedOrangeAccuracyValue * predictionsLabel.Orange) +
                (expectedMangoAccuracyValue * predictionsLabel.Mango)) / TestsHelper.getPredictionsSum();

        // Test matrix weighted accuracy.
        value = confusionMatrix.accuracy({ average: AverageMethod.Weighted });
        expect(value).toBe(expectedWeightMatrixAccuracyValue);

        value = confusionMatrix.accuracy();
        expect(value).toBe(expectedWeightMatrixAccuracyValue);

        // Test NAN on label accuracy
        confusionMatrix.matrix = [[0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]];
        value = confusionMatrix.accuracy();
        expect(value).toBe(0);

        // Test NAN on micro accuracy
        value = confusionMatrix.microAccuracy();
        expect(value).toBe(0);

        // Test NAN on macro accuracy
        value = confusionMatrix.macroAccuracy();
        expect(value).toBe(0);

        // Test empty matrix accuracy average
        confusionMatrix = TestsHelper.getConfusionMatrix();
        value = confusionMatrix.matrixAccuracy();
        expect(value).toBe(expectedWeightMatrixAccuracyValue);



    });

    it("Can calculate the matrix miss classification rate", () => {
        let confusionMatrix = TestsHelper.getConfusionMatrix();
        const configuration = {
            label: 'Apple'
        };
        const { Apple, Orange, Mango } = TestsHelper.getConfusionMatrixClasses();


        // Expected values for each label
        const expectedAppleMissClassificationValue = (Apple.falsePositive + Apple.falseNegative) /
            (Apple.trueNegative + Apple.truePositive + Apple.falsePositive + Apple.falseNegative);

        const expectedOrangeMissClassificationValue = (Orange.falsePositive + Orange.falseNegative) /
            (Orange.trueNegative + Orange.truePositive + Orange.falsePositive + Orange.falseNegative);

        const expectedMangoMissClassificationValue = (Mango.falsePositive + Mango.falseNegative) /
            (Mango.trueNegative + Mango.truePositive + Mango.falsePositive + Mango.falseNegative);

        // Test Apple miss classification value.
        let value = confusionMatrix.missClassificationRate(configuration);
        expect(value).toBe((expectedAppleMissClassificationValue))

        // Test Orange miss classification value.
        configuration.label = 'Orange';
        value = confusionMatrix.missClassificationRate(configuration);
        expect(value).toBe((expectedOrangeMissClassificationValue))

        // Test Mango miss classification value.
        configuration.label = 'Mango';
        value = confusionMatrix.missClassificationRate(configuration);
        expect(value).toBe((expectedMangoMissClassificationValue));

        const sumMatrixClasses = TestsHelper.getSumConfusionMatrixClasses();

        // Expected micro miss classification value.
        const microMissClassificationValue = (sumMatrixClasses.truePositive + sumMatrixClasses.trueNegative) /
            (sumMatrixClasses.truePositive + sumMatrixClasses.trueNegative + sumMatrixClasses.falsePositive + sumMatrixClasses.falseNegative);

        // Test matrix rate value.
        value = confusionMatrix.missClassificationRate({ average: AverageMethod.Micro });
        expect(value).toBe(microMissClassificationValue);

        // Expected micro rate value.
        const macroMissClassificationValue = (expectedAppleMissClassificationValue + expectedOrangeMissClassificationValue
            + expectedMangoMissClassificationValue) / 3;

        // Test matrix rate.
        value = confusionMatrix.missClassificationRate({ average: AverageMethod.Macro });
        expect(value).toBe(macroMissClassificationValue);

        const predictionsLabel = TestsHelper.getLabelsPredictionsSum();

        // Expected matrix weight rate value.
        const expectedWeightMatrixRateValue =
            ((expectedAppleMissClassificationValue * predictionsLabel.Apple) +
                (expectedOrangeMissClassificationValue * predictionsLabel.Orange) +
                (expectedMangoMissClassificationValue * predictionsLabel.Mango)) / TestsHelper.getPredictionsSum();

        // Test matrix weighted miss classification value.
        value = confusionMatrix.missClassificationRate({ average: AverageMethod.Weighted });
        expect(value).toBe(expectedWeightMatrixRateValue);

        value = confusionMatrix.missClassificationRate();
        expect(value).toBe(expectedWeightMatrixRateValue);

        // Test NAN on label miss classification value.
        confusionMatrix.matrix = [[0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]];
        value = confusionMatrix.missClassificationRate();
        expect(value).toBe(0);

        // Test NAN on micro miss classification value.
        value = confusionMatrix.microMissClassificationRate();
        expect(value).toBe(0);

        // Test NAN on macro miss classification value.
        value = confusionMatrix.macroMissClassificationRate();
        expect(value).toBe(0);

        // Test empty matrix accuracy miss classification value.
        confusionMatrix = TestsHelper.getConfusionMatrix();
        value = confusionMatrix.matrixMissClassificationRate();
        expect(value).toBe(expectedWeightMatrixRateValue);
    });

    it("Can calculate the matrix precision value.", () => {
        let confusionMatrix = TestsHelper.getConfusionMatrix();
        const configuration = {
            label: 'Apple'
        };
        const { Apple, Orange, Mango } = TestsHelper.getConfusionMatrixPrecisionAndRecall();

        // Test Apple precision.
        let value = confusionMatrix.precision(configuration);
        expect(value).toBe((Apple.precision))

        // Test Orange precision.
        configuration.label = 'Orange';
        value = confusionMatrix.precision(configuration);
        expect(value).toBe((Orange.precision))

        // Test Orange precision.
        configuration.label = 'Mango';
        value = confusionMatrix.precision(configuration);
        expect(value).toBe((Mango.precision))

        const sumMatrixClasses = TestsHelper.getSumConfusionMatrixClasses();

        // Expected micro precision value.
        const microPrecisionValue = (sumMatrixClasses.truePositive) /
            (sumMatrixClasses.truePositive + sumMatrixClasses.falsePositive);

        // Test matrix precision value.
        value = confusionMatrix.precision({ average: AverageMethod.Micro });
        expect(value).toBe(microPrecisionValue);

        // Expected micro precision value.
        const macroPrecisionValue = (Apple.precision + Orange.precision
            + Mango.precision) / 3;

        // Test matrix precision.
        value = confusionMatrix.precision({ average: AverageMethod.Macro });
        expect(value).toBe(macroPrecisionValue);

        const predictionsLabel = TestsHelper.getLabelsPredictionsSum();

        // Expected matrix weight precision value.
        const expectedWeightMatrixPrecisionValue =
            ((Apple.precision * predictionsLabel.Apple) +
                (Orange.precision * predictionsLabel.Orange) +
                (Mango.precision * predictionsLabel.Mango)) / TestsHelper.getPredictionsSum();

        // Test matrix weighted precision value.
        value = confusionMatrix.precision({ average: AverageMethod.Weighted });
        expect(value).toBe(expectedWeightMatrixPrecisionValue);

        // Should use weighted as default average value.
        value = confusionMatrix.precision();
        expect(value).toBe(expectedWeightMatrixPrecisionValue);

        // Test NAN on label precision.
        confusionMatrix.matrix = [[0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]];
        value = confusionMatrix.precision();
        expect(value).toBe(0);

        // Test NAN on micro precision.
        value = confusionMatrix.microPrecision();
        expect(value).toBe(0);

        // Test NAN on macro precision.
        value = confusionMatrix.macroPrecision();
        expect(value).toBe(0);

        // Test empty matrix precision average.
        confusionMatrix = TestsHelper.getConfusionMatrix();
        value = confusionMatrix.matrixPrecision();
        expect(value).toBe(expectedWeightMatrixPrecisionValue);
    });

    it("Can calculate the matrix recall value.", () => {
        let confusionMatrix = TestsHelper.getConfusionMatrix();
        const configuration = {
            label: 'Apple'
        };
        const { Apple, Orange, Mango } = TestsHelper.getConfusionMatrixPrecisionAndRecall();

        // Test Apple precision.
        let value = confusionMatrix.recall(configuration);
        expect(value).toBe((Apple.recall))

        // Test Orange precision.
        configuration.label = 'Orange';
        value = confusionMatrix.recall(configuration);
        expect(value).toBe((Orange.recall))

        // Test Mango precision.
        configuration.label = 'Mango';
        value = confusionMatrix.recall(configuration);
        expect(value).toBe((Mango.recall));

        const sumMatrixClasses = TestsHelper.getSumConfusionMatrixClasses();

        // Expected micro recall value.
        const microRecallValue = (sumMatrixClasses.truePositive) /
            (sumMatrixClasses.truePositive + sumMatrixClasses.falseNegative);

        // Test matrix precision value.
        value = confusionMatrix.recall({ average: AverageMethod.Micro });
        expect(value).toBe(microRecallValue);

        // Expected macro recall value.
        const macroRecallValue = (Apple.recall + Orange.recall
            + Mango.recall) / 3;

        // Test matrix recall value..
        value = confusionMatrix.recall({ average: AverageMethod.Macro });
        expect(value).toBe(macroRecallValue);

        const predictionsLabel = TestsHelper.getLabelsPredictionsSum();

        // Expected matrix weight recall value.
        const expectedWeightMatrixRecallValue =
            ((Apple.recall * predictionsLabel.Apple) +
                (Orange.recall * predictionsLabel.Orange) +
                (Mango.recall * predictionsLabel.Mango)) / TestsHelper.getPredictionsSum();

        // Test matrix weighted recall value.
        value = confusionMatrix.recall({ average: AverageMethod.Weighted });
        expect(value).toBe(expectedWeightMatrixRecallValue);

        // Should use weighted as default recall value.
        value = confusionMatrix.recall();
        expect(value).toBe(expectedWeightMatrixRecallValue);

        // Test NAN on label recall.
        confusionMatrix.matrix = [[0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]];
        value = confusionMatrix.recall();
        expect(value).toBe(0);

        // Test NAN on micro recall.
        value = confusionMatrix.microRecall();
        expect(value).toBe(0);

        // Test NAN on macro recall.
        value = confusionMatrix.macroRecall();
        expect(value).toBe(0);

        // Test empty matrix recall average.
        confusionMatrix = TestsHelper.getConfusionMatrix();
        value = confusionMatrix.matrixRecall();
        expect(value).toBe(expectedWeightMatrixRecallValue);
    });

    it("Can calculate the matrix specificity value.", () => {
        let confusionMatrix = TestsHelper.getConfusionMatrix();
        const configuration = {
            label: 'Apple'
        };
        const { Apple, Orange, Mango } = TestsHelper.getConfusionMatrixClasses();


        // Expected values for each label
        const expectedAppleSpecificityValue = (Apple.trueNegative) /
            (Apple.trueNegative + Apple.falsePositive);

        const expectedOrangeSpecificityValue = (Orange.trueNegative) /
            (Orange.trueNegative + Orange.falsePositive);

        const expectedMangoSpecificityValue = (Mango.trueNegative) /
            (Mango.trueNegative + Mango.falsePositive);

        // Test Apple specificity.
        let value = confusionMatrix.specificity(configuration);
        expect(value).toBe((expectedAppleSpecificityValue))

        // Test Orange specificity.
        configuration.label = 'Orange';
        value = confusionMatrix.specificity(configuration);
        expect(value).toBe((expectedOrangeSpecificityValue))

        // Test Mango specificity.
        configuration.label = 'Mango';
        value = confusionMatrix.specificity(configuration);
        expect(value).toBe((expectedMangoSpecificityValue));

        const sumMatrixClasses = TestsHelper.getSumConfusionMatrixClasses();

        // Expected micro precision value.
        const microSpecificityValue = (sumMatrixClasses.trueNegative) /
            (sumMatrixClasses.trueNegative + sumMatrixClasses.falsePositive);

        // Test matrix precision value.
        value = confusionMatrix.specificity({ average: AverageMethod.Micro });
        expect(value).toBe(microSpecificityValue);

        // Expected macro specificity value.
        const macroSpecificityValue = (expectedAppleSpecificityValue + expectedOrangeSpecificityValue
            + expectedMangoSpecificityValue) / 3;

        // Test matrix rate.
        value = confusionMatrix.specificity({ average: AverageMethod.Macro });
        expect(value).toBe(macroSpecificityValue);

        const predictionsLabel = TestsHelper.getLabelsPredictionsSum();

        // Expected matrix weight specificity value.
        const expectedWeightMatrixSpecificityValue =
            ((expectedAppleSpecificityValue * predictionsLabel.Apple) +
                (expectedOrangeSpecificityValue * predictionsLabel.Orange) +
                (expectedMangoSpecificityValue * predictionsLabel.Mango)) / TestsHelper.getPredictionsSum();

        // Test matrix weighted specificity value.
        value = confusionMatrix.specificity({ average: AverageMethod.Weighted });
        expect(value).toBe(expectedWeightMatrixSpecificityValue);

        // Should use weighted as default specificity value.
        value = confusionMatrix.specificity();
        expect(value).toBe(expectedWeightMatrixSpecificityValue);

        // Test NAN on label specificity.
        confusionMatrix.matrix = [[0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]];
        value = confusionMatrix.recall();
        expect(value).toBe(0);

        // Test NAN on micro specificity.
        value = confusionMatrix.microSpecificity();
        expect(value).toBe(0);

        // Test NAN on macro specificity.
        value = confusionMatrix.macroSpecificity();
        expect(value).toBe(0);

        // Test empty matrix specificity average.
        confusionMatrix = TestsHelper.getConfusionMatrix();
        value = confusionMatrix.matrixSpecificity();
        expect(value).toBe(expectedWeightMatrixSpecificityValue);
    });

    it("Can calculate the matrix F1 Score value.", () => {
        let confusionMatrix = TestsHelper.getConfusionMatrix();
        const configuration = {
            label: 'Apple'
        };
        const { Apple, Orange, Mango } = TestsHelper.getConfusionMatrixPrecisionAndRecall();

        const expectedAppleF1ScoreValue = (2 * ((Apple.precision * Apple.recall) / (Apple.precision + Apple.recall))) || 0;
        const expectedOrangeF1ScoreValue = (2 * ((Orange.precision * Orange.recall) / (Orange.precision + Orange.recall))) || 0;
        const expectedMangoF1ScoreValue = (2 * ((Mango.precision * Mango.recall) / (Mango.precision + Mango.recall))) || 0;

        // Test Apple f1 score.
        let value = confusionMatrix.f1Score(configuration);
        expect(value).toBe((expectedAppleF1ScoreValue))

        // Test Orange f1 score.
        configuration.label = 'Orange';
        value = confusionMatrix.f1Score(configuration);
        expect(value).toBe((expectedOrangeF1ScoreValue))

        // Test Mango f1 score.
        configuration.label = 'Mango';
        value = confusionMatrix.f1Score(configuration);
        expect(value).toBe((expectedMangoF1ScoreValue));

        const sumMatrixClasses = TestsHelper.getSumConfusionMatrixClasses();

        // Expected micro f1 score value.

        const microPrecision = (sumMatrixClasses.truePositive) /
            (sumMatrixClasses.truePositive + sumMatrixClasses.falsePositive);

        const microRecall = (sumMatrixClasses.truePositive) /
            (sumMatrixClasses.truePositive + sumMatrixClasses.falseNegative);

        const expectedMicroF1Score = 2 * ((microPrecision * microRecall) / (microPrecision + microRecall));

        // Test matrix F1Score value.
        value = confusionMatrix.f1Score({ average: AverageMethod.Micro });
        expect(value).toBe(expectedMicroF1Score);

        // Expected macro F1Score value.
        const macroSpecificityValue = (expectedAppleF1ScoreValue + expectedOrangeF1ScoreValue
            + expectedMangoF1ScoreValue) / 3;

        // Test matrix F1Score value.
        value = confusionMatrix.f1Score({ average: AverageMethod.Macro });
        expect(value).toBe(macroSpecificityValue);

        const predictionsLabel = TestsHelper.getLabelsPredictionsSum();

        // Expected matrix weight F1Score value.
        const expectedWeightMatrixF1ScoreValue =
            ((expectedAppleF1ScoreValue * predictionsLabel.Apple) +
                (expectedOrangeF1ScoreValue * predictionsLabel.Orange) +
                (expectedMangoF1ScoreValue * predictionsLabel.Mango)) / TestsHelper.getPredictionsSum();

        // Test matrix weighted F1Score value.
        value = confusionMatrix.f1Score({ average: AverageMethod.Weighted });
        expect(value).toBe(expectedWeightMatrixF1ScoreValue);

        // Should use weighted as default F1Score value.
        value = confusionMatrix.f1Score();
        expect(value).toBe(expectedWeightMatrixF1ScoreValue);

        // Test NAN on label F1Score.
        confusionMatrix.matrix = [[0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]];
        value = confusionMatrix.f1Score();
        expect(value).toBe(0);

        // Test NAN on micro F1Score.
        value = confusionMatrix.microF1Score();
        expect(value).toBe(0);

        // Test NAN on macro F1Score.
        value = confusionMatrix.macroF1Score();
        expect(value).toBe(0);

        // Test empty matrix F1Score average.
        confusionMatrix = TestsHelper.getConfusionMatrix();
        value = confusionMatrix.matrixF1Score();
        expect(value).toBe(expectedWeightMatrixF1ScoreValue);
    });

    it("Can transpose matrix.", () => {
        let labels = ["a", "b", "c", "d"];
        let matrix = [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
            [13, 14, 15, 16]
        ];
        let confusionMatrix = new ConfusionMatrix({ labels, matrix });
        const returnedConfusionMatrix = confusionMatrix.transpose();
        expect(confusionMatrix.matrix).toEqual([
            [1, 5, 9, 13],
            [2, 6, 10, 14],
            [3, 7, 11, 15],
            [4, 8, 12, 16]
        ]);
        expect(returnedConfusionMatrix).toEqual(confusionMatrix);
        confusionMatrix.transpose();
        expect(confusionMatrix.matrix).toEqual(matrix);
        labels = ["a"];
        matrix = [[1]];
        confusionMatrix = new ConfusionMatrix({ labels, matrix });
        confusionMatrix.transpose();
        expect(confusionMatrix.matrix).toEqual(matrix);
        expect(returnedConfusionMatrix).not.toEqual(confusionMatrix);
    });

    it("Can undo in history.", () => {
        const confusionMatrix = TestsHelper.getConfusionMatrix();
        expect(confusionMatrix.isUndoAvailable()).toBeFalsy();
        const matrix = TestsHelper.getMatrix();
        const labels = TestsHelper.getLabels();

        let matrix1 = TestsHelper.deepCopy(matrix) as Array<Array<number>>;
        matrix1[1][1] = 10000;

        confusionMatrix.setConfusionMatrix(new ConfusionMatrix({ labels, matrix: matrix1 }));
        expect(confusionMatrix.isUndoAvailable()).toBeTruthy();

        let labels1 = TestsHelper.deepCopy(labels) as Array<string>;
        labels1[1] = "History";
        confusionMatrix.setConfusionMatrix(new ConfusionMatrix({ labels: labels1, matrix: matrix1 }));

        expect(confusionMatrix?.matrix).toEqual(matrix1);
        expect(confusionMatrix?.labels).toEqual(labels1);
        expect(confusionMatrix.isUndoAvailable()).toBeTruthy();


        let undoConfusionMatrix = confusionMatrix.undo();
        expect(undoConfusionMatrix?.matrix).toEqual(matrix1);
        expect(undoConfusionMatrix?.labels).toEqual(labels);
        expect(confusionMatrix.isUndoAvailable()).toBeTruthy();

        undoConfusionMatrix = confusionMatrix.undo();
        expect(undoConfusionMatrix?.matrix).toEqual(matrix);
        expect(undoConfusionMatrix?.labels).toEqual(labels);
        expect(confusionMatrix.isUndoAvailable()).toBeFalsy();

        undoConfusionMatrix = confusionMatrix.undo();
        expect(undoConfusionMatrix).toBeUndefined();
    });

    it("Can redo in history.", () => {
        const confusionMatrix = TestsHelper.getConfusionMatrix();
        expect(confusionMatrix.isUndoAvailable()).toBeFalsy();
        const matrix = TestsHelper.getMatrix();
        const labels = TestsHelper.getLabels();

        let matrix1 = TestsHelper.deepCopy(matrix) as Array<Array<number>>;
        matrix1[1][1] = 10000;

        confusionMatrix.setConfusionMatrix(new ConfusionMatrix({ labels, matrix: matrix1 }));
        expect(confusionMatrix.isRedoAvailable()).toBeFalsy();

        let labels1 = TestsHelper.deepCopy(labels) as Array<string>;
        labels1[1] = "History";
        confusionMatrix.setConfusionMatrix(new ConfusionMatrix({ labels: labels1, matrix: matrix1 }));

        expect(confusionMatrix?.matrix).toEqual(matrix1);
        expect(confusionMatrix?.labels).toEqual(labels1);
        expect(confusionMatrix.isRedoAvailable()).toBeFalsy();

        let redoConfusionMatrix = confusionMatrix.redo();
        expect(redoConfusionMatrix).toBeUndefined();
        confusionMatrix?.undo()?.undo();
        expect(confusionMatrix.isRedoAvailable()).toBeTruthy();

        redoConfusionMatrix = confusionMatrix.redo();
        expect(confusionMatrix?.matrix).toEqual(matrix1);
        expect(confusionMatrix?.labels).toEqual(labels);
        expect(confusionMatrix.isRedoAvailable()).toBeTruthy();

        redoConfusionMatrix = confusionMatrix.redo();
        expect(confusionMatrix?.matrix).toEqual(matrix1);
        expect(confusionMatrix?.labels).toEqual(labels1);
        expect(confusionMatrix.isRedoAvailable()).toBeFalsy();

        redoConfusionMatrix = confusionMatrix.redo();
        expect(confusionMatrix.isRedoAvailable()).toBeFalsy();
    });

    it("Should preform 100 000 changes in less then 1 second", () => {
        const matrix = TestsHelper.getMatrix();
        const labels = TestsHelper.getLabels();
        const confusionMatrix = TestsHelper.getConfusionMatrix();
        let matrix1 = TestsHelper.deepCopy(matrix) as Array<Array<number>>;

        const startDate = new Date().getMilliseconds();
        for (let i = 0; i < 100000; i++) {
            matrix1[1][1] = i;
            confusionMatrix.setConfusionMatrix(new ConfusionMatrix({ labels, matrix: matrix1 }));
        }
        const endDate = new Date().getMilliseconds();
        const duration = startDate - endDate;
        expect(duration).toBeLessThan(1000);
    });

});

class TestsHelper {

    static getLabels(): Array<string> {
        return ["Apple", "Orange", "Mango"];
    }

    static getMatrix(): Array<Array<number>> {
        return [[7, 8, 10],
        [1, 2, 3],
        [3, 2, 0]];
    }

    static getConfusionMatrix(): ConfusionMatrix {
        return new ConfusionMatrix({
            labels: this.getLabels(),
            matrix: this.getMatrix()
        });
    }

    static getLabelsPredictionsSum(): { Apple: number, Orange: number, Mango: number } {
        return {
            Apple: 7 + 1 + 3,
            Orange: 8 + 2 + 2,
            Mango: 10 + 3 + 0
        }
    };

    static getPredictionsSum(): number {
        const { Apple, Orange, Mango } = this.getLabelsPredictionsSum();
        return Apple + Orange + Mango;
    }

    static getConfusionMatrixClasses = () => {
        return {
            Apple: {
                truePositive: 7,
                trueNegative: 2 + 3 + 2 + 0,
                falsePositive: 8 + 10,
                falseNegative: 1 + 3
            },
            Orange: {
                truePositive: 2,
                trueNegative: 7 + 3 + 10 + 0,
                falsePositive: 1 + 3,
                falseNegative: 8 + 2
            },
            Mango: {
                truePositive: 0,
                trueNegative: 7 + 8 + 1 + 2,
                falsePositive: 2 + 3,
                falseNegative: 10 + 3
            }
        }
    }

    static getConfusionMatrixPrecisionAndRecall() {
        const { Apple, Orange, Mango } = this.getConfusionMatrixClasses();

        const expectedApplePrecisionValue = (Apple.truePositive) /
            (Apple.truePositive + Apple.falsePositive);

        const expectedOrangePrecisionValue = (Orange.truePositive) /
            (Orange.truePositive + Orange.falsePositive);

        const expectedMangoPrecisionValue = (Mango.truePositive) /
            (Mango.truePositive + Mango.falsePositive);

        const expectedAppleRecallValue = (Apple.truePositive) /
            (Apple.truePositive + Apple.falseNegative);

        const expectedOrangeRecallValue = (Orange.truePositive) /
            (Orange.truePositive + Orange.falseNegative);

        const expectedMangoRecallValue = (Mango.truePositive) /
            (Mango.truePositive + Mango.falseNegative);


        return {
            Apple: {
                precision: expectedApplePrecisionValue || 0,
                recall: expectedAppleRecallValue || 0
            },
            Orange: {
                precision: expectedOrangePrecisionValue || 0,
                recall: expectedOrangeRecallValue || 0
            },
            Mango: {
                precision: expectedMangoPrecisionValue || 0,
                recall: expectedMangoRecallValue || 0
            }
        }
    }

    static getSumConfusionMatrixClasses(): ConfusionMatrixClasses {
        const { Apple, Orange, Mango } = this.getConfusionMatrixClasses();
        return {
            truePositive: Apple.truePositive + Orange.truePositive + Mango.truePositive,
            trueNegative: Apple.trueNegative + Orange.trueNegative + Mango.trueNegative,
            falsePositive: Apple.falsePositive + Orange.falsePositive + Mango.falsePositive,
            falseNegative: Apple.falseNegative + Orange.falseNegative + Mango.falseNegative
        }
    }

    static deepCopy(object: any): any {
        return JSON.parse(JSON.stringify(object));
    }
}