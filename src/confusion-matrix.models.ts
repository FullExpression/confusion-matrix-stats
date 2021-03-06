import { PackageData } from "./package-data";

/**
 * Confusion matrix model which summarizes the prediction results on a classification problem.
 * 
 * The number of correct/incorrect predictions are summarized with count values and grouped by each class.
 * 
 * The matrix columns represents the true classes and the columns the predicted classes.
 *
 * @note Consult [wikipedia](https://en.wikipedia.org/wiki/Confusion_matrix) and [Joydwip Mohajon, 2020](https://towardsdatascience.com/confusion-matrix-for-your-multi-class-machine-learning-model-ff9aa3bf7826)
 * for more information regarding terminology, formulas and other theoretical concepts.
 *
 */
export class ConfusionMatrix {

    /** Sets confusion matrix labels */
    set labels(labels: Array<string>) {
        this._labels = labels;
        this.addToHistory();
    }

    /** Gets confusion matrix labels */
    get labels(): Array<string> {
        return this._labels;
    }

    /**
     * Sets confusion matrix values.
     *
     * The columns represents the true classes and the columns the predicted classes.
     */
    set matrix(matrix: Array<Array<number>>) {
        this.addToHistory();
        this._matrix = matrix;
    }

    get matrix(): Array<Array<number>> {
        return this._matrix;
    }

    /** Local confusion matrix labels */
    private _labels = new Array<string>();

    /**
    * Local confusion matrix values.
    *
    * The columns represents the true classes and the columns the predicted classes.
    */
    private _matrix = new Array<Array<number>>();

    /** Normalization history values. */
    private normalizations = new Array<ConfusionMatrix>();

    /** Changes history array. */
    private history = new Array<ConfusionMatrix>();

    /** Changes history pointer (current version used). */
    private historyPointer = -1;

    private lastHistoryEvent: 'undo' | 'redo' | null = null;

    /**
     * Creates new instance of confusion matrix.
     * 
     * @example
     * <pre><code>
     * const confusionMatrix = new ConfusionMatrix({
     *   labels: ["Happiness", "Sadness"],
     *   matrix:
     *       [[1,2],
     *       [3,4]]
     *   });
     * </code><pre> 
     * @param confusionMatrix Confusion matrix values. he columns represents the true classes and the columns the predicted classes
     * @param disableValidation All validations perform on creating a new Confusion Matrix instance will be disable.
     * IMPORTANT: This will not disable validations at all times. If a function that run the validations is execute, errors could
     * be throw due an invalid confusion matrix.
     */
    constructor(confusionMatrix?: { labels: Array<string>, matrix: Array<Array<number>> }, disableValidation?: boolean) {
        if (confusionMatrix) {
            this._labels = this.deepCopy(confusionMatrix.labels);
            this._matrix = this.deepCopy(confusionMatrix.matrix);
            this.addToHistory();
        }
        if (!disableValidation) {
            this.validate();
        }
    }

    /**
     * Sets the confusion matrix value based on another confusion matrix.
     * @note The history from the arg confusion matrix will not override the current history.
     * This action will be consider a normal confusion matrix edition and will be added as such to history.
     * @param confusionMatrix The confusion matrix.
     * @param saveInHistory Saves this change in confusion matrix history.
     * @return The Confusion Matrix after changes (this).
     */
    setConfusionMatrix(confusionMatrix: ConfusionMatrix, saveInHistory = true): ConfusionMatrix {
        if (confusionMatrix) {
            this._labels = this.deepCopy<Array<string>>(confusionMatrix._labels);
            this._matrix = this.deepCopy<Array<Array<number>>>(confusionMatrix._matrix);
            if (saveInHistory) {
                this.addToHistory();
            }
        }
        this.validate();
        return this;
    }

    /**
     * Normalizes all values of the matrix between two given values.
     * 
     * All normalizations will be saved in history and it is possible to revert last normalizations 
     * by calling the function @see {@link ConfusionMatrix.revertNormalization}.
     * 
     * @note Can be special util if you want to convert the values to percentage or between [0, 1].
     * 
     * @param min Minimum value of the normalized range values [min, max].
     * @param max Maximum value of the normalized range values [min, max].
     * @param fractionDigits ??? Number of digits after the decimal point. Must be in the range 0 - 20, inclusive.
     * @return The Confusion Matrix after changes (this).
     */
    normalize(min: number = 0, max: number = 1, fractionDigits?: FractionDigits): ConfusionMatrix {
        if (min >= max) {
            throw new Error('Min value cannot be equal or greater than max value.');
        }

        this.validate();
        const matrixMinMax = this.getMinAndMax();
        if (matrixMinMax) {
            this.addToHistory()
            this.normalizations.push(new ConfusionMatrix(this));
            const minX = matrixMinMax.min;
            const maxX = matrixMinMax.max;
            for (let i = 0; i < this._matrix.length; i++) {
                for (let j = 0; j < this._matrix[i].length; j++) {
                    const x = this._matrix[i][j];
                    this._matrix[i][j] = ((max - min) * ((x - minX) / (maxX - minX))) + min;
                    if (fractionDigits != undefined) {
                        this._matrix[i][j] = +this._matrix[i][j].toFixed(fractionDigits);
                    }
                }
            }

        }
        return this;
    }

    /**
     * Accuracy gives the fraction of total predictions which were correctly classified.
     *
     * Formula:
     *
     * accuracy = (TP + TN) / (TP + TN + FP + FN)
     *
     * @param configuration Set of configurations used on accuracy calculations.
     *
     * [[configuration.label]] : The label name which will be used to calculate the accuracy value.
     * If undefined or null, the accuracy value will be calculated for all confusion matrix.
     *
     * [[configuration.average]]: Defines which type of average should be used. This average will only be taken in account.
     * on matrix calculations (when label = null || undefined).
     *
     * [[configuration.average.Micro]]: Calculates the TP, TN, FP and FN for the matrix globally and then applies the
     * accuracy formula.
     *
     * [[configuration.average.Macro]]: Calculates and sums the accuracy for each individual label and divides for
     * the number of labels.
     *
     * [[configuration.average.Weighted]]: Defines if the accuracy calculations should be weighted. This means the labels
     * with more predictions will weight more in the final accuracy value comparing with labels with less.
     * predictions.
     *
     * @return The accuracy value.
     */
    accuracy(configuration: {
        label?: string,
        average?: AverageMethod
    } = { average: AverageMethod.Weighted }): number {
        this.validate();
        if (configuration.label && configuration.label.length > 0) {
            return this.labelAccuracy(configuration.label);
        }
        return this.matrixAccuracy(configuration.average);

    }

