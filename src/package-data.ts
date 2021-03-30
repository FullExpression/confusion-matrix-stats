/**
 * Handles package.json information.
 */
export class PackageData {
    /** Gets the software version */
    static get version(): number {
        try {
            return require('./package.json').version;
        } catch (ex) {
            return require('../package.json').version;
        }
    }
}