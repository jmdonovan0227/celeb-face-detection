module.exports = {
    testEnvironment: 'jest-fixed-jsdom',
    // we need this line in order to import css files as jest does not handle them by default
    moduleNameMapper: {
        "^.+\\.(css|less|scss)$": "identity-obj-proxy",
        "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/src/__mocks__/fileMock.js",
    },

    testEnvironmentOptions: {
        customExportConditions: ['']
    },

    setupFiles: ['./jest-setup.js']
}