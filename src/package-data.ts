/**
 * Handles package.json information.
 */
export class PackageData {

    /** 
     * Gets the software version 
     * @return the software version.
     * */
    static get version(): string {
        try {
            return require('./package.json').version;
        } catch (ex) {
            try {
                return require('../package.json').version;
            } catch (ex) {
                return '0.0.0'
            }

        }
    }
}