    /**
     * Gives the accuracy value for a given matrix label.
     * 
     * Accuracy gives the fraction of total predictions which were correctly classified.
     * 
     * Formula:
     *
     * accuracy = (TP + TN) / (TP + TN + FP + FN)
     * 
     * @param label The label used to get the accuracy value.
     * @return Accuracy value for a given label.
     */
    labelAccuracy(label: string): number {
        this.validate();
        const { truePositive, trueNegative, falsePositive, falseNegative } = this.getConfusionMatrixClasses(label);
        const result = (truePositive + trueNegative) / (truePositive + trueNegative + falsePositive + falseNegative);
        return result || 0;
    }

    /**
     * Gives the accuracy value for all confusion matrix, taking in account a given 
     * average method of calculation.
     * 
     * Accuracy gives the fraction of total predictions which were correctly classified.
     * 
     * @param average Defines which type of average should be used. This average will only be taken in account.
     * on matrix calculations (when label = null || undefined).
     *
     * [[average.Micro]]: Calculates the TP, TN, FP and FN for the matrix globally and then applies the
     * accuracy formula.
     *
     * [[average.Macro]]: Calculates and sums the accuracy for each individual label and divides for
     * the number of labels.
     *
     * [[average.Weighted]]: Defines if the accuracy calculations should be weighted. This means the labels
     * with more predictions will weight more in the final accuracy value comparing with labels with less.
     * predictions.
     * 
     * @return The accuracy value.
     */
    matrixAccuracy(average = AverageMethod.Weighted): number {
        this.validate();
        switch (average) {
            case AverageMethod.Micro: return this.microAccuracy();
            case AverageMethod.Macro: return this.macroAccuracy();
            case AverageMethod.Weighted: return this.weightedAccuracy();
        }
    }

    /**
    * Gives the accuracy value for all confusion matrix, taking in account the micro average method.
    * 
    * Accuracy gives the fraction of total predictions which were correctly classified.
    * 
    * The micro average method calculates and sums the accuracy for each individual label and divides for
    * the number of labels.
    *
    * @return The micro accuracy value.
    */
    microAccuracy(): number {
        const { truePositive, trueNegative, falsePositive, falseNegative } = this.getSumConfusionMatrixClasses();
        const result = (truePositive + trueNegative) / (truePositive + trueNegative + falsePositive + falseNegative);
        return result || 0;
    }

    /**
    * Gives the accuracy value for all confusion matrix, taking in account the macro average method.
    *
    * Accuracy gives the fraction of total predictions which were correctly classified.
    *
    * The macro average method calculates and sums the accuracy for each individual label and divides for
    * the number of labels.
    *
    * @return The macro accuracy value.
    */
    macroAccuracy(): number {
        let sum = 0;
        this._labels.forEach((label) => sum += this.labelAccuracy(label));
        const result = sum / this._labels.length;
        return result || 0;
    }

    /**
    * Gives the accuracy value for all confusion matrix, taking in account the average weighted method.
    *
    * Accuracy gives the fraction of total predictions which were correctly classified.
    *
    * The weighted average method gives the labels with more predictions more importance (weight)
    * in the final accuracy value comparing with labels with less predictions.
    *
    * @return The weighted accuracy value.
    */
    weightedAccuracy(): number {
        const sumLabels = this.getLabelsPredictionsSum();
        const numberOfPredictions = this.getNumberOfPredictions();
        let sum = 0;
        this._labels.forEach((label, index) => sum += (this.labelAccuracy(label) * sumLabels[index]));
        const result = sum / numberOfPredictions;
        return result || 0;
    }

    /**
     * Misclassification rate, also know as classification error and 1-Accuracy, 
     * calculates the faction of predictions were incorrect.
     *
     * Formula:
     *
     * accuracy = (FP + FN) / (TP + TN + FP + FN)
     *
     * @param configuration Set of configurations used on miss classification rate calculations.
     *
     * [[configuration.label]] : The label name which will be used to calculate the miss classification rate.
     * If undefined or null, the value will be calculated for all confusion matrix.
     *
     * [[configuration.average]]: Defines which type of average should be used. This average will only be taken in account.
     * on matrix calculations (when label = null || undefined).
     *
     * [[configuration.average.Micro]]: Calculates the TP, TN, FP and FN for the matrix globally and then applies the
     * miss classification formula.
     *
     * [[configuration.average.Macro]]: Calculates and sums the miss classification rate for each individual label and divides for
     * the number of labels.
     *
     * [[configuration.average.Weighted]]: Defines if the miss classification calculations should be weighted. This means the labels
     * with more predictions will weight more in the final rate value comparing with labels with less predictions.
     *
     * @return The miss classification rate value.
     */
    missClassificationRate(configuration: {
        label?: string,
        average?: AverageMethod
    } = { average: AverageMethod.Weighted }): number {
        this.validate();
        if (configuration?.label && configuration?.label.length > 0) {
            return this.labelMissClassificationRate(configuration.label);
        }
        return this.matrixMissClassificationRate(configuration?.average);
    }

    /**
     * Gives the miss classification rate for a given matrix label.
     * 
     * Misclassification rate, also know as classification error and 1-Accuracy,
     * calculates the faction of predictions were incorrect.
     * 
     * Formula:
     *
     * missClassification = (FP + FN) / (TP + TN + FP + FN)
     *
     * @param label The label used to get the miss classification rate value.
     * @return Miss classification rate for a given label.
     */
    labelMissClassificationRate(label: string): number {
        this.validate();
        const { truePositive, trueNegative, falsePositive, falseNegative } = this.getConfusionMatrixClasses(label);
        const result = (falsePositive + falseNegative) / (truePositive + trueNegative + falsePositive + falseNegative);
        return result || 0;
    }

    /**
     * Gives the miss classification rate value for all confusion matrix, 
     * taking in account a given average method of calculation.
     * 
     * Misclassification rate, also know as classification error and 1-Accuracy,
     * calculates the faction of predictions were incorrect.
     * 
     * @param average Defines which type of average should be used. This average will only be taken in account.
     * on matrix calculations (when label = null || undefined).
     *
     * [[average.Micro]]: Calculates the TP, TN, FP and FN for the matrix globally and then applies the
     * miss classification formula.
     *
     * [[average.Macro]]: Calculates and sums the miss classification for each individual label and divides for
     * the number of labels.
     *
     * [[average.Weighted]]: Defines if the miss classification calculations should be weighted. This means the labels
     * with more predictions will weight more in the final miss classification value comparing with labels with less.
     * predictions.
     *
     * @return The miss classification value.
     */
    matrixMissClassificationRate(average = AverageMethod.Weighted): number {
        this.validate();
        switch (average) {
            case AverageMethod.Micro: return this.microMissClassificationRate();
            case AverageMethod.Macro: return this.macroMissClassificationRate();
            case AverageMethod.Weighted: return this.weightedMissClassificationRate();
        }
    }

