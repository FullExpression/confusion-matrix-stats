const info = require('../package.json')

/**
 * Handles package.json information.
 */
export class PackageData {
    /** 
     * Gets the software version 
     * @return the software version.
     * */
    static get version() {
        return info.version;
    }
}