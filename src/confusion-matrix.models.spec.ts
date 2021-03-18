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
        confusionMatrix.setConfusionMatrix(anotherConfusionMatrix);
        expect(confusionMatrix.labels).toEqual(labels);
        expect(confusionMatrix.matrix).toEqual(matrix);
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
        confusionMatrix.normalize(0, 1);
        expect(confusionMatrix.matrix).toEqual([[0.7, 0.8, 1],
        [0.1, 0.2, 0.3],
        [0.3, 0.2, 0]]
        );

        confusionMatrix = TestsHelper.getConfusionMatrix();
        confusionMatrix.normalize(1, 2);
        expect(confusionMatrix.matrix).toEqual([[1.7, 1.8, 2],
        [1.1, 1.2, 1.3],
        [1.3, 1.2, 1]]
        );

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
        confusionMatrix.revertAllNormalizations();
        expect(confusionMatrix.matrix).toEqual(TestsHelper.getConfusionMatrix().matrix);
        confusionMatrix.normalize(0, 1);
        confusionMatrix.normalize(1, 2);
        confusionMatrix.normalize(3, 4);
        confusionMatrix.normalize(-1, 6);
        confusionMatrix.revertAllNormalizations();
        expect(confusionMatrix.matrix).toEqual(TestsHelper.getConfusionMatrix().matrix);

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
        const confusionMatrix = TestsHelper.getConfusionMatrix();
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
    });

    it("Can calculate the matrix miss classification rate", () => {
        const confusionMatrix = TestsHelper.getConfusionMatrix();
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
    });

    it("Can calculate the matrix precision value.", () => {
        const confusionMatrix = TestsHelper.getConfusionMatrix();
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

        // Expected micro rate value.
        const macroPrecisionValue = (Apple.precision + Orange.precision
            + Mango.precision) / 3;

        // Test matrix rate.
        value = confusionMatrix.precision({ average: AverageMethod.Macro });
        expect(value).toBe(macroPrecisionValue);

        const predictionsLabel = TestsHelper.getLabelsPredictionsSum();

        // Expected matrix weight rate value.
        const expectedWeightMatrixRateValue =
            ((Apple.precision * predictionsLabel.Apple) +
                (Orange.precision * predictionsLabel.Orange) +
                (Mango.precision * predictionsLabel.Mango)) / TestsHelper.getPredictionsSum();

        // Test matrix weighted precision value.
        value = confusionMatrix.precision({ average: AverageMethod.Weighted });
        expect(value).toBe(expectedWeightMatrixRateValue);

        // Should use weighted as default average value.
        value = confusionMatrix.precision();
        expect(value).toBe(expectedWeightMatrixRateValue);
    });

    it("Can calculate the matrix recall value.", () => {
        const confusionMatrix = TestsHelper.getConfusionMatrix();
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
    });

    it("Can calculate the matrix specificity value.", () => {
        const confusionMatrix = TestsHelper.getConfusionMatrix();
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
        const expectedWeightMatrixRateValue =
            ((expectedAppleSpecificityValue * predictionsLabel.Apple) +
                (expectedOrangeSpecificityValue * predictionsLabel.Orange) +
                (expectedMangoSpecificityValue * predictionsLabel.Mango)) / TestsHelper.getPredictionsSum();

        // Test matrix weighted specificity value.
        value = confusionMatrix.specificity({ average: AverageMethod.Weighted });
        expect(value).toBe(expectedWeightMatrixRateValue);

        // Should use weighted as default specificity value.
        value = confusionMatrix.specificity();
        expect(value).toBe(expectedWeightMatrixRateValue);
    });

    it("Can calculate the matrix F1 Score value.", () => {
        const confusionMatrix = TestsHelper.getConfusionMatrix();
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

        // Expected matrix weight specificity value.
        const expectedWeightMatrixF1ScoreValue =
            ((expectedAppleF1ScoreValue * predictionsLabel.Apple) +
                (expectedOrangeF1ScoreValue * predictionsLabel.Orange) +
                (expectedMangoF1ScoreValue * predictionsLabel.Mango)) / TestsHelper.getPredictionsSum();

        // Test matrix weighted specificity value.
        value = confusionMatrix.f1Score({ average: AverageMethod.Weighted });
        expect(value).toBe(expectedWeightMatrixF1ScoreValue);

        // Should use weighted as default specificity value.
        value = confusionMatrix.f1Score();
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
        confusionMatrix.transpose();
        expect(confusionMatrix.matrix).toEqual([
            [1, 5, 9, 13],
            [2, 6, 10, 14],
            [3, 7, 11, 15],
            [4, 8, 12, 16]
        ]);
        confusionMatrix.transpose();
        expect(confusionMatrix.matrix).toEqual(matrix);
        labels = ["a"];
        matrix = [[1]];
        confusionMatrix = new ConfusionMatrix({ labels, matrix });
        confusionMatrix.transpose();
        expect(confusionMatrix.matrix).toEqual(matrix);
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
}