    /**
    * Gives the miss classification value for all confusion matrix, taking in account the micro average method.
    * 
    * Misclassification rate, also know as classification error and 1-Accuracy,
    * calculates the faction of predictions were incorrect.
    *
    * The micro average method calculates and sums the miss classification for each individual label and divides for
    * the number of labels.
    *
    * @return The micro miss classification value.
    */
    microMissClassificationRate(): number {
        const { truePositive, trueNegative, falsePositive, falseNegative } = this.getSumConfusionMatrixClasses();
        const result = (falsePositive + falseNegative) / (truePositive + trueNegative + falsePositive + falseNegative);
        return result || 0;
    }

    /**
    * Gives the miss classification value for all confusion matrix, taking in account the macro average method.
    *
    * Misclassification rate, also know as classification error and 1-Accuracy,
    * calculates the faction of predictions were incorrect.
    *
    * The macro average method calculates and sums the miss classification for each individual label and divides for
    * the number of labels.
    *
    * @return The macro miss classification value.
    */
    macroMissClassificationRate(): number {
        let sum = 0;
        this._labels.forEach((label) => sum += this.labelMissClassificationRate(label));
        const result = sum / this._labels.length;
        return result || 0;
    }

    /**
    * Gives the miss classification value for all confusion matrix, taking in account the average weighted method.
    *
    * Misclassification rate, also know as classification error and 1-Accuracy,
    * calculates the faction of predictions were incorrect.
    *
    * The weighted average method gives the labels with more predictions more importance (weight)
    * in the final miss classification value comparing with labels with less predictions.
    *
    * @return The weighted miss classification value.
    */
    weightedMissClassificationRate(): number {
        const sumLabels = this.getLabelsPredictionsSum();
        const numberOfPredictions = this.getNumberOfPredictions();
        let sum = 0;
        this._labels.forEach((label, index) => sum += (this.labelMissClassificationRate(label) * sumLabels[index]));
        const result = sum / numberOfPredictions;
        return result || 0;
    }

    /**
     * Precision, gives what fraction of predictions as a positive class were actual positive.
     *
     * Formula:
     *
     * precision = (TP) / (TP + FP)
     *
     * @param configuration Set of configurations used on precision calculations.
     *
     * [[configuration.label]] : The label name which will be used to calculate the precision value.
     * If undefined or null, the value will be calculated for all confusion matrix.
     *
     * [[configuration.average]]: Defines which type of average should be used. This average will only be taken in account.
     * on matrix calculations (when label = null || undefined).
     *
     * [[configuration.average.Micro]]: Calculates the TP, TN, FP and FN for the matrix globally and then applies the
     * precision formula.
     *
     * [[configuration.average.Macro]]: Calculates and sums the miss classification rate for each individual label and divides for
     * the number of labels.
     *
     * [[configuration.average.Weighted]]: Defines if the precision calculations should be weighted. This means the labels
     * with more predictions will weight more in the final value comparing with labels with less predictions.
     *
     * @return The precision value.
     */
    precision(configuration: {
        label?: string,
        average?: AverageMethod
    } = { average: AverageMethod.Weighted }): number {
        this.validate();
        if (configuration?.label && configuration?.label.length > 0) {
            return this.labelPrecision(configuration.label);
        }
        return this.matrixPrecision(configuration?.average);
    }

    /**
     * Gives the precision value for a given matrix label.
     * 
     * Precision, stands for what fraction of predictions as a positive class were actual positive.
     * 
     * Formula:
     *
     * precision = (TP) / (TP + FP)
     *
     * @param label The label used to get the precision value.
     * @return Precision value for a given label.
     */
    labelPrecision(label: string): number {
        this.validate();
        const { truePositive, falsePositive } = this.getConfusionMatrixClasses(label);
        const result = ((truePositive) / (truePositive + falsePositive));
        return result || 0;
    }

    /**
     * Gives the precision value for all confusion matrix,
     * taking in account a given average method of calculation.
     *
     * Precision, stands for what fraction of predictions as a positive class were actual positive.
     *
     * @param average Defines which type of average should be used. This average will only be taken in account.
     * on matrix calculations (when label = null || undefined).
     *
     * [[average.Micro]]: Calculates the TP, TN, FP and FN for the matrix globally and then applies the
     * precision formula.
     *
     * [[average.Macro]]: Calculates and sums the precision for each individual label and divides for
     * the number of labels.
     *
     * [[average.Weighted]]: Defines if the precision calculations should be weighted. This means the labels
     * with more predictions will weight more in the final precision value comparing with labels with less.
     * predictions.
     *
     * @return The precision value.
     */
    matrixPrecision(average = AverageMethod.Weighted): number {
        this.validate();
        switch (average) {
            case AverageMethod.Micro: return this.microPrecision();
            case AverageMethod.Macro: return this.macroPrecision();
            case AverageMethod.Weighted: return this.weightedPrecision();
        }
    }

    /**
    * Gives the precision value for all confusion matrix, taking in account the micro average method.
    *
    * Precision, gives what fraction of predictions as a positive class were actual positive.
    * 
    * The micro average method calculates and sums the precision for each individual label and divides for
    * the number of labels.
    *
    * @return The micro precision value.
    */
    microPrecision(): number {
        const { truePositive, falsePositive } = this.getSumConfusionMatrixClasses();
        const result = ((truePositive) / (truePositive + falsePositive));
        return result || 0;
    }

    /**
    * Gives the precision value for all confusion matrix, taking in account the macro average method.
    *
    * Precision, gives what fraction of predictions as a positive class were actual positive.
    *
    * The macro average method calculates and sums the precision for each individual label and divides for
    * the number of labels.
    *
    * @return The macro precision value.
    */
    macroPrecision(): number {
        let sum = 0;
        this._labels.forEach((label) => sum += this.labelPrecision(label));
        const result = sum / this._labels.length;
        return result || 0;
    }

    /**
    * Gives the precision value for all confusion matrix, taking in account the average weighted method.
    *
    * Precision, gives what fraction of predictions as a positive class were actual positive.
    *
    * The weighted average method gives the labels with more predictions more importance (weight)
    * in the final precision value comparing with labels with less predictions.
    *
    * @return The weighted precision value.
    */
    weightedPrecision(): number {
        const sumLabels = this.getLabelsPredictionsSum();
        const numberOfPredictions = this.getNumberOfPredictions();

        let sum = 0;
        this._labels.forEach((label, index) => sum += (this.labelPrecision(label) * sumLabels[index]));
        const result = sum / numberOfPredictions;
        return result || 0;
    }

    /**
     * Recall, also know as true positive rate, sensitivity, hit rate and probability of detection,
     * gives what fraction of all positives classes correctly predicted as positive.
     *
     * Formula:
     *
     * recall = TP / (TP + FN)
     *
     * @param configuration Set of configurations used on recall calculations.
     *
     * [[configuration.label]] : The label name which will be used to calculate the recall value.
     * If undefined or null, the value will be calculated for all confusion matrix.
     *
     * [[configuration.average]]: Defines which type of average should be used. This average will only be taken in account.
     * on matrix calculations (when label = null || undefined).
     *
     * [[configuration.average.Micro]]: Calculates the TP, TN, FP and FN for the matrix globally and then applies the
     * recall formula.
     *
     * [[configuration.average.Macro]]: Calculates and sums the miss classification rate for each individual label and divides for
     * the number of labels.
     *
     * [[configuration.average.Weighted]]: Defines if the recall calculations should be weighted. This means the labels
     * with more predictions will weight more in the final value comparing with labels with less predictions.
     *
     * @return The recall value.
     */
    recall(configuration: {
        label?: string,
        average?: AverageMethod
    } = { average: AverageMethod.Weighted }): number {
        this.validate();
        if (configuration?.label && configuration?.label.length > 0) {
            return this.labelRecall(configuration.label);
        }
        return this.matrixRecall(configuration?.average);
    }

    /**
     * Gives the recall value for a given matrix label.
     *
     * Recall, also know as true positive rate, sensitivity, hit rate and probability of detection,
     * gives what fraction of all positives classes correctly predicted as positive.
     *
     * Formula:
     *
     * recall = TP / (TP + FN)
     *
     * @param label The label used to get the recall value.
     * @return Recall value for a given label.
     */
    labelRecall(label: string): number {
        this.validate();
        const { truePositive, falseNegative } = this.getConfusionMatrixClasses(label);
        const result = ((truePositive) / (truePositive + falseNegative));
        return result || 0;
    }

    /**
     * Gives the recall value for all confusion matrix,
     * taking in account a given average method of calculation.
     *
     * Recall, also know as true positive rate, sensitivity, hit rate and probability of detection,
     * gives what fraction of all positives classes correctly predicted as positive.
     *
     * @param average Defines which type of average should be used. This average will only be taken in account.
     * on matrix calculations (when label = null || undefined).
     *
     * [[average.Micro]]: Calculates the TP, TN, FP and FN for the matrix globally and then applies the
     * recall formula.
     *
     * [[average.Macro]]: Calculates and sums the recall for each individual label and divides for
     * the number of labels.
     *
     * [[average.Weighted]]: Defines if the recall calculations should be weighted. This means the labels
     * with more predictions will weight more in the final recall value comparing with labels with less.
     * predictions.
     *
     * @return The recall value.
     */
    matrixRecall(average = AverageMethod.Weighted): number {
        this.validate();
        switch (average) {
            case AverageMethod.Micro: return this.microRecall();
            case AverageMethod.Macro: return this.macroRecall();
            case AverageMethod.Weighted: return this.weightedRecall();
        }
    }

    /**
    * Gives the recall value for all confusion matrix, taking in account the micro average method.
    *
    * Recall, also know as true positive rate, sensitivity, hit rate and probability of detection,
    * gives what fraction of all positives classes correctly predicted as positive.
    * 
    * The micro average method calculates and sums the recall for each individual label and divides for
    * the number of labels.
    *
    * @return The micro recall value.
    */
    microRecall(): number {
        const { truePositive, falseNegative } = this.getSumConfusionMatrixClasses();
        const result = (truePositive) / (truePositive + falseNegative);
        return result || 0;
    }

    /**
    * Gives the recall value for all confusion matrix, taking in account the macro average method.
    *
    * Recall, also know as true positive rate, sensitivity, hit rate and probability of detection,
    * gives what fraction of all positives classes correctly predicted as positive.
    *
    * The macro average method calculates and sums the recall for each individual label and divides for
    * the number of labels.
    *
    * @return The macro recall value.
    */
    macroRecall(): number {
        let sum = 0;
        this._labels.forEach((label) => sum += this.labelRecall(label));
        const result = sum / this._labels.length;
        return result || 0;
    }

    /**
    * Gives the recall value for all confusion matrix, taking in account the average weighted method.
    *
    * Recall, also know as true positive rate, sensitivity, hit rate and probability of detection,
    * gives what fraction of all positives classes correctly predicted as positive.
    *
    * The weighted average method gives the labels with more predictions more importance (weight)
    * in the final recall value comparing with labels with less predictions.
    *
    * @return The weighted recall value.
    */
    weightedRecall(): number {
        const sumLabels = this.getLabelsPredictionsSum();
        const numberOfPredictions = this.getNumberOfPredictions();

        let sum = 0;
        this._labels.forEach((label, index) => sum += (this.labelRecall(label) * sumLabels[index]));
        const result = sum / numberOfPredictions;
        return result || 0;
    }

    /**
     * Specificity also know as selectivity or true negative rate,
     * gives what fraction of all negatives samples are correctly as negative.
     *
     * Formula:
     *
     * specificity = TP / (TN + FN)
     *
     * @param configuration Set of configurations used on specificity calculations.
     *
     * [[configuration.label]] : The label name which will be used to calculate the specificity value.
     * If undefined or null, the value will be calculated for all confusion matrix.
     *
     * [[configuration.average]]: Defines which type of average should be used. This average will only be taken in account.
     * on matrix calculations (when label = null || undefined).
     *
     * [[configuration.average.Micro]]: Calculates the TP, TN, FP and FN for the matrix globally and then applies the
     * specificity formula.
     *
     * [[configuration.average.Macro]]: Calculates and sums the miss classification rate for each individual label and divides for
     * the number of labels.
     *
     * [[configuration.average.Weighted]]: Defines if the specificity calculations should be weighted. This means the labels
     * with more predictions will weight more in the final value comparing with labels with less predictions.
     *
     * @return The specificity value.
     */
    specificity(configuration: {
        label?: string,
        average?: AverageMethod
    } = { average: AverageMethod.Weighted }): number {
        this.validate();
        if (configuration?.label && configuration?.label.length > 0) {
            return this.labelSpecificity(configuration.label);
        }
        return this.matrixSpecificity(configuration?.average);
    }

    /**
     * Gives the specificity value for all confusion matrix,
     * taking in account a given average method of calculation.
     *
     * Specificity also know as selectivity or true negative rate,
     * gives what fraction of all negatives samples are correctly as negative.
     *
     * @param average Defines which type of average should be used. This average will only be taken in account.
     * on matrix calculations (when label = null || undefined).
     *
     * [[average.Micro]]: Calculates the TP, TN, FP and FN for the matrix globally and then applies the
     * specificity formula.
     *
     * [[average.Macro]]: Calculates and sums the specificity for each individual label and divides for
     * the number of labels.
     *
     * [[average.Weighted]]: Defines if the specificity calculations should be weighted. This means the labels
     * with more predictions will weight more in the final specificity value comparing with labels with less.
     * predictions.
     *
     * @return The specificity value.
     */
    matrixSpecificity(average = AverageMethod.Weighted): number {
        this.validate();
        switch (average) {
            case AverageMethod.Micro: return this.microSpecificity();
            case AverageMethod.Macro: return this.macroSpecificity();
            case AverageMethod.Weighted: return this.weightedSpecificity();
        }
    }

    /**
    * Gives the specificity value for all confusion matrix, taking in account the micro average method.
    *
    * Specificity also know as selectivity or true negative rate,
    * gives what fraction of all negatives samples are correctly as negative.
    * 
    * The micro average method calculates and sums the specificity for each individual label and divides for
    * the number of labels.
    *
    * @return The micro specificity value.
    */
    microSpecificity(): number {
        const { trueNegative, falsePositive } = this.getSumConfusionMatrixClasses();
        const result = (trueNegative) / (trueNegative + falsePositive);
        return result || 0;
    }

    /**
    * Gives the specificity value for all confusion matrix, taking in account the macro average method.
    *
    * Specificity also know as selectivity or true negative rate,
    * gives what fraction of all negatives samples are correctly as negative.
    *
    * The macro average method calculates and sums the specificity for each individual label and divides for
    * the number of labels.
    *
    * @return The macro specificity value.
    */
    macroSpecificity(): number {
        let sum = 0;
        this._labels.forEach((label) => sum += this.labelSpecificity(label));
        const result = sum / this._labels.length;
        return result || 0;
    }

    /**
    * Gives the specificity value for all confusion matrix, taking in account the average weighted method.
    *
    * Specificity also know as selectivity or true negative rate,
    * gives what fraction of all negatives samples are correctly as negative.
    *
    * The weighted average method gives the labels with more predictions more importance (weight)
    * in the final specificity value comparing with labels with less predictions.
    *
    * @return The weighted specificity value.
    */
    weightedSpecificity(): number {
        const sumLabels = this.getLabelsPredictionsSum();
        const numberOfPredictions = this.getNumberOfPredictions();

        let sum = 0;
        this._labels.forEach((label, index) => sum += (this.labelSpecificity(label) * sumLabels[index]));
        const result = sum / numberOfPredictions;
        return result || 0;
    }

    /**
     * Gives the specificity value for a given matrix label.
     *
     * Specificity also know as selectivity or true negative rate,
     * gives what fraction of all negatives samples are correctly as negative.
     *
     * Formula:
     *
     * specificity = TP / (TN + FN)
     *
     * @param label The label used to get the specificity value.
     * @return Specificity value for a given label.
     */
    labelSpecificity(label: string): number {
        this.validate();
        const { trueNegative, falsePositive } = this.getConfusionMatrixClasses(label);
        const result = (trueNegative) / (trueNegative + falsePositive);
        return result || 0;
    }

    /**
     * F1 Score is the harmonic mean of precision and recall. 
     *
     * Formula:
     *
     * f1Score = TP / (TN + FN)
     *
     * @param configuration Set of configurations used on F1 Score calculations.
     *
     * [[configuration.label]] : The label name which will be used to calculate the F1 Score value.
     * If undefined or null, the value will be calculated for all confusion matrix.
     *
     * [[configuration.average]]: Defines which type of average should be used. This average will only be taken in account.
     * on matrix calculations (when label = null || undefined).
     *
     * [[configuration.average.Micro]]: Calculates the TP, TN, FP and FN for the matrix globally and then applies the
     * F1 Score formula.
     *
     * [[configuration.average.Macro]]: Calculates and sums the miss classification rate for each individual label and divides for
     * the number of labels.
     *
     * [[configuration.average.Weighted]]: Defines if the F1 Score calculations should be weighted. This means the labels
     * with more predictions will weight more in the final value comparing with labels with less predictions.
     *
     * @return The F1 Score value.
     */
    f1Score(configuration?: {
        label?: string,
        average?: AverageMethod
    }): number {
        this.validate();
        if (configuration?.label && configuration?.label.length > 0) {
            return this.labelF1Score(configuration.label);
        }
        return this.matrixF1Score(configuration?.average);
    }

    /**
     * Gives the F1 Score value for all confusion matrix,
     * taking in account a given average method of calculation.
     *
     * F1 Score is the harmonic mean of precision and recall.
     *
     * @param average Defines which type of average should be used. This average will only be taken in account.
     * on matrix calculations (when label = null || undefined).
     *
     * [[average.Micro]]: Calculates the TP, TN, FP and FN for the matrix globally and then applies the
     * F1 Score formula.
     *
     * [[average.Macro]]: Calculates and sums the F1 Score for each individual label and divides for
     * the number of labels.
     *
     * [[average.Weighted]]: Defines if the F1 Score calculations should be weighted. This means the labels
     * with more predictions will weight more in the final F1 Score value comparing with labels with less.
     * predictions.
     *
     * @return The F1 Score value.
     */
    matrixF1Score(average = AverageMethod.Weighted): number {
        this.validate();
        switch (average) {
            case AverageMethod.Micro: return this.microF1Score();
            case AverageMethod.Macro: return this.macroF1Score();
            case AverageMethod.Weighted: return this.weightedF1Score();
        }
    }

    /**
     * Gives the F1 Score value for a given matrix label.
     *
     * F1 Score is the harmonic mean of precision and recall.
     *
     * Formula:
     *
     * f1Score = TP / (TN + FN)
     * 
     * @param label The label used to get theF 1 Score value.
     * @return F1 Score value for a given label.
     */
    labelF1Score(label: string): number {
        this.validate();
        const precision = this.precision({ label });
        const recall = this.recall({ label });
        const result = 2 * ((precision * recall) / (precision + recall));
        return result || 0;
    }

    /**
    * Gives the F1 Score value for all confusion matrix, taking in account the micro average method.
    *
    * F1 Score is the harmonic mean of precision and recall.
    * 
    * The micro average method calculates and sums the F1 Score for each individual label and divides for
    * the number of labels.
    *
    * @return The micro F1 Score value.
    */
    microF1Score(): number {
        const precision = this.microPrecision();
        const recall = this.microRecall()
        return this.applyF1ScoreFormula(precision, recall);
    }

    /**
    * Gives the F1 Score value for all confusion matrix, taking in account the macro average method.
    *
    * F1 Score is the harmonic mean of precision and recall.
    *
    * The macro average method calculates and sums the F1 Score for each individual label and divides for
    * the number of labels.
    *
    * @return The macro F1 Score value.
    */
    macroF1Score(): number {
        let sum = 0;
        this._labels.forEach((label) => sum += this.labelF1Score(label));
        const result = sum / this._labels.length;
        return result || 0;
    }

    /**
    * Gives the F1 Score value for all confusion matrix, taking in account the average weighted method.
    *
    * F1 Score is the harmonic mean of precision and recall.
    *
    * The weighted average method gives the labels with more predictions more importance (weight)
    * in the final F1 Score value comparing with labels with less predictions.
    *
    * @return The weighted F1 Score value.
    */
    weightedF1Score(): number {
        const sumLabels = this.getLabelsPredictionsSum();
        const numberOfPredictions = this.getNumberOfPredictions();

        let sum = 0;
        this._labels.forEach((label, index) => sum += (this.labelF1Score(label) * sumLabels[index]));
        const result = sum / numberOfPredictions;
        return result || 0;
    }

    /**
     * Get all matrix classes, containing information about true positives, true negatives, 
     * false positives and false negatives, as well as the label associated with it.
     * 
     * @return An array of matrix classes containing information about true positives, true negatives,
     * false positives and false negatives, as well as the label associated with it.
     *
     * @note Consult [wikipedia](https://en.wikipedia.org/wiki/Confusion_matrix) for more
     * information regarding terminology, formulas and other theoretical concepts.
     */
    getAllMatrixClasses(): Array<{ label: string, confusionMatrixClasses: ConfusionMatrixClasses }> {
        this.validate();
        const all = new Array<{ label: string, confusionMatrixClasses: ConfusionMatrixClasses }>();
        this._labels.forEach((label) => all.push({
            label: label,
            confusionMatrixClasses: this.getConfusionMatrixClasses(label)
        }));
        return all;
    }

    /**
     * Gets the sum of all confusion matrix predictions, defined by classes.
     * @return Sum of all predictions, defined by classes.
     */
    getSumConfusionMatrixClasses(): ConfusionMatrixClasses {
        const classesSum: ConfusionMatrixClasses = {
            truePositive: 0,
            trueNegative: 0,
            falsePositive: 0,
            falseNegative: 0
        }
        const classes = this.getAllMatrixClasses();
        classes.forEach((value) => {
            classesSum.truePositive += value.confusionMatrixClasses.truePositive;
            classesSum.trueNegative += value.confusionMatrixClasses.trueNegative;
            classesSum.falsePositive += value.confusionMatrixClasses.falsePositive;
            classesSum.falseNegative += value.confusionMatrixClasses.falseNegative;
        });
        return classesSum;
    }

    /**
     * For one given label, returns the matrix classes (true positives, true negatives,
     * false positives and false negatives).
     * 
     * @return The matrix classes (true positives, true negatives,
     * false positives and false negatives).
     * 
     * @note Consult [wikipedia](https://en.wikipedia.org/wiki/Confusion_matrix) for more
     * information regarding terminology, formulas and other theoretical concepts.
     */
    getConfusionMatrixClasses(label: string): ConfusionMatrixClasses {
        this.validate();
        if (!label) {
            throw new Error('A valid label should be passed.');
        }
        const position = this._labels.findIndex(element => element === label);
        if (position == -1) {
            throw new Error('The label does not exists in the matrix.');
        }

        const numberOfPredictions = this.getNumberOfPredictions();
        const truePositive = this._matrix[position][position];
        const falsePositive = this._matrix[position].reduce(
            (previous, next) => previous + next) - truePositive;

        let falseNegative = 0;

        for (let i = 0; i < this._matrix.length; i++) {
            falseNegative += this._matrix[i][position];
        }

        falseNegative -= truePositive;
        const trueNegative = numberOfPredictions - truePositive - falsePositive - falseNegative;

        return { truePositive, trueNegative, falsePositive, falseNegative };
    }

    /**
     * Reverts the last normalization occur getting the current confusion matrix.
     * @return The confusion matrix object before the normalization. 
     * If there is not any entry on the history, null will be returned.
     */
    revertNormalization(): ConfusionMatrix | null {
        const cm = this.normalizations.pop();
        if (cm) {
            this.addToHistory()
            this.setConfusionMatrix(cm);
            return cm;
        }
        return null;
    }

    /** 
     * Deep clones and return the current confusion matrix.
     * @return The deep cloned confusion matrix object. 
     * */
    clone(withoutHistory = false): ConfusionMatrix {
        const cloneObj = new ConfusionMatrix(undefined, true);
        cloneObj._labels = this.deepCopy<Array<string>>(this._labels);
        cloneObj._matrix = this.deepCopy<Array<Array<number>>>(this._matrix);
        cloneObj.normalizations = this.deepCopy<Array<ConfusionMatrix>>(this.normalizations);
        if (!withoutHistory) {
            cloneObj.history = this.deepCopy<Array<ConfusionMatrix>>(this.history);
            cloneObj.historyPointer = this.deepCopy<number>(this.historyPointer);
        }
        return cloneObj;
    }

    /**
     * Gets the confusion matrix min and max value.
     * @return Min and max confusion matrix value or null if not exists.
     */
    getMinAndMax(): { min: number, max: number } | null {
        let min = this._matrix[0][0];
        let max = this._matrix[0][0];

        if (!min || !max) {
            return null;
        }
        for (let line of this._matrix) {
            for (let val of line) {
                max = max < val ? val : max;
                min = min > val ? val : min;
            }
        }

        return { min, max };
    }

    /**
     * Reverts all normalizations performed.
     * @return The Confusion Matrix after changes (this).
     */
    revertAllNormalizations(): ConfusionMatrix {
        if (this.normalizations && this.normalizations.length > 0) {
            return this.setConfusionMatrix(this.normalizations[0]);
        }
        return this;
    }

    /**
     * Gets the total of predictions (samples) in a given label or
     * on all confusion matrix.
     * @param label Number of prediction for the given label.
     * If null, undefined or empty, return the number of predictions
     * for all confusion matrix.
     */
    getNumberOfPredictions(label?: string): number {
        const sumLabels = this.getLabelsPredictionsSum();

        if (label && label.length > 0) {
            const index = this._labels.findIndex(value => value === label);
            return sumLabels[index];
        } else {
            const numberOfPredictions = sumLabels.reduce((prev, next) => prev + next);
            return numberOfPredictions;
        }
    }

    /**
     * Returns the sum of predictions for all labels.
     * @return Array with the sum of predictions for all labels.
     * The position of the array corresponds to the label position
     * on the confusion matrix.
     */
    getLabelsPredictionsSum(): Array<number> {
        let sumLabels = new Array<number>(this._labels.length)
            .fill(0, 0, this._labels.length);
        this._matrix.forEach((array) =>
            array.forEach((value, index) => {
                sumLabels[index] += value;
            }));
        return sumLabels;
    }

    /**
     * Validate if the confusion matrix is valid.
     * If not, an error describing the issue will be thrown.
     * 
     * @return The Confusion Matrix after changes (this).
     */
    validate(confusionMatrix: ConfusionMatrix = this): ConfusionMatrix {
        if (confusionMatrix._labels.length !== confusionMatrix._matrix.length) {
            throw new Error('The labels length should be equals to the matrix columns length.');
        }

        for (let i = 0; i < confusionMatrix._labels.length - 1; i++) {
            for (let j = i + 1; j < confusionMatrix._labels.length; j++) {
                if (confusionMatrix._labels[i].toLocaleLowerCase() === confusionMatrix._labels[j].toLowerCase()) {
                    throw new Error(`The label ${confusionMatrix._labels[i]} appears more than once in the labels array.`);
                }
            }
        }

        confusionMatrix._matrix.forEach(array => {
            if (array.length !== confusionMatrix._matrix.length) {
                throw new Error('The confusion matrix does not have the columns/rows length.');
            }
        });
        return confusionMatrix;
    }
    /**
     * Change the rows for the columns and vice-versa.
     * @return The Confusion Matrix after changes (this).
     */
    transpose(): ConfusionMatrix {
        this.addToHistory();
        this._matrix = this._matrix[0].map((col, i) => this._matrix.map(row => row[i]));
        return this;
    }

    /**
     * Whether undo feature is available.
     * @returns Whether undo feature is available
     */
    isUndoAvailable(): boolean {
        return this.historyPointer > -1 && this.history.length > 1;
    }

    /**
     * Reverts the last change occurred in confusion matrix.
     * @returns The confusion matrix after the undo is performed.
     */
    undo(): ConfusionMatrix | undefined {
        if (this.isUndoAvailable()) {
            if (this.lastHistoryEvent === 'redo') {
                this.historyPointer--;
            }

            if (this.historyPointer === this.history.length - 1) {
                this.historyPointer = this.history.length - 2;
            }

            this.setConfusionMatrix(this.history[this.historyPointer], false);
            this.historyPointer--;
            this.lastHistoryEvent = 'undo';
            return this;
        }
        return undefined;
    }

    /**
     * Whether redo feature is available.
     * @returns Whether undo feature is available
     */
    isRedoAvailable(): boolean {
        return this.history.length > 1 &&
            this.historyPointer < this.history.length - 1;
    }

    /**
     * Revers the last action performed by undo feature.
     * @returns The confusion matrix after the undo is performed.
     */
    redo(): ConfusionMatrix | undefined {
        if (this.isRedoAvailable()) {
            if (this.lastHistoryEvent === 'undo') {
                this.historyPointer++;
            }
            this.historyPointer++;
            this.setConfusionMatrix(this.history[this.historyPointer], false);
            this.lastHistoryEvent = 'redo';
            return this;
        }
    }

    /**
     * Removes a given label from the confusion matrix.
     * If the label does not exits, nothing will happen (no error will be thrown).
     * @param label Label name.
     * @param addToHistory Whether the change should be added to history.
     * @returns The confusion matrix after the label removal.
     */
    removeLabel(label: string, addToHistory = true): ConfusionMatrix {
        const index = this._labels.findIndex(l => l === label);
        this.removeLabelUsingPosition(index, addToHistory);

        return this;
    }

    /**
     * Removes a given label from the confusion matrix using index value.
     * If the label does not exits, nothing will happen (no error will be thrown).
     * @param position Label array index position.
     * @param addToHistory Whether the change should be added to history.
     * @returns The confusion matrix after the label removal.
     */
    removeLabelUsingPosition(position: number, addToHistory = true): ConfusionMatrix {
        if (position > -1) {
            this._labels.splice(position, 1);
            this._matrix.splice(position, 1);
            for (let i = 0; i < this._matrix.length; i++) {
                this._matrix[i].splice(position, 1);
            }
            addToHistory && this.addToHistory();
        }

        return this;
    }

    /**
     * Adds new label in confusion matrix.
     * @param label Label name.
     * @param rowValues Rows values.
     * @param columnsValues Columns values.
     * @param index Index position which the label should be insert in the confusion matrix.
     * @param addToHistory Whether the change should be added to history.
     * If null or undefined, will be added at the end of the confusion matrix.
     * @returns The confusion matrix with the new label.
     */
    addLabel(label: string, rowValues: Array<number>, columnsValues: Array<number>,
        index = this._labels.length, addToHistory = true): ConfusionMatrix {

        // Data input validations
        if (rowValues[index] !== columnsValues[index]) {
            throw new Error(`The value form rowValues on position ${index} (value=${rowValues[index]}) should be the same in columnsValues position ${index} (value=${columnsValues[index]}).`);
        }

        if (rowValues.length !== columnsValues.length) {
            throw new Error(`The rows as columns arrays should have the same length.`);
        }

        if (rowValues.length !== this._labels.length + 1) {
            throw new Error(`The rows values length should be ${this._labels.length + 1} instead of ${rowValues.length}.`);
        }

        const cm = this.clone();
        cm._labels.splice(index, 0, label);
        cm._matrix.splice(index, 0, rowValues);

        for (let i = 0; i < cm.matrix.length; i++) {
            if (i !== index) {
                cm._matrix[i].splice(index, 0, columnsValues[i]);
            }

        }
        this.validate(cm);
        this.setConfusionMatrix(cm, addToHistory);

        return this;
    }

    /**
     * Change the position of two labels.
     * @param firstLabelPosition The position of the first label.
     * @param secondLabelPosition The position of the second label.
     * @returns The confusion with the labels changed.
     */
    changeLabelOrder(firstLabelPosition: number, secondLabelPosition: number): ConfusionMatrix {

        if (firstLabelPosition === secondLabelPosition) {
            return this;
        }

        if (this._matrix.length < 2) {
            throw new Error(`It is not possible to change label order on a confusion matrix with columns/rows < 2`);
        }

        if (firstLabelPosition < 0 || firstLabelPosition >= this._matrix.length) {
            throw new Error(`The firstLabelPosition value should be between [0, ${this._matrix.length}[`);
        }

        if (secondLabelPosition < 0 || secondLabelPosition >= this._matrix.length) {
            throw new Error(`The secondLabelPosition value should be between [0, ${this._matrix.length}[`);
        }

        if (firstLabelPosition > secondLabelPosition) {
            const temp = secondLabelPosition;
            secondLabelPosition = firstLabelPosition;
            firstLabelPosition = temp;
        }

        // Change labels
        const temp = this._labels[secondLabelPosition];
        this._labels[secondLabelPosition] = this._labels[firstLabelPosition];
        this._labels[firstLabelPosition] = temp;

        const initialRows = this.getRow(firstLabelPosition);
        const endRows = this.getRow(secondLabelPosition);

        // Change rows
        this._matrix[firstLabelPosition] = endRows;
        this._matrix[secondLabelPosition] = initialRows;

        const initialColumns = this.getColumn(firstLabelPosition);
        const endColumns = this.getColumn(secondLabelPosition);

        // Change columns
        this._matrix.forEach((value, index) => {
            this._matrix[index][firstLabelPosition] = endColumns[index];
            this._matrix[index][secondLabelPosition] = initialColumns[index];
        });

        this.addToHistory();
        return this;
    }

    /**
     * Converts the confusion matrix to a given data type.
     * @param type Data type which confusion matrix will be converted into.
     * @returns 
     */
    convertTo(type: SupportedDataTypes): string {
        switch (type) {
            case SupportedDataTypes.JSON:
                return this.convertToJson();
        }
    }

    /**
     * Convert the current confusion matrix to a valid json.
     * @returns A valid json
     */
    convertToJson(): string {
        const cmJson = new Object(
            {
                softwareVersion: PackageData.version,
                labels: this.labels,
                matrix: this.matrix,
                normalizations: this.normalizations
            }
        );

        return JSON.stringify(cmJson);
    }

    /**
     * Imports a confusion matrix from a set define formats.
     * @param confusionMatrix The string value representing the confusion matrix.
     * @param type The confusion matrix data type format
     * @returns This confusion matrix containing the data.
     */
    import(confusionMatrix: string, type: SupportedDataTypes): ConfusionMatrix {
        switch (type) {
            case SupportedDataTypes.JSON:
                this.importAsJson(confusionMatrix);
                break;
        }
        return this;
    }

    /**
     * Imports the values from a json
     * @param json Json object.
     * @returns This confusion matrix containing the json data.
     */
    importAsJson(json: string): ConfusionMatrix {
        try {
            const jsonCm = JSON.parse(json);
            const cm = new ConfusionMatrix();
            cm._labels = jsonCm.labels;
            cm._matrix = jsonCm.matrix;
            cm.normalizations = jsonCm.normalizations;
            cm.validate();
            this.reset();
            this._labels = cm._labels;
            this._matrix = cm._matrix;
            this.normalizations = cm.normalizations;
            this.addToHistory();
        } catch (ex: any) {
            throw new Error(`It was not possible to import the json.\n Details:\n${ex}`);
        }
        return this;
    }

    /**  
     * Resets (cleans) all all values from the confusion matrix. 
     * @returns This confusion matrix "reseted".
     */
    reset(): ConfusionMatrix {
        this._labels = [];
        this._matrix = [];
        this.normalizations = [];
        this.history = [];
        this.historyPointer = -1;
        this.lastHistoryEvent = null;
        return this;
    }

    private getRow(index: number): Array<number> {
        return this.deepCopy(this._matrix[index]);
    }

    /**
     * Gets a column from the matrix.
     * @param index The column index.
     * @returns The column
     */
    private getColumn(index: number): Array<number> {
        const column = new Array<number>();
        this._matrix.forEach((value, i) => column.push(value[index]));
        return column;
    }

    /**
     * Deep copies a given object.
     * @param object The object to be deep cloned.
     * @return The deep cloned object.
     */
    private deepCopy<T>(object: T): T {
        return JSON.parse(JSON.stringify(object));
    }

    /**
     * Applies the F1 Score formula
     * @param precision The precision value.
     * @param recall The recall value.
     */
    private applyF1ScoreFormula(precision: number, recall: number): number {
        return 2 * ((precision * recall) / (precision + recall)) || 0;
    }

    /**
     * Saves the current matrix state in history.
     */
    private addToHistory() {

        if (this.historyPointer === -1) {
            this.historyPointer = 0;
        } else {
            this.historyPointer++;
        }
        this.history.push(this.clone(true));
    }

}

/**
 * Define the average method to be use in some confusion matrix calculation.
 */
export enum AverageMethod {
    /** 
     * Calculates the TP, TN, FP and FN for the matrix globally and then applies
     * the correspond formula.
     */
    Micro,
    /**
     * Calculates and sums the value for each individual label and divides for
     * the number of labels.
    */
    Macro,
    /**
    * Defines if the value calculation should be weighted. This means the labels
    * with more predictions will weight more in the final value 
    * comparing with labels with less predictions.
    */
    Weighted
}

/**
 * Confusion matrix classes definition.
 */
export interface ConfusionMatrixClasses {
    /** Number of predictions correctly predicted as positives */
    truePositive: number;
    /** Number of predictions correctly predicted as negatives */
    trueNegative: number;
    /** Number of predictions incorrectly predicted as positives */
    falsePositive: number;
    /** Number of predictions incorrectly predicted as negatives */
    falseNegative: number;
}

/** Number of fraction digits a number can have. */
export type FractionDigits = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
    13 | 14 | 15 | 16 | 17 | 18 | 19 | 20

export enum SupportedDataTypes {
    JSON